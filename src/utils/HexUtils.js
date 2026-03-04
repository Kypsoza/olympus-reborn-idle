/* ═══════════════════════════════════════════════════════════
   HexUtils.js — Calculs mathématiques hexagonaux
   Système "flat-top" (sommet en haut) avec coordonnées axiales
════════════════════════════════════════════════════════════ */

const HexUtils = (() => {

  // ── Conversion coordonnées axiales → pixel (flat-top) ──
  // q = colonne axiale, r = rangée axiale, size = rayon hex
  function hexToPixel(q, r, size) {
    const x = size * (3 / 2) * q;
    const y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    return { x, y };
  }

  // ── Conversion pixel → coordonnées axiales ──────────────
  function pixelToHex(x, y, size) {
    const q = (2 / 3 * x) / size;
    const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
    return hexRound(q, r);
  }

  // ── Arrondi hexagonal ───────────────────────────────────
  function hexRound(q, r) {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);
    const dq = Math.abs(rq - q);
    const dr = Math.abs(rr - r);
    const ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds)        rr = -rq - rs;
    return { q: rq, r: rr };
  }

  // ── Voisins d'un hexagone ───────────────────────────────
  const DIRECTIONS = [
    { q:  1, r:  0 }, { q:  1, r: -1 }, { q:  0, r: -1 },
    { q: -1, r:  0 }, { q: -1, r:  1 }, { q:  0, r:  1 }
  ];

  function getNeighbors(q, r) {
    return DIRECTIONS.map(d => ({ q: q + d.q, r: r + d.r }));
  }

  // ── Distance entre deux hex ─────────────────────────────
  function hexDistance(q1, r1, q2, r2) {
    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
  }

  // ── Clé string unique pour un hex ──────────────────────
  function hexKey(q, r) { return `${q},${r}`; }

  // ── Coins du polygone hexagonal (flat-top) ──────────────
  function hexCorners(cx, cy, size) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i);
      corners.push({
        x: cx + size * Math.cos(angle),
        y: cy + size * Math.sin(angle)
      });
    }
    return corners;
  }

  // ── Anneau de distance n autour d'une case ──────────────
  function hexRing(centerQ, centerR, radius) {
    if (radius === 0) return [{ q: centerQ, r: centerR }];
    const results = [];
    let q = centerQ + DIRECTIONS[4].q * radius;
    let r = centerR + DIRECTIONS[4].r * radius;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        results.push({ q, r });
        q += DIRECTIONS[i].q;
        r += DIRECTIONS[i].r;
      }
    }
    return results;
  }

  return { hexToPixel, pixelToHex, hexRound, getNeighbors, hexDistance, hexKey, hexCorners, hexRing, DIRECTIONS };
})();
