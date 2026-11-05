// Unit inventory for Urbanstone Skyline. Status: a = available, h = on hold, b = sold.
const LAYOUT = [
  { no: 1, bhk: 2, carpet: 880, superArea: 1150, facing: "North" },
  { no: 2, bhk: 2, carpet: 880, superArea: 1150, facing: "North" },
  { no: 3, bhk: 3, carpet: 1300, superArea: 1680, facing: "East" },
  { no: 4, bhk: 3, carpet: 1420, superArea: 1820, facing: "East", corner: true },
  { no: 5, bhk: 3, carpet: 1300, superArea: 1680, facing: "South" },
  { no: 6, bhk: 2, carpet: 880, superArea: 1150, facing: "West" },
];

const TOWERS = {
  A: { floors: 18, rate: 6800, pattern: ["babbab", "abbbab", "bbabhb", "babbba", "bbabab", "abhabb", "babbab"] },
  B: { floors: 14, rate: 7030, pattern: ["bbabab", "abhabb", "babaab", "bhbaab", "abbbab", "bbabhb", "babbba"] },
  C: { floors: 9, rate: 6500, pattern: ["aabbab", "abaaab", "babaab", "bhaaab", "aabbab", "abaabh", "aaabba"] },
};

export const TOWER_IDS = Object.keys(TOWERS);

/** Top 7 floors of a tower, newest first, each with 6 units. */
export function floorsFor(towerId) {
  const t = TOWERS[towerId];
  return t.pattern.map((row, i) => {
    const floor = t.floors - i;
    return {
      floor,
      units: LAYOUT.map((u, j) => ({
        ...u,
        id: `${towerId}-${floor}${String(u.no).padStart(2, "0")}`,
        label: `${floor}${String(u.no).padStart(2, "0")}`,
        tower: towerId, floor, totalFloors: t.floors, ratePerSqft: t.rate,
        status: row[j],
      })),
    };
  });
}

export const UNIT_STATUS = { a: "Available", h: "On hold", b: "Sold" };
