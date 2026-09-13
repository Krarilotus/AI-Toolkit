'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path');const config=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../config',name),'utf8'));
test('troop behaviour schema exposes 32 optional fields and restricts digging',()=>{
 const pools=config('fieldPools.json'),options=config('optionPools.json');
 const keys=Object.keys(pools).filter(k=>k.startsWith('AIVTroops_'));assert.equal(keys.length,32);
 assert.deepEqual(keys.filter(k=>options[pools[k]].includes('dig')).map(k=>k.split('_').at(-1)).sort(),['Archer','Engineer','Maceman','Pikeman','Slave','Spearman']);
 for(const file of ['template.json','templateOrdered.json'])for(const key of keys)assert.equal(config(file).aic[key],'');
 for(const file of ['sections.json','sectionsOrdered.json'])assert.deepEqual(config(file)['AIV Troop Behaviour'],['aic.AIVTroops_InitialRole']);
 assert.deepEqual(options[pools.AIVTroops_Movement],['','hold','patrol']);
});
test('inherited troop fields are omitted while explicit and unknown plugin data survives saving',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/js/character-editor.js'),'utf8');
 const context=vm.createContext({});vm.runInContext(source.slice(source.indexOf('function omitInheritedTroopFields('),source.indexOf('function prepareOutputData(')),context);
 const output={aic:{AIVTroops_InitialRole:'',AIVTroops_Movement:'hold',AIVTroops_InitialRole_Slave:'dig',AIVTroops_Unknown:123,MaxFood:42}};
 context.output=output;vm.runInContext('omitInheritedTroopFields(output)',context);
 assert.deepEqual(output.aic,{AIVTroops_Movement:'hold',AIVTroops_InitialRole_Slave:'dig',AIVTroops_Unknown:123,MaxFood:42});
});
