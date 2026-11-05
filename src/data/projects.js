// Placeholder projects. Replace with the client's real projects (or fetch from an API later).
export const PROJECTS = [
  {
    id: "skyline", name: "Urbanstone Skyline", location: "Whitefield, Bengaluru",
    status: "ongoing", type: "apartment", media: "site3d",
    specs: ["2 & 3 BHK", "1,150–1,820 sq ft", "3 Towers"],
    progress: 68, progressLabel: "Construction progress", priceLabel: "Starting from", price: 9_200_000,
    cta: "View details",
  },
  {
    id: "palm-grove", name: "Palm Grove Villas", location: "Sarjapur Road, Bengaluru",
    status: "ready", type: "villa", art: { villa: true, sky: ["#fde3c0", "#9cc3e6"], seed: 7 },
    specs: ["4 BHK Villas", "3,200 sq ft", "Private pool"],
    progress: 100, progressLabel: "Construction progress", priceLabel: "Starting from", price: 24_000_000,
    cta: "View details",
  },
  {
    id: "meridian", name: "The Meridian", location: "Hebbal, Bengaluru",
    status: "upcoming", type: "apartment", art: { towers: 2, sky: ["#e9b98a", "#4d6f96"], seed: 11 },
    specs: ["3 & 4 BHK", "1,900–2,600 sq ft", "Pre-launch offer"],
    progress: 12, progressLabel: "Approvals", progressText: "Pending RERA", priceLabel: "Expected from", price: 16_000_000,
    cta: "Register interest",
  },
];

export const STATUS = {
  ongoing: { label: "Under construction", tone: "ongoing" },
  ready: { label: "Ready to move", tone: "done" },
  upcoming: { label: "Launching soon", tone: "soon" },
};
