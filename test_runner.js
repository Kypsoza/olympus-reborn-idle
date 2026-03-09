/**
 * OLYMPUS REBORN IDLE — Test Runner v0.9.02
 * Coller dans la Console DevTools (F12) et Entrée
 */
(function() {
'use strict';
const PASS='✅', FAIL='❌';
const results=[];
let _s='';
function section(n){ _s=n; console.groupCollapsed('%c▸ '+n,'color:#64C1DE;font-weight:bold;font-size:11px'); }
function endSection(){ console.groupEnd(); }
function test(id,label,fn){
  let status,value,error;
  try{const r=fn();if(r&&typeof r==='object'&&'ok'in r){status=r.ok?PASS:FAIL;value=String(r.val);error=r.ok?null:('Attendu:'+r.expected+' | Obtenu:'+r.val);}else{status=PASS;value=String(r);}}
  catch(e){status=FAIL;value='null';error=e.message;}
  results.push({id,label,section:_s,status,value,error});
  console.log('%c'+status+' ['+id+'] '+label+(error?'\n    → '+error:''),status===PASS?'color:#4CAF50':'color:#F44336');
}
const ok=(v,e)=>({ok:e!==undefined?v===e:!!v,val:v,expected:e});
const okGte=(v,m)=>({ok:Number(v)>=m,val:v,expected:'>='+m});
const okGt=(v)=>({ok:Number(v)>0,val:v,expected:'>0'});
const okEx=(v)=>({ok:v!=null,val:v?'[obj]':'null',expected:'non-null'});
const okHas=(v,s)=>({ok:String(v).includes(s),val:String(v).slice(0,60),expected:'contient "'+s+'"'});
const okType=(v,t)=>({ok:typeof v===t,val:typeof v,expected:t});
const inject=(r,n)=>{try{window.game.rm.add(r,n);return true;}catch(e){return false;}};
const cells=()=>[...window.game.grid.cells.values()];
const learnD=(id)=>{try{return window.game.tm.learn(id);}catch(e){return false;}};
const learnE=(id)=>{try{return window.game.tm.learnEther(id);}catch(e){return false;}};
const learnP=(id)=>{try{return window.game.pantheonManager.learn(id);}catch(e){return false;}};

console.log('%c⚡ OLYMPUS REBORN — TEST RUNNER v0.9.02','color:#F0D060;font-size:14px;font-weight:bold');

section('🔌 P0 — Accès Objets Game');
test('P0-01','window.game existe',()=>ok(typeof window.game!=='undefined',true));
test('P0-02','game.grid (HexGrid Map)',()=>ok(window.game.grid&&window.game.grid.cells instanceof Map,true));
test('P0-03','game.rm (ResourceManager)',()=>okEx(window.game.rm));
test('P0-04','game.tm (TalentManager)',()=>okEx(window.game.tm));
test('P0-05','game.buildingManager',()=>okEx(window.game.buildingManager));
test('P0-06','game.prestigeManager',()=>okEx(window.game.prestigeManager));
test('P0-07','game.codexManager',()=>okEx(window.game.codexManager));
test('P0-08','game.pantheonManager',()=>okEx(window.game.pantheonManager));
test('P0-09','game.zoneManager',()=>okEx(window.game.zoneManager));
test('P0-10','game.scoutManager',()=>okEx(window.game.scoutManager));
endSection();

section('🗺️ P1 — Carte');
test('P1-01','Carte >= 200 cases',()=>okGte(cells().length,200));
test('P1-02','Terrain plain',()=>okGt(cells().filter(c=>c.type==='plain').length));
test('P1-03','Terrain forest',()=>okGt(cells().filter(c=>c.type==='forest').length));
test('P1-04','Terrain mountain',()=>okGt(cells().filter(c=>c.type==='mountain').length));
test('P1-05','BASE_MAIN existe',()=>okEx(cells().find(c=>c.type==='BASE_MAIN')));
test('P1-06','ALTAR existe',()=>okGte(cells().filter(c=>c.type==='ALTAR').length,1));
test('P1-07','isHiddenBase existe',()=>okGte(cells().filter(c=>c.isHiddenBase).length,1));
test('P1-08','Cases rivière présentes',()=>okGte(cells().filter(c=>c.type==='river').length,1));
test('P1-09','Cases révélées au départ',()=>okGte(cells().filter(c=>c.isRevealed).length,1));
test('P1-10','Pas de doublons coords',()=>{const s={};let d=0;cells().forEach(c=>{const k=c.q+','+c.r;s[k]=(s[k]||0)+1;if(s[k]>1)d++;});return ok(d,0);});
test('P1-11','Distribution terrain',()=>{const t={};cells().forEach(c=>t[c.type]=(t[c.type]||0)+1);console.table(t);return ok(true,true);});
endSection();

section('💰 P2 — Ressources');
test('P2-01','drachmes >= 0',()=>okGte(window.game.rm.get('drachmes'),0));
test('P2-02','bois >= 0',()=>okGte(window.game.rm.get('bois'),0));
test('P2-03','nourr >= 0',()=>okGte(window.game.rm.get('nourr'),0));
test('P2-04','fer >= 0',()=>okGte(window.game.rm.get('fer'),0));
test('P2-05','habitants max > 0',()=>okGt(window.game.rm.getMax('habitants')));
test('P2-06','ether = number',()=>okType(window.game.rm.get('ether'),'number'));
test('P2-07','canAfford({drachmes:1})',()=>ok(window.game.rm.canAfford({drachmes:1}),true));
test('P2-08','rm.add fonctionne',()=>{const b=window.game.rm.get('bois');inject('bois',100);return ok(window.game.rm.get('bois')>b,true);});
test('P2-09','getSnapshot() >= 10 clés',()=>{const s=window.game.rm.getSnapshot();console.log('  Res:',Object.keys(s).join(', '));return okGte(Object.keys(s).length,10);});
endSection();

section('🧠 P3 — TalentManager');
test('P3-01','learned["farm_lvl1"]=false départ',()=>ok(!!window.game.tm.learned['farm_lvl1'],false));
test('P3-02','etherLearned["ere2"]=false départ',()=>ok(!!window.game.tm.etherLearned['ere2'],false));
test('P3-03','getBonusProductionPct("farm")=0 départ',()=>ok(window.game.tm.getBonusProductionPct('farm'),0));
test('P3-04','canLearn("farm_lvl1") = objet',()=>okType(window.game.tm.canLearn('farm_lvl1'),'object'));
inject('drachmes',9999999);
test('P3-05','learn("farm_lvl1") = true',()=>ok(learnD('farm_lvl1'),true));
test('P3-06','learned["farm_lvl1"]=true après',()=>ok(!!window.game.tm.learned['farm_lvl1'],true));
learnD('farm_prod1');
test('P3-07','getBonusProd("farm") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('farm'),30));
inject('ether',9999999);
test('P3-08','learnEther("ere2") = true',()=>ok(learnE('ere2'),true));
test('P3-09','getUnlockedEra() >= 2',()=>okGte(window.game.tm.getUnlockedEra(),2));
test('P3-10','learnEther("ere3") = true',()=>ok(learnE('ere3'),true));
test('P3-11','getUnlockedEra() = 3',()=>ok(window.game.tm.getUnlockedEra(),3));
test('P3-12','getScoreMult() >= 1',()=>okGte(window.game.tm.getScoreMult(),1));
test('P3-13','getScoutSpeedMult() >= 1',()=>okGte(window.game.tm.getScoutSpeedMult(),1));
test('P3-14','getEtherGainMult() >= 1',()=>okGte(window.game.tm.getEtherGainMult(),1));
test('P3-15','getTalentDef("farm_prod1") existe',()=>okEx(window.game.tm.getTalentDef('farm_prod1')));
learnD('lumb_prod1');
test('P3-16','getBonusProd("lumber") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('lumber'),30));
learnD('cu_prod1');
test('P3-17','getBonusProd("mine_copper") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('mine_copper'),30));
learnD('fe_prod1');
test('P3-18','getBonusProd("mine_iron") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('mine_iron'),30));
endSection();

section('🏗️ P4 — BuildingManager');
test('P4-01','buildingManager existe',()=>okEx(window.game.buildingManager));
test('P4-02','getBuildingsForTerrain("plain") >= 5',()=>okGte((BuildingManager.getBuildingsForTerrain('plain')||[]).length,5));
test('P4-03','getBuildingsForTerrain("mountain") >= 1',()=>okGte((BuildingManager.getBuildingsForTerrain('mountain')||[]).length,1));
test('P4-04','getBuildingsForTerrain("river") contient pont',()=>{const r=(BuildingManager.getBuildingsForTerrain('river')||[]).map(b=>b.id);console.log('  river:',r.join(', '));return ok(r.includes('pont'),true);});
test('P4-05','BUILDINGS.pont existe',()=>okEx(BUILDINGS&&BUILDINGS.pont));
test('P4-06','pont.validTerrain=["river"]',()=>ok(BUILDINGS.pont&&JSON.stringify(BUILDINGS.pont.validTerrain),'["river"]'));
test('P4-07','pont.isBridge=true',()=>ok(BUILDINGS.pont&&BUILDINGS.pont.isBridge,true));
test('P4-08','BUILDINGS.farm.maxLevel=50',()=>ok(BUILDINGS.farm.maxLevel,50));
test('P4-09','BUILDINGS.senat.isUnique=true',()=>ok(BUILDINGS.senat&&BUILDINGS.senat.isUnique,true));
test('P4-10','>= 29 bâtiments',()=>{const l=Object.keys(BUILDINGS||{});console.log('  Bâtiments('+l.length+'):',l.join(', '));return okGte(l.length,29);});
test('P4-11','canBuild farm sur rivière = false',()=>{const rv=cells().find(c=>c.type==='river'&&c.isRevealed);if(!rv)return ok(true,true,'pas de rivière révélée');return ok(!window.game.buildingManager.canBuild(rv,'farm').ok,true);});
endSection();

section('🌟 P5 — Prestige & Base Principale');
test('P5-01','getConditions() retourne objet',()=>{const c=window.game.prestigeManager.getConditions();console.log('  Conditions:',JSON.stringify(c));return ok(typeof c==='object'&&'allMet'in c,true);});
test('P5-02','getConditions().revealed >= 0',()=>okGte(window.game.prestigeManager.getConditions().revealed,0));
test('P5-03','getConditions().basesLvl5 >= 0',()=>okGte(window.game.prestigeManager.getConditions().basesLvl5,0));
test('P5-04','getBaseBonus(5)=35',()=>ok(window.game.prestigeManager.getBaseBonus(5),35));
test('P5-05','getBaseBonus(3)=12',()=>ok(window.game.prestigeManager.getBaseBonus(3),12));
test('P5-06','computeEther() >= 10',()=>okGte(window.game.prestigeManager.computeEther(),10));
test('P5-07','getLiveScore() = number',()=>okType(window.game.prestigeManager.getLiveScore(),'number'));
test('P5-08','getBaseUpgradeCost(1)={drachmes:500,bois:200}',()=>{const c=window.game.prestigeManager.getBaseUpgradeCost(1);return ok(c&&c.drachmes===500&&c.bois===200,true,JSON.stringify(c));});
test('P5-09','BASE_MAIN sur la carte',()=>okEx(cells().find(c=>c.type==='BASE_MAIN')));
test('P5-10','canUpgradeBase(BASE_MAIN) = false (faut BASE type)',()=>{const base=cells().find(c=>c.type==='BASE_MAIN');if(!base)return ok(true,true,'introuvable');const r=window.game.prestigeManager.canUpgradeBase(base);console.log('  canUpgradeBase(BASE_MAIN):',JSON.stringify(r));return ok(r.ok===false,true);});
test('P5-11','canUpgradeBase(isHiddenBase) = objet avec ok',()=>{const hb=cells().find(c=>c.isHiddenBase&&c.isRevealed&&(c.baseLevel||1)<5);if(!hb)return ok(true,true,'pas de base cachée dispo');inject('drachmes',99999);inject('bois',99999);const r=window.game.prestigeManager.canUpgradeBase(hb);console.log('  canUpgradeBase(hiddenBase):',JSON.stringify(r));return ok(typeof r==='object'&&'ok'in r,true);});
test('P5-12','REQUIRED_REVEALED=50',()=>ok(window.game.prestigeManager.REQUIRED_REVEALED,50));
test('P5-13','REQUIRED_BASE_LVL5=3',()=>ok(window.game.prestigeManager.REQUIRED_BASE_LVL5,3));
test('P5-14','triggerPrestige = fonction',()=>okType(window.game.prestigeManager.triggerPrestige,'function'));
endSection();

section('📖 P6 — Codex');
test('P6-01','codexManager.pages = number',()=>okType(window.game.codexManager.pages,'number'));
test('P6-02','codexLevel >= 1',()=>okGte(window.game.codexManager.codexLevel,1));
test('P6-03','getEtherMultiplier() >= 1',()=>okGte(window.game.codexManager.getEtherMultiplier(),1));
test('P6-04','getProgressToNextLevel() 0..1',()=>{const p=window.game.codexManager.getProgressToNextLevel();return ok(p>=0&&p<=1,true,'p='+p);});
test('P6-05','getPagesForNextLevel() > 0',()=>okGt(window.game.codexManager.getPagesForNextLevel()));
test('P6-06','addPages(100) augmente pages',()=>{const b=window.game.codexManager.pages;window.game.codexManager.addPages(100);return ok(window.game.codexManager.pages>b,true);});
test('P6-07','LEVEL_THRESHOLDS[0]=100',()=>ok(window.game.codexManager.LEVEL_THRESHOLDS[0],100));
endSection();

section('⚡ P7 — Panthéon (6 dieux)');
test('P7-01','PANTHEON_NODES >= 90',()=>okGte(Object.keys(PANTHEON_NODES||{}).length,90));
test('P7-02','SUPREME_NODES = 6',()=>ok(Object.keys(SUPREME_NODES||{}).length,6));
test('P7-03','PANTHEON_BRANCHES = 6',()=>ok((PANTHEON_BRANCHES||[]).length,6));
test('P7-04','Branches = zeus,poseidon,hades,athena,apollon,ares',()=>{const ids=(PANTHEON_BRANCHES||[]).map(b=>b.id).sort();const exp=['apollon','ares','athena','hades','poseidon','zeus'];console.log('  branches:',ids.join(', '));return ok(JSON.stringify(ids),JSON.stringify(exp));});
test('P7-05','zeus_L1_0 existe',()=>okEx(PANTHEON_NODES['zeus_L1_0']));
test('P7-06','poseidon_L1_0 existe',()=>okEx(PANTHEON_NODES['poseidon_L1_0']));
test('P7-07','hades_L1_0 existe',()=>okEx(PANTHEON_NODES['hades_L1_0']));
test('P7-08','getNodeState("zeus_L1_0") = string',()=>okType(window.game.pantheonManager.getNodeState('zeus_L1_0'),'string'));
test('P7-09','Branche zeus verrouillée départ',()=>ok(window.game.pantheonManager.isBranchUnlocked('zeus'),false));
inject('ether',9999999);
test('P7-10','learn sans unlock = false',()=>ok(learnP('zeus_L1_0'),false));
window.game.pantheonManager.unlockBranch('zeus');
test('P7-11','unlockBranch("zeus") fonctionne',()=>ok(window.game.pantheonManager.isBranchUnlocked('zeus'),true));
test('P7-12','learn("zeus_L1_0") après unlock = true',()=>ok(learnP('zeus_L1_0'),true));
test('P7-13','getNodeState après learn contient "learn"',()=>okHas(window.game.pantheonManager.getNodeState('zeus_L1_0'),'learn'));
test('P7-14','zeus_L2_0 sans prérequis complet = false',()=>ok(learnP('zeus_L2_0'),false));
test('P7-15','getRankCost("zeus_L1_0") = number',()=>okType(window.game.pantheonManager.getRankCost('zeus_L1_0'),'number'));
test('P7-16','zeus_supreme dans SUPREME_NODES',()=>okEx(SUPREME_NODES['zeus_supreme']));
test('P7-17','nœud .ranks[0].name non-undefined',()=>{const nd=PANTHEON_NODES['zeus_L1_0'];return ok(nd&&nd.ranks&&nd.ranks[0]&&nd.ranks[0].name!==undefined,true,nd&&nd.ranks&&nd.ranks[0]&&nd.ranks[0].name);});
test('P7-18','État branches',()=>{const brs=['zeus','poseidon','hades','athena','apollon','ares'];console.log('  ',brs.map(b=>b+':'+(window.game.pantheonManager.isBranchUnlocked(b)?'✅':'🔒')).join(' '));return ok(true,true);});
endSection();

section('🗺️ P8 — Zones Divines');
test('P8-01','getAllZones() = 6',()=>ok(window.game.zoneManager.getAllZones().length,6));
test('P8-02','getDef("poseidon") existe',()=>okEx(window.game.zoneManager.getDef('poseidon')));
test('P8-03','getDef("apollon") existe',()=>okEx(window.game.zoneManager.getDef('apollon')));
test('P8-04','getDef("hades") existe',()=>okEx(window.game.zoneManager.getDef('hades')));
test('P8-05','getDef("ares") existe',()=>okEx(window.game.zoneManager.getDef('ares')));
test('P8-06','getDef("zeus") existe',()=>okEx(window.game.zoneManager.getDef('zeus')));
test('P8-07','Frontière poseidon = terrain:river roads:2',()=>{const bc=window.game.zoneManager.getDef('poseidon').borderCondition;console.log('  poseidon border:',JSON.stringify(bc));return ok(bc&&bc.terrain==='river'&&bc.roads===2,true);});
test('P8-08','Frontière apollon count=8',()=>{const bc=window.game.zoneManager.getDef('apollon').borderCondition;console.log('  apollon border:',JSON.stringify(bc));return ok(bc&&bc.count===8,true);});
test('P8-09','Frontière hades mine_iron x5',()=>{const bc=window.game.zoneManager.getDef('hades').borderCondition;console.log('  hades border:',JSON.stringify(bc));return ok(bc&&bc.building&&bc.building.includes('mine_iron')&&bc.count===5,true);});
test('P8-10','Frontière ares allTypes count=2',()=>{const bc=window.game.zoneManager.getDef('ares').borderCondition;console.log('  ares border:',JSON.stringify(bc));return ok(bc&&bc.allTypes===true&&bc.count===2,true);});
test('P8-11','Zeus borderType=libre',()=>ok(window.game.zoneManager.getDef('zeus').borderType,'libre'));
test('P8-12','getCurseMult() = number',()=>okType(window.game.zoneManager.getCurseMult(),'number'));
test('P8-13','getActiveCurses() = Array',()=>ok(Array.isArray(window.game.zoneManager.getActiveCurses()),true));
test('P8-14','scoreThreshold zones',()=>{const ids=['poseidon','apollon','athena','zeus','hades','ares'];console.log('  ',ids.map(id=>{const d=window.game.zoneManager.getDef(id);return id+'='+(d?d.scoreThreshold:'?');}).join(', '));return ok(true,true);});
endSection();

section('🌉 P9 — Pont de Pierre (nouveau)');
test('P9-01','BUILDINGS.pont existe',()=>okEx(BUILDINGS&&BUILDINGS.pont));
test('P9-02','pont.validTerrain=["river"]',()=>ok(JSON.stringify(BUILDINGS.pont&&BUILDINGS.pont.validTerrain),'["river"]'));
test('P9-03','pont.isBridge=true',()=>ok(BUILDINGS.pont&&BUILDINGS.pont.isBridge,true));
test('P9-04','pont.era=1',()=>ok(BUILDINGS.pont&&(BUILDINGS.pont.era||1),1));
test('P9-05','pont.buildCost sans fer',()=>{const c=BUILDINGS.pont&&BUILDINGS.pont.buildCost;return ok(!c||!c.fer,true,'fer='+JSON.stringify(c&&c.fer));});
test('P9-06','pont.buildCost.drachmes > 0',()=>okGt(BUILDINGS.pont&&BUILDINGS.pont.buildCost&&BUILDINGS.pont.buildCost.drachmes));
test('P9-07','getBuildingsForTerrain("river") contient pont',()=>{const ids=(BuildingManager.getBuildingsForTerrain('river')||[]).map(b=>b.id);return ok(ids.includes('pont'),true,ids.join(','));});
test('P9-08','BFS traite building=pont',()=>{const src=window.game.buildingManager._buildConnectedSet.toString();const has=src.includes("'pont'");return ok(has,true,'Logique pont dans BFS:'+(has?'oui':'MANQUANT'));});
test('P9-09','ZoneManager checkBorders Poseidon: building=pont',()=>{const src=window.game.zoneManager.checkBorders.toString();const has=src.includes("'pont'");return ok(has,true,'Logique pont dans checkBorders:'+(has?'oui':'MANQUANT'));});
endSection();

section('💾 P10 — Sauvegarde');
test('P10-01','SaveManager existe',()=>okEx(typeof SaveManager!=='undefined'?SaveManager:null));
test('P10-02','Compression existe',()=>ok(typeof Compression!=='undefined'&&typeof Compression.encode==='function',true));
test('P10-03','saveNow() écrit localStorage',()=>{window.game.saveNow&&window.game.saveNow();return okEx(localStorage.getItem('olympus_reborn_save'));});
test('P10-04','Save = base64',()=>{const r=localStorage.getItem('olympus_reborn_save');return ok(r&&!r.startsWith('{'),true,r?r.slice(0,20):'null');});
test('P10-05','Compression.decode → JSON valide',()=>{const r=localStorage.getItem('olympus_reborn_save');try{const d=Compression.decode(r);const p=JSON.parse(d);return okEx(p.grid||p.version||p.resources);}catch(e){return ok(false,true,e.message);}});
endSection();

section('📱 P11 — DOM & UI');
test('P11-01','Canvas carte',()=>okEx(document.getElementById('game-canvas')||document.querySelector('canvas')));
test('P11-02','Build bar #bb-bar',()=>okEx(document.getElementById('bb-bar')));
test('P11-03','Build bar >= 6 tabs',()=>okGte(document.querySelectorAll('.bb-tab').length,6));
test('P11-04','Drawer #bb-drawer',()=>okEx(document.getElementById('bb-drawer')));
test('P11-05','EventBus accessible',()=>okEx(typeof EventBus!=='undefined'?EventBus:null));
test('P11-06','CELL_TYPE.RIVER="river"',()=>ok(CELL_TYPE&&CELL_TYPE.RIVER,'river'));
test('P11-07','Badge version #game-version',()=>{const el=document.getElementById('game-version');console.log('  Version:',el?el.textContent:'absent');return ok(el&&el.textContent.startsWith('v0.9'),true,el?el.textContent:'absent');});
test('P11-08','HUD footer #hud-bottom',()=>okEx(document.getElementById('hud-bottom')));
endSection();

section('🔋 P12 — Taux de production');
['drachmes','bois','nourr','fer','ether','nectar','bronze','acier','orichalque','metal_divin'].forEach((r,i)=>{
  test('P12-'+(i+1).toString().padStart(2,'0')+'_'+r,'getRate("'+r+'")=number',()=>okType(window.game.rm.getRate(r),'number'));
});
test('P12-snap','Snapshot taux',()=>{const rates={};['drachmes','bois','nourr','fer','ether','nectar','bronze','acier','orichalque','metal_divin'].forEach(r=>rates[r]=window.game.rm.getRate(r));console.table(rates);return ok(true,true);});
endSection();

section('🗂️ P13 — Utils & Sérialisation');
test('P13-01','grid.cells instanceof Map',()=>ok(window.game.grid.cells instanceof Map,true));
test('P13-02','HexGrid.deserialize = fonction',()=>okType(HexGrid&&HexGrid.deserialize,'function'));
test('P13-03','HexUtils accessible',()=>okEx(typeof HexUtils!=='undefined'?HexUtils:null));
test('P13-04','EventBus.emit = fonction',()=>okType(EventBus&&EventBus.emit,'function'));
test('P13-05','computeRenaissanceScore() = number',()=>okType(window.game.grid.computeRenaissanceScore(),'number'));
test('P13-06','tm.serialize = fonction',()=>okType(window.game.tm.serialize,'function'));
test('P13-07','rm.serialize = fonction',()=>okType(window.game.rm.serialize,'function'));
test('P13-08','pantheonManager.invested = objet',()=>okType(window.game.pantheonManager.invested,'object'));
test('P13-09','zoneManager.activeSlots = tableau[2]',()=>ok(Array.isArray(window.game.zoneManager.activeSlots)&&window.game.zoneManager.activeSlots.length===2,true));
endSection();

// ── RAPPORT FINAL ──
const total=results.length,passed=results.filter(r=>r.status===PASS).length,failed=results.filter(r=>r.status===FAIL).length,pct=Math.round(passed/total*100);
console.log('\n%c═══════════════════════════════════════════════','color:#F0D060');
console.log('%c⚡ RAPPORT — OLYMPUS REBORN v0.9.02','color:#F0D060;font-size:13px;font-weight:bold');
console.log('%c✅ Passés : '+passed+'/'+total+' ('+pct+'%)','color:#4CAF50;font-weight:bold');
console.log('%c❌ Échoués : '+failed,'color:#F44336;font-weight:bold');
if(failed>0){console.log('\n%c❌ ÉCHECS :','color:#F44336;font-weight:bold');results.filter(r=>r.status===FAIL).forEach(r=>console.log('%c  ['+r.id+'] '+r.label+'\n    → '+r.error,'color:#FF7070'));}
const lines=['=== OLYMPUS REBORN v0.9.02 — RAPPORT TEST ===','Date:'+new Date().toISOString(),'Passés:'+passed+'/'+total+' ('+pct+'%)','Échoués:'+failed,'','--- DÉTAIL ---'];
results.forEach(r=>{lines.push('['+r.id+'] '+r.status+' '+r.label);if(r.status===FAIL)lines.push('    ERREUR:'+r.error);else if(r.val&&r.val!=='true'&&r.val!=='undefined')lines.push('    Valeur:'+r.val);});
lines.push('','--- FIN RAPPORT ---');
const report=lines.join('\n');
window._testReport=report;window._testResults=results;
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(report).then(()=>console.log('%c📋 Rapport copié !','color:#64C1DE;font-weight:bold')).catch(()=>console.log(report));
else console.log(report);
return{passed,failed,total,pct};
})();
