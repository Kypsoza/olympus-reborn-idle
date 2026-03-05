/* ═══════════════════════════════════════════════════════════
   buildings.css — Panneau de construction (Phase 2)
════════════════════════════════════════════════════════════ */

/* ── Panneau principal ──────────────────────────────────── */
.building-panel {
  position: absolute;
  width: 260px;
  max-height: calc(100% - 90px);
  overflow-y: auto;
  background: linear-gradient(160deg, rgba(14,11,30,0.98) 0%, rgba(22,17,42,0.98) 100%);
  border: 1px solid var(--col-border-gold);
  border-radius: var(--radius);
  box-shadow:
    0 16px 48px rgba(0,0,0,0.7),
    0 0 0 1px rgba(200,149,26,0.06) inset;
  z-index: 150;
  animation: slideInDown 0.18s ease;
}

.building-panel::-webkit-scrollbar { width: 4px; }
.building-panel::-webkit-scrollbar-thumb { background: var(--col-border-gold); border-radius: 2px; }

/* ── Header ─────────────────────────────────────────────── */
.bp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 8px;
  border-bottom: 1px solid var(--col-border);
}
.bp-title {
  font-family: var(--font-ui);
  font-size: 18px;
  font-weight: 600;
  color: var(--col-gold-light);
  letter-spacing: 0.05em;
}
.bp-close {
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  font-size: 18px;
  color: var(--col-text-dim);
  background: rgba(255,255,255,0.05);
  transition: all 0.15s;
  cursor: pointer;
  border: 1px solid transparent;
}
.bp-close:hover { color: #fff; background: rgba(255,80,80,0.2); border-color: rgba(255,80,80,0.4); }

/* ── Body ───────────────────────────────────────────────── */
.bp-body { padding: 10px 14px 14px; }

/* ── Info générale ──────────────────────────────────────── */
.bp-info { margin-bottom: 10px; }
.bp-label {
  font-family: var(--font-ui);
  font-size: 18px;
  color: var(--col-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: block;
  margin-bottom: 4px;
}
.bp-special {
  display: block;
  font-family: var(--font-body);
  font-size: 19px;
  font-style: italic;
  color: var(--col-gold);
  margin-top: 4px;
}
.bp-terrain {
  font-family: var(--font-body);
  font-size: 18px;
  color: var(--col-text-dim);
  margin-bottom: 10px;
  line-height: 1.6;
}
.bp-terrain strong { color: var(--col-text); }
.bp-warning {
  font-family: var(--font-body);
  font-size: 19px;
  color: #e07050;
  margin: 6px 0;
  padding: 5px 8px;
  background: rgba(224,80,50,0.1);
  border-radius: var(--radius-sm);
  border-left: 2px solid #e07050;
}

/* ── Barre de progression ───────────────────────────────── */
.bp-bar-label {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-ui);
  font-size: 19px;
  color: var(--col-text-dim);
  margin-bottom: 4px;
}
.bp-bar-track {
  height: 6px;
  background: rgba(255,255,255,0.07);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--col-border);
  margin-bottom: 10px;
}
.bp-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.dig-bar   { background: linear-gradient(90deg, #c87020, #f0a040); box-shadow: 0 0 8px rgba(200,112,32,0.4); }
.level-bar { background: linear-gradient(90deg, #2060c0, #60a0f0); box-shadow: 0 0 8px rgba(96,160,240,0.3); }
.bp-level-track { margin-bottom: 10px; }

/* ── Coût fouille ───────────────────────────────────────── */
.bp-cost {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: 19px;
  color: var(--col-text-dim);
  margin-bottom: 10px;
}
.bp-cost-val { color: var(--col-drachmes); font-weight: 600; }

/* ── Section ────────────────────────────────────────────── */
.bp-section-title {
  font-family: var(--font-ui);
  font-size: 19px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--col-text-dim);
  margin: 8px 0 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--col-border);
}

/* ── Liste de bâtiments ─────────────────────────────────── */
.bp-build-list { display: flex; flex-direction: column; gap: 8px; }
.bp-build-item {
  padding: 8px 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--col-border);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s;
}
.bp-build-item:hover { border-color: var(--col-border-gold); }
.bp-build-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.bp-build-glyph { font-size: 21px; }
.bp-build-name {
  font-family: var(--font-ui);
  font-size: 19px;
  color: var(--col-text);
  font-weight: 600;
}
.bp-build-desc {
  font-family: var(--font-body);
  font-size: 18px;
  color: var(--col-text-dim);
  font-style: italic;
  margin-bottom: 4px;
}
.bp-build-prod {
  font-family: var(--font-body);
  font-size: 18px;
  color: var(--col-nourr);
  margin-bottom: 3px;
}
.bp-build-cost {
  font-family: var(--font-body);
  font-size: 18px;
  color: var(--col-text-dim);
  margin-bottom: 6px;
}
.bp-empty {
  font-family: var(--font-body);
  font-size: 19px;
  font-style: italic;
  color: var(--col-text-dim);
  padding: 8px 0;
}

/* ── Bâtiment existant ──────────────────────────────────── */
.bp-building-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.bp-building-glyph { font-size: 31px; }
.bp-building-name {
  font-family: var(--font-ui);
  font-size: 18px;
  color: var(--col-text);
  font-weight: 600;
}
.bp-building-level {
  font-family: var(--font-body);
  font-size: 18px;
  color: var(--col-text-dim);
}

/* ── Production ─────────────────────────────────────────── */
.bp-production {
  margin-bottom: 10px;
  padding: 6px 0;
  border-top: 1px solid var(--col-border);
  border-bottom: 1px solid var(--col-border);
}
.bp-prod-row {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: 19px;
  color: var(--col-text-dim);
  padding: 2px 0;
}
.bp-prod-val { color: var(--col-gold-light); font-weight: 600; }

/* ── Boutons ─────────────────────────────────────────────── */
.bp-actions { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.bp-btn {
  width: 100%;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  font-family: var(--font-ui);
  font-size: 18px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.18s;
  border: 1px solid var(--col-border);
  background: rgba(255,255,255,0.04);
  color: var(--col-text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}
.bp-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.08);
  border-color: var(--col-border-gold);
  color: var(--col-text);
  transform: translateY(-1px);
}
.bp-btn:active:not(:disabled) { transform: translateY(0); }
.bp-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.bp-btn-primary {
  background: linear-gradient(135deg, rgba(200,112,20,0.25), rgba(240,160,40,0.15));
  border-color: var(--col-gold-dim);
  color: var(--col-gold-light);
}
.bp-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(200,112,20,0.4), rgba(240,160,40,0.3));
  box-shadow: 0 0 12px rgba(200,149,26,0.3);
}

.bp-btn-build {
  background: linear-gradient(135deg, rgba(40,120,40,0.2), rgba(60,160,60,0.1));
  border-color: rgba(80,160,80,0.4);
  color: #80d080;
  font-size: 19px;
}
.bp-btn-build:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(40,120,40,0.35), rgba(60,160,60,0.25));
  box-shadow: 0 0 10px rgba(80,160,80,0.25);
}

.bp-btn-upgrade {
  background: linear-gradient(135deg, rgba(40,80,160,0.2), rgba(60,120,220,0.1));
  border-color: rgba(80,120,220,0.4);
  color: #80a0f0;
  flex-direction: column;
}
.bp-btn-upgrade:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(40,80,160,0.35), rgba(60,120,220,0.25));
  box-shadow: 0 0 10px rgba(80,120,220,0.25);
}
.bp-upgrade-cost { font-size: 14px; color: var(--col-text-dim); text-transform: none; }

.bp-btn-demolish {
  border-color: rgba(180,60,40,0.3);
  color: rgba(220,100,80,0.7);
}
.bp-btn-demolish:hover:not(:disabled) {
  background: rgba(180,60,40,0.12);
  border-color: rgba(220,100,80,0.5);
  color: #e08070;
}

/* ── Responsive mobile ──────────────────────────────────── */
@media (max-width: 600px) {
  .building-panel {
    width: calc(100vw - 20px);
    left: 10px !important;
    right: 10px;
    max-height: 50vh;
  }
}

/* ── Bouton verrouillé (ressources insuffisantes) ─────── */
.bp-btn-locked {
  opacity: 0.7;
  cursor: not-allowed;
  background: rgba(255,255,255,0.03) !important;
  border-color: rgba(255,255,255,0.1) !important;
  color: var(--col-text-dim) !important;
}
.bp-btn-locked:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* ── Coût upgrade inline ────────────────────────────────── */
.bp-upgrade-cost-row {
  font-size: 18px;
  margin-top: 4px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}


/* ═══════════════════════════════════════════════════════════
   PANEL TALENTS — Overlay plein écran style Albion
═══════════════════════════════════════════════════════════ */

/* Overlay sombre derrière la modale */
.talent-panel {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Cinzel, serif;
}
.talent-panel.hidden { display: none; }

/* Fenêtre modale centrée */
.talent-panel > * {
  /* children layout handled by tp-modal wrapper below */
}
.talent-panel::after { display: none; }

/* Le vrai conteneur modal est tp-modal, créé dans JS */
#tp-modal {
  position: relative;
  width: min(900px, 96vw);
  height: min(640px, 92vh);
  background: rgba(6, 3, 18, 0.98);
  border: 1px solid rgba(180, 140, 60, 0.35);
  border-radius: 14px;
  box-shadow: 0 8px 60px rgba(0,0,0,0.9), 0 0 40px rgba(100,40,200,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modal-in 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

.tp-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px 10px;
  border-bottom: 1px solid rgba(180,140,60,0.25);
  background: rgba(10,6,24,0.9);
  flex-shrink: 0;
}
.tp-title {
  font-size: 18px;
  font-weight: 700;
  color: #d4c080;
  letter-spacing: 2px;
  flex-shrink: 0;
}
.tp-tab-bar {
  display: flex;
  gap: 8px;
  flex: 1;
}
.tp-tab-btn {
  padding: 6px 18px;
  font-family: Cinzel, serif;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid rgba(180,140,60,0.3);
  background: rgba(180,140,60,0.06);
  color: rgba(212,192,128,0.5);
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.tp-tab-btn.tp-tab-active {
  background: rgba(180,140,60,0.18);
  border-color: rgba(220,180,80,0.6);
  color: #e8d090;
}
.tp-close {
  background: none;
  border: 1px solid rgba(200,80,80,0.4);
  color: rgba(200,100,100,0.8);
  width: 32px; height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.2s;
}
.tp-close:hover { background: rgba(200,80,80,0.15); color: #e08080; }

#tp-era-bar {
  flex-shrink: 0;
  padding: 6px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(8,4,20,0.8);
}
.tp-era-status {
  display: flex;
  align-items: center;
  gap: 14px;
}
.tp-era-badge {
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 20px;
  border: 1px solid;
  letter-spacing: 1px;
  font-weight: 700;
}
.tp-ether-count {
  font-size: 14px;
  color: #c090ff;
  font-weight: 700;
}

.tp-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* tp-body scroll (override mobile rule) */

/* ── Styles nœuds Drachmes (utilisés par _renderDrachmeTree) ── */
.tp-acquired  { color: #80e080; font-size: 11px; }
.tp-req       { font-size: 10px; color: #e08080; margin-top: 2px; }

/* ── Adjacence (reste du jeu) ── */
.bp-adj-row {
  display: flex; align-items: center; gap: 8px; padding: 6px 0; margin: 4px 0;
  border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06);
}
.bp-adj-label  { font-size: 12px; color: #a09070; }
.bp-adj-cells  { display: flex; gap: 3px; align-items: center; font-size: 14px; }
.adj-filled    { color: #80d060; }
.adj-empty     { color: #404050; }
.bp-adj-preview {
  font-size: 12px; color: #80c080;
  background: rgba(80,200,80,0.06); border: 1px solid rgba(80,200,80,0.15);
  border-radius: 4px; padding: 3px 7px; margin-top: 3px;
}
.bp-talent-bonus {
  font-size: 11px; color: #d4a030;
  background: rgba(200,150,30,0.08); border: 1px solid rgba(200,150,30,0.2);
  border-radius: 4px; padding: 4px 8px; margin: 6px 0;
}

.bp-connected{font-size:14px;color:#80e080;background:rgba(80,200,80,.08);border:1px solid rgba(80,200,80,.25);border-radius:4px;padding:4px 8px;margin:4px 0;}
.bp-disconnected{font-size:14px;color:#e08080;background:rgba(200,80,80,.08);border:1px solid rgba(200,80,80,.25);border-radius:4px;padding:4px 8px;margin:4px 0;}
.tp-cols{display:flex;gap:8px;padding:8px;}
.tp-col{flex:1;display:flex;flex-direction:column;gap:6px;}
.tp-col-label{font-size:13px;color:#a09060;text-transform:uppercase;letter-spacing:1px;text-align:center;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.08);}

.bp-neighbor-actions{margin:4px 0;padding:4px 0;border-top:1px solid rgba(255,255,255,0.06);}
.bp-section-label{font-size:13px;color:#a09060;margin-bottom:4px;}
.bp-btn-action{width:100%;text-align:left;font-size:14px;padding:4px 8px;margin-bottom:3px;}
.bp-na-cost{font-size:13px;opacity:0.8;}
.bp-prod-inactive{font-size:14px;color:#a08060;font-style:italic;padding:4px 0;}
.bp-base-hint{font-size:14px;color:#a0a080;margin:4px 0;}

.bp-hint{font-size:14px;color:#80c080;background:rgba(60,160,60,0.08);border:1px solid rgba(60,160,60,0.2);border-radius:4px;padding:4px 8px;margin:4px 0;}

/* ═══════════════════════════════════════════════════════
   ONGLETS BATIMENTS (bp-tabs)
════════════════════════════════════════════════════════ */
.bp-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
  border-bottom: 1px solid rgba(200,149,26,0.2);
  flex-wrap: wrap;
  background: rgba(10,8,18,0.6);
}
.bp-tab {
  font-family: var(--font-ui);
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 8px 8px 0 0;
  border: 1px solid transparent;
  border-bottom: none;
  color: #7a6a40;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;
  letter-spacing: 0.3px;
}
.bp-tab:hover {
  color: #c8a840;
  background: rgba(200,149,26,0.08);
}
.bp-tab.bp-tab-active {
  color: #f0d060;
  background: rgba(200,149,26,0.15);
  border-color: rgba(200,149,26,0.35);
  border-bottom: 1px solid rgba(10,8,18,0.6);
  margin-bottom: -1px;
}
.bp-tab-content {
  padding: 10px 10px 4px;
  min-height: 60px;
}

/* ═══════════════════════════════════════════════════════
   BADGES D'ÈRE sur les cartes de construction
════════════════════════════════════════════════════════ */
.bp-era-badge {
  display: inline-block;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 4px;
  vertical-align: middle;
  font-family: var(--font-ui);
  letter-spacing: 0.5px;
}
.era-2 {
  background: rgba(100,180,255,0.15);
  color: #80c8ff;
  border: 1px solid rgba(100,180,255,0.3);
}
.era-3 {
  background: rgba(200,100,255,0.15);
  color: #d090ff;
  border: 1px solid rgba(200,100,255,0.3);
}

/* ═══════════════════════════════════════════════════════
   POLICES GLOBALES — rattrapage tailles mini
════════════════════════════════════════════════════════ */
.bp-card-glyph  { font-size: 34px !important; }
.bp-card-name   { font-size: 16px !important; }
.bp-card-desc   { font-size: 14px !important; }
.bp-card-cost   { font-size: 14px !important; }
.bp-card-action { font-size: 15px !important; }
.bp-bld-glyph   { font-size: 38px !important; }
.bp-bld-name    { font-size: 20px !important; }
.bp-bld-lvl     { font-size: 14px !important; }
.bp-prod-badge  { font-size: 15px !important; }
.bp-upgrade-btn { font-size: 16px !important; padding: 10px 14px !important; }
.resource-name  { font-size: 13px !important; }
.resource-value { font-size: 17px !important; }
.resource-rate  { font-size: 12px !important; }

/* ═══════════════════════════════════════════════════════════
   PHASE 6 — Talent Panel dual-tab (Drachmes / Éther)
════════════════════════════════════════════════════════════ */

/* Header avec barre d'onglets intégrée */
.tp-header {
  flex-wrap: wrap;
  gap: 6px;
}
.tp-tab-bar {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: flex-start;
}
.tp-tab-btn {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid rgba(180,140,60,0.3);
  color: #806840;
  background: transparent;
  cursor: pointer;
  transition: all .15s;
}
.tp-tab-btn:hover { color: #d4a040; background: rgba(180,140,60,0.1); }
.tp-tab-btn.tp-tab-active {
  background: rgba(180,140,60,0.2);
  border-color: rgba(180,140,60,0.6);
  color: #f0d060;
}
.tp-tab-btn:nth-child(2).tp-tab-active {
  background: rgba(160,80,255,0.15);
  border-color: rgba(180,120,255,0.5);
  color: #c090ff;
}

/* Barre d'ère active */
#tp-era-bar {
  padding: 6px 12px;
  border-bottom: 1px solid rgba(180,140,60,0.15);
  background: rgba(0,0,0,0.2);
}
.tp-era-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tp-era-badge {
  font-size: 12px;
  font-family: 'Cinzel', serif;
  padding: 2px 10px;
  border-radius: 12px;
  border: 1px solid;
  letter-spacing: 0.5px;
}
.tp-ether-count {
  font-size: 13px;
  color: #c090ff;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.5px;
}

/* Branche Éther — couleurs violettes */
.tp-ether-branch { border-color: rgba(160,80,255,0.25); }
.tp-ether-branch .tp-branch-title { background: rgba(160,80,255,0.08); border-color: rgba(160,80,255,0.2); }

.tp-ether-node { font-family: 'Cinzel', serif; }
.tp-ether-node.tp-learned  { background: rgba(160,80,255,0.1); border-color: rgba(160,80,255,0.35); }
.tp-ether-node.tp-available { background: rgba(140,60,240,0.07); border-color: rgba(160,80,255,0.3); }
.tp-ether-node.tp-locked   { opacity: 0.5; }

/* Étiquettes Ère */
.tp-era-active {
  display: inline-block;
  font-size: 12px;
  color: #80e080;
  background: rgba(80,200,80,0.1);
  border: 1px solid rgba(80,200,80,0.25);
  border-radius: 4px;
  padding: 2px 7px;
  margin: 3px 0;
}
.tp-era-locked {
  display: inline-block;
  font-size: 12px;
  color: #e09040;
  background: rgba(200,140,40,0.08);
  border: 1px solid rgba(200,140,40,0.2);
  border-radius: 4px;
  padding: 2px 7px;
  margin: 3px 0;
}

/* Bouton Éther */
.tp-ether-btn.tp-ok {
  background: rgba(160,80,255,0.18);
  border: 1px solid rgba(180,100,255,0.55);
  color: #d090ff;
  font-family: 'Cinzel', serif;
}
.tp-ether-btn.tp-ok:hover { background: rgba(160,80,255,0.32); }

/* Colonnes dans le panel talents */
.tp-cols { display: flex; gap: 0; flex-wrap: wrap; }
.tp-col  { flex: 1; min-width: 160px; padding: 8px; border-right: 1px solid rgba(255,255,255,0.04); }
.tp-col:last-child { border-right: none; }
.tp-col-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(200,180,100,0.5); margin-bottom: 6px; font-family: 'Cinzel', serif; }

/* ═══════════════════════════════════════════════════════════
   PHASE 6 — Aliases classes tp-icon/tp-info/tp-name/tp-desc/tp-cost
   + tp-btn.tp-ok / tp-btn.tp-locked (correspond au JS actuel)
   ═══════════════════════════════════════════════════════════ */
.tp-icon  { font-size: 26px; width: 36px; text-align: center; flex-shrink: 0; padding-top: 2px; line-height: 1; }
.tp-info  { flex: 1; min-width: 0; }
.tp-name  { font-size: 13px; font-weight: 700; color: #e0d090; margin-bottom: 2px; letter-spacing: 0.3px; }
.tp-desc  { font-size: 12px; color: #a09070; line-height: 1.4; }
.tp-cost  { font-size: 12px; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }

.tp-btn.tp-ok      { background: rgba(180,140,60,0.2); border: 1px solid rgba(180,140,60,0.6); color: #e0c060; }
.tp-btn.tp-ok:hover{ background: rgba(180,140,60,0.35); }
.tp-btn.tp-locked  { background: rgba(60,60,80,0.4); border: 1px solid rgba(100,100,120,0.3); color: #706870; cursor: not-allowed; font-size: 11px; }

/* Éther node amélioré */
.tp-ether-btn.tp-ok       { background: linear-gradient(135deg,rgba(140,60,240,0.22),rgba(100,40,200,0.18)); border: 1px solid rgba(180,100,255,0.55); color: #d090ff; }
.tp-ether-btn.tp-ok:hover { background: linear-gradient(135deg,rgba(160,80,255,0.35),rgba(120,60,220,0.3)); box-shadow: 0 0 10px rgba(160,80,255,0.25); }

/* Nœud Éther avec bordure brillante quand disponible */
.tp-ether-node.tp-available {
  background: rgba(140,60,240,0.07);
  border-color: rgba(160,80,255,0.35);
  box-shadow: inset 0 0 8px rgba(160,80,255,0.06);
}
.tp-ether-node.tp-learned {
  background: rgba(100,200,100,0.06);
  border-color: rgba(100,200,100,0.3);
  box-shadow: inset 0 0 8px rgba(100,200,100,0.04);
}

/* Éther count dans la barre d'ère - plus visible */
.tp-ether-count { font-size: 14px; color: #c090ff; font-family: 'Cinzel', serif; font-weight: 700; letter-spacing: 0.5px; }

/* Permanent badge */
.tp-acquired { color: #80e080; font-size: 12px; display: flex; align-items: center; gap: 3px; }

/* Req style */
.tp-req { font-size: 11px; color: #e08080; margin: 2px 0; }

/* tp-body scroll modal */
.tp-body { padding: 8px; overflow-y: auto; }
