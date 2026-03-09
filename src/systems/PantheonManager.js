/* ═══════════════════════════════════════════════════════════
   PantheonManager.js — v1.0.0
   6 dieux : Zeus, Poséidon, Hadès, Athéna, Apollon, Arès
   Structure : arbre binaire 1-2-4-8 = 15 nœuds par dieu
   Chaque nœud : 5 rangs séquentiels (invested[id] = 0..5)
   Déverrouillage : compléter la zone du dieu correspondant
   ═══════════════════════════════════════════════════════════ */

// ── Branches ────────────────────────────────────────────────
const PANTHEON_BRANCHES = [
  { id:'zeus',     label:'Zeus',     icon:'⚡',  color:'#ffd54f', angle:0,   zoneId:'zeus',
    desc:'Roi des dieux, maître du ciel et de la foudre.' },
  { id:'poseidon', label:'Poséidon', icon:'🌊', color:'#29b6f6', angle:60,  zoneId:'poseidon',
    desc:'Dieu de la mer, des océans et des tremblements de terre.' },
  { id:'hades',    label:'Hadès',    icon:'💀', color:'#7e57c2', angle:120, zoneId:'hades',
    desc:'Dieu des enfers et souverain du royaume des morts.' },
  { id:'athena',   label:'Athéna',   icon:'🦉', color:'#80cbc4', angle:180, zoneId:'athena',
    desc:'Déesse de la sagesse, de la stratégie militaire et de la justice.' },
  { id:'apollon',  label:'Apollon',  icon:'☀️', color:'#ffb300', angle:240, zoneId:'apollon',
    desc:'Dieu du soleil, de la musique, de la médecine et de la prophétie.' },
  { id:'ares',     label:'Arès',     icon:'⚔️',  color:'#ef5350', angle:300, zoneId:'ares',
    desc:'Dieu de la guerre et de la violence des combats.' },
];

// ── Helper constructeur de nœud ──────────────────────────────
function _n(id, branch, level, slot, parent, baseCost, ranks) {
  return { id, branch, level, slot, parent: parent || null, baseCost, maxRank: ranks.length, ranks };
}

// ══════════════════════════════════════════════════════════════
// ZEUS ⚡  foudre · score · production globale · prestige
// ══════════════════════════════════════════════════════════════
const ZEUS_NODES = {
  zeus_L1_0: _n('zeus_L1_0','zeus',1,0,null,50,[
    {name:'Présence Olympienne I',  desc:'+5% production globale',              effect:{type:'prodBonusAll',value:5}},
    {name:'Présence Olympienne II', desc:'+5% production globale',              effect:{type:'prodBonusAll',value:5}},
    {name:'Aura de Zeus I',         desc:'+8% score de Renaissance',            effect:{type:'scoreMultPct',value:8}},
    {name:'Aura de Zeus II',        desc:'+12% score de Renaissance',           effect:{type:'scoreMultPct',value:12}},
    {name:'Majesté Divine',         desc:'+20% production, +15% score',         effect:{type:'prodBonusAll',value:20}},
  ]),
  zeus_L2_0: _n('zeus_L2_0','zeus',2,0,'zeus_L1_0',100,[
    {name:'Foudre I',           desc:'+15% prod Foudre & Pylônes',              effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:15}},
    {name:'Foudre II',          desc:'+15% prod Foudre & Pylônes',              effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:15}},
    {name:'Orage Sacré',        desc:'+10% production globale',                 effect:{type:'prodBonusAll',value:10}},
    {name:'Tempête Divine',     desc:'+5% gain d\'Éther',                       effect:{type:'etherGainPct',value:5}},
    {name:'Maître de l\'Orage', desc:'+25% prod Pylônes, +15% prod globale',    effect:{type:'prodBonusAll',value:15}},
  ]),
  zeus_L2_1: _n('zeus_L2_1','zeus',2,1,'zeus_L1_0',100,[
    {name:'Gouvernance I',    desc:'-10% coût des bâtiments',                   effect:{type:'buildCostPct',value:-10}},
    {name:'Gouvernance II',   desc:'-10% coût des bâtiments',                   effect:{type:'buildCostPct',value:-10}},
    {name:'Loi Olympienne',   desc:'+15% score de Renaissance',                 effect:{type:'scoreMultPct',value:15}},
    {name:'Décret Divin',     desc:'+10% production globale',                   effect:{type:'prodBonusAll',value:10}},
    {name:'Roi des Dieux',    desc:'-20% coûts bâtiments, +20% score',          effect:{type:'buildCostPct',value:-20}},
  ]),
  zeus_L3_0: _n('zeus_L3_0','zeus',3,0,'zeus_L2_0',180,[
    {name:'Éclair Persistant I',  desc:'+20% prod Pylônes',                     effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:20}},
    {name:'Éclair Persistant II', desc:'+20% prod Pylônes',                     effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:20}},
    {name:'Conducteur Divin',     desc:'+2 portée des Pylônes',                 effect:{type:'haloRange',value:2}},
    {name:'Réseau Électrique',    desc:'+10% production globale',               effect:{type:'prodBonusAll',value:10}},
    {name:'Tonnerre Éternel',     desc:'+50% prod Pylônes, +3 portée',          effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:50}},
  ]),
  zeus_L3_1: _n('zeus_L3_1','zeus',3,1,'zeus_L2_0',180,[
    {name:'Prestige Olympien I',  desc:'+10% gain Éther',                       effect:{type:'etherGainPct',value:10}},
    {name:'Prestige Olympien II', desc:'+10% gain Éther',                       effect:{type:'etherGainPct',value:10}},
    {name:'Mémoire Divine I',     desc:'+8% Pages Codex bonus',                 effect:{type:'bonusPages',value:8}},
    {name:'Mémoire Divine II',    desc:'+12% Pages Codex bonus',                effect:{type:'bonusPages',value:12}},
    {name:'Gloire Céleste',       desc:'+25% Éther, +20 Pages Codex',           effect:{type:'etherGainPct',value:25}},
  ]),
  zeus_L3_2: _n('zeus_L3_2','zeus',3,2,'zeus_L2_1',180,[
    {name:'Architecte Divin I',  desc:'-8% coût bâtiments',                     effect:{type:'buildCostPct',value:-8}},
    {name:'Architecte Divin II', desc:'-8% coût bâtiments',                     effect:{type:'buildCostPct',value:-8}},
    {name:'Efficacité Sacrée',   desc:'+2 niveaux max tous bâtiments',           effect:{type:'maxLevelBonusAll',value:2}},
    {name:'Prospérité Olympe',   desc:'+15% score Renaissance',                 effect:{type:'scoreMultPct',value:15}},
    {name:'Ordre Céleste',       desc:'-20% coûts, +2 niveaux max',             effect:{type:'maxLevelBonusAll',value:2}},
  ]),
  zeus_L3_3: _n('zeus_L3_3','zeus',3,3,'zeus_L2_1',180,[
    {name:'Aigle Sacré I',  desc:'+15% vitesse Éclaireurs',                     effect:{type:'scoutSpeedPct',value:15}},
    {name:'Aigle Sacré II', desc:'+15% vitesse Éclaireurs',                     effect:{type:'scoutSpeedPct',value:15}},
    {name:'Vue Perçante',   desc:'+2 portée révélation',                        effect:{type:'haloRange',value:2}},
    {name:'Messager Ailé',  desc:'+1 slot Éclaireur',                           effect:{type:'scoutSlots',value:1}},
    {name:'Légion Olympe',  desc:'+30% vitesse, +1 slot Éclaireur',             effect:{type:'scoutSpeedPct',value:30}},
  ]),
  zeus_L4_0: _n('zeus_L4_0','zeus',4,0,'zeus_L3_0',280,[
    {name:'Apothéose I',   desc:'+15% production globale',                      effect:{type:'prodBonusAll',value:15}},
    {name:'Apothéose II',  desc:'+15% production globale',                      effect:{type:'prodBonusAll',value:15}},
    {name:'Apothéose III', desc:'+10% score Renaissance',                       effect:{type:'scoreMultPct',value:10}},
    {name:'Apothéose IV',  desc:'+10% gain Éther',                              effect:{type:'etherGainPct',value:10}},
    {name:'Transcendance', desc:'+30% prod globale, +20% score',                effect:{type:'prodBonusAll',value:30}},
  ]),
  zeus_L4_1: _n('zeus_L4_1','zeus',4,1,'zeus_L3_0',280,[
    {name:'Tonnerre Absolu I',  desc:'+30% prod Pylônes',                       effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:30}},
    {name:'Tonnerre Absolu II', desc:'+30% prod Pylônes',                       effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:30}},
    {name:'Déflagration',       desc:'+20% score Renaissance',                  effect:{type:'scoreMultPct',value:20}},
    {name:'Coup de Foudre',     desc:'+4 portée Pylônes',                       effect:{type:'haloRange',value:4}},
    {name:'Maître du Ciel',     desc:'+60% Pylônes, +4 portée',                 effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:60}},
  ]),
  zeus_L4_2: _n('zeus_L4_2','zeus',4,2,'zeus_L3_1',280,[
    {name:'Roi Éternel I',   desc:'+15% gain Éther',                            effect:{type:'etherGainPct',value:15}},
    {name:'Roi Éternel II',  desc:'+15% gain Éther',                            effect:{type:'etherGainPct',value:15}},
    {name:'Héritage Sacré',  desc:'+20 Pages Codex bonus',                      effect:{type:'bonusPages',value:20}},
    {name:'Couronne d\'Or',  desc:'+25% score Renaissance',                     effect:{type:'scoreMultPct',value:25}},
    {name:'Zeus Omnipotent', desc:'+35% Éther, +30% score',                     effect:{type:'etherGainPct',value:35}},
  ]),
  zeus_L4_3: _n('zeus_L4_3','zeus',4,3,'zeus_L3_1',280,[
    {name:'Éclairs en Chaîne I',  desc:'+10% gain Éther',                       effect:{type:'etherGainPct',value:10}},
    {name:'Éclairs en Chaîne II', desc:'+10% gain Éther',                       effect:{type:'etherGainPct',value:10}},
    {name:'Foudre Perpétuelle',   desc:'+20% prod Pylônes',                     effect:{type:'prodBonus',building:'pylone,noeud_olympien',value:20}},
    {name:'Cycle Électrique',     desc:'+15% production globale',               effect:{type:'prodBonusAll',value:15}},
    {name:'Tempête Sans Fin',     desc:'+25% Éther, +25% prod Pylônes',         effect:{type:'etherGainPct',value:25}},
  ]),
  zeus_L4_4: _n('zeus_L4_4','zeus',4,4,'zeus_L3_2',280,[
    {name:'Volonté Divine I',   desc:'+20% production globale',                 effect:{type:'prodBonusAll',value:20}},
    {name:'Volonté Divine II',  desc:'+20% production globale',                 effect:{type:'prodBonusAll',value:20}},
    {name:'Force Immuable',     desc:'+3 niveaux max tous bâtiments',           effect:{type:'maxLevelBonusAll',value:3}},
    {name:'Décision Absolue',   desc:'-15% coûts bâtiments',                   effect:{type:'buildCostPct',value:-15}},
    {name:'Zeus Architecte',    desc:'+40% prod, +5 niveaux max',               effect:{type:'maxLevelBonusAll',value:5}},
  ]),
  zeus_L4_5: _n('zeus_L4_5','zeus',4,5,'zeus_L3_2',280,[
    {name:'Olympe Radieux I',  desc:'+20% score Renaissance',                   effect:{type:'scoreMultPct',value:20}},
    {name:'Olympe Radieux II', desc:'+20% score Renaissance',                   effect:{type:'scoreMultPct',value:20}},
    {name:'Rayonnement Divin', desc:'+15% prod globale',                        effect:{type:'prodBonusAll',value:15}},
    {name:'Gloire Olympienne', desc:'+5% gain Éther',                           effect:{type:'etherGainPct',value:5}},
    {name:'Sommet Absolu',     desc:'+50% score, +20% prod',                    effect:{type:'scoreMultPct',value:50}},
  ]),
  zeus_L4_6: _n('zeus_L4_6','zeus',4,6,'zeus_L3_3',280,[
    {name:'Puissance Brute I',  desc:'+3 niveaux max tous bâtiments',           effect:{type:'maxLevelBonusAll',value:3}},
    {name:'Puissance Brute II', desc:'+3 niveaux max tous bâtiments',           effect:{type:'maxLevelBonusAll',value:3}},
    {name:'Colosse Divin',      desc:'+20% prod globale',                       effect:{type:'prodBonusAll',value:20}},
    {name:'Titan de Guerre',    desc:'-10% coûts bâtiments',                    effect:{type:'buildCostPct',value:-10}},
    {name:'Démesure Olympe',    desc:'+8 niveaux max, +25% prod',               effect:{type:'maxLevelBonusAll',value:8}},
  ]),
  zeus_L4_7: _n('zeus_L4_7','zeus',4,7,'zeus_L3_3',280,[
    {name:'Ascension Finale I',   desc:'+1 slot Éclaireur',                     effect:{type:'scoutSlots',value:1}},
    {name:'Ascension Finale II',  desc:'+25% vitesse Éclaireurs',               effect:{type:'scoutSpeedPct',value:25}},
    {name:'Porte des Olympiens',  desc:'+3 portée révélation',                  effect:{type:'haloRange',value:3}},
    {name:'Envoyé du Ciel',       desc:'+1 révélation supplémentaire',           effect:{type:'scoutExtraReveal',value:1}},
    {name:'Héraut Divin',         desc:'+50% vitesse, +2 slots scouts',         effect:{type:'scoutSlots',value:2}},
  ]),
};

// ══════════════════════════════════════════════════════════════
// POSÉIDON 🌊  exploration · fouille · mines · rivières
// ══════════════════════════════════════════════════════════════
const POSEIDON_NODES = {
  pos_L1_0: _n('pos_L1_0','poseidon',1,0,null,50,[
    {name:'Appel des Profondeurs I',  desc:'+1 portée révélation',              effect:{type:'haloRange',value:1}},
    {name:'Appel des Profondeurs II', desc:'+1 portée révélation',              effect:{type:'haloRange',value:1}},
    {name:'Maître des Mers I',        desc:'-10% coût fouille',                 effect:{type:'digCostPct',value:-10}},
    {name:'Maître des Mers II',       desc:'-10% coût fouille',                 effect:{type:'digCostPct',value:-10}},
    {name:'Seigneur de l\'Océan',     desc:'+3 portée révélation, -20% fouille',effect:{type:'haloRange',value:3}},
  ]),
  pos_L2_0: _n('pos_L2_0','poseidon',2,0,'pos_L1_0',100,[
    {name:'Trident I',     desc:'+20% vitesse de révélation',                   effect:{type:'revealSpeed',value:20}},
    {name:'Trident II',    desc:'+20% vitesse de révélation',                   effect:{type:'revealSpeed',value:20}},
    {name:'Vague Sacrée',  desc:'-15% coût fouille',                            effect:{type:'digCostPct',value:-15}},
    {name:'Courant Fort',  desc:'+15% vitesse Éclaireurs',                      effect:{type:'scoutSpeedPct',value:15}},
    {name:'Trident Sacré', desc:'+40% révélation, -30% fouille',                effect:{type:'digCostPct',value:-30}},
  ]),
  pos_L2_1: _n('pos_L2_1','poseidon',2,1,'pos_L1_0',100,[
    {name:'Vagues Porteuses I',  desc:'+15% prod Nourriture',                   effect:{type:'prodBonus',building:'farm,verger,jardins',value:15}},
    {name:'Vagues Porteuses II', desc:'+15% prod Nourriture',                   effect:{type:'prodBonus',building:'farm,verger,jardins',value:15}},
    {name:'Rivière Sacrée',      desc:'+10% production globale',                effect:{type:'prodBonusAll',value:10}},
    {name:'Don des Flots',       desc:'+20% prod Bois',                         effect:{type:'prodBonus',building:'lumber',value:20}},
    {name:'Bénédiction Marine',  desc:'+30% Nourr, +20% prod globale',          effect:{type:'prodBonusAll',value:20}},
  ]),
  pos_L3_0: _n('pos_L3_0','poseidon',3,0,'pos_L2_0',180,[
    {name:'Tsunami I',     desc:'+2 portée révélation',                         effect:{type:'haloRange',value:2}},
    {name:'Tsunami II',    desc:'+2 portée révélation',                         effect:{type:'haloRange',value:2}},
    {name:'Vague Géante',  desc:'+1 révélation par scout',                      effect:{type:'scoutExtraReveal',value:1}},
    {name:'Raz-de-Marée',  desc:'-20% coût fouille',                            effect:{type:'digCostPct',value:-20}},
    {name:'Déluge Divin',  desc:'+4 portée, +2 révélations scouts',             effect:{type:'haloRange',value:4}},
  ]),
  pos_L3_1: _n('pos_L3_1','poseidon',3,1,'pos_L2_0',180,[
    {name:'Séisme I',        desc:'-15% coût fouille',                          effect:{type:'digCostPct',value:-15}},
    {name:'Séisme II',       desc:'-15% coût fouille',                          effect:{type:'digCostPct',value:-15}},
    {name:'Fissure Sacrée',  desc:'+20% prod mines',                            effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:20}},
    {name:'Terremoto',       desc:'+15% production globale',                    effect:{type:'prodBonusAll',value:15}},
    {name:'Rupture Divine',  desc:'-30% fouille, +30% mines',                   effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:30}},
  ]),
  pos_L3_2: _n('pos_L3_2','poseidon',3,2,'pos_L2_1',180,[
    {name:'Courant Divin I',  desc:'+15% production globale',                   effect:{type:'prodBonusAll',value:15}},
    {name:'Courant Divin II', desc:'+15% production globale',                   effect:{type:'prodBonusAll',value:15}},
    {name:'Flots Nourriciers',desc:'+25% production Nourriture',                effect:{type:'prodBonus',building:'farm,verger,jardins',value:25}},
    {name:'Marée Haute',      desc:'+10% score Renaissance',                    effect:{type:'scoreMultPct',value:10}},
    {name:'Fleuve Divin',     desc:'+30% prod globale, +15% score',             effect:{type:'prodBonusAll',value:30}},
  ]),
  pos_L3_3: _n('pos_L3_3','poseidon',3,3,'pos_L2_1',180,[
    {name:'Navigation I',       desc:'+1 slot Éclaireur',                       effect:{type:'scoutSlots',value:1}},
    {name:'Navigation II',      desc:'+20% vitesse Éclaireurs',                 effect:{type:'scoutSpeedPct',value:20}},
    {name:'Cap Sacré',          desc:'+2 portée révélation',                    effect:{type:'haloRange',value:2}},
    {name:'Marin Divin',        desc:'+15% production globale',                 effect:{type:'prodBonusAll',value:15}},
    {name:'Maître Navigateur',  desc:'+1 slot, +40% vitesse scouts',            effect:{type:'scoutSlots',value:1}},
  ]),
  pos_L4_0: _n('pos_L4_0','poseidon',4,0,'pos_L3_0',280,[
    {name:'Vague Primordiale I',  desc:'+25% vitesse révélation',               effect:{type:'revealSpeed',value:25}},
    {name:'Vague Primordiale II', desc:'+25% vitesse révélation',               effect:{type:'revealSpeed',value:25}},
    {name:'Horizon Divin',        desc:'+3 portée révélation',                  effect:{type:'haloRange',value:3}},
    {name:'Vue des Abysses',      desc:'+2 révélations par scout',              effect:{type:'scoutExtraReveal',value:2}},
    {name:'Œil de l\'Océan',     desc:'+50% révélation, +4 portée',            effect:{type:'haloRange',value:5}},
  ]),
  pos_L4_1: _n('pos_L4_1','poseidon',4,1,'pos_L3_0',280,[
    {name:'Abysses Sacrées I',  desc:'-20% coût fouille',                       effect:{type:'digCostPct',value:-20}},
    {name:'Abysses Sacrées II', desc:'-20% coût fouille',                       effect:{type:'digCostPct',value:-20}},
    {name:'Profondeur Infinie', desc:'+30% prod mines',                         effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:30}},
    {name:'Trésor Englouti',    desc:'+15% production globale',                 effect:{type:'prodBonusAll',value:15}},
    {name:'Cœur des Mers',      desc:'-40% fouille, +40% mines',               effect:{type:'digCostPct',value:-40}},
  ]),
  pos_L4_2: _n('pos_L4_2','poseidon',4,2,'pos_L3_1',280,[
    {name:'Trident Légendaire I',  desc:'+30% vitesse révélation',              effect:{type:'revealSpeed',value:30}},
    {name:'Trident Légendaire II', desc:'-20% coût fouille',                    effect:{type:'digCostPct',value:-20}},
    {name:'Frappe Océanique',      desc:'+20% production globale',              effect:{type:'prodBonusAll',value:20}},
    {name:'Tempête de l\'Abîsse', desc:'+15% score',                           effect:{type:'scoreMultPct',value:15}},
    {name:'Poséidon Absolu',       desc:'+40% révélation, +25% prod',           effect:{type:'prodBonusAll',value:25}},
  ]),
  pos_L4_3: _n('pos_L4_3','poseidon',4,3,'pos_L3_1',280,[
    {name:'Séisme Divin I',        desc:'-15% coût fouille',                    effect:{type:'digCostPct',value:-15}},
    {name:'Séisme Divin II',       desc:'+25% prod mines',                      effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:25}},
    {name:'Rupture Sacrée',        desc:'+20% production globale',              effect:{type:'prodBonusAll',value:20}},
    {name:'Fracture du Monde',     desc:'+3 niveaux max mines',                 effect:{type:'maxLevelBonus',building:'mine_copper,mine_iron',value:3}},
    {name:'Apocalypse Tellurique', desc:'-30% fouille, +3 niveaux mines',       effect:{type:'maxLevelBonus',building:'mine_copper,mine_iron',value:3}},
  ]),
  pos_L4_4: _n('pos_L4_4','poseidon',4,4,'pos_L3_2',280,[
    {name:'Rivière Olympienne I',  desc:'+20% prod Nourriture',                 effect:{type:'prodBonus',building:'farm,verger,jardins',value:20}},
    {name:'Rivière Olympienne II', desc:'+20% prod Nourriture',                 effect:{type:'prodBonus',building:'farm,verger,jardins',value:20}},
    {name:'Delta Sacré',           desc:'+20% production globale',              effect:{type:'prodBonusAll',value:20}},
    {name:'Source Éternelle',      desc:'+10% gain Éther',                      effect:{type:'etherGainPct',value:10}},
    {name:'Fleuve Immortel',       desc:'+40% Nourr, +25% prod globale',        effect:{type:'prodBonusAll',value:25}},
  ]),
  pos_L4_5: _n('pos_L4_5','poseidon',4,5,'pos_L3_2',280,[
    {name:'Marée Cosmique I',  desc:'+20% score Renaissance',                   effect:{type:'scoreMultPct',value:20}},
    {name:'Marée Cosmique II', desc:'+20% score Renaissance',                   effect:{type:'scoreMultPct',value:20}},
    {name:'Cycle des Mers',    desc:'+15% production globale',                  effect:{type:'prodBonusAll',value:15}},
    {name:'Reflux Éternel',    desc:'+10% gain Éther',                          effect:{type:'etherGainPct',value:10}},
    {name:'Maître des Marées', desc:'+40% score, +20% prod',                    effect:{type:'scoreMultPct',value:40}},
  ]),
  pos_L4_6: _n('pos_L4_6','poseidon',4,6,'pos_L3_3',280,[
    {name:'Armada Divine I',     desc:'+1 slot Éclaireur',                      effect:{type:'scoutSlots',value:1}},
    {name:'Armada Divine II',    desc:'+30% vitesse Éclaireurs',                effect:{type:'scoutSpeedPct',value:30}},
    {name:'Flotte Sacrée',       desc:'+3 portée révélation',                   effect:{type:'haloRange',value:3}},
    {name:'Navigation Parfaite', desc:'+2 révélations scouts',                  effect:{type:'scoutExtraReveal',value:2}},
    {name:'Conquête Navale',     desc:'+60% vitesse, +2 slots scouts',          effect:{type:'scoutSlots',value:2}},
  ]),
  pos_L4_7: _n('pos_L4_7','poseidon',4,7,'pos_L3_3',280,[
    {name:'Emprise Océanique I',   desc:'+20% production globale',              effect:{type:'prodBonusAll',value:20}},
    {name:'Emprise Océanique II',  desc:'+20% production globale',              effect:{type:'prodBonusAll',value:20}},
    {name:'Domination des Flots',  desc:'+25% score Renaissance',               effect:{type:'scoreMultPct',value:25}},
    {name:'Roi de l\'Atlantide',   desc:'+15% gain Éther',                      effect:{type:'etherGainPct',value:15}},
    {name:'Poséidon Souverain',    desc:'+40% prod, +30% score',                effect:{type:'prodBonusAll',value:40}},
  ]),
};

// ══════════════════════════════════════════════════════════════
// HADÈS 💀  prestige · Éther · mines · fonderies · âmes
// ══════════════════════════════════════════════════════════════
const HADES_NODES = {
  had_L1_0: _n('had_L1_0','hades',1,0,null,50,[
    {name:'Porte du Tartare I',  desc:'+10% gain Éther',                        effect:{type:'etherGainPct',value:10}},
    {name:'Porte du Tartare II', desc:'+10% gain Éther',                        effect:{type:'etherGainPct',value:10}},
    {name:'Appel des Âmes I',    desc:'+10% score Renaissance',                 effect:{type:'scoreMultPct',value:10}},
    {name:'Appel des Âmes II',   desc:'+10% score Renaissance',                 effect:{type:'scoreMultPct',value:10}},
    {name:'Seigneur des Morts',  desc:'+25% Éther, +20% score',                 effect:{type:'etherGainPct',value:25}},
  ]),
  had_L2_0: _n('had_L2_0','hades',2,0,'had_L1_0',100,[
    {name:'Casque d\'Invisibilité I',  desc:'-15% coût fouille',                effect:{type:'digCostPct',value:-15}},
    {name:'Casque d\'Invisibilité II', desc:'-15% coût fouille',                effect:{type:'digCostPct',value:-15}},
    {name:'Ombre du Néant',            desc:'+20% prod mines',                  effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:20}},
    {name:'Cryptes Sacrées',           desc:'+15% production globale',          effect:{type:'prodBonusAll',value:15}},
    {name:'Casque Légendaire',         desc:'-30% fouille, +25% mines',         effect:{type:'digCostPct',value:-30}},
  ]),
  had_L2_1: _n('had_L2_1','hades',2,1,'had_L1_0',100,[
    {name:'Métal des Enfers I',  desc:'+20% prod fonderies & forges',           effect:{type:'prodBonus',building:'fonderie_celeste,forge_divine,autel_fusion',value:20}},
    {name:'Métal des Enfers II', desc:'+20% prod fonderies & forges',           effect:{type:'prodBonus',building:'fonderie_celeste,forge_divine,autel_fusion',value:20}},
    {name:'Âme du Métal',        desc:'+3 niveaux max fonderies',               effect:{type:'maxLevelBonus',building:'fonderie_celeste,forge_divine',value:3}},
    {name:'Forge Infernale',     desc:'+20% production globale',                effect:{type:'prodBonusAll',value:20}},
    {name:'Alliage Maudit',      desc:'+40% fonderies, +4 niveaux max',         effect:{type:'maxLevelBonus',building:'fonderie_celeste,forge_divine',value:4}},
  ]),
  had_L3_0: _n('had_L3_0','hades',3,0,'had_L2_0',180,[
    {name:'Charon I',         desc:'+15% gain Éther',                           effect:{type:'etherGainPct',value:15}},
    {name:'Charon II',        desc:'+15% gain Éther',                           effect:{type:'etherGainPct',value:15}},
    {name:'Obole Sacrée',     desc:'+15 Pages Codex bonus',                     effect:{type:'bonusPages',value:15}},
    {name:'Obole Dorée',      desc:'+20% score Renaissance',                    effect:{type:'scoreMultPct',value:20}},
    {name:'Passeur des Âmes', desc:'+35% Éther, +25% score',                    effect:{type:'etherGainPct',value:35}},
  ]),
  had_L3_1: _n('had_L3_1','hades',3,1,'had_L2_0',180,[
    {name:'Cerbère I',           desc:'+25% prod mines',                        effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:25}},
    {name:'Cerbère II',          desc:'+25% prod mines',                        effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:25}},
    {name:'Gardien Divin',       desc:'-20% coût fouille',                      effect:{type:'digCostPct',value:-20}},
    {name:'Triple Menace',       desc:'+20% production globale',                effect:{type:'prodBonusAll',value:20}},
    {name:'Cerbère Légendaire',  desc:'+50% mines, -25% fouille',               effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:50}},
  ]),
  had_L3_2: _n('had_L3_2','hades',3,2,'had_L2_1',180,[
    {name:'Tartare I',         desc:'+20% prod métaux divins',                  effect:{type:'prodBonus',building:'fonderie_celeste,forge_divine,autel_fusion',value:20}},
    {name:'Tartare II',        desc:'+20% prod métaux divins',                  effect:{type:'prodBonus',building:'fonderie_celeste,forge_divine,autel_fusion',value:20}},
    {name:'Abîme Éternel',     desc:'+15% production globale',                  effect:{type:'prodBonusAll',value:15}},
    {name:'Profondeur Divine', desc:'+25% score Renaissance',                   effect:{type:'scoreMultPct',value:25}},
    {name:'Fond du Gouffre',   desc:'+40% métaux divins, +25% prod',            effect:{type:'prodBonusAll',value:25}},
  ]),
  had_L3_3: _n('had_L3_3','hades',3,3,'had_L2_1',180,[
    {name:'Âmes Captives I',   desc:'+10% gain Éther',                          effect:{type:'etherGainPct',value:10}},
    {name:'Âmes Captives II',  desc:'+10% gain Éther',                          effect:{type:'etherGainPct',value:10}},
    {name:'Moissonneurs I',    desc:'+20% score Renaissance',                   effect:{type:'scoreMultPct',value:20}},
    {name:'Moissonneurs II',   desc:'+15% production globale',                  effect:{type:'prodBonusAll',value:15}},
    {name:'Hadès Triomphant',  desc:'+25% Éther, +25% score, +20% prod',        effect:{type:'etherGainPct',value:25}},
  ]),
  had_L4_0: _n('had_L4_0','hades',4,0,'had_L3_0',280,[
    {name:'Roi des Enfers I',  desc:'+20% gain Éther',                          effect:{type:'etherGainPct',value:20}},
    {name:'Roi des Enfers II', desc:'+20% gain Éther',                          effect:{type:'etherGainPct',value:20}},
    {name:'Trône Infernal',    desc:'+30% score Renaissance',                   effect:{type:'scoreMultPct',value:30}},
    {name:'Sceptre du Néant',  desc:'+20 Pages Codex bonus',                    effect:{type:'bonusPages',value:20}},
    {name:'Hadès Absolu',      desc:'+50% Éther, +35% score',                   effect:{type:'etherGainPct',value:50}},
  ]),
  had_L4_1: _n('had_L4_1','hades',4,1,'had_L3_0',280,[
    {name:'Styx I',            desc:'+25% gain Éther',                          effect:{type:'etherGainPct',value:25}},
    {name:'Styx II',           desc:'+25% gain Éther',                          effect:{type:'etherGainPct',value:25}},
    {name:'Fleuve des Morts',  desc:'+20% score',                               effect:{type:'scoreMultPct',value:20}},
    {name:'Eau Oublieuse',     desc:'+15% production globale',                  effect:{type:'prodBonusAll',value:15}},
    {name:'Styx Éternel',      desc:'+50% Éther, +25% prod',                    effect:{type:'etherGainPct',value:50}},
  ]),
  had_L4_2: _n('had_L4_2','hades',4,2,'had_L3_1',280,[
    {name:'Anubis I',           desc:'+30% prod mines',                         effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:30}},
    {name:'Anubis II',          desc:'+30% prod mines',                         effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:30}},
    {name:'Balance Divine',     desc:'-25% coût fouille',                       effect:{type:'digCostPct',value:-25}},
    {name:'Jugement Dernier',   desc:'+25% score Renaissance',                  effect:{type:'scoreMultPct',value:25}},
    {name:'Maître du Jugement', desc:'+60% mines, -30% fouille',                effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:60}},
  ]),
  had_L4_3: _n('had_L4_3','hades',4,3,'had_L3_1',280,[
    {name:'Enfers Profonds I',   desc:'+30% prod mines',                        effect:{type:'prodBonus',building:'mine_copper,mine_iron',value:30}},
    {name:'Enfers Profonds II',  desc:'-20% coût fouille',                      effect:{type:'digCostPct',value:-20}},
    {name:'Gouffre Sans Fond',   desc:'+3 niveaux max mines',                   effect:{type:'maxLevelBonus',building:'mine_copper,mine_iron',value:3}},
    {name:'Abîme Primordial',    desc:'+20% production globale',                effect:{type:'prodBonusAll',value:20}},
    {name:'Enfers Légendaires',  desc:'+60% mines, +4 niveaux max',             effect:{type:'maxLevelBonus',building:'mine_copper,mine_iron',value:4}},
  ]),
  had_L4_4: _n('had_L4_4','hades',4,4,'had_L3_2',280,[
    {name:'Métal Divin I',  desc:'+30% prod fonderies & forges',                effect:{type:'prodBonus',building:'fonderie_celeste,forge_divine,autel_fusion',value:30}},
    {name:'Métal Divin II', desc:'+30% prod fonderies & forges',                effect:{type:'prodBonus',building:'fonderie_celeste,forge_divine,autel_fusion',value:30}},
    {name:'Alliage Céleste', desc:'+4 niveaux max forges',                      effect:{type:'maxLevelBonus',building:'fonderie_celeste,forge_divine',value:4}},
    {name:'Forge des Dieux', desc:'+25% production globale',                    effect:{type:'prodBonusAll',value:25}},
    {name:'Création Ultime', desc:'+60% forges, +5 niveaux max',                effect:{type:'maxLevelBonus',building:'fonderie_celeste,forge_divine',value:5}},
  ]),
  had_L4_5: _n('had_L4_5','hades',4,5,'had_L3_2',280,[
    {name:'Âmes Éternelles I',   desc:'+20% gain Éther',                        effect:{type:'etherGainPct',value:20}},
    {name:'Âmes Éternelles II',  desc:'+20% score Renaissance',                 effect:{type:'scoreMultPct',value:20}},
    {name:'Cycle Infernal',      desc:'+20% production globale',                effect:{type:'prodBonusAll',value:20}},
    {name:'Renaissance Noire',   desc:'+15% gain Éther',                        effect:{type:'etherGainPct',value:15}},
    {name:'Éternité des Morts',  desc:'+40% Éther, +30% score',                 effect:{type:'etherGainPct',value:40}},
  ]),
  had_L4_6: _n('had_L4_6','hades',4,6,'had_L3_3',280,[
    {name:'Légion Infernale I',  desc:'+20% production globale',                effect:{type:'prodBonusAll',value:20}},
    {name:'Légion Infernale II', desc:'+20% production globale',                effect:{type:'prodBonusAll',value:20}},
    {name:'Armée des Ombres',    desc:'+25% score Renaissance',                 effect:{type:'scoreMultPct',value:25}},
    {name:'Forces des Ténèbres', desc:'+3 niveaux max tous bâtiments',          effect:{type:'maxLevelBonusAll',value:3}},
    {name:'Horde Infernale',     desc:'+40% prod, +35% score',                  effect:{type:'prodBonusAll',value:40}},
  ]),
  had_L4_7: _n('had_L4_7','hades',4,7,'had_L3_3',280,[
    {name:'Hadès Triomphant I',   desc:'+30% gain Éther',                       effect:{type:'etherGainPct',value:30}},
    {name:'Hadès Triomphant II',  desc:'+30% score Renaissance',                effect:{type:'scoreMultPct',value:30}},
    {name:'Maître Absolu',        desc:'+25% production globale',               effect:{type:'prodBonusAll',value:25}},
    {name:'Règne Éternel',        desc:'+20 Pages Codex bonus',                 effect:{type:'bonusPages',value:20}},
    {name:'Dieu des Morts',       desc:'+50% Éther, +40% score, +30% prod',     effect:{type:'etherGainPct',value:50}},
  ]),
};

// ══════════════════════════════════════════════════════════════
// ATHÉNA 🦉  sagesse · Codex · coûts · niveaux max bâtiments
// ══════════════════════════════════════════════════════════════
const ATHENA_NODES = {
  ath_L1_0: _n('ath_L1_0','athena',1,0,null,50,[
    {name:'Sagesse I',         desc:'+10 Pages Codex bonus',                    effect:{type:'bonusPages',value:10}},
    {name:'Sagesse II',        desc:'+10 Pages Codex bonus',                    effect:{type:'bonusPages',value:10}},
    {name:'Stratégie I',       desc:'-10% coût des bâtiments',                 effect:{type:'buildCostPct',value:-10}},
    {name:'Stratégie II',      desc:'-10% coût des bâtiments',                 effect:{type:'buildCostPct',value:-10}},
    {name:'Déesse de la Cité', desc:'+20 Pages Codex, -20% coûts bâtiments',   effect:{type:'buildCostPct',value:-20}},
  ]),
  ath_L2_0: _n('ath_L2_0','athena',2,0,'ath_L1_0',100,[
    {name:'Chouette Sacrée I',   desc:'+15 Pages Codex bonus',                  effect:{type:'bonusPages',value:15}},
    {name:'Chouette Sacrée II',  desc:'+15 Pages Codex bonus',                  effect:{type:'bonusPages',value:15}},
    {name:'Bibliothèque Divine', desc:'+20% multiplicateur Pages Codex',        effect:{type:'codexPagesMult',value:20}},
    {name:'Savoir Ancien',       desc:'+10% gain Éther',                        effect:{type:'etherGainPct',value:10}},
    {name:'Athénaeum Sacré',     desc:'+30 Pages Codex, +25% mult Pages',       effect:{type:'codexPagesMult',value:25}},
  ]),
  ath_L2_1: _n('ath_L2_1','athena',2,1,'ath_L1_0',100,[
    {name:'Égide I',           desc:'-15% coût des bâtiments',                  effect:{type:'buildCostPct',value:-15}},
    {name:'Égide II',          desc:'-15% coût des bâtiments',                  effect:{type:'buildCostPct',value:-15}},
    {name:'Bouclier Divin',    desc:'+3 niveaux max tous bâtiments',             effect:{type:'maxLevelBonusAll',value:3}},
    {name:'Protection Sacrée', desc:'+15% production globale',                  effect:{type:'prodBonusAll',value:15}},
    {name:'Égide Légendaire',  desc:'-30% coûts, +4 niveaux max',               effect:{type:'maxLevelBonusAll',value:4}},
  ]),
  ath_L3_0: _n('ath_L3_0','athena',3,0,'ath_L2_0',180,[
    {name:'Académie I',        desc:'+20% multiplicateur Pages Codex',          effect:{type:'codexPagesMult',value:20}},
    {name:'Académie II',       desc:'+20% multiplicateur Pages Codex',          effect:{type:'codexPagesMult',value:20}},
    {name:'Corpus Sacrés',     desc:'+20 Pages Codex bonus',                    effect:{type:'bonusPages',value:20}},
    {name:'Érudition',         desc:'+15% gain Éther',                          effect:{type:'etherGainPct',value:15}},
    {name:'Grande Académie',   desc:'+40% mult Codex, +25 Pages bonus',         effect:{type:'codexPagesMult',value:40}},
  ]),
  ath_L3_1: _n('ath_L3_1','athena',3,1,'ath_L2_0',180,[
    {name:'Parchemins Divins I',   desc:'+20% score Renaissance',               effect:{type:'scoreMultPct',value:20}},
    {name:'Parchemins Divins II',  desc:'+20% score Renaissance',               effect:{type:'scoreMultPct',value:20}},
    {name:'Annales Sacrées',       desc:'+20 Pages Codex bonus',                effect:{type:'bonusPages',value:20}},
    {name:'Mémoire Infinie',       desc:'+15% production globale',              effect:{type:'prodBonusAll',value:15}},
    {name:'Parchemins Légendaires',desc:'+40% score, +25 Pages bonus',          effect:{type:'scoreMultPct',value:40}},
  ]),
  ath_L3_2: _n('ath_L3_2','athena',3,2,'ath_L2_1',180,[
    {name:'Architecture Sacrée I',  desc:'-12% coût des bâtiments',             effect:{type:'buildCostPct',value:-12}},
    {name:'Architecture Sacrée II', desc:'-12% coût des bâtiments',             effect:{type:'buildCostPct',value:-12}},
    {name:'Temple Parfait',         desc:'+3 niveaux max tous bâtiments',       effect:{type:'maxLevelBonusAll',value:3}},
    {name:'Cité Idéale',            desc:'+20% production globale',             effect:{type:'prodBonusAll',value:20}},
    {name:'Urbanisme Divin',        desc:'-25% coûts, +5 niveaux max',          effect:{type:'maxLevelBonusAll',value:5}},
  ]),
  ath_L3_3: _n('ath_L3_3','athena',3,3,'ath_L2_1',180,[
    {name:'Justice Divine I',    desc:'+15% production globale',                effect:{type:'prodBonusAll',value:15}},
    {name:'Justice Divine II',   desc:'+15% production globale',                effect:{type:'prodBonusAll',value:15}},
    {name:'Loi Sacrée',          desc:'+20% score Renaissance',                 effect:{type:'scoreMultPct',value:20}},
    {name:'Ordre Parfait',       desc:'-10% coût bâtiments',                    effect:{type:'buildCostPct',value:-10}},
    {name:'Athéna Législatrice', desc:'+30% prod, +25% score, -15% coûts',      effect:{type:'prodBonusAll',value:30}},
  ]),
  ath_L4_0: _n('ath_L4_0','athena',4,0,'ath_L3_0',280,[
    {name:'Bibliothèque Éternelle I',  desc:'+30% mult Pages Codex',            effect:{type:'codexPagesMult',value:30}},
    {name:'Bibliothèque Éternelle II', desc:'+30% mult Pages Codex',            effect:{type:'codexPagesMult',value:30}},
    {name:'Savoir Absolu',             desc:'+25 Pages Codex bonus',            effect:{type:'bonusPages',value:25}},
    {name:'Omniscience',               desc:'+20% gain Éther',                  effect:{type:'etherGainPct',value:20}},
    {name:'Bibliothèque des Dieux',    desc:'+60% mult Codex, +30 Pages',       effect:{type:'codexPagesMult',value:60}},
  ]),
  ath_L4_1: _n('ath_L4_1','athena',4,1,'ath_L3_0',280,[
    {name:'Épopée Sacrée I',   desc:'+30% score Renaissance',                   effect:{type:'scoreMultPct',value:30}},
    {name:'Épopée Sacrée II',  desc:'+30% score Renaissance',                   effect:{type:'scoreMultPct',value:30}},
    {name:'Légende Vivante',   desc:'+20% production globale',                  effect:{type:'prodBonusAll',value:20}},
    {name:'Gloire Érudite',    desc:'+20% gain Éther',                          effect:{type:'etherGainPct',value:20}},
    {name:'Athéna Légendaire', desc:'+60% score, +25% Éther',                   effect:{type:'scoreMultPct',value:60}},
  ]),
  ath_L4_2: _n('ath_L4_2','athena',4,2,'ath_L3_1',280,[
    {name:'Codex Olympien I',   desc:'+25% mult Pages Codex',                   effect:{type:'codexPagesMult',value:25}},
    {name:'Codex Olympien II',  desc:'+25% mult Pages Codex',                   effect:{type:'codexPagesMult',value:25}},
    {name:'Pages d\'Or',        desc:'+25 Pages Codex bonus',                   effect:{type:'bonusPages',value:25}},
    {name:'Tomes Immortels',    desc:'+25% score Renaissance',                  effect:{type:'scoreMultPct',value:25}},
    {name:'Codex Absolu',       desc:'+50% mult Codex, +30 Pages',              effect:{type:'codexPagesMult',value:50}},
  ]),
  ath_L4_3: _n('ath_L4_3','athena',4,3,'ath_L3_1',280,[
    {name:'Stratège Divin I',  desc:'+25% production globale',                  effect:{type:'prodBonusAll',value:25}},
    {name:'Stratège Divin II', desc:'+25% production globale',                  effect:{type:'prodBonusAll',value:25}},
    {name:'Tactique Parfaite', desc:'-20% coût bâtiments',                      effect:{type:'buildCostPct',value:-20}},
    {name:'Plan Omniscient',   desc:'+30% score Renaissance',                   effect:{type:'scoreMultPct',value:30}},
    {name:'Athéna Stratège',   desc:'+50% prod, -25% coûts, +30% score',        effect:{type:'prodBonusAll',value:50}},
  ]),
  ath_L4_4: _n('ath_L4_4','athena',4,4,'ath_L3_2',280,[
    {name:'Perfectionnisme I',   desc:'-20% coût bâtiments',                    effect:{type:'buildCostPct',value:-20}},
    {name:'Perfectionnisme II',  desc:'-20% coût bâtiments',                    effect:{type:'buildCostPct',value:-20}},
    {name:'Excellence Divine',   desc:'+4 niveaux max tous bâtiments',          effect:{type:'maxLevelBonusAll',value:4}},
    {name:'Idéal Suprême',       desc:'+25% production globale',                effect:{type:'prodBonusAll',value:25}},
    {name:'Maîtrise Absolue',    desc:'-40% coûts, +6 niveaux max',             effect:{type:'maxLevelBonusAll',value:6}},
  ]),
  ath_L4_5: _n('ath_L4_5','athena',4,5,'ath_L3_2',280,[
    {name:'Métropole Divine I',   desc:'+25% production globale',               effect:{type:'prodBonusAll',value:25}},
    {name:'Métropole Divine II',  desc:'+5 niveaux max tous bâtiments',         effect:{type:'maxLevelBonusAll',value:5}},
    {name:'Cité des Olympiens',   desc:'-15% coût bâtiments',                   effect:{type:'buildCostPct',value:-15}},
    {name:'Athènes Éternelle',    desc:'+30% score Renaissance',                effect:{type:'scoreMultPct',value:30}},
    {name:'Civilisation Parfaite',desc:'+50% prod, +7 niveaux max',             effect:{type:'maxLevelBonusAll',value:7}},
  ]),
  ath_L4_6: _n('ath_L4_6','athena',4,6,'ath_L3_3',280,[
    {name:'Gouvernance Parfaite I',  desc:'+30% production globale',            effect:{type:'prodBonusAll',value:30}},
    {name:'Gouvernance Parfaite II', desc:'+30% production globale',            effect:{type:'prodBonusAll',value:30}},
    {name:'Justice Absolue',         desc:'+35% score Renaissance',             effect:{type:'scoreMultPct',value:35}},
    {name:'Équilibre Divin',         desc:'-15% coûts bâtiments',              effect:{type:'buildCostPct',value:-15}},
    {name:'Cité Parfaite',           desc:'+60% prod, +40% score',              effect:{type:'prodBonusAll',value:60}},
  ]),
  ath_L4_7: _n('ath_L4_7','athena',4,7,'ath_L3_3',280,[
    {name:'Athéna Absolue I',   desc:'+25% mult Pages Codex',                   effect:{type:'codexPagesMult',value:25}},
    {name:'Athéna Absolue II',  desc:'+25% mult Pages Codex',                   effect:{type:'codexPagesMult',value:25}},
    {name:'Sagesse Infinie',    desc:'+25% gain Éther',                         effect:{type:'etherGainPct',value:25}},
    {name:'Omniscience Totale', desc:'+35% score Renaissance',                  effect:{type:'scoreMultPct',value:35}},
    {name:'Déesse Suprême',     desc:'+50% mult Codex, +30% Éther, +40% score', effect:{type:'codexPagesMult',value:50}},
  ]),
};

// ══════════════════════════════════════════════════════════════
// APOLLON ☀️  prod globale · Nourriture · pop · Codex · scouts
// ══════════════════════════════════════════════════════════════
const APOLLON_NODES = {
  apo_L1_0: _n('apo_L1_0','apollon',1,0,null,50,[
    {name:'Lumière Solaire I',  desc:'+10% production globale',                 effect:{type:'prodBonusAll',value:10}},
    {name:'Lumière Solaire II', desc:'+10% production globale',                 effect:{type:'prodBonusAll',value:10}},
    {name:'Rayons du Soleil I', desc:'+15% production Nourriture',              effect:{type:'prodBonus',building:'farm,verger,jardins',value:15}},
    {name:'Rayons du Soleil II',desc:'+15% production Nourriture',              effect:{type:'prodBonus',building:'farm,verger,jardins',value:15}},
    {name:'Dieu du Soleil',     desc:'+25% prod globale, +20% Nourriture',      effect:{type:'prodBonusAll',value:25}},
  ]),
  apo_L2_0: _n('apo_L2_0','apollon',2,0,'apo_L1_0',100,[
    {name:'Arc Solaire I',   desc:'+20% vitesse Éclaireurs',                    effect:{type:'scoutSpeedPct',value:20}},
    {name:'Arc Solaire II',  desc:'+20% vitesse Éclaireurs',                    effect:{type:'scoutSpeedPct',value:20}},
    {name:'Flèches Divines', desc:'+15% production globale',                    effect:{type:'prodBonusAll',value:15}},
    {name:'Archer Céleste',  desc:'+2 portée révélation',                       effect:{type:'haloRange',value:2}},
    {name:'Arc d\'Apollon',  desc:'+40% vitesse scouts, +3 portée',             effect:{type:'scoutSpeedPct',value:40}},
  ]),
  apo_L2_1: _n('apo_L2_1','apollon',2,1,'apo_L1_0',100,[
    {name:'Médecine I',       desc:'+20% production Nourriture',                effect:{type:'prodBonus',building:'farm,verger,jardins',value:20}},
    {name:'Médecine II',      desc:'+20% production Nourriture',                effect:{type:'prodBonus',building:'farm,verger,jardins',value:20}},
    {name:'Guérison Divine',  desc:'+20% capacité de population max',           effect:{type:'popCapPct',value:20}},
    {name:'Asclépio',         desc:'+15% production globale',                   effect:{type:'prodBonusAll',value:15}},
    {name:'Grand Médecin',    desc:'+40% Nourr, +30% pop max',                  effect:{type:'popCapPct',value:30}},
  ]),
  apo_L3_0: _n('apo_L3_0','apollon',3,0,'apo_L2_0',180,[
    {name:'Prophétie I',       desc:'+15% score Renaissance',                   effect:{type:'scoreMultPct',value:15}},
    {name:'Prophétie II',      desc:'+15% score Renaissance',                   effect:{type:'scoreMultPct',value:15}},
    {name:'Oracle de Delphes', desc:'+15 Pages Codex bonus',                    effect:{type:'bonusPages',value:15}},
    {name:'Vision du Futur',   desc:'+15% gain Éther',                          effect:{type:'etherGainPct',value:15}},
    {name:'Oracle Sacré',      desc:'+30% score, +20 Pages, +15% Éther',        effect:{type:'scoreMultPct',value:30}},
  ]),
  apo_L3_1: _n('apo_L3_1','apollon',3,1,'apo_L2_0',180,[
    {name:'Musique des Sphères I',  desc:'+20% production globale',             effect:{type:'prodBonusAll',value:20}},
    {name:'Musique des Sphères II', desc:'+20% production globale',             effect:{type:'prodBonusAll',value:20}},
    {name:'Harmonie Céleste',       desc:'+20% score Renaissance',              effect:{type:'scoreMultPct',value:20}},
    {name:'Lyre Divine',            desc:'+15% gain Éther',                     effect:{type:'etherGainPct',value:15}},
    {name:'Concert Olympien',       desc:'+40% prod, +25% score',               effect:{type:'prodBonusAll',value:40}},
  ]),
  apo_L3_2: _n('apo_L3_2','apollon',3,2,'apo_L2_1',180,[
    {name:'Sanctuaire I',     desc:'+20% production Nourriture',                effect:{type:'prodBonus',building:'farm,verger,jardins',value:20}},
    {name:'Sanctuaire II',    desc:'+20% production Nourriture',                effect:{type:'prodBonus',building:'farm,verger,jardins',value:20}},
    {name:'Temple Solaire',   desc:'+25% capacité pop max',                     effect:{type:'popCapPct',value:25}},
    {name:'Blessing Sacré',   desc:'+15% production globale',                   effect:{type:'prodBonusAll',value:15}},
    {name:'Grand Sanctuaire', desc:'+40% Nourr, +35% pop max',                  effect:{type:'popCapPct',value:35}},
  ]),
  apo_L3_3: _n('apo_L3_3','apollon',3,3,'apo_L2_1',180,[
    {name:'Chariot Solaire I',  desc:'+20% production globale',                 effect:{type:'prodBonusAll',value:20}},
    {name:'Chariot Solaire II', desc:'+20% production globale',                 effect:{type:'prodBonusAll',value:20}},
    {name:'Course Céleste',     desc:'+25% score Renaissance',                  effect:{type:'scoreMultPct',value:25}},
    {name:'Éclat du Jour',      desc:'+15% gain Éther',                         effect:{type:'etherGainPct',value:15}},
    {name:'Hélios Sacré',       desc:'+40% prod, +30% score',                   effect:{type:'prodBonusAll',value:40}},
  ]),
  apo_L4_0: _n('apo_L4_0','apollon',4,0,'apo_L3_0',280,[
    {name:'Oracle Suprême I',  desc:'+25% score Renaissance',                   effect:{type:'scoreMultPct',value:25}},
    {name:'Oracle Suprême II', desc:'+25% score Renaissance',                   effect:{type:'scoreMultPct',value:25}},
    {name:'Prophétie Absolue', desc:'+20 Pages Codex bonus',                    effect:{type:'bonusPages',value:20}},
    {name:'Destin Révélé',     desc:'+20% gain Éther',                          effect:{type:'etherGainPct',value:20}},
    {name:'Apollon Oracle',    desc:'+50% score, +25 Pages, +25% Éther',        effect:{type:'scoreMultPct',value:50}},
  ]),
  apo_L4_1: _n('apo_L4_1','apollon',4,1,'apo_L3_0',280,[
    {name:'Solstice Divin I',  desc:'+30% production globale',                  effect:{type:'prodBonusAll',value:30}},
    {name:'Solstice Divin II', desc:'+30% production globale',                  effect:{type:'prodBonusAll',value:30}},
    {name:'Équinoxe Sacré',    desc:'+25% score Renaissance',                   effect:{type:'scoreMultPct',value:25}},
    {name:'Cycle Solaire',     desc:'+20% gain Éther',                          effect:{type:'etherGainPct',value:20}},
    {name:'Apollon Solstice',  desc:'+60% prod, +30% score',                    effect:{type:'prodBonusAll',value:60}},
  ]),
  apo_L4_2: _n('apo_L4_2','apollon',4,2,'apo_L3_1',280,[
    {name:'Harmonie Absolue I',  desc:'+30% production globale',                effect:{type:'prodBonusAll',value:30}},
    {name:'Harmonie Absolue II', desc:'+30% production globale',                effect:{type:'prodBonusAll',value:30}},
    {name:'Symphonie Divine',    desc:'+25% score Renaissance',                 effect:{type:'scoreMultPct',value:25}},
    {name:'Accord Olympien',     desc:'+20% gain Éther',                        effect:{type:'etherGainPct',value:20}},
    {name:'Concert Immortel',    desc:'+60% prod, +35% score',                  effect:{type:'prodBonusAll',value:60}},
  ]),
  apo_L4_3: _n('apo_L4_3','apollon',4,3,'apo_L3_1',280,[
    {name:'Lumière Absolue I',   desc:'+25% production globale',                effect:{type:'prodBonusAll',value:25}},
    {name:'Lumière Absolue II',  desc:'+25% production globale',                effect:{type:'prodBonusAll',value:25}},
    {name:'Éclat Divin',         desc:'+30% score Renaissance',                 effect:{type:'scoreMultPct',value:30}},
    {name:'Rayonnement Solaire', desc:'+2 portée révélation',                   effect:{type:'haloRange',value:2}},
    {name:'Soleil Immortel',     desc:'+50% prod, +35% score',                  effect:{type:'prodBonusAll',value:50}},
  ]),
  apo_L4_4: _n('apo_L4_4','apollon',4,4,'apo_L3_2',280,[
    {name:'Élixir Divin I',   desc:'+30% production Nourriture',                effect:{type:'prodBonus',building:'farm,verger,jardins',value:30}},
    {name:'Élixir Divin II',  desc:'+30% production Nourriture',                effect:{type:'prodBonus',building:'farm,verger,jardins',value:30}},
    {name:'Ambroisie Pure',   desc:'+35% capacité pop max',                     effect:{type:'popCapPct',value:35}},
    {name:'Nectar Céleste',   desc:'+25% production globale',                   effect:{type:'prodBonusAll',value:25}},
    {name:'Don des Dieux',    desc:'+60% Nourr, +40% pop max',                  effect:{type:'popCapPct',value:40}},
  ]),
  apo_L4_5: _n('apo_L4_5','apollon',4,5,'apo_L3_2',280,[
    {name:'Cité du Soleil I',  desc:'+30% production globale',                  effect:{type:'prodBonusAll',value:30}},
    {name:'Cité du Soleil II', desc:'+30% production globale',                  effect:{type:'prodBonusAll',value:30}},
    {name:'Solaire Olympien',  desc:'+4 niveaux max fermes & jardins',          effect:{type:'maxLevelBonus',building:'farm,verger,jardins',value:4}},
    {name:'Paradis Terrestre', desc:'+25% score Renaissance',                   effect:{type:'scoreMultPct',value:25}},
    {name:'Éden Solaire',      desc:'+60% prod, +5 niveaux max',                effect:{type:'maxLevelBonus',building:'farm,verger,jardins',value:5}},
  ]),
  apo_L4_6: _n('apo_L4_6','apollon',4,6,'apo_L3_3',280,[
    {name:'Aurore Divine I',  desc:'+30% production globale',                   effect:{type:'prodBonusAll',value:30}},
    {name:'Aurore Divine II', desc:'+30% production globale',                   effect:{type:'prodBonusAll',value:30}},
    {name:'Aube Éternelle',   desc:'+25% score Renaissance',                    effect:{type:'scoreMultPct',value:25}},
    {name:'Premier Soleil',   desc:'+20% gain Éther',                           effect:{type:'etherGainPct',value:20}},
    {name:'Apollon Éternel',  desc:'+60% prod, +30% score, +25% Éther',         effect:{type:'prodBonusAll',value:60}},
  ]),
  apo_L4_7: _n('apo_L4_7','apollon',4,7,'apo_L3_3',280,[
    {name:'Apollon Suprême I',  desc:'+25% production globale',                 effect:{type:'prodBonusAll',value:25}},
    {name:'Apollon Suprême II', desc:'+25% production globale',                 effect:{type:'prodBonusAll',value:25}},
    {name:'Dieu du Soleil',     desc:'+35% score Renaissance',                  effect:{type:'scoreMultPct',value:35}},
    {name:'Lumière Infinie',    desc:'+30% gain Éther',                         effect:{type:'etherGainPct',value:30}},
    {name:'Astre Immortel',     desc:'+50% prod, +40% score, +35% Éther',       effect:{type:'prodBonusAll',value:50}},
  ]),
};

// ══════════════════════════════════════════════════════════════
// ARÈS ⚔️  vitesse scouts · bâtiments militaires · coûts
// ══════════════════════════════════════════════════════════════
const ARES_NODES = {
  are_L1_0: _n('are_L1_0','ares',1,0,null,50,[
    {name:'Ardeur Guerrière I',  desc:'+10% vitesse des Éclaireurs',            effect:{type:'scoutSpeedPct',value:10}},
    {name:'Ardeur Guerrière II', desc:'+10% vitesse des Éclaireurs',            effect:{type:'scoutSpeedPct',value:10}},
    {name:'Furie de Combat I',   desc:'+10% production globale',                effect:{type:'prodBonusAll',value:10}},
    {name:'Furie de Combat II',  desc:'+10% production globale',                effect:{type:'prodBonusAll',value:10}},
    {name:'Dieu de la Guerre',   desc:'+25% vitesse scouts, +20% prod',         effect:{type:'scoutSpeedPct',value:25}},
  ]),
  are_L2_0: _n('are_L2_0','ares',2,0,'are_L1_0',100,[
    {name:'Épée Sacrée I',  desc:'+20% vitesse des Éclaireurs',                 effect:{type:'scoutSpeedPct',value:20}},
    {name:'Épée Sacrée II', desc:'+20% vitesse des Éclaireurs',                 effect:{type:'scoutSpeedPct',value:20}},
    {name:'Lame Divine',    desc:'+1 slot Éclaireur',                           effect:{type:'scoutSlots',value:1}},
    {name:'Escouade',       desc:'+2 portée révélation',                        effect:{type:'haloRange',value:2}},
    {name:'Armée Sacrée',   desc:'+40% vitesse, +1 slot, +2 portée',            effect:{type:'scoutSpeedPct',value:40}},
  ]),
  are_L2_1: _n('are_L2_1','ares',2,1,'are_L1_0',100,[
    {name:'Forge de Guerre I',  desc:'+20% prod bâtiments militaires',          effect:{type:'prodBonus',building:'forteresse,pylone,noeud_olympien',value:20}},
    {name:'Forge de Guerre II', desc:'+20% prod bâtiments militaires',          effect:{type:'prodBonus',building:'forteresse,pylone,noeud_olympien',value:20}},
    {name:'Arsenal Divin',      desc:'+3 niveaux max forteresses',              effect:{type:'maxLevelBonus',building:'forteresse',value:3}},
    {name:'Bastions',           desc:'+15% production globale',                 effect:{type:'prodBonusAll',value:15}},
    {name:'Citadelle Divine',   desc:'+40% militaire, +4 niveaux max',          effect:{type:'maxLevelBonus',building:'forteresse',value:4}},
  ]),
  are_L3_0: _n('are_L3_0','ares',3,0,'are_L2_0',180,[
    {name:'Charge I',         desc:'+25% vitesse Éclaireurs',                   effect:{type:'scoutSpeedPct',value:25}},
    {name:'Charge II',        desc:'+25% vitesse Éclaireurs',                   effect:{type:'scoutSpeedPct',value:25}},
    {name:'Cavalerie Sacrée', desc:'+1 révélation par scout',                   effect:{type:'scoutExtraReveal',value:1}},
    {name:'Armure Divine',    desc:'+3 portée révélation',                      effect:{type:'haloRange',value:3}},
    {name:'Légion Céleste',   desc:'+50% vitesse, +2 révélations scouts',       effect:{type:'scoutSpeedPct',value:50}},
  ]),
  are_L3_1: _n('are_L3_1','ares',3,1,'are_L2_0',180,[
    {name:'Conquête I',         desc:'+1 slot Éclaireur',                       effect:{type:'scoutSlots',value:1}},
    {name:'Conquête II',        desc:'+20% vitesse Éclaireurs',                 effect:{type:'scoutSpeedPct',value:20}},
    {name:'Victoire',           desc:'+20% score Renaissance',                  effect:{type:'scoreMultPct',value:20}},
    {name:'Trophée de Guerre',  desc:'+20% production globale',                 effect:{type:'prodBonusAll',value:20}},
    {name:'Conquérant',         desc:'+40% vitesse, +1 slot, +25% score',       effect:{type:'scoutSlots',value:1}},
  ]),
  are_L3_2: _n('are_L3_2','ares',3,2,'are_L2_1',180,[
    {name:'Siège Divin I',  desc:'+20% prod bâtiments militaires',              effect:{type:'prodBonus',building:'forteresse,pylone,noeud_olympien',value:20}},
    {name:'Siège Divin II', desc:'+20% prod bâtiments militaires',              effect:{type:'prodBonus',building:'forteresse,pylone,noeud_olympien',value:20}},
    {name:'Artillerie',     desc:'+15% production globale',                     effect:{type:'prodBonusAll',value:15}},
    {name:'Bélier Sacré',   desc:'-15% coût bâtiments',                         effect:{type:'buildCostPct',value:-15}},
    {name:'Siège Total',    desc:'+40% militaire, -20% coûts',                  effect:{type:'prodBonus',building:'forteresse,pylone,noeud_olympien',value:40}},
  ]),
  are_L3_3: _n('are_L3_3','ares',3,3,'are_L2_1',180,[
    {name:'Pillage I',        desc:'+15% production globale',                   effect:{type:'prodBonusAll',value:15}},
    {name:'Pillage II',       desc:'+15% production globale',                   effect:{type:'prodBonusAll',value:15}},
    {name:'Butin de Guerre',  desc:'+20% score Renaissance',                    effect:{type:'scoreMultPct',value:20}},
    {name:'Sac de la Cité',   desc:'-10% coût fouille',                         effect:{type:'digCostPct',value:-10}},
    {name:'Pillard Divin',    desc:'+30% prod, +25% score, -15% fouille',       effect:{type:'prodBonusAll',value:30}},
  ]),
  are_L4_0: _n('are_L4_0','ares',4,0,'are_L3_0',280,[
    {name:'Horde Divine I',  desc:'+30% vitesse Éclaireurs',                    effect:{type:'scoutSpeedPct',value:30}},
    {name:'Horde Divine II', desc:'+30% vitesse Éclaireurs',                    effect:{type:'scoutSpeedPct',value:30}},
    {name:'Vague de Choc',   desc:'+4 portée révélation',                       effect:{type:'haloRange',value:4}},
    {name:'Avalanche',       desc:'+2 révélations scouts',                      effect:{type:'scoutExtraReveal',value:2}},
    {name:'Assaut Total',    desc:'+60% vitesse, +4 portée, +2 révélations',    effect:{type:'scoutSpeedPct',value:60}},
  ]),
  are_L4_1: _n('are_L4_1','ares',4,1,'are_L3_0',280,[
    {name:'Général Divin I',  desc:'+2 slots Éclaireur',                        effect:{type:'scoutSlots',value:2}},
    {name:'Général Divin II', desc:'+30% vitesse Éclaireurs',                   effect:{type:'scoutSpeedPct',value:30}},
    {name:'Commandant Sacré', desc:'+3 portée révélation',                      effect:{type:'haloRange',value:3}},
    {name:'Stratège Guerrier',desc:'+25% production globale',                   effect:{type:'prodBonusAll',value:25}},
    {name:'Arès Général',     desc:'+60% vitesse, +2 slots, +4 portée',         effect:{type:'scoutSlots',value:2}},
  ]),
  are_L4_2: _n('are_L4_2','ares',4,2,'are_L3_1',280,[
    {name:'Victoire Absolue I',  desc:'+30% score Renaissance',                 effect:{type:'scoreMultPct',value:30}},
    {name:'Victoire Absolue II', desc:'+30% score Renaissance',                 effect:{type:'scoreMultPct',value:30}},
    {name:'Triomphe',            desc:'+25% production globale',                effect:{type:'prodBonusAll',value:25}},
    {name:'Lauriers de Mars',    desc:'+20% gain Éther',                        effect:{type:'etherGainPct',value:20}},
    {name:'Arès Triomphant',     desc:'+60% score, +30% prod, +25% Éther',      effect:{type:'scoreMultPct',value:60}},
  ]),
  are_L4_3: _n('are_L4_3','ares',4,3,'are_L3_1',280,[
    {name:'Guerre Totale I',    desc:'+25% production globale',                 effect:{type:'prodBonusAll',value:25}},
    {name:'Guerre Totale II',   desc:'+25% production globale',                 effect:{type:'prodBonusAll',value:25}},
    {name:'Conflagration',      desc:'+30% score Renaissance',                  effect:{type:'scoreMultPct',value:30}},
    {name:'Sang et Feu',        desc:'+20% gain Éther',                         effect:{type:'etherGainPct',value:20}},
    {name:'Apocalypse Martiale',desc:'+50% prod, +35% score',                   effect:{type:'prodBonusAll',value:50}},
  ]),
  are_L4_4: _n('are_L4_4','ares',4,4,'are_L3_2',280,[
    {name:'Forteresse Olympe I',  desc:'+30% prod militaire',                   effect:{type:'prodBonus',building:'forteresse,pylone,noeud_olympien',value:30}},
    {name:'Forteresse Olympe II', desc:'+30% prod militaire',                   effect:{type:'prodBonus',building:'forteresse,pylone,noeud_olympien',value:30}},
    {name:'Bastion Éternel',      desc:'+5 niveaux max forteresses',            effect:{type:'maxLevelBonus',building:'forteresse',value:5}},
    {name:'Rempart Divin',        desc:'+25% production globale',               effect:{type:'prodBonusAll',value:25}},
    {name:'Citadelle des Dieux',  desc:'+60% militaire, +6 niveaux max',        effect:{type:'maxLevelBonus',building:'forteresse',value:6}},
  ]),
  are_L4_5: _n('are_L4_5','ares',4,5,'are_L3_2',280,[
    {name:'Arsenal Légendaire I',  desc:'-20% coût bâtiments',                  effect:{type:'buildCostPct',value:-20}},
    {name:'Arsenal Légendaire II', desc:'-20% coût bâtiments',                  effect:{type:'buildCostPct',value:-20}},
    {name:'Armement Total',        desc:'+25% production globale',              effect:{type:'prodBonusAll',value:25}},
    {name:'Manufacture Divine',    desc:'+3 niveaux max tous bâtiments',        effect:{type:'maxLevelBonusAll',value:3}},
    {name:'Arès Forgeron',         desc:'-40% coûts, +4 niveaux max',           effect:{type:'maxLevelBonusAll',value:4}},
  ]),
  are_L4_6: _n('are_L4_6','ares',4,6,'are_L3_3',280,[
    {name:'Pillage Épique I',   desc:'+30% production globale',                 effect:{type:'prodBonusAll',value:30}},
    {name:'Pillage Épique II',  desc:'+30% production globale',                 effect:{type:'prodBonusAll',value:30}},
    {name:'Dévastation',        desc:'+35% score Renaissance',                  effect:{type:'scoreMultPct',value:35}},
    {name:'Rapine Divine',      desc:'-20% coût fouille',                       effect:{type:'digCostPct',value:-20}},
    {name:'Pillard Légendaire', desc:'+60% prod, +40% score',                   effect:{type:'prodBonusAll',value:60}},
  ]),
  are_L4_7: _n('are_L4_7','ares',4,7,'are_L3_3',280,[
    {name:'Arès Absolu I',   desc:'+30% production globale',                    effect:{type:'prodBonusAll',value:30}},
    {name:'Arès Absolu II',  desc:'+30% production globale',                    effect:{type:'prodBonusAll',value:30}},
    {name:'Fureur Divine',   desc:'+35% score Renaissance',                     effect:{type:'scoreMultPct',value:35}},
    {name:'Rage Olympienne', desc:'+25% gain Éther',                            effect:{type:'etherGainPct',value:25}},
    {name:'Dieu Guerre Absolu',desc:'+60% prod, +40% score, +30% Éther',        effect:{type:'prodBonusAll',value:60}},
  ]),
};

// ── Assemblage global ────────────────────────────────────────
const PANTHEON_NODES = {
  ...ZEUS_NODES,
  ...POSEIDON_NODES,
  ...HADES_NODES,
  ...ATHENA_NODES,
  ...APOLLON_NODES,
  ...ARES_NODES,
};

// ══════════════════════════════════════════════════════════════
// NŒUDS SUPRÊMES — déblocage quand tout l'arbre du dieu est maîtrisé
// Sans plafond — paliers : 10, 50, 100, 500, 1000, 5000, … (×5, ×2 alternés)
// ══════════════════════════════════════════════════════════════
const SUPREME_MILESTONES = (function() {
  // Séquence : 10, 50, 100, 500, 1000, 5000, 10000, 50000, ...
  // Alternance ×5, ×2, ×5, ×2 ...
  var ms = [10];
  var mult = [5,2,5,2,5,2,5,2,5,2];
  for (var i = 0; i < 40; i++) ms.push(ms[ms.length-1] * mult[i%2]);
  return ms; // [10, 50, 100, 500, 1000, 5000, 10000, ...]
})();

// Calcule à quel palier on est pour un total investi donné
function _supremeTier(total) {
  var tier = 0;
  for (var i = 0; i < SUPREME_MILESTONES.length; i++) {
    if (total >= SUPREME_MILESTONES[i]) tier = i + 1;
    else break;
  }
  return tier;
}

// Nœuds suprêmes par dieu — effet unique thématique sans plafond
const SUPREME_NODES = {
  zeus_supreme: {
    id: 'zeus_supreme', branch: 'zeus', level: 5, slot: 0,
    parent: null, uncapped: true, supreme: true,
    baseCost: 500,
    icon: '⚡', color: '#ffd54f',
    name: 'Toute-Puissance Olympienne',
    desc: 'Par palier atteint : +2% production globale permanente. Sans limite.',
    effect: { type: 'supremeProdAll', valuePerTier: 2 },
  },
  poseidon_supreme: {
    id: 'poseidon_supreme', branch: 'poseidon', level: 5, slot: 0,
    parent: null, uncapped: true, supreme: true,
    baseCost: 500,
    icon: '🌊', color: '#29b6f6',
    name: 'Profondeur Abyssale',
    desc: 'Par palier atteint : -1% coût fouille et +1% vitesse révélation. Sans limite.',
    effect: { type: 'supremeExplore', valuePerTier: 1 },
  },
  hades_supreme: {
    id: 'hades_supreme', branch: 'hades', level: 5, slot: 0,
    parent: null, uncapped: true, supreme: true,
    baseCost: 500,
    icon: '💀', color: '#7e57c2',
    name: 'Maître de l\'Éternité',
    desc: 'Par palier atteint : +1.5% gain d\'Éther permanent. Sans limite.',
    effect: { type: 'supremeEther', valuePerTier: 1.5 },
  },
  athena_supreme: {
    id: 'athena_supreme', branch: 'athena', level: 5, slot: 0,
    parent: null, uncapped: true, supreme: true,
    baseCost: 500,
    icon: '🦉', color: '#80cbc4',
    name: 'Sagesse Infinie',
    desc: 'Par palier atteint : +1 niveau max sur tous les bâtiments. Sans limite.',
    effect: { type: 'supremeMaxLevel', valuePerTier: 1 },
  },
  apollon_supreme: {
    id: 'apollon_supreme', branch: 'apollon', level: 5, slot: 0,
    parent: null, uncapped: true, supreme: true,
    baseCost: 500,
    icon: '☀️', color: '#ffb300',
    name: 'Lumière Éternelle',
    desc: 'Par palier atteint : +3% production Nourriture & Agriculture. Sans limite.',
    effect: { type: 'supremeFood', valuePerTier: 3 },
  },
  ares_supreme: {
    id: 'ares_supreme', branch: 'ares', level: 5, slot: 0,
    parent: null, uncapped: true, supreme: true,
    baseCost: 500,
    icon: '⚔️', color: '#ef5350',
    name: 'Furie Sans Fin',
    desc: 'Par palier atteint : +2% score de Renaissance et +1% vitesse Éclaireurs. Sans limite.',
    effect: { type: 'supremeScore', valuePerTier: 2 },
  },
};

// ══════════════════════════════════════════════════════════════
// PantheonManager
// ══════════════════════════════════════════════════════════════
class PantheonManager {
  constructor(resources) {
    this.rm = resources;
    // invested[nodeId] = rang actuel (0..5 pour nœuds normaux, 0..N pour suprêmes)
    this.invested = {};
    // Éther investi dans les nœuds suprêmes (séparé pour affichage palier)
    this.supremeInvested = {}; // { nodeId: totalEtherSpent }
    // Branches déverrouillées par zone
    this.unlockedBranches = new Set();
    this._bindEvents();
  }

  unlockBranch(branchId) {
    this.unlockedBranches.add(branchId);
    EventBus.emit('pantheon:branch_unlocked', { branchId });
  }

  isBranchUnlocked(branchId) {
    return this.unlockedBranches.has(branchId);
  }

  // ── Nœuds suprêmes ────────────────────────────────────────
  isTreeComplete(branchId) {
    // Vérifie que tous les 15 nœuds de la branche sont au rang max
    return Object.values(PANTHEON_NODES)
      .filter(nd => nd.branch === branchId)
      .every(nd => (this.invested[nd.id] || 0) >= nd.maxRank);
  }

  isSupremeUnlocked(nodeId) {
    const sn = SUPREME_NODES[nodeId];
    if (!sn) return false;
    return this.isBranchUnlocked(sn.branch) && this.isTreeComplete(sn.branch);
  }

  getSupremeTier(nodeId) {
    return _supremeTier(this.supremeInvested[nodeId] || 0);
  }

  getSupremeNextMilestone(nodeId) {
    const spent = this.supremeInvested[nodeId] || 0;
    const tier  = _supremeTier(spent);
    return SUPREME_MILESTONES[tier] || null; // null = déjà au-delà de la table (continue)
  }

  canLearnSupreme(nodeId) {
    const sn = SUPREME_NODES[nodeId];
    if (!sn) return { ok: false, reason: 'Nœud inconnu.' };
    if (!this.isSupremeUnlocked(nodeId)) {
      if (!this.isBranchUnlocked(sn.branch))
        return { ok: false, reason: 'Zone ' + sn.branch + ' non conquise.' };
      return { ok: false, reason: 'Complétez tout l\'arbre ' + sn.branch + ' d\'abord.' };
    }
    const cost = sn.baseCost;
    if (this.rm.get('ether') < cost)
      return { ok: false, reason: 'Éther insuffisant (' + cost + ' requis).' };
    return { ok: true };
  }

  learnSupreme(nodeId, amount, sx, sy) {
    const sn = SUPREME_NODES[nodeId];
    if (!sn) return false;
    const check = this.canLearnSupreme(nodeId);
    if (!check.ok) {
      EventBus.emit('ui:feedback', { text: check.reason, x: sx||0, y: sy||0, color: '#e05050' });
      return false;
    }
    const spend = Math.min(amount || sn.baseCost, Math.floor(this.rm.get('ether')));
    if (spend < sn.baseCost) {
      EventBus.emit('ui:feedback', { text: 'Éther insuffisant.', x: sx||0, y: sy||0, color: '#e05050' });
      return false;
    }
    // Dépense en multiples de baseCost
    const units = Math.floor(spend / sn.baseCost);
    const actualSpend = units * sn.baseCost;
    this.rm.spend({ ether: actualSpend });
    const prevTier = this.getSupremeTier(nodeId);
    this.supremeInvested[nodeId] = (this.supremeInvested[nodeId] || 0) + actualSpend;
    const newTier = this.getSupremeTier(nodeId);
    EventBus.emit('pantheon:supreme_invested', { nodeId, spent: actualSpend, tier: newTier });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    const msg = newTier > prevTier
      ? '✨ Palier ' + newTier + ' atteint ! — ' + sn.name
      : sn.name + ' +' + actualSpend + ' Éther';
    EventBus.emit('ui:feedback', { text: msg, x: sx||0, y: sy||0, color: '#ffd700' });
    return true;
  }

  unlockBranch(branchId) {
    this.unlockedBranches.add(branchId);
    EventBus.emit('pantheon:branch_unlocked', { branchId });
  }

  isBranchUnlocked(branchId) {
    return this.unlockedBranches.has(branchId);
  }

  // Coût du prochain rang d'un nœud
  getRankCost(nodeId) {
    const def = PANTHEON_NODES[nodeId];
    if (!def) return Infinity;
    const rank = this.invested[nodeId] || 0;
    if (rank >= def.maxRank) return Infinity;
    return def.baseCost * (rank + 1);
  }

  canLearn(nodeId) {
    const def = PANTHEON_NODES[nodeId];
    if (!def) return { ok: false, reason: 'Nœud inconnu.' };

    if (!this.isBranchUnlocked(def.branch)) {
      const branch = PANTHEON_BRANCHES.find(b => b.id === def.branch);
      return { ok: false, reason: (branch ? branch.label : def.branch) + ' non débloqué — completez la zone correspondante.' };
    }

    const rank = this.invested[nodeId] || 0;
    if (rank >= def.maxRank) return { ok: false, reason: 'Rang maximum atteint.' };

    // Prérequis : le nœud parent doit avoir au moins 1 rang
    if (def.parent) {
      const parentRank = this.invested[def.parent] || 0;
      if (parentRank < 1) {
        const pd = PANTHEON_NODES[def.parent];
        return { ok: false, reason: 'Prérequis : ' + (pd ? pd.ranks[0].name : def.parent) };
      }
    }

    const cost = this.getRankCost(nodeId);
    if (this.rm.get('ether') < cost) {
      return { ok: false, reason: 'Éther insuffisant (' + cost + ' requis).' };
    }
    return { ok: true };
  }

  learn(nodeId, sx, sy) {
    const check = this.canLearn(nodeId);
    if (!check.ok) {
      EventBus.emit('ui:feedback', { text: check.reason, x: sx || 0, y: sy || 0, color: '#e05050' });
      return false;
    }
    const def  = PANTHEON_NODES[nodeId];
    const cost = this.getRankCost(nodeId);
    this.rm.spend({ ether: cost });
    const newRank = (this.invested[nodeId] || 0) + 1;
    this.invested[nodeId] = newRank;
    const rankDef = def.ranks[newRank - 1];
    EventBus.emit('pantheon:node_learned', { nodeId, def, rank: newRank });
    EventBus.emit('talent:applied', { id: nodeId });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    const isMastered = newRank >= def.maxRank;
    EventBus.emit('ui:feedback', {
      text: rankDef.name + (isMastered ? ' ✓ Maîtrisé !' : ' (rang ' + newRank + '/' + def.maxRank + ')'),
      x: sx || 0, y: sy || 0, color: isMastered ? '#ff9900' : '#ffd700'
    });
    return true;
  }

  getNodeState(nodeId) {
    const def  = PANTHEON_NODES[nodeId];
    if (!def) return 'locked';
    const rank = this.invested[nodeId] || 0;
    if (rank >= def.maxRank) return 'mastered';
    if (rank > 0) return 'learned';
    return this.canLearn(nodeId).ok ? 'available' : 'locked';
  }

  getNodeRank(nodeId)    { return this.invested[nodeId] || 0; }
  getNodeMaxRank(nodeId) { const d = PANTHEON_NODES[nodeId]; return d ? d.maxRank : 0; }
  getAllNodes()           { return PANTHEON_NODES; }
  getAllBranches()        { return PANTHEON_BRANCHES; }

  // ── Accumulation des effets ────────────────────────────────
  _sum(predicate) {
    let total = 0;
    Object.entries(this.invested).forEach(([id, rank]) => {
      if (!rank) return;
      const def = PANTHEON_NODES[id];
      if (!def) return;
      for (let r = 1; r <= rank; r++) {
        const rd = def.ranks[r - 1];
        if (rd && rd.effect) total += predicate(rd.effect) || 0;
      }
    });
    return total;
  }

  getGlobalProdBonus()    { return this._sum(e => e.type==='prodBonusAll' ? e.value : 0); }
  getBuildingProdBonus(bid) {
    return this._sum(e => {
      if (e.type==='prodBonus' && e.building && e.building.split(',').includes(bid)) return e.value;
      return 0;
    });
  }
  getMaxLevelBonus(bid) {
    return this._sum(e => {
      if (e.type==='maxLevelBonus' && e.building && e.building.split(',').includes(bid)) return e.value;
      if (e.type==='maxLevelBonusAll') return e.value;
      return 0;
    });
  }
  getEtherGainBonus()      { return this._sum(e => e.type==='etherGainPct'    ? e.value : 0); }
  getCodexPagesBonus()     { return this._sum(e => e.type==='bonusPages'      ? e.value : 0); }
  getCodexPagesPctBonus()  { return this._sum(e => e.type==='codexPagesMult'  ? e.value : 0); }
  getDigCostBonus()        { return this._sum(e => e.type==='digCostPct'      ? e.value : 0); }
  getScoreBonus()          { return this._sum(e => e.type==='scoreMultPct'    ? e.value : 0); }
  getBuildCostBonus()      { return this._sum(e => e.type==='buildCostPct'    ? e.value : 0); }
  getScoutSlotsBonus()     { return this._sum(e => e.type==='scoutSlots'      ? e.value : 0); }
  getScoutSpeedBonus()     { return this._sum(e => e.type==='scoutSpeedPct'   ? e.value : 0); }
  getRevealRangeBonus()    { return this._sum(e => e.type==='haloRange'       ? e.value : 0); }
  getPopCapBonus()         { return this._sum(e => e.type==='popCapPct'       ? e.value : 0); }
  getRevealSpeedBonus()    { return this._sum(e => e.type==='revealSpeed'     ? e.value : 0); }
  getScoutExtraReveal()    { return this._sum(e => e.type==='scoutExtraReveal'? e.value : 0); }

  // ── Bonus suprêmes ─────────────────────────────────────────
  _supBonus(nodeId) { return _supremeTier(this.supremeInvested[nodeId] || 0); }
  getSupremeProdBonus()     { return this._supBonus('zeus_supreme')    * 2;   } // +2% / palier
  getSupremeEtherBonus()    { return this._supBonus('hades_supreme')   * 1.5; } // +1.5% / palier
  getSupremeMaxLevelBonus() { return this._supBonus('athena_supreme')  * 1;   } // +1 / palier
  getSupremeFoodBonus()     { return this._supBonus('apollon_supreme') * 3;   } // +3% / palier
  getSupremeScoreBonus()    { return this._supBonus('ares_supreme')    * 2;   } // +2% / palier
  getSupremeDigBonus()      { return this._supBonus('poseidon_supreme')* 1;   } // -1% fouille / palier
  getSupremeRevealBonus()   { return this._supBonus('poseidon_supreme')* 1;   } // +1% révélation / palier

  // Accès global (incluant nœuds suprêmes)
  getGlobalProdBonus() {
    return this._sum(e => e.type==='prodBonusAll' ? e.value : 0)
         + this.getSupremeProdBonus();
  }

  _bindEvents() {
    EventBus.on('zone:unlocked', (d) => {
      const branch = PANTHEON_BRANCHES.find(b => b.zoneId === d.zoneId);
      if (branch) this.unlockBranch(branch.id);
    });
  }

  serialize() {
    return {
      invested:         this.invested,
      supremeInvested:  this.supremeInvested,
      unlockedBranches: Array.from(this.unlockedBranches),
    };
  }

  deserialize(data) {
    if (!data) return;
    this.invested         = data.invested         || {};
    this.supremeInvested  = data.supremeInvested  || {};
    if (data.unlockedBranches) {
      this.unlockedBranches = new Set(data.unlockedBranches);
    }
  }
}
