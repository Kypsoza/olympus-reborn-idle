/* ═══════════════════════════════════════════════════════════
   HelpPanel.js — Encyclopédie complète v39
════════════════════════════════════════════════════════════ */

class HelpPanel {
  constructor() {
    this._build();
    this._bindEvents();
  }

  _build() {
    var overlay = document.createElement('div');
    overlay.id = 'help-overlay';
    overlay.innerHTML =
      '<div id="help-panel">' +
        '<div id="help-header">' +
          '<span style="font-size:20px">📖</span>' +
          '<h2>Olympus Reborn — Encyclopédie</h2>' +
          '<button id="help-close">✕</button>' +
        '</div>' +
        '<div id="help-tabs">' +
          '<button class="help-tab active" data-tab="start">🌍 Démarrage</button>' +
          '<button class="help-tab" data-tab="resources">💎 Ressources</button>' +
          '<button class="help-tab" data-tab="buildings1">🏛️ Bâtiments I</button>' +
          '<button class="help-tab" data-tab="buildings2">🏺 Bâtiments II</button>' +
          '<button class="help-tab" data-tab="buildings3">🌟 Bâtiments III</button>' +
          '<button class="help-tab" data-tab="terrain">🗺 Terrains</button>' +
          '<button class="help-tab" data-tab="roads">🛤 Routes</button>' +
          '<button class="help-tab" data-tab="eras">✨ Ères & Éther</button>' +
          '<button class="help-tab" data-tab="prestige">🔮 Prestige</button>' +
          '<button class="help-tab" data-tab="talents">🧠 Talents</button>' +
          '<button class="help-tab" data-tab="tests">🧪 Tests</button>' +
        '</div>' +
        '<div id="help-body"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this._renderTab('start');
  }

  _bindEvents() {
    var self = this;
    document.getElementById('help-close').addEventListener('click', function() { self.hide(); });
    document.getElementById('help-overlay').addEventListener('click', function(e) {
      if (e.target === self.overlay) self.hide();
    });
    document.getElementById('help-tabs').querySelectorAll('.help-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.help-tab').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        self._renderTab(btn.dataset.tab);
      });
    });
    document.getElementById('btn-help').addEventListener('click', function() { self.toggle(); });
    EventBus.on('help:open', function() { self.show(); });
  }

  show()   { this.overlay.classList.add('open'); }
  hide()   { this.overlay.classList.remove('open'); }
  toggle() { this.overlay.classList.contains('open') ? this.hide() : this.show(); }

  _renderTab(tab) {
    var body = document.getElementById('help-body');
    var map = {
      start:      this._tabStart(),
      resources:  this._tabResources(),
      buildings1: this._tabBuildings1(),
      buildings2: this._tabBuildings2(),
      buildings3: this._tabBuildings3(),
      terrain:    this._tabTerrain(),
      roads:      this._tabRoads(),
      eras:       this._tabEras(),
      prestige:   this._tabPrestige(),
      talents:    this._tabTalents(),
      tests:      this._tabTests(),
    };
    body.innerHTML = map[tab] || '';
  }

  _bcard(glyph, name, era, cost, prod, desc, extra) {
    var eraColor = era === 1 ? '#c8a840' : era === 2 ? '#60a8ff' : '#c080f0';
    var eraLabel = era === 1 ? '🏛️ Ère 1' : era === 2 ? '🏺 Ère 2' : '🌟 Ère 3';
    return '<div class="hp-bcard">' +
      '<div class="hp-bcard-head">' +
        '<span class="hp-bcard-glyph">' + glyph + '</span>' +
        '<div class="hp-bcard-info">' +
          '<span class="hp-bcard-name">' + name + '</span>' +
          '<span class="hp-bcard-era" style="color:' + eraColor + '">' + eraLabel + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="hp-bcard-desc">' + desc + '</div>' +
      '<div class="hp-bcard-row"><span class="hp-label">💰 Coût</span><span>' + cost + '</span></div>' +
      '<div class="hp-bcard-row"><span class="hp-label">⚡ Produit</span><span>' + prod + '</span></div>' +
      (extra ? '<div class="hp-bcard-extra">' + extra + '</div>' : '') +
    '</div>';
  }

  _tabStart() {
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">⚡ Bienvenue dans Olympus Reborn</div>' +
        '<p class="hp-p">Le monde a été détruit. Votre mission : reconstruire la civilisation à travers <strong>3 Ères historiques</strong>, jusqu\'à accomplir la <span class="hp-em">Renaissance</span> — le Prestige ultime.</p>' +
        '<p class="hp-p">La progression est <strong>permanente entre les Prestiges</strong> grâce à l\'Éther ✨, une ressource divine qui débloque de nouvelles Ères et des bonus permanents.</p>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">🎮 Contrôles</div>' +
        '<div class="hp-grid">' +
          '<div class="hp-card"><div class="hp-glyph">🖱</div><div class="hp-card-title">Navigation</div><div class="hp-card-body">Clic-glisser pour déplacer. Molette pour zoomer. ⌂ pour recentrer.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">👆</div><div class="hp-card-title">Sélection</div><div class="hp-card-body">Clic sur case révélée → panneau latéral (PC) ou bas (mobile). Reclic = ferme.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">⛏</div><div class="hp-card-title">Fouille</div><div class="hp-card-body">Clic sur case cachée = 1 fouille (5🪙). Barre HP visible sur la case.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">💾</div><div class="hp-card-title">Sauvegarde</div><div class="hp-card-body">Auto toutes les 30s. Bouton 💾 dans le HUD ou menu burger.</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">📋 Ordre de jeu recommandé</div>' +
        '<p class="hp-p"><span class="hp-ok">①</span> Révélez les cases autour de la base (anneaux 1-3).</p>' +
        '<p class="hp-p"><span class="hp-ok">②</span> Construisez une <strong>Ferme Antique</strong> sur une PLAINE — elle remplit auto. 4 champs adjacents.</p>' +
        '<p class="hp-p"><span class="hp-ok">③</span> Posez une <strong>Route</strong> adjacente pour activer la production (sans route = 0 production).</p>' +
        '<p class="hp-p"><span class="hp-ok">④</span> Ajoutez un <strong>Camp de Bûcherons</strong> (forêt) et une <strong>Mine de Cuivre</strong> (montagne).</p>' +
        '<p class="hp-p"><span class="hp-ok">⑤</span> Investissez dans les <strong>Talents</strong> 🧠 pour amplifier la production.</p>' +
        '<p class="hp-p"><span class="hp-ok">⑥</span> Améliorez 3 <strong>Ruines Antiques</strong> au Niv.5 → activez l\'<strong>Autel</strong> → <strong>Prestige</strong>.</p>' +
        '<p class="hp-p"><span class="hp-ok">⑦</span> Avec l\'Éther obtenu, déverrouillez l\'<strong>Âge Classique</strong> (100✨) pour accéder aux bâtiments Ère 2.</p>' +
      '</div>'
    );
  }

  _tabResources() {
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">🏛️ Ressources Ère 1</div>' +
        '<table class="hp-table">' +
          '<tr><th>Icône</th><th>Nom</th><th>Source</th><th>Usage</th></tr>' +
          '<tr><td>🪙</td><td><strong>Drachmes</strong></td><td>Mine de Cuivre, production passive</td><td>Fouille (5/clic), routes, bâtiments, talents</td></tr>' +
          '<tr><td>🪵</td><td><strong>Bois de Styx</strong></td><td>Camp de Bûcherons</td><td>Construction, routes, améliorations</td></tr>' +
          '<tr><td>🌾</td><td><strong>Ambroisie</strong></td><td>Ferme Antique, Moulin</td><td>Maisons, alambic, améliorations avancées</td></tr>' +
          '<tr><td>⚙️</td><td><strong>Fer Céleste</strong></td><td>Mine de Fer, Fonderie Céleste</td><td>Bâtiments haut niveau</td></tr>' +
          '<tr><td>👥</td><td><strong>Habitants</strong></td><td>Huttes des Pionniers, Maison Athénienne</td><td>Travailleurs pour mines et ateliers</td></tr>' +
          '<tr><td>🌾→</td><td><strong>Farine Sacrée</strong></td><td>Moulin à Grain (consomme Ambroisie)</td><td>Maisons Athéniennes</td></tr>' +
          '<tr><td>✨</td><td><strong>Éther</strong></td><td>Uniquement au Prestige</td><td>Arbre Éther — permanent</td></tr>' +
        '</table>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">🏺 Ressources Ère 2 — Âge Classique (100✨)</div>' +
        '<table class="hp-table">' +
          '<tr><th>Icône</th><th>Nom</th><th>Source</th><th>Usage</th></tr>' +
          '<tr><td>🍯</td><td><strong>Nectar</strong></td><td>Verger d\'Apollon</td><td>Alambic de Dionysos</td></tr>' +
          '<tr><td>🟫</td><td><strong>Bronze</strong></td><td>Atelier du Forgeron</td><td>Fonderie, Forteresse, Agora</td></tr>' +
          '<tr><td>🔩</td><td><strong>Acier</strong></td><td>Fonderie Céleste</td><td>Bâtiments Ère 3</td></tr>' +
        '</table>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">🌟 Ressources Ère 3 — Âge Divin (10 000✨)</div>' +
        '<table class="hp-table">' +
          '<tr><th>Icône</th><th>Nom</th><th>Source</th><th>Usage</th></tr>' +
          '<tr><td>⚡</td><td><strong>Foudre</strong></td><td>Pylône d\'Hermès, Stèle de Zeus</td><td>Bâtiments Ère 3, Palais des Titans</td></tr>' +
          '<tr><td>🌟</td><td><strong>Orichalque</strong></td><td>Forge Divine</td><td>Autel de Fusion, Nœud Olympien</td></tr>' +
          '<tr><td>⚗️</td><td><strong>Métal Divin</strong></td><td>Autel de Fusion</td><td>Forges ultimes, Sénat</td></tr>' +
          '<tr><td>💎</td><td><strong>Amrita</strong></td><td>Autel de Fusion</td><td>Ressource finale — valeur prestige</td></tr>' +
        '</table>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">💡 Notes importantes</div>' +
        '<p class="hp-p"><span class="hp-ok">✓</span> Les ressources Ère 2/3 sont <strong>masquées</strong> dans le HUD jusqu\'à apparition (valeur > 0).</p>' +
        '<p class="hp-p"><span class="hp-ok">✓</span> L\'<strong>Éther</strong> est toujours visible, même à 0. Ne se reset jamais.</p>' +
        '<p class="hp-p"><span class="hp-warn">⚠</span> Certains bâtiments <strong>consomment</strong> des ressources — vérifiez le tooltip avant de construire !</p>' +
      '</div>'
    );
  }

  _tabBuildings1() {
    var b = this._bcard.bind(this);
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">🏛️ Ère 1 — Antiquité (9 bâtiments)</div>' +
        '<p class="hp-p">Tous nécessitent une <strong>route adjacente</strong> (ou être adjacent à la Base) pour produire. Sans connexion = 0 production.</p>' +
        '<div class="hp-bcards">' +
          b('🌾', 'Ferme Antique', 1, '50🪙 + 20🪵', 'Ambroisie × champs adjacents', 'Produit de l\'Ambroisie. Jusqu\'à 4 PLAINES voisines sont converties en champs auto. 1 case réservée pour la route.') +
          b('🪓', 'Camp de Bûcherons', 1, '60🪙', 'Bois × forêts adjacentes', 'Exploite les forêts voisines. Jusqu\'à 4 FORÊTS deviennent des bosquets automatiquement.') +
          b('⛏️', 'Mine de Cuivre', 1, '80🪙 + 40🪵', '+5🪙/s — 3 travailleurs', 'Production fixe de Drachmes. Nécessite des habitants disponibles.') +
          b('⚙️', 'Mine de Fer Céleste', 1, '150🪙 + 60🪵', '+1⚙️/s — 4 travailleurs', 'Production fixe de Fer Céleste. Indispensable pour les bâtiments avancés.') +
          b('🗼', 'Tour de Guet', 1, '100🪙 + 50🪵', 'Fouille auto (5🪙/clic)', 'Révèle les cases cachées autour d\'elle automatiquement. Zone bleue à la sélection.') +
          b('🛖', 'Huttes des Pionniers', 1, '120🪙 + 80🪵', '+2 Habitants', 'Fournit des travailleurs pour les mines. Nécessite route.') +
          b('🔥', 'Sanctuaire d\'Hestia', 1, '200🪙 + 100🪵', 'Aura fouille -20% (rayon 2)', 'Réduit le coût de fouille des cases voisines. 1 travailleur.') +
          b('🟠', 'Moulin à Grain', 1, '180🪙 + 120🪵', '+0.5 Farine/s — consomme 1🌾/s', 'Transforme l\'Ambroisie en Farine Sacrée. Nécessaire pour les Maisons Athéniennes. 2 travailleurs.') +
          b('⚡', 'Pylône d\'Hermès', 1, '300🪙 + 150🪵 + 30⚙️', '+2⚡ Foudre/s', 'Génère de la Foudre dans un rayon 3. Essentiel pour les bâtiments Ère 2+. 1 travailleur.') +
        '</div>' +
      '</div>'
    );
  }

  _tabBuildings2() {
    var b = this._bcard.bind(this);
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">🏺 Ère 2 — Âge Classique (9 bâtiments)</div>' +
        '<p class="hp-p">Verrouillés jusqu\'au déverrouillage de l\'Âge Classique (100✨ dans l\'arbre Éther). Bien plus puissants que les bâtiments Ère 1.</p>' +
        '<div class="hp-bcards">' +
          b('🍇', 'Verger d\'Apollon', 2, '500🪙 + 200🪵 + 50🍯', 'Ambroisie ×3 + 0.5🍯 Nectar/s', 'Ferme améliorée. Supporte 6 champs adjacents. Produit aussi du Nectar passif.') +
          b('🌲', 'Halle des Sylvains', 2, '600🪙 + 400🪵 + 30🟫', 'Bois ×3 — 6 forêts max', 'Camp amélioré. Niv.20+ : auto-plante des forêts sur les plaines libres adjacentes.') +
          b('🔨', 'Atelier du Forgeron', 2, '800🪙 + 300🪵 + 100⚙️', '+20🪙/s + 0.5🟫 Bronze/s', 'Mine de Cuivre améliorée ×4. Produit aussi du Bronze. 3 travailleurs.') +
          b('🏭', 'Fonderie Céleste', 2, '1 200🪙 + 500🪵 + 200⚙️ + 50🟫', '+3⚙️/s + 0.3🔩 Acier/s', 'Mine de Fer améliorée ×3. Produit aussi de l\'Acier. 4 travailleurs.') +
          b('🏛️', 'Maison Athénienne', 2, '400🪙 + 250🪵 + 20 Farine', '+10 Habitants — consomme 0.5🌾/s', 'Logements avancés. Bonus +20% habitants si 2 maisons adjacentes.') +
          b('🫗', 'Alambic de Dionysos', 2, '600🪙 + 200🪵 + 100🍯', '+5🌾/s — consomme 1🍯/s', 'Distille le Nectar en Ambroisie (rendement ×5). 2 travailleurs.') +
          b('🏟️', 'Agora', 2, '1 000🪙 + 400🪵 + 80🟫', 'Aura Drachmes ×1.5 (rayon 2)', 'Multiplie les Drachmes des bâtiments voisins. Nécessite 3 bâtiments adjacents + route. 2 travailleurs.') +
          b('🏺', 'Temple d\'Hermès', 2, '800🪙 + 300🪵 + 60🟫', 'Scouts ×2 (rayon 3)', 'Double la vitesse des Tours de Guet proches. 1 travailleur.') +
          b('🏰', 'Forteresse', 2, '1 200🪙 + 600🪵 + 150🟫', 'Protection anti-Corruption (rayon 3)', 'Protège les cases voisines. UNIQUE par carte. 3 travailleurs.') +
        '</div>' +
        '<div class="hp-section">' +
          '<div class="hp-h3">⚡🗿 Stèle de Zeus (Ère 2)</div>' +
          '<p class="hp-p">Coût : 500🪙 + 200🪵 + 50⚙️. Complète le réseau du Pylône et amplifie la production de Foudre ×1.5 pour le Pylône adjacent.</p>' +
        '</div>' +
      '</div>'
    );
  }

  _tabBuildings3() {
    var b = this._bcard.bind(this);
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">🌟 Ère 3 — Âge Divin (8 bâtiments)</div>' +
        '<p class="hp-p">Les bâtiments les plus puissants du jeu. Nécessitent Acier, Orichalque et Foudre. Certains sont <strong>UNIQUES</strong> (1 seul par carte).</p>' +
        '<div class="hp-bcards">' +
          b('🌺', 'Jardins Élyséens', 3, '1 500🪙 + 600🪵 + 200🍯', 'Ambroisie ×5 + Nectar', 'Ferme divine. Supporte 6 champs. Production ×5 vs Ferme Antique.') +
          b('🌳', 'Bosquet Éternel', 3, '1 800🪙 + 800🪵 + 100🔩', 'Bois ×5 — auto-plantation', 'Camp divin. Auto-plante dans rayon 2 toutes les 30s. Avec Relique Graine : forêts indestructibles.') +
          b('💎', 'Trésor d\'Héphaïstos', 3, '2 000🪙 + 500🪵 + 200🟫', 'Drachmes ×6 + Orichalque', 'Mine divine. Produit massivement des Drachmes et de l\'Orichalque. 3 travailleurs.') +
          b('🔥🔨', 'Forge Divine', 3, '2 500🪙 + 800🪵 + 300🔩', 'Orichalque + Métal Divin', 'Forge ultime. Produit les ressources rares pour l\'Autel de Fusion. 4 travailleurs.') +
          b('🏛★', 'Palais des Titans', 3, '3 000🪙 + 1 000🪵 + 500⚙️', 'Éther passif +0.001/s × niveau', 'Génère de l\'Éther lentement et passivement. Consomme Ambroisie + Foudre.') +
          b('🏛❤️', 'Sénat', 3, '5 000🪙 + 2 000🪵 + 500🔩', 'UNIQUE — ×2 toute la production', 'Double la production globale. <strong>UNIQUE par carte.</strong> Nécessite 100 Habitants présents.') +
          b('⚡✴️', 'Nœud Olympien', 3, '3 500🪙 + 1 500🪵 + 300⚡', 'Réseau Foudre ×3', 'Amplifie tout le réseau de Foudre. Consomme de l\'Orichalque.') +
          b('✨🔥', 'Autel de Fusion', 3, '4 000🪙 + 1 000🪵 + 200🔩', 'Métal Divin + Amrita', 'Transforme Acier + Orichalque → Métal Divin + Amrita. Ressources de fin de jeu.') +
        '</div>' +
        '<div class="hp-section">' +
          '<div class="hp-h3">🔮 Omphalos (Ère 3 — UNIQUE)</div>' +
          '<p class="hp-p">Bâtiment spécial : <strong>double l\'Éther obtenu au Prestige</strong>. Nécessite la Relique "Pierre Omphalos" dans l\'arbre Éther.</p>' +
        '</div>' +
      '</div>'
    );
  }

  _tabTerrain() {
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">🗺 Types de terrain</div>' +
        '<div class="hp-grid">' +
          '<div class="hp-card"><div class="hp-glyph">🌿</div><div class="hp-card-title">Plaine</div><div class="hp-card-body">Terrain de base. Accueille Fermes, Routes, Maisons. Devient Champ auto. près d\'une Ferme.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🌲</div><div class="hp-card-title">Forêt</div><div class="hp-card-body">Camp de Bûcherons. Devient Bosquet auto. Peut être reboisée ou rasée.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">⛰️</div><div class="hp-card-title">Montagne</div><div class="hp-card-body">Mines de Cuivre et de Fer. 180-280 HP. Abondante en zone périphérique.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">💧</div><div class="hp-card-title">Rivière</div><div class="hp-card-body">60-100 HP. Drainage : Rivière→Vase (60🪙) puis Vase→Plaine (120🪙+60🪵).</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🌾</div><div class="hp-card-title">Champ Cultivé</div><div class="hp-card-body">Auto-créé par Ferme/Verger/Jardins. +20% prod. par champ (max 4 ou 6).</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🌳</div><div class="hp-card-title">Bosquet Cultivé</div><div class="hp-card-body">Auto-créé par Camp/Halle/Bosquet Éternel. +20% prod. par bosquet.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🟫</div><div class="hp-card-title">Vase Marécageuse</div><div class="hp-card-body">État intermédiaire d\'une Rivière drainée. Aucune construction possible.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🏛️</div><div class="hp-card-title">Ruines Antiques</div><div class="hp-card-body">400-600 HP. Améliorable Niv.1→5. Bonus prod. global cumulé. Requis pour le Prestige.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🔮</div><div class="hp-card-title">Autel de Renaissance</div><div class="hp-card-body">1500-2500 HP. Active le Prestige. Halo violet pulsant visible dans le brouillard.</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">🔄 Transformations</div>' +
        '<table class="hp-table">' +
          '<tr><th>Depuis</th><th>Vers</th><th>Coût</th></tr>' +
          '<tr><td>PLAINE</td><td>FORÊT</td><td>80🪙 + 30🪵</td></tr>' +
          '<tr><td>FORÊT</td><td>PLAINE</td><td>40🪙</td></tr>' +
          '<tr><td>RIVIÈRE</td><td>VASE</td><td>60🪙</td></tr>' +
          '<tr><td>VASE</td><td>PLAINE</td><td>120🪙 + 60🪵</td></tr>' +
        '</table>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">📡 Zones de la carte (rayon 45)</div>' +
        '<table class="hp-table">' +
          '<tr><th>Anneaux</th><th>Ambiance</th><th>Composition</th></tr>' +
          '<tr><td>0–2</td><td>Zone de départ</td><td>100% Plaine</td></tr>' +
          '<tr><td>2–5</td><td>Facile</td><td>40% Plaine, 40% Forêt, 20% Montagne</td></tr>' +
          '<tr><td>5–15</td><td>Transition</td><td>30% Plaine, 30% Forêt, 22% Montagne, 8% Rivière</td></tr>' +
          '<tr><td>15–40</td><td>Intermédiaire</td><td>22% Plaine, 26% Forêt, 28% Montagne, 24% Rivière</td></tr>' +
          '<tr><td>40–45</td><td>Hostile</td><td>8% Plaine, 30% Forêt, 47% Montagne, 15% Rivière</td></tr>' +
        '</table>' +
      '</div>'
    );
  }

  _tabRoads() {
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">🛤 Système de Routes</div>' +
        '<p class="hp-p">Un bâtiment <strong>non connecté produit 0 ressource</strong>. La route est la condition de base de toute production.</p>' +
        '<div class="hp-grid">' +
          '<div class="hp-card"><div class="hp-glyph">🛤️</div><div class="hp-card-title">Construire</div><div class="hp-card-body">30🪙 + 10🪵. PLAINE uniquement. L\'icône route remplace l\'icône terrain.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🔨</div><div class="hp-card-title">Démolir</div><div class="hp-card-body">10🪙. Déconnecte les bâtiments au-delà. Impossible si bâtiment dessus.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">✅</div><div class="hp-card-title">Connexion</div><div class="hp-card-body">Route adjacente OU adjacent à la Base Principale.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🔴</div><div class="hp-card-title">Déconnecté</div><div class="hp-card-body">Affiché dans le menu bâtiment. Production = 0.</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">📊 Score de Renaissance</div>' +
        '<table class="hp-table">' +
          '<tr><th>Élément</th><th>Points</th></tr>' +
          '<tr><td>Case PLAINE révélée</td><td>+10</td></tr>' +
          '<tr><td>Case FORÊT révélée</td><td>+15</td></tr>' +
          '<tr><td>Case MONTAGNE révélée</td><td>+20</td></tr>' +
          '<tr><td>Route posée</td><td>+25</td></tr>' +
          '<tr><td>Bâtiment connecté</td><td>+100 à +300 × niveau</td></tr>' +
        '</table>' +
        '<p class="hp-p">Formule Éther : <span class="hp-em">√(Score) × 15 × multiplicateurs</span> (Constellations, Reliques).</p>' +
      '</div>'
    );
  }

  _tabEras() {
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">✨ L\'Éther — Monnaie Permanente</div>' +
        '<p class="hp-p">Obtenu <strong>uniquement en faisant le Prestige</strong>. Ne se perd jamais. Toujours visible dans le HUD (grisé si 0).</p>' +
        '<p class="hp-p">Dépensez-le dans l\'onglet <strong>✨ Éther</strong> du panneau Talents (bouton 🧠).</p>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">🏛️ Les 3 Ères</div>' +
        '<table class="hp-table">' +
          '<tr><th>Ère</th><th>Nom</th><th>Coût Éther</th><th>Débloque</th></tr>' +
          '<tr><td style="color:#c8a840">🏛️ Ère 1</td><td>Antiquité</td><td>— (départ)</td><td>9 bâtiments de base</td></tr>' +
          '<tr><td style="color:#60a8ff">🏺 Ère 2</td><td>Âge Classique</td><td><strong>100 ✨</strong></td><td>+9 bâtiments + Nectar, Bronze, Acier</td></tr>' +
          '<tr><td style="color:#c080f0">🌟 Ère 3</td><td>Âge Divin</td><td><strong>10 000 ✨</strong></td><td>+8 bâtiments divins + Foudre, Orichalque, Métal Divin, Amrita</td></tr>' +
        '</table>' +
        '<p class="hp-p">Le badge d\'ère est toujours affiché dans le HUD. Un <strong>flash lumineux coloré</strong> anime la carte lors du déverrouillage.</p>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">🌿 Arbre Éther — 3 Branches Permanentes</div>' +
        '<div class="hp-grid">' +
          '<div class="hp-card"><div class="hp-glyph">🏛️</div><div class="hp-card-title" style="color:#c0a060">Ères (2 nœuds)</div><div class="hp-card-body">Âge Classique (100✨) → Âge Divin (10 000✨). Débloque tous les bâtiments et ressources de l\'ère.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🫙</div><div class="hp-card-title" style="color:#9c6fce">Reliques (6 nœuds)</div><div class="hp-card-body"><strong>Amphore</strong> +20% Ambroisie/Nectar · <strong>Enclume</strong> mines sans route · <strong>Carte</strong> 7 cases révélées au départ · <strong>Graine</strong> forêts indestructibles · <strong>Éclair</strong> 30 fouilles gratuites · <strong>Omphalos</strong> +50% Éther au prestige</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">⭐</div><div class="hp-card-title" style="color:#4fc3f7">Constellations (5 nœuds)</div><div class="hp-card-body"><strong>Forge</strong> +10% prod · <strong>Pionnier</strong> fouille -10% · <strong>Peuple</strong> habitants +25% · <strong>Éternité</strong> Éther +25% · <strong>Olympienne</strong> +25% prod (Ère 3)</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">🔒 Bâtiments verrouillés</div>' +
        '<p class="hp-p">Les tuiles d\'une Ère non débloquée affichent <strong>🔒 Âge Classique — 100 ✨</strong> (fond violet sombre). Priorisez l\'Ère 2 dès que possible !</p>' +
      '</div>'
    );
  }

  _tabPrestige() {
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">🔮 Le Prestige — La Renaissance</div>' +
        '<p class="hp-p">Réinitialise le monde, vous récompense d\'<strong>Éther</strong>. Cœur de la progression long terme.</p>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">📋 Conditions d\'activation</div>' +
        '<div class="hp-grid">' +
          '<div class="hp-card"><div class="hp-glyph">🗺</div><div class="hp-card-title">50 cases révélées</div><div class="hp-card-body">Explorez en fouillant autour de votre base.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">🏛️</div><div class="hp-card-title">3 Ruines Niv.5</div><div class="hp-card-body">Trouvez 3 Ruines (anneaux ≥7) et améliorez-les 4 fois.</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">🏛️ Coûts d\'amélioration des Ruines</div>' +
        '<table class="hp-table">' +
          '<tr><th>Niveau</th><th>Coût</th><th>Bonus production global</th></tr>' +
          '<tr><td>1 → 2</td><td>500🪙 + 200🪵</td><td>+5%</td></tr>' +
          '<tr><td>2 → 3</td><td>1 200🪙 + 500🪵 + 50⚙️</td><td>+12%</td></tr>' +
          '<tr><td>3 → 4</td><td>2 500🪙 + 1 000🪵 + 150⚙️</td><td>+22%</td></tr>' +
          '<tr><td>4 → 5</td><td>5 000🪙 + 2 000🪵 + 400⚙️ + 200🌾</td><td>+35%</td></tr>' +
        '</table>' +
        '<p class="hp-p"><span class="hp-tip">💡</span> 3 Ruines Niv.5 cumulées = <strong>+105% production globale</strong> !</p>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">📈 Formule Éther obtenu</div>' +
        '<p class="hp-p"><span class="hp-em">Éther = √(Score) × 15 × multiplicateur</span></p>' +
        '<p class="hp-p">Exemple : Score 10 000 → √10000 × 15 = <strong>1 500 Éther</strong> (sans bonus).</p>' +
        '<p class="hp-p">Multiplicateurs : Constellations Éternité (+25%), Relique Omphalos (+50%), Omphalos construit (×2).</p>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">👻 Ce que vous conservez</div>' +
        '<p class="hp-p"><span class="hp-ok">✓</span> Tout l\'<strong>Éther</strong> accumulé.</p>' +
        '<p class="hp-p"><span class="hp-ok">✓</span> Tous les <strong>nœuds de l\'arbre Éther</strong> (Ères, Reliques, Constellations).</p>' +
        '<p class="hp-p"><span class="hp-ok">✓</span> Les <strong>spectres d\'héritage</strong> 👻 — fantômes des Ruines Niv.≥2 qui indiquent leur emplacement au cycle suivant.</p>' +
        '<p class="hp-p"><span class="hp-warn">✗</span> Ressources, bâtiments, routes, talents Drachmes — tout est remis à zéro.</p>' +
      '</div>'
    );
  }

  _tabTalents() {
    return (
      '<div class="hp-section">' +
        '<div class="hp-h2">🧠 Talents Drachmes — In-Run (perdus au Prestige)</div>' +
        '<p class="hp-p">Coût : Drachmes + ressources. Réinitialisés à chaque Prestige. 7 branches.</p>' +
        '<table class="hp-table">' +
          '<tr><th>Branche</th><th>Effets</th></tr>' +
          '<tr><td>🌾 Agriculture</td><td>Niv. max Ferme/Verger +15/+25/+40 · Production +30%/+60%/+120%</td></tr>' +
          '<tr><td>🌲 Sylviculture</td><td>Niv. max Camp/Halle +15/+25/+40 · Production +30%/+60%/+120%</td></tr>' +
          '<tr><td>⛏️ Métallurgie</td><td>Niv. max Mines Cuivre +15/+25/+40 · Production +30%/+60%/+120%</td></tr>' +
          '<tr><td>⚙️ Sidérurgie</td><td>Niv. max Mines Fer +15/+25/+40 · Production +30%/+60%/+120%</td></tr>' +
          '<tr><td>🏠 Population</td><td>Capacité habitants +50%/+100%/+200% · Prod. par habitant +0.5%/+1%/+2%</td></tr>' +
          '<tr><td>🏛️ Ingénierie</td><td>Niv. max tous +8 → fouille -25% → prod. tous +15% → niv. max +15</td></tr>' +
          '<tr><td>⚡ Énergie</td><td>Portée Pylônes +1 → Foudre +50% → Foudre +100%</td></tr>' +
        '</table>' +
      '</div>' +
      '<div class="hp-section">' +
        '<div class="hp-h2">✨ Talents Éther — Permanents (jamais perdus)</div>' +
        '<p class="hp-p">Coût : Éther. Accessibles via onglet ✨ du panneau Talents. Acquis définitivement.</p>' +
        '<table class="hp-table">' +
          '<tr><th>Branche</th><th>Nœuds</th><th>Coût Éther</th></tr>' +
          '<tr><td>🏛️ Ères</td><td>Âge Classique · Âge Divin</td><td>100 → 10 000</td></tr>' +
          '<tr><td>🫙 Reliques</td><td>Amphore · Enclume · Carte · Graine · Éclair · Omphalos</td><td>40 à 500</td></tr>' +
          '<tr><td>⭐ Constellations</td><td>Forge · Pionnier · Peuple · Éternité · Olympienne</td><td>1 500 à 25 000</td></tr>' +
        '</table>' +
        '<p class="hp-p"><span class="hp-tip">💡</span> Priorité conseillée : Âge Classique (100✨) → Carte des Titans (60✨) → Relique Éclair (75✨) → Constellations.</p>' +
      '</div>'
    );
  }

  _tabTests() {
    var tests = [
      { id:'P6.1', phase:'Phase 6 — UI Éther', desc:'Arbre Éther onglet ✨', expected:'Bouton 🧠 Talents → onglet ✨ Éther. 3 branches : Ères, Reliques, Constellations. Nœuds acquis marqués ✓ Permanent.' },
      { id:'P6.2', phase:'Phase 6 — UI Éther', desc:'Badge d\'ère HUD au lancement', expected:'Badge 🏛️ Antiquité visible en haut droit dès le lancement (sans flash).' },
      { id:'P6.3', phase:'Phase 6 — UI Éther', desc:'Éther toujours visible', expected:'HUD montre ✨ 0 en grisé dès le départ. Notation k/M si > 1 000.' },
      { id:'P6.4', phase:'Phase 6 — UI Éther', desc:'Tuiles Ère 2 verrouillées', expected:'Panel construction : tuiles Ère 2 montrent 🔒 Âge Classique — 100 ✨ (fond violet sombre).' },
      { id:'P6.5', phase:'Phase 6 — UI Éther', desc:'Débloquer Ère 2', expected:'100✨ → onglet Éther → Âge Classique → Acquérir. Flash bleu plein écran. Badge HUD → 🏺 Âge Classique. Tuiles Ère 2 disponibles.' },
      { id:'P6.6', phase:'Phase 6 — UI Éther', desc:'Flash Ère 3', expected:'10 000✨ → Âge Divin → flash violet plein écran. Badge HUD → 🌟 Âge Divin.' },
      { id:'P5.1', phase:'Phase 5 — 27 Bâtiments', desc:'Construire Mine Cuivre', expected:'Montagne → Mine de Cuivre. Nécessite habitants (travailleurs). Production Drachmes démarre si route.' },
      { id:'P5.2', phase:'Phase 5 — 27 Bâtiments', desc:'Construire Pylône', expected:'Plaine → Pylône d\'Hermès. Produit Foudre dans rayon 3. Badge Ère 1 visible sur la tuile.' },
      { id:'P4.1', phase:'Phase 4 — Prestige', desc:'Améliorer Ruine 1→2', expected:'500🪙+200🪵 débités. Badge +5% production apparaît.' },
      { id:'P4.2', phase:'Phase 4 — Prestige', desc:'Prestige complet', expected:'3 Ruines Niv.5 + 50 cases → Autel interactif → Fouille → Renaissance → Éther calculé = √(Score)×15.' },
      { id:'P3.1', phase:'Phase 3 — Base', desc:'Route + bâtiment connecté', expected:'Ferme sans route = 0 prod. Avec route adjacente = production démarre (badge ✅).' },
      { id:'P2.1', phase:'Phase 2 — Base', desc:'Ferme + champs auto', expected:'Construire Ferme sur PLAINE → jusqu\'à 4 PLAINES adjacentes → CHAMPS. 1 case réservée route.' },
    ];

    var phases = ['Phase 6 — UI Éther','Phase 5 — 27 Bâtiments','Phase 4 — Prestige','Phase 3 — Base','Phase 2 — Base'];
    var colors = { 'Phase 6 — UI Éther':'#c080f0','Phase 5 — 27 Bâtiments':'#80c8ff','Phase 4 — Prestige':'#c090ff','Phase 3 — Base':'#f0c040','Phase 2 — Base':'#80e080' };
    var html = '';
    phases.forEach(function(phase) {
      var phaseTests = tests.filter(function(t) { return t.phase === phase; });
      if (!phaseTests.length) return;
      html += '<div class="hp-section"><div class="hp-h2" style="color:' + (colors[phase]||'#fff') + '">' + phase + '</div><div class="hp-tests">';
      phaseTests.forEach(function(t) {
        html += '<div class="hp-test"><div class="hp-test-id">' + t.id + '</div>' +
          '<div class="hp-test-desc">' + t.desc + '<div class="hp-test-expected">→ ' + t.expected + '</div></div></div>';
      });
      html += '</div></div>';
    });

    html += '<div class="hp-section"><div class="hp-h2">💡 Debug</div>' +
      '<p class="hp-p"><span class="hp-tip">🔄</span> Nouvelle partie : <code style="color:#80e080;background:rgba(0,0,0,.3);padding:1px 5px;border-radius:3px">localStorage.clear(); location.reload()</code></p>' +
      '<p class="hp-p"><span class="hp-tip">✨</span> Ressources de test : 999 999🪙 au départ (mode test actif).</p>' +
    '</div>';

    return html;
  }
}
