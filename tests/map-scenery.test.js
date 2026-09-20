const test = require('node:test');
const assert = require('node:assert/strict');
const { internals: { upperTilePicture, packMapPictures } } = require('../src/node/game-map');

test('map upper graphics retain GM1 lift, half-tile offset and transparent pixels', () => {
  const raw = Buffer.concat([Buffer.alloc(512), Buffer.from([0, 0xff, 0x7f, 0x80])]);
  const picture = upperTilePicture({ height: 2, lift: 40, direction: 3 }, raw);
  assert.equal(picture.dx, 14);
  assert.equal(picture.dy, -40);
  assert.equal(picture.rgba[3], 255);
  assert.equal(picture.rgba[7], 0);
  assert.equal(picture.rgba[30 * 4 + 3], 0);
  assert.equal(upperTilePicture({ height: 16 }, Buffer.alloc(512)), null);
});

test('map sprite packing preserves blank indices and separates tall sprites', () => {
  const make = (width, height) => ({ width, height, dx: 14, dy: -40, rgba: Buffer.alloc(width * height * 4) });
  const atlas = packMapPictures([make(1500, 10), null, make(700, 100)]);
  assert.equal(atlas.entries[1], null);
  assert.ok(atlas.entries[2].y > atlas.entries[0].y + atlas.entries[0].height);
  assert.equal(atlas.entries[2].dy, -40);
  assert.match(atlas.dataUrl, /^data:image\/png;base64,/);
  assert.throws(() => packMapPictures([make(2048, 1)]), /dimensions/);
});

test('map keep footprints become desert without modifying captures or adjacent tiles', () => {
  const { replaceMapKeeps, tileIndex, MAP_TILES } = require('../src/node/game-map').internals;
  const keeps = [{x:188,y:294},{x:161,y:106}];
  for (let camera = 0; camera < 4; camera++) {
    const source = Buffer.alloc(MAP_TILES * 2);
    for (let tile = 0; tile < MAP_TILES; tile++) source.writeUInt16LE(22000 + camera, tile * 2);
    const result = replaceMapKeeps(source, keeps, 1);
    const replaced = new Set();
    for (const keep of keeps) {
      // Keep, entrance, forecourt/campfire, stockpile: independently specify
      // the observed map footprint so a missed component fails this check.
      for (const [dx,dy,w,h] of [[0,0,7,7],[2,7,3,1],[0,8,7,7],[7,2,5,5]]) {
        for(let y=0;y<h;y++)for(let x=0;x<w;x++)replaced.add(tileIndex(keep.x+dx+x,keep.y+dy+y));
      }
    }
    assert.equal(replaced.size, 252);
    for (let tile = 0; tile < MAP_TILES; tile++) {
      assert.equal(result.readUInt16LE(tile * 2), replaced.has(tile) ? 1 : 22000 + camera);
      assert.equal(source.readUInt16LE(tile * 2), 22000 + camera);
    }
    assert.equal(replaceMapKeeps(source, [], 1), source);
  }
});

test('successful native map loading never constructs the saved-map fallback', async () => {
  const { resolveNativeMapTiles } = require('../src/node/game-map').internals;
  const source = {}, native = {}, output = {};
  const calls = [];
  const result = await resolveNativeMapTiles(source, async () => native, (parsed, layers) => {
    calls.push({parsed,layers}); return output;
  });
  assert.equal(result, output);
  assert.deepEqual(calls, [{parsed:source,layers:native}]);
});

test('native failures and rejected captures build the saved fallback only when needed', async () => {
  const { resolveNativeMapTiles } = require('../src/node/game-map').internals;
  for (const failDuringBuild of [false,true]) {
    const source = {}, native = {}, calls = [];
    const result = await resolveNativeMapTiles(source, async () => {
      if (!failDuringBuild) throw Error('capture failed');
      return native;
    }, (parsed,layers) => {
      assert.equal(parsed,source); calls.push(layers);
      if (layers) throw Error('capture rejected');
      return {atlas:'saved'};
    });
    assert.equal(result.atlas,'saved');
    assert.match(result.nativeError,/capture (failed|rejected)/);
    assert.deepEqual(calls,failDuringBuild?[native,undefined]:[undefined]);
  }
});

test('cactus picture selection clamps each variety and rejects non-cactus types', () => {
  const { internals } = require('../src/node/game-map');
  // Die Deckelung ist der Grund, warum das hoechste Bild einer Art doppelt so
  // oft vorkommt - ohne sie zeigte jede vierte Pflanze ein fremdes Bild.
  assert.equal(internals.cactusPicture(17, 3), 3, 'Art 17 deckelt die 4 auf 3');
  assert.equal(internals.cactusPicture(18, 3), 6, 'Art 18 deckelt die 7 auf 6');
  assert.equal(internals.cactusPicture(19, 3), 9, 'Art 19 deckelt die 10 auf 9');
  assert.equal(internals.cactusPicture(16, 7), 17, 'Art 16 geht bis 17');
  assert.equal(internals.cactusPicture(16, 0), 10);
  assert.equal(internals.cactusPicture(2, 3), 0, 'ein Baum ist kein Kaktus - da wird nichts geraten');
});


test('native pillars follow both sloped tile edges and repeat source rows without stretching', () => {
  const {pillarPicture} = require('../src/node/gm1');
  const buffer = Buffer.alloc(24 + 60 * 2); buffer.writeUInt32LE(5, 20);
  for (let x=0;x<30;x++) {buffer.writeUInt16LE(0x7c00,24+x*2);buffer.writeUInt16LE(0x03e0,84+x*2);}
  const file = {buffer, picturesAt:24, pictures:[{offset:0,size:120,width:30,height:9}]};
  const p = pillarPicture(file, 0, 3);
  assert.equal(p.height, 10);
  const pixel = (x,y) => [...p.rgba.subarray((y*30+x)*4,(y*30+x+1)*4)];
  for (let x=0;x<30;x++) {
    const shift = Math.min(x>>1,(29-x)>>1);
    assert.deepEqual(pixel(x,shift),[255,0,0,255]);
    assert.deepEqual(pixel(x,shift+1),[0,255,0,255]);
    assert.deepEqual(pixel(x,shift+2),[255,0,0,255]);
    if (shift) assert.equal(pixel(x,shift-1)[3],0);
  }
  buffer.writeUInt32LE(3,20);assert.equal(pillarPicture(file,0,3),null);
});

test('large scenery atlases split into bounded pages, preserving indices and native pixels',()=>{
 const picture={width:1020,height:1020,dx:14,dy:-100,rgba:Buffer.alloc(1020*1020*4)};
 picture.rgba.set([12,34,56,255]);
 const pictures=Array(35).fill(picture);pictures.splice(3,0,null);
 assert.throws(()=>packMapPictures(pictures),/size limit/);
 const atlas=packMapPictures(pictures,{paged:true});
 assert.equal(atlas.entries[3],null);assert.ok(atlas.pages.length>1);
 const decoded=atlas.pages.map(url=>{
  const png=Buffer.from(url.split(',')[1],'base64'),width=png.readUInt32BE(16),height=png.readUInt32BE(20),chunks=[];
  assert.ok(width<=2048&&height<=4096);
  for(let at=8;at<png.length;){const n=png.readUInt32BE(at);if(png.toString('ascii',at+4,at+8)==='IDAT')chunks.push(png.subarray(at+8,at+8+n));at+=n+12;}
  return {width,raw:require('node:zlib').inflateSync(Buffer.concat(chunks))};
 });
 for(const entry of atlas.entries.filter(Boolean)) {
  assert.equal(entry.dx,14);assert.equal(entry.dy,-100);
  const {raw,width}=decoded[entry.page],at=entry.y*(width*4+1)+1+entry.x*4;
  assert.deepEqual([...raw.subarray(at,at+4)],[12,34,56,255]);
 }
});
