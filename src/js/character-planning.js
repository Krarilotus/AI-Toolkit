(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.characterPlanning=api;})(globalThis,()=>{
  'use strict';
  // Crusader 1.41 resource table 0x005B8D10, indexed by ResourceType.
  const stacks={Wood:48,Stone:48,Iron:48,Pitch:16,Hop:16,Wheat:32,Flour:32,Beer:16};
  const positive=[166,169,175,313,318,324];
  const negative=[176,177,301,305,306,307,308,310,311];
  const weapons=['Bows','Crossbows','Spears','Pikes','Maces','Swords','LeatherArmors','IronArmors'];
  const equipment={EuropArcher:['Bows'],Spearman:['Spears'],Maceman:['Maces','LeatherArmors'],Crossbowman:['Crossbows','LeatherArmors'],Pikeman:['Pikes','IronArmors'],Swordsman:['Swords','IronArmors'],Knight:['Swords','IronArmors']};
  const n=v=>Math.max(0,Math.floor(Number(v)||0));
  function recruitmentWeapons(a){
    const set=new Set(), add=u=>(equipment[u]||[]).forEach(w=>set.add(w));
    for(const [prefix,count] of [['DefUnit',n(a.DefTotal)],['RaidUnit',n(a.RaidUnitsBase)+n(a.RaidUnitsRandom)],['AttUnitMain',n(a.AttMaxDefault)]])
      if(count)for(let i=1;i<=(prefix==='AttUnitMain'?4:8);i++)add(a[prefix+i]);
    for(const key of ['SortieUnitRanged','SortieUnitMelee','DefDiggingUnit','AttDiggingUnit','AttUnitVanguard','AttUnitPatrol','AttUnitBackup','AttUnitEngage','AttUnitSiegeDef'])
      if(n(a[key+(key.startsWith('Sortie')?'Min':'Max')]))add(a[key]);
    return set;
  }
  function calculate(a={},counts={},population=0){
    const count=id=>n(counts[id]), variance=n(a.MaxResourceVariance);
    const sold=new Set(Object.entries(a).filter(([k])=>/^SellResource\d+$/.test(k)).map(([,v])=>v));
    const maximum=(resource,key)=>sold.has(resource)?variance:n(a[key])+variance;
    const stockRows=Object.entries(stacks).map(([resource,stack])=>{
      const field={Wood:'MaxWood',Stone:'MaxStone',Wheat:'MaxFood',Beer:'MaxBeer'}[resource]||'MaxResourceOther';
      const amount=maximum(resource,field);return {resource,amount,stack,slots:Math.ceil(amount/stack),field};
    });
    const farms=new Set(Array.from({length:8},(_,i)=>a['Farm'+(i+1)]));
    const foodRows=[['Bread',count(75)>0],['Meat',count(78)>0],['Apples',farms.has('AppleFarm')||count(72)>0],['Cheese',farms.has('DairyFarm')||count(73)>0]]
      .filter(([,active])=>active).map(([resource])=>({resource,amount:maximum(resource,'MaxFood'),field:'MaxFood'}));
    const produced=new Set();
    for(const [id,key,first,second] of [[50,'FletcherSetting','Bows','Crossbows'],[82,'PoleturnerSetting','Spears','Pikes'],[83,'BlacksmithSetting','Swords','Maces']]){
      if(!count(id))continue;
      const setting=a[key]||'Both';
      if(setting==='Both'){produced.add(first);if(count(id)>1)produced.add(second);}
      else if(setting===first||setting===second)produced.add(setting);
    }
    if(count(84))produced.add('IronArmors');if(count(85))produced.add('LeatherArmors');
    const bought=recruitmentWeapons(a);
    const weaponRows=weapons.filter(w=>produced.has(w)||(bought.has(w)&&n(a.TradeAmountEquipment)>0)).map(resource=>{
      const production=produced.has(resource)?n(a.MaxEquipment):0;
      const purchase=bought.has(resource)?n(a.TradeAmountEquipment):0;
      const amount=sold.has(resource)?variance:Math.max(production,purchase)+variance;
      return {resource,amount,stack:5,slots:Math.ceil(amount/5),produced:produced.has(resource),bought:purchase>0};
    });
    const capacity=(buildings,perBuilding,rows,slots)=>{
      const used=rows.reduce((s,r)=>s+(slots?r.slots:r.amount),0), total=buildings*perBuilding;
      return {buildings,total,used,free:Math.max(0,total-used),shortfall:Math.max(0,used-total),rows};
    };
    const pos=positive.reduce((s,id)=>s+count(id),0),neg=negative.reduce((s,id)=>s+count(id),0),net=pos-neg;
    // Requested planning model: started groups of 16, rounding magnitude down.
    const groups=Math.max(1,Math.ceil(n(population)/16));
    const level=Math.max(-5,Math.min(5,Math.trunc(net/groups)));
    return {stockpile:capacity(count(52)+count(61),4,stockRows,true),granary:capacity(count(80),250,foodRows,false),armory:capacity(count(81),10,weaponRows,true),fear:{positive:pos,negative:neg,net,groups,population:n(population),level:level||0},variance};
  }
  return {calculate,stacks,recruitmentWeapons};
});
