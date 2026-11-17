# 05: Warp

**What to build:** With a Celestial selected, a Warp control sends the Ship there. The Ship aligns toward the destination, a tunnel effect plays (streaks, bloom, motion blur, widened field of view), and the destination Grid fades in with the Ship at rest. The whole sequence takes 8 to 10 seconds and cannot be cancelled; Heading and Stop are ignored until arrival; the camera stays free throughout. Terse status lines report "Aligning" and "Warp drive active". Destination Grids other than the asteroid field are simple placeholders in this ticket. See the spec's Warp decisions.

**Blocked by:** 04

**Status:** done

- [x] Warp is a state machine in the Simulation with phases idle, aligning, tunnel and arriving, in that order
- [x] The selection shows a Warp control; using it issues the Warp Command
- [x] Warp is rejected to the current Grid's Celestial while the Ship is near it, and accepted once the Ship has drifted far from it
- [x] Heading and Stop Commands are ignored while Warp is not idle, and there is no way to cancel
- [x] Only one Grid's content exists in the scene at a time; the swap happens during the tunnel phase
- [x] The tunnel effect uses streak meshes, the built-in bloom effect, fog and a field-of-view increase; effects are created once and driven by their properties, not enabled and disabled per frame. (Changed while building: streaks are stretched meshes, not particles, because particles are camera-facing cards that cannot stretch along the direction of travel; the built-in motion blur was dropped because it only blurs camera motion, and the camera does not move during Warp.)
- [x] The camera can be orbited and zoomed during Warp
- [x] The Ship arrives at rest at the destination Grid's arrival point, and the Overview distances reflect the new Grid
- [x] Status lines appear during aligning and tunnel and clear on arrival
- [x] Tests: a Warp Command moves through its phases in order and ends in the destination Grid at rest; Heading and Stop are ignored during Warp; Warp to the current Celestial is rejected when near and accepted when far
