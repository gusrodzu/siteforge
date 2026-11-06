import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
export default function Plans({api,Shell}){
 const [data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{api('/plans').then(setData).catch(e=>setError(e.message))},[]);
 return <Shell><main className="workspace"><Link className="breadcrumb" to="/app">← Volver al panel</Link><div className="eyebrow">PLANES · PROTOTIPO COMERCIAL</div><h1>Planes SiteForge<span className="accent-dot">.</span></h1><p>Precios de ejemplo en MXN por mes. Esta pantalla no procesa pagos ni activa suscripciones.</p>{error&&<p className="error">{error}</p>}<div className="plans-grid">{data?.plans.map(p=><article className="plan-card" key={p.code}><span className="eyebrow">{p.code.toUpperCase()}</span><h2>{p.name}</h2><strong>${p.price_mxn.toLocaleString('es-MX')} MXN <small>/ mes</small></strong><p>{p.site_limit} sitios · {p.page_limit} páginas · {p.ai_generations_monthly} generaciones/mes</p><button disabled>Disponible próximamente</button></article>)}</div><p className="info-note">No es una pasarela de pago. Falta integración de checkout, webhooks, facturación, límites de uso robustos y control de acceso por plan.</p></main></Shell>
}
