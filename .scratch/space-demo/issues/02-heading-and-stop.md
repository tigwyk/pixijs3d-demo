# 02: Heading and Stop

**What to build:** The player double-clicks in space to set a Heading; the Ship turns toward it, then accelerates gradually to a top speed of about 200 m/s. A Stop control on the HUD brings the Ship to rest by coasting down. A speed readout shows the Ship's speed. A handful of placeholder rocks in the Grid make the motion visible. Per ADR 0001 the Ship stays at the origin and the Grid moves around it. This ticket introduces the Simulation module, the single test seam, and the Vitest setup. See the spec's Modules, The Ship and its Grid, and Testing Decisions.

**Blocked by:** 01

**Status:** done

- [x] The Simulation is a pure module with no rendering, audio or browser dependency, exposing only "issue a Command" and "advance by a time step" plus readable state
- [x] Double-clicking sets a Heading along the camera ray through the clicked point
- [x] A pointer press that moves beyond a small threshold is a drag and never sets a Heading
- [x] The Ship turns toward a new Heading before gaining speed along it, and a new Heading can be set while moving
- [x] The Stop control brings the Ship to rest by decelerating, not instantly
- [x] The Ship node stays at the origin; the Grid container is translated by the inverse of the Ship's motion, and the placeholder rocks are its children
- [x] The speed readout shows the current speed in soft amber
- [x] Tests, driven only through the Simulation's public interface: after a Heading and enough time the Ship moves along it at no more than top speed; the Ship turns before it gains speed; after Stop and enough time the Ship is at rest
- [x] One command runs the tests and they pass
