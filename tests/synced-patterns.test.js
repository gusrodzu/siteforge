import test from 'node:test';
import assert from 'node:assert/strict';
import {insertSyncedPattern,resolveSyncedPatterns} from '../shared/patterns.js';
const pattern={id:'pattern-1',content:{type:'LayoutContainer',props:{id:'source',content:[{type:'TextBlock',props:{id:'text-1',heading:'Original'}}]}}};
const page={root:{},content:[]};
test('synced insertion maintains reference and generates new IDs',()=>{const r=insertSyncedPattern(page,pattern,()=>String(Math.random()));assert.equal(r.content[0].props.__sfSyncPattern,'pattern-1');assert.notEqual(r.content[0].props.id,'source');});
test('synced content follows the current library pattern',()=>{const r=insertSyncedPattern(page,pattern,()=>String(Math.random()));const changed={...pattern,content:{...pattern.content,props:{...pattern.content.props,content:[{type:'TextBlock',props:{id:'updated',heading:'Nuevo'}}]}}};const latest=resolveSyncedPatterns(r,[changed],()=>String(Math.random()));assert.equal(latest.content[0].props.content[0].props.heading,'Nuevo');assert.equal(latest.content[0].props.id,r.content[0].props.id)});
test('removed pattern retains last saved snapshot',()=>{const r=insertSyncedPattern(page,pattern,()=>String(Math.random()));assert.deepEqual(resolveSyncedPatterns(r,[]),r)});
test('different component type does not overwrite instance',()=>{const r=insertSyncedPattern(page,pattern,()=>String(Math.random()));const latest=resolveSyncedPatterns(r,[{...pattern,content:{type:'Hero',props:{id:'changed'}}}]);assert.equal(latest.content[0].type,'LayoutContainer')});