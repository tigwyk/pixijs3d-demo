# 07: Idle orbit and Contacts

**What to build:** After about 20 seconds without pointer input the camera begins a slow orbit around the Ship, and any pointer input hands it back at once. The scene also opens in this slow orbit. From time to time an unnamed Contact appears on the Overview as "Unknown" at an unreachable distance. It can be selected but not warped to, and after a while it drops off the list. Occasionally a faint light crosses the far Backdrop. Both are most likely while the player is idle, and neither ever approaches, hails or threatens. See the spec's Contacts, and Camera and input decisions.

**Blocked by:** 04

**Status:** done

- [x] The camera auto-rotates when the scene first appears and after about 20 seconds without pointer input, and stops on any pointer input
- [x] The Scene detects idleness from input and tells the Simulation; the Simulation spawns and expires Contacts on randomised timers biased toward idle periods
- [x] The Simulation's random source is injected
- [x] A Contact has a fictional distance and a lifetime, and no name, model or position in any Grid
- [x] Contacts are listed on the Overview as "Unknown" and are removed when they expire
- [x] A Contact can be selected, shows no bracket in space, and offers no working Warp
- [x] A faint light occasionally crosses the Backdrop; it is a Scene-only effect and not a Contact
- [x] Tests: with a fixed random source, Contacts appear, never exceed two at once, and expire; a Warp Command targeting a Contact is rejected
