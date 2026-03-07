/* ═══════════════════════════════════════════════════════════
   HUD.js — v0.6.0 — Interface tête haute (Phase 2)
   Ajouts : tooltip enrichi bâtiments, feedback visuel
════════════════════════════════════════════════════════════ */

class HUD {
  constructor(resourceManager, grid) {
    this.rm   = resourceManager;
    this.grid = grid;

    this.els = {
      drachmes: document.getElementById('val-drachmes'),
      bois:     document.getElementById('val-bois'),
      nourr:    document.getElementById('val-nourr'),
      fer:      document.getElementById('val-fer'),
      ether:    document.getElementById('val-ether'),
      rateDr:   document.getElementById('rate-drachmes'),
      rateBo:   document.getElementById('rate-bois'),
      rateNo:   document.getElementById('rate-nourr'),
      rateFe:   document.getElementById('rate-fer'),
      score:    document.getElementById('val-score'),
      survivors:document.getElementById('val-survivants'),
      maxSurv:  document.getElementById('max-survivants'),
      info:     document.getElementById('info-text'),
      tickCount:document.getElementById('tick-count'),
    };

    // tooltip supprime - remplace par drawer bas

    this._prevValues = {};
    this._tickCount  = 0;
    this.prestige    = null; // injecté par GameLoop après init

    this._bindEvents();
    this._bindButtons();
  }

  // ── Mise à jour HUD ─────────────────────────────────────
  _refreshScore() {
    if (!this.grid) return;
    const score  = this.prestige ? this.prestige.getLiveScore() : this.grid.computeRenaissanceScore();
    if (this.els.score) this.els.score.textContent = MathUtils.formatNumber(score);
    // Mise à jour compteur conditions prestige
    this._refreshPrestigeConditions();
    // Mise à jour indicateur Codex
    this._refreshCodexBadge();
    // Mise à jour indicateur malédictions
    this._refreshCurseBar();
  }

  _refreshCurseBar() {
    var zm = this.zones;
    var el = document.getElementById('curse-hud-bar');
    if (!el) return;
    if (!zm) { el.style.display = 'none'; return; }
    var curses = zm.getActiveCurses();
    var mult   = zm.getCurseMult();
    if (curses.length === 0 && mult >= 1.0) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'flex';
    var worst = curses.length > 0 ? curses[0].stage.label : '';
    if (curses.length > 1) worst = curses.length + ' malédictions';
    var pct = Math.round((1 - mult) * 100);
    // Build detailed tooltip — cause + resolution per curse
    var curseTipHtml = '<div style="font-size:11px;color:#ff9090;font-weight:700;margin-bottom:6px">⚠️ Malédictions actives</div>';
    curseTipHtml += curses.map(function(cu) {
      var why  = cu.stage.desc  || ('La zone ' + (cu.def.god||'') + ' est maudite');
      var how  = cu.def.ritual  || ('Accomplir le rituel de la zone ' + (cu.def.god||''));
      var penalty = cu.stage.mult != null ? Math.round((1 - cu.stage.mult) * 100) : 0;
      return '<div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(255,80,80,0.15)">' +
        '<div style="color:' + (cu.def.color||'#ff8080') + ';font-weight:700;margin-bottom:3px">' + (cu.def.icon||'💀') + ' ' + (cu.def.god||'') + ' — ' + cu.stage.label + ' (-' + penalty + '%)</div>' +
        '<div style="color:#c0a0d0;font-size:10px;margin-bottom:2px">📖 Pourquoi : ' + why + '</div>' +
        '<div style="color:#90e890;font-size:10px">🔧 Résoudre : ' + how + '</div>' +
        '</div>';
    }).join('');
    curseTipHtml += '<div style="font-size:10px;color:#808080;margin-top:4px">Pénalité totale production : -' + Math.round((1-mult)*100) + '%</div>';
    el.innerHTML =
      '<span class="chb-curse-icon">💀</span>' +
      '<span class="chb-curse-label">' + worst + '</span>' +
      '<span class="chb-curse-mult">-' + pct + '%</span>' +
      '<div class="chb-curse-tooltip">' + curseTipHtml + '</div>';
  }

  _refreshCodexBadge() {
    var cm = this.codex;
    var el = document.getElementById('codex-hud-badge');
    if (!el || !cm) return;
    var mult = cm.getEtherMultiplier();
    var pct  = Math.round(cm.getProgressToNextLevel() * 100);
    el.innerHTML =
      '<span class="chb-icon">📖</span>' +
      '<span class="chb-level">Niv.' + cm.codexLevel + '</span>' +
      '<span class="chb-mult">×' + mult.toFixed(1) + '</span>' +
      '<div class="chb-bar-track"><div class="chb-bar-fill" style="width:' + pct + '%"></div></div>';
    // Afficher seulement si au moins 1 prestige fait (pages > 0)
    if (cm.pages > 0 || cm.codexLevel > 1) {
      el.classList.add('chb-visible');
    }
  }

  _refreshPrestigeConditions() {
    if (!this.prestige) return;
    const cond = this.prestige.getConditions();
    const el   = document.getElementById('prestige-conditions-bar');
    if (!el) return;
    // Montrer la barre dès 25 cases révélées (50% de l'objectif)
    if (cond.revealed >= 25) el.classList.add('pcond-visible');
    const wasAllMet = el.dataset.allMet === 'true';
    const allMet = cond.allMet;
    el.dataset.allMet = allMet;

    const c1Pct = Math.min(100, Math.round(cond.revealed / 50 * 100));
    const c2Pct = Math.min(100, Math.round(cond.basesLvl5 / 3 * 100));

    el.innerHTML =
      '<div class="pcond-row">' +
        '<span class="pcond-icon">' + (cond.revealedOk ? '✅' : '🔍') + '</span>' +
        '<div class="pcond-bar-wrap">' +
          '<div class="pcond-label">Cases révélées : <b>' + cond.revealed + ' / 50</b></div>' +
          '<div class="pcond-track"><div class="pcond-fill' + (cond.revealedOk ? ' pcond-done' : '') + '" style="width:' + c1Pct + '%"></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="pcond-row">' +
        '<span class="pcond-icon">' + (cond.basesLvl5Ok ? '✅' : '🏛️') + '</span>' +
        '<div class="pcond-bar-wrap">' +
          '<div class="pcond-label">Bases Niv.5 : <b>' + cond.basesLvl5 + ' / 3</b></div>' +
          '<div class="pcond-track"><div class="pcond-fill' + (cond.basesLvl5Ok ? ' pcond-done' : '') + '" style="width:' + c2Pct + '%"></div></div>' +
        '</div>' +
      '</div>';

    // Modale de complétion quand toutes les conditions sont remplies pour la première fois
    if (allMet && !wasAllMet) {
      this._showPrestigeReadyModal();
    }
  }

  _showPrestigeReadyModal() {
    // Supprimer une éventuelle modale précédente
    const prev = document.getElementById('prestige-ready-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'prestige-ready-modal';
    modal.innerHTML =
      '<div class="prm-content">' +
        '<div class="prm-fireworks">🎆🎇✨🎆🎇</div>' +
        '<div class="prm-title">⚡ Prestige Débloqué !</div>' +
        '<div class="prm-msg">Toutes les conditions sont remplies.<br>L\'<b>Autel de Prométhée</b> est maintenant actif.<br>Fouille-le pour déclencher le Prestige !</div>' +
        '<button class="prm-close" onclick="document.getElementById(\'prestige-ready-modal\').remove()">Continuer</button>' +
      '</div>';
    document.body.appendChild(modal);

    // Auto-remove après 8s
    setTimeout(() => { if (modal.parentNode) modal.remove(); }, 8000);
  }

  update(snap) {
    const fmt  = MathUtils.formatNumber;
    const fmtR = MathUtils.formatRate;

    this._setVal('drachmes', snap.drachmes.value, fmt);
    this._setVal('bois',     snap.bois.value,     fmt);
    this._setVal('nourr',    snap.nourr.value,     fmt);
    this._setVal('fer',      snap.fer.value,       fmt);
    // Éther : notation scientifique si > 9999
    var etherFmt = function(v) {
      if (v >= 1e6)  return (v/1e6).toFixed(1)  + 'M';
      if (v >= 1e4)  return (v/1e3).toFixed(1)  + 'k';
      return Math.floor(v).toString();
    };
    this._setVal('ether', snap.ether.value, etherFmt);
    var etherEl = document.getElementById('res-ether');
    if (etherEl) etherEl.classList.toggle('has-ether', snap.ether.value > 0);
    // Afficher rate Éther si > 0 (Palais des Titans etc.)
    var etherRate = document.getElementById('rate-ether');
    if (etherRate) {
      var er = snap.ether && snap.ether.rate ? snap.ether.rate : 0;
      etherRate.textContent = er > 0 ? '+' + fmtR(er) + '/s' : '';
    }

    if (this.els.rateDr) this.els.rateDr.textContent = fmtR(snap.drachmes.rate);
    if (this.els.rateBo) this.els.rateBo.textContent = fmtR(snap.bois.rate);
    if (this.els.rateNo) this.els.rateNo.textContent = fmtR(snap.nourr.rate);
    if (this.els.rateFe) this.els.rateFe.textContent = fmtR(snap.fer.rate);

    if (this.els.survivors) this.els.survivors.textContent = snap.survivants;
    if (this.els.maxSurv)   this.els.maxSurv.textContent   = snap.maxSurvivants;

    const score = this.prestige ? this.prestige.getLiveScore() : this.grid.computeRenaissanceScore();
    if (this.els.score) this.els.score.textContent = MathUtils.formatNumber(score);

    // Bonheur
    const happiness = this.rm.happinessScore || 50;
    const happEl = document.getElementById('happiness-bar-fill');
    const happVal = document.getElementById('happiness-value');
    if (happEl) happEl.style.width = happiness + '%';
    if (happVal) happVal.textContent = Math.round(happiness) + '%';
    const happIcon = document.getElementById('happiness-icon');
    if (happIcon) {
      happIcon.textContent = happiness >= 75 ? '😊' : happiness >= 40 ? '😐' : '😟';
    }

    // Nouvelles ressources Era 2/3 — afficher seulement si > 0 ou rate > 0
    const newRes = ['nectar','bronze','acier','farine','foudre','orichalque','metal_divin','amrita','ambroisie'];
    newRes.forEach(function(k) {
      const r = snap[k];
      if (!r) return;
      const row = document.getElementById('res-' + k);
      if (row) {
        const visible = r.value > 0 || r.rate !== 0;
        row.style.display = visible ? '' : 'none';
        const valEl = document.getElementById('val-' + k);
        if (valEl) valEl.textContent = MathUtils.formatNumber(r.value);
        const rateEl = document.getElementById('rate-' + k);
        if (rateEl) rateEl.textContent = r.rate !== 0 ? MathUtils.formatRate(r.rate) : '';
      }
    });
  }

  _showVictoryModal() {
    var prev = document.getElementById('victory-modal');
    if (prev) return;
    var modal = document.createElement('div');
    modal.id  = 'victory-modal';
    modal.innerHTML =
      '<div class="vm-content">' +
        '<div class="vm-icon">⚡</div>' +
        '<div class="vm-title">Âge de l\'Olympe !</div>' +
        '<div class="vm-sub">Zeus a été vaincu. L\'Olympe est à vous.</div>' +
        '<div class="vm-details">Tous les multiplicateurs sont désormais ×2 permanents.<br>Continuez à jouer ou recommencez pour battre votre score.</div>' +
        '<button class="vm-close" onclick="document.getElementById(\'victory-modal\').remove()">🏆 Continuer</button>' +
      '</div>';
    document.body.appendChild(modal);
    // Confettis dorés
    EventBus.emit('zone:fireworks', { color: '#ffd54f' });
  }

  updateEraBadge(era) {
    const badge = document.getElementById('era-badge');
    if (!badge) return;
    // Animation flash quand on débloque une nouvelle ère (pas au chargement initial)
    if (this._eraInitialized) {
      badge.classList.remove('era-unlock-flash');
      void badge.offsetWidth; // reflow
      badge.classList.add('era-unlock-flash');
      // Flash plein écran
      var sf = document.getElementById('era-screen-flash');
      if (sf) {
        sf.className = 'flash-' + era;
        void sf.offsetWidth;
        sf.classList.add('active');
        sf.addEventListener('animationend', function(){ sf.classList.remove('active'); }, {once:true});
      }
    }
    this._eraInitialized = true;
    const labels = ['', '🏛️ Antiquité', '🏺 Âge Classique', '🌟 Âge Divin'];
    const colors = ['', '#c8a840', '#7bc8ff', '#d4a0ff'];
    badge.textContent = labels[era] || '🏛️ Antiquité';
    badge.style.color = colors[era] || '#c8a840';
    badge.style.borderColor = (colors[era] || '#c8a840').replace(')', ',0.4)').replace('rgb','rgba');
    badge.style.display = '';
  }

  _setVal(key, val, fmt) {
    const el = this.els[key];
    if (!el) return;
    const prev      = this._prevValues[key] ?? 0;
    const formatted = fmt(val);
    if (formatted !== el.textContent) {
      el.textContent = formatted;
      if (val > prev) {
        el.classList.remove('resource-bump');
        void el.offsetWidth;
        el.classList.add('resource-bump');
      }
    }
    this._prevValues[key] = val;
  }

  tickIncrement() {
    this._tickCount++;
    if (this.els.tickCount) this.els.tickCount.textContent = this._tickCount;
  }

  setInfo(text) {
    if (this.els.info) this.els.info.textContent = text;
  }

  // ── Tooltip case ─────────────────────────────────────────
  showCellTooltip(cell, screenX, screenY) {
    // Tooltip supprime - le drawer bas gere l'affichage au clic
    // On met juste a jour la barre d'info en bas
    if (!cell) return;
    var name = cell.isHidden
      ? (cell.isSpecial ? '✦ Ruines detectees' : (cell.type === CELL_TYPE.MUD ? '🟫 Vase marecageuse' : '??? Brouillard'))
      : cell.displayName;
    var extra = cell.building && typeof BUILDINGS !== 'undefined' && BUILDINGS[cell.building]
      ? ' — ' + BUILDINGS[cell.building].name + ' Niv.' + cell.buildingLevel
      : '';
    this.setInfo(name + extra + ' (' + cell.q + ',' + cell.r + ')');
  }

  hideCellTooltip() { /* tooltip supprime */ }

  // ── Texte flottant ───────────────────────────────────────
  spawnFloatingText(text, x, y, color = '#f0c040') {
    const el = document.createElement('div');
    el.className   = 'floating-text';
    el.textContent = text;
    el.style.left  = x + 'px';
    el.style.top   = y + 'px';
    el.style.color = color;
    document.getElementById('map-container').appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // ── Événements ──────────────────────────────────────────
  _bindEvents() {
    EventBus.on('resources:updated', snap => this.update(snap));
    EventBus.on('happiness:updated', ({ score }) => {
      const happEl = document.getElementById('happiness-bar-fill');
      const happVal = document.getElementById('happiness-value');
      const happIcon = document.getElementById('happiness-icon');
      if (happEl) happEl.style.width = score + '%';
      if (happVal) happVal.textContent = Math.round(score) + '%';
      if (happIcon) happIcon.textContent = score >= 75 ? '😊' : score >= 40 ? '😐' : '😟';
    });
    EventBus.on('road:placed',   () => this._refreshScore());
    EventBus.on('road:removed',  () => this._refreshScore());
    EventBus.on('building:built',      () => this._refreshScore());
    EventBus.on('building:demolished', () => this._refreshScore());
    EventBus.on('building:upgraded',   () => this._refreshScore());
    EventBus.on('cell:revealed',       () => this._refreshScore());
    EventBus.on('base:upgraded',       () => this._refreshScore());
    EventBus.on('codex:pages_gained',  () => { this._refreshScore(); this._refreshCodexBadge(); });
    EventBus.on('codex:level_up',      () => { this._refreshScore(); this._refreshCodexBadge(); });
    EventBus.on('codex:upgraded',      () => { this._refreshCodexBadge(); });
    EventBus.on('prestige:complete',   () => { this._refreshScore(); this._refreshCodexBadge(); });
    EventBus.on('zone:unlocked',       () => { this._refreshScore(); this._refreshCurseBar(); });
    EventBus.on('zone:key_crafted',    () => { this._refreshScore(); });
    EventBus.on('zone:ritual_done',    () => { this._refreshScore(); });
    EventBus.on('zone:border_cleared', () => { this._refreshScore(); });
    EventBus.on('game:victory',        () => { this._showVictoryModal(); });

    EventBus.on('population:updated', ({ total, workers, available }) => {
      const wEl  = document.getElementById('pop-workers');
      const tEl  = document.getElementById('pop-total');
      const bar  = document.getElementById('pop-bar');
      const alert= document.getElementById('pop-alert');
      if (wEl) wEl.textContent = workers;
      if (tEl) tEl.textContent = total;
      if (bar && total > 0) {
        const pct = Math.min(100, Math.round(workers / total * 100));
        bar.style.width = pct + '%';
        bar.style.background = pct >= 100 ? '#e05050' : pct >= 80 ? '#f0c040' : '#60c860';
      }
      if (alert) {
        const full = total > 0 && available === 0;
        alert.style.display = full ? '' : 'none';
      }
      // Mettre à jour classe pop-full sur le nouvel item HUD
      const popItem = document.getElementById('res-pop');
      if (popItem) popItem.classList.toggle('pop-full', total > 0 && available === 0);
    });

    EventBus.on('cell:hover', ({ cell, screenX, screenY }) => {
      if (cell) this.showCellTooltip(cell, screenX, screenY);
      else      this.hideCellTooltip();
    });

    // Cacher la tooltip dès qu'on clique
    EventBus.on('cell:click', ({ cell }) => {
      this.hideCellTooltip();
      if (!cell) return;
      if (cell.isHidden) {
        this.setInfo(`⛏️ Fouille — ${cell.isSpecial ? '✦ Ruines Antiques' : 'Zone inconnue'} (${cell.q},${cell.r})`);
      } else if (cell.building) {
        const def = BUILDINGS[cell.building];
        this.setInfo(`${def?.glyph || '🏗'} ${def?.name || cell.building} — Niveau ${cell.buildingLevel}`);
      } else {
        this.setInfo(`Case sélectionnée : ${cell.displayName} (${cell.q}, ${cell.r})`);
      }
    });

    // Feedback visuel (textes flottants)
    EventBus.on('ui:feedback', ({ text, x, y, color }) => {
      this.spawnFloatingText(text, x, y - 40, color);
    });

    EventBus.on('cell:revealed', ({ cell }) => {
      this.setInfo(`✦ Case révélée : ${cell.displayName} !`);
    });

    EventBus.on('building:built', ({ cell }) => {
      const def = BUILDINGS[cell.building];
      this.setInfo(`🏗️ ${def?.name} construit en (${cell.q},${cell.r})`);
    });

    EventBus.on('building:upgraded', ({ cell }) => {
      const def = BUILDINGS[cell.building];
      this.setInfo(`⬆ ${def?.name} amélioré — Niveau ${cell.buildingLevel}`);
    });

    EventBus.on('building:demolished', ({ cell }) => {
      this.setInfo(`🔨 Bâtiment démoli en (${cell.q},${cell.r})`);
    });

    // Reconnexion silencieuse Google → mettre à jour le profil burger/sheet
    EventBus.on('google:reconnected', () => {
      this._updateBurgerProfile();
      this._updateMobSheet();
      this.setInfo('🔗 Compte Google reconnecté automatiquement.');
    });
  }

  _bindButtons() {
    // ── Burger : dropdown PC ou bottom-sheet selon taille ──
    var burgerBtn  = document.getElementById('burger-btn');
    var burgerMenu = document.getElementById('burger-menu');
    const overlay   = document.getElementById('mob-menu-overlay');
    const sheet     = document.getElementById('mob-menu-sheet');
    const openSheet  = () => { overlay?.classList.add('open'); sheet?.classList.add('open'); this._updateMobSheet(); };
    const closeSheet = () => { overlay?.classList.remove('open'); sheet?.classList.remove('open'); };

    if (burgerBtn) {
      burgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Mobile (≤600px) → bottom sheet ; PC → dropdown
        if (window.innerWidth <= 600) {
          openSheet();
        } else {
          burgerMenu?.classList.toggle('open');
        }
      });
    }

    // Ferme dropdown si clic ailleurs
    document.addEventListener('click', () => { burgerMenu?.classList.remove('open'); });

    // Items dropdown PC
    document.getElementById('burger-save')?.addEventListener('click', () => {
      EventBus.emit('save:request'); burgerMenu?.classList.remove('open');
    });
    document.getElementById('burger-help')?.addEventListener('click', () => {
      EventBus.emit('help:open'); burgerMenu?.classList.remove('open');
    });
    document.getElementById('burger-reset')?.addEventListener('click', () => {
      burgerMenu?.classList.remove('open'); EventBus.emit('save:reset');
    });
    document.getElementById('burger-signout-google')?.addEventListener('click', () => {
      burgerMenu?.classList.remove('open');
      if (typeof GoogleDriveSync !== 'undefined' && GoogleDriveSync.isSignedIn()) {
        GoogleDriveSync.signOut();
        this._updateBurgerProfile();
        this.setInfo('🔓 Déconnecté de Google.');
      }
    });
    this._updateBurgerProfile();

    // Bottom sheet
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(); });
    document.getElementById('mob-sheet-save')?.addEventListener('click', () => {
      EventBus.emit('save:request'); closeSheet(); this.setInfo('💾 Partie sauvegardée !');
    });
    document.getElementById('mob-sheet-help')?.addEventListener('click', () => {
      EventBus.emit('help:open'); closeSheet();
    });
    document.getElementById('mob-sheet-reset')?.addEventListener('click', () => {
      closeSheet(); EventBus.emit('save:reset');
    });
    document.getElementById('mob-sheet-signout')?.addEventListener('click', () => {
      closeSheet();
      if (typeof GoogleDriveSync !== 'undefined' && GoogleDriveSync.isSignedIn()) {
        GoogleDriveSync.signOut(); this.setInfo('🔓 Déconnecté de Google.');
      }
    });

    // ── Bouton Talents (unique, dans la barre basse) ──────
    document.getElementById('btn-talents-hud')?.addEventListener('click', () => {
      const realBtn = document.getElementById('btn-talents');
      if (realBtn) realBtn.click();
      else EventBus.emit('talents:toggle');
    });

    // ── Bouton Encyclopédie (unique, dans la barre basse) ─
    document.getElementById('btn-help')?.addEventListener('click', () => {
      EventBus.emit('help:open');
    });

    // ── Zoom ─────────────────────────────────────────────
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => EventBus.emit('zoom:in'));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => EventBus.emit('zoom:out'));
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => EventBus.emit('zoom:reset'));
  }

  _updateMobSheet() {
    const isConnected = typeof GoogleDriveSync !== 'undefined' && GoogleDriveSync.isSignedIn();
    const profileWrap = document.getElementById('mob-sheet-profile-wrap');
    const signoutBtn  = document.getElementById('mob-sheet-signout');
    const signoutDiv  = document.getElementById('mob-sheet-div-signout');
    if (isConnected) {
      const name  = localStorage.getItem('gds_user_name')  || '';
      const email = localStorage.getItem('gds_user_email') || '';
      const pic   = localStorage.getItem('gds_user_pic')   || '';
      const n = document.getElementById('mob-sheet-name');
      const em = document.getElementById('mob-sheet-email');
      const p = document.getElementById('mob-sheet-pic');
      if (n) n.textContent = name;
      if (em) em.textContent = email;
      if (p && pic) p.src = pic;
      if (profileWrap) profileWrap.style.display = '';
      if (signoutBtn)  signoutBtn.style.display  = '';
      if (signoutDiv)  signoutDiv.style.display  = '';
    } else {
      if (profileWrap) profileWrap.style.display = 'none';
      if (signoutBtn)  signoutBtn.style.display  = 'none';
      if (signoutDiv)  signoutDiv.style.display  = 'none';
    }
  }

  _updateBurgerProfile() {
    const profile = document.getElementById('burger-google-profile');
    if (!profile) return;

    const isConnected = typeof GoogleDriveSync !== 'undefined' && GoogleDriveSync.isSignedIn();
    profile.style.display = isConnected ? 'block' : 'none';

    if (isConnected) {
      const name  = localStorage.getItem('gds_user_name')  || 'Joueur';
      const email = localStorage.getItem('gds_user_email') || '';
      const pic   = localStorage.getItem('gds_user_pic')   || '';

      const nameEl  = document.getElementById('burger-user-name');
      const emailEl = document.getElementById('burger-user-email');
      const picEl   = document.getElementById('burger-user-pic');

      if (nameEl)  nameEl.textContent = name;
      if (emailEl) emailEl.textContent = email;
      if (picEl && pic) {
        picEl.src = pic;
        picEl.style.display = 'block';
      } else if (picEl) {
        picEl.style.display = 'none';
      }
    }
  }
}
