// Smoke-tests the built app in a real browser and saves screenshots.
// Usage: npm run build && npx vite preview --port 4173 & node scripts/check-app.cjs
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const OUT = path.join(__dirname, "..", "docs", "previews", "app");
const BASE = process.env.BASE || "http://localhost:4173";
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const errors = [];
  const check = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) process.exitCode = 1; };

  for (const theme of process.env.SKIP_SHOTS ? [] : ["day", "night"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`${BASE}/?theme=${theme}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(16000); // let the hero build finish
    await page.screenshot({ path: path.join(OUT, `${theme}-1-hero.png`) });
    for (const [id, file] of [["projects", "2-projects"], ["units", "3-units"], ["calculators", "4-calculators"], ["progress", "5-progress"], ["contact", "6-contact"]]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(id === "progress" || id === "projects" ? 5000 : 400);
      await page.locator(`#${id}`).screenshot({ path: path.join(OUT, `${theme}-${file}.png`) });
    }
    await page.close();
  }

  // interaction checks (day)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE}/?theme=day`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Villas", exact: true }).click();
  check(await page.locator(".pcard").count() === 1, "Villas filter shows 1 project");
  await page.getByRole("button", { name: "Villas", exact: true }).click();
  await page.getByPlaceholder("Search by location or project").fill("hebbal");
  check((await page.locator(".pcard h3").allTextContents()).join() === "The Meridian", "search finds The Meridian");
  await page.getByPlaceholder("Search by location or project").fill("zzz");
  check(await page.getByText("No projects match these filters.").isVisible(), "empty state shows");
  await page.getByRole("button", { name: "Clear filters" }).click();
  check(await page.locator(".pcard").count() === 3, "clear filters restores 3 projects");

  await page.getByRole("tab", { name: "Tower C" }).click();
  await page.getByRole("button", { name: /Unit 902, 2 BHK/ }).click();
  check((await page.locator(".sinfo h3").textContent()) === "Unit C-902", "selecting a unit updates the details");

  const before = await page.locator(".donut-emi").textContent();
  await page.locator("#emi-yrs").fill("30");
  check((await page.locator(".donut-emi").textContent()) !== before, "EMI updates when tenure changes");

  await page.getByRole("button", { name: "Confirm site visit →" }).click();
  check(await page.locator(".verr").count() === 4, "empty form shows 4 validation errors");
  await page.getByLabel("Full name").fill("Priya Sharma");
  await page.getByLabel("Mobile").fill("98765 43210");
  const d = new Date(Date.now() + 3 * 864e5);
  await page.getByLabel("Preferred date").fill(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  await page.locator(".vslot", { hasText: "11:30 AM" }).click();
  await page.getByRole("button", { name: "Confirm site visit →" }).click();
  check(await page.getByText("Visit requested!").isVisible(), "valid form shows confirmation");

  await page.getByRole("button", { name: "Switch to night mode" }).click();
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === "night", "theme toggle switches to night");
  await page.goto(BASE, { waitUntil: "networkidle" }); // no ?theme= so the saved choice is used
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === "night", "theme choice survives reload");
  await page.close();

  // phones
  for (const theme of ["day", "night"]) {
    const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    m.on("pageerror", (e) => errors.push(e.message));
    await m.goto(`${BASE}/?theme=${theme}`, { waitUntil: "networkidle" });
    await m.waitForTimeout(16000);
    await m.screenshot({ path: path.join(OUT, `mobile-${theme}.png`) });
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 0, `no horizontal scroll on phone (${theme}), overflow=${overflow}px`);
    await m.getByRole("button", { name: "Open menu" }).click();
    check(await m.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Projects" }).isVisible(), `mobile menu opens (${theme})`);
    await m.close();
  }

  check(errors.length === 0, `no console/page errors${errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""}`);
  await browser.close();
})();
