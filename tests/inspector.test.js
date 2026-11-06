import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const layout=readFileSync(new URL('../src/layoutBlocks.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
test('visual inspector options and defaults are persisted on every layout',()=>{
  for (const key of ['radius','shadow','border','visibility']) {
    assert.match(layout,new RegExp(`const ${key} = choice`));
    assert.match(layout,new RegExp(`sf-layout-${key === 'visibility' ? 'visible' : key}-`));
  }
});
test('tablet grid overrides and mobile visibility have CSS',()=>{
  assert.match(layout,/tabletColumns/);
  assert.match(css,/sf-layout-tablet-one/);
  assert.match(css,/sf-layout-visible-mobile/);
  assert.match(css,/@media\(max-width:650px\)/);
});
