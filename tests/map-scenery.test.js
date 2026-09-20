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
