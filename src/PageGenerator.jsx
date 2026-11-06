import React,{useState} from 'react';
import {Link,useParams,useNavigate} from 'react-router-dom';
const defaultBrief={businessName:'',industry:'',goal:'',description:'',tone:'profesional',contact:''};
export default function PageGenerator({api,Shell}){
 const {siteId}=useParams();const nav=useNavigate();const [brief,setBrief]=useState(defaultBrief);
 const [result,setResult]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [title,setTitle]=useState('Página generada'),[slug,setSlug]=useState('pagina-generada');
 function change(k,v){setBrief(old=>({...old,[k]:v}));}
 async function generate(e){e.preventDefault();setBusy(true);setMessage('Generando estructura...');try{
   const r=await api(`/sites/${siteId}/generate`,{method:'POST',body:JSON.stringify(brief)});
   setResult(r);setMessage(r.notice);
 }catch(e){setMessage('Error: '+e.message)}finally{setBusy(false)}}
 async function createPage(){setBusy(true);try{
   const p=await api(`/sites/${siteId}/pages`,{method:'POST',body:JSON.stringify({title,slug})});
   await api(`/pages/${p.id}`,{method:'PUT',body:JSON.stringify({data:result.data,publish:false})});
   nav(`/editor/${p.id}`);
 }catch(e){setMessage('Error al crear página: '+e.message)}finally{setBusy(false)}}
 return <Shell><main className="workspace generator-workspace"><Link className="breadcrumb" to={`/sites/${siteId}`}>← Volver al sitio</Link><div className="eyebrow">SITEFORGE · FASE 4</div><h1>Generador de páginas<span className="accent-dot">.</span></h1><p>Describe tu negocio. SiteForge construye una página editable en Puck. Primero tendrás un borrador; nunca se publicará automáticamente.</p>
 <div className="generator-grid"><form className="settings-panel" onSubmit={generate}><h2>Cuéntanos sobre tu negocio</h2>
 <label>Nombre del negocio<input required maxLength={100} value={brief.businessName} onChange={e=>change('businessName',e.target.value)} placeholder="Ej. Café Norte"/></label>
 <label>Sector<select value={brief.industry} required onChange={e=>change('industry',e.target.value)}><option value="">Seleccionar</option>{['Restaurante','Tienda en línea','Agencia creativa','Servicios profesionales','Salud y bienestar','Educación','Tecnología','Otro'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Objetivo de la página<input required maxLength={140} value={brief.goal} onChange={e=>change('goal',e.target.value)} placeholder="Conseguir reservaciones"/></label>
 <label>Descripción<textarea required rows={5} maxLength={700} value={brief.description} onChange={e=>change('description',e.target.value)} placeholder="¿Qué hacen? ¿A quién atienden? ¿Qué los distingue?"/></label>
 <label>Estilo de comunicación<select value={brief.tone} onChange={e=>change('tone',e.target.value)}><option value="profesional">Profesional</option><option value="cercano">Cercano</option><option value="creativo">Creativo</option></select></label>
 <label>URL de contacto (opcional)<input placeholder="mailto:hola@empresa.com" value={brief.contact} onChange={e=>change('contact',e.target.value)}/></label>
 <button disabled={busy} className="primary">{busy?'Generando…':'✦ Generar página'}</button></form>
 <section className="generator-result"><h2>Vista previa del contenido</h2><p role="status">{message||'Completa los datos para generar bloques editables.'}</p>{result&&<><span className="generator-mode">{result.mode==='ai'?'IA conectada':'Modo guiado local'}</span><div className="generator-copy">{result.data.content.map(item=><article key={item.props.id}><small>{item.type}</small><h3>{item.props.title||item.props.heading}</h3><p>{item.props.description||item.props.body||'Bloque con contenido editable'}</p></article>)}</div><h3>Guardar como borrador</h3><label>Título<input value={title} maxLength={120} onChange={e=>setTitle(e.target.value)}/></label><label>Identificador URL<input value={slug} pattern="[a-z0-9-]+" onChange={e=>setSlug(e.target.value)}/></label><button disabled={busy||!title.trim()||!/^[a-z0-9-]{1,64}$/.test(slug)} className="primary" onClick={createPage}>Crear y abrir en Puck →</button></>}</section></div></main></Shell>
}
