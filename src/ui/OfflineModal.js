/* ═══════════════════════════════════════════════════════════
   OfflineModal.js — Modale de progression hors-ligne v41
════════════════════════════════════════════════════════════ */

class OfflineModal {
  constructor() {
    this._build();
  }

  _build() {
    var el = document.createElement('div');
    el.id = 'offline-overlay';
    el.innerHTML =
      '<div id="offline-modal">' +
        '<div id="offline-header">' +
          '<span id="offline-moon">🌙</span>' +
          '<div>' +
            '<div id="offline-title">Vous étiez absent</div>' +
            '<div id="offline-duration"></div>' +
          '</div>' +
        '</div>' +
        '<div id="offline-subtitle">Vos bâtiments ont travaillé à 50% de leur capacité</div>' +
        '<div id="offline-gains"></div>' +
        '<button id="offline-close">Reprendre la partie ⚡</button>' +
      '</div>';
    document.body.appendChild(el);
    this.overlay = el;

    document.getElementById('offline-close').addEventListener('click', () => this.hide());
    el.addEventListener('click', (e) => { if (e.target === el) this.hide(); });
  }

  show(seconds, gains) {
    var duration = this._formatDuration(seconds);
    document.getElementById('offline-duration').textContent = duration;

    var labels = {
      drachmes: '🪙 Drachmes', bois: '🪵 Bois', nourr: '🌾 Ambroisie',
      fer: '⚙️ Fer Céleste', farine: '🌾 Farine', nectar: '🍯 Nectar',
      bronze: '🟫 Bronze', acier: '🔩 Acier', foudre: '⚡ Foudre',
      orichalque: '🌟 Orichalque', metal_divin: '⚗️ Métal Divin',
      amrita: '💎 Amrita', ether: '✨ Éther',
    };

    var html = '';
    var hasGains = false;
    Object.entries(gains).forEach(function(entry) {
      var key = entry[0], val = entry[1];
      if (val <= 0) return;
      hasGains = true;
      var label = labels[key] || key;
      var display = val >= 1e6 ? (val/1e6).toFixed(1)+'M'
                  : val >= 1e3 ? (val/1e3).toFixed(1)+'k'
                  : Math.floor(val).toString();
      html += '<div class="offline-gain-row">' +
        '<span class="offline-gain-label">' + label + '</span>' +
        '<span class="offline-gain-value">+' + display + '</span>' +
      '</div>';
    });

    if (!hasGains) {
      html = '<div class="offline-no-gains">Aucune ressource produite (bâtiments non connectés ?)</div>';
    }

    document.getElementById('offline-gains').innerHTML = html;
    this.overlay.classList.add('open');

    // Animation entrée
    var modal = document.getElementById('offline-modal');
    modal.style.animation = 'none';
    void modal.offsetWidth;
    modal.style.animation = '';
  }

  hide() {
    this.overlay.classList.remove('open');
  }

  _formatDuration(seconds) {
    if (seconds < 60) return Math.round(seconds) + ' secondes';
    var mins = Math.floor(seconds / 60);
    if (mins < 60) return mins + ' minute' + (mins > 1 ? 's' : '');
    var hours = Math.floor(mins / 60);
    var rem   = mins % 60;
    return hours + 'h' + (rem > 0 ? rem + 'min' : '');
  }
}
