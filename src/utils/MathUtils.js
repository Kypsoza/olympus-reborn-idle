/* ═══════════════════════════════════════════════════════════
   MathUtils.js — Utilitaires mathématiques généraux
════════════════════════════════════════════════════════════ */

const MathUtils = (() => {

  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function formatNumber(n) {
    if (n === undefined || n === null) return '0';
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }

  function formatRate(n) {
    const prefix = n >= 0 ? '+' : '';
    return prefix + formatNumber(n) + '/s';
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Graine déterministe pour génération procédurale
  function seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  return { clamp, lerp, formatNumber, formatRate, randomInt, randomChoice, seededRandom };
})();


/* ═══════════════════════════════════════════════════════════
   Compression.js — Encode/Decode sauvegarde Base64
════════════════════════════════════════════════════════════ */

const Compression = (() => {

  function encode(obj) {
    try {
      const json = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(json)));
    } catch(e) {
      console.error('[Compression] Erreur encode:', e);
      return null;
    }
  }

  function decode(str) {
    try {
      const json = decodeURIComponent(escape(atob(str)));
      return JSON.parse(json);
    } catch(e) {
      console.error('[Compression] Erreur decode:', e);
      return null;
    }
  }

  return { encode, decode };
})();
