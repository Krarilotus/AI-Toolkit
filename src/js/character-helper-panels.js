'use strict';
(() => {
  const container=document.getElementById('characterStorage');
  let latest=null,signature='',icons={};
  const labels={Hop:'Hops',Apples:'Fruit',LeatherArmors:'Leather armor',IronArmors:'Iron armor'};
  const iconKeys={Apples:'fruit',Hop:'hop'};
  const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
  const metric=(label,value,negative=false)=>{const row=node('div',undefined,'metricRow');row.append(node('span',label),node('strong',String(value),negative?'populationNegative':''));return row;};
  const signed=v=>v>0?'+'+v:String(v);
  function remember(details,key){
    try{const saved=localStorage.getItem('character-card:'+key);if(saved!==null)details.open=saved==='open';}catch{}
    details.addEventListener('toggle',()=>{try{localStorage.setItem('character-card:'+key,details.open?'open':'closed');}catch{}});
  }
  document.querySelectorAll('[data-character-card]').forEach(el=>remember(el,el.dataset.characterCard));
  const sections={};
  for(const [key,title] of [['stockpile','Stockpile'],['granary','Granary'],['armory','Armory']]){
    const section=node('details',undefined,'characterSubsection');section.open=true;
    const heading=node('summary',title),value=node('strong');heading.append(value);
    const body=node('div');section.append(heading,body);container.append(section);remember(section,key+'-capacity');
    sections[key]={value,body};
  }
  function render(){
    if(!latest)return;
    const result=window.characterPlanning.calculate(...latest);
    for(const [key,view] of Object.entries(sections)){
      const info=result[key],unit=key==='granary'?'food':'spaces';
      view.value.textContent=info.shortfall?info.shortfall+' short':info.free+' free';
      view.value.classList.toggle('populationNegative',info.shortfall>0);
      view.body.replaceChildren(metric('Capacity',info.total+' '+unit),metric('Needed at limits',info.used+' '+unit));
      const table=node('table',undefined,'characterStorageTable');
      const head=node('tr');for(const label of ['Resource','Max',key==='granary'?'':'Spaces'])head.append(node('th',label));
      const thead=node('thead');thead.append(head);table.append(thead);
      const tbody=node('tbody');
      for(const item of info.rows){
        const row=node('tr'),name=node('td'),label=labels[item.resource]||item.resource;
        const src=icons[iconKeys[item.resource]||item.resource.toLowerCase()];
        if(src){const img=node('img');img.src=src;img.alt='';img.width=22;img.height=22;name.append(img);}
        name.append(document.createTextNode(label));
        row.title=item.stack?item.stack+' per space; '+(item.field||[item.produced?'production':'',item.bought?'recruitment purchase':''].filter(Boolean).join(' + ')):'MaxFood + variance';
        row.append(name,node('td',String(item.amount)),node('td',item.slots===undefined?'':String(item.slots)));tbody.append(row);
      }
      table.append(tbody);view.body.append(table);
      if(!info.rows.length)view.body.append(node('p','No relevant production'+(key==='armory'?' or recruitment':'')+' configured.','cardNote'));
      view.body.append(node('p',key==='stockpile'?info.buildings+' stockpiles including the keep; 4 spaces each. All resource limits reserved.':key==='granary'?info.buildings+' granaries; 250 shared food each.':info.buildings+' armories; 10 separate stacks of 5 each. Purchases inferred from configured recruitment.','cardNote'));
    }
    const fear=result.fear;
    document.getElementById('characterFearLevel').textContent=signed(fear.level);
    document.getElementById('characterFearDetails').replaceChildren(
      metric('Positive / negative',fear.positive+' / '+fear.negative),
      metric('Net buildings',signed(fear.net)),
      metric('Population / groups of 16',fear.population+' / '+fear.groups));
  }
  window.characterHelperPanels={update(a,summary,population){
    const next=[a,summary?.counts||{},population],key=JSON.stringify(next);
    if(key===signature)return;signature=key;latest=next;render();
  }};
  window.electronAPI.readResourceIcons?.().then(value=>{icons=value||{};render();}).catch(()=>{});
})();
