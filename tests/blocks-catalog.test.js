import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/extendedBlocks.jsx',import.meta.url),'utf8');
const blockNames=[...source.matchAll(/^  (\w+):basic\(/gm)].map(m=>m[1]);
const categories=[...source.matchAll(/^  ([a-z]+):\{title:.*components:\[([^\]]+)\]/gm)];
const base=readFileSync(new URL('../src/blocks.jsx',import.meta.url),'utf8');
test('65 new unique blocks',()=>{assert.equal(blockNames.length,65);assert.equal(new Set(blockNames).size,65)});
test('every registered extended block has a visible category',()=>{
 const names=categories.flatMap(([,key,list])=>[...list.matchAll(/'([^']+)'/g)].map(m=>m[1]));
 assert.equal(categories.length,8);
 assert.deepEqual([...new Set(names)].sort(),[...blockNames].sort());
});
test('original block definitions stay present and extra blocks are merged',()=>{
 for(const name of ['Hero','TextBlock','ImageBlock','CallToAction','FeatureGrid'])assert.match(base,new RegExp(`\\b${name}:\\{label:`));
 assert.match(base,/\.\.\.extendedComponents/);
});
