/* ═══════════════════════════════════════════════════════════
   SaveManager.js — Sauvegarde localStorage + export/import
════════════════════════════════════════════════════════════ */

const SaveManager = (() => {
  const SAVE_KEY = 'olympus_reborn_save';
  const VERSION  = '0.7.1'; // Phase 7 — Offline Progress

  function save(gameState) {
    try {
      const data = { version: VERSION, timestamp: Date.now(), ...gameState };
      const encoded = Compression.encode(data);
      if (encoded) {
        localStorage.setItem(SAVE_KEY, encoded);
        console.log('[SaveManager] Partie sauvegardée.');
        return true;
      }
    } catch(e) {
      console.error('[SaveManager] Erreur de sauvegarde:', e);
    }
    return false;
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = Compression.decode(raw);
      if (!data) return null;

      // Si la version ne correspond pas → invalider la sauvegarde
      if (data.version !== VERSION) {
        console.warn(`[SaveManager] Version obsolète (${data.version} → ${VERSION}). Nouvelle partie générée.`);
        localStorage.removeItem(SAVE_KEY);
        return null;
      }

      console.log(`[SaveManager] Partie chargée (v${data.version}, ${new Date(data.timestamp).toLocaleString()})`);
      return data;
    } catch(e) {
      console.error('[SaveManager] Erreur de chargement:', e);
    }
    return null;
  }

  function clear() {
    localStorage.removeItem(SAVE_KEY);
    console.log('[SaveManager] Sauvegarde supprimée.');
  }

  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  return { save, load, clear, hasSave, VERSION };
})();
