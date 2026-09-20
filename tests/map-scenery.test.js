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
