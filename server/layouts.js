import {Router} from 'express';
import {query} from './db.js';
import {hydrateSitePatterns} from './patterns.js';
export const layoutsRouter=Router();
const auth=(req,res,next)=>req.session?.userId?next():res.status(401).json({error:'Inicia sesión'});
const isKind=kind=>['header','footer'].includes(kind);
async function permission(userId,siteId,write=false){
 const r=await query(`SELECT m.role FROM sites s JOIN memberships m ON m.organization_id=s.organization_id AND m.user_id=$1 WHERE s.id=$2 ${write?"AND m.role IN ('owner','editor')":''}`,[userId,siteId]);return r.rowCount>0;
}
layoutsRouter.get('/sites/:siteId/layouts/:kind',auth,async(req,res,next)=>{try{
 const {siteId,kind}=req.params;if(!isKind(kind))return res.status(400).json({error:'Tipo inválido'});
 if(!await permission(req.session.userId,siteId))return res.status(404).json({error:'Sitio no encontrado'});
 const r=await query('SELECT draft,published FROM site_layouts WHERE site_id=$1 AND kind=$2',[siteId,kind]);
 const empty={root:{},content:[]};res.json({kind,draft:await hydrateSitePatterns(siteId,r.rows[0]?.draft||empty),published:r.rows[0]?.published||null});
}catch(e){next(e)}});
layoutsRouter.put('/sites/:siteId/layouts/:kind',auth,async(req,res,next)=>{try{
 const {siteId,kind}=req.params;if(!isKind(kind))return res.status(400).json({error:'Tipo inválido'});
 if(!await permission(req.session.userId,siteId,true))return res.status(403).json({error:'Sin permiso'});
 const {data,publish=false}=req.body||{};
 if(!data||!Array.isArray(data.content)||!data.root||typeof data.root!=='object')return res.status(400).json({error:'Diseño inválido'});
 const json=JSON.stringify(data);if(json.length>800_000)return res.status(413).json({error:'Diseño demasiado grande'});
 await query(`INSERT INTO site_layouts(site_id,kind,draft,published) VALUES($1,$2,$3::jsonb,CASE WHEN $4::boolean THEN $3::jsonb ELSE NULL END)
 ON CONFLICT (site_id,kind) DO UPDATE SET draft=EXCLUDED.draft,published=CASE WHEN $4::boolean THEN EXCLUDED.draft ELSE site_layouts.published END,updated_at=now()`,[siteId,kind,json,Boolean(publish)]);
 res.json({ok:true,published:Boolean(publish)});
}catch(e){next(e)}});
export async function publishedLayouts(siteId){
 const r=await query('SELECT kind,published FROM site_layouts WHERE site_id=$1 AND published IS NOT NULL',[siteId]);
 const result={};for(const row of r.rows)result[row.kind]=await hydrateSitePatterns(siteId,row.published);
 return result;
}