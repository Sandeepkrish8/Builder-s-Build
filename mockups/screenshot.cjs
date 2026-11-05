// Renders the mockup sections to PNG preview images.
// Usage: (from repo root) python3 -m http.server 8080 --directory mockups & node mockups/screenshot.cjs
const { chromium } = require("playwright");
const path = require("path");

const OUT = path.join(__dirname, "..", "docs", "previews");
const BASE = process.env.BASE || "http://localhost:8080";
const shots = [
  ["#hero", "01-hero-3d-tower.png"],
  ["#projects", "02-projects-showcase.png"],
  ["#units", "03-unit-selector-floor-plan.png"],
  ["#calc", "04-emi-and-cost-calculators.png"],
  ["#progress", "05-construction-tracker.png"],
  ["#contact", "06-site-visit-booking.png"],
];

(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => console.error("pageerror:", e.message));
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  for (const [sel, file] of shots) {
    // 3D scenes only animate while on screen, so scroll first and let the build play
    await page.locator(sel).scrollIntoViewIfNeeded();
    await page.waitForTimeout(["#projects", "#progress"].includes(sel) ? 6000 : 400);
    await page.locator(sel).screenshot({ path: path.join(OUT, file) });
    console.log("saved", file);
  }

  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await m.goto(`${BASE}/mobile.html`, { waitUntil: "networkidle" });
  await m.waitForTimeout(1500);
  await m.locator("#mobile").screenshot({ path: path.join(OUT, "07-mobile-view.png") });
  console.log("saved 07-mobile-view.png");
  await browser.close();
})();
