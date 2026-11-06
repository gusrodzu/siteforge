import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {query} from './db.js';

export const patternsRouter=Router();
const authenticated=(req,res,next)=>req.session?.userId?next():res.status(401).json({error:'Inicia sesión'});
const validUUID=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
async function access(userId,siteId,write=false){
 const sql=`SELECT m.role FROM sites s JOIN memberships m ON m.organization_id=s.organization_id AND m.user_id=$1 WHERE s.id=$2 ${write?"AND m.role IN ('owner','editor')":''}`;
 const result=await query(sql,[userId,siteId]);return result.rowCount>0;
}
const validComponent=c=>c&&typeof c==='object'&&!Array.isArray(c)&&typeof c.type==='string'&&/^[a-zA-Z][a-zA-Z0-9]{0,100}$/.test(c.type)&&c.props&&typeof c.props==='object'&&!Array.isArray(c.props);
patternsRouter.get('/sites/:siteId/patterns',authenticated,async(req,res,next)=>{try{
 const {siteId}=req.params;if(!validUUID(siteId)||!await access(req.session.userId,siteId))return res.status(404).json({error:'Sitio no encontrado'});
 const result=await query('SELECT id,name,category,content,created_at FROM site_patterns WHERE site_id=$1 ORDER BY created_at DESC LIMIT 200',[siteId]);res.json(result.rows);
}catch(err){next(err)}});
patternsRouter.post('/sites/:siteId/patterns',authenticated,async(req,res,next)=>{try{
 const {siteId}=req.params;if(!validUUID(siteId)||!await access(req.session.userId,siteId,true))return res.status(403).json({error:'Sin permiso para guardar patrones'});
 const {name,category='personalizados',content}=req.body||{};
 if(typeof name!=='string'||!name.trim()||name.length>120||typeof category!=='string'||category.length>40||!validComponent(content))return res.status(400).json({error:'Patrón inválido'});
 const payload=JSON.stringify(content);if(payload.length>200_000)return res.status(413).json({error:'Patrón demasiado grande'});
 const id=randomUUID();await query('INSERT INTO site_patterns(id,site_id,name,category,content,created_by) VALUES($1,$2,$3,$4,$5::jsonb,$6)',[id,siteId,name.trim(),category,payload,req.session.userId]);res.status(201).json({id,name:name.trim(),category,content});
}catch(err){next(err)}});
patternsRouter.delete('/sites/:siteId/patterns/:patternId',authenticated,async(req,res,next)=>{try{
 const {siteId,patternId}=req.params;if(!validUUID(siteId)||!validUUID(patternId)||!await access(req.session.userId,siteId,true))return res.status(403).json({error:'Sin permiso'});
 const result=await query('DELETE FROM site_patterns WHERE id=$1 AND site_id=$2 RETURNING id',[patternId,siteId]);if(!result.rowCount)return res.status(404).json({error:'Patrón no encontrado'});res.json({ok:true});
}catch(err){next(err)}});
