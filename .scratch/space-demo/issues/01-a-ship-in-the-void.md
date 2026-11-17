# 01: A Ship in the void

**What to build:** Starting the Demo locally opens a page showing a placeholder Ship at the scene origin against the Backdrop of stars and a cold blue-teal nebula. The player can drag to orbit the camera around the Ship and use the wheel to zoom from close up to where the Ship is a single pixel. This ticket also creates the project: Vite, TypeScript, and the exact-pinned PixiJS and PixiJS 3D packages, preferring WebGPU with WebGL2 fallback. See the spec's Stack, Backdrop and lighting, and Camera and input decisions.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] One command starts the Demo locally, and one command produces a static build
- [x] `pixi.js` (8.23.0 or later) and `@pixi/3d` (0.1.0) are exact-pinned
- [x] The 3D package is imported before the application initialises, and the Demo renders under both WebGPU and WebGL2
- [x] A placeholder Ship is visible at the origin, lit by one directional light
- [x] The Backdrop is a cube map generated in code, mostly black with stars and a blue-teal nebula, and does not shift when anything but the camera's rotation changes
- [x] Dragging orbits the camera around the Ship with damping; the camera always stays centred on the Ship
- [x] The wheel zooms between a close view of the Ship and a view where it is about one pixel, and never scrolls or zooms the page
- [x] The camera's far distance is raised so nothing in a Grid of a few kilometres is cut off
