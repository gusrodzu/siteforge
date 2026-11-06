import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { query, pool } from './db.js';
import pgSession from 'connect-pg-simple';
import { phase3 } from './phase3.js';
import { phase4 } from './phase4.js';
import {patternsRouter,hydrateSitePatterns} from './patterns.js';
import {layoutsRouter,publishedLayouts} from './layouts.js';
import {templateData,themePresets,defaultTheme,sanitizeTheme,templates} from '../shared/templates.js';
const app=express();
const origin=process.env.WEB_ORIGIN || 'http://localhost:5173';
app.set('trust proxy', 1);
app.use(cors({origin,credentials:true}));
app.use(express.json({limit:'2mb'}));
app.use((req,res,next)=>{if(['GET','HEAD','OPTIONS'].includes(req.method))return next();const requestOrigin=req.get('origin');if(requestOrigin && requestOrigin!==origin)return res.status(403).json({error:'Origen no autorizado'});next();});
if(process.env.NODE_ENV==='production'&&(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32||process.env.SESSION_SECRET.includes('replace-with')))throw new Error('SESSION_SECRET seguro obligatorio en producción');
const PgStore=pgSession(session);
app.use(session({store:new PgStore({pool,tableName:'user_sessions',createTableIfMissing:true}),name:'siteforge.sid',secret:process.env.SESSION_SECRET||'dev-only-do-not-deploy',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:1000*60*60*8}}));
const auth=(req,res,next)=>req.session.userId?next():res.status(401).json({error:'Inicia sesión'});
const safeSlug=s=>typeof s==='string'&&/^[a-z0-9-]{1,64}$/.test(s);
const editable=async (userId,orgId)=>{
  const r=await query("SELECT role FROM memberships WHERE user_id=$1 AND organization_id=$2 AND role IN ('owner','editor')",[userId,orgId]);return r.rowCount>0;
};
const member=async(userId,orgId)=>{
  const r=await query('SELECT 1 FROM memberships WHERE user_id=$1 AND organization_id=$2',[userId,orgId]);return r.rowCount>0;
};
app.use('/api',phase3);
app.use('/api',phase4);
app.use('/api',patternsRouter);
app.use('/api',layoutsRouter);
app.get('/api/health',(_req,res)=>res.json({ok:true}));
app.post('/api/login',async(req,res,next)=>{try{
  const {email,password}=req.body||{};
  if(typeof email!=='string'||typeof password!=='string')return res.status(400).json({error:'Credenciales inválidas'});
  const r=await query('SELECT id,email,password_hash FROM users WHERE email=$1',[email.toLowerCase().trim()]);
  if(!r.rowCount||!await bcrypt.compare(password,r.rows[0].password_hash)) return res.status(401).json({error:'Correo o contraseña incorrectos'});
  req.session.regenerate(err=>{if(err)return next(err);req.session.userId=r.rows[0].id;req.session.save(err=>err?next(err):res.json({email:r.rows[0].email}));});
}catch(err){next(err)}});
app.post('/api/logout',auth,(req,res)=>req.session.destroy(()=>res.clearCookie('siteforge.sid').json({ok:true})));
app.get('/api/me',auth,async(req,res,next)=>{try{const r=await query('SELECT email FROM users WHERE id=$1',[req.session.userId]);res.json({email:r.rows[0]?.email});}catch(err){next(err)}});
app.get('/api/organizations',auth,async(req,res,next)=>{try{
 const r=await query('SELECT o.id,o.name,o.slug,m.role FROM organizations o JOIN memberships m ON m.organization_id=o.id WHERE m.user_id=$1 ORDER BY o.name',[req.session.userId]);res.json(r.rows);
}catch(err){next(err)}});
app.get('/api/organizations/:orgId/sites',auth,async(req,res,next)=>{try{
 if(!await member(req.session.userId,req.params.orgId))return res.status(403).json({error:'Sin acceso a esta empresa'});
 const r=await query('SELECT id,title,slug,theme,created_at FROM sites WHERE organization_id=$1 ORDER BY created_at DESC',[req.params.orgId]);res.json(r.rows);
}catch(err){next(err)}});
app.post('/api/organizations/:orgId/sites',auth,async(req,res,next)=>{try{
 if(!await editable(req.session.userId,req.params.orgId))return res.status(403).json({error:'Sin permiso para editar'});
 const {title,slug,templateId='blank'}=req.body||{};if(typeof title!=='string'||!title.trim()||title.length>120||!safeSlug(slug))return res.status(400).json({error:'Nombre o slug inválido'});
 if(!templates.some(t=>t.id===templateId))return res.status(400).json({error:'Plantilla inválida'});
 const id=randomUUID();const theme=sanitizeTheme({...defaultTheme,...(themePresets[templateId]||{}),headerTitle:title.trim()});
 await query('INSERT INTO sites(id,organization_id,title,slug,theme) VALUES($1,$2,$3,$4,$5::jsonb)',[id,req.params.orgId,title.trim(),slug,JSON.stringify(theme)]);
 await query('INSERT INTO pages(id,site_id,slug,title,draft) VALUES($1,$2,$3,$4,$5::jsonb)',[randomUUID(),id,'inicio','Inicio',JSON.stringify(templateData(templateId))]);res.status(201).json({id,title,slug,templateId});
}catch(err){next(err)}});
app.get('/api/sites/:siteId/settings',auth,async(req,res,next)=>{try{
 const r=await query('SELECT s.id,s.title,s.slug,s.theme,m.role FROM sites s JOIN memberships m ON m.organization_id=s.organization_id AND m.user_id=$2 WHERE s.id=$1',[req.params.siteId,req.session.userId]);
 if(!r.rowCount)return res.status(404).json({error:'Sitio no encontrado'});res.json({...r.rows[0],theme:sanitizeTheme(r.rows[0].theme)});
}catch(err){next(err)}});
app.put('/api/sites/:siteId/settings',auth,async(req,res,next)=>{try{
 const theme=sanitizeTheme(req.body?.theme);
 const r=await query(`UPDATE sites s SET theme=$1::jsonb FROM memberships m WHERE s.id=$2 AND m.organization_id=s.organization_id AND m.user_id=$3 AND m.role IN ('owner','editor') RETURNING s.id,s.theme`,[JSON.stringify(theme),req.params.siteId,req.session.userId]);
 if(!r.rowCount)return res.status(403).json({error:'Sin permiso'});res.json(r.rows[0]);
}catch(err){next(err)}});
app.get('/api/sites/:siteId/pages',auth,async(req,res,next)=>{try{
 const r=await query('SELECT p.id,p.title,p.slug,p.updated_at,(p.published IS NOT NULL) AS is_published FROM pages p JOIN sites s ON s.id=p.site_id JOIN memberships m ON m.organization_id=s.organization_id WHERE p.site_id=$1 AND m.user_id=$2 ORDER BY p.slug',[req.params.siteId,req.session.userId]);res.json(r.rows);
}catch(err){next(err)}});
app.post('/api/sites/:siteId/pages',auth,async(req,res,next)=>{try{
 const {slug,title}=req.body||{};
 const s=await query("SELECT s.organization_id FROM sites s JOIN memberships m ON m.organization_id=s.organization_id AND m.user_id=$2 AND m.role IN ('owner','editor') WHERE s.id=$1",[req.params.siteId,req.session.userId]);
 if(!s.rowCount)return res.status(403).json({error:'Sin permiso'});
 if(!safeSlug(slug)||typeof title!=='string'||!title.trim()||title.length>120)return res.status(400).json({error:'Página inválida'});
 const id=randomUUID();await query('INSERT INTO pages(id,site_id,slug,title) VALUES($1,$2,$3,$4)',[id,req.params.siteId,slug,title.trim()]);res.status(201).json({id,slug,title});
}catch(err){next(err)}});
app.get('/api/pages/:id',auth,async(req,res,next)=>{try{
 const r=await query('SELECT p.id,p.title,p.slug,p.draft,p.published,m.role,s.id AS site_id,s.slug AS site_slug,o.slug AS organization_slug FROM pages p JOIN sites s ON s.id=p.site_id JOIN organizations o ON o.id=s.organization_id JOIN memberships m ON m.organization_id=o.id AND m.user_id=$2 WHERE p.id=$1',[req.params.id,req.session.userId]);
 if(!r.rowCount)return res.status(404).json({error:'Página no encontrada'});const page=r.rows[0];page.draft=await hydrateSitePatterns(page.site_id,page.draft);res.json(page);
}catch(err){next(err)}});
app.put('/api/pages/:id',auth,async(req,res,next)=>{try{
 const {data,publish=false}=req.body||{};
 if(!data||typeof data!=='object'||Array.isArray(data)||!Array.isArray(data.content)||!data.root)return res.status(400).json({error:'Formato Puck inválido'});
 const payload=JSON.stringify(data);if(payload.length>1_500_000)return res.status(413).json({error:'Página demasiado grande'});
 const r=await query(`UPDATE pages p SET draft=$1::jsonb, published=CASE WHEN $2::boolean THEN $1::jsonb ELSE published END,updated_at=now() FROM sites s JOIN memberships m ON m.organization_id=s.organization_id WHERE p.id=$3 AND p.site_id=s.id AND m.user_id=$4 AND m.role IN ('owner','editor') RETURNING p.id`,[payload,Boolean(publish),req.params.id,req.session.userId]);
 if(!r.rowCount)return res.status(403).json({error:'Sin permiso'});if(publish)await query('INSERT INTO publication_events(id,page_id,published_by) VALUES($1,$2,$3)',[randomUUID(),req.params.id,req.session.userId]);res.json({ok:true,published:Boolean(publish)});
}catch(err){next(err)}});
// Public published pages only: never exposes drafts or other organizations' private content.
app.get('/api/public/:organization/:site/:page',async(req,res,next)=>{try{
 const {organization,site,page}=req.params;
 const r=await query('SELECT p.title,p.published,s.id AS site_id,s.title AS site_title,s.theme FROM pages p JOIN sites s ON s.id=p.site_id JOIN organizations o ON o.id=s.organization_id WHERE o.slug=$1 AND s.slug=$2 AND p.slug=$3 AND p.published IS NOT NULL',[organization,site,page]);
 if(!r.rowCount)return res.status(404).json({error:'No publicada'});const publicPage=r.rows[0];publicPage.published=await hydrateSitePatterns(publicPage.site_id,publicPage.published);publicPage.layouts=await publishedLayouts(publicPage.site_id);res.json(publicPage);
}catch(err){next(err)}});
app.use((err,_req,res,_next)=>{console.error(err);if(err.code==='23505')return res.status(409).json({error:'El identificador ya existe'});res.status(500).json({error:'Error del servidor'});});
app.listen(Number(process.env.API_PORT||4000),()=>console.log(`API en http://localhost:${process.env.API_PORT||4000}`));
