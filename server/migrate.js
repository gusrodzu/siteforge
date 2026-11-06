import 'dotenv/config';
import fs from 'node:fs/promises';
import {pool} from './db.js';
try {
 for(const migration of ['phase2.sql','phase3.sql','phase4.sql','phase5.sql']){
  await pool.query(await fs.readFile(new URL(`../db/${migration}`,import.meta.url),'utf8'));
  console.log(`${migration} aplicado`);
 }
}catch(error){console.error(error);process.exitCode=1;}finally{await pool.end();}
