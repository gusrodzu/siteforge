import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = file => readFileSync(new URL(file, import.meta.url),'utf8');
const layout=read('../src/layoutBlocks.jsx');
const config=read('../src/blocks.jsx');
const css=read('../src/style.css');
test('seven reusable composition blocks are registered',()=>{
  for(const name of ['LayoutContainer','LayoutRow','LayoutColumns2','LayoutColumns3','LayoutColumns4','LayoutGrid','LayoutStack']){
    assert.match(layout,new RegExp(`\\b${name}:\\s*\\{`));
    assert.match(layout,new RegExp(`'${name}'`));
  }
  assert.match(config,/\.\.\.layoutCategories/);
  assert.match(config,/\.\.\.layoutComponents/);
});
test('all column slots persist their own editable children',()=>{
  for(const field of ['left','right','first','second','third','fourth']) assert.match(layout,new RegExp(`${field}:\\[\\]`));
  assert.match(layout,/type:'slot'/);
  assert.match(layout,/minEmptyHeight=\{80\}/);
});
test('desktop, tablet and mobile layouts have responsive rules',()=>{
  assert.match(css,/\.sf-layout-cols-4\{grid-template-columns:repeat\(4/);
  assert.match(css,/@media\(max-width:950px\)/);
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(css,/\.sf-layout-mobile-reverse/);
});
