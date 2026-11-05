// 2D floor plan. 3 BHK shows three bedrooms; 2 BHK turns the third room into a study.
export default function FloorPlan({ bhk, facing }) {
  const third = bhk >= 3 ? "Bedroom 3" : "Study";
  return (
    <svg viewBox="0 0 460 320" className="plan" role="img" aria-label={`${bhk} BHK floor plan, ${facing} facing`}>
      <g stroke="#2a3749" strokeWidth="4">
        <rect x="2" y="2" width="456" height="316" fill="#fafafa" />
        <rect x="2" y="2" width="160" height="140" fill="#eef3fa" />
        <rect x="162" y="2" width="68" height="70" fill="#e6f0ef" />
        <rect x="162" y="72" width="68" height="70" fill="#f4efe6" />
        <rect x="230" y="2" width="120" height="140" fill="#eef3fa" />
        <rect x="350" y="2" width="108" height="140" fill={bhk >= 3 ? "#eef3fa" : "#f4efe6"} />
        <rect x="2" y="142" width="258" height="176" fill="#fff6e6" />
        <rect x="260" y="142" width="110" height="98" fill="#f3efe9" />
        <rect x="260" y="240" width="110" height="78" fill="#e6f0ef" />
        <rect x="370" y="142" width="88" height="176" fill="#e9f3e4" />
      </g>
      <g stroke="#fafafa" strokeWidth="6">
        <path d="M120 142h30M240 142h30M380 142h30M370 190v40M190 72h25M260 270v25" />
      </g>
      <g fill="none" stroke="#9aa6b8" strokeWidth="1.2">
        <path d="M120 142A30 30 0 0 1 150 112M240 142A30 30 0 0 1 270 112M380 142A30 30 0 0 1 410 112" />
      </g>
      <g fontFamily="Manrope" fontWeight="700" fontSize="12" fill="#2a3749">
        <text x="40" y="68">Master Bed</text><text x="250" y="68">Bedroom 2</text><text x="370" y="68">{third}</text>
        <text x="70" y="226">Living &amp; Dining</text><text x="288" y="192">Kitchen</text><text x="292" y="282">Bath 2</text>
        <text x="178" y="40">Bath 1</text><text x="166" y="110">Wardrobe</text><text x="384" y="232">Balcony</text>
      </g>
      <g fontFamily="Manrope" fontSize="11" fill="#5f6673">
        <text x="48" y="84">14′ × 12′</text><text x="262" y="84">11′ × 12′</text><text x="378" y="84">10′ × 12′</text>
        <text x="92" y="242">22′ × 15′</text><text x="292" y="208">10′ × 9′</text><text x="392" y="248">8′ × 16′</text>
      </g>
      <g transform="translate(420 290)">
        <circle r="14" fill="#fff" stroke="#2a3749" /><path d="M0 -10 L5 4 L0 1 L-5 4 Z" fill="#e0a43a" />
        <text x="-3" y="-17" fontSize="9" fontWeight="700" fill="#2a3749">N</text>
      </g>
    </svg>
  );
}
