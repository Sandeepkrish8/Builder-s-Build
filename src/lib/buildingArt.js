// Tiny SVG illustration generator so the mockup has no external image dependencies.
// Replace these with real project renders / site photos in production.

export function buildingArt({ sky = ["#f6c98a", "#7aa7d6"], body = "#f1ece4", glass = "#5f86b3", towers = 2, crane = false, villa = false, seed = 1 } = {}) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const id = "g" + Math.floor(rnd() * 1e6);
  let parts = "";

  if (villa) {
    // Modern villa
    parts += `<rect x="60" y="150" width="280" height="90" fill="${body}"/>
      <rect x="150" y="100" width="190" height="52" fill="${body}"/>
      <rect x="140" y="94" width="210" height="10" fill="#2a3749"/>
      <rect x="50" y="144" width="110" height="9" fill="#2a3749"/>
      <rect x="170" y="112" width="150" height="30" fill="${glass}" opacity=".9"/>
      <rect x="80" y="170" width="70" height="70" fill="${glass}" opacity=".9"/>
      <rect x="180" y="170" width="140" height="50" fill="#ffd38a" opacity=".85"/>
      <rect x="40" y="238" width="320" height="6" fill="#c9bfae"/>
      <rect x="230" y="246" width="140" height="18" fill="#7ec3d8" opacity=".8"/>`;
  } else {
    const spots = [[70, 110], [190, 80], [300, 130]].slice(0, towers);
    spots.forEach(([x, top], t) => {
      const w = 80 - t * 6;
      parts += `<rect x="${x}" y="${top}" width="${w}" height="${250 - top}" fill="${body}"/>`;
      for (let y = top + 12; y < 236; y += 16) {
        for (let wx = x + 8; wx < x + w - 10; wx += 16) {
          const lit = rnd() > 0.78;
          parts += `<rect x="${wx}" y="${y}" width="10" height="9" rx="1" fill="${lit ? "#ffd38a" : glass}" opacity="${lit ? 0.95 : 0.85}"/>`;
        }
      }
      parts += `<rect x="${x - 4}" y="${top - 6}" width="${w + 8}" height="6" fill="#2a3749"/>`;
    });
  }

  if (crane) {
    parts += `<g stroke="#f2b134" stroke-width="4" fill="none">
      <line x1="355" y1="250" x2="355" y2="40"/><line x1="250" y1="44" x2="395" y2="44"/>
      <line x1="355" y1="44" x2="300" y2="44"/><line x1="290" y1="44" x2="290" y2="90" stroke-width="1.5" stroke="#2a3749"/></g>
      <rect x="282" y="90" width="16" height="10" fill="#2a3749"/>`;
  }

  const trees = [20, 160, 260, 380].map((x) => `<circle cx="${x}" cy="238" r="${12 + rnd() * 8}" fill="#4f8a4b"/>`).join("");

  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[0]}"/></linearGradient></defs>
    <rect width="400" height="260" fill="url(#${id})"/>
    <circle cx="250" cy="44" r="18" fill="#fff4dc" opacity=".5"/>
    ${parts}${trees}
    <rect y="248" width="400" height="12" fill="#3b4a3c"/>
  </svg>`;
}
