# Airflow visualization — 2026-10-04

The new `#airflow` section sits after the existing product model. A Three.js cutaway and animated SVG schematic show the supplied sketch side by side. The original sketch is preserved as `reference-sketch.png`.

## Interpretation

Food-space air rises through the centre → fans push it through cooling fins beneath the dry-ice chamber → cooled air splits outward to both sides → air descends along the side walls → it recirculates from the floor to the centre. Orange and blue show stages of the same circulating air. The dry-ice chamber remains separate from the air circuit; CO₂ exhaust is not depicted as supply air.

The sketch's conceptual twin-fan arrangement is explicitly distinguished from the product viewer's single-fan assembly. No temperatures, velocities or CFD accuracy are claimed.

## Implementation

- `src/sections/Airflow.tsx`: section, filtering, pause/play, 0.5–2× playback speed, lazy scene and fallback.
- `src/components/Airflow3D.tsx`: cutaway geometry, two stationary fan frames with independently rotating impellers, twelve depth-separated loops, directional arrows and 1,056 glowing particle/trail points. Particle lookup tables avoid curve integration during each frame.
- `src/components/AirflowDiagram.tsx`: annotated SVG with synchronized playback control and static arrows.
- `src/three/airflowPaths.ts`: shared types and section paths.
- `src/styles/airflow.css`: desktop side-by-side and mobile stacked layout.

Both scenes pause out of view and when the document is hidden. Reduced-motion preferences disable continuous movement. Failure to create WebGL switches the 3D panel to the SVG diagram. Existing product model viewers remain in place.

## Verification

TypeScript, seven-language key validation and the production build pass. Browser checks cover actual canvas orbit changes, paused 2D animation time, paused 3D draw calls, filtering, view reset, keyboard speed control, offscreen suspension, reduced motion, WebGL fallback, and mobile overflow. Main successful-load tests report no console warnings/errors, page errors or failed HTTP responses. See `browser-report.json`.

Desktop: 1440 × 1000. Touch mobile emulation: 390 × 844, DPR 2. `desktop.png` and `mobile.png` capture the completed section; fixed navigation is hidden only during those section screenshots to avoid obscuring the design.
