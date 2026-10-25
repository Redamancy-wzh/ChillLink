# CryoDrive / ChillLink Website

React and TypeScript product website for the CryoDrive cold-chain prototype. The site includes Chinese and English copy, interactive Three.js product viewers, and a prototype airflow demonstration. Product performance claims remain design targets unless supported by physical measurements.

## Run Locally

```bash
pnpm install
pnpm dev
```

Create a production build with `pnpm build`, then preview it locally with `pnpm preview`.

## Project Structure

- `.github/workflows/deploy.yml` builds and publishes the site to GitHub Pages.
- `public/img/`, `public/model/`, and `public/draco/` contain optimized images, the active 3D assembly, and its local decoder.
- `src/components/`, `src/sections/`, and `src/styles/` contain the interface and page sections.
- `src/locales/` contains the Chinese and English translations.
- `src/sim/` contains prototype thermal and fan-control simulation code.
- `scripts/` contains localization checks and the Blender model export pipeline.
- `verification/` contains a responsive width audit for reference.

Dependencies and generated output are excluded from Git. GitHub Actions installs from the lockfile and builds `dist/` for deployment.

## Useful Checks

```bash
pnpm test
pnpm typecheck
pnpm i18n:check
pnpm build
```

To export the model again, install Blender at the macOS path configured in `package.json` and run `pnpm prepare:model`. The export writes `public/model/cooler_33L_control_box_assembly.glb` and its manifest. The source Blender file is not included in this website repository.

## Model Viewer

Both product viewers use `public/model/cooler_33L_control_box_assembly.glb`. The export contains 63 meshes and 215,970 triangles, compressed to approximately 1.01 MiB with Draco. Decoder files are served locally, without a CDN dependency. The viewer supports orbit, lid opening, camera presets, and reduced-motion preferences. A built-in schematic fallback is shown when WebGL or model loading is unavailable.

The prototype's thermal performance, strength, airtightness, and venting have not been established by the interactive model or software simulation.

## GitHub Pages

The workflow deploys automatically after a push to `main`. In the repository's **Settings → Pages**, select **GitHub Actions** as the deployment source. The Vite build uses relative paths and supports the repository Pages URL. A manual deployment is also available through **Actions → Deploy to GitHub Pages → Run workflow**.

## Airflow Demonstration

The `#airflow` section pairs a Three.js cutaway with an animated SVG schematic. Controls provide cold and warm stage highlighting, pause/play, playback speed, and a camera reset. It is a visualization of the intended air path, not a CFD result or measured airflow test.
