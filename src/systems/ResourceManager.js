/* ResourceManager.js — v0.5.0
   Ressources Ère 1 : drachmes, bois, nourr, fer, habitants
   Ressources Ère 2 : nectar, bronze, acier, farine, foudre
   Ressources Ère 3 : orichalque, metal_divin, amrita
   Prestige         : ether (permanent)
*/
class ResourceManager {
  constructor() {
    this.resources = {
      // ── Ère 1 ─────────────────────────────────────────
      drachmes:    { value: 999999,  max: 1e15, rate: 0, era: 1 },
      bois:        { value: 200,  max: 1e12, rate: 0, era: 1 },
      nourr:       { value: 100,  max: 1e12, rate: 0, era: 1 },
      fer:         { value: 50,   max: 1e12, rate: 0, era: 1 },
      habitants:   { value: 0,    max: 1e9,  rate: 0, era: 1 },
      // ── Ère 2 ─────────────────────────────────────────
      nectar:      { value: 0,    max: 1e12, rate: 0, era: 2 },
      bronze:      { value: 0,    max: 1e12, rate: 0, era: 2 },
      acier:       { value: 0,    max: 1e12, rate: 0, era: 2 },
      farine:      { value: 0,    max: 1e12, rate: 0, era: 2 },
      foudre:      { value: 0,    max: 1e9,  rate: 0, era: 2 },
      ambroisie:   { value: 0,    max: 1e9,  rate: 0, era: 2 },
      // ── Ère 3 ─────────────────────────────────────────
      orichalque:  { value: 0,    max: 1e9,  rate: 0, era: 3 },
      metal_divin: { value: 0,    max: 1e9,  rate: 0, era: 3 },
      amrita:      { value: 0,    max: 1e9,  rate: 0, era: 3 },
      // ── Prestige ──────────────────────────────────────
      ether:       { value: 0,    max: Infinity, rate: 0, era: 0 },
    };
    this.survivants         = 5;
    this.maxSurvivants      = 10;
    this.survivantsAssigned = 0;
    this.totalHabitants     = 0;
    this.availableHabitants = 0;
  }

  tick(dt) {
    Object.values(this.resources).forEach(res => {
      if (res.rate === 0) return;
      res.value = MathUtils.clamp(res.value + res.rate * dt, 0, res.max);
    });
    this._emitUpdated();
  }

  _emitUpdated() {
    if (this._updateScheduled) return;
    this._updateScheduled = true;
    Promise.resolve().then(() => {
      this._updateScheduled = false;
      EventBus.emit('resources:updated', this.getSnapshot());
    });
  }

  get(key)     { return this.resources[key]?.value ?? 0; }
  getMax(key)  { return this.resources[key]?.max   ?? 0; }
  getRate(key) { return this.resources[key]?.rate  ?? 0; }

  canAfford(costs) {
    return Object.entries(costs).every(([k, v]) => this.get(k) >= v);
  }

  spend(costs) {
    if (!this.canAfford(costs)) return false;
    Object.entries(costs).forEach(([k, v]) => { this.resources[k].value -= v; });
    this._emitUpdated();
    return true;
  }

  add(key, amount) {
    const r = this.resources[key];
    if (!r) return;
    r.value = MathUtils.clamp(r.value + amount, 0, r.max);
    this._emitUpdated();
  }

  addResources(gains) {
    Object.entries(gains).forEach(([k, v]) => {
      if (this.resources[k])
        this.resources[k].value = MathUtils.clamp(this.resources[k].value + v, 0, this.resources[k].max);
    });
    this._emitUpdated();
  }

  setRate(key, rate) {
    if (this.resources[key]) this.resources[key].rate = rate;
  }

  getSnapshot() {
    const snap = {};
    Object.entries(this.resources).forEach(([k, r]) => {
      snap[k] = { value: r.value, max: r.max, rate: r.rate, era: r.era };
    });
    snap.survivants    = this.survivants;
    snap.maxSurvivants = this.maxSurvivants;
    return snap;
  }

  serialize() {
    return {
      resources:   JSON.parse(JSON.stringify(this.resources)),
      survivants:  this.survivants,
      maxSurvivants: this.maxSurvivants,
    };
  }

  deserialize(data) {
    if (!data) return;
    Object.entries(data.resources || {}).forEach(([k, v]) => {
      if (this.resources[k]) Object.assign(this.resources[k], v);
    });
    this.survivants    = data.survivants    ?? 5;
    this.maxSurvivants = data.maxSurvivants ?? 10;
  }
}
