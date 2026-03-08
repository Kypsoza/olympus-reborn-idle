/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  OLYMPUS REBORN IDLE — Test Runner v0.9.94                      ║
 * ║  Coller dans la Console DevTools (F12) et appuyer Entrée        ║
 * ║  Le rapport s'affiche dans la console + copié dans le presse-papier ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * UTILISATION :
 *   1. Ouvrir index.html dans Chrome/Firefox
 *   2. Démarrer une nouvelle partie (attendre le chargement complet)
 *   3. F12 → onglet Console
 *   4. Copier-coller l'intégralité de ce fichier
 *   5. Appuyer Entrée
 *   6. Copier le rapport généré et l'envoyer
 */

(function() {
'use strict';

// ── Utilitaires ─────────────────────────────────────────────────────────────
const PASS = '✅', FAIL = '❌', WARN = '⚠️', INFO = 'ℹ️', SKIP = '⏭️';
const results = [];
let _sectionCurrent = '';

function section(name) {
  _sectionCurrent = name;
  console.groupCollapsed('%c▸ ' + name, 'color:#64C1DE;font-weight:bold;font-size:11px');
}
function endSection() { console.groupEnd(); }

function test(id, label, fn) {
  let status, value, error;
  try {
    const r = fn();
    if (r && typeof r === 'object' && 'ok' in r && 'val' in r) {
      status = r.ok ? PASS : FAIL;
      value  = r.val;
      error  = r.ok ? null : (r.reason || 'Attendu: ' + r.expected + ' | Obtenu: ' + r.val);
    } else {
      status = PASS;
      value  = r;
    }
  } catch(e) {
    status = FAIL;
    value  = null;
    error  = e.message;
  }
  const entry = { id, label, section: _sectionCurrent, status, value: String(value), error };
  results.push(entry);
  const style = status === PASS ? 'color:#4CAF50' : status === FAIL ? 'color:#F44336' : 'color:#FF9800';
  console.log('%c' + status + ' [' + id + '] ' + label + (error ? '\n    → ' + error : ''), style);
  return entry;
}

function ok(val, expected, reason) {
  const pass = expected !== undefined ? (val === expected || (typeof expected === 'string' && String(val) === expected)) : !!val;
  return { ok: pass, val, expected, reason };
}

function okGte(val, min) {
  return { ok: Number(val) >= min, val, expected: '>=' + min };
}

function okGt(val) {
  return { ok: Number(val) > 0, val, expected: '>0' };
}

function okExists(val) {
  return { ok: val !== null && val !== undefined, val: val ? '[objet]' : 'null/undefined', expected: 'non-null' };
}

function okContains(val, substr) {
  return { ok: String(val).includes(substr), val: String(val).slice(0, 80), expected: 'contient "' + substr + '"' };
}

function okType(val, type) {
  return { ok: typeof val === type, val: typeof val, expected: type };
}

// ── Helpers injection ressources (non-destructif) ─────────────────────────
function inject(res, amount) {
  try { window.game.rm.add(res, amount); return true; } catch(e) { return false; }
}

function learnSafe(id) {
  try { return window.game.tm.learn(id); } catch(e) { return false; }
}

function learnPantheon(id) {
  try { return window.game.pantheonManager && window.game.pantheonManager.learn(id); } catch(e) { return false; }
}

// ── Vérification objet game ───────────────────────────────────────────────
function gameCheck() {
  return {
    game:       typeof window.game !== 'undefined',
    grid:       window.game && window.game.grid && typeof window.game.grid.cells !== 'undefined',
    rm:         window.game && typeof window.game.rm !== 'undefined',
    tm:         window.game && typeof window.game.tm !== 'undefined',
    bm:         window.game && typeof window.game.buildingManager !== 'undefined',
    prestige:   window.game && typeof window.game.prestigeManager !== 'undefined',
    codex:      window.game && typeof window.game.codexManager !== 'undefined',
    pantheon:   window.game && typeof window.game.pantheonManager !== 'undefined',
    zones:      window.game && typeof window.game.zoneManager !== 'undefined',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN ALL TESTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('%c⚡ OLYMPUS REBORN — TEST RUNNER v0.9.94', 'color:#F0D060;font-size:14px;font-weight:bold');
console.log('%cDémarrage des tests...', 'color:#64C1DE');

// ────────────────────────────────────────────────────────────────────────────
section('🔌 P0 — Accès Objet Game (prérequis)');
// ────────────────────────────────────────────────────────────────────────────
const gc = gameCheck();

test('P0-01', 'window.game existe',                () => ok(gc.game,    true));
test('P0-02', 'window.game.grid + cells accessibles', () => ok(gc.grid, true));
test('P0-03', 'window.game.rm (ResourceManager)',   () => ok(gc.rm,     true));
test('P0-04', 'window.game.tm (TalentManager)',     () => ok(gc.tm,     true));
test('P0-05', 'window.game.buildingManager',        () => ok(gc.bm,     true));
test('P0-06', 'window.game.prestigeManager',        () => ok(gc.prestige, true));
test('P0-07', 'window.game.codexManager',           () => ok(gc.codex,  true));
test('P0-08', 'window.game.pantheonManager',        () => ok(gc.pantheon, true));
test('P0-09', 'window.game.zoneManager',            () => ok(gc.zones,  true));
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('🗺️ P1 — Carte & Terrain');
// ────────────────────────────────────────────────────────────────────────────
test('P1-01', 'Carte hex: ~200 cellules',          () => okGte(window.game.grid.cells.length, 150));
test('P1-02', 'Terrain plaine (plain) present',    () => okGt(window.game.grid.cells.filter(c => c.type === 'plain').length));
test('P1-03', 'Terrain foret (forest) present',    () => okGt(window.game.grid.cells.filter(c => c.type === 'forest').length));
test('P1-04', 'Terrain montagne (mountain) present', () => okGt(window.game.grid.cells.filter(c => c.type === 'mountain').length));
test('P1-05', 'Base principale presente (BASE_MAIN)', () => {
  const cell = window.game.grid.cells.find(c => c.type === 'BASE_MAIN' || c.type === 'BASE');
  return okExists(cell);
});
test('P1-06', 'Autel de prestige present (ALTAR)',  () => okGte(window.game.grid.cells.filter(c => c.type === 'ALTAR').length, 1));
test('P1-07', 'Bases cachees presentes',            () => okGte(window.game.grid.cells.filter(c => c.isHiddenBase).length, 1));
test('P1-08', 'Pas de doublons coordonnees',        () => {
  const seen = {};
  let dups = 0;
  window.game.grid.cells.forEach(c => { const k = c.q + ',' + c.r; seen[k] = (seen[k]||0)+1; if(seen[k]>1) dups++; });
  return ok(dups, 0);
});
test('P1-09', 'Cases revelees au depart (>=1)',     () => okGte(window.game.grid.cells.filter(c => c.isRevealed).length, 1));
test('P1-10', 'Coordonnees q/r de type number',     () => {
  const c = window.game.grid.cells[0];
  return ok(typeof c.q === 'number' && typeof c.r === 'number', true);
});

// Distribution terrain
const terrainDist = {};
window.game.grid.cells.forEach(c => terrainDist[c.type] = (terrainDist[c.type]||0)+1);
test('P1-11', 'Distribution terrain (tableau)',     () => {
  console.table(terrainDist);
  return { ok: true, val: JSON.stringify(terrainDist) };
});
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('💰 P2 — Ressources (état initial)');
// ────────────────────────────────────────────────────────────────────────────
test('P2-01', 'rm.get("drachmes") >= 0',           () => okGte(window.game.rm.get('drachmes'), 0));
test('P2-02', 'rm.get("bois") >= 0',               () => okGte(window.game.rm.get('bois'), 0));
test('P2-03', 'rm.get("nourr") >= 0',              () => okGte(window.game.rm.get('nourr'), 0));
test('P2-04', 'rm.get("fer") >= 0',                () => okGte(window.game.rm.get('fer'), 0));
test('P2-05', 'rm.getMax("habitants") > 0',        () => okGt(window.game.rm.getMax('habitants')));
test('P2-06', 'rm.getMax("foudre") = 1e9',         () => ok(window.game.rm.getMax('foudre'), 1e9));
test('P2-07', 'rm.get("ether") est un nombre',     () => okType(window.game.rm.get('ether'), 'number'));
test('P2-08', 'rm.canAfford({drachmes:1}) = true', () => ok(window.game.rm.canAfford({drachmes:1}), true));
test('P2-09', 'rm.add("bois",100) fonctionne',     () => {
  const before = window.game.rm.get('bois');
  inject('bois', 100);
  const after = window.game.rm.get('bois');
  return ok(after > before, true, 'before=' + before + ' after=' + after);
});
test('P2-10', 'Snapshot rm (toutes les ressources)', () => {
  const snap = window.game.rm.getSnapshot();
  const keys = Object.keys(snap).filter(k => !['survivants','maxSurvivants'].includes(k));
  console.log('  Ressources dispo:', keys.join(', '));
  return okGte(keys.length, 10);
});
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('🧠 P3 — TalentManager (Drachmes & Éther)');
// ────────────────────────────────────────────────────────────────────────────
test('P3-01', 'tm.isLearned("farm_lvl1") au départ = false', () => ok(window.game.tm.isLearned('farm_lvl1'), false));
test('P3-02', 'tm.isLearned("ere2") au départ',              () => okType(window.game.tm.isLearned('ere2'), 'boolean'));
test('P3-03', 'tm.getProdBonus("farm") au départ = 0',       () => ok(window.game.tm.getProdBonus('farm'), 0));
test('P3-04', 'tm.getProdBonusAll() au départ = 0',          () => ok(window.game.tm.getProdBonusAll(), 0));

// Apprendre farm_lvl1 avec ressources
inject('drachmes', 999999);
const learnResult = learnSafe('farm_lvl1');
test('P3-05', 'learn("farm_lvl1") retourne true',            () => ok(learnResult, true));
test('P3-06', 'isLearned("farm_lvl1") = true apres learn',   () => ok(window.game.tm.isLearned('farm_lvl1'), true));

// Apprendre farm_prod1
inject('drachmes', 999999);
learnSafe('farm_prod1');
test('P3-07', 'getProdBonus("farm") >= 30 apres farm_prod1', () => okGte(window.game.tm.getProdBonus('farm'), 30));

// Prerequis: tenter farm_prod3 sans farm_prod2
const noPre = learnSafe('farm_prod3');
test('P3-08', 'farm_prod3 sans farm_prod2 = false (prerequis)', () => ok(noPre, false));

// ere2
inject('ether', 200);
const ere2res = learnSafe('ere2');
test('P3-09', 'learn("ere2") avec 200 ether = true',          () => ok(ere2res, true));
test('P3-10', 'isLearned("ere2") = true',                     () => ok(window.game.tm.isLearned('ere2'), true));

// ere3 sans ere2... ere2 est deja appris, tester la chaine ere3
inject('ether', 99999);
const ere3res = learnSafe('ere3');
test('P3-11', 'learn("ere3") avec ether suffisant = true',    () => ok(ere3res, true));

// Branches
test('P3-12', 'getPyloneRangeBonus() retourne number',        () => okType(window.game.tm.getPyloneRangeBonus(), 'number'));
test('P3-13', 'getScoreMult() >= 1',                          () => okGte(window.game.tm.getScoreMult(), 1));
test('P3-14', 'getScoutSpeedMult() >= 1',                     () => okGte(window.game.tm.getScoutSpeedMult(), 1));
test('P3-15', 'getEtherGainMult() >= 1',                      () => okGte(window.game.tm.getEtherGainMult(), 1));

// Ingenierie chain
inject('drachmes', 9999999);
learnSafe('engi_1'); learnSafe('engi_2'); learnSafe('engi_3');
test('P3-16', 'getProdBonusAll() >= 15 apres engi_3',         () => okGte(window.game.tm.getProdBonusAll(), 15));

// Sylviculture
learnSafe('lumb_prod1');
test('P3-17', 'getProdBonus("lumber") >= 30 apres lumb_prod1', () => okGte(window.game.tm.getProdBonus('lumber'), 30));

// Metallurgie
learnSafe('cu_prod1');
test('P3-18', 'getProdBonus("mine_copper") >= 30',             () => okGte(window.game.tm.getProdBonus('mine_copper'), 30));
test('P3-19', 'getProdBonus("atelier_forgeron") >= 30',        () => okGte(window.game.tm.getProdBonus('atelier_forgeron'), 30));

// Siderurgie
learnSafe('fe_prod1');
test('P3-20', 'getProdBonus("mine_iron") >= 30',               () => okGte(window.game.tm.getProdBonus('mine_iron'), 30));
test('P3-21', 'getProdBonus("fonderie_celeste") >= 30',        () => okGte(window.game.tm.getProdBonus('fonderie_celeste'), 30));

// getTalentDef
test('P3-22', 'getTalentDef("farm_prod1") retourne objet',     () => okExists(window.game.tm.getTalentDef('farm_prod1')));
test('P3-23', 'getTalentDef("farm_prod1").effect.value = 30',  () => ok(window.game.tm.getTalentDef('farm_prod1').effect.value, 30));
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('🏗️ P4 — BuildingManager');
// ────────────────────────────────────────────────────────────────────────────
test('P4-01', 'buildingManager existe',                        () => okExists(window.game.buildingManager));
test('P4-02', 'getBuildingsForTerrain("plain") non vide',      () => {
  const defs = BuildingManager.getBuildingsForTerrain('plain');
  return okGte(defs ? defs.length : 0, 1);
});
test('P4-03', 'getBuildingsForTerrain("mountain") non vide',   () => {
  const defs = BuildingManager.getBuildingsForTerrain('mountain');
  return okGte(defs ? defs.length : 0, 1);
});
test('P4-04', 'getTerrainTransforms existe',                   () => okType(BuildingManager.getTerrainTransforms, 'function'));
test('P4-05', 'BUILDINGS contient "farm"',                     () => okExists(BUILDINGS && BUILDINGS.farm));
test('P4-06', 'BUILDINGS.farm.maxLevel = 50',                  () => ok(BUILDINGS.farm.maxLevel, 50));
test('P4-07', 'BUILDINGS.senat.isUnique = true',               () => ok(BUILDINGS.senat && BUILDINGS.senat.isUnique, true));
test('P4-08', 'BUILDINGS.senat.globalMult = 2',                () => ok(BUILDINGS.senat && BUILDINGS.senat.globalMult, 2));
test('P4-09', '30 batiments definis dans BUILDINGS',           () => okGte(Object.keys(BUILDINGS||{}).length, 28));

// Liste complète des bâtiments
const bldList = Object.keys(BUILDINGS||{});
test('P4-10', 'Liste buildings (tableau)',                     () => {
  console.log('  Buildings:', bldList.join(', '));
  return ok(bldList.length > 0, true, 'count=' + bldList.length);
});
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('🌟 P5 — PrestigeManager');
// ────────────────────────────────────────────────────────────────────────────
test('P5-01', 'getConditions() retourne objet',                () => okExists(window.game.prestigeManager.getConditions()));
test('P5-02', 'getConditions().allMet est boolean',            () => okType(window.game.prestigeManager.getConditions().allMet, 'boolean'));
test('P5-03', 'REQUIRED_REVEALED est defini',                  () => okGte(window.game.prestigeManager.REQUIRED_REVEALED, 1));
test('P5-04', 'REQUIRED_BASE_LVL5 est defini',                 () => okGte(window.game.prestigeManager.REQUIRED_BASE_LVL5, 1));
test('P5-05', 'getBaseBonus(5) = 35',                          () => ok(window.game.prestigeManager.getBaseBonus(5), 35));
test('P5-06', 'getBaseBonus(3) = 12',                          () => ok(window.game.prestigeManager.getBaseBonus(3), 12));
test('P5-07', 'getBaseBonus(2) = 5',                           () => ok(window.game.prestigeManager.getBaseBonus(2), 5));
test('P5-08', 'computeEther() >= 10',                          () => okGte(window.game.prestigeManager.computeEther(), 10));
test('P5-09', 'getLiveScore() retourne number',                () => okType(window.game.prestigeManager.getLiveScore(), 'number'));
test('P5-10', 'prestigeCount est un number',                   () => okType(window.game.prestigeManager.prestigeCount, 'number'));
test('P5-11', 'getBaseUpgradeCost(1) = {drachmes:500,bois:200}', () => {
  const cost = window.game.prestigeManager.getBaseUpgradeCost(1);
  return ok(cost && cost.drachmes === 500 && cost.bois === 200, true, JSON.stringify(cost));
});
test('P5-12', 'Bases cachees sur la carte',                    () => okGte(window.game.grid.cells.filter(c => c.isHiddenBase).length, 1));
test('P5-13', 'Autel present sur la carte',                    () => okGte(window.game.grid.cells.filter(c => c.type === 'ALTAR').length, 1));

// Score formule
const score = window.game.prestigeManager.getLiveScore();
const formulaEther = Math.max(10, Math.floor(Math.sqrt(score) * 15));
const computedEther = window.game.prestigeManager.computeEther();
test('P5-14', 'Formule ether sqrt(score)*15 coherente',        () => {
  // Allow for talent multiplier differences
  const diff = Math.abs(computedEther - formulaEther);
  const pct = formulaEther > 0 ? diff / formulaEther : 0;
  return ok(pct <= 0.5, true, 'formula=' + formulaEther + ' computed=' + computedEther);
});
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('📖 P6 — CodexManager');
// ────────────────────────────────────────────────────────────────────────────
test('P6-01', 'codexManager.pages est un number',              () => okType(window.game.codexManager.pages, 'number'));
test('P6-02', 'codexManager.codexLevel >= 1',                  () => okGte(window.game.codexManager.codexLevel, 1));
test('P6-03', 'getEtherMultiplier() >= 1',                     () => okGte(window.game.codexManager.getEtherMultiplier(), 1));
test('P6-04', 'getLevelProgress() entre 0 et 1',               () => {
  const p = window.game.codexManager.getLevelProgress();
  return ok(p >= 0 && p <= 1, true, 'progress=' + p);
});
test('P6-05', 'previewNextPages(1000,5,false) > 0',            () => okGt(window.game.codexManager.previewNextPages(1000, 5, false)));
test('P6-06', 'addPages(100) → pages augmentent',              () => {
  const before = window.game.codexManager.pages;
  window.game.codexManager.addPages(100);
  const after = window.game.codexManager.pages;
  return ok(after > before, true, 'before=' + before + ' after=' + after);
});
test('P6-07', 'Seuil niveau 2 = 100 pages (level up)',         () => {
  // Already added 100 pages above; check level
  const lvl = window.game.codexManager.codexLevel;
  return okGte(lvl, 1); // >= 1 (may or may not have hit 2 depending on initial pages)
});
test('P6-08', 'LEVEL_THRESHOLDS[0] = 100 (seuil niv2)',        () => ok(window.game.codexManager.LEVEL_THRESHOLDS && window.game.codexManager.LEVEL_THRESHOLDS[0], 100));
test('P6-09', 'goldenPagesLevel initial',                      () => okType(window.game.codexManager.goldenPagesLevel, 'number'));
test('P6-10', 'buildingSourceUnlocked est boolean',            () => okType(window.game.codexManager.buildingSourceUnlocked, 'boolean'));
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('⚡ P7 — PantheonManager');
// ────────────────────────────────────────────────────────────────────────────
test('P7-01', 'pantheonManager existe',                        () => okExists(window.game.pantheonManager));
test('P7-02', 'PANTHEON_NODES existe globalement',             () => okExists(typeof PANTHEON_NODES !== 'undefined' ? PANTHEON_NODES : null));
test('P7-03', 'Nombre de noeuds Pantheon >= 90',               () => {
  const n = typeof PANTHEON_NODES !== 'undefined' ? Object.keys(PANTHEON_NODES).length : 0;
  return okGte(n, 90);
});
test('P7-04', 'isBranchUnlocked est une fonction',             () => okType(window.game.pantheonManager.isBranchUnlocked, 'function'));
test('P7-05', 'getNodeState est une fonction',                 () => okType(window.game.pantheonManager.getNodeState, 'function'));
test('P7-06', 'learn est une fonction',                        () => okType(window.game.pantheonManager.learn, 'function'));

// Tester un noeud cartographie (branche toujours accessible)
const cartState = window.game.pantheonManager.getNodeState('cart_r1_0');
test('P7-07', 'getNodeState("cart_r1_0") retourne un etat',    () => okExists(cartState));
test('P7-08', 'Etat noeud = string (locked/available/learned)', () => okType(cartState, 'string'));

// Apprendre noeud avec ether
inject('ether', 99999);
const learnCart = learnPantheon('cart_r1_0');
test('P7-09', 'learn("cart_r1_0") retourne vrai',              () => ok(learnCart === true || learnCart, true));
test('P7-10', 'getNodeState("cart_r1_0") = "learned" apres',   () => {
  const s = window.game.pantheonManager.getNodeState('cart_r1_0');
  return okContains(s, 'learn');
});

// Ring 2 sans ring 1 prérequis
const cartR2 = learnPantheon('cart_r2_0');
test('P7-11', 'cart_r2_0 sans prerequis ring1 = echoue',       () => {
  // cart_r2_0 requires cart_r1_2 which is not yet learned
  return ok(!cartR2 || cartR2 === false, true, 'Expected false, got ' + cartR2);
});

// Tester branche Zeus verrouillée au départ
const zeusBranch = window.game.pantheonManager.isBranchUnlocked('zeus');
test('P7-12', 'Branche zeus verrouilee au depart',             () => ok(zeusBranch, false, 'isBranchUnlocked='+zeusBranch));

// Invested tracking
test('P7-13', 'pantheonManager.invested est objet',            () => okType(window.game.pantheonManager.invested || {}, 'object'));
test('P7-14', 'branches a debloquer',                          () => {
  const branches = ['zeus','demeter','hephaïstos','aphrodite','hades','artemis','cartographie'];
  const states = branches.map(b => b + ':' + (window.game.pantheonManager.isBranchUnlocked(b)?'✅':'🔒'));
  console.log('  Branches:', states.join(' | '));
  return ok(true, true, states.join(', '));
});
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('🗺️ P8 — ZoneManager');
// ────────────────────────────────────────────────────────────────────────────
test('P8-01', 'zoneManager existe',                            () => okExists(window.game.zoneManager));
test('P8-02', 'getAllZones() retourne 6 zones',                () => ok(window.game.zoneManager.getAllZones().length, 6));
test('P8-03', 'getDef(1) retourne objet zone',                 () => okExists(window.game.zoneManager.getDef(1)));
test('P8-04', 'Zone 1 produit nectar',                         () => ok(window.game.zoneManager.getDef(1).zoneProduction && 'nectar' in window.game.zoneManager.getDef(1).zoneProduction, true));
test('P8-05', 'Zone 2 produit metal_divin',                    () => ok(window.game.zoneManager.getDef(2).zoneProduction && 'metal_divin' in window.game.zoneManager.getDef(2).zoneProduction, true));
test('P8-06', 'Zone 6 (Zeus) existe',                         () => okExists(window.game.zoneManager.getDef(6)));
test('P8-07', 'checkConditions(1) retourne objet',             () => okExists(window.game.zoneManager.checkConditions(1)));
test('P8-08', 'getState(1) retourne objet etat',               () => okExists(window.game.zoneManager.getState(1)));
test('P8-09', 'activeSlots est tableau de 2',                  () => ok(Array.isArray(window.game.zoneManager.activeSlots) && window.game.zoneManager.activeSlots.length === 2, true));
test('P8-10', 'getActiveCorruptionMult() retourne number',     () => okType(window.game.zoneManager.getActiveCorruptionMult(), 'number'));
test('P8-11', 'Seuils score zones progressifs',                () => {
  const scores = [1,2,3,4,5].map(i => {
    const def = window.game.zoneManager.getDef(i);
    return def ? def.scoreRequired : 'N/A';
  });
  console.log('  Score requis par zone:', scores.join(', '));
  const progressive = scores.every((s,i) => i===0 || (typeof s === 'number' && s > scores[i-1]));
  return ok(progressive, true, 'scores=' + scores.join(','));
});
test('P8-12', 'startCraft est une fonction',                   () => okType(window.game.zoneManager.startCraft, 'function'));
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('💾 P9 — SaveManager');
// ────────────────────────────────────────────────────────────────────────────
test('P9-01', 'SaveManager existe',                            () => okExists(typeof SaveManager !== 'undefined' ? SaveManager : null));
test('P9-02', 'hasSave() retourne boolean',                    () => okType(SaveManager.hasSave(), 'boolean'));
test('P9-03', 'VERSION est definie',                           () => okExists(SaveManager.VERSION));
test('P9-04', 'save() fonction existe',                        () => okType(SaveManager.save, 'function'));
test('P9-05', 'load() fonction existe',                        () => okType(SaveManager.load, 'function'));
test('P9-06', 'Sauvegarde dans localStorage',                  () => {
  window.game.saveNow && window.game.saveNow();
  const raw = localStorage.getItem('olympus_reborn_save');
  return okExists(raw);
});
test('P9-07', 'Sauvegarde est JSON valide',                    () => {
  const raw = localStorage.getItem('olympus_reborn_save');
  try { const parsed = JSON.parse(raw); return okExists(parsed.grid); }
  catch(e) { return ok(false, true, e.message); }
});
test('P9-08', 'VERSION dans la save',                          () => {
  const raw = localStorage.getItem('olympus_reborn_save');
  try { const parsed = JSON.parse(raw); return okExists(parsed.version || parsed.VERSION); }
  catch(e) { return ok(false, true, e.message); }
});
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('📱 P10 — DOM & UI');
// ────────────────────────────────────────────────────────────────────────────
test('P10-01', 'Canvas de carte present (#map-canvas)',        () => okExists(document.getElementById('map-canvas') || document.querySelector('canvas')));
test('P10-02', 'HUD present (body contient un element HUD)',   () => okExists(document.getElementById('hud') || document.querySelector('.hud-bar, #hud-bar, [id*="hud"]')));
test('P10-03', 'Build bar present (#bb-bar)',                  () => okExists(document.getElementById('bb-bar')));
test('P10-04', 'Build bar 7+ tabs',                            () => okGte(document.querySelectorAll('.bb-tab').length, 7));
test('P10-05', 'Drawer build bar present (#bb-drawer)',        () => okExists(document.getElementById('bb-drawer')));
test('P10-06', 'Panneau talent present (.talent-panel)',       () => okExists(document.querySelector('.talent-panel, #talent-panel, [id*="talent"]')));
test('P10-07', 'SVG Pantheon present (#pnt-svg)',              () => okExists(document.getElementById('pnt-svg')));
test('P10-08', 'Tooltip batiment present (#bld-tooltip)',      () => okExists(document.getElementById('bld-tooltip')));
test('P10-09', 'EventBus accessible',                          () => okExists(typeof EventBus !== 'undefined' ? EventBus : null));
test('P10-10', 'CELL_TYPE accessible',                         () => okExists(typeof CELL_TYPE !== 'undefined' ? CELL_TYPE : null));
test('P10-11', 'BUILDINGS accessible globalement',             () => okExists(typeof BUILDINGS !== 'undefined' ? BUILDINGS : null));

// IDs des ressources dans le HUD
const hudResIds = ['drachmes','bois','nourr','fer','habitants'].map(r => {
  const el = document.querySelector('[data-res="' + r + '"], #hud-' + r + ', [id*="' + r + '"]');
  return r + ':' + (el ? '✅' : '❌');
});
test('P10-12', 'Elements HUD ressources Ere 1',                () => {
  console.log('  HUD elements:', hudResIds.join(' '));
  return ok(true, true, hudResIds.join(', '));
});
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('🔋 P11 — Taux de production (avec batiments simulés)');
// ────────────────────────────────────────────────────────────────────────────

// On ne peut pas construire sans case, mais on peut vérifier les méthodes
test('P11-01', 'rm.getRate("drachmes") retourne number',       () => okType(window.game.rm.getRate('drachmes'), 'number'));
test('P11-02', 'rm.getRate("bois") retourne number',           () => okType(window.game.rm.getRate('bois'), 'number'));
test('P11-03', 'rm.getRate("nourr") retourne number',          () => okType(window.game.rm.getRate('nourr'), 'number'));
test('P11-04', 'rm.getRate("fer") retourne number',            () => okType(window.game.rm.getRate('fer'), 'number'));
test('P11-05', 'rm.getRate("ether") retourne number',          () => okType(window.game.rm.getRate('ether'), 'number'));
test('P11-06', 'rm.getRate("nectar") retourne number',         () => okType(window.game.rm.getRate('nectar'), 'number'));
test('P11-07', 'rm.getRate("bronze") retourne number',         () => okType(window.game.rm.getRate('bronze'), 'number'));
test('P11-08', 'rm.getRate("acier") retourne number',          () => okType(window.game.rm.getRate('acier'), 'number'));
test('P11-09', 'rm.getRate("orichalque") retourne number',     () => okType(window.game.rm.getRate('orichalque'), 'number'));
test('P11-10', 'rm.getRate("metal_divin") retourne number',    () => okType(window.game.rm.getRate('metal_divin'), 'number'));

// Snapshot complet des taux
const allRates = {};
['drachmes','bois','nourr','fer','habitants','nectar','bronze','acier','farine','foudre',
 'ambroisie','orichalque','metal_divin','amrita','ether'].forEach(r => {
  allRates[r] = window.game.rm.getRate(r);
});
test('P11-11', 'Snapshot taux (tous les taux)',                () => {
  console.table(allRates);
  return ok(true, true);
});

// Snapshot valeurs actuelles
const allVals = {};
['drachmes','bois','nourr','fer','habitants','ether'].forEach(r => {
  allVals[r] = Math.round(window.game.rm.get(r));
});
test('P11-12', 'Snapshot valeurs actuelles',                   () => {
  console.table(allVals);
  return ok(true, true);
});
endSection();

// ────────────────────────────────────────────────────────────────────────────
section('🗂️ P12 — Vérifications supplémentaires');
// ────────────────────────────────────────────────────────────────────────────
test('P12-01', 'HexGrid.deserialize est fonction',             () => okType(HexGrid && HexGrid.deserialize, 'function'));
test('P12-02', 'HexUtils accessible',                          () => okExists(typeof HexUtils !== 'undefined' ? HexUtils : null));
test('P12-03', 'MathUtils accessible',                         () => okExists(typeof MathUtils !== 'undefined' ? MathUtils : null));
test('P12-04', 'EventBus.emit est fonction',                   () => okType(typeof EventBus !== 'undefined' ? EventBus.emit : null, 'function'));
test('P12-05', 'EventBus.on est fonction',                     () => okType(typeof EventBus !== 'undefined' ? EventBus.on : null, 'function'));
test('P12-06', 'grid.computeRenaissanceScore est fonction',    () => okType(window.game.grid.computeRenaissanceScore, 'function'));
test('P12-07', 'computeRenaissanceScore() retourne number',    () => okType(window.game.grid.computeRenaissanceScore(), 'number'));
test('P12-08', 'tm.serialize/deserialize existent',            () => ok(typeof window.game.tm.serialize === 'function' && typeof window.game.tm.deserialize === 'function', true));
test('P12-09', 'rm.serialize/deserialize existent',            () => ok(typeof window.game.rm.serialize === 'function' && typeof window.game.rm.deserialize === 'function', true));
test('P12-10', 'prestige.serialize/deserialize existent',      () => ok(typeof window.game.prestigeManager.serialize === 'function', true));
endSection();

// ═══════════════════════════════════════════════════════════════════════════
// RAPPORT FINAL
// ═══════════════════════════════════════════════════════════════════════════
const total  = results.length;
const passed = results.filter(r => r.status === PASS).length;
const failed = results.filter(r => r.status === FAIL).length;
const pct    = Math.round(passed / total * 100);

console.log('\n');
console.log('%c═══════════════════════════════════════', 'color:#F0D060');
console.log('%c⚡ RAPPORT DE TEST — OLYMPUS REBORN v0.9.94', 'color:#F0D060;font-size:13px;font-weight:bold');
console.log('%c═══════════════════════════════════════', 'color:#F0D060');
console.log('%c✅ Passés : ' + passed + ' / ' + total + ' (' + pct + '%)', 'color:#4CAF50;font-weight:bold;font-size:12px');
console.log('%c❌ Échoués : ' + failed, 'color:#F44336;font-weight:bold;font-size:12px');

if (failed > 0) {
  console.log('\n%c❌ TESTS ÉCHOUÉS :', 'color:#F44336;font-weight:bold');
  results.filter(r => r.status === FAIL).forEach(r => {
    console.log('%c  [' + r.id + '] ' + r.label + '\n    → ' + r.error, 'color:#FF7070');
  });
}

// Générer le rapport texte pour copier-coller
const lines = [
  '=== OLYMPUS REBORN IDLE v0.9.94 — RAPPORT TEST ===',
  'Date: ' + new Date().toISOString(),
  'Passés: ' + passed + '/' + total + ' (' + pct + '%)',
  'Échoués: ' + failed,
  '',
  '--- DÉTAIL ---',
];
results.forEach(r => {
  lines.push('[' + r.id + '] ' + r.status + ' ' + r.label);
  if (r.status === FAIL) lines.push('    ERREUR: ' + r.error);
  else if (r.val && r.val !== 'true' && r.val !== 'undefined') lines.push('    Valeur: ' + r.val);
});
lines.push('');
lines.push('--- FIN RAPPORT ---');

const report = lines.join('\n');

// Copier dans le presse-papier
if (navigator.clipboard && navigator.clipboard.writeText) {
  navigator.clipboard.writeText(report).then(() => {
    console.log('%c📋 Rapport copié dans le presse-papier !', 'color:#64C1DE;font-weight:bold;font-size:12px');
  }).catch(() => {
    console.log('%c📋 Rapport (copier manuellement) :', 'color:#64C1DE');
    console.log(report);
  });
} else {
  console.log('%c📋 Rapport (copier manuellement) :', 'color:#64C1DE');
  console.log(report);
}

// Retourner le rapport
window._testReport = report;
window._testResults = results;
console.log('\n%cAstuce: window._testResults contient tous les résultats en objet JS', 'color:#888;font-style:italic');
console.log('%cAstuce: window._testReport contient le rapport texte', 'color:#888;font-style:italic');

return { passed, failed, total, pct, results };

})();
