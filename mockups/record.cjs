// Records the 3D construction build animation to video (docs/previews/construction-build.webm).
// Usage: python3 -m http.server 8080 --directory mockups & node mockups/record.cjs
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const OUT = path.join(__dirname, "..", "docs", "previews");
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: OUT, size: { width: 1280, height: 720 } } });
  const page = await ctx.newPage();
  await page.goto(`${process.env.BASE || "http://localhost:8080"}/construction.html?p=1&speed=0.09`, { waitUntil: "networkidle" });
  await page.waitForTimeout(15000);
  const video = page.video();
  await ctx.close();
  fs.renameSync(await video.path(), path.join(OUT, "construction-build.webm"));
  await browser.close();
  console.log("saved construction-build.webm");
})();
