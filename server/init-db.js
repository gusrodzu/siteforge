import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
const client = await pool.connect();
try {
  await client.query(await readFile(new URL('../db/schema.sql',import.meta.url),'utf8'));
  const users = [
    ['admin',process.env.SEED_ADMIN_EMAIL,process.env.SEED_ADMIN_PASSWORD],
    ['client',process.env.SEED_CLIENT_EMAIL,process.env.SEED_CLIENT_PASSWORD],
  ];
  for (const [key,email,password] of users) {
    if (!email || !password) throw new Error(`Faltan credenciales SEED de ${key} en .env`);
    const found = await client.query('SELECT id FROM users WHERE email=$1',[email.toLowerCase()]);
    const userId=found.rows[0]?.id ?? randomUUID();
    if (!found.rowCount) await client.query('INSERT INTO users(id,email,password_hash) VALUES($1,$2,$3)',[userId,email.toLowerCase(),await bcrypt.hash(password,12)]);
    const slug=key==='admin'?'agencia-demo':'negocio-demo';
    const orgFound=await client.query('SELECT id FROM organizations WHERE slug=$1',[slug]);
    const orgId=orgFound.rows[0]?.id ?? randomUUID();
    if (!orgFound.rowCount) await client.query('INSERT INTO organizations(id,name,slug) VALUES($1,$2,$3)',[orgId,key==='admin'?'Mi Agencia':'Mi Negocio',slug]);
    await client.query('INSERT INTO memberships(user_id,organization_id,role) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[userId,orgId,'owner']);
    const siteFound=await client.query('SELECT id FROM sites WHERE organization_id=$1 AND slug=$2',[orgId,'principal']);
    const siteId=siteFound.rows[0]?.id ?? randomUUID();
    if (!siteFound.rowCount) await client.query('INSERT INTO sites(id,organization_id,title,slug) VALUES($1,$2,$3,$4)',[siteId,orgId,'Mi primer sitio','principal']);
    await client.query("INSERT INTO pages(id,site_id,slug,title,draft) VALUES($1,$2,'inicio','Inicio',$3) ON CONFLICT DO NOTHING",[randomUUID(),siteId,JSON.stringify({content:[{type:'Hero',props:{id:'hero1',eyebrow:'TU NUEVA WEB',title:'Una página increíble comienza aquí',description:'Personaliza este sitio arrastrando componentes desde el editor.',buttonText:'Contáctanos',buttonUrl:'#contacto',background:'#111827'}},{type:'TextBlock',props:{id:'txt1',heading:'Un sitio hecho a tu medida',body:'Edita textos, colores y componentes. Publica únicamente cuando estés listo.'}}],root:{props:{title:'Mi primer sitio'}}})]);
  }
  console.log('Base de datos inicializada. Dos cuentas de demostración creadas.');
} finally {client.release(); await pool.end();}
