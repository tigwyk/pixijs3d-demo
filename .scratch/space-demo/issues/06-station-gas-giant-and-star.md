# 06: The station, the gas giant and the star

**What to build:** The three remaining Grids look finished. The station is a CC0 low-poly model with its lights on that never responds. The gas giant fills a large part of the sky in its Grid. The star's Grid is the one bright, warm place in the System. Each Grid has its own light from the direction of the star, and the star and gas giant appear on the Backdrop as impostors, at a different size and position in each Grid where they are not the local Celestial. See the spec's Scale and Grids, and Backdrop and lighting decisions.

**Blocked by:** 05

**Status:** done

- [x] The station is built in code from primitives, with no download. (Changed while building: the Kenney Space Kit has no orbital station model, only ground-base parts, so a CC0 station model was not used.)
- [x] The station has emissive lights picked out by bloom, and nothing about it reacts to the Ship
- [x] The gas giant is a large sphere with a banded surface generated in code, and dominates the view in its Grid
- [x] The star's Grid is clearly the brightest and warmest of the four
- [x] Each Grid has one directional light whose direction, colour and intensity are set per Grid
- [x] Tone mapping is set once at view creation and not changed at runtime
- [x] The star and gas giant appear as impostors in Grids where they are not the local Celestial, unaffected by Ship movement, and can be selected by clicking
- [x] The Backdrop is identical in all four Grids
- [x] All content in each Grid is a child of the Grid container and fades with distance

## Comments

- Built alongside this ticket, and a change to the spec: the Ship no longer arrives at a fixed arrival point. It comes to rest short of the Celestial along its line of travel, at the distance the arrival offset gives, so the Celestial is always dead ahead on arrival. With a fixed point the station arrived off to one side, out of view.
