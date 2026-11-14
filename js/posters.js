/* CineSun — procedural, always-colourful poster art (no black & white anywhere) */
"use strict";

function escXml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* Vivid gradient palettes — every poster gets two saturated colours. */
const toUri = svg => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg).replace(/'/g, "%27");

const PALETTES = [
  ["#ff9a3c", "#ff2d95"], ["#7c3aed", "#ec4899"], ["#0ea5e9", "#8b5cf6"], ["#ffc300", "#ff5400"],
  ["#00c9a7", "#3b82f6"], ["#f43f5e", "#8b5cf6"], ["#22d3ee", "#22c55e"], ["#ff4d6d", "#ffd166"],
  ["#5b21b6", "#06b6d4"], ["#ef4444", "#f59e0b"], ["#3b82f6", "#10b981"], ["#e11d48", "#7c3aed"],
  ["#f97316", "#facc15"], ["#a21caf", "#38bdf8"], ["#db2777", "#fb923c"], ["#4f46e5", "#f43f5e"]
];

function wrapTitle(title, maxLines, maxChars) {
  const words = String(title).trim().split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length <= maxChars) cur += " " + w;
    else {
      if (cur) lines.push(cur);
      cur = w.length <= maxChars ? w : w.slice(0, maxChars - 1) + "…";
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[lines.length - 1] = lines[lines.length - 1].replace(/…?$/, "…");
  }
  return lines;
}

/**
 * Deterministically renders a bright 2:3 poster for a title.
 * Returns { uri, c1, c2 } so cards can glow with matching colours.
 */
function posterData(item) {
  const h = hashStr(item.t + item.y);
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const dir = [
    { x1: 0, y1: 0, x2: 300, y2: 450 },
    { x1: 300, y1: 0, x2: 0, y2: 450 },
    { x1: 0, y1: 450, x2: 300, y2: 0 },
    { x1: 150, y1: 0, x2: 150, y2: 450 }
  ][(h >> 2) % 4];

  const lines = wrapTitle(item.t.toUpperCase(), 3, 13);
  const fs = lines.length >= 3 ? 26 : (lines[0] && lines[0].length > 10 ? 30 : 33);
  const lh = fs * 1.22;
  const ty = 212 - (lines.length - 1) * lh / 2;

  /* Sunburst behind the title — the CineSun motif. */
  const cx = 150, sy = 92, R1 = 57, R2 = 87, step = 360 / 12, off = (h >> 4) % 30;
  let rays = "";
  for (let i = 0; i < 12; i++) {
    const rad = (i * step + off) * Math.PI / 180;
    rays += `<line x1="${(cx + R1 * Math.cos(rad)).toFixed(1)}" y1="${(sy + R1 * Math.sin(rad)).toFixed(1)}" x2="${(cx + R2 * Math.cos(rad)).toFixed(1)}" y2="${(sy + R2 * Math.sin(rad)).toFixed(1)}"/>`;
  }

  const dx = ((h >> 6) % 260) - 40;
  const dy = ((h >> 8) % 120) + 330;
  const dr = ((h >> 10) % 60) + 74;
  const srcName = item.s && SOURCES[item.s[0]] ? SOURCES[item.s[0]].short.toUpperCase() : "CINESUN";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
<defs>
<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="${dir.x1}" y1="${dir.y1}" x2="${dir.x2}" y2="${dir.y2}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<radialGradient id="halo" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${sy}" r="150"><stop offset="0" stop-color="#ffffff" stop-opacity=".5"/><stop offset=".45" stop-color="#ffffff" stop-opacity=".1"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
<linearGradient id="vig" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
</defs>
<rect width="300" height="450" fill="url(#bg)"/>
<circle cx="${dx}" cy="${dy}" r="${dr}" fill="#ffffff" opacity=".08"/>
<circle cx="${(dx + 110) % 300}" cy="${(dy + 50) % 450}" r="${(dr * .55).toFixed(0)}" fill="#000000" opacity=".08"/>
<circle cx="${cx}" cy="${sy}" r="150" fill="url(#halo)"/>
<circle cx="${cx}" cy="${sy}" r="46" fill="#ffffff" opacity=".95"/>
<g stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".62">${rays}</g>
<g font-family="Arial, 'Segoe UI', sans-serif" font-weight="900" text-anchor="middle" fill="#ffffff" style="paint-order:stroke" stroke="rgba(12,6,22,.45)" stroke-width="6" letter-spacing=".5">
${lines.map((l, i) => `<text x="150" y="${(ty + i * lh).toFixed(1)}" font-size="${fs}">${escXml(l)}</text>`).join("")}
</g>
<text x="150" y="${(ty + lines.length * lh + 16).toFixed(1)}" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,.85)" text-anchor="middle" letter-spacing="3">${escXml(srcName)} • ${item.y}</text>
<rect width="300" height="450" fill="url(#vig)"/>
</svg>`;

  return { uri: toUri(svg), c1, c2 };
}

/* ---- Wide hero backdrop art (cinejoy-style hero carousel) ---- */
function backdropData(item) {
  const h = hashStr(item.t + "bd");
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const lines = wrapTitle(item.t.toUpperCase(), 2, 26);
  const fs = lines.length >= 2 ? 88 : 108;
  const lh = fs * 1.06;
  const ty = 560 - (lines.length - 1) * lh;

  let rays = "";
  for (let i = 0; i < 14; i++) {
    const rad = (i * (360 / 14) + (h >> 3) % 20) * Math.PI / 180;
    rays += `<line x1="${(1200 + 260 * Math.cos(rad)).toFixed(0)}" y1="${(120 + 260 * Math.sin(rad)).toFixed(0)}" x2="${(1200 + 380 * Math.cos(rad)).toFixed(0)}" y2="${(120 + 380 * Math.sin(rad)).toFixed(0)}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="720" viewBox="0 0 1600 720">
<defs>
<linearGradient id="hg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1600" y2="720"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<linearGradient id="hm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#04120b" stop-opacity=".88"/><stop offset=".55" stop-color="#04120b" stop-opacity=".25"/><stop offset="1" stop-color="#04120b" stop-opacity=".55"/></linearGradient>
<linearGradient id="hb" x1="0" y1="0" x2="0" y2="1"><stop offset=".4" stop-color="#04120b" stop-opacity="0"/><stop offset="1" stop-color="#04120b" stop-opacity=".95"/></linearGradient>
</defs>
<rect width="1600" height="720" fill="#04120b"/>
<rect width="1600" height="720" fill="url(#hg)" opacity=".82"/>
<circle cx="1200" cy="120" r="180" fill="#fff" opacity=".9"/>
<circle cx="1200" cy="120" r="330" fill="#fff" opacity=".14"/>
<g stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".45">${rays}</g>
<circle cx="${(h % 1200)}" cy="${(h >> 5) % 500}" r="240" fill="#000" opacity=".12"/>
<rect width="1600" height="720" fill="url(#hm)"/>
<rect width="1600" height="720" fill="url(#hb)"/>
<g font-family="Arial, 'Segoe UI', sans-serif" font-weight="900" text-anchor="start" x="90" fill="#fff" style="paint-order:stroke" stroke="rgba(2,12,7,.55)" stroke-width="12" letter-spacing="1">
${lines.map((l, i) => `<text y="${(ty + i * lh).toFixed(0)}" font-size="${fs}">${escXml(l)}</text>`).join("")}
</g>
<rect width="1600" height="720" fill="url(#hb)"/>
</svg>`;
  return { uri: toUri(svg) };
}

/* ---- Rounded square provider logo tile ---- */
function providerTileData(key) {
  const s = SOURCES[key];
  const h = hashStr(key + "prov");
  const [c1, c2] = PALETTES[(h + 3) % PALETTES.length];
  const initials = s.short.replace(/[^A-Z]/g, "").slice(0, 2).toUpperCase() || s.short.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
<defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<radialGradient id="ph" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="120" height="120" fill="url(#pg)"/>
<rect width="120" height="120" fill="url(#ph)"/>
<circle cx="111" cy="9" r="52" fill="#fff" opacity=".14"/>
<circle cx="9" cy="111" r="40" fill="#000" opacity=".14"/>
<text x="60" y="60" font-family="Arial, sans-serif" font-weight="900" font-size="${initials.length > 1 ? 40 : 54}" fill="#fff" text-anchor="middle" dominant-baseline="central">${escXml(initials)}</text>
<text x="60" y="96" font-family="Arial, sans-serif" font-weight="700" font-size="12" letter-spacing="2.5" fill="rgba(255,255,255,.9)" text-anchor="middle">${escXml(s.short.toUpperCase())}</text>
</svg>`;
  return toUri(svg);
}
