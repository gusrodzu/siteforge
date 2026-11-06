// Patterns store one Puck component including nested slot arrays.
// Inserting creates fresh IDs for the root and all nested descendants.
export function clonePatternComponent(component, makeId=()=>globalThis.crypto.randomUUID()) {
 if(!component||typeof component!=='object'||typeof component.type!=='string'||!component.props||typeof component.props!=='object')throw new Error('Componente inválido');
 const copy=JSON.parse(JSON.stringify(component));
 const transform=(node)=>{
   if(Array.isArray(node))return node.map(transform);
   if(!node||typeof node!=='object')return node;
   if(typeof node.type==='string'&&node.props&&typeof node.props==='object'){
     node.props.id=makeId();
     for(const [key,value] of Object.entries(node.props))if(Array.isArray(value)||value&&typeof value==='object')node.props[key]=transform(value);
     return node;
   }
   for(const [key,value] of Object.entries(node))if(Array.isArray(value)||value&&typeof value==='object')node[key]=transform(value);
   return node;
 };
 return transform(copy);
}
export function insertPattern(data, component, makeId) {
 const current=data&&Array.isArray(data.content)?data:{root:{},content:[]};
 return {...current,content:[...current.content,clonePatternComponent(component,makeId)]};
}
export function topLevelComponents(data){return Array.isArray(data?.content)?data.content.filter(node=>node?.type&&node?.props):[];}
