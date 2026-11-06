import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeBrief,buildPageFromBrief} from '../shared/generator.js';
test('Validates brief and builds valid Puck data',()=>{const b=normalizeBrief({businessName:'Café',industry:'Restaurante',goal:'Reservas',description:'Café de barrio',contact:'javascript:alert(1)'});assert.ok(b);const d=buildPageFromBrief(b);assert.equal(d.content.length,4);assert.equal(d.content[0].props.buttonUrl,'#contacto');assert.ok(d.root);});
test('Does not allow blank briefs',()=>assert.equal(normalizeBrief({businessName:'X'}),null));
test('Ignores unknown returned copy fields',()=>{const b=normalizeBrief({businessName:'Norte',industry:'Agencia',goal:'Clientes',description:'Sitios web'});assert.equal(buildPageFromBrief(b,{heroTitle:'Hola'}).content[0].props.title,'Hola')});
