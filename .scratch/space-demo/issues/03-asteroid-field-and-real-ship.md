# 03: The asteroid field and the real Ship

**What to build:** The starting Grid looks finished. The Ship is a CC0 low-poly model with warm, glowing windows and engines; bloom makes them stand out against the dark; an engine trail streams behind the Ship and grows with its speed. The Ship is surrounded by a field of low-poly asteroids at varied distances, and the Grid's content fades smoothly as the Ship drifts away from it. See the spec's Scale and Grids, Backdrop and lighting, Assets, and the Look and sound stories.

**Blocked by:** 02

**Status:** done

- [x] The developer has confirmed the Ship model download (filename, source, size) before it is fetched, and its source and CC0 licence are recorded beside the asset
- [x] The Ship model replaces the placeholder and can be swapped by replacing one file
- [x] The Ship's windows and engines are emissive with strength above 1, and bloom picks them out
- [x] The look is flat-shaded low-poly with a dark, restrained palette; the Ship is the only warm-coloured thing in the Grid
- [x] Asteroids are generated in code and drawn as one batched mesh, as children of the Grid container
- [x] The engine trail is emitted into the Grid's space so it streams behind the moving Ship, and its strength follows the Ship's speed
- [x] Grid content fades with distance and never pops at the camera's far distance
- [x] The Ship and camera behave identically after a long drift away from the asteroid field
- [x] The guides for models, batched meshes and performance were read before building
