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

export function insertSyncedPattern(data,pattern,makeId){
 if(!pattern?.id||!pattern?.content)throw new Error('Patrón sincronizado inválido');
 const result=insertPattern(data,pattern.content,makeId);
 result.content.at(-1).props.__sfSyncPattern=pattern.id;
 return result;
}
export function resolveSyncedPatterns(data,patterns,makeId=()=>globalThis.crypto.randomUUID()){
 if(!data||!Array.isArray(data.content))return data;
 const refs=new Map(patterns.map(p=>[p.id,p.content]));
 const visit=(node,depth=0)=>{
  if(depth>32)return node;
  if(Array.isArray(node))return node.map(n=>visit(n,depth+1));
  if(!node||typeof node!=='object')return node;
  if(node.type&&node.props&&typeof node.props==='object'){
   const ref=node.props.__sfSyncPattern;
   const definition=typeof ref==='string'?refs.get(ref):undefined;
   if(definition&&definition.type===node.type){
    const cloned=clonePatternComponent(definition,makeId);
    cloned.props.id=node.props.id;
    cloned.props.__sfSyncPattern=ref;
    return cloned;
   }
   return {...node,props:Object.fromEntries(Object.entries(node.props).map(([k,v])=>[k,visit(v,depth+1)]))};
  }
  return Object.fromEntries(Object.entries(node).map(([k,v])=>[k,visit(v,depth+1)]));
 };
 return {...data,content:visit(data.content)};
}
