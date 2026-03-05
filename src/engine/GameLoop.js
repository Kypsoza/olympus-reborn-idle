/* ═══════════════════════════════════════════════════════════
   GameLoop — v0.6.0.js — Boucle principale (Phase 2)
   Ajouts : BuildingManager, BuildingPanel, survivants
════════════════════════════════════════════════════════════ */

class GameLoop {
  constructor() {
    this.running      = false;
    this._lastTime    = 0;
    this._tickAccum   = 0;
    this.TICK_RATE    = 1000;

    this.grid            = null;
    this.camera          = null;
    this.renderer        = null;
    this.resources       = null;
    this.hud             = null;
    this.buildingManager = null;
    this.buildingPanel   = null;
    this.talentManager   = null;
    this.scoutManager     = null;
    this.prestigeManager  = null;

    this._autoSaveInterval = null;
  }

  async init() {
    this._loadProgress(10, 'Génération du monde...');
    await this._sleep(200);

    // 1. Grille
    const savedData = SaveManager.load();
    this.grid = (savedData?.grid)
      ? HexGrid.deserialize(savedData.grid)
      : new HexGrid(Date.now());

    this._loadProgress(35, 'Éveil des ressources...');
    await this._sleep(150);

    // 2. Canvas + caméra
    const canvas = document.getElementById('game-canvas');
    this._resizeCanvas(canvas);
    this.camera   = new Camera(canvas);
    this.renderer = new MapRenderer(canvas, this.grid, this.camera);

    this._loadProgress(55, 'Recrutement des survivants...');
    await this._sleep(150);

    // 3. Ressources
    this.resources = new ResourceManager();
    if (savedData?.resources) this.resources.deserialize(savedData.resources);

    // 4. Systèmes Phase 2 + 3
    this.talentManager   = new TalentManager(this.resources);
    if (savedData && savedData.talents) this.talentManager.deserialize(savedData.talents);
    // Note: prestige deserialized after init
    this.buildingManager = new BuildingManager(this.grid, this.resources);
    this.buildingManager.talentManager = this.talentManager;
    if (this.renderer) this.renderer._talentManager = this.talentManager;
    this.buildingManager._recalculateAllRates();
    this.scoutManager    = new ScoutManager(this.grid, this.buildingManager);
    this.codexManager    = new CodexManager(this.grid, this.resources, this.buildingManager);
    this.prestigeManager = new PrestigeManager(this.grid, this.resources, this.buildingManager);
    this.prestigeManager.talentManager = this.talentManager;
    this.prestigeManager.codexManager  = this.codexManager;
    this.codexManager.talentManager    = this.talentManager;
    if (savedData && savedData.prestige) this.prestigeManager.deserialize(savedData.prestige);
    if (savedData && savedData.codex)    this.codexManager.deserialize(savedData.codex);
    // Restaurer hiddenAt pour offline progress
    if (savedData && savedData.hiddenAt) {
      this._hiddenAt = savedData.hiddenAt;
    }
    window.game = window.game || {}; window.game.prestigeManager = this.prestigeManager;

    this._loadProgress(75, 'Restauration de la civilisation...');
    await this._sleep(150);

    // 5. HUD + panneau
    this.hud           = new HUD(this.resources, this.grid);
    this.hud.prestige  = this.prestigeManager;
    this.hud.codex     = this.codexManager;
    this.buildingPanel = new BuildingPanel(this.buildingManager, this.resources, this.talentManager);
    this.helpPanel     = new HelpPanel();
    this.offlineModal  = new OfflineModal();
    window._talentPanel = this.buildingPanel;

    this._loadProgress(90, 'Derniers préparatifs...');
    await this._sleep(200);

    // 6. Événements globaux
    this._bindGlobalEvents(canvas);

    // 7. Auto-save
    this._autoSaveInterval = setInterval(() => this._doSave(), 30000);

    this._loadProgress(100, "Le monde s'eveille...");
    await this._sleep(350);

    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('game-container').classList.remove('hidden');

    this.hud.update(this.resources.getSnapshot());
    this.hud.updateEraBadge(this.talentManager.getUnlockedEra());
    this.hud.setInfo('⚡ Bienvenue ! Cliquez sur une case du brouillard pour fouiller.');

    // Calcul offline si session précédente interrompue
    if (this._hiddenAt) {
      const elapsed = (Date.now() - this._hiddenAt) / 1000;
      this._hiddenAt = null;
      if (elapsed >= 30) {
        setTimeout(() => this._applyOfflineProgress(elapsed), 800);
      }
    }

    this.running   = true;
    this._lastTime = performance.now();
    requestAnimationFrame(this._loop.bind(this));

    console.log('[GameLoop] Phase 4 initialisée.');
  }

  // ── Boucle ───────────────────────────────────────────────
  _loop(timestamp) {
    if (!this.running) return;
    const dt = timestamp - this._lastTime;
    this._lastTime = timestamp;

    this._tickAccum += dt;
    while (this._tickAccum >= this.TICK_RATE) {
      this._gameTick();
      this._tickAccum -= this.TICK_RATE;
    }

    this.renderer.render(dt / 1000);
    requestAnimationFrame(this._loop.bind(this));
  }

  _gameTick() {
    this.resources.tick(1);
    this.hud.tickIncrement();
    if (this.scoutManager) this.scoutManager.tick(1);
  }

  // ── Événements globaux ───────────────────────────────────
  _bindGlobalEvents(canvas) {
    window.addEventListener('resize', () => {
      this._resizeCanvas(canvas);
      this.renderer.resize(canvas.width, canvas.height);
      this.camera.resize(canvas.width, canvas.height);
    });

    EventBus.on('zoom:in',    () => this.camera.setZoom(this.camera.zoom * 1.2));
    EventBus.on('zoom:out',   () => this.camera.setZoom(this.camera.zoom * 0.8));
    EventBus.on('zoom:reset', () => this.camera.resetView());
    EventBus.on('save:request', () => this._doSave());
    EventBus.on('save:reset', () => this._doReset());

    // Debug: bouton reveal all (uniquement si ?debug dans l URL)
    if (window.location.search.includes('debug')) {
      var revealBtn = document.getElementById('btn-reveal-all');
      if (revealBtn) {
        revealBtn.style.display = 'block';
        revealBtn.addEventListener('click', () => {
          this.grid.cells.forEach(cell => {
            if (cell.isHidden) {
              cell.state = CELL_STATE.REVEALED;
              cell.currentHP = 0;
              if (cell.type === CELL_TYPE.ALTAR) {
                var pm = this.prestigeManager;
                if (pm && !pm.isAltarUnlocked(cell)) cell.type = CELL_TYPE.ALTAR; // keep but revealed
              }
            }
          });
          this.buildingManager._recalculateAllRates();
          this.hud.setInfo('🗺 Carte entièrement révélée (debug)');
          EventBus.emit('resources:updated', this.resources.getSnapshot());
        });
      }
    }
    EventBus.on('talent:applied', () => {
      if (this.buildingManager) this.buildingManager._recalculateAllRates();
    });
    EventBus.on('ether:talent:applied', (d) => {
      // Refresh HUD era badge + rebuild rates (era unlock changes available buildings)
      if (this.hud) this.hud.updateEraBadge(this.talentManager.getUnlockedEra());
      if (this.buildingManager) this.buildingManager._recalculateAllRates();
    });
    EventBus.on('prestige:complete', () => {
      // Rebind buildingManager to new grid state
      this.buildingManager.grid = this.grid;
      this.scoutManager.grid    = this.grid;
      this.buildingManager._recalculateAllRates();
      this.hud.setInfo('✨ Renaissance accomplie ! Le monde renaît...');
    });

    // Visibilité de page — offline progress (Phase 7)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._hiddenAt = Date.now();
        this._doSave(); // sauvegarde immédiate avec timestamp
      } else if (this._hiddenAt) {
        const elapsed = (Date.now() - this._hiddenAt) / 1000;
        this._hiddenAt = null;
        if (elapsed >= 30) {
          this._applyOfflineProgress(elapsed);
        }
      }
    });
  }

  _applyOfflineProgress(seconds) {
    const MAX_OFFLINE  = 8 * 3600; // 8h max
    const OFFLINE_RATE = 0.5;      // 50% de la production normale
    const effectiveSec = Math.min(seconds, MAX_OFFLINE);
    const tickSeconds  = effectiveSec * OFFLINE_RATE;

    // Capturer les gains avant/après
    const before = {};
    const rm = this.resources;
    Object.keys(rm.resources).forEach(k => { before[k] = rm.get(k); });

    // Appliquer la production simulée
    rm.tick(tickSeconds);

    // Calculer les gains nets
    const gains = {};
    Object.keys(rm.resources).forEach(k => {
      const diff = rm.get(k) - before[k];
      if (diff > 0.01) gains[k] = diff;
    });

    console.log('[GameLoop] Offline: ' + Math.round(effectiveSec) + 's simulées (' + Math.round(tickSeconds) + 's effectives)');

    // Afficher la modale
    if (this.offlineModal) {
      this.offlineModal.show(seconds, gains);
    }
  }

  _doSave() {
    SaveManager.save({
      grid:      this.grid.serialize(),
      resources: this.resources.serialize(),
      talents:   this.talentManager.serialize(),
      prestige:  this.prestigeManager.serialize(),
      codex:     this.codexManager    ? this.codexManager.serialize() : null,
      hiddenAt:  this._hiddenAt || null,
    });
    // Sync Drive si connecté (sans bloquer)
    if (typeof GoogleDriveSync !== 'undefined' && GoogleDriveSync.isSignedIn()) {
      const raw = localStorage.getItem('olympus_reborn_save');
      if (raw) GoogleDriveSync.saveToDrive(raw).catch(e =>
        console.warn('[GDriveSync] Autosave Drive:', e)
      );
    }
  }

  _doReset() {
    // Confirmation avant effacement
    if (!confirm('Réinitialiser la partie ? Toute progression sera perdue.')) return;
    SaveManager.clear();
    window.location.reload();
  }

  _resizeCanvas(canvas) {
    const c = document.getElementById('map-container');
    canvas.width  = c.clientWidth  || window.innerWidth;
    canvas.height = c.clientHeight || (window.innerHeight - 64 - 40);
  }

  _loadProgress(pct, text) {
    const bar = document.getElementById('loading-bar');
    const txt = document.getElementById('loading-text');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = text;
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// ── Point d'entrée ───────────────────────────────────────
// Le démarrage est géré par l'écran titre dans index.html
