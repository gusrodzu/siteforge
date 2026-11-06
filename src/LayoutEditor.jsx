import React,{useEffect,useRef,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {Puck} from '@puckeditor/core';
import {config} from './blocks.jsx';
import PatternLibrary from './PatternLibrary.jsx';
export default function LayoutEditor({api}){
 const {siteId,kind}=useParams();const [layout,setLayout]=useState(null),[revision,setRevision]=useState(0),[patterns,setPatterns]=useState(false),[status,setStatus]=useState('');
 const draft=useRef({root:{},content:[]});
 useEffect(()=>{api(`/sites/${siteId}/layouts/${kind}`).then(data=>{setLayout(data);draft.current=data.draft}).catch(e=>setStatus('Error: '+e.message))},[api,siteId,kind]);
 async function save(data,publish){setStatus(publish?'Publicando...':'Guardando...');try{await api(`/sites/${siteId}/layouts/${kind}`,{method:'PUT',body:JSON.stringify({data,publish})});draft.current=data;setStatus(publish?'Diseño global publicado ✓':'Borrador guardado ✓')}catch(e){setStatus('Error: '+e.message)}}
 if(!layout)return <p className="pad">{status||'Cargando diseño global...'}</p>;
 return <div className="editor-shell"><div className="editor-toolbar"><Link to={`/sites/${siteId}/settings`}>← Estilos globales</Link><strong>Editor visual · {kind==='header'?'Encabezado':'Pie de página'}</strong><span className="sf-editor-actions"><button className="toolbar-button" onClick={()=>setPatterns(true)}>▦ Patrones</button><button className="toolbar-button" onClick={()=>save(draft.current,false)}>Guardar borrador</button><span role="status">{status}</span></span></div><div className="sf-editor-tip">Este diseño se compartirá con todas las páginas del sitio al publicarlo. Los cambios en borrador no se muestran públicamente.</div><Puck key={`${siteId}-${kind}-${revision}`} config={config} data={draft.current} viewports={[{width:390,label:'Móvil'},{width:768,label:'Tablet'},{width:1280,label:'Escritorio'}]} onChange={data=>{draft.current=data;setStatus('Cambios sin guardar')}} onPublish={data=>save(data,true)}/>{patterns&&<PatternLibrary siteId={siteId} api={api} data={draft.current} onInsert={next=>{draft.current=next;setRevision(n=>n+1);setPatterns(false)}} onClose={()=>setPatterns(false)}/>}</div>;
}