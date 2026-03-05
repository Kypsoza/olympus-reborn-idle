/* BuildingManager.js — Phase 3 v30 (réécriture complète)
   Corrections :
   - placeRoad / removeRoad / canPlaceRoad / canRemoveRoad implementes
   - _isConnected : BFS depuis BASE_MAIN via routes
   - _updateConnectionCache : recalcule cell.isConnected
   - getBuildingInfo : retourne connected + adjInfo corrects
   - executeNeighborAction : implemente
   - prodBonus talents : divisé par 100 (etait une multiplication de 25/50/100)
   - Tunnel : accepte les routes
*/

const BUILDINGS = {
  // ═══════════════════════════════════════
  // ERA 1 — Antiquite
  // ═══════════════════════════════════════
  farm: {
    id:'farm', name:'Ferme Antique', glyph:'\u{1F33E}', era:1,
    validTerrain:['plain'],
    baseProdPerField:1.0, consumesWorkers:2,
    buildCost:{drachmes:50,bois:20},
    upgradeCostBase:{drachmes:40,bois:15},
    description:"Produit de l'Ambroisie. Rendement par champ adjacent.",
    maxLevel:50, supportType:'field', supportCount:5,
  },
  lumber: {
    id:'lumber', name:'Camp de Bucherons', glyph:'\u{1FAA3}', era:1,
    validTerrain:['plain','field'],
    baseProdPerSupport:1.5, consumesWorkers:2,
    buildCost:{drachmes:60},
    upgradeCostBase:{drachmes:50,bois:0},
    description:'Produit du Bois. Rendement par foret adjacente.',
    maxLevel:50, supportType:'forest', supportCount:5,
  },
  mine_copper: {
    id:'mine_copper', name:'Mine de Cuivre', glyph:'\u26CF\uFE0F', era:1,
    validTerrain:['mountain'],
    produces:{drachmes:5}, consumesWorkers:3,
    buildCost:{drachmes:80,bois:40},
    upgradeCostBase:{drachmes:60,bois:30},
    description:'Produit des Drachmes.',
    maxLevel:50,
  },
  mine_iron: {
    id:'mine_iron', name:'Mine de Fer Celeste', glyph:'\u2699\uFE0F', era:1,
    validTerrain:['mountain'],
    produces:{fer:1}, consumesWorkers:4,
    buildCost:{drachmes:150,bois:60},
    upgradeCostBase:{drachmes:100,bois:50},
    description:'Produit du Fer Celeste.',
    maxLevel:50,
  },
  scout: {
    id:'scout', name:'Tour de Guet', glyph:'\u{1F5FC}', era:1,
    validTerrain:['plain','mountain','field'],
    produces:{}, consumesWorkers:1,
    buildCost:{drachmes:100,bois:50},
    upgradeCostBase:{drachmes:80,bois:30},
    description:'Revele automatiquement des cases dans sa zone.',
    maxLevel:50,
  },
  huttes: {
    id:'huttes', name:'Huttes des Pionniers', glyph:'\u{1F6D6}', era:1,
    validTerrain:['plain'],
    habitantsCapacity:5, consumesWorkers:0,
    buildCost:{drachmes:120,bois:80},
    upgradeCostBase:{drachmes:80,bois:60},
    description:'Loge 5 habitants par niveau. Necessite route adjacente.',
    maxLevel:50, requiresRoad:true,
  },
  sanctuaire: {
    id:'sanctuaire', name:"Sanctuaire d'Hestia", glyph:'\u{1F525}', era:1,
    validTerrain:['plain','rubble'],
    produces:{}, consumesWorkers:1,
    buildCost:{drachmes:200,bois:100},
    upgradeCostBase:{drachmes:150,bois:80},
    description:'Reduit le cout de fouille -20% dans un rayon 2.',
    maxLevel:20, isUnique:false, auraType:'digCost', auraRadius:2, auraValue:0.2,
  },
  moulin: {
    id:'moulin', name:'Moulin a Grain', glyph:'\u{1F7A8}', era:1,
    validTerrain:['plain','river','mud'],
    consumes:{nourr:1}, produces:{farine:0.5}, consumesWorkers:2,
    buildCost:{drachmes:180,bois:120},
    upgradeCostBase:{drachmes:120,bois:80},
    description:"Transforme l'Ambroisie en Farine Sacree.",
    maxLevel:30,
  },
  pylone: {
    id:'pylone', name:"Pylone d'Hermes", glyph:'\u26A1', era:1,
    validTerrain:['plain'],
    produces:{foudre:2}, consumesWorkers:1,
    buildCost:{drachmes:300,bois:150,fer:30},
    upgradeCostBase:{drachmes:200,bois:100,fer:20},
    description:'Genere de la Foudre dans un rayon 3. Necessaire aux batiments Ere 2+.',
    maxLevel:30, auraType:'foudre', auraRadius:3,
  },

  // ═══════════════════════════════════════
  // ERA 2 — Age Classique
  // ═══════════════════════════════════════
  verger: {
    id:'verger', name:"Verger d'Apollon", glyph:'\u{1F347}', era:2,
    validTerrain:['plain','field'],
    baseProdPerField:3.0, consumesWorkers:2,
    buildCost:{drachmes:500,bois:200,nectar:50},
    upgradeCostBase:{drachmes:300,bois:150},
    description:'Ferme amelioree. Produit Ambroisie x3 + Nectar passif.',
    maxLevel:80, supportType:'field', supportCount:6,
    produces:{nectar:0.5},
  },
  halle: {
    id:'halle', name:'Halle des Sylvains', glyph:'\u{1F332}', era:2,
    validTerrain:['plain','field'],
    baseProdPerSupport:4.5, consumesWorkers:2,
    buildCost:{drachmes:600,bois:400,bronze:30},
    upgradeCostBase:{drachmes:400,bois:250},
    description:'Bucherons ameliores. Bois x3. Auto-plante forets (niv 20+).',
    maxLevel:80, supportType:'forest', supportCount:6,
  },
  atelier_forgeron: {
    id:'atelier_forgeron', name:'Atelier du Forgeron', glyph:'\u{1F528}', era:2,
    validTerrain:['mountain'],
    produces:{drachmes:20,bronze:0.5}, consumesWorkers:3,
    buildCost:{drachmes:800,bois:300,fer:100},
    upgradeCostBase:{drachmes:500,bois:200,fer:50},
    description:'Mine amelioree. Drachmes x4 + Bronze.',
    maxLevel:80,
  },
  fonderie_celeste: {
    id:'fonderie_celeste', name:'Fonderie Celeste', glyph:'\u{1F3ED}', era:2,
    validTerrain:['mountain'],
    produces:{fer:3,acier:0.3}, consumesWorkers:4,
    buildCost:{drachmes:1200,bois:500,fer:200,bronze:50},
    upgradeCostBase:{drachmes:800,bois:350,fer:100},
    description:'Mine de Fer amelioree. Fer x3 + Acier.',
    maxLevel:80,
  },
  maison: {
    id:'maison', name:'Maison Athenienne', glyph:'\u{1F3DB}\uFE0F', era:2,
    validTerrain:['plain'],
    habitantsCapacity:20, consumes:{nourr:0.5}, consumesWorkers:0,
    buildCost:{drachmes:400,bois:250,farine:20},
    upgradeCostBase:{drachmes:280,bois:180},
    description:'Loge 20 habitants par niveau. Bonus si 2 maisons adj. Consomme Ambroisie.',
    maxLevel:60,
  },
  alambic: {
    id:'alambic', name:'Alambic de Dionysos', glyph:'\u{1FAD9}', era:2,
    validTerrain:['plain'],
    consumes:{nectar:1}, produces:{nourr:5}, consumesWorkers:2,
    buildCost:{drachmes:600,bois:200,nectar:100},
    upgradeCostBase:{drachmes:400,bois:150},
    description:'Transforme le Nectar en Ambroisie Distillee (x5).',
    maxLevel:40,
  },
  agora: {
    id:'agora', name:'Agora', glyph:'\u{1F3DF}\uFE0F', era:2,
    validTerrain:['plain'],
    produces:{}, consumesWorkers:2,
    buildCost:{drachmes:1000,bois:400,bronze:80},
    upgradeCostBase:{drachmes:600,bois:300},
    description:'x1.5 Drachmes sur les batiments dans un rayon 2.',
    maxLevel:20, auraType:'drachmes', auraRadius:2, auraValue:1.5,
    requiresBuildings:3,
  },
  temple_hermes: {
    id:'temple_hermes', name:"Temple d'Hermes", glyph:'\u{1F3FB}', era:2,
    validTerrain:['plain'],
    produces:{}, consumesWorkers:1,
    buildCost:{drachmes:800,bois:300,bronze:60},
    upgradeCostBase:{drachmes:500,bois:200},
    description:'x1.3 vitesse de decouverte des scouts dans son rayon.',
    maxLevel:20, auraType:'scoutSpeed', auraRadius:3, auraValue:1.3,
  },
  stele_zeus: {
    id:'stele_zeus', name:'Stele de Zeus', glyph:'\u{26A1}\u{1F5FF}', era:2,
    validTerrain:['mountain','plain'],
    produces:{foudre:10}, consumesWorkers:2,
    buildCost:{drachmes:1500,bois:600,fer:300,bronze:100},
    upgradeCostBase:{drachmes:1000,bois:400,fer:200},
    description:'Genere beaucoup de Foudre. Eclairs visuels.',
    maxLevel:40,
  },
  forteresse: {
    id:'forteresse', name:'Forteresse', glyph:'\u{1F3F0}', era:2,
    validTerrain:['plain','mountain'],
    produces:{}, consumesWorkers:3,
    buildCost:{drachmes:2000,bois:800,fer:400,acier:20},
    upgradeCostBase:{drachmes:1200,bois:500,fer:250},
    description:'Annule la Corruption dans un rayon 3.',
    maxLevel:20, auraType:'antiCorruption', auraRadius:3,
  },

  // ═══════════════════════════════════════
  // ==============================================
  // ERE 2 — Nouveaux batiments (Phase 5)
  // ==============================================
  bibliotheque: {
    id:'bibliotheque', name:'Bibliotheque', glyph:'\u{1F4DA}', era:2,
    validTerrain:['plain'],
    baseProd:{drachmes:4}, consumesWorkers:2,
    buildCost:{drachmes:800,bois:400,fer:100},
    upgradeCostBase:{drachmes:500,bois:200,fer:50},
    description:'Savoir divin. Reduit le cout des fouilles de 15%.',
    maxLevel:20, auraType:'knowledge', auraRadius:2,
  },
  distillerie: {
    id:'distillerie', name:'Distillerie Sacree', glyph:'\u{1F6B0}', era:2,
    validTerrain:['plain','river'],
    baseProd:{ambroisie:0.15}, consumesWorkers:3,
    consumes:{nectar:0.5, nourr:1.5},
    buildCost:{drachmes:1200,bois:300,nectar:200},
    upgradeCostBase:{drachmes:700,bois:150,nectar:100},
    description:'Transforme Nectar et Nourriture en Ambroisie.',
    maxLevel:25,
  },
  fontaine: {
    id:'fontaine', name:'Fontaine de Hygie', glyph:'\u26F2', era:2,
    validTerrain:['plain'],
    baseProd:{habitants:0.04}, consumesWorkers:1,
    buildCost:{drachmes:600,bois:200,bronze:50},
    upgradeCostBase:{drachmes:350,bois:100,bronze:25},
    description:'Augmente la population et ameliore le Bonheur.',
    maxLevel:15, auraType:'happiness', auraRadius:2,
  },

  // ERA 3 — Age Divin
  // ═══════════════════════════════════════
  jardins: {
    id:'jardins', name:'Jardins Elysees', glyph:'\u{1F33A}', era:3,
    validTerrain:['plain','field'],
    baseProdPerField:8.0, consumesWorkers:3,
    buildCost:{drachmes:5000,bois:2000,nectar:500,orichalque:10},
    upgradeCostBase:{drachmes:3000,bois:1500},
    description:'Summum agricole. Ambroisie x8 + Nectar + Amrita.',
    maxLevel:120, supportType:'field', supportCount:6,
    produces:{nectar:2,amrita:0.1},
  },
  bosquet: {
    id:'bosquet', name:'Bosquet Eternel', glyph:'\u{1F333}', era:3,
    validTerrain:['plain','field'],
    baseProdPerSupport:12.0, consumesWorkers:3,
    buildCost:{drachmes:6000,bois:5000,orichalque:15},
    upgradeCostBase:{drachmes:4000,bois:3000},
    description:'Foret divine. Bois x8. Forets auto-plantees rayon 2.',
    maxLevel:120, supportType:'forest', supportCount:6,
  },
  tresor: {
    id:'tresor', name:"Tresor d'Hephaistos", glyph:'\u{1F48E}', era:3,
    validTerrain:['mountain'],
    produces:{drachmes:100,bronze:2,orichalque:0.2}, consumesWorkers:4,
    buildCost:{drachmes:8000,bois:3000,fer:1000,acier:100,orichalque:5},
    upgradeCostBase:{drachmes:5000,bois:2000,fer:500},
    description:'Drachmes x10 + Bronze + Orichalque.',
    maxLevel:120,
  },
  forge_divine: {
    id:'forge_divine', name:'Forge Divine', glyph:'\u{1F525}\u{1F528}', era:3,
    validTerrain:['mountain'],
    consumes:{acier:1,orichalque:0.1}, produces:{fer:10,metal_divin:0.05}, consumesWorkers:5,
    buildCost:{drachmes:10000,bois:4000,fer:2000,acier:200,orichalque:20},
    upgradeCostBase:{drachmes:6000,bois:2500,fer:1000},
    description:'Forge Acier + Orichalque en Metal Divin.',
    maxLevel:120,
  },
  palais: {
    id:'palais', name:'Palais des Titans', glyph:'\u{1F3DB}\u2605', era:3,
    validTerrain:['plain'],
    habitantsCapacity:100, produces:{ether:0.001}, consumes:{nourr:5,foudre:1}, consumesWorkers:0,
    buildCost:{drachmes:15000,bois:6000,acier:200,orichalque:30,metal_divin:5},
    upgradeCostBase:{drachmes:10000,bois:4000,acier:100},
    description:"Loge 100 habitants par niveau. Genere de l'Ether lentement.",
    maxLevel:80,
  },
  senat: {
    id:'senat', name:'Senat', glyph:'\u{1F3DB}\u2764\uFE0F', era:3,
    validTerrain:['plain'],
    produces:{}, consumesWorkers:5,
    buildCost:{drachmes:50000,bois:20000,acier:500,orichalque:100,metal_divin:20},
    upgradeCostBase:{drachmes:30000,bois:12000,acier:250},
    description:'x2 production globale. UNIQUE par carte.',
    maxLevel:10, isUnique:true, globalMult:2.0,
  },
  noeud_olympien: {
    id:'noeud_olympien', name:'Noeud Olympien', glyph:'\u{26A1}\u2734\uFE0F', era:3,
    validTerrain:['plain','mountain'],
    produces:{foudre:50}, consumesWorkers:3,
    buildCost:{drachmes:20000,bois:8000,fer:3000,acier:300,orichalque:50},
    upgradeCostBase:{drachmes:12000,bois:5000,fer:2000},
    description:'Foudre x10. Double la portee des pylones voisins.',
    maxLevel:60,
  },
  autel_fusion: {
    id:'autel_fusion', name:'Autel de Fusion', glyph:'\u2728\u{1F525}', era:3,
    validTerrain:['rubble','plain'],
    consumes:{acier:2,orichalque:0.5}, produces:{metal_divin:0.2,amrita:0.05}, consumesWorkers:4,
    buildCost:{drachmes:25000,bois:10000,acier:400,orichalque:80,metal_divin:10},
    upgradeCostBase:{drachmes:15000,bois:6000,acier:200},
    description:'Transforme Acier+Orichalque en Metal Divin + Amrita.',
    maxLevel:60,
  },
};

const DIG_COST_PER_CLICK = 5;

function levelMult(level) {
  return 1 + (level - 1) * 0.12;
}

class BuildingManager {
  constructor(grid, resourceManager) {
    this.grid = grid;
    this.rm   = resourceManager;
    this.diggingCell   = null;
    this._mudCooldowns = {};
    this._talents = {
      farm:        { levelBonus: 0, prodBonus: 0 },
      lumber:      { levelBonus: 0, prodBonus: 0 },
      mine_copper: { levelBonus: 0, prodBonus: 0 },
      mine_iron:   { levelBonus: 0, prodBonus: 0 },
      scout:       { levelBonus: 0, prodBonus: 0 },
    };
    this.talentManager = null; // set by GameLoop after init
    this._bindEvents();
  }

  _getTalent(buildingId) {
    if (this.talentManager) {
      return {
        levelBonus: this.talentManager.getBonusMaxLevel(buildingId),
        prodBonus:  this.talentManager.getBonusProductionPct(buildingId),
      };
    }
    return this._talents[buildingId] || { levelBonus: 0, prodBonus: 0 };
  }

  // == FOUILLE ==
  digCell(cell, screenX, screenY) {
    if (!cell || !cell.isHidden) return false;
    const neighbors = this.grid.getNeighbors(cell.q, cell.r);
    if (!neighbors.some(n => n.isRevealed)) {
      EventBus.emit('ui:feedback', { text: 'Zone inaccessible !', x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    if (!this.rm.canAfford({ drachmes: DIG_COST_PER_CLICK })) {
      EventBus.emit('ui:feedback', { text: 'Drachmes insuffisantes !', x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    this.rm.spend({ drachmes: DIG_COST_PER_CLICK });
    cell.currentHP  -= DIG_COST_PER_CLICK;
    cell.isBeingDug  = true;
    this.diggingCell = cell;
    EventBus.emit('ui:feedback', { text: '-' + DIG_COST_PER_CLICK + ' Dr', x: screenX, y: screenY, color: '#c8951a' });
    if (cell.currentHP <= 0) {
      cell.currentHP = 0;
      this._revealCell(cell, screenX, screenY);
    } else {
      EventBus.emit('cell:dig', { cell });
    }
    return true;
  }

  _revealCell(cell, screenX, screenY) {
    cell.reveal();
    cell.isBeingDug  = false;
    this.diggingCell = null;
    EventBus.emit('cell:revealed', { cell });
    EventBus.emit('ui:feedback', { text: 'Revele !', x: screenX, y: screenY, color: '#f0e080' });
    this._recalculateAllRates();
  }

  // == CONSTRUCTION ==
  canBuild(cell, buildingId) {
    const def = BUILDINGS[buildingId];
    if (!def) return { ok: false, reason: 'Batiment inconnu.' };
    if (!cell.isRevealed) return { ok: false, reason: 'Case non revelee.' };
    if (cell.building) return { ok: false, reason: 'Case deja occupee.' };
    if (cell.type === CELL_TYPE.BASE_MAIN) return { ok: false, reason: 'Impossible ici.' };
    if (!def.validTerrain.includes(cell.type)) return { ok: false, reason: 'Terrain invalide pour ' + def.name + '.' };
    // Verif ere
    const era = def.era || 1;
    const unlockedEra = this.talentManager ? this.talentManager.getUnlockedEra() : 1;
    if (era > unlockedEra) return { ok: false, reason: "Ere " + era + " non debloquee. Depensez de l'Ether dans l'arbre de talents !" };
    // Verif batiment unique
    if (def.isUnique) {
      let already = false;
      this.grid.cells.forEach(c => { if (c.building === buildingId) already = true; });
      if (already) return { ok: false, reason: def.name + ' : unique par carte !' };
    }
    if (!this.rm.canAfford(def.buildCost)) return { ok: false, reason: 'Ressources insuffisantes.' };
    // Vérif habitants disponibles
    const needed = def.consumesWorkers || 0;
    if (needed > 0) {
      const available = this.rm.availableHabitants || 0;
      if (available < needed) {
        return { ok: false, reason: '👥 Population insuffisante — ' + needed + ' travailleurs requis (' + available + ' disponibles). Construisez des logements !' };
      }
    }
    return { ok: true };
  }

  build(cell, buildingId, screenX, screenY) {
    const check = this.canBuild(cell, buildingId);
    if (!check.ok) {
      EventBus.emit('ui:feedback', { text: check.reason, x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    const def = BUILDINGS[buildingId];
    this.rm.spend(def.buildCost);
    cell.building      = buildingId;
    cell.buildingLevel = 1;
    if (def.supportType) this._placeSupportTiles(cell, def);
    this._recalculateAllRates();
    EventBus.emit('building:built', { cell, buildingId });
    EventBus.emit('ui:feedback', { text: def.glyph + ' Construit !', x: screenX, y: screenY, color: '#80e080' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  _placeSupportTiles(cell, def) {
    const neighbors = this.grid.getNeighbors(cell.q, cell.r);
    let placed = 0;
    for (const n of neighbors) {
      if (placed >= def.supportCount) break;
      // Ne jamais révéler une case cachée : uniquement convertir les cases déjà révélées
      if (!n.isRevealed) continue;
      // Ignorer les cases occupées ou protégées
      if (n.type === CELL_TYPE.BASE_MAIN || n.type === CELL_TYPE.ALTAR) continue;
      if (n.building) continue;
      // Ne pas écraser les terrains spéciaux non convertibles
      const unconvertible = [CELL_TYPE.RIVER, CELL_TYPE.MOUNTAIN, CELL_TYPE.TUNNEL, CELL_TYPE.RUBBLE];
      if (unconvertible.includes(n.type)) continue;
      if (def.supportType === 'field')  { n.type = CELL_TYPE.FIELD;  n.ownedBy = cell.key; }
      if (def.supportType === 'forest') { n.type = CELL_TYPE.FOREST; n.ownedBy = cell.key; }
      placed++;
    }
    EventBus.emit('terrain:transformed', { cell });
  }

  // == UPGRADE ==
  canUpgrade(cell) {
    if (!cell.building) return { ok: false, reason: 'Aucun batiment.' };
    const def    = BUILDINGS[cell.building];
    const talent = this._getTalent(cell.building);
    const maxLevel = (def.maxLevel || 50) + talent.levelBonus;
    if (cell.buildingLevel >= maxLevel) return { ok: false, reason: 'Niveau maximum.' };
    const cost = this._upgradeCost(def, cell.buildingLevel);
    if (!this.rm.canAfford(cost)) return { ok: false, reason: 'Ressources insuffisantes.' };
    return { ok: true, cost };
  }

  upgrade(cell, screenX, screenY) {
    const check = this.canUpgrade(cell);
    if (!check.ok) {
      EventBus.emit('ui:feedback', { text: check.reason, x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    this.rm.spend(check.cost);
    cell.buildingLevel++;
    this._recalculateAllRates();
    EventBus.emit('building:upgraded', { cell });
    EventBus.emit('ui:feedback', { text: 'Niv.' + cell.buildingLevel + ' !', x: screenX, y: screenY, color: '#80c0ff' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  // == DEMOLISH ==
  demolish(cell, screenX, screenY) {
    if (!cell.building) return false;
    const def = BUILDINGS[cell.building];
    const refund = {};
    Object.entries(def.buildCost).forEach(([k, v]) => { refund[k] = Math.floor(v * 0.5); });
    Object.entries(refund).forEach(([k, v]) => this.rm.add(k, v));
    this.grid.cells.forEach(c => {
      if (c.ownedBy === cell.key) {
        c.ownedBy = null;
        if (c.type === CELL_TYPE.FIELD)  c.type = CELL_TYPE.PLAIN;
        if (c.type === CELL_TYPE.FOREST) {
          // Ne pas raser les forêts si Relique Graine Éternelle ou isEternalForest
          const isEternal = c.isEternalForest ||
            (this.talentManager && this.talentManager.hasRelique('graine'));
          if (!isEternal) c.type = CELL_TYPE.PLAIN;
        }
        c.ownedBy = null;
      }
    });
    cell.building      = null;
    cell.buildingLevel = 1;
    this._recalculateAllRates();
    EventBus.emit('building:demolished', { cell });
    EventBus.emit('ui:feedback', { text: 'Demoli', x: screenX, y: screenY, color: '#e08040' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  // == ROUTES ==
  canPlaceRoad(cell) {
    if (!cell.isRevealed) return { ok: false, reason: 'Case non revelee.' };
    if (cell.hasRoad) return { ok: false, reason: 'Route deja presente.' };
    const allowedTypes = [CELL_TYPE.PLAIN, CELL_TYPE.TUNNEL, CELL_TYPE.FIELD, CELL_TYPE.GROVE];
    if (!allowedTypes.includes(cell.type)) return { ok: false, reason: 'Terrain non constructible.' };
    if (!this.rm.canAfford({ drachmes: 30, bois: 10 })) return { ok: false, reason: 'Ressources insuffisantes.' };
    return { ok: true };
  }

  placeRoad(cell, screenX, screenY) {
    const check = this.canPlaceRoad(cell);
    if (!check.ok) {
      EventBus.emit('ui:feedback', { text: check.reason, x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    this.rm.spend({ drachmes: 30, bois: 10 });
    cell.hasRoad = true;
    this._recalculateAllRates();
    EventBus.emit('road:placed', { cell });
    EventBus.emit('road:changed', { cell });
    EventBus.emit('ui:feedback', { text: 'Route posee !', x: screenX, y: screenY, color: '#c8a040' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  canRemoveRoad(cell) {
    if (!cell.isRevealed) return { ok: false, reason: 'Case non revelee.' };
    if (!cell.hasRoad) return { ok: false, reason: 'Aucune route.' };
    if (!this.rm.canAfford({ drachmes: 10 })) return { ok: false, reason: 'Ressources insuffisantes.' };
    return { ok: true };
  }

  removeRoad(cell, screenX, screenY) {
    const check = this.canRemoveRoad(cell);
    if (!check.ok) {
      EventBus.emit('ui:feedback', { text: check.reason, x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    this.rm.spend({ drachmes: 10 });
    cell.hasRoad = false;
    this._recalculateAllRates();
    EventBus.emit('road:removed', { cell });
    EventBus.emit('road:changed', { cell });
    EventBus.emit('ui:feedback', { text: 'Route demontee', x: screenX, y: screenY, color: '#808060' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  // == CONNEXION (BFS depuis BASE_MAIN) ==
  // Un seul BFS — O(cases révélées) au lieu de O(N * bâtiments)
  _buildConnectedSet() {
    const visited = new Set();
    const queue   = [];
    const baseCell = this.grid.getCell(0, 0);
    if (!baseCell) return visited;

    visited.add(baseCell.key);
    // Voisins directs de la base : toujours connectés
    this.grid.getNeighbors(0, 0).forEach(n => {
      if (n.isRevealed && !visited.has(n.key)) {
        visited.add(n.key);
        queue.push(n);
      }
    });

    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      if (cur.hasRoad || cur.type === CELL_TYPE.BASE_MAIN) {
        this.grid.getNeighbors(cur.q, cur.r).forEach(n => {
          if (!visited.has(n.key) && n.isRevealed &&
              (n.hasRoad || n.type === CELL_TYPE.BASE_MAIN)) {
            visited.add(n.key);
            queue.push(n);
          }
        });
      }
    }
    return visited; // Set de toutes les clés connectées au réseau de routes
  }

  _isConnected(cell) {
    // Raccourci pour getBuildingInfo (pas dans le hot path)
    if (!cell || cell.type === CELL_TYPE.BASE_MAIN) return true;
    const net = this._buildConnectedSet();
    if (net.has(cell.key)) return true;
    return this.grid.getNeighbors(cell.q, cell.r).some(n => net.has(n.key));
  }

  _updateConnectionCache(connectedSet) {
    // connectedSet passé en param pour éviter un 2ème BFS
    this.grid.cells.forEach(cell => {
      if (cell.isRevealed && cell.building) {
        cell.isConnected = connectedSet.has(cell.key) ||
          this.grid.getNeighbors(cell.q, cell.r).some(n => connectedSet.has(n.key));
      } else {
        cell.isConnected = false;
      }
    });
  }

  // == PRODUCTION ==
  _recalculateAllRates() {
    const now = Date.now();
    if (this._recalcPending) return;
    if (now - (this._lastRecalc || 0) < 16) {
      this._recalcPending = true;
      setTimeout(() => { this._recalcPending = false; this._recalculateAllRates(); }, 16);
      return;
    }
    this._lastRecalc = now;
    const connectedSet = this._buildConnectedSet();
    this._updateConnectionCache(connectedSet);

    // Initialise toutes les ressources a 0
    const rates = {
      drachmes:0,bois:0,nourr:0,fer:0,habitants:0,
      nectar:0,bronze:0,acier:0,farine:0,foudre:0,
      orichalque:0,metal_divin:0,amrita:0,ambroisie:0,ether:0,
    };
    let workersUsed = 0;
    let totalHabitants = 0;
    let hasSenat = false;
    let senatMult = 1;

    // ── Pré-calcul auras Ère 2 ──────────────────────────
    // Agora : map de cellKey → multiplicateur Drachmes cumulé
    const agoraMults = new Map(); // cellKey → mult
    // Temple d'Hermès : scout speed boost par cellKey de scout
    const scoutSpeedMults = new Map(); // cellKey → mult
    // Sanctuaire Hestia : dig cost reduction (déjà géré par talentManager, on skip ici)

    this.grid.cells.forEach(src => {
      if (!src.isRevealed || !src.building || !src.isConnected) return;
      const def = BUILDINGS[src.building];
      if (!def || !def.auraType) return;
      const radius = def.auraRadius || 2;

      // Agora — ×1.5 Drachmes sur les bâtiments dans le rayon
      if (src.building === 'agora') {
        const lvlBonus = src.buildingLevel >= 20 ? 3 : 2; // rayon +1 à niv.20
        const agoraRadius = radius + (src.buildingLevel >= 20 ? 1 : 0);
        this.grid.cells.forEach(target => {
          if (!target.isRevealed || !target.building || !target.isConnected) return;
          if (target === src) return;
          const d = HexUtils.hexDistance(src.q, src.r, target.q, target.r);
          if (d <= agoraRadius) {
            const prev = agoraMults.get(target.key) || 1;
            agoraMults.set(target.key, prev * (def.auraValue || 1.5));
          }
        });
      }

      // Bibliotheque — aura knowledge : reduit cout fouilles sur la zone
      if (src.building === 'bibliotheque') {
        const lvl = src.buildingLevel || 1;
        const bonus = Math.min(0.40, 0.05 + lvl * 0.01); // 6-15% selon niveau
        this.grid.cells.forEach(target => {
          if (!target.isRevealed && !target.isHidden) return;
          const d = HexUtils.hexDistance(src.q, src.r, target.q, target.r);
          if (d <= radius) {
            target._knowledgeDigBonus = (target._knowledgeDigBonus || 0) + bonus;
          }
        });
      }

      // Fontaine — aura happiness : bonus production sur bâtiments logement adjacents
      if (src.building === 'fontaine') {
        this.grid.cells.forEach(target => {
          if (!target.isRevealed || !target.building) return;
          if (!['huttes','maison','palais'].includes(target.building)) return;
          const d = HexUtils.hexDistance(src.q, src.r, target.q, target.r);
          if (d <= radius) {
            target._happinessBonus = (target._happinessBonus || 0) + 0.15;
          }
        });
      }

      // Temple d'Hermès — boost vitesse scouts dans rayon
      if (src.building === 'temple_hermes') {
        this.grid.cells.forEach(target => {
          if (!target.isRevealed || target.building !== 'scout') return;
          const d = HexUtils.hexDistance(src.q, src.r, target.q, target.r);
          if (d <= radius) {
            const prev = scoutSpeedMults.get(target.key) || 1;
            scoutSpeedMults.set(target.key, prev * (def.auraValue || 1.3));
          }
        });
      }
    });

    // Transmettre les boost scouts au ScoutManager
    if (this._scoutSpeedMultsCallback) this._scoutSpeedMultsCallback(scoutSpeedMults);

    // 1er passage : passif terrain
    this.grid.cells.forEach(cell => {
      if (!cell.isRevealed) return;
      if (cell.type === CELL_TYPE.RUBBLE) { rates.fer+=0.2; rates.bois+=0.1; }
      if (cell.type === CELL_TYPE.MUD)    { rates.nourr+=0.3; rates.bois+=0.1; }
    });

    // 2eme passage : batiments
    this.grid.cells.forEach(cell => {
      if (!cell.isRevealed || !cell.building) return;
      const def = BUILDINGS[cell.building];
      if (!def) return;
      workersUsed += def.consumesWorkers || 0;

      // Senat : mult global
      if (cell.building === 'senat' && cell.isConnected) { hasSenat = true; senatMult = 2.0; }

      const connected = cell.isConnected;
      // Relique enclume : mines produisent meme sans route (a 50%)
      const enclumeMult = (!connected && this.talentManager && this.talentManager.hasRelique('enclume') &&
        ['mine_copper','mine_iron','atelier_forgeron','fonderie_celeste','tresor','forge_divine'].includes(cell.building)) ? 0.5 : null;
      const effectiveMult = connected ? 1 : (enclumeMult !== null ? enclumeMult : 0);
      if (effectiveMult === 0) return;

      const talent = this._getTalent(cell.building);

      // Maison Athénienne : +20% capacité par maison adjacente supplémentaire
      let maisonBonus = 1;
      if (cell.building === 'maison') {
        const adjMaisons = this.grid.getNeighbors(cell.q, cell.r)
          .filter(n => n.building === 'maison' && n.isConnected).length;
        maisonBonus = 1 + adjMaisons * 0.20;
      }
      const mult   = levelMult(cell.buildingLevel) * (1 + talent.prodBonus / 100) * effectiveMult * maisonBonus;

      // Bonus route pour les huttes/maisons (requiresRoad)
      let roadMult = 1;
      if (def.requiresRoad) {
        const hasAdjacentRoad = this.grid.getNeighbors(cell.q, cell.r)
          .some(n => n.hasRoad || n.type === CELL_TYPE.BASE_MAIN);
        if (!hasAdjacentRoad) roadMult = 0.5;
      }

      // Agora : multiplicateur Drachmes sur ce bâtiment
      const agoraMult = agoraMults.get(cell.key) || 1;
      const finalMult = mult * roadMult;

      // Batiments a support adjacents
      const adjBuildings = ['farm','lumber','verger','halle','jardins','bosquet'];
      if (adjBuildings.includes(cell.building)) {
        const isWoodcutter = ['lumber','halle','bosquet'].includes(cell.building);
        const supportType  = isWoodcutter ? CELL_TYPE.FOREST : CELL_TYPE.FIELD;
        const supportCount = this.grid.getNeighbors(cell.q, cell.r)
          .filter(n => n.isRevealed && (n.type === supportType || n.ownedBy === cell.key)).length;
        const baseProd = def.baseProdPerField || def.baseProdPerSupport || 1;
        const resKey   = isWoodcutter ? 'bois' : 'nourr';
        rates[resKey] += baseProd * supportCount * finalMult;
        // Produits secondaires (nectar, amrita...)
        if (def.produces) Object.entries(def.produces).forEach(([r,v]) => { rates[r] = (rates[r]||0)+v*finalMult; });
      } else if (def.produces) {
        Object.entries(def.produces).forEach(([r,v]) => { rates[r] = (rates[r]||0)+v*finalMult; });
      }

      // Consommations (alambic, moulin, forge_divine, autel_fusion...)
      // Si la ressource source est à 0, on ne produit pas non plus (pas de production négative infinie)
      if (def.consumes) {
        let canProduce = true;
        Object.entries(def.consumes).forEach(([r,v]) => {
          if (this.rm.get(r) <= 0 && (rates[r]||0) - v*mult < 0) canProduce = false;
        });
        if (canProduce) {
          Object.entries(def.consumes).forEach(([r,v]) => { rates[r] = (rates[r]||0)-v*mult; });
        } else if (!canProduce && def.produces) {
          // Annuler aussi la production de ce bâtiment si les matières premières manquent
          const adjBuildings2 = ['farm','lumber','verger','halle','jardins','bosquet'];
          if (!adjBuildings2.includes(cell.building)) {
            Object.entries(def.produces).forEach(([r,v]) => { rates[r] = (rates[r]||0)-v*mult; });
          }
        }
      }

      // Comptage capacité logements (fixe par niveau, pas un rate)
      if (def.habitantsCapacity) {
        const connected = cell.isConnected;
        const roadMult2 = def.requiresRoad ?
          (this.grid.getNeighbors(cell.q,cell.r).some(n=>n.hasRoad||n.type===CELL_TYPE.BASE_MAIN) ? 1 : 0.5) : 1;
        totalHabitants += Math.floor(def.habitantsCapacity * cell.buildingLevel * roadMult2 * (connected ? 1 : 0.5));
      }
    });

    // Bonus habitants sur production globale (talent Prospérité)
    const popProdBonus = this.talentManager ? this.talentManager.getPopProdBonus() : 0;
    const availableHabitants = Math.max(0, totalHabitants - workersUsed);
    if (popProdBonus > 0 && availableHabitants > 0) {
      const habitantMult = 1 + (availableHabitants * popProdBonus / 100);
      const keysToBoost  = ['drachmes','bois','nourr','fer','nectar','bronze','acier','farine','foudre','orichalque','metal_divin','amrita','ambroisie'];
      keysToBoost.forEach(k => { if (rates[k] > 0) rates[k] *= habitantMult; });
    }

    // Multiplicateur global Senat
    if (hasSenat) {
      const keysToBoost = ['drachmes','bois','nourr','fer','nectar','bronze','acier','farine','foudre','orichalque','metal_divin','amrita','ambroisie'];
      keysToBoost.forEach(k => { if (rates[k] > 0) rates[k] *= senatMult; });
    }

    // ── Calcul Bonheur ──────────────────────────────────
    let happinessScore = 50; // base 50%
    // +bonus nourriture : si nourr rate > 0 et habitants > 0
    if (rates.nourr > 0 && totalHabitants > 0) {
      const nourPerHab = rates.nourr / Math.max(1, totalHabitants);
      happinessScore += Math.min(25, nourPerHab * 5);
    } else if (rates.nourr < 0) {
      happinessScore -= 20; // famine
    }
    // +bonus fontaines
    let fontaineCount = 0;
    this.grid.cells.forEach(c => { if (c.building === 'fontaine' && c.isConnected) fontaineCount++; });
    happinessScore += fontaineCount * 8;
    // +bonus population non saturée
    if (totalHabitants > 0 && workersUsed < totalHabitants) {
      happinessScore += 10;
    } else if (workersUsed >= totalHabitants && totalHabitants > 0) {
      happinessScore -= 15; // surpopulation ouvrière
    }
    // Clamp 0-100
    happinessScore = Math.max(0, Math.min(100, happinessScore));
    this.rm.happinessScore = happinessScore;
    EventBus.emit('happiness:updated', { score: happinessScore });

    // Appliquer les rates
    Object.entries(rates).forEach(([k,v]) => this.rm.setRate(k, v));
    this.rm.survivantsAssigned = workersUsed;
    this.rm.totalHabitants     = totalHabitants;
    this.rm.availableHabitants = Math.max(0, totalHabitants - workersUsed);
    EventBus.emit('population:updated', {
      total:     totalHabitants,
      workers:   workersUsed,
      available: Math.max(0, totalHabitants - workersUsed),
    });
  }

  _upgradeCost(def, currentLevel) {
    const mult = 1 + currentLevel * 0.3;
    const cost = {};
    Object.entries(def.upgradeCostBase).forEach(([k, v]) => {
      if (v > 0) cost[k] = Math.floor(v * mult);
    });
    if (Object.keys(cost).length === 0) cost.drachmes = Math.floor(30 * mult);
    return cost;
  }

  getBuildingInfo(cell) {
    if (!cell.building) return null;
    const def    = BUILDINGS[cell.building];
    if (!def) return null;
    const talent = this._getTalent(cell.building);
    const maxLvl = (def.maxLevel || 50) + talent.levelBonus;
    const mult   = levelMult(cell.buildingLevel) * (1 + talent.prodBonus / 100);
    const prod   = {};
    const connected = this._isConnected(cell);
    let adjInfo = null;

    // --- Bâtiments à cases de support adjacentes ---
    const isWoodcutter = ['lumber','halle','bosquet'].includes(cell.building);
    const isFarmer     = ['farm','verger','jardins'].includes(cell.building);

    if (isFarmer || isWoodcutter) {
      const supportType = isWoodcutter ? CELL_TYPE.FOREST : CELL_TYPE.FIELD;
      const supports    = this.grid.getNeighbors(cell.q, cell.r)
        .filter(n => n.isRevealed && (n.type === supportType || n.ownedBy === cell.key));
      const baseProd = def.baseProdPerField || def.baseProdPerSupport || 1;
      const resKey   = isWoodcutter ? 'bois' : 'nourr';
      if (connected) prod[resKey] = +(baseProd * supports.length * mult).toFixed(2);
      if (def.produces && connected) {
        Object.entries(def.produces).forEach(([r,v]) => {
          prod[r] = +(v * mult).toFixed(2);
        });
      }

      // Actions voisines : planter forêt (pour bûcherons) ou afficher champs disponibles
      let neighborActions = [];
      if (isWoodcutter) {
        const plainNeighbors = this.grid.getNeighbors(cell.q, cell.r)
          .filter(n => n.isRevealed && !n.building && n.type === CELL_TYPE.PLAIN);
        neighborActions = plainNeighbors.slice(0, 3).map(n => ({
          cell: n,
          action: { label: 'Planter Foret', glyph: '\u{1F332}', cost:{drachmes:80,bois:30}, targetType:CELL_TYPE.FOREST }
        }));
      }
      adjInfo = {
        label:    isWoodcutter ? 'Forets' : 'Champs',
        count:    supports.length,
        bonusPct: Math.round((mult - 1) * 100),
        neighborActions,
      };

    // --- Bâtiments de transformation (consomme → produit) ---
    } else if (def.consumes && def.produces) {
      if (connected) {
        Object.entries(def.produces).forEach(([r,v]) => { prod[r] = +(v*mult).toFixed(2); });
        const consumeInfo = Object.entries(def.consumes)
          .map(([r,v]) => `-${(v*mult).toFixed(2)} ${r}`)
          .join(', ');
        adjInfo = { label: 'Transformation', count: 0, bonusPct: 0,
                    consumeInfo, neighborActions:[] };
      }

    // --- Bâtiments de production simple ---
    } else if (def.produces) {
      if (connected) {
        Object.entries(def.produces).forEach(([r,v]) => { prod[r] = +(v*mult).toFixed(2); });
      }
    }

    // --- Auras (Agora, Sanctuaire, etc.) ---
    if (def.auraType) {
      const auraRadius = def.auraRadius || 2;
      let auraCount = 0;
      this.grid.getNeighbors(cell.q, cell.r).forEach(n => {
        if (n.isRevealed && n.building) auraCount++;
      });
      adjInfo = adjInfo || { label:"Zone d'influence", count:auraCount, bonusPct:0, neighborActions:[] };
      adjInfo.auraDesc = 'Rayon ' + auraRadius + ' hex.';
    }

    return {
      def, level: cell.buildingLevel, maxLevel: maxLvl,
      production: prod, connected, adjInfo,
      upgradeCost: cell.buildingLevel < maxLvl ? this._upgradeCost(def, cell.buildingLevel) : null,
    };
  }


  // == ACTION VOISIN ==
  executeNeighborAction(buildingCell, targetCell, action, screenX, screenY) {
    if (!this.rm.canAfford(action.cost)) {
      EventBus.emit('ui:feedback', { text: 'Ressources insuffisantes !', x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    this.rm.spend(action.cost);
    targetCell.type = action.targetType;
    this._recalculateAllRates();
    EventBus.emit('terrain:transformed', { cell: targetCell });
    EventBus.emit('ui:feedback', { text: action.glyph + ' ' + action.label + ' !', x: screenX, y: screenY, color: '#80d0ff' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  // == TERRAIN TRANSFORMS ==
  transformTerrain(cell, targetType, screenX, screenY) {
    if (!cell.isRevealed) return false;
    if (cell.building) {
      EventBus.emit('ui:feedback', { text: 'Demolissez le batiment !', x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    if (cell.type === CELL_TYPE.BASE_MAIN) return false;
    const transforms = BuildingManager.getTerrainTransforms(cell.type);
    const tr = transforms.find(t => t.targetType === targetType);
    if (!tr) return false;
    if (!this.rm.canAfford(tr.cost)) {
      EventBus.emit('ui:feedback', { text: 'Ressources insuffisantes !', x: screenX, y: screenY, color: '#e05050' });
      return false;
    }
    this.rm.spend(tr.cost);
    if (cell.type === CELL_TYPE.TUNNEL && cell.hasRoad) cell.hasRoad = false;
    cell.type      = targetType;
    cell.maxHP     = cell._computeMaxHP();
    cell.currentHP = 0;
    this._recalculateAllRates();
    EventBus.emit('terrain:transformed', { cell, targetType });
    EventBus.emit('ui:feedback', { text: tr.glyph + ' Transforme !', x: screenX, y: screenY, color: '#80d0ff' });
    return true;
  }

  static getTerrainTransforms(fromType) {
    const T = {
      plain:  [{ targetType: 'forest', label: 'Planter une Foret',      glyph: '\u{1F332}',       description: 'Convertit en foret exploitable.',              cost: { drachmes: 80, bois: 30 } }],
      forest: [{ targetType: 'plain',  label: 'Raser la Foret',         glyph: '\u{1F525}',       description: 'Rase la foret, cree une plaine.',              cost: { drachmes: 40 } }],
      river:  [{ targetType: 'mud',    label: 'Drainer la Riviere',     glyph: '\u{1F3DC}\uFE0F', description: 'Commence le drainage. Cree une Vase.',          cost: { drachmes: 60 } }],
      mud:    [{ targetType: 'plain',  label: 'Assecher la Vase',       glyph: '\u{1F6A7}',       description: 'Termine le drainage. Cree une Plaine.',         cost: { drachmes: 120, bois: 60 } }],
      mountain: [
        { targetType: 'rubble', label: 'Exploser la Montagne', glyph: '\u{1F4A5}',       description: 'Detruit en decombres productifs (+Fer +Bois).', cost: { drachmes: 2000, bois: 800, fer: 300 } },
        { targetType: 'tunnel', label: 'Creuser un Tunnel',    glyph: '\u{1F6E4}\uFE0F', description: 'Perce la montagne. Permet le passage de routes.', cost: { drachmes: 3000, bois: 500, fer: 800 } },
      ],
      tunnel: [{ targetType: 'plain', label: 'Effondrer le Tunnel',       glyph: '\u{1F4A5}', description: 'Effondrement. Cree une Plaine.',        cost: { drachmes: 100 } }],
      rubble: [{ targetType: 'plain', label: 'Deblayer les Decombres',    glyph: '\u{1F9F9}', description: 'Nettoie et nivelle. Cree une Plaine.',   cost: { drachmes: 500, bois: 200, fer: 50 } }],
    };
    return T[fromType] || [];
  }

  static getBuildingsForTerrain(terrainType) {
    return Object.values(BUILDINGS).filter(b => b.validTerrain.includes(terrainType));
  }

  // == TALENTS ==
  applyTalents(talents) {
    Object.assign(this._talents, talents);
    this._recalculateAllRates();
  }

  _bindEvents() {
    EventBus.on('road:changed', () => this._recalculateAllRates());
    const self = this;

    EventBus.on('mud:click', function(d) {
      const key = d.cell.key, now = Date.now();
      if (self._mudCooldowns[key] && now < self._mudCooldowns[key]) return;
      self._mudCooldowns[key] = now + 3000;
      self.rm.addResources({ nourr: 2, bois: 1 });
      EventBus.emit('ui:feedback', { text: '+2 \uD83C\uDF3E +1 \uD83E\uDEB5', x: d.screenX, y: d.screenY, color: '#5aaa5a' });
      EventBus.emit('resources:updated', self.rm.getSnapshot());
    });

    EventBus.on('rubble:click', function(d) {
      const key = d.cell.key, now = Date.now();
      if (self._mudCooldowns[key] && now < self._mudCooldowns[key]) return;
      self._mudCooldowns[key] = now + 5000;
      self.rm.addResources({ fer: 1 });
      EventBus.emit('ui:feedback', { text: '+1 \u2699\uFE0F', x: d.screenX, y: d.screenY, color: '#7aaad4' });
      EventBus.emit('resources:updated', self.rm.getSnapshot());
    });
  }
}
