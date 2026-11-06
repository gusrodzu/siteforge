import React from 'react';

// Native Puck slots are persisted as child component data, not arbitrary HTML.
// All layout choices are allowlisted CSS classes (no user-provided CSS/JS).
const choice = (options) => ({type: 'select', options: options.map(([label,value])=>({label,value}))});
const gap = choice([['Sin separación','none'],['Pequeño','small'],['Medio','medium'],['Grande','large']]);
const align = choice([['Inicio','start'],['Centro','center'],['Final','end'],['Estirar','stretch']]);
const width = choice([['Estrecho · 720 px','narrow'],['Normal · 1120 px','normal'],['Ancho · 1440 px','wide'],['Fluido · 100%','full']]);
const pad = choice([['Sin padding','none'],['Pequeño','small'],['Medio','medium'],['Grande','large']]);
const background = choice([['Transparente','transparent'],['Blanco','white'],['Suave','soft'],['Oscuro','dark'],['Color primario','primary']]);
const stack = choice([['Apilar siempre','stack'],['Dos columnas en tablet','tablet-two']]);
const slot = {type:'slot'};
// Safe inspector choices, persisted as Puck props. No arbitrary CSS injection.
const radius = choice([['Sin bordes redondeados','none'],['Pequeño','small'],['Medio','medium'],['Grande','large'],['Píldora','pill']]);
const shadow = choice([['Sin sombra','none'],['Suave','soft'],['Media','medium'],['Pronunciada','strong']]);
const border = choice([['Sin borde','none'],['Sutil','subtle'],['Marcado','strong']]);
const visibility = choice([['Todos los dispositivos','all'],['Solo escritorio y tablet','desktop-tablet'],['Solo escritorio','desktop'],['Solo móvil','mobile'],['Ocultar en tablet','no-tablet']]);
const tabletColumns = choice([['Adaptación automática','auto'],['Una columna','one'],['Dos columnas','two']]);
const cls = (...parts) => parts.filter(Boolean).join(' ');
const zone = (Content, name) => <Content className={cls('sf-layout-zone',`sf-layout-zone-${name}`)} minEmptyHeight={80}/>;
const columnSlots = (names, props) => names.map(name => <div className="sf-layout-cell" key={name}>{zone(props[name], name)}</div>);

const commonFields = {gap,align,padding:pad,background,radius,shadow,border,visibility};
const commonDefaults = {gap:'medium',align:'stretch',padding:'medium',background:'transparent',radius:'none',shadow:'none',border:'none',visibility:'all'};
const base = (type, p, extra='') => cls('sf-layout',`sf-layout-${type}`,`sf-layout-gap-${p.gap}`,`sf-layout-align-${p.align}`,`sf-layout-pad-${p.padding}`,`sf-layout-bg-${p.background}`,`sf-layout-radius-${p.radius||'none'}`,`sf-layout-shadow-${p.shadow||'none'}`,`sf-layout-border-${p.border||'none'}`,`sf-layout-visible-${p.visibility||'all'}`,extra);

export const layoutCategories = {
  composition: {
    title:'00 · Contenedores y columnas',
    defaultExpanded:true,
    components:['LayoutContainer','LayoutRow','LayoutColumns2','LayoutColumns3','LayoutColumns4','LayoutGrid','LayoutStack']
  }
};

export const layoutComponents = {
  LayoutContainer: {
    label:'Contenedor · anidable',
    fields:{maxWidth:width,...commonFields,content:slot},
    defaultProps:{...commonDefaults,maxWidth:'normal',content:[]},
    render:({content:Content,maxWidth,...props})=><section className={base('container',props,`sf-layout-width-${maxWidth}`)}>{zone(Content,'content')}</section>
  },
  LayoutRow: {
    label:'Fila flexible · horizontal',
    fields:{...commonFields,wrap:choice([['Permitir varias filas','wrap'],['Mantener una fila','nowrap']]),content:slot},
    defaultProps:{...commonDefaults,wrap:'wrap',content:[]},
    render:({content:Content,wrap,...props})=><div className={base('row',props,`sf-layout-${wrap}`)}>{zone(Content,'content')}</div>
  },
  LayoutColumns2: {
    label:'Columnas · 2',
    fields:{...commonFields,tabletColumns,ratio:choice([['50 / 50','equal'],['66 / 33','left'],['33 / 66','right'],['75 / 25','left-wide'],['25 / 75','right-wide']]),mobileOrder:choice([['Primera y segunda','normal'],['Segunda y primera','reverse']]),left:slot,right:slot},
    defaultProps:{...commonDefaults,ratio:'equal',tabletColumns:'auto',mobileOrder:'normal',left:[],right:[]},
    render:({ratio,mobileOrder,tabletColumns,...props})=><div className={base('columns',props,`sf-layout-tablet-${tabletColumns} sf-layout-cols-2 sf-layout-ratio-${ratio} sf-layout-mobile-${mobileOrder}`)}>{columnSlots(['left','right'],props)}</div>
  },
  LayoutColumns3: {
    label:'Columnas · 3',
    fields:{...commonFields,tabletColumns,ratio:choice([['Iguales','equal'],['Centro amplio','center-wide'],['Primera amplia','first-wide']]),mobileOrder:choice([['Orden original','normal'],['Invertir orden','reverse']]),first:slot,second:slot,third:slot},
    defaultProps:{...commonDefaults,ratio:'equal',tabletColumns:'auto',mobileOrder:'normal',first:[],second:[],third:[]},
    render:({ratio,mobileOrder,tabletColumns,...props})=><div className={base('columns',props,`sf-layout-tablet-${tabletColumns} sf-layout-cols-3 sf-layout-ratio-${ratio} sf-layout-mobile-${mobileOrder}`)}>{columnSlots(['first','second','third'],props)}</div>
  },
  LayoutColumns4: {
    label:'Columnas · 4',
    fields:{...commonFields,tabletColumns,mobileOrder:choice([['Orden original','normal'],['Invertir orden','reverse']]),first:slot,second:slot,third:slot,fourth:slot},
    defaultProps:{...commonDefaults,mobileOrder:'normal',first:[],second:[],third:[],fourth:[]},
    render:({mobileOrder,tabletColumns,...props})=><div className={base('columns',props,`sf-layout-tablet-${tabletColumns} sf-layout-cols-4 sf-layout-mobile-${mobileOrder}`)}>{columnSlots(['first','second','third','fourth'],props)}</div>
  },
  LayoutGrid: {
    label:'Cuadrícula de módulos',
    fields:{...commonFields,tabletColumns,columns:choice([['2 columnas','2'],['3 columnas','3'],['4 columnas','4']]),content:slot},
    defaultProps:{...commonDefaults,columns:'3',tabletColumns:'auto',content:[]},
    render:({columns,tabletColumns,content:Content,...props})=><div className={base('grid',props,`sf-layout-tablet-${tabletColumns} sf-layout-grid-${columns}`)}>{zone(Content,'content')}</div>
  },
  LayoutStack: {
    label:'Pila vertical',
    fields:{...commonFields,content:slot},
    defaultProps:{...commonDefaults,content:[]},
    render:({content:Content,...props})=><div className={base('stack',props)}>{zone(Content,'content')}</div>
  }
};
