const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('changing terrain reuses atlas sources and sprite slots, and releases retired assets', async () => {
  const sources=[], textures=[], sprites=[];
  class Container {
    constructor() { this.children=[]; }
    addChild(...items) { for(const item of items) { if(item.parent) item.parent.children.splice(item.parent.children.indexOf(item),1); this.children.push(item);item.parent=this; } }
    removeChildren() { const old=this.children; this.children=[];for(const item of old)item.parent=null;return old; }
  }
  class ImageSource { constructor(o) {Object.assign(this,o);sources.push(this);} destroy(){this.destroyed=true;} }
  class Texture { constructor(o) {Object.assign(this,o);textures.push(this);} destroy(){this.destroyed=true;} }
  class Sprite { constructor(texture){this.texture=texture;sprites.push(this);} destroy(){this.destroyed=true;if(this.parent){this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null;}} }
  const P={DOMAdapter:{set(){}},extensions:{remove(){}},Container,ImageSource,Texture,Sprite,Rectangle:class{},WebGLRenderer:class{async init(){}}};
  const context=vm.createContext({self:{PIXI:P},onmessage:null,importScripts(){}});
  vm.runInContext(fs.readFileSync(require.resolve('../src/js/castle-gpu-worker'),'utf8'),context);
  vm.runInContext('assets.set(1,{width:64,height:64}); assets.set(2,{width:64,height:64});',context);
  const stage=await context.createStage({});
  const a={key:'first',imageId:1,args:[0,0,32,32]}, b={key:'second',imageId:1,args:[32,16,32,32]};
  stage.setScene([a],[a],1);
  const original=sprites[0];
  stage.setScene([b],[b],1);
  assert.equal(sources.length,1,'same atlas stays uploaded');
  assert.equal(textures.length,1);
  assert.equal(sprites.length,1,'terrain sprite is repositioned');
  assert.equal(original.x,32);assert.equal(original.y,16);
  assert.equal(original.destroyed,undefined);
  const c={key:'new-map',imageId:2,args:[0,0,32,32]};
  stage.setScene([c],[c],2);
  assert.equal(sources[0].destroyed,true,'old map texture released');
  assert.equal(textures[0].destroyed,true);
  assert.equal(sources[1].destroyed,undefined,'new map retained');
});
