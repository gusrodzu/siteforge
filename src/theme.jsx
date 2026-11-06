import React from 'react';
import {defaultTheme,sanitizeTheme} from '../shared/templates.js';
const fonts={manrope:'Manrope, sans-serif',sans:'DM Sans, sans-serif',serif:'Georgia, serif'};
const radii={small:'6px',medium:'12px',soft:'24px'};
export function themeStyle(theme){const t=sanitizeTheme(theme||defaultTheme);return {'--site-primary':t.primary,'--site-bg':t.background,'--site-surface':t.surface,'--site-text':t.text,'--site-font':fonts[t.font],'--site-radius':radii[t.radius]};}
export function SiteFrame({theme,siteTitle,children,customHeader,customFooter}){
 const t=sanitizeTheme(theme||defaultTheme);const title=t.headerTitle||siteTitle||'Mi sitio';
 return <div className="site-frame" style={themeStyle(t)}>{customHeader ? <div className="sf-global-layout sf-global-layout-header" aria-label="Encabezado del sitio">{customHeader}</div> : <header className="site-global-header"><a href={t.navigation?.[0]?`./${t.navigation[0].url}`:"#inicio"} className="site-brand-name">{title}</a><nav aria-label="Navegación principal">{(t.navigation||[]).map((item,i)=><a key={i} href={`./${item.url}`}>{item.label}</a>)}</nav>{t.headerCta&&<a className="site-header-cta" href={safeHref(t.headerUrl)}>{t.headerCta}</a>}</header>}{children}{customFooter ? <div className="sf-global-layout sf-global-layout-footer" aria-label="Pie de página del sitio">{customFooter}</div> : <footer className="site-global-footer"><strong>{title}</strong><span>© {new Date().getFullYear()} · {t.footerText}</span></footer>}</div>;
}
export function safeHref(value){return typeof value==='string'&&/^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|\/[a-zA-Z0-9/_#?=&.-]*|#[a-zA-Z0-9_-]+)$/.test(value)?value:'#';}
