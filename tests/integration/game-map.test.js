// Read-only integration checks against a user-supplied classic Crusader installation.
// No game process is launched and no installed files are modified.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const geometry = require(path.join(root, 'src/js/iso-geometry.js'));
const TEST_GAME_ROOT = process.env.AI_TOOLKIT_TEST_GAME_ROOT;
assert.ok(TEST_GAME_ROOT, 'Set AI_TOOLKIT_TEST_GAME_ROOT to a classic Stronghold Crusader installation before running npm run test:game');
const available = require(path.join(root, 'src/node/game-map.js')).listGameMaps(TEST_GAME_ROOT);
assert.equal(available.gameRoot, TEST_GAME_ROOT, 'The supplied game directory must exist');
assert.ok(available.maps.length >= 20, 'Integration coverage requires a complete map folder');
for (const name of ['A Friend Indeed', 'Rock Face']) assert.ok(available.maps.some(map => map.name === name), 'Missing required map: ' + name);
assert.ok(fs.readdirSync(path.join(TEST_GAME_ROOT, 'aiv')).filter(name => name.endsWith('.aiv')).length >= 10, 'Integration coverage requires the game AIVs');

// Nachbau von rotateAIV (0x004ed0b0) aus seinen drei Kopierschleifen - NICHT
// aus der Formel, die geprueft werden soll. Innen laeuft die Quelle flach
// durch (Zeile k, Spalte j), aussen wandert der Zielzeiger.
function rotateAIVNachbau(quelle, orientation) {
  if (!orientation) return quelle.slice();
  const ziel = new Array(10000).fill(0);
  for (let k = 0; k < 100; k += 1) {
    for (let j = 0; j < 100; j += 1) {
      let zeile, spalte;
      if (orientation === 6) { zeile = j; spalte = 99 - k; }
      else if (orientation === 4) { zeile = 99 - k; spalte = 99 - j; }
      else if (orientation === 2) { zeile = 99 - j; spalte = k; }
      else return quelle.slice();
      ziel[zeile * 100 + spalte] = quelle[k * 100 + j];
    }
  }
  return ziel;
}

test('stock map preview and player start positions match the saved map', () => {
  const { listGameMaps, readGameMap } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps } = listGameMaps(TEST_GAME_ROOT);

  const freund = maps.find(entry => entry.name === 'A Friend Indeed');
  const karte = readGameMap(freund.path, TEST_GAME_ROOT);
  assert.equal(karte.edge, 200);
  assert.match(karte.dataUrl, /^data:image\/png;base64,/);
  // Sechs Bergfriede - nachgezaehlt: 294 Felder mit Bautyp 41 in Abschnitt
  // 1049, das sind 6 mal 7 mal 7. Die Reihenfolge ist die des SPIELS, nicht
  // die des Suchens: die Nummer steht im Gebaeudefeld (1013, Besitzer bei
  // +214). Von Norden nach Sueden gefunden hiessen sie 3, 4, 2, 1, 6, 5.
  assert.deepEqual(karte.keeps, [
    { x: 84, y: 223, player: 1, orientation: 6 },
    { x: 94, y: 156, player: 2, orientation: 6 },
    { x: 246, y: 93, player: 3, orientation: 4 },
    { x: 278, y: 148, player: 4, orientation: 4 },
    { x: 169, y: 328, player: 5, orientation: 0 },
    { x: 222, y: 319, player: 6, orientation: 0 }
  ]);
  // Dorffeld (43,43) trifft jeden dieser Startplaetze - der Ansatzpunkt liegt
  // auf der ECKE des 7x7-Blocks, nicht auf seiner Mitte. Belegt an der Datei
  // selbst: das Gebaeudefeld der Karte merkt sich bei +238/+240 genau diese
  // Ecke, bei allen 486 Bergfrieden der 96 Karten mit Startplatz.
  for (const keep of karte.keeps) {
    // Nicht Dorffeld (43,43), sondern der Anker: nach einer Drehung sitzt der
    // Bergfried 7 Felder weiter, und das Dorf wird um genau diesen Betrag
    // verschoben (keepAnchor). Ungedreht ist der Anker wieder (43,43).
    assert.deepEqual(geometry.mapTileForGrid(geometry.keepAnchor(keep).gx,
                                             geometry.keepAnchor(keep).gy, keep),
                     { mx: keep.x, my: keep.y });
  }
  // Und nichts ausserhalb der Liste wird gelesen.
  assert.throws(() => readGameMap('C:\\Windows\\System32\\drivers\\etc\\hosts', TEST_GAME_ROOT),
                /not one of the game maps/);
});

test('every installed map can be read', () => {
  const { listGameMaps, readGameMap } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps } = listGameMaps(TEST_GAME_ROOT);
  let mitStartplatz = 0;
  for (const entry of maps) {
    const karte = readGameMap(entry.path, TEST_GAME_ROOT);
    assert.match(karte.dataUrl, /^data:image\/png;base64,/, entry.name + ' hat kein Bild');
    const nummern = [];
    for (const keep of karte.keeps) {
      assert.ok(keep.x >= 0 && keep.x <= 399 && keep.y >= 0 && keep.y <= 399,
                entry.name + ': Startplatz ausserhalb der Karte');
      assert.ok([0, 2, 4, 6].includes(keep.orientation),
                entry.name + ': Drehung ' + keep.orientation + ' kennt rotateAIV nicht');
      if (keep.player !== null) {
        assert.ok(keep.player >= 1 && keep.player <= 8, entry.name + ': Spielernummer ausserhalb 1..8');
        assert.ok(!nummern.includes(keep.player), entry.name + ': Spielernummer doppelt vergeben');
        nummern.push(keep.player);
      }
    }
    if (karte.keeps.length) mitStartplatz++;
  }
  assert.ok(mitStartplatz > maps.length / 2, 'die meisten Karten haben einen Startplatz');
});

test('village coordinates match game rotation at every map start', () => {
  const { listGameMaps, readGameMap } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps } = listGameMaps(TEST_GAME_ROOT);

  // Jedes Feld traegt seine eigene Nummer, dann sagt der Nachbau eindeutig,
  // wohin es gewandert ist.
  const dorf = new Array(10000);
  for (let i = 0; i < 10000; i += 1) dorf[i] = i + 1;
  const wohin = new Map();
  for (const orientation of [0, 2, 4, 6]) {
    const gedreht = rotateAIVNachbau(dorf, orientation);
    const tafel = new Array(10001);
    for (let y = 0; y < 100; y += 1)
      for (let x = 0; x < 100; x += 1) tafel[gedreht[y * 100 + x]] = { x, y };
    wohin.set(orientation, tafel);
  }
  // Und der Bergfried als 7x7-Block: applyAIV nimmt den ERSTEN seiner Felder
  // im gedrehten Raster, zeilenweise gesucht, und gibt ihn an placeBuilding.
  const block = new Array(10000).fill(0);
  for (let vy = 43; vy <= 49; vy += 1) for (let vx = 43; vx <= 49; vx += 1) block[vy * 100 + vx] = 1;
  const ersterKeep = new Map();
  for (const orientation of [0, 2, 4, 6]) {
    const gedreht = rotateAIVNachbau(block, orientation);
    let erste = null;
    for (let y = 0; y < 100 && !erste; y += 1)
      for (let x = 0; x < 100; x += 1) if (gedreht[y * 100 + x]) { erste = { x, y }; break; }
    ersterKeep.set(orientation, erste);
  }

  let plaetze = 0;
  // Extremwerte statt mittlerer Werte: die vier Ecken des Dorfes, der
  // Bergfried und die Mitte.
  const proben = [[0, 0], [99, 0], [0, 99], [99, 99], [43, 43], [50, 50], [1, 98], [98, 1]];
  for (const entry of maps) {
    const karte = readGameMap(entry.path, TEST_GAME_ROOT);
    for (const keep of karte.keeps) {
      plaetze += 1;
      const tafel = wohin.get(keep.orientation);
      for (const [vx, vy] of proben) {
        const gedreht = geometry.rotateGrid(vx, vy, 1, keep.orientation);
        const spiel = tafel[vy * 100 + vx + 1];
        // Verglichen wird im DORFRASTER. Wohin das Dorf als Ganzes auf der
        // Karte rutscht, ist eine andere Frage (keepAnchor) und wuerde hier
        // auf beiden Seiten dasselbe abziehen - der Test pruefte sonst die
        // Verschiebung gegen sich selbst statt die Drehung.
        assert.deepEqual({ gx: gedreht.gx, gy: gedreht.gy }, { gx: spiel.x, gy: spiel.y },
          `${entry.name}: Feld (${vx},${vy}) bei Drehung ${keep.orientation}`);
      }
      const keepEcke = geometry.rotateGrid(43, 43, 7, keep.orientation);
      const unserKeep = geometry.mapTileForGrid(keepEcke.gx, keepEcke.gy, keep);
      const spielKeep = ersterKeep.get(keep.orientation);
      assert.deepEqual({ gx: keepEcke.gx, gy: keepEcke.gy }, { gx: spielKeep.x, gy: spielKeep.y },
        `${entry.name}: der Bergfried liegt nicht dort, wo placeBuilding ihn hinstellt`);
      // Und er sitzt auf dem 7x7-Block der Karte - bei JEDER Drehung, nicht
      // nur ungedreht. Vorher stand hier ein "if (orientation === 0)": die
      // gedrehte Burg landete 7 Felder neben ihrem Startplatz, und im Bild
      // sah man den Bergfried der Karte neben dem eigenen stehen.
      assert.deepEqual(unserKeep, { mx: keep.x, my: keep.y },
        `${entry.name}: der Bergfried gehoert auf den Block der Karte, Drehung ${keep.orientation}`);
    }
  }
  assert.ok(plaetze > 400, 'es wurden genug Startplaetze geprueft');
});

test('default and displaced AIV keeps match game placement on every map', async () => {
  const { listGameMaps, readGameMap } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps, gameRoot } = listGameMaps(TEST_GAME_ROOT);
  const aivOrdner = path.join(gameRoot, 'aiv');
  let namen = [];
  try { namen = fs.readdirSync(aivOrdner).filter(name => name.toLowerCase().endsWith('.aiv')); }
  catch { namen = []; }

  const { parseAiv, internals } = await import('../../src/node/aiv-codec.mjs');
  const katalog = require(path.join(root, 'assets', 'aiv', 'iso', 'verzeichnis.json'));

  // Wo das Spiel den Bergfried sucht: erster Bauwert 38 im gedrehten Raster.
  // Gedreht wird mit dem Schleifen-Nachbau von rotateAIV, nicht mit rotateGrid
  // - sonst prueft sich die Formel gegen sich selbst.
  function spielFeld(constructions, orientation) {
    const gedreht = rotateAIVNachbau(constructions, orientation);
    for (let y = 0; y < 100; y += 1)
      for (let x = 0; x < 100; x += 1)
        if (gedreht[y * 100 + x] === 38) return { x, y };
    return null;
  }

  const burgen = namen.map(name => {
    const bytes = fs.readFileSync(path.join(aivOrdner, name));
    const abschnitt = internals.readDirectory(bytes).sections.get(internals.SECTION_IDS.bmap_id);
    const constructions = Array.from(new Uint16Array(abschnitt.buffer, abschnitt.byteOffset, 10000));
    // genau der Weg der Ansicht: erst einsammeln, dann drehen
    const bergfried = geometry.collectItems(parseAiv(bytes), katalog)
      .find(item => Number(item.itemType) === 61);
    assert.ok(bergfried, name + ': kein Bergfried im Bauplan');
    assert.equal(bergfried.tiles, 7, name + ': keep footprint');
    const spiel = new Map([0, 2, 4, 6].map(dreh => [dreh, spielFeld(constructions, dreh)]));
    return { name, bergfried, spiel };
  });

  // Custom AIVs can move their keep. The default 7x7 keep defines the map
  // origin; compare every custom keep against an independently rotated grid.
  const canonical = new Array(10000).fill(0);
  for (let y = 43; y < 50; y++) for (let x = 43; x < 50; x++) canonical[y * 100 + x] = 38;
  const anchors = new Map([0, 2, 4, 6].map(turn => [turn, spielFeld(canonical, turn)]));
  let plaetze = 0;
  let vergleiche = 0;
  for (const eintrag of maps) {
    const karte = readGameMap(eintrag.path, TEST_GAME_ROOT);
    for (const keep of karte.keeps) {
      plaetze += 1;
      const dreh = Number(keep.orientation) || 0;
      for (const burg of burgen) {
        const gedreht = geometry.rotateGrid(burg.bergfried.gx, burg.bergfried.gy,
                                            burg.bergfried.tiles, dreh);
        const unser = geometry.mapTileForGrid(gedreht.gx, gedreht.gy, keep);
        const feld = burg.spiel.get(dreh);
        vergleiche += 1;
        assert.deepEqual({ gx: gedreht.gx, gy: gedreht.gy }, { gx: feld.x, gy: feld.y },
          `${eintrag.name} / ${burg.name}: Bergfried nicht dort, wo placeBuilding ihn hinsetzt`);
        const anchor = anchors.get(dreh);
        assert.deepEqual(unser, { mx: keep.x + feld.x - anchor.x, my: keep.y + feld.y - anchor.y },
          eintrag.name + ' / ' + burg.name + ': displaced keep must retain its rotated map offset');
      }
    }
  }
  assert.ok(plaetze > 400, 'es wurden genug Startplaetze geprueft');
  assert.ok(vergleiche > 50000, 'es wurden genug Burgen geprueft');

});

test('terrain and castle coordinates round-trip at every start and camera rotation', () => {
  // Zwei Drehungen treffen hier zusammen, und sie werden verschieden
  // gerechnet: die Bauwerke dreht turnedTiles in EINEM Schritt (Karte plus
  // Hand, mit der Feldzahl des Bauwerks), der Grund wird in ZWEI gerechnet
  // (Handdrehung heraus, dann auf den Startplatz schieben, mit der Feldzahl
  // des Bergfrieds). Dass beides zusammenpasst, folgt nicht aus der Formel -
  // es muss gemessen werden.
  //
  // GEMESSEN am 17.09.2026, 861 Startplaetze der 189 Karten mal vier
  // Handdrehungen: das Feld, auf dem der Bergfried des Dokuments sitzt, liegt
  // in allen 3.444 Faellen auf einem Feld mit Bautyp 41 - dem Bergfried der
  // Karte. Die Ecke wandert mit der Drehung (0/0, 6/0, 6/6, 0/6), die Flaeche
  // bleibt dieselbe.
  const { listGameMaps, readGameMap, internals } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps } = listGameMaps(TEST_GAME_ROOT);
  const ECKEN = { 0: '0/0', 2: '6/0', 4: '6/6', 6: '0/6' };
  let geprueft = 0, zurueck = 0;
  for (const eintrag of maps) {
    const karte = readGameMap(eintrag.path, TEST_GAME_ROOT);
    if (!karte.keeps.length) continue;
    const bytes = fs.readFileSync(eintrag.path);
    const vorschau = internals.readPreview(bytes);
    const verzeichnis = internals.findDirectory(bytes, vorschau.end);
    let bau = null;
    try { bau = internals.readSection(bytes, verzeichnis, internals.BUILDING_SECTION); } catch { bau = null; }
    if (!bau) continue;
    const bautyp = (mx, my) => {
      if (my < 0 || my > 399) return -1;
      const [von, bis] = internals.rowRange(my);
      return (mx < von || mx > bis) ? -1 : bau[internals.tileIndex(mx, my)];
    };
    for (const keep of karte.keeps) {
      for (const hand of [0, 2, 4, 6]) {
        // So legt turnedTiles den Bergfried hin: Karte plus Hand, 7 Felder.
        const sicht = ((Number(keep.orientation) || 0) + hand) % 8;
        const anzeige = geometry.rotateGrid(43, 43, 7, sicht);
        // Und so rechnet paintMapTiles den Grund darunter.
        const feld = geometry.mapTileForView(anzeige.gx, anzeige.gy, keep, hand);
        assert.equal(bautyp(feld.mx, feld.my), 41,
          `${eintrag.name} (${keep.x},${keep.y}) Handdrehung ${hand}: unter dem Bergfried liegt kein Bergfried der Karte`);
        assert.equal((feld.mx - keep.x) + '/' + (feld.my - keep.y), ECKEN[hand],
          `${eintrag.name}: Handdrehung ${hand} gehoert auf die Ecke ${ECKEN[hand]}`);
        // Und der Weg zurueck trifft wieder dasselbe Feld - darauf haengen die
        // Marken der anderen Startplaetze.
        const hin = geometry.viewTileForMap(feld.mx, feld.my, keep, hand);
        if (hin.gx === anzeige.gx && hin.gy === anzeige.gy) zurueck += 1;
        geprueft += 1;
      }
    }
  }
  assert.ok(geprueft > 3000, 'es wurden genug Faelle geprueft: ' + geprueft);
  assert.equal(zurueck, geprueft, 'Kartenfeld und Anzeigefeld sind eine Umkehrung');
});

test('atlas positions match saved graphics with original compounds replaced by desert', () => {
  // Der Totschlagtest fuer die Lage, seit das fertige Gelaendebild weg ist.
  // Gemalt wird aus dem Vorrat: je Feld eine Platznummer im Atlas. Sie muss zu
  // genau der Bildnummer gehoeren, die im GfxLayer steht - und zwar im vollen
  // 400x400-Raster, nicht in der Rautenzaehlung der Datei. Genau daran ist es
  // am 09.09.2026 gescheitert, die Karte lag danach in Streifen.
  const { listGameMaps, readMapTiles, internals } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps, gameRoot } = listGameMaps(TEST_GAME_ROOT);
  const eintrag = maps.find(m => m.name === 'Crete Peninsula') || maps[0];
  const vorrat = readMapTiles(eintrag.path, TEST_GAME_ROOT);
  const roh = Buffer.from(vorrat.plaetze, 'base64');
  const plaetze = new Uint16Array(roh.buffer, roh.byteOffset, roh.length / 2);
  assert.equal(plaetze.length, 400 * 400, 'ein volles Raster, keine Raute');

  const bytes = fs.readFileSync(eintrag.path);
  const vorschau = internals.readPreview(bytes);
  const verzeichnis = internals.findDirectory(bytes, vorschau.end);
  const gfx = internals.readSection(bytes, verzeichnis, internals.GFX_SECTION);
  // Original starting compounds are deliberately replaced with desert. Build
  // the expected layer independently; all remaining tiles must still match.
  const { readGameMap } = require(path.join(root, 'src/node/game-map.js'));
  const desert = internals.readPictureStock(gameRoot).files.find(stock => stock.name === 'tile_land8');
  assert.ok(desert, 'desert picture stock is present');
  for (const keep of readGameMap(eintrag.path, TEST_GAME_ROOT).keeps) {
    for (const [dx, dy, width, height] of [[0,0,7,7], [2,7,3,1], [0,8,7,7], [7,2,5,5]]) {
      for (let y=keep.y+dy; y<keep.y+dy+height; y++) for (let x=keep.x+dx; x<keep.x+dx+width; x++) {
        const [low, high] = internals.rowRange(y);
        if (x >= low && x <= high) gfx.writeUInt16LE(desert.from + 1, internals.tileIndex(x,y) * 2);
      }
    }
  }


  // Die Reihenfolge des Vorrats: jede Bildnummer bekommt beim ersten Auftreten
  // ihren Platz. Hier unabhaengig noch einmal gebildet.
  const platzVon = new Map();
  for (let feld = 0; feld < internals.MAP_TILES; feld += 1) {
    const wert = gfx.readUInt16LE(feld * 2);
    if (wert && !platzVon.has(wert)) platzVon.set(wert, platzVon.size);
  }
  assert.equal(vorrat.kacheln, platzVon.size, 'je vorkommender Bildnummer eine Kachel im Atlas');

  let geprueft = 0, rahmen = 0;
  for (let my = 0; my < 400; my += 1) {
    const [von, bis] = internals.rowRange(my);
    for (let mx = 0; mx < 400; mx += 1) {
      const platz = plaetze[my * 400 + mx];
      if (mx < von || mx > bis) { assert.equal(platz, 0xffff, `ausserhalb der Raute: ${mx},${my}`); rahmen += 1; continue; }
      const wert = gfx.readUInt16LE(internals.tileIndex(mx, my) * 2);
      assert.equal(platz, wert === 0 ? 0xffff : platzVon.get(wert), `Feld ${mx},${my}`);
      geprueft += 1;
    }
  }
  assert.equal(geprueft, 80400, 'die ganze Raute geprueft');
  assert.equal(rahmen, 160000 - 80400, 'und der Rahmen darum bleibt leer');

  // Um ein Feld verschoben darf es NICHT mehr passen, sonst misst der Test
  // nichts. Gemessen: 6,1 Prozent Zufallstreffer nach Osten, 6,3 nach Sueden.
  let gleich = 0, verglichen = 0;
  for (let my = 1; my < 399; my += 1) {
    const [von, bis] = internals.rowRange(my);
    for (let mx = von; mx < bis; mx += 1) {
      const wert = gfx.readUInt16LE(internals.tileIndex(mx, my) * 2);
      if (!wert) continue;
      verglichen += 1;
      if (plaetze[my * 400 + mx + 1] === platzVon.get(wert)) gleich += 1;
    }
  }
  assert.ok(gleich < verglichen * 0.2,
    `verschoben passt es zu ${(gleich / verglichen * 100).toFixed(1)} Prozent - dann misst der Test nichts`);
});

test('map atlas payload stays within its size budget', () => {
  // Die ganze Karte als fertiges Bild waere 293 MB gewesen. Der Vorrat malt
  // jede Bildnummer EINMAL in einen Atlas und schickt je Feld nur zwei Byte
  // Platznummer. Gemessen am 17.09.2026: Atlas 561 KB (A Friend Indeed) bis
  // 1110 KB (Rock Face), alles zusammen rund 4,6 MB. Waechst das unbemerkt,
  // kommt es nicht mehr durch den Kanal.
  const { listGameMaps, readMapTiles, internals } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps, gameRoot } = listGameMaps(TEST_GAME_ROOT);
  const eintrag = maps.find(m => m.name === 'A Friend Indeed') || maps[0];
  const vorrat = readMapTiles(eintrag.path, TEST_GAME_ROOT);
  const kb = (text) => Math.round(Buffer.byteLength(text, 'utf8') / 1024);

  assert.equal(vorrat.kachelBreite, internals.TILE_W);
  assert.equal(vorrat.kachelHoehe, internals.TILE_H);
  assert.equal(vorrat.spalten, internals.ATLAS_SPALTEN);
  assert.equal(vorrat.atlasBreite, internals.ATLAS_SPALTEN * internals.TILE_W);
  assert.equal(vorrat.atlasHoehe, Math.ceil(vorrat.kacheln / internals.ATLAS_SPALTEN) * internals.TILE_H);
  assert.equal(vorrat.fehlend, 0, 'jede vorkommende Bildnummer hat ein Bild');
  assert.ok(vorrat.atlas.startsWith('data:image/png;base64,'));
  assert.ok(kb(vorrat.atlas) < 2048, 'der Atlas bleibt unter 2 MB, hier ' + kb(vorrat.atlas) + ' KB');
  assert.equal(Buffer.from(vorrat.plaetze, 'base64').length, 400 * 400 * 2, 'zwei Byte je Feld');
  assert.equal(Buffer.from(vorrat.hoehen, 'base64').length, 400 * 400, 'ein Byte Hoehe je Feld');
  const ganz = kb(JSON.stringify(vorrat));
  assert.ok(ganz < 8192, 'der ganze Vorrat bleibt unter 8 MB, hier ' + ganz + ' KB');
  // Nur Karten aus der Liste.
  assert.throws(() => readMapTiles('C:\\Windows\\System32\\drivers\\etc\\hosts', TEST_GAME_ROOT),
                /not one of the game maps/);
});

test('atlas preserves every terrain height and includes cliff sprites', () => {
  const { listGameMaps, readMapTiles, internals } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps, gameRoot } = listGameMaps(TEST_GAME_ROOT);
  // Eine Karte mit echtem Hoehenunterschied - auf Rock Face liegen 69.497
  // Felder ueber null und 10.903 auf null.
  const eintrag = maps.find(m => m.name === 'Rock Face') || maps[0];
  const vorrat = readMapTiles(eintrag.path, TEST_GAME_ROOT);
  const hoehen = Buffer.from(vorrat.hoehen, 'base64');
  assert.equal(hoehen.length, 400 * 400);

  const bytes = fs.readFileSync(eintrag.path);
  const vorschau = internals.readPreview(bytes);
  const verzeichnis = internals.findDirectory(bytes, vorschau.end);
  const echt = internals.readSection(bytes, verzeichnis, internals.HEIGHT_SECTION);

  // Jedes Feld traegt die Hoehe, die in der Hoehenschicht steht - in derselben
  // Zaehlung wie die Plaetze, sonst stuende die Burg neben ihrem Berg.
  let geprueft = 0, hoch = 0;
  for (let my = 0; my < 400; my += 1) {
    const [von, bis] = internals.rowRange(my);
    for (let mx = von; mx <= bis; mx += 1) {
      const wert = hoehen[my * 400 + mx];
      assert.equal(wert, echt[internals.tileIndex(mx, my)], `Feld ${mx},${my}`);
      geprueft += 1;
      if (wert) hoch += 1;
    }
  }
  assert.equal(geprueft, 80400, 'die ganze Karte geprueft');
  assert.ok(hoch > 20000, 'auf dieser Karte liegt echter Hoehenunterschied: ' + hoch);

  // Und die Steilkanten sind dabei - ohne sie stuende der Berg auf nichts.
  const kanten = Buffer.from(vorrat.cliffSprites, 'base64');
  assert.equal(kanten.length, 400 * 400 * 2);
  let gemalt = 0;
  for (let i = 0; i < kanten.length; i += 2) if (kanten.readUInt16LE(i)) gemalt += 1;
  assert.ok(gemalt > 500, 'Steilkanten gemalt: ' + gemalt);
});

test('cactus pictures match saved random values across all installed maps', () => {
  // Eine Kartendatei speichert bei 15 Prozent der Gewaechse keine Bildnummer.
  // Das Spiel wuerfelt sie beim ersten Zug aus dem gemerkten Zufallswert
  // (rng1, Versatz 0x88): UpdateTree16 bis UpdateTree19 unter 0x004f28f0,
  // 0x004f2920, 0x004f2970 und 0x004f29c0.
  //
  // TOTSCHLAGTEST: Wo die Nummer gespeichert IST, muss die Rechnung genau sie
  // treffen. Gemessen am 17.09.2026 ueber alle 189 Karten: 67.903 von 67.903.
  // Trifft sie nicht mehr, ist die Rechnung falsch und darf auch nicht auf die
  // 10.169 Kakteen ohne Nummer angewandt werden.
  const { listGameMaps, internals } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps } = listGameMaps(TEST_GAME_ROOT);
  const stride = internals.TREE_STRIDE;
  let mitBild = 0, treffer = 0, ohneBild = 0, ungueltig = 0;
  for (const eintrag of maps) {
    const bytes = fs.readFileSync(eintrag.path);
    let roh = null;
    try {
      const vorschau = internals.readPreview(bytes);
      roh = internals.readSection(bytes, internals.findDirectory(bytes, vorschau.end), internals.TREES_SECTION);
    } catch { roh = null; }
    if (!roh) continue;
    for (let index = 1; index < roh.length / stride; index += 1) {
      const at = index * stride;
      if (roh.readInt16LE(at + 4) !== 200) continue;          // nur tree_cactii
      const art = roh.readInt16LE(at + 0x46);
      const bild = roh.readInt32LE(at);
      const gerechnet = internals.cactusPicture(art, roh.readInt32LE(at + 0x88));
      if (bild) {
        mitBild += 1;
        if (gerechnet === bild) treffer += 1;
      } else {
        ohneBild += 1;
        if (!(gerechnet >= 1 && gerechnet <= 17)) ungueltig += 1;
      }
    }
  }
  assert.ok(mitBild > 60000, 'es wurden genug Kakteen geprueft: ' + mitBild);
  assert.equal(treffer, mitBild, 'die Rechnung muss jede gespeicherte Bildnummer treffen');
  assert.ok(ohneBild > 5000, 'und es gibt genug ohne Nummer: ' + ohneBild);
  assert.equal(ungueltig, 0, 'fuer sie kommt nur ein Bild aus tree_cactii heraus (1 bis 17)');


});

test('every vegetation tile receives a sprite', () => {
  // Vorher fielen die Kakteen aus: auf "A Friend Indeed" wurden 549 von 961
  // Gewaechsfeldern gemalt, und im Boden blieb nur ihr Schatten stehen.
  const { listGameMaps, readMapTiles, internals } = require(path.join(root, 'src', 'node', 'game-map.js'));
  const { maps, gameRoot } = listGameMaps(TEST_GAME_ROOT);
  const eintrag = maps.find(m => m.name === 'A Friend Indeed') || maps[0];
  const bytes = fs.readFileSync(eintrag.path);
  const vorschau = internals.readPreview(bytes);
  const verzeichnis = internals.findDirectory(bytes, vorschau.end);
  const organismen = internals.readSection(bytes, verzeichnis, internals.ORGANISM_SECTION);

  // Felsen (Kennung ab 2000) sind Bodenkacheln aus tile_rocks8 und brauchen
  // kein eigenes Bild; gezaehlt werden die Gewaechse darunter.
  let gewaechse = 0;
  for (let my = 0; my < 400; my += 1) {
    const [von, bis] = internals.rowRange(my);
    for (let mx = von; mx <= bis; mx += 1) {
      const id = organismen.readUInt16LE(internals.tileIndex(mx, my) * 2);
      if (id > 0 && id < internals.FIRST_ROCK) gewaechse += 1;
    }
  }
  const vorrat = readMapTiles(eintrag.path, TEST_GAME_ROOT);
  assert.ok(gewaechse > 900, 'auf dieser Karte stehen genug Gewaechse: ' + gewaechse);
  assert.equal(vorrat.treeSprites.length, gewaechse,
    'jedes Gewaechsfeld gehoert ins Bild - ' + vorrat.treeSprites.length + ' von ' + gewaechse);
});
