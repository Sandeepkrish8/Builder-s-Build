// Preview images + video for the animated landing page (mockups/home.html).
// Usage: python3 -m http.server 8080 --directory mockups & node mockups/home-shots.cjs
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "..", "docs", "previews", "home");
const BASE = process.env.BASE || "http://localhost:8080";
fs.mkdirSync(OUT, { recursive: true });

// Jump the build to a stage, set the theme, and let effects settle
async function stage(page, { p, theme, finish = false, wait = 1200 }) {
  await page.evaluate(({ p, theme, finish }) => {
    window.hero.setTheme(theme, true);
    window.hero.site.jump(finish ? 0.955 : p);
    if (finish) window.hero.site.setProgress(1);
  }, { p, theme, finish });
  await page.waitForTimeout(wait);
}

(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

  if (!process.env.ONLY_VIDEO) {
  const desk = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  desk.on("pageerror", (e) => console.error("pageerror:", e.message));
  await desk.goto(`${BASE}/home.html?p=0`, { waitUntil: "networkidle" });
  await desk.waitForTimeout(1500);
  const shots = [
    ["01-day-foundation.png", { p: 0.2, theme: "day" }],
    ["02-day-superstructure.png", { p: 0.6, theme: "day" }],
    ["03-day-complete.png", { theme: "day", finish: true, wait: 1600 }],
    ["04-night-masonry.png", { p: 0.84, theme: "night" }],
    ["05-night-complete.png", { theme: "night", finish: true, wait: 3600 }],
  ];
  for (const [file, opts] of shots) {
    await stage(desk, opts);
    await desk.screenshot({ path: path.join(OUT, file) });
    console.log("saved", file);
  }

  for (const theme of ["day", "night"]) {
    const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await m.goto(`${BASE}/home.html?p=0&theme=${theme}`, { waitUntil: "networkidle" });
    await m.waitForTimeout(1200);
    await stage(m, { theme, finish: true, wait: theme === "night" ? 3600 : 1600 });
    await m.screenshot({ path: path.join(OUT, `mobile-${theme}.png`), fullPage: true });
    console.log("saved", `mobile-${theme}.png`);
    await m.close();
  }

  }

  // Video: full build in day mode, then switch to night
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
  const v = await ctx.newPage();
  await v.goto(`${BASE}/home.html?p=0&speed=0.075`, { waitUntil: "networkidle" });
  await v.waitForTimeout(800);
  await v.evaluate(() => window.hero.site.setProgress(1));
  await v.waitForTimeout(16500);
  await v.click("#themeToggle");
  await v.waitForTimeout(11000); // recording lags behind heavy WebGL frames, so give the night view time
  const video = v.video();
  await ctx.close();
  fs.renameSync(await video.path(), path.join(OUT, "home-build.webm"));
  console.log("saved home-build.webm");
  await browser.close();
})();
