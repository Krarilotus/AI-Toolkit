const test = require('node:test');
const assert = require('node:assert/strict');
const geo = require('../src/js/iso-geometry');

// Expected absolute coordinates use the original executable's fixed -43
// offsets (0x4ecf8b/0x4ecf97), not the editor's anchor or inverse transform.
test('rotated default keep retains the game displacement on the map', () => {
  const expected = [[0,120,260],[2,120,267],[4,127,267],[6,127,260]];
  for (const [orientation,mx,my] of expected) {
    const keep = {x:120,y:260,orientation};
    const rotated = geo.rotateGrid(43,43,7,orientation);
    assert.deepEqual(geo.mapTileForGrid(rotated.gx,rotated.gy,keep),{mx,my});
    assert.deepEqual(geo.mapTileForGrid(0,0,keep),{mx:77,my:217},'AIV origin does not rotate');
    for (const camera of [0,2,4,6]) {
      const viewed = geo.rotateGrid(rotated.gx,rotated.gy,1,camera);
      assert.deepEqual(geo.mapTileForView(viewed.gx,viewed.gy,keep,camera),{mx,my});
    }
  }
});

test('custom keep displacement and rally points share the fixed game origin', () => {
  for (const [orientation,x,y] of [[0,30,40],[2,40,63],[4,63,53],[6,53,30]]) {
    const keep = {x:120,y:260,orientation};
    const rotated = geo.rotateGrid(30,40,7,orientation);
    assert.deepEqual(geo.mapTileForGrid(rotated.gx,rotated.gy,keep),{mx:77+x,my:217+y});
  }
  for (const [orientation,x,y] of [[0,10,20],[2,20,89],[4,89,79],[6,79,10]]) {
    const keep = {x:120,y:260,orientation};
    const tile = geo.rotateGrid(10,20,1,orientation);
    assert.deepEqual(geo.mapTileForGrid(tile.gx,tile.gy,keep),{mx:77+x,my:217+y});
  }
});
