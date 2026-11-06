// Shared deterministic Puck document builder. Never executes user-provided code or JSX.
const clean=(v,max=250)=>typeof v==='string'?v.trim().slice(0,max):'';
export function normalizeBrief(input){
 const b={businessName:clean(input?.businessName,100),industry:clean(input?.industry,80),goal:clean(input?.goal,140),description:clean(input?.description,700),tone:clean(input?.tone,32)||'profesional',contact:clean(input?.contact,180)};
 return b.businessName&&b.industry&&b.goal&&b.description?b:null;
}
const safe=(obj,key,fallback,max=230)=>clean(obj?.[key],max)||fallback;
const block=(type,id,props)=>({type,props:{id,...props}});
export function buildPageFromBrief(b,copy){
 const name=b.businessName;
 const heading=safe(copy,'heroTitle',`${name}: soluciones para ti`,110);
 const summary=safe(copy,'heroSubtitle',b.description,300);
 const aboutTitle=safe(copy,'aboutTitle',`Conoce ${name}`,110);
 const aboutBody=safe(copy,'aboutBody',`En ${name} nos especializamos en ${b.industry.toLowerCase()}. Nuestro objetivo es ${b.goal.toLowerCase()}.`,400);
 const ctaTitle=safe(copy,'ctaTitle','¿Hablamos de tu proyecto?',110);
 const ctaBody=safe(copy,'ctaBody','Queremos ayudarte a dar el siguiente paso.',260);
 const contact=/^(mailto:|tel:|https:\/\/)/i.test(b.contact)?b.contact:'#contacto';
 return {root:{props:{}},content:[
  block('Hero','generated-hero',{eyebrow:b.industry.toUpperCase(),title:heading,description:summary,buttonText:'Contáctanos',buttonUrl:contact,background:'#25214b'}),
  block('TextBlock','generated-about',{heading:aboutTitle,body:aboutBody}),
  block('FeatureGrid','generated-features',{heading:'Nuestros servicios',oneTitle:safe(copy,'serviceOneTitle','Atención personalizada',80),oneBody:safe(copy,'serviceOneBody','Escuchamos lo que necesitas.',180),twoTitle:safe(copy,'serviceTwoTitle','Soluciones a tu medida',80),twoBody:safe(copy,'serviceTwoBody','Trabajamos de acuerdo con tus objetivos.',180),threeTitle:safe(copy,'serviceThreeTitle','Acompañamiento',80),threeBody:safe(copy,'serviceThreeBody','Estamos contigo en cada etapa.',180)}),
  block('CallToAction','generated-contact',{heading:ctaTitle,body:ctaBody,buttonText:'Pedir información',buttonUrl:contact})
 ]};
}
