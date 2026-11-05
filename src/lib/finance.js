// Pure money helpers. No React here, so they're easy to unit test.

/** Monthly EMI for a loan. rate is annual %, years is tenure. */
export function calcEmi(principal, annualRatePct, years) {
  const n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return { emi: 0, total: 0, interest: 0, principalShare: 0 };
  const r = annualRatePct / 1200;
  const emi = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const total = emi * n;
  return { emi, total, interest: total - principal, principalShare: principal / total };
}

/** 8243.4 -> "₹ 8,243" (Indian digit grouping) */
export const formatINR = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");

/** 9200000 -> "₹ 92 L", 12800000 -> "₹ 1.28 Cr" */
export function formatLakhCr(n) {
  if (n >= 1e7) return `₹ ${+(n / 1e7).toFixed(2)} Cr`;
  return `₹ ${+(n / 1e5).toFixed(1)} L`;
}

export const COST_TIERS = [
  { id: "standard", name: "Standard", rate: 1850 },
  { id: "premium", name: "Premium", rate: 2450 },
  { id: "luxury", name: "Luxury", rate: 3400 },
];

const SPLIT = [
  ["Structure", 0.4],
  ["Finishing", 0.25],
  ["Electrical & plumbing", 0.15],
  ["Labour", 0.15],
  ["Approvals", 0.05],
];

/** Independent-house construction estimate from built-up area and quality tier. */
export function estimateCost(area, tierId) {
  const tier = COST_TIERS.find((t) => t.id === tierId) ?? COST_TIERS[1];
  const total = area * tier.rate;
  return {
    total,
    months: Math.max(6, Math.round(area / 220)),
    breakdown: SPLIT.map(([label, share]) => ({ label, share, amount: total * share })),
  };
}

/** Apartment price: carpet-area based rate plus a small premium for each floor above 5. */
export function unitPrice({ superArea, floor, ratePerSqft }) {
  const floorRise = Math.max(0, floor - 5) * 40;
  return superArea * (ratePerSqft + floorRise);
}
