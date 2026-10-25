# 冷驭 CryoDrive · Product Website

> **Important / 重要提醒**
>
> Conrad Challenge rules require all submitted materials to be entirely student work. Coaches may guide, but must not do the work. **This website is a template and starting point.** Before submission, students must rewrite the copy, replace assets, and verify every technical claim themselves.
>
> 康莱德规则要求提交材料必须完全是学生作品。教练可以指导，但不能代做。**这个网站只是模板和起点。** 提交前，必须由学生自己重写文案、替换素材、确认每一句技术表述。

---

## Quick Start

The local preview uses the complete `cooler_33L_control_box_assembly` Blender assembly in two interactive Three.js viewers. Deployment is intentionally out of scope.

```bash
pnpm install
pnpm dev                # Start dev server at http://localhost:5173
```

To build for production:

```bash
pnpm build              # Output to dist/
pnpm preview            # Preview the build locally
```

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Serve the build
- `npm run typecheck` — TypeScript check (no emit)
- `npm run test` — Run Vitest unit tests
- `npm run i18n:check` — Verify all 7 language files have identical key structure
- `npm run prepare:model` — Preprocess the GLB model (groups, optimization, compression)

## Tech Stack

- React 18.3 + TypeScript (strict)
- Vite 5
- Tailwind CSS 3.4
- Three.js with GLTFLoader, local Draco decoding, OrbitControls and environment lighting
- Lazy scene loading, capped pixel density and rendering only while visible or moving
- zustand ^4 (state)
- i18next + react-i18next (7 languages)
- Vitest (unit tests)

## Languages

Seven languages with identical key structure:

1. **zh-CN** (中文简体) — default
2. **en** (English) — authoritative version for Conrad submission
3. ja (日本語)
4. ko (한국어)
5. es (Español)
6. fr (Français)
7. de (Deutsch)

Switch via the nav dropdown or append `?lang=en` to the URL. The choice is saved in `localStorage` and synced to the URL.

**Translation notice:** Japanese, Korean, Spanish, French and German translations are machine-generated. Native-speaker review is recommended before official release.

## Model Choice

The active asset is `public/model/cooler_33L_control_box_assembly.glb`, exported from `../../3D model/cooler_33L_control_box_assembly.blend`. The export preserves the visible assembly and materials, excluding hidden optional parts, cutters, reference images and studio objects. Same-controller/material geometry is merged: 449 visible objects become 63 meshes, 215,970 triangles, approximately 1.01 MiB with Draco compression. The original Blender file is not saved or modified.

The hero and product studio both use Three.js/WebGL. Drag to orbit; hold Command/Ctrl and scroll to zoom, or pinch on touch devices. The lid button and keyboard-accessible slider animate 0–105° about the source hinge, with linked latches. The studio adds perspective, top and interior views. Auto rotation is opt-in and stops when the user drags. Reduced-motion mode applies changes immediately and disables auto rotation. Offscreen/hidden viewers suspend rendering, and settled viewers stop scheduling frames.

`public/draco/` contains local decoder files, so no external CDN is required. If WebGL or model loading fails, `public/img/cooler_33L_control_box_assembly.png` provides the matching Blender render. A fallback is labeled and interactive controls are disabled.

Re-export on this Mac:

```bash
pnpm prepare:model
```

Export statistics are in `public/model/assembly-manifest.json`. `scripts/export_assembly.py` is the current pipeline; `scripts/prepare_model.py` is a legacy converter for earlier assets and is not used by this site. Older public assets are retained but are not loaded by either viewer. Thermal performance, strength, airtightness and venting remain untested physical properties.

## Content TODOs

See `CONTENT-TODO.md` for items the team must confirm or replace before submission:

- Brand name: website uses 冷驭, but the budget sheet and proposal still write 冷驱
- Team member names, schools, photos and personal stories
- Logo confirmation or redesign by students
- Product photos to replace render images
- Measured data to fill into `src/data/experiments.json`
- CO₂ sensor final model (model writes MH-Z19, budget MQ135/MH-Z19, firmware uses SC8)
- Confirm the −25 to +10 °C range reaches and holds for target foods (ice cream and similar require lower temps) via user interviews and bench tests
- Source links for the three market figures, to add to the Brief references
- Native-speaker review of the five machine-translated languages
- Final domain name and `VITE_SITE_URL`

## Deployment

The site deploys to GitHub Pages automatically when changes are pushed to the `main` branch.

1. Create the GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. Open **Actions** and wait for the **Deploy to GitHub Pages** workflow to finish. The published URL appears in the workflow's deployment environment and under **Settings → Pages**.

The Vite build uses relative asset paths, so it works at the repository's `/ChillLink/` Pages URL without a repository-specific base setting. The included workflow also supports a manual run from **Actions → Deploy to GitHub Pages → Run workflow**.

## QA Checklist

See the build prompt section "十二、质量验收" for the full self-check list. Key items:

- [x] `pnpm install && pnpm dev` works, local HTML/model/image routes return 200
- [x] `pnpm build` succeeds; `dist/` is generated
- [ ] All 7 languages switch correctly; `npm run i18n:check` passes
- [ ] Temp dial: −25 to +10 °C, step 0.5, default −10; confirm on release; keyboard operable
- [x] Interactive lid opening, orbit, viewpoint presets and responsive model framing
- [ ] Fan speed follows PWM; CO₂ 2000/5000 ppm thresholds match firmware
- [x] Reduced-motion mode: immediate lid/camera changes, auto rotation disabled
- [ ] Vitest passes
- [ ] Lighthouse mobile: Performance ≥ 80, Accessibility ≥ 95
- [ ] 14 fact red-lines verified (see build prompt section "十、事实红线")

---

Built with the CryoDrive website build prompt v2 (`CryoDrive-网站构建提示词.md`).

## Airflow demonstration

The `#airflow` section after the product viewer pairs a Three.js cutaway with an animated SVG front section based on the supplied hand sketch. Both show central upward return air, cooling across the fins, outward supply to both sides, and downward flow along the walls. Controls provide cold/warm stage highlighting, pause/play, 0.5–2× playback speed and a camera reset. See `verification/airflow/README.md` for the reference, implementation and browser checks.
