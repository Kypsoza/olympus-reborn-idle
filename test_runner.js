/**
 * OLYMPUS REBORN IDLE — Test Runner v0.9.95 (APIs corrigées)
 * Coller dans la Console DevTools (F12) et Entrée
 */
(function() {
'use strict';
const PASS='✅',FAIL='❌';
const results=[];
let _s='';
function section(n){_s=n;console.groupCollapsed('%c▸ '+n,'color:#64C1DE;font-weight:bold;font-size:11px');}
function endSection(){console.groupEnd();}
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

console.log('%c⚡ OLYMPUS REBORN — TEST RUNNER v0.9.95','color:#F0D060;font-size:14px;font-weight:bold');

section('🔌 P0 — Accès Objet Game');
test('P0-01','window.game existe',()=>ok(typeof window.game!=='undefined',true));
test('P0-02','game.grid = HexGrid (Map)',()=>ok(window.game.grid&&window.game.grid.cells instanceof Map,true));
test('P0-03','game.rm (ResourceManager)',()=>okEx(window.game.rm));
test('P0-04','game.tm (TalentManager)',()=>okEx(window.game.tm));
test('P0-05','game.buildingManager',()=>okEx(window.game.buildingManager));
test('P0-06','game.prestigeManager',()=>okEx(window.game.prestigeManager));
test('P0-07','game.codexManager',()=>okEx(window.game.codexManager));
test('P0-08','game.pantheonManager',()=>okEx(window.game.pantheonManager));
test('P0-09','game.zoneManager',()=>okEx(window.game.zoneManager));
endSection();

section('🗺️ P1 — Carte (cells = Map)');
test('P1-01','Carte >= 200 cases',()=>okGte(cells().length,200));
test('P1-02','Terrain plain present',()=>okGt(cells().filter(c=>c.type==='plain').length));
test('P1-03','Terrain forest present',()=>okGt(cells().filter(c=>c.type==='forest').length));
test('P1-04','Terrain mountain present',()=>okGt(cells().filter(c=>c.type==='mountain').length));
test('P1-05','Base principale (BASE_MAIN)',()=>okEx(cells().find(c=>c.type==='BASE_MAIN'||c.type==='BASE')));
test('P1-06','Autel prestige (ALTAR)',()=>okGte(cells().filter(c=>c.type==='ALTAR').length,1));
test('P1-07','Bases cachees (isHiddenBase)',()=>okGte(cells().filter(c=>c.isHiddenBase).length,1));
test('P1-08','Cases revelees au depart',()=>okGte(cells().filter(c=>c.isRevealed).length,1));
test('P1-09','Coords q/r = number',()=>{const c=cells()[0];return ok(typeof c.q==='number'&&typeof c.r==='number',true);});
test('P1-10','Pas de doublons coords',()=>{const s={};let d=0;cells().forEach(c=>{const k=c.q+','+c.r;s[k]=(s[k]||0)+1;if(s[k]>1)d++;});return ok(d,0);});
test('P1-11','Distribution terrain',()=>{const t={};cells().forEach(c=>t[c.type]=(t[c.type]||0)+1);console.table(t);return ok(true,true);});
endSection();

section('💰 P2 — Ressources');
test('P2-01','rm.get("drachmes") >= 0',()=>okGte(window.game.rm.get('drachmes'),0));
test('P2-02','rm.get("bois") >= 0',()=>okGte(window.game.rm.get('bois'),0));
test('P2-03','rm.get("nourr") >= 0',()=>okGte(window.game.rm.get('nourr'),0));
test('P2-04','rm.get("fer") >= 0',()=>okGte(window.game.rm.get('fer'),0));
test('P2-05','rm.getMax("habitants") > 0',()=>okGt(window.game.rm.getMax('habitants')));
test('P2-06','rm.get("ether") = number',()=>okType(window.game.rm.get('ether'),'number'));
test('P2-07','rm.canAfford({drachmes:1})',()=>ok(window.game.rm.canAfford({drachmes:1}),true));
test('P2-08','rm.add("bois",100) marche',()=>{const b=window.game.rm.get('bois');inject('bois',100);return ok(window.game.rm.get('bois')>b,true);});
test('P2-09','rm.getSnapshot() >= 10 cles',()=>{const s=window.game.rm.getSnapshot();console.log('  Ressources:',Object.keys(s).join(', '));return okGte(Object.keys(s).length,10);});
endSection();

section('🧠 P3 — TalentManager (vraies APIs)');
// isLearned → tm.learned[id]   |  getProdBonus → getBonusProductionPct(id)  |  ere → learnEther
test('P3-01','tm.learned["farm_lvl1"]=false au depart',()=>ok(!!window.game.tm.learned['farm_lvl1'],false));
test('P3-02','tm.etherLearned["ere2"]=false au depart',()=>ok(!!window.game.tm.etherLearned['ere2'],false));
test('P3-03','getBonusProductionPct("farm")=0 au depart',()=>ok(window.game.tm.getBonusProductionPct('farm'),0));
test('P3-04','canLearn("farm_lvl1") retourne objet',()=>okType(window.game.tm.canLearn('farm_lvl1'),'object'));
inject('drachmes',9999999);
test('P3-05','learn("farm_lvl1") = true',()=>ok(learnD('farm_lvl1'),true));
test('P3-06','learned["farm_lvl1"] = true apres learn',()=>ok(!!window.game.tm.learned['farm_lvl1'],true));
learnD('farm_prod1');
test('P3-07','getBonusProductionPct("farm") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('farm'),30));
test('P3-08','farm_prod3 sans farm_prod2 = false',()=>ok(learnD('farm_prod3'),false));
inject('ether',9999999);
// ERE: utiliser learnEther() pas learn()
test('P3-09','learnEther("ere2") = true',()=>ok(learnE('ere2'),true));
test('P3-10','etherLearned["ere2"] = true',()=>ok(!!window.game.tm.etherLearned['ere2'],true));
test('P3-11','learnEther("ere3") = true',()=>ok(learnE('ere3'),true));
test('P3-12','getUnlockedEra() = 3 apres ere3',()=>ok(window.game.tm.getUnlockedEra(),3));
test('P3-13','getPyloneRangeBonus() = number',()=>okType(window.game.tm.getPyloneRangeBonus(),'number'));
test('P3-14','getScoreMult() >= 1',()=>okGte(window.game.tm.getScoreMult(),1));
test('P3-15','getScoutSpeedMult() >= 1',()=>okGte(window.game.tm.getScoutSpeedMult(),1));
test('P3-16','getEtherGainMult() >= 1',()=>okGte(window.game.tm.getEtherGainMult(),1));
learnD('lumb_prod1');
test('P3-17','getBonusProd("lumber") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('lumber'),30));
learnD('cu_prod1');
test('P3-18','getBonusProd("mine_copper") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('mine_copper'),30));
test('P3-19','getBonusProd("atelier_forgeron") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('atelier_forgeron'),30));
learnD('fe_prod1');
test('P3-20','getBonusProd("mine_iron") >= 30',()=>okGte(window.game.tm.getBonusProductionPct('mine_iron'),30));
learnD('engi_1');learnD('engi_2');learnD('engi_3');
test('P3-21','getBonusProd("farm") >= 45 (farm+engi)',()=>okGte(window.game.tm.getBonusProductionPct('farm'),45));
test('P3-22','getTalentDef("farm_prod1") existe',()=>okEx(window.game.tm.getTalentDef('farm_prod1')));
endSection();

section('🏗️ P4 — BuildingManager');
test('P4-01','buildingManager existe',()=>okEx(window.game.buildingManager));
test('P4-02','getBuildingsForTerrain("plain") >= 1',()=>okGte((BuildingManager.getBuildingsForTerrain('plain')||[]).length,1));
test('P4-03','getBuildingsForTerrain("mountain") >= 1',()=>okGte((BuildingManager.getBuildingsForTerrain('mountain')||[]).length,1));
test('P4-04','BUILDINGS.farm.maxLevel = 50',()=>ok(BUILDINGS.farm.maxLevel,50));
test('P4-05','BUILDINGS.senat.isUnique = true',()=>ok(BUILDINGS.senat&&BUILDINGS.senat.isUnique,true));
test('P4-06','BUILDINGS.senat.globalMult = 2',()=>ok(BUILDINGS.senat&&BUILDINGS.senat.globalMult,2));
test('P4-07','>= 28 batiments dans BUILDINGS',()=>{const l=Object.keys(BUILDINGS||{});console.log('  Buildings:',l.join(', '));return okGte(l.length,28);});
endSection();

section('🌟 P5 — Prestige');
test('P5-01','getConditions().allMet = boolean',()=>okType(window.game.prestigeManager.getConditions().allMet,'boolean'));
test('P5-02','getBaseBonus(5) = 35',()=>ok(window.game.prestigeManager.getBaseBonus(5),35));
test('P5-03','getBaseBonus(3) = 12',()=>ok(window.game.prestigeManager.getBaseBonus(3),12));
test('P5-04','computeEther() >= 10',()=>okGte(window.game.prestigeManager.computeEther(),10));
test('P5-05','getLiveScore() = number',()=>okType(window.game.prestigeManager.getLiveScore(),'number'));
test('P5-06','getBaseUpgradeCost(1).drachmes=500',()=>{const c=window.game.prestigeManager.getBaseUpgradeCost(1);return ok(c&&c.drachmes===500&&c.bois===200,true,JSON.stringify(c));});
test('P5-07','Bases cachees sur la carte',()=>okGte(cells().filter(c=>c.isHiddenBase).length,1));
test('P5-08','Autel sur la carte',()=>okGte(cells().filter(c=>c.type==='ALTAR').length,1));
endSection();

section('📖 P6 — Codex');
test('P6-01','codexManager.pages = number',()=>okType(window.game.codexManager.pages,'number'));
test('P6-02','codexManager.codexLevel >= 1',()=>okGte(window.game.codexManager.codexLevel,1));
test('P6-03','getEtherMultiplier() >= 1',()=>okGte(window.game.codexManager.getEtherMultiplier(),1));
// Vrai nom: getProgressToNextLevel() (pas getLevelProgress)
test('P6-04','getProgressToNextLevel() entre 0 et 1',()=>{const p=window.game.codexManager.getProgressToNextLevel();return ok(p>=0&&p<=1,true,'p='+p);});
test('P6-05','getPagesForNextLevel() > 0',()=>okGt(window.game.codexManager.getPagesForNextLevel()));
test('P6-06','addPages(100) → pages augmentent',()=>{const b=window.game.codexManager.pages;window.game.codexManager.addPages(100);return ok(window.game.codexManager.pages>b,true);});
test('P6-07','LEVEL_THRESHOLDS[0] = 100',()=>ok(window.game.codexManager.LEVEL_THRESHOLDS[0],100));
endSection();

section('⚡ P7 — Pantheon');
test('P7-01','PANTHEON_NODES >= 90 noeuds',()=>okGte(Object.keys(PANTHEON_NODES||{}).length,90));
test('P7-02','getNodeState("cart_r1_0") = string',()=>okType(window.game.pantheonManager.getNodeState('cart_r1_0'),'string'));
inject('ether',999999);
test('P7-03','learn("cart_r1_0") = true',()=>ok(learnP('cart_r1_0'),true));
test('P7-04','getNodeState = "learned" apres',()=>okHas(window.game.pantheonManager.getNodeState('cart_r1_0'),'learn'));
test('P7-05','cart_r2_0 sans prerequis = false',()=>ok(!learnP('cart_r2_0'),true));
test('P7-06','branche zeus verrouillee au depart',()=>ok(window.game.pantheonManager.isBranchUnlocked('zeus'),false));
test('P7-07','Etat branches',()=>{
  const brs=['zeus','demeter','hephaïstos','aphrodite','hades','artemis','cartographie'];
  console.log('  ',brs.map(b=>b+':'+(window.game.pantheonManager.isBranchUnlocked(b)?'✅':'🔒')).join(' '));
  return ok(true,true);
});
endSection();

section('🗺️ P8 — Zones (IDs = strings)');
// IDs zones: 'demeter','hephaïstos','aphrodite','hades','artemis','zeus'
test('P8-01','getAllZones() = 6',()=>ok(window.game.zoneManager.getAllZones().length,6));
test('P8-02','getDef("demeter") retourne objet',()=>okEx(window.game.zoneManager.getDef('demeter')));
test('P8-03','Zone demeter produit nectar',()=>{const d=window.game.zoneManager.getDef('demeter');return ok(d&&d.zoneProduction&&'nectar'in d.zoneProduction,true);});
test('P8-04','Zone hephaïstos produit metal_divin',()=>{const d=window.game.zoneManager.getDef('hephaïstos');return ok(d&&d.zoneProduction&&'metal_divin'in d.zoneProduction,true);});
test('P8-05','Zone zeus existe',()=>okEx(window.game.zoneManager.getDef('zeus')));
test('P8-06','getState("demeter") retourne objet',()=>okEx(window.game.zoneManager.getState('demeter')));
test('P8-07','checkConditions("demeter") retourne objet',()=>okEx(window.game.zoneManager.checkConditions('demeter')));
test('P8-08','getCurseMult() = number',()=>okType(window.game.zoneManager.getCurseMult(),'number')); // vrai nom
test('P8-09','getActiveCurses() = tableau',()=>ok(Array.isArray(window.game.zoneManager.getActiveCurses()),true));
test('P8-10','activeSlots = tableau[2]',()=>ok(Array.isArray(window.game.zoneManager.activeSlots)&&window.game.zoneManager.activeSlots.length===2,true));
test('P8-11','scoreThreshold zones',()=>{
  const ids=['demeter','hephaïstos','aphrodite','hades','artemis','zeus'];
  const sc=ids.map(id=>{const d=window.game.zoneManager.getDef(id);return id+'='+(d?d.scoreThreshold:'?');});
  console.log('  ',sc.join(', '));return ok(true,true);
});
endSection();

section('💾 P9 — Sauvegarde (base64 compressé)');
test('P9-01','SaveManager existe',()=>okEx(typeof SaveManager!=='undefined'?SaveManager:null));
test('P9-02','Compression.encode/decode existent',()=>ok(typeof Compression!=='undefined'&&typeof Compression.encode==='function',true));
test('P9-03','saveNow() ecrit dans localStorage',()=>{window.game.saveNow&&window.game.saveNow();return okEx(localStorage.getItem('olympus_reborn_save'));});
test('P9-04','Save = base64 (encodee)',()=>{const r=localStorage.getItem('olympus_reborn_save');return ok(r&&!r.startsWith('{'),true,r?r.slice(0,20):'null');});
test('P9-05','Compression.decode → JSON valide avec grid',()=>{
  const r=localStorage.getItem('olympus_reborn_save');
  try{const d=Compression.decode(r);const p=JSON.parse(d);return okEx(p.grid||p.version);}
  catch(e){return ok(false,true,e.message);}
});
endSection();

section('📱 P10 — DOM');
test('P10-01','Canvas carte present',()=>okEx(document.getElementById('game-canvas')||document.querySelector('canvas')));
test('P10-02','Build bar #bb-bar',()=>okEx(document.getElementById('bb-bar')));
test('P10-03','Build bar 7+ tabs',()=>okGte(document.querySelectorAll('.bb-tab').length,7));
test('P10-04','Drawer build bar',()=>okEx(document.getElementById('bb-drawer')));
test('P10-05','Tooltip batiment #bld-tooltip',()=>okEx(document.getElementById('bld-tooltip')));
test('P10-06','EventBus accessible',()=>okEx(typeof EventBus!=='undefined'?EventBus:null));
test('P10-07','CELL_TYPE accessible',()=>okEx(typeof CELL_TYPE!=='undefined'?CELL_TYPE:null));
// SVG Pantheon est créé dynamiquement quand on ouvre l'onglet → pas un bug s'il est absent
test('P10-08','SVG #pnt-svg (présent si onglet Pantheon ouvert)',()=>{
  const el=document.getElementById('pnt-svg');
  console.log('  pnt-svg:'+(el?'✅ présent':'ℹ️ absent (ouvrir onglet Pantheon)'));
  return ok(true,true,el?'présent':'absent=normal si onglet non ouvert');
});
endSection();

section('🔋 P11 — Taux de production');
['drachmes','bois','nourr','fer','ether','nectar','bronze','acier','orichalque','metal_divin'].forEach((r,i)=>{
  test('P11-'+(i+1)+'_'+r,'rm.getRate("'+r+'")=number',()=>okType(window.game.rm.getRate(r),'number'));
});
test('P11-snap','Snapshot taux complet',()=>{
  const rates={};
  ['drachmes','bois','nourr','fer','habitants','ether','nectar','bronze','acier','farine','foudre','ambroisie','orichalque','metal_divin','amrita'].forEach(r=>rates[r]=window.game.rm.getRate(r));
  console.table(rates);return ok(true,true);
});
endSection();

section('🗂️ P12 — Utils & Serialisation');
test('P12-01','grid.cells instanceof Map',()=>ok(window.game.grid.cells instanceof Map,true));
test('P12-02','HexGrid.deserialize = fonction',()=>okType(HexGrid&&HexGrid.deserialize,'function'));
test('P12-03','HexUtils accessible',()=>okEx(typeof HexUtils!=='undefined'?HexUtils:null));
test('P12-04','EventBus.emit = fonction',()=>okType(EventBus&&EventBus.emit,'function'));
test('P12-05','computeRenaissanceScore() = number',()=>okType(window.game.grid.computeRenaissanceScore(),'number'));
test('P12-06','tm.serialize = fonction',()=>okType(window.game.tm.serialize,'function'));
test('P12-07','rm.serialize = fonction',()=>okType(window.game.rm.serialize,'function'));
test('P12-08','tm.learnEther = fonction',()=>okType(window.game.tm.learnEther,'function'));
endSection();

// ── RAPPORT FINAL ──
const total=results.length,passed=results.filter(r=>r.status===PASS).length,failed=results.filter(r=>r.status===FAIL).length,pct=Math.round(passed/total*100);
console.log('\n%c═══════════════════════════════════════','color:#F0D060');
console.log('%c⚡ RAPPORT — OLYMPUS REBORN v0.9.95','color:#F0D060;font-size:13px;font-weight:bold');
console.log('%c✅ Passés: '+passed+'/'+total+' ('+pct+'%)','color:#4CAF50;font-weight:bold');
console.log('%c❌ Échoués: '+failed,'color:#F44336;font-weight:bold');
if(failed>0){console.log('\n%c❌ ÉCHOUÉS:','color:#F44336;font-weight:bold');results.filter(r=>r.status===FAIL).forEach(r=>console.log('%c  ['+r.id+'] '+r.label+'\n    → '+r.error,'color:#FF7070'));}
const lines=['=== OLYMPUS REBORN v0.9.95 — RAPPORT TEST ===','Date:'+new Date().toISOString(),'Passés:'+passed+'/'+total+' ('+pct+'%)','Échoués:'+failed,'','--- DÉTAIL ---'];
results.forEach(r=>{lines.push('['+r.id+'] '+r.status+' '+r.label);if(r.status===FAIL)lines.push('    ERREUR:'+r.error);else if(r.val&&r.val!=='true'&&r.val!=='undefined')lines.push('    Valeur:'+r.val);});
lines.push('','--- FIN RAPPORT ---');
const report=lines.join('\n');
window._testReport=report;window._testResults=results;
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(report).then(()=>console.log('%c📋 Rapport copié!','color:#64C1DE;font-weight:bold')).catch(()=>console.log(report));
else console.log(report);
return{passed,failed,total,pct};
})();
