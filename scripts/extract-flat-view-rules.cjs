'use strict';
// Numeric metadata only. Art is decoded from the selected game at runtime.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {virtualToFile}=require('../src/node/pe-addresses');
const bytes=fs.readFileSync(path.join(process.argv[2]||'','Stronghold Crusader.exe'));
const sha=crypto.createHash('sha256').update(bytes).digest('hex');
if(!['3bb0a8c1e72331b3a30a5aa93ed94beca0081b476b04c1960e26d5b45387ac5a','0d3d0d0be90a41d0c07d02cb41e6edc3e399288d16039db5b666392660fbda34'].includes(sha))throw Error('Unsupported executable layout');
const at=virtualToFile(bytes),integer=va=>bytes.readInt32LE(at(va));
const filename=path.join(__dirname,'../assets/aiv/iso/verzeichnis.json');
const catalogue=JSON.parse(fs.readFileSync(filename,'utf8'));
for(const [id,entry] of Object.entries(catalogue.gegenstaende)) {
 const type=Number(id);
 if(type>=28&&type<=358&&type!==200) {
  const branch=bytes[at(0x4097e0)+type-28],target=integer(0x409670+branch*4),offset=at(target);
  if(bytes[offset]===0xb8) {
   const building=bytes.readUInt32LE(offset+1);
   if(building>0&&building<110)entry.flatBuilding={building,group:integer(0xb44220+building*4)};
  }
 }
 for(const plate of entry.platten||[])plate.flatBuilding={building:10,group:1};
}
catalogue.flatTiles=Array.from({length:46},(_,index)=>({bild:`native-flat:${index}`}));
catalogue.flatViewSource={exeSHA256:sha,groups:'0x00B44220',selection:'0x004E9845 / 0x004EBBC4'};
fs.writeFileSync(filename,JSON.stringify(catalogue,null,1)+'\n');
console.log('Native flat-view metadata and 46 runtime tile references extracted');
