import React from 'react';
import {templates} from '../shared/templates.js';
export default function TemplatePicker({selected,onSelect}){
 return <fieldset className="template-fieldset"><legend>Elige una plantilla de inicio</legend><div className="template-gallery">{templates.map(t=><button type="button" key={t.id} className={'template-option '+(selected===t.id?'is-selected':'')} onClick={()=>onSelect(t.id)} aria-pressed={selected===t.id}>
  <div className={'template-art template-'+t.preview} style={{'--preview-accent':t.accent}}><div className="template-window-top"><i/><i/><i/></div><div className="template-preview-header"/><div className="template-preview-hero"><span/><b/><span/><em/></div><div className="template-preview-cards"><i/><i/><i/></div></div><span className="template-category">{t.category}</span><strong>{t.name}</strong><small>{t.description}</small></button>)}</div></fieldset>;
}
