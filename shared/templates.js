// Isomorphic seed templates: usable by the browser preview and by the API.
const block=(type,id,props)=>({type,props:{id, ...props}});
export const templates = [
  {id:'blank',name:'Lienzo en blanco',category:'Personalizado',description:'Empieza desde cero con tus propios bloques.',accent:'#635bff',preview:'blank'},
  {id:'agency',name:'Estudio creativo',category:'Agencia',description:'Portada editorial, servicios y llamado a la acción.',accent:'#635bff',preview:'agency'},
  {id:'restaurant',name:'Mesa & Sabor',category:'Restaurante',description:'Presenta tu propuesta gastronómica con estilo.',accent:'#ba603e',preview:'restaurant'},
  {id:'services',name:'Firma profesional',category:'Servicios',description:'Una web clara y confiable para profesionales.',accent:'#177a68',preview:'services'},
];
export const defaultTheme = {primary:'#635bff',background:'#ffffff',surface:'#f6f5ff',text:'#1c2330',font:'manrope',radius:'medium',headerTitle:'',headerCta:'Contáctanos',headerUrl:'#contacto',footerText:'Todos los derechos reservados.',navigation:[{label:'Inicio',url:'inicio'},{label:'Servicios',url:'servicios'},{label:'Contacto',url:'contacto'}]};
export const themePresets={
  agency:{primary:'#635bff',background:'#ffffff',surface:'#f6f5ff',text:'#1c2330',font:'manrope',radius:'medium'},
  restaurant:{primary:'#ba603e',background:'#fffaf5',surface:'#f8ede2',text:'#30231d',font:'serif',radius:'soft'},
  services:{primary:'#177a68',background:'#ffffff',surface:'#edf7f3',text:'#173c36',font:'manrope',radius:'small'},
  blank:{}
};
export function templateData(id){
  if(id==='agency')return {root:{props:{}},content:[
    block('Hero','agency-hero',{eyebrow:'ESTUDIO CREATIVO',title:'Ideas que se convierten en experiencias.',description:'Diseño, estrategia y tecnología para marcas que quieren destacar.',buttonText:'Conoce lo que hacemos',buttonUrl:'#servicios',background:'#25214b'}),
    block('FeatureGrid','agency-features',{heading:'Lo que hacemos',oneTitle:'Estrategia',oneBody:'Marcas con una dirección clara.',twoTitle:'Diseño',twoBody:'Experiencias memorables.',threeTitle:'Tecnología',threeBody:'Productos digitales que funcionan.'}),
    block('TextBlock','agency-about',{heading:'Creatividad con propósito',body:'Nos apasiona transformar los retos de nuestros clientes en soluciones digitales simples, elegantes y efectivas.'}),
    block('CallToAction','agency-cta',{heading:'Hagamos algo memorable',body:'Cuéntanos sobre tu próximo proyecto.',buttonText:'Escríbenos',buttonUrl:'mailto:hola@ejemplo.com'})]};
  if(id==='restaurant')return {root:{props:{}},content:[
    block('Hero','restaurant-hero',{eyebrow:'COCINA DE AUTOR',title:'Momentos que saben a algo especial.',description:'Ingredientes frescos, platos honestos y una mesa para compartir.',buttonText:'Reserva tu mesa',buttonUrl:'#contacto',background:'#4a2d28'}),
    block('TextBlock','restaurant-story',{heading:'Una historia en cada plato',body:'Nuestra cocina nace del respeto al producto y del placer de reunir a las personas. Te esperamos.'}),
    block('FeatureGrid','restaurant-menu',{heading:'Conoce nuestra cocina',oneTitle:'De temporada',oneBody:'Sabores que cambian con cada estación.',twoTitle:'Nuestra mesa',twoBody:'Un espacio para conversar y disfrutar.',threeTitle:'Selección local',threeBody:'Productos frescos de productores cercanos.'}),
    block('CallToAction','restaurant-contact',{heading:'Tu mesa te espera',body:'Ven a disfrutar una experiencia diferente.',buttonText:'Haz una reserva',buttonUrl:'mailto:reservas@ejemplo.com'})]};
  if(id==='services')return {root:{props:{}},content:[
    block('Hero','services-hero',{eyebrow:'SOLUCIONES PROFESIONALES',title:'La confianza comienza con una buena decisión.',description:'Asesoría y soluciones a la medida para hacer crecer tus proyectos.',buttonText:'Agenda una consulta',buttonUrl:'#contacto',background:'#173c36'}),
    block('FeatureGrid','services-grid',{heading:'Cómo podemos ayudarte',oneTitle:'Diagnóstico',oneBody:'Entendemos tus objetivos y prioridades.',twoTitle:'Estrategia',twoBody:'Diseñamos un plan a tu medida.',threeTitle:'Acompañamiento',threeBody:'Te ayudamos a ejecutar y mejorar.'}),
    block('TextBlock','services-about',{heading:'Experiencia que genera resultados',body:'Nuestro compromiso es brindar atención cercana, claridad y soluciones prácticas en cada etapa.'}),
    block('CallToAction','services-cta',{heading:'Hablemos de tu proyecto',body:'Estamos listos para ayudarte.',buttonText:'Solicitar información',buttonUrl:'mailto:contacto@ejemplo.com'})]};
  return {root:{props:{}},content:[]};
}
export function sanitizeTheme(input={}){
  const theme={...defaultTheme};
  const colors=['primary','background','surface','text'];
  for(const key of colors)if(typeof input[key]==='string'&&/^#[\da-fA-F]{6}$/.test(input[key]))theme[key]=input[key];
  for(const key of ['headerTitle','headerCta','headerUrl','footerText'])if(typeof input[key]==='string')theme[key]=input[key].slice(0,150);
  if(['manrope','sans','serif'].includes(input.font))theme.font=input.font;
  if(['small','medium','soft'].includes(input.radius))theme.radius=input.radius;
  if(Array.isArray(input.navigation)){theme.navigation=input.navigation.slice(0,8).filter(x=>x&&typeof x.label==='string'&&typeof x.url==='string'&&/^[a-z0-9-]{1,64}$/.test(x.url)).map(x=>({label:x.label.trim().slice(0,35),url:x.url})).filter(x=>x.label);}
  return theme;
}
