import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {randomUUID, randomBytes, createHash} from 'node:crypto';
import {resolveTxt} from 'node:dns/promises';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import {query,pool} from './db.js';

export const phase3=Router();
const uploadDirectory=path.resolve(process.env.UPLOAD_DIR||'./uploads');
const auth=(req,res,next)=>req.session.userId?next():res.status(401).json({error:'Inicia sesión'});
const role=async(req,orgId,roles=['owner','editor','viewer'])=>{
 const r=await query('SELECT role FROM memberships WHERE organization_id=$1 AND user_id=$2 AND role=ANY($3::text[])',[orgId,req.session.userId,roles]);return r.rows[0]?.role;
};
const siteOrg=async siteId=>{const r=await query('SELECT organization_id FROM sites WHERE id=$1',[siteId]);return r.rows[0]?.organization_id;};
const handle=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
const tokenHash=token=>createHash('sha256').update(token).digest('hex');
const validEmail=e=>typeof e==='string'&&e.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validHost=h=>typeof h==='string'&&h.length<=253&&/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(h)&&!h.endsWith('.local');

phase3.get('/organizations/:orgId/members',auth,handle(async(req,res)=>{
 if(!await role(req,req.params.orgId))return res.status(403).json({error:'Sin acceso'});
 const result=await query('SELECT u.email,m.role,m.user_id FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.organization_id=$1 ORDER BY m.role,u.email',[req.params.orgId]);res.json(result.rows);
}));
phase3.get('/organizations/:orgId/invitations',auth,handle(async(req,res)=>{
 if(!await role(req,req.params.orgId,['owner']))return res.status(403).json({error:'Solo el propietario puede invitar'});
 const result=await query('SELECT id,email,role,expires_at,accepted_at,created_at FROM invitations WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 100',[req.params.orgId]);res.json(result.rows);
}));
phase3.post('/organizations/:orgId/invitations',auth,handle(async(req,res)=>{
 if(!await role(req,req.params.orgId,['owner']))return res.status(403).json({error:'Solo el propietario puede invitar'});
 const email=req.body?.email?.trim().toLowerCase(),r=req.body?.role;
 if(!validEmail(email)||!['editor','viewer'].includes(r))return res.status(400).json({error:'Correo o rol inválido'});
 const existing=await query('SELECT 1 FROM users u JOIN memberships m ON m.user_id=u.id WHERE u.email=$1 AND m.organization_id=$2',[email,req.params.orgId]);
 if(existing.rowCount)return res.status(409).json({error:'Ese usuario ya es miembro'});
 const token=randomBytes(32).toString('base64url'),id=randomUUID();
 await query("INSERT INTO invitations(id,organization_id,email,role,token_hash,invited_by,expires_at) VALUES($1,$2,$3,$4,$5,$6,now()+interval '48 hours')",[id,req.params.orgId,email,r,tokenHash(token),req.session.userId]);
 // Link is revealed once to owner for manual distribution; never stored in plaintext.
 const base=(process.env.PUBLIC_APP_URL||'http://localhost:5173').replace(/\/$/,'');
 res.status(201).json({id,email,role:r,inviteUrl:`${base}/invite/${token}`,expiresInHours:48});
}));
phase3.delete('/organizations/:orgId/members/:userId',auth,handle(async(req,res)=>{
 if(!await role(req,req.params.orgId,['owner']))return res.status(403).json({error:'Solo el propietario puede eliminar miembros'});
 const target=await query('SELECT role FROM memberships WHERE organization_id=$1 AND user_id=$2',[req.params.orgId,req.params.userId]);
 if(!target.rowCount)return res.status(404).json({error:'Miembro no encontrado'});
 if(target.rows[0].role==='owner')return res.status(400).json({error:'No se puede eliminar un propietario'});
 await query('DELETE FROM memberships WHERE organization_id=$1 AND user_id=$2',[req.params.orgId,req.params.userId]);res.json({ok:true});
}));
phase3.get('/invitations/:token',handle(async(req,res)=>{
 const result=await query("SELECT i.email,i.role,o.name AS organization FROM invitations i JOIN organizations o ON o.id=i.organization_id WHERE token_hash=$1 AND accepted_at IS NULL AND expires_at>now()",[tokenHash(req.params.token)]);
 if(!result.rowCount)return res.status(404).json({error:'Invitación inválida o vencida'});res.json(result.rows[0]);
}));
phase3.post('/invitations/:token/accept',handle(async(req,res)=>{
 const password=req.body?.password;
 if(typeof password!=='string'||password.length<12||password.length>128)return res.status(400).json({error:'La contraseña debe tener entre 12 y 128 caracteres'});
 const hash=tokenHash(req.params.token),client=await pool.connect();
 try{
  await client.query('BEGIN');
  const invite=await client.query("SELECT * FROM invitations WHERE token_hash=$1 AND accepted_at IS NULL AND expires_at>now() FOR UPDATE",[hash]);
  if(!invite.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Invitación inválida o vencida'});}
  const i=invite.rows[0];let u=await client.query('SELECT id,password_hash FROM users WHERE email=$1',[i.email]);
  let userId;
  if(u.rowCount){
   if(!await bcrypt.compare(password,u.rows[0].password_hash)){await client.query('ROLLBACK');return res.status(401).json({error:'Contraseña incorrecta para la cuenta existente'});}
   userId=u.rows[0].id;
  }else{
   userId=randomUUID();await client.query('INSERT INTO users(id,email,password_hash) VALUES($1,$2,$3)',[userId,i.email,await bcrypt.hash(password,12)]);
  }
  await client.query('INSERT INTO memberships(user_id,organization_id,role) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[userId,i.organization_id,i.role]);
  await client.query('UPDATE invitations SET accepted_at=now() WHERE id=$1',[i.id]);
  await client.query('COMMIT');res.json({ok:true});
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:1},fileFilter:(_req,file,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype))});
phase3.get('/sites/:siteId/assets',auth,handle(async(req,res)=>{
 const org=await siteOrg(req.params.siteId);if(!org||!await role(req,org))return res.status(403).json({error:'Sin acceso'});
 const result=await query('SELECT id,original_name,mime,byte_size,created_at FROM assets WHERE site_id=$1 ORDER BY created_at DESC LIMIT 200',[req.params.siteId]);
 res.json(result.rows.map(a=>({...a,url:`/api/assets/${a.id}`})));
}));
phase3.post('/sites/:siteId/assets',auth,upload.single('image'),handle(async(req,res)=>{
 const org=await siteOrg(req.params.siteId);if(!org||!await role(req,org,['owner','editor']))return res.status(403).json({error:'Sin permiso'});
 if(!req.file)return res.status(400).json({error:'Adjunta una imagen JPEG, PNG o WebP menor a 5 MB'});
 let output;
 try{output=await sharp(req.file.buffer,{limitInputPixels:25_000_000}).rotate().resize({width:2200,withoutEnlargement:true}).webp({quality:82}).toBuffer();}
 catch{return res.status(400).json({error:'Imagen inválida'});}
 await mkdir(uploadDirectory,{recursive:true});const id=randomUUID(),name=`${id}.webp`;
 await writeFile(path.join(uploadDirectory,name),output,{flag:'wx'});
 await query('INSERT INTO assets(id,organization_id,site_id,uploaded_by,original_name,storage_name,mime,byte_size) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,org,req.params.siteId,req.session.userId,req.file.originalname.slice(0,180),name,'image/webp',output.length]);
 res.status(201).json({id,url:`/api/assets/${id}`,mime:'image/webp',byte_size:output.length});
}));
phase3.get('/assets/:assetId',handle(async(req,res)=>{
 const r=await query('SELECT storage_name,mime FROM assets WHERE id=$1',[req.params.assetId]);
 if(!r.rowCount)return res.status(404).end();
 try{const file=await readFile(path.join(uploadDirectory,r.rows[0].storage_name));res.set('Cache-Control','public, max-age=3600').type(r.rows[0].mime).send(file);}catch{return res.status(404).end();}
}));
phase3.get('/sites/:siteId/domains',auth,handle(async(req,res)=>{
 const org=await siteOrg(req.params.siteId);if(!org||!await role(req,org))return res.status(403).json({error:'Sin acceso'});
 const r=await query('SELECT id,hostname,verification_token,verified_at FROM site_domains WHERE site_id=$1 ORDER BY created_at DESC',[req.params.siteId]);res.json(r.rows);
}));
phase3.post('/sites/:siteId/domains',auth,handle(async(req,res)=>{
 const org=await siteOrg(req.params.siteId);if(!org||!await role(req,org,['owner']))return res.status(403).json({error:'Solo propietario'});
 const host=req.body?.hostname?.trim().toLowerCase();if(!validHost(host))return res.status(400).json({error:'Dominio inválido'});
 const token=`siteforge-verify=${randomBytes(18).toString('hex')}`;
 const r=await query('INSERT INTO site_domains(id,site_id,hostname,verification_token) VALUES($1,$2,$3,$4) RETURNING id,hostname,verification_token,verified_at',[randomUUID(),req.params.siteId,host,token]);res.status(201).json(r.rows[0]);
}));
phase3.post('/sites/:siteId/domains/:domainId/verify',auth,handle(async(req,res)=>{
 const org=await siteOrg(req.params.siteId);if(!org||!await role(req,org,['owner']))return res.status(403).json({error:'Solo propietario'});
 const r=await query('SELECT hostname,verification_token FROM site_domains WHERE id=$1 AND site_id=$2',[req.params.domainId,req.params.siteId]);
 if(!r.rowCount)return res.status(404).json({error:'Dominio no encontrado'});
 let records=[];try{records=await resolveTxt(`_siteforge.${r.rows[0].hostname}`);}catch{}
 if(!records.some(parts=>parts.join('')===r.rows[0].verification_token))return res.status(409).json({error:'Registro TXT no encontrado. Revisa DNS y propagación'});
 await query('UPDATE site_domains SET verified_at=now() WHERE id=$1',[req.params.domainId]);res.json({ok:true,verified:true});
}));
phase3.get('/sites/:siteId/publications',auth,handle(async(req,res)=>{
 const org=await siteOrg(req.params.siteId);if(!org||!await role(req,org))return res.status(403).json({error:'Sin acceso'});
 const r=await query('SELECT e.id,e.created_at,p.title,u.email AS published_by FROM publication_events e JOIN pages p ON p.id=e.page_id JOIN users u ON u.id=e.published_by WHERE p.site_id=$1 ORDER BY e.created_at DESC LIMIT 30',[req.params.siteId]);res.json(r.rows);
}));
