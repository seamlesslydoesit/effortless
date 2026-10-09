// Turns a pattern's settings into a drawing (SVG), and saves it as a file.
import { FIT, currentShape } from './data.js';

const DENSITY = { Large: 4, Medium: 5, Small: 6 };
const r3 = (v) => Math.round(v * 1000) / 1000;

// One repeat block is k × k motifs. `tiles` is how many blocks fit across (1 or 3).
export function cellsFor(cfg, tiles) {
  const sh = currentShape(cfg);
  const secOn = cfg.sec[sh.name] || {};
  const k = DENSITY[cfg.density] || 4;
  const N = tiles * k;
  const u = 100 / N;
  const cols = cfg.pal.map((c) => '#' + c);
  const n = cols.length;
  const fit = FIT[sh.name] || [40, 20, 20];
  const sc = (cfg.size / 100) * (1 - cfg.spacing / 200) * (40 / fit[0]);
  const hsh = (a, b, s) => {
    const x = Math.sin(a * 12.9898 + b * 78.233 + s * 37.719) * 43758.5453;
    return x - Math.floor(x);
  };
  const parts = sh.sec.filter((x) => secOn[x.name]).slice(0, 2);
  const cells = [];
  for (let r = -1; r <= N; r++) {
    for (let c = -1; c <= N; c++) {
      const tc = ((c % k) + k) % k;
      const tr = ((r % k) + k) % k;
      let x = (c + 0.5) * u;
      let y = (r + 0.5) * u;
      let rot = cfg.rot;
      let fx = 1;
      let fy = 1;
      const oddC = ((c % 2) + 2) % 2 === 1;
      const oddR = ((r % 2) + 2) % 2 === 1;
      if (cfg.layout === 'Half-drop' && oddC) y += u / 2;
      if (cfg.layout === 'Brick' && oddR) x += u / 2;
      if (cfg.layout === 'Mirrored') {
        if (oddC) fx = -1;
        if (oddR) fy = -1;
      }
      let cs = sc;
      if (cfg.layout === 'Honeycomb') {
        const hh = ((u / 0.75) * Math.sqrt(3)) / 2;
        y = (r + 0.5) * hh + (oddC ? hh / 2 : 0);
        cs = sc / 0.75;
      }
      if (cfg.layout === 'Tossed') {
        x += (hsh(tc, tr, cfg.seed) - 0.5) * 0.55 * u;
        y += (hsh(tr + 7, tc, cfg.seed) - 0.5) * 0.55 * u;
        rot += (hsh(tc + 3, tr + 5, cfg.seed) - 0.5) * 70;
      }
      const idx = (tc + 2 * tr + cfg.seed) % n;
      const col = cols[idx];
      const dcol = n > 1 ? cols[(idx + Math.max(1, Math.floor(n / 2))) % n] : cfg.bg;
      const outlined = sh.mode === 'stroke' || cfg.fill === 'Outlines only' || (cfg.fill === 'Outlines mix' && (tc + tr) % 2 === 1);
      cells.push({
        tf: `translate(${r3(x)} ${r3(y)}) rotate(${Math.round(rot)}) scale(${r3(cs * fx * u / 40)} ${r3(cs * fy * u / 40)}) translate(${-fit[1]} ${-fit[2]})`,
        d: sh.d,
        rule: sh.rule,
        fill: outlined ? 'none' : col,
        stroke: outlined ? col : 'none',
        parts: parts.map((p) => ({
          d: p.d,
          tf: p.tf,
          fill: p.mode === 'fill' ? dcol : 'none',
          stroke: p.mode === 'stroke' ? dcol : 'none',
          sw: p.sw,
        })),
      });
    }
  }
  return cells;
}

// The whole pattern as SVG text. `px` sets the picture size for downloads.
export function patternSvg(cfg, tiles, px) {
  const size = px ? ` width="${px}" height="${px}"` : '';
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${size} preserveAspectRatio="xMidYMid slice">`;
  out += `<rect x="0" y="0" width="100" height="100" fill="${cfg.bg}"/>`;
  for (const m of cellsFor(cfg, tiles)) {
    out += `<g transform="${m.tf}" stroke-linecap="round" stroke-linejoin="round">`;
    out += `<path d="${m.d}" fill="${m.fill}" fill-rule="${m.rule}" stroke="${m.stroke}" stroke-width="3"/>`;
    for (const p of m.parts) {
      out += `<path d="${p.d}"${p.tf ? ` transform="${p.tf}"` : ''} fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.sw}"/>`;
    }
    out += '</g>';
  }
  return out + '</svg>';
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadSvg(cfg, tiles, name) {
  saveBlob(new Blob([patternSvg(cfg, tiles, 2400)], { type: 'image/svg+xml' }), name + '.svg');
}

export function downloadPng(cfg, tiles, name) {
  return new Promise((resolve, reject) => {
    const px = 2400;
    const url = URL.createObjectURL(new Blob([patternSvg(cfg, tiles, px)], { type: 'image/svg+xml' }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = px;
      canvas.height = px;
      canvas.getContext('2d').drawImage(img, 0, 0, px, px);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('png'));
        saveBlob(blob, name + '.png');
        resolve();
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('png'));
    };
    img.src = url;
  });
}
