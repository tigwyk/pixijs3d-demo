# 04: Overview and selection

**What to build:** The HUD shows an Overview listing the System's four Celestials (asteroid field, station, gas giant, star) by name with a fictional distance in large units, updating as the Ship moves. The player selects a Celestial by clicking its Overview entry, or by clicking it directly in space when it is visible. Either way the selection shows the same bracket and label pinned over the object. This ticket introduces the System definition with original names for the System and its Celestials. See the spec's Modules, HUD, and Camera and input decisions.

**Blocked by:** 02

**Status:** done

- [x] The System definition holds the System's name and the four Celestials with their names, kinds and fictional positions; the names are original
- [x] The Overview lists every Celestial with name and distance, in soft amber on dark with thin lines
- [x] Distances are shown in AU or thousands of km and change as the Ship moves within its Grid
- [x] Clicking an Overview entry selects it; clicking a visible Celestial in space selects it; the Ship itself cannot be selected
- [x] A drag that orbits the camera never selects anything
- [x] The selected object shows a bracket and label positioned by projecting its world position to the screen; no bracket is drawn when it is off-screen
- [x] The selection lives in the HUD, not in Simulation state
- [x] The guide for interaction was read before building
