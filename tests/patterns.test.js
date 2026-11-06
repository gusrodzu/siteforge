import test from 'node:test';
import assert from 'node:assert/strict';
import {clonePatternComponent,insertPattern,topLevelComponents} from '../shared/patterns.js';
const component={type:'LayoutColumns2',props:{id:'old-parent',left:[{type:'TextBlock',props:{id:'old-child',heading:'Hola'}}],right:[]}};
let counter=0;const next=()=>`fresh-${++counter}`;
test('clone creates distinct IDs across nested slots without changing original',()=>{
 const result=clonePatternComponent(component,next);assert.equal(result.props.id,'fresh-1');assert.equal(result.props.left[0].props.id,'fresh-2');assert.equal(component.props.id,'old-parent');
});
test('insert adds copy to the end while preserving existing content',()=>{
 const page={root:{props:{title:'Home'}},content:[{type:'TextBlock',props:{id:'existing'}}]};
 const result=insertPattern(page,component,next);assert.equal(result.content.length,2);assert.notEqual(result.content[1].props.id,component.props.id);assert.equal(page.content.length,1);assert.deepEqual(result.root,page.root);
});
test('only root-level components are offered for saving',()=>{
 const page={content:[component],root:{}};assert.equal(topLevelComponents(page).length,1);assert.equal(topLevelComponents({}).length,0);
});
