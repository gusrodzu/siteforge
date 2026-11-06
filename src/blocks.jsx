import React from 'react';
import {Render} from '@puckeditor/core';
import {SiteFrame} from './theme.jsx';
import {extendedCategories,extendedComponents} from './extendedBlocks.jsx';
import {layoutCategories,layoutComponents} from './layoutBlocks.jsx';
const link=(url)=>typeof url==='string'&&(/^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|\/[a-zA-Z0-9/_#?=&.-]*|#[a-zA-Z0-9_-]+)$/.test(url))?url:'#';
export const config={
  categories:{...layoutCategories,content:{title:'00b · Básicos existentes',components:['Hero','TextBlock','ImageBlock','CallToAction','FeatureGrid']},...extendedCategories},
  components:{
    Hero:{label:'Portada',fields:{eyebrow:{type:'text'},title:{type:'text'},description:{type:'textarea'},buttonText:{type:'text'},buttonUrl:{type:'text'},background:{type:'text'}},defaultProps:{eyebrow:'BIENVENIDO',title:'Tu negocio merece una gran web',description:'Presenta tus servicios con una página moderna.',buttonText:'Conoce más',buttonUrl:'#servicios',background:'#14213d'},render:({eyebrow,title,description,buttonText,buttonUrl,background})=><section className="block-hero" style={{background:/^#[\da-fA-F]{3,8}$/.test(background||'')?background:'#14213d'}}><small>{eyebrow}</small><h1>{title}</h1><p>{description}</p>{buttonText&&<a className="site-button" href={link(buttonUrl)}>{buttonText}</a>}</section>},
    TextBlock:{label:'Texto',fields:{heading:{type:'text'},body:{type:'textarea'}},defaultProps:{heading:'Nuestro servicio',body:'Cuenta aquí por qué tu empresa es diferente.'},render:({heading,body})=><section className="site-section"><h2>{heading}</h2><p className="body-copy">{body}</p></section>},
    ImageBlock:{label:'Imagen',fields:{url:{type:'text'},alt:{type:'text'},caption:{type:'text'}},defaultProps:{url:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400',alt:'Espacio de trabajo',caption:''},render:({url,alt,caption})=><figure className="site-section image-block"><img src={url} alt={alt||''} loading="lazy" referrerPolicy="no-referrer"/><figcaption>{caption}</figcaption></figure>},
    CallToAction:{label:'Llamado a la acción',fields:{heading:{type:'text'},body:{type:'textarea'},buttonText:{type:'text'},buttonUrl:{type:'text'}},defaultProps:{heading:'¿Empezamos?',body:'Contacta hoy con nuestro equipo.',buttonText:'Escríbenos',buttonUrl:'mailto:contacto@example.com'},render:({heading,body,buttonText,buttonUrl})=><section className="site-section site-cta"><h2>{heading}</h2><p>{body}</p><a href={link(buttonUrl)} className="site-button">{buttonText}</a></section>},
    FeatureGrid:{label:'Tarjetas de servicios',fields:{heading:{type:'text'},oneTitle:{type:'text'},oneBody:{type:'textarea'},twoTitle:{type:'text'},twoBody:{type:'textarea'},threeTitle:{type:'text'},threeBody:{type:'textarea'}},defaultProps:{heading:'Nuestros servicios',oneTitle:'Diseño',oneBody:'Creamos experiencias.',twoTitle:'Desarrollo',twoBody:'Construimos soluciones.',threeTitle:'Soporte',threeBody:'Te acompañamos.'},render:({heading,oneTitle,oneBody,twoTitle,twoBody,threeTitle,threeBody})=><section className="site-section"><h2>{heading}</h2><div className="feature-grid">{[[oneTitle,oneBody],[twoTitle,twoBody],[threeTitle,threeBody]].map(([t,b],i)=><article key={i}><div className="feature-number">0{i+1}</div><h3>{t}</h3><p>{b}</p></article>)}</div></section>}
  ,...extendedComponents,...layoutComponents}
};
export function SiteRender({data,theme,siteTitle,layouts={}}) {
 const header=layouts?.header?.content?.length ? <Render config={config} data={layouts.header}/> : null;
 const footer=layouts?.footer?.content?.length ? <Render config={config} data={layouts.footer}/> : null;
 return <SiteFrame theme={theme} siteTitle={siteTitle} customHeader={header} customFooter={footer}><main className="rendered-site"><Render config={config} data={data}/></main></SiteFrame>;
}
