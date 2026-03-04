/* ═══════════════════════════════════════════════════════════
   HexCell.js — Modèle de données d'une case hexagonale
════════════════════════════════════════════════════════════ */

// Types de terrain
const CELL_TYPE = {
  VOID:      'void',      // Hors carte (jamais affiché)
  PLAIN:     'plain',     // Plaine (fermes)
  FOREST:    'forest',    // Forêt (camps de bûcherons)
  MOUNTAIN:  'mountain',  // Montagne (mines)
  RIVER:     'river',     // Rivière (bonus futur)
  BASE:      'base',      // Base cachée
  BASE_MAIN: 'base_main', // Base principale (départ)
  ALTAR:     'altar',     // Autel de Promethe
  FIELD:     'field',     // Champ (auto, adjacent a une Ferme)
  GROVE:     'grove',     // Bosquet cultive (auto, adjacent a un Camp)
  MUD:       'mud',       // Vase/Marais (etat intermediaire riviere -> plaine)
  RUBBLE:    'rubble',    // Decombres (montagne explosee)
  TUNNEL:    'tunnel',    // Tunnel perce dans une montagne
};

// États de visibilité
const CELL_STATE = {
  HIDDEN:   'hidden',   // Brouillard total
  REVEALED: 'revealed', // Case visible et jouable
};

// Couleurs de rendu par type (canvas)
const CELL_COLORS = {
  [CELL_TYPE.PLAIN]:     { fill: '#2a3d1a', stroke: '#3a5520', glyph: '🌿' },
  [CELL_TYPE.FOREST]:    { fill: '#1a2d12', stroke: '#2a4518', glyph: '🌲' },
  [CELL_TYPE.MOUNTAIN]:  { fill: '#3a3028', stroke: '#5a4a38', glyph: '⛰️' },
  [CELL_TYPE.RIVER]:     { fill: '#1a2840', stroke: '#2a4060', glyph: '💧' },
  [CELL_TYPE.BASE]:      { fill: '#2a2040', stroke: '#5a4080', glyph: '🏛️' },
  [CELL_TYPE.BASE_MAIN]: { fill: '#3a2a10', stroke: '#c8951a', glyph: '⚡' },
  [CELL_TYPE.ALTAR]:     { fill: '#2a1040', stroke: '#8a40c0', glyph: '🔮' },
  [CELL_TYPE.FIELD]:     { fill: '#2a3d0a', stroke: '#5a8020', glyph: '🌾' },
  [CELL_TYPE.GROVE]:     { fill: '#1a3010', stroke: '#304a18', glyph: '🌳' },
  [CELL_TYPE.MUD]:      { fill: '#2a1e10', stroke: '#4a3020', glyph: '🟫' },
  [CELL_TYPE.RUBBLE]:   { fill: '#2e2820', stroke: '#5a5040', glyph: '🪨' },
  [CELL_TYPE.TUNNEL]:   { fill: '#1a1510', stroke: '#8a6040', glyph: '🛤️' },
};

// Noms lisibles
const CELL_NAMES = {
  [CELL_TYPE.PLAIN]:     'Plaine',
  [CELL_TYPE.FOREST]:    'Forêt',
  [CELL_TYPE.MOUNTAIN]:  'Montagne',
  [CELL_TYPE.RIVER]:     'Rivière',
  [CELL_TYPE.BASE]:      'Ruines Antiques',
  [CELL_TYPE.BASE_MAIN]: 'Base Principale',
  [CELL_TYPE.ALTAR]:     'Autel de Promethe',
  [CELL_TYPE.FIELD]:     'Champ Cultive',
  [CELL_TYPE.GROVE]:     'Bosquet Cultive',
  [CELL_TYPE.MUD]:      'Vase Marecageuse',
  [CELL_TYPE.RUBBLE]:   'Decombres',
  [CELL_TYPE.TUNNEL]:   'Tunnel',
};

class HexCell {
  constructor(q, r, type = CELL_TYPE.PLAIN) {
    this.q = q;
    this.r = r;
    this.key = HexUtils.hexKey(q, r);
    this.type = type;
    this.state = CELL_STATE.HIDDEN;

    // Fouille
    this.maxHP = this._computeMaxHP();
    this.currentHP = this.maxHP;

    // Fouille en cours
    this.isBeingDug = false;  // true quand le joueur clique dessus

    // Bâtiment placé sur cette case (Phase 2)
    this.building      = null;  // ID du type de bâtiment (ex: 'farm')
    this.buildingLevel = 1;

    // Route sur cette case (Phase 3)
    this.hasRoad = false;

    // Phase 4 : Base cachee
    this.baseLevel  = 1;   // niveau amelioration base (1-5)
    this.isHeritage = false; // spectre d heritage post-prestige
    this.isConnected = false; // cache de connexion (calcule par BuildingManager)

    // Métadonnées visuelles
    this.glowIntensity = 0;   // Pour les cases spéciales (0-1)
    this.revealAnim = 0;      // Animation de révélation (0-1)
    this.digShakeAnim = 0;    // Tremblement au clic de fouille
  }

  _computeMaxHP() {
    switch(this.type) {
      case CELL_TYPE.PLAIN:    return MathUtils.randomInt(80, 120);
      case CELL_TYPE.FOREST:   return MathUtils.randomInt(100, 160);
      case CELL_TYPE.MOUNTAIN: return MathUtils.randomInt(180, 280);
      case CELL_TYPE.RIVER:    return MathUtils.randomInt(60, 100);
      case CELL_TYPE.MUD:      return 60;
      case CELL_TYPE.RUBBLE:  return 50;
      case CELL_TYPE.TUNNEL:  return 40;
      case CELL_TYPE.BASE:     return MathUtils.randomInt(400, 600);
      case CELL_TYPE.ALTAR:    return 2000;
      case CELL_TYPE.BASE_MAIN: return 0;
      case CELL_TYPE.FIELD:    return 60;
      case CELL_TYPE.GROVE:    return 80;
      default: return 100;
    }
  }

  get isRevealed()  { return this.state === CELL_STATE.REVEALED; }
  get isHidden()    { return this.state === CELL_STATE.HIDDEN; }
  get isBase()      { return this.type === CELL_TYPE.BASE || this.type === CELL_TYPE.BASE_MAIN; }
  get isSpecial()   { return this.type === CELL_TYPE.BASE || this.type === CELL_TYPE.ALTAR; }

  get colors()      { return CELL_COLORS[this.type] || CELL_COLORS[CELL_TYPE.PLAIN]; }
  get displayName() { return CELL_NAMES[this.type] || 'Inconnue'; }

  reveal() {
    this.state = CELL_STATE.REVEALED;
    this.revealAnim = 0;
  }

  serialize() {
    return {
      q: this.q, r: this.r, type: this.type,
      state: this.state, currentHP: this.currentHP, maxHP: this.maxHP,
      building: this.building, buildingLevel: this.buildingLevel,
      hasRoad: this.hasRoad, glowIntensity: this.glowIntensity,
      baseLevel: this.baseLevel, isHeritage: this.isHeritage, isConnected: this.isConnected
    };
  }

  static deserialize(data) {
    const cell = new HexCell(data.q, data.r, data.type);
    cell.state         = data.state;
    cell.maxHP         = data.maxHP         ?? cell.maxHP;  // restaurer ou garder le calcul initial
    cell.currentHP     = data.currentHP     ?? cell.maxHP;
    cell.building      = data.building      ?? null;
    cell.buildingLevel = data.buildingLevel  ?? 1;
    cell.hasRoad       = data.hasRoad        ?? false;
    cell.glowIntensity = data.glowIntensity  ?? 0;
    cell.baseLevel     = data.baseLevel      ?? 1;
    cell.isHeritage    = data.isHeritage     ?? false;
    cell.isConnected   = data.isConnected    ?? false;
    return cell;
  }
}
