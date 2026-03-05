/* TalentManager.js — v0.5.0
   DEUX arbres :
   - DRACHMES (in-run, reset au prestige)
   - ETHER (permanent inter-prestige, déblocage des Ères)
   Coûts Éther exponentiels pour rendre le farm satisfaisant.
*/

const TALENT_DEFS = {
  // AGRICULTURE
  farm_lvl1:  { id:'farm_lvl1',  branch:'agriculture', col:0, name:'Labourage I',
    desc:'Ferme & Verger : niv max +15.',      icon:'\u{1F9F1}',
    cost:{drachmes:500,bois:100},              requires:[],
    effect:{type:'maxLevel',building:'farm,verger,jardins',value:15} },
  farm_lvl2:  { id:'farm_lvl2',  branch:'agriculture', col:0, name:'Labourage II',
    desc:'Ferme & Verger : niv max +25.',      icon:'\u{1F9F1}',
    cost:{drachmes:2000,bois:500,nourr:200},   requires:['farm_lvl1'],
    effect:{type:'maxLevel',building:'farm,verger,jardins',value:25} },
  farm_lvl3:  { id:'farm_lvl3',  branch:'agriculture', col:0, name:'Benediction des Champs',
    desc:'Ferme & Verger : niv max +40.',      icon:'\u{1F9F1}',
    cost:{drachmes:8000,bois:2000,fer:100,nourr:1000}, requires:['farm_lvl2'],
    effect:{type:'maxLevel',building:'farm,verger,jardins',value:40} },
  farm_prod1: { id:'farm_prod1', branch:'agriculture', col:1, name:'Semences I',
    desc:'Ferme & Verger : prod +30%.',        icon:'\u{1F33B}',
    cost:{drachmes:800,bois:200,nourr:100},    requires:[],
    effect:{type:'prodBonus',building:'farm,verger,jardins',value:30} },
  farm_prod2: { id:'farm_prod2', branch:'agriculture', col:1, name:'Semences II',
    desc:'Ferme & Verger : prod +60%.',        icon:'\u{1F33B}',
    cost:{drachmes:3000,bois:800,fer:20,nourr:500}, requires:['farm_prod1'],
    effect:{type:'prodBonus',building:'farm,verger,jardins',value:60} },
  farm_prod3: { id:'farm_prod3', branch:'agriculture', col:1, name:"Grace de Demeter",
    desc:'Ferme & Verger : prod +120%.',       icon:'\u2728',
    cost:{drachmes:15000,bois:4000,fer:200,nourr:3000}, requires:['farm_prod2'],
    effect:{type:'prodBonus',building:'farm,verger,jardins',value:120} },

  // SYLVICULTURE
  lumb_lvl1:  { id:'lumb_lvl1',  branch:'sylviculture', col:0, name:'Haches I',
    desc:'Bucherons & Halle : niv max +15.',   icon:'\u{1FAA8}',
    cost:{drachmes:500,bois:150},              requires:[],
    effect:{type:'maxLevel',building:'lumber,halle,bosquet',value:15} },
  lumb_lvl2:  { id:'lumb_lvl2',  branch:'sylviculture', col:0, name:'Haches II',
    desc:'Bucherons & Halle : niv max +25.',   icon:'\u{1FAA8}',
    cost:{drachmes:2000,bois:800},             requires:['lumb_lvl1'],
    effect:{type:'maxLevel',building:'lumber,halle,bosquet',value:25} },
  lumb_lvl3:  { id:'lumb_lvl3',  branch:'sylviculture', col:0, name:'Esprit de la Foret',
    desc:'Bucherons & Halle : niv max +40.',   icon:'\u{1FAA8}',
    cost:{drachmes:8000,bois:4000,fer:100},    requires:['lumb_lvl2'],
    effect:{type:'maxLevel',building:'lumber,halle,bosquet',value:40} },
  lumb_prod1: { id:'lumb_prod1', branch:'sylviculture', col:1, name:'Forets I',
    desc:'Bucherons & Halle : prod +30%.',     icon:'\u{1F332}',
    cost:{drachmes:800,bois:300},              requires:[],
    effect:{type:'prodBonus',building:'lumber,halle,bosquet',value:30} },
  lumb_prod2: { id:'lumb_prod2', branch:'sylviculture', col:1, name:'Forets II',
    desc:'Bucherons & Halle : prod +60%.',     icon:'\u{1F332}',
    cost:{drachmes:3000,bois:1500,fer:20},     requires:['lumb_prod1'],
    effect:{type:'prodBonus',building:'lumber,halle,bosquet',value:60} },
  lumb_prod3: { id:'lumb_prod3', branch:'sylviculture', col:1, name:'Don des Dryades',
    desc:'Bucherons & Halle : prod +120%.',    icon:'\u{1F9DA}',
    cost:{drachmes:15000,bois:8000,fer:200},   requires:['lumb_prod2'],
    effect:{type:'prodBonus',building:'lumber,halle,bosquet',value:120} },

  // METALLURGIE
  cu_lvl1:    { id:'cu_lvl1',    branch:'metallurgie', col:0, name:'Cuivre I',
    desc:'Mines Cuivre : niv max +15.',        icon:'\u26CF\uFE0F',
    cost:{drachmes:800,bois:200,fer:20},       requires:[],
    effect:{type:'maxLevel',building:'mine_copper,atelier_forgeron,tresor',value:15} },
  cu_lvl2:    { id:'cu_lvl2',    branch:'metallurgie', col:0, name:'Cuivre II',
    desc:'Mines Cuivre : niv max +25.',        icon:'\u26CF\uFE0F',
    cost:{drachmes:3000,bois:800,fer:100},     requires:['cu_lvl1'],
    effect:{type:'maxLevel',building:'mine_copper,atelier_forgeron,tresor',value:25} },
  cu_lvl3:    { id:'cu_lvl3',    branch:'metallurgie', col:0, name:'Maitre Orfevre',
    desc:'Mines Cuivre : niv max +40.',        icon:'\u26CF\uFE0F',
    cost:{drachmes:12000,bois:3000,fer:500},   requires:['cu_lvl2'],
    effect:{type:'maxLevel',building:'mine_copper,atelier_forgeron,tresor',value:40} },
  cu_prod1:   { id:'cu_prod1',   branch:'metallurgie', col:1, name:'Fonderie I',
    desc:'Mines Cuivre : prod +30%.',          icon:'\u{1F4B0}',
    cost:{drachmes:1000,bois:200,fer:30},      requires:[],
    effect:{type:'prodBonus',building:'mine_copper,atelier_forgeron,tresor',value:30} },
  cu_prod2:   { id:'cu_prod2',   branch:'metallurgie', col:1, name:'Fonderie II',
    desc:'Mines Cuivre : prod +60%.',          icon:'\u{1F4B0}',
    cost:{drachmes:4000,bois:800,fer:150},     requires:['cu_prod1'],
    effect:{type:'prodBonus',building:'mine_copper,atelier_forgeron,tresor',value:60} },
  cu_prod3:   { id:'cu_prod3',   branch:'metallurgie', col:1, name:"Feu d'Hephaistos",
    desc:'Mines Cuivre : prod +120%.',         icon:'\u{1F3F9}',
    cost:{drachmes:18000,bois:4000,fer:800},   requires:['cu_prod2'],
    effect:{type:'prodBonus',building:'mine_copper,atelier_forgeron,tresor',value:120} },

  // SIDERURGIE
  fe_lvl1:    { id:'fe_lvl1',    branch:'siderurgie', col:0, name:'Fer Celeste I',
    desc:'Mines Fer : niv max +15.',           icon:'\u2699\uFE0F',
    cost:{drachmes:1200,bois:300,fer:50},      requires:[],
    effect:{type:'maxLevel',building:'mine_iron,fonderie_celeste,forge_divine',value:15} },
  fe_lvl2:    { id:'fe_lvl2',    branch:'siderurgie', col:0, name:'Fer Celeste II',
    desc:'Mines Fer : niv max +25.',           icon:'\u2699\uFE0F',
    cost:{drachmes:5000,bois:1200,fer:200},    requires:['fe_lvl1'],
    effect:{type:'maxLevel',building:'mine_iron,fonderie_celeste,forge_divine',value:25} },
  fe_lvl3:    { id:'fe_lvl3',    branch:'siderurgie', col:0, name:'Acier Divin',
    desc:'Mines Fer : niv max +40.',           icon:'\u2699\uFE0F',
    cost:{drachmes:20000,bois:5000,fer:1000},  requires:['fe_lvl2'],
    effect:{type:'maxLevel',building:'mine_iron,fonderie_celeste,forge_divine',value:40} },
  fe_prod1:   { id:'fe_prod1',   branch:'siderurgie', col:1, name:'Forge I',
    desc:'Mines Fer : prod +30%.',             icon:'\u{1F528}',
    cost:{drachmes:1500,bois:400,fer:80},      requires:[],
    effect:{type:'prodBonus',building:'mine_iron,fonderie_celeste,forge_divine',value:30} },
  fe_prod2:   { id:'fe_prod2',   branch:'siderurgie', col:1, name:'Forge II',
    desc:'Mines Fer : prod +60%.',             icon:'\u{1F528}',
    cost:{drachmes:6000,bois:1500,fer:300},    requires:['fe_prod1'],
    effect:{type:'prodBonus',building:'mine_iron,fonderie_celeste,forge_divine',value:60} },
  fe_prod3:   { id:'fe_prod3',   branch:'siderurgie', col:1, name:'Maitre du Fer Divin',
    desc:'Mines Fer : prod +120%.',            icon:'\u26A1',
    cost:{drachmes:25000,bois:6000,fer:1500},  requires:['fe_prod2'],
    effect:{type:'prodBonus',building:'mine_iron,fonderie_celeste,forge_divine',value:120} },

  // POPULATION
  pop_cap1:   { id:'pop_cap1',   branch:'population', col:0, name:'Urbanisme I',
    desc:'Logements : capacite habitants +50%.', icon:'\u{1F3D8}\uFE0F',
    cost:{drachmes:1000,bois:400,nourr:200},   requires:[],
    effect:{type:'popCap',value:50} },
  pop_cap2:   { id:'pop_cap2',   branch:'population', col:0, name:'Urbanisme II',
    desc:'Logements : capacite habitants +100%.', icon:'\u{1F3D8}\uFE0F',
    cost:{drachmes:5000,bois:2000,fer:100,nourr:1000}, requires:['pop_cap1'],
    effect:{type:'popCap',value:100} },
  pop_cap3:   { id:'pop_cap3',   branch:'population', col:0, name:'Metropole',
    desc:'Logements : capacite habitants +200%.', icon:'\u{1F3D8}\uFE0F',
    cost:{drachmes:20000,bois:8000,fer:500,nourr:5000}, requires:['pop_cap2'],
    effect:{type:'popCap',value:200} },
  pop_mult1:  { id:'pop_mult1',  branch:'population', col:1, name:'Prosperite I',
    desc:'Chaque habitant +0.5% prod. globale.', icon:'\u{1F46B}',
    cost:{drachmes:1500,nourr:500},             requires:[],
    effect:{type:'popProdBonus',value:0.5} },
  pop_mult2:  { id:'pop_mult2',  branch:'population', col:1, name:'Prosperite II',
    desc:'Chaque habitant +1% prod. globale.',   icon:'\u{1F46B}',
    cost:{drachmes:6000,bois:1000,nourr:2000},  requires:['pop_mult1'],
    effect:{type:'popProdBonus',value:1.0} },
  pop_mult3:  { id:'pop_mult3',  branch:'population', col:1, name:"Age d'Or",
    desc:'Chaque habitant +2% prod. globale.',   icon:'\u{1F451}',
    cost:{drachmes:25000,bois:5000,fer:300,nourr:10000}, requires:['pop_mult2'],
    effect:{type:'popProdBonus',value:2.0} },

  // INGENIERIE
  engi_1:     { id:'engi_1',     branch:'ingenierie', col:0, name:'Architecture',
    desc:'Tous batiments : niv max +8.',        icon:'\u{1F3DB}\uFE0F',
    cost:{drachmes:2000,bois:600,fer:50},       requires:[],
    effect:{type:'maxLevelAll',value:8} },
  engi_2:     { id:'engi_2',     branch:'ingenierie', col:0, name:'Fouilles Rapides',
    desc:'Cout fouille -25%.',                  icon:'\u26CF\uFE0F',
    cost:{drachmes:4000,bois:1000,fer:100},     requires:['engi_1'],
    effect:{type:'digCostReduction',value:0.25} },
  engi_3:     { id:'engi_3',     branch:'ingenierie', col:0, name:'Genie Olympien',
    desc:'Tous batiments : prod +15%.',         icon:'\u{1F31F}',
    cost:{drachmes:15000,bois:4000,fer:500},    requires:['engi_2'],
    effect:{type:'prodBonusAll',value:15} },
  engi_4:     { id:'engi_4',     branch:'ingenierie', col:0, name:'Maitrise Absolue',
    desc:'Tous batiments : niv max +15 supp.',  icon:'\u{1F4AA}',
    cost:{drachmes:50000,bois:15000,fer:2000},  requires:['engi_3'],
    effect:{type:'maxLevelAll',value:15} },

  // ENERGIE
  energy_1:   { id:'energy_1',   branch:'energie', col:0, name:'Reseau de Pylones',
    desc:'Pylones : portee +1 hex.',            icon:'\u26A1',
    cost:{drachmes:3000,bois:800,fer:200},      requires:[],
    effect:{type:'pyloneRange',value:1} },
  energy_2:   { id:'energy_2',   branch:'energie', col:0, name:'Conductivite Divine',
    desc:'Foudre prod. +50%.',                  icon:'\u26A1',
    cost:{drachmes:10000,bois:2000,fer:500},    requires:['energy_1'],
    effect:{type:'prodBonus',building:'pylone,stele_zeus,noeud',value:50} },
  energy_3:   { id:'energy_3',   branch:'energie', col:0, name:'Tempete de Zeus',
    desc:'Foudre prod. +100%.',                 icon:'\u{1F329}\uFE0F',
    cost:{drachmes:30000,bois:5000,fer:1500},   requires:['energy_2'],
    effect:{type:'prodBonus',building:'pylone,stele_zeus,noeud',value:100} },
};

// ─── ARBRE ETHER ───────────────────────────────────────────
const ETHER_DEFS = {
  ere2: { id:'ere2', branch:'eres', name:"Age Classique",
    desc:"Deverrouille l'Ere 2 : Verger, Halle, Fonderie, Maisons, Pylones, Moulin, Alambic, Agora, Forteresse...",
    icon:'\u{1F3DB}\uFE0F', cost:{ether:100}, requires:[],
    effect:{type:'unlockEra',era:2} },
  ere3: { id:'ere3', branch:'eres', name:"Age Divin",
    desc:"Deverrouille l'Ere 3 : Jardins Elysees, Bosquet Eternel, Tresor Hephaistos, Forge Divine, Senat, Omphalos...",
    icon:'\u{1F31F}', cost:{ether:10000}, requires:['ere2'],
    effect:{type:'unlockEra',era:3} },

  relique_amphore: { id:'relique_amphore', branch:'reliques', name:"Amphore d'Abondance",
    desc:'+20% Ambroisie et Nectar (permanent).',
    icon:'\u{1FAD9}', cost:{ether:50}, requires:[],
    effect:{type:'relique',key:'amphore'} },
  relique_enclume: { id:'relique_enclume', branch:'reliques', name:"Enclume d'Hephaistos",
    desc:'Mines actives sans route (prod. -50% si non connectee).',
    icon:'\u{1F6E0}\uFE0F', cost:{ether:80}, requires:[],
    effect:{type:'relique',key:'enclume'} },
  relique_carte:   { id:'relique_carte',   branch:'reliques', name:'Carte des Titans',
    desc:'Depart : anneau 2 revele (7 cases de plus).',
    icon:'\u{1F5FA}\uFE0F', cost:{ether:60}, requires:[],
    effect:{type:'relique',key:'carte'} },
  relique_graine:  { id:'relique_graine',  branch:'reliques', name:'Graine Eternelle',
    desc:'Les forets plantees ne peuvent plus etre rasees.',
    icon:'\u{1F331}', cost:{ether:40}, requires:[],
    effect:{type:'relique',key:'graine'} },
  relique_eclair:  { id:'relique_eclair',  branch:'reliques', name:'Eclair de Zeus',
    desc:'Les 30 premieres fouilles sont gratuites par partie.',
    icon:'\u26A1', cost:{ether:75}, requires:[],
    effect:{type:'relique',key:'eclair'} },
  relique_omphalos:{ id:'relique_omphalos',branch:'reliques', name:'Pierre Omphalos',
    desc:'+50% Ether gagne a chaque prestige.',
    icon:'\u{1FAA8}', cost:{ether:500}, requires:['ere2'],
    effect:{type:'relique',key:'omphalos'} },

  const_prod:  { id:'const_prod',  branch:'constellations', name:'Const. de la Forge',
    desc:'+10% production globale permanente.',
    icon:'\u2B50', cost:{ether:2000}, requires:['ere2'],
    effect:{type:'constellation',bonus:'prodAll',value:10} },
  const_dig:   { id:'const_dig',   branch:'constellations', name:'Const. du Pionnier',
    desc:'Cout fouille -10% permanent.',
    icon:'\u2B50', cost:{ether:1500}, requires:['ere2'],
    effect:{type:'constellation',bonus:'digCost',value:0.1} },
  const_pop:   { id:'const_pop',   branch:'constellations', name:'Const. du Peuple',
    desc:'+25% capacite habitants permanente.',
    icon:'\u2B50', cost:{ether:2500}, requires:['ere2'],
    effect:{type:'constellation',bonus:'popCap',value:25} },
  const_ether: { id:'const_ether', branch:'constellations', name:"Const. de l'Eternite",
    desc:'+25% Ether gagne au prestige.',
    icon:'\u2B50', cost:{ether:5000}, requires:['ere3'],
    effect:{type:'constellation',bonus:'etherGain',value:25} },
  const_prod2: { id:'const_prod2', branch:'constellations', name:'Const. Olympienne',
    desc:'+25% production globale permanente.',
    icon:'\u{1F4AB}', cost:{ether:25000}, requires:['const_prod','ere3'],
    effect:{type:'constellation',bonus:'prodAll',value:25} },

  // ── BRANCHE PRODUCTION (Phase 5) ────────────────────────
  prod_all1:  { id:'prod_all1',  branch:'production', name:'Forge des Titans I',
    desc:'Production globale +15%.',           icon:'\u{1F525}',
    cost:{ether:80}, requires:[],
    effect:{type:'prodBonusAll', value:15} },
  prod_all2:  { id:'prod_all2',  branch:'production', name:'Forge des Titans II',
    desc:'Production globale +30%.',           icon:'\u{1F525}',
    cost:{ether:200}, requires:['prod_all1'],
    effect:{type:'prodBonusAll', value:30} },
  prod_all3:  { id:'prod_all3',  branch:'production', name:'Forge des Titans III',
    desc:'Production globale +50%.',           icon:'\u{1F525}',
    cost:{ether:500}, requires:['prod_all2'],
    effect:{type:'prodBonusAll', value:50} },
  prod_food1: { id:'prod_food1', branch:'production', name:'Abondance I',
    desc:'Nourr & Nectar & Ambroisie +40%.',   icon:'\u{1F33E}',
    cost:{ether:120}, requires:[],
    effect:{type:'prodBonus', building:'farm,verger,jardins,distillerie', value:40} },
  prod_food2: { id:'prod_food2', branch:'production', name:'Abondance II',
    desc:'Nourr & Nectar & Ambroisie +80%.',   icon:'\u{1F33E}',
    cost:{ether:350}, requires:['prod_food1'],
    effect:{type:'prodBonus', building:'farm,verger,jardins,distillerie', value:80} },
  prod_craft1:{ id:'prod_craft1',branch:'production', name:'Artisanat Divin I',
    desc:'Forge, Mine, Fonderie +40%.',        icon:'\u{1F528}',
    cost:{ether:120}, requires:[],
    effect:{type:'prodBonus', building:'mine_copper,mine_iron,atelier_forgeron,fonderie_celeste,forge_divine,tresor', value:40} },
  prod_craft2:{ id:'prod_craft2',branch:'production', name:'Artisanat Divin II',
    desc:'Forge, Mine, Fonderie +80%.',        icon:'\u{1F528}',
    cost:{ether:350}, requires:['prod_craft1'],
    effect:{type:'prodBonus', building:'mine_copper,mine_iron,atelier_forgeron,fonderie_celeste,forge_divine,tresor', value:80} },

  // ── BRANCHE EXPLORATION (Phase 5) ───────────────────────
  expl_dig1:  { id:'expl_dig1',  branch:'exploration', name:'Pionnier I',
    desc:'Cout fouilles -20%.',                icon:'\u{1F9ED}',
    cost:{ether:60}, requires:[],
    effect:{type:'digCostReduction', value:0.20} },
  expl_dig2:  { id:'expl_dig2',  branch:'exploration', name:'Pionnier II',
    desc:'Cout fouilles -35%.',                icon:'\u{1F9ED}',
    cost:{ether:180}, requires:['expl_dig1'],
    effect:{type:'digCostReduction', value:0.35} },
  expl_scout1:{ id:'expl_scout1',branch:'exploration', name:'Eclaireur I',
    desc:'Vitesse scouts +50%.',               icon:'\u{1F50D}',
    cost:{ether:90}, requires:[],
    effect:{type:'scoutSpeed', value:0.50} },
  expl_scout2:{ id:'expl_scout2',branch:'exploration', name:'Eclaireur II',
    desc:'Vitesse scouts +100%.',              icon:'\u{1F50D}',
    cost:{ether:250}, requires:['expl_scout1'],
    effect:{type:'scoutSpeed', value:1.00} },
  expl_reveal1:{id:'expl_reveal1',branch:'exploration', name:'Cartographe I',
    desc:'Depart : 2 anneaux supplementaires reveles.', icon:'\u{1F5FA}\uFE0F',
    cost:{ether:150}, requires:[],
    effect:{type:'startReveal', value:2} },
  expl_radius1:{id:'expl_radius1',branch:'exploration', name:'Cartographe II',
    desc:'Rayon de vision des scouts +1.',     icon:'\u{1F5FA}\uFE0F',
    cost:{ether:300}, requires:['expl_reveal1'],
    effect:{type:'scoutRadius', value:1} },
  expl_free1: { id:'expl_free1', branch:'exploration', name:'Sens Divin',
    desc:'1 fouille gratuite par minute.',     icon:'\u2728',
    cost:{ether:400}, requires:['expl_dig2'],
    effect:{type:'freeDigPerMin', value:1} },

  // ── BRANCHE PRESTIGE (Phase 5) ───────────────────────────
  pres_ether1:{ id:'pres_ether1',branch:'prestige_branch', name:'Cristallisation I',
    desc:'Ether gagne au prestige +20%.',      icon:'\u{1F4AB}',
    cost:{ether:100}, requires:[],
    effect:{type:'etherGainPct', value:20} },
  pres_ether2:{ id:'pres_ether2',branch:'prestige_branch', name:'Cristallisation II',
    desc:'Ether gagne au prestige +40%.',      icon:'\u{1F4AB}',
    cost:{ether:280}, requires:['pres_ether1'],
    effect:{type:'etherGainPct', value:40} },
  pres_ether3:{ id:'pres_ether3',branch:'prestige_branch', name:'Cristallisation III',
    desc:'Ether gagne au prestige +75%.',      icon:'\u{1F4AB}',
    cost:{ether:700}, requires:['pres_ether2'],
    effect:{type:'etherGainPct', value:75} },
  pres_score1:{ id:'pres_score1',branch:'prestige_branch', name:'Memoire Olympienne I',
    desc:'Score Renaissance +25%.',            icon:'\u{1F3C6}',
    cost:{ether:150}, requires:[],
    effect:{type:'scoreMult', value:25} },
  pres_score2:{ id:'pres_score2',branch:'prestige_branch', name:'Memoire Olympienne II',
    desc:'Score Renaissance +50%.',            icon:'\u{1F3C6}',
    cost:{ether:400}, requires:['pres_score1'],
    effect:{type:'scoreMult', value:50} },
  pres_start1:{ id:'pres_start1',branch:'prestige_branch', name:'Heritage I',
    desc:'Depart avec +500 de chaque ressource de base.',icon:'\u{1F381}',
    cost:{ether:200}, requires:[],
    effect:{type:'startBonus', value:500} },
  pres_start2:{ id:'pres_start2',branch:'prestige_branch', name:'Heritage II',
    desc:'Depart avec +2000 de chaque ressource de base.',icon:'\u{1F381}',
    cost:{ether:600}, requires:['pres_start1'],
    effect:{type:'startBonus', value:2000} },
};

const TALENT_BRANCHES = [
  { id:'agriculture',  label:'Agriculture',  icon:'\u{1F33E}', color:'#8bc34a',
    cols:[['farm_lvl1','farm_lvl2','farm_lvl3'],['farm_prod1','farm_prod2','farm_prod3']],
    colLabels:['Niveau Max','Production %'] },
  { id:'sylviculture', label:'Sylviculture', icon:'\u{1F332}', color:'#4caf50',
    cols:[['lumb_lvl1','lumb_lvl2','lumb_lvl3'],['lumb_prod1','lumb_prod2','lumb_prod3']],
    colLabels:['Niveau Max','Production %'] },
  { id:'metallurgie',  label:'Metallurgie',  icon:'\u26CF\uFE0F', color:'#b0876a',
    cols:[['cu_lvl1','cu_lvl2','cu_lvl3'],['cu_prod1','cu_prod2','cu_prod3']],
    colLabels:['Niveau Max','Production %'] },
  { id:'siderurgie',   label:'Siderurgie',   icon:'\u2699\uFE0F', color:'#78909c',
    cols:[['fe_lvl1','fe_lvl2','fe_lvl3'],['fe_prod1','fe_prod2','fe_prod3']],
    colLabels:['Niveau Max','Production %'] },
  { id:'population',   label:'Population',   icon:'\u{1F3D8}\uFE0F', color:'#f9a825',
    cols:[['pop_cap1','pop_cap2','pop_cap3'],['pop_mult1','pop_mult2','pop_mult3']],
    colLabels:['Capacite','Multiplicateur'] },
  { id:'ingenierie',   label:'Ingenierie',   icon:'\u{1F3DB}\uFE0F', color:'#ff9800',
    cols:[['engi_1','engi_2','engi_3','engi_4']], colLabels:['Global'] },
  { id:'energie',      label:'Energie',      icon:'\u26A1', color:'#ffe082',
    cols:[['energy_1','energy_2','energy_3']], colLabels:['Pylones & Foudre'] },
];

const ETHER_BRANCHES = [
  { id:'eres',          label:'Eres',          icon:'\u{1F3DB}\uFE0F', color:'#c0a060',
    cols:[['ere2','ere3']], colLabels:['Progression'] },
  { id:'reliques',      label:'Reliques',       icon:'\u{1FAD9}', color:'#9c6fce',
    cols:[['relique_amphore','relique_enclume','relique_carte'],
          ['relique_graine','relique_eclair','relique_omphalos']],
    colLabels:['Reliques I','Reliques II'] },
  { id:'constellations',label:'Constellations', icon:'\u2B50', color:'#4fc3f7',
    cols:[['const_prod','const_dig','const_pop','const_ether','const_prod2']],
    colLabels:['Etoiles'] },
  { id:'production',    label:'Production',     icon:'\u{1F525}', color:'#ff7043',
    cols:[['prod_all1','prod_all2','prod_all3'],
          ['prod_food1','prod_food2'],
          ['prod_craft1','prod_craft2']],
    colLabels:['Global','Nourriture','Artisanat'] },
  { id:'exploration',   label:'Exploration',    icon:'\u{1F9ED}', color:'#26c6da',
    cols:[['expl_dig1','expl_dig2','expl_free1'],
          ['expl_scout1','expl_scout2'],
          ['expl_reveal1','expl_radius1']],
    colLabels:['Fouilles','Scouts','Carte'] },
  { id:'prestige_branch',label:'Prestige',      icon:'\u{1F4AB}', color:'#ab47bc',
    cols:[['pres_ether1','pres_ether2','pres_ether3'],
          ['pres_score1','pres_score2'],
          ['pres_start1','pres_start2']],
    colLabels:['Ether','Score','Heritage'] },
];

class TalentManager {
  constructor(rm) {
    this.rm           = rm;
    this.learned      = {};
    this.etherLearned = {};
  }

  getUnlockedEra() {
    if (this.etherLearned.ere3) return 3;
    if (this.etherLearned.ere2) return 2;
    return 1;
  }

  hasRelique(key) { return !!this.etherLearned['relique_' + key]; }

  getConstellationBonus(type) {
    let total = 0;
    Object.keys(this.etherLearned).forEach(id => {
      const def = ETHER_DEFS[id];
      if (def && def.effect && def.effect.type === 'constellation' &&
          def.effect.bonus === type) total += def.effect.value;
    });
    return total;
  }

  // ARBRE DRACHMES
  canLearn(id) {
    if (this.learned[id]) return { ok:false, reason:'Deja acquis.' };
    const def = TALENT_DEFS[id];
    if (!def) return { ok:false, reason:'Inconnu.' };
    for (const req of def.requires) {
      if (!this.learned[req]) {
        const r = TALENT_DEFS[req];
        return { ok:false, reason:'Requiert : ' + (r ? r.name : req) };
      }
    }
    if (!this.rm.canAfford(def.cost)) return { ok:false, reason:'Ressources insuffisantes.' };
    return { ok:true };
  }

  learn(id, sx, sy) {
    const check = this.canLearn(id);
    if (!check.ok) { EventBus.emit('ui:feedback',{text:check.reason,x:sx||0,y:sy||0,color:'#e05050'}); return false; }
    const def = TALENT_DEFS[id];
    this.rm.spend(def.cost);
    this.learned[id] = true;
    EventBus.emit('talent:applied', { id });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    EventBus.emit('ui:feedback',{text:def.icon+' '+def.name+' !',x:sx||0,y:sy||0,color:'#f0d060'});
    return true;
  }

  // ARBRE ETHER
  canLearnEther(id) {
    if (this.etherLearned[id]) return { ok:false, reason:'Deja acquis.' };
    const def = ETHER_DEFS[id];
    if (!def) return { ok:false, reason:'Inconnu.' };
    for (const req of def.requires) {
      if (!this.etherLearned[req]) {
        const r = ETHER_DEFS[req];
        return { ok:false, reason:'Requiert : ' + (r ? r.name : req) };
      }
    }
    if (!this.rm.canAfford(def.cost)) return { ok:false, reason:'Ether insuffisant.' };
    return { ok:true };
  }

  learnEther(id, sx, sy) {
    const check = this.canLearnEther(id);
    if (!check.ok) { EventBus.emit('ui:feedback',{text:check.reason,x:sx||0,y:sy||0,color:'#e05050'}); return false; }
    const def = ETHER_DEFS[id];
    this.rm.spend(def.cost);
    this.etherLearned[id] = true;
    EventBus.emit('ether:talent:applied', { id, def });
    EventBus.emit('talent:applied', { id });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    EventBus.emit('ui:feedback',{text:def.icon+' '+def.name+' !',x:sx||0,y:sy||0,color:'#c090ff'});
    return true;
  }

  // Calculs bonus
  getBonusMaxLevel(buildingId) {
    let total = 0;
    Object.keys(this.learned).forEach(id => {
      const eff = TALENT_DEFS[id] && TALENT_DEFS[id].effect;
      if (!eff) return;
      if (eff.type === 'maxLevel' && eff.building) {
        if (eff.building.split(',').includes(buildingId)) total += eff.value;
      }
      if (eff.type === 'maxLevelAll') total += eff.value;
    });
    return total + this.getConstellationBonus('maxLevelAll');
  }

  getBonusProductionPct(buildingId) {
    let total = 0;
    // Talents Drachmes in-run
    Object.keys(this.learned).forEach(id => {
      const eff = TALENT_DEFS[id] && TALENT_DEFS[id].effect;
      if (!eff) return;
      if (eff.type === 'prodBonus' && eff.building) {
        if (eff.building.split(',').includes(buildingId)) total += eff.value;
      }
      if (eff.type === 'prodBonusAll') total += eff.value;
    });
    // Constellations Ether
    total += this.getConstellationBonus('prodAll');
    // Reliques
    if (this.hasRelique('amphore') &&
        ['farm','verger','jardins'].includes(buildingId)) total += 20;
    // Nouvelles branches Ether permanentes
    Object.keys(this.etherLearned).forEach(id => {
      const eff = ETHER_DEFS[id] && ETHER_DEFS[id].effect;
      if (!eff) return;
      if (eff.type === 'prodBonusAll') total += eff.value;
      if (eff.type === 'prodBonus' && eff.building) {
        if (eff.building.split(',').includes(buildingId)) total += eff.value;
      }
    });
    return total;
  }

  getDigCostMult() {
    let red = 0;
    Object.keys(this.learned).forEach(id => {
      const eff = TALENT_DEFS[id] && TALENT_DEFS[id].effect;
      if (eff && eff.type === 'digCostReduction') red += eff.value;
    });
    red += this.getConstellationBonus('digCost');
    // Branche exploration Ether
    Object.keys(this.etherLearned).forEach(id => {
      const eff = ETHER_DEFS[id] && ETHER_DEFS[id].effect;
      if (eff && eff.type === 'digCostReduction') red += eff.value;
    });
    return Math.max(0.05, 1 - red);
  }

  getPopCapMult() {
    let pct = 0;
    Object.keys(this.learned).forEach(id => {
      const eff = TALENT_DEFS[id] && TALENT_DEFS[id].effect;
      if (eff && eff.type === 'popCap') pct += eff.value;
    });
    pct += this.getConstellationBonus('popCap');
    return 1 + pct / 100;
  }

  getPopProdBonus() {
    let pct = 0;
    Object.keys(this.learned).forEach(id => {
      const eff = TALENT_DEFS[id] && TALENT_DEFS[id].effect;
      if (eff && eff.type === 'popProdBonus') pct += eff.value;
    });
    return pct;
  }

  getPyloneRangeBonus() {
    let bonus = 0;
    Object.keys(this.learned).forEach(id => {
      const eff = TALENT_DEFS[id] && TALENT_DEFS[id].effect;
      if (eff && eff.type === 'pyloneRange') bonus += eff.value;
    });
    return bonus;
  }

  getEtherGainMult() {
    let pct = this.getConstellationBonus('etherGain');
    if (this.hasRelique('omphalos')) pct += 50;
    // Nouvelles branches Prestige
    Object.keys(this.etherLearned).forEach(id => {
      const eff = ETHER_DEFS[id] && ETHER_DEFS[id].effect;
      if (eff && eff.type === 'etherGainPct') pct += eff.value;
    });
    return 1 + pct / 100;
  }

  getScoreMult() {
    let pct = 0;
    Object.keys(this.etherLearned).forEach(id => {
      const eff = ETHER_DEFS[id] && ETHER_DEFS[id].effect;
      if (eff && eff.type === 'scoreMult') pct += eff.value;
    });
    return 1 + pct / 100;
  }

  getStartBonus() {
    let bonus = 0;
    Object.keys(this.etherLearned).forEach(id => {
      const eff = ETHER_DEFS[id] && ETHER_DEFS[id].effect;
      if (eff && eff.type === 'startBonus') bonus = Math.max(bonus, eff.value);
    });
    return bonus;
  }

  getScoutSpeedMult() {
    let mult = 1;
    Object.keys(this.etherLearned).forEach(id => {
      const eff = ETHER_DEFS[id] && ETHER_DEFS[id].effect;
      if (eff && eff.type === 'scoutSpeed') mult += eff.value;
    });
    return mult;
  }

  getProdBonusAllEther() {
    let pct = 0;
    Object.keys(this.etherLearned).forEach(id => {
      const eff = ETHER_DEFS[id] && ETHER_DEFS[id].effect;
      if (eff && eff.type === 'prodBonusAll') pct += eff.value;
    });
    return pct;
  }

  resetInRunTalents() { this.learned = {}; }

  getBranchData()      { return TALENT_BRANCHES; }
  getEtherBranchData() { return ETHER_BRANCHES; }
  getTalentDef(id)     { return TALENT_DEFS[id]  || null; }
  getEtherDef(id)      { return ETHER_DEFS[id]   || null; }

  serialize() {
    return {
      learned:      Object.keys(this.learned),
      etherLearned: Object.keys(this.etherLearned),
    };
  }

  deserialize(data) {
    if (!data) return;
    (data.learned      || []).forEach(id => { this.learned[id]      = true; });
    (data.etherLearned || []).forEach(id => { this.etherLearned[id] = true; });
  }
}
