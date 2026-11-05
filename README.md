# Builder-s-Build

A showcase website for a builder of apartments and houses, featuring an interactive Three.js 3D model, a unit selector, calculators and a construction tracker.

![Hero preview](docs/previews/01-hero-3d-tower.png)

- **Feature plan, tech stack and roadmap:** [docs/FEATURES.md](docs/FEATURES.md)
- **Preview images:** [docs/previews/](docs/previews)
- **Clickable HTML mockup:** [mockups/](mockups). Open `construction.html` for the full-screen animated 3D construction site.
- **Build animation video:** [docs/previews/construction-build.mp4](docs/previews/construction-build.mp4)

## Run the mockup locally

```bash
python3 -m http.server 8080 --directory mockups
```

Then open http://localhost:8080.

## Regenerate the preview images

This requires Playwright.

```bash
node mockups/screenshot.cjs
```

```bash
node mockups/record.cjs
```
