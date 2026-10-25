# Three.js assembly verification — 2026-10-04

Source: `3D model/cooler_33L_control_box_assembly.blend` (source kept unchanged).
Active web asset: `public/model/cooler_33L_control_box_assembly.glb`.

- Blender export: 449 visible mesh/text/curve objects, merged into 63 meshes; 215,970 triangles; 1,057,328 bytes (1.01 MiB). Local Draco decoder.
- Closed bounds in Blender metres: min [-0.273, -0.17005, 0], max [0.273, 0.1628, 0.39235].
- GLB includes closed/open/closed animation tracks. Sampled exported hinge quaternion at full open represents -105° about X; both latch quaternions represent -52° about X. Web interaction directly interpolates these same controller nodes for reversible slider input.
- TypeScript, seven-language key validation, production build and all four existing Vitest tests pass.
- Chrome browser validation: orbit changes the rendered canvas; lid open/close and keyboard slider pass; top/interior/reset views pass; auto rotation starts/stops; idle rendering pauses; reduced-motion disables auto rotation; failed model loading switches to the matching render with disabled controls.
- Desktop: 1440 × 1000; mobile emulation: 390 × 844, 2× pixel density; no horizontal overflow.
- Automatic rotation measured 120 rendered frames over approximately 2 seconds (~60 FPS) in the local Chrome test. This is one local measurement, not a guarantee for every device.
- Page, GLB, PNG fallback, Draco JS/WASM and favicon routes return HTTP 200. Browser console/page errors: none in the successful-load tests.
- Reports: `browser-report.json`. Screenshots: `desktop-closed.png`, `desktop-open.png`, `studio-open.png`, `studio-top.png`, `mobile-open.png`, `mobile-studio.png`.

The old visual model area has been replaced with the full assembly. The hero and visible fan specification now describe the current single 120 mm fan assembly; remaining engineering claims elsewhere in the page retain their prototype/design-target status.
