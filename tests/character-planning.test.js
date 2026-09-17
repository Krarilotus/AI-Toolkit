'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {calculate,stacks}=require('../src/js/character-planning');
test('stockpile capacities use native stack sizes and reserve separate rounded resource slots',()=>{
 assert.deepEqual(stacks,{Wood:48,Stone:48,Iron:48,Pitch:16,Hop:16,Wheat:32,Flour:32,Beer:16});
 const r=calculate({MaxWood:48,MaxStone:48,MaxFood:32,MaxResourceOther:16,MaxBeer:16,MaxResourceVariance:1},{61:1,52:3});
 assert.equal(r.stockpile.total,16);
 assert.equal(r.stockpile.used,14);
 assert.equal(r.stockpile.free,2);
 assert.equal(r.stockpile.rows.find(x=>x.resource==='Wheat').amount,33);
});
test('granary sums only produced foods and uses shared 250-food capacity',()=>{
 const r=calculate({MaxFood:100,MaxResourceVariance:10,Farm1:'DairyFarm',Farm2:'AppleFarm'},{75:2,78:1,80:1});
 assert.equal(r.granary.rows.length,4);assert.equal(r.granary.used,440);assert.equal(r.granary.shortfall,190);assert.equal(r.granary.free,0);
 assert.equal(calculate({MaxFood:100},{80:1}).granary.used,0);
});
test('armory reserves unmixed five-weapon stacks and includes equipment purchase limits',()=>{
 const r=calculate({MaxEquipment:6,MaxResourceVariance:1,TradeAmountEquipment:12,FletcherSetting:'Both',DefTotal:10,DefUnit1:'Crossbowman'},{50:2,81:1});
 assert.deepEqual(r.armory.rows.map(x=>[x.resource,x.amount,x.slots]),[['Bows',7,2],['Crossbows',13,3],['LeatherArmors',13,3]]);
 assert.equal(r.armory.free,2);
});
test('Both alternates workshop output; one workshop produces only its first weapon',()=>{
 const r=calculate({MaxEquipment:5,FletcherSetting:'Both',PoleturnerSetting:'Pikes',BlacksmithSetting:'Maces'},{50:1,82:1,83:1,84:1,85:1});
 assert.deepEqual(r.armory.rows.map(x=>x.resource),['Bows','Pikes','Maces','LeatherArmors','IronArmors']);
});
test('selling caps a produced or bought weapon at variance without double-counting it',()=>{
 const r=calculate({MaxEquipment:100,TradeAmountEquipment:50,MaxResourceVariance:6,SellResource01:'Bows',DefTotal:2,DefUnit1:'EuropArcher'},{50:1,81:1});
 assert.equal(r.armory.rows[0].amount,6);assert.equal(r.armory.rows[0].slots,2);
 assert.equal(r.armory.rows.length,1);
});
test('disabled recruitment adds no purchased equipment',()=>{
 const r=calculate({TradeAmountEquipment:20,DefUnit1:'Knight',AttUnitVanguard:'Pikeman'},{81:1});assert.equal(r.armory.used,0);
});
test('fear uses started population groups, cancellation, symmetric rounding and clamps',()=>{
 assert.equal(calculate({}, {175:20,176:3},100).fear.level,2);
 assert.equal(calculate({}, {175:3,176:20},100).fear.level,-2);
 assert.equal(calculate({}, {175:1},16).fear.level,1);
 assert.equal(calculate({}, {175:1},17).fear.level,0);
 assert.equal(calculate({}, {175:100},100).fear.level,5);
 assert.equal(calculate({}, {176:100},100).fear.level,-5);
 assert.equal(calculate({}, {175:3,176:3,312:20},100).fear.net,0);
});
