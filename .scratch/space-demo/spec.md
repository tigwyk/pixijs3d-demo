# Space Demo

Status: ready-for-agent

## Problem Statement

I want to sit alone with a ship in space and feel two things at once: that the universe is cold and empty, and that being in it is cozy and exciting. I want to sense that the universe is mine, and that it could hold limitless engagement with other lifeforms or none at all. Nothing I can open in a browser today gives me that feeling without also handing me goals, combat, menus, or other players.

## Solution

A single-player Demo that opens in a desktop browser. After one click I am looking at my Ship drifting in an asteroid field, warm light in its windows, a low reactor hum, and a cold blue-teal Backdrop. I orbit and zoom the camera with the mouse. I give the Ship one of three Commands: a Heading, Stop, or Warp to another Celestial. There are four Grids in one System, and the gaps between them can only be crossed by Warp. Now and then an unnamed Contact appears on the Overview, far out of reach, and goes away again. There is nothing to win, nothing to lose, and no one to talk to.

## User Stories

### Starting

1. As a player, I want the Demo to open on a single "click to begin" overlay, so that sound can start and I am not dropped into noise unprepared.
2. As a player, I want one line on that overlay telling me the three Commands, so that I need no tutorial once inside.
3. As a player, I want no title screen, menu, or settings after that click, so that nothing stands between me and the scene.
4. As a player, I want to start already in space in the asteroid field, so that there is something near to judge the emptiness against.
5. As a player, I want the Ship to begin at rest with engines idle, so that the first thing I do is look, not react.
6. As a player, I want the reactor hum to fade in instead of starting abruptly, so that the opening feels calm.
7. As a player, I want the camera to be slowly orbiting the Ship when the scene appears, so that the Demo feels alive before I touch anything.

### Camera

8. As a player, I want to drag to orbit the camera around the Ship, so that I can look at it and the System from any angle.
9. As a player, I want the wheel to zoom, so that I can choose how small the Ship is in the frame.
10. As a player, I want to zoom in close enough to see the Ship's lit windows, so that I can feel the cozy end of the Demo.
11. As a player, I want to zoom out until the Ship is a single warm pixel against the Backdrop, so that I can feel the cold end of the Demo.
12. As a player, I want camera movement to ease to a stop after I let go, so that it feels weighty and smooth.
13. As a player, I want the camera to always stay centred on the Ship, so that I never lose it.
14. As a player, I want the wheel to zoom the camera without scrolling or zooming the browser page, so that the Demo is not disturbed.
15. As a player, I want a drag that orbits the camera not to count as a click on whatever is under the pointer, so that I do not select or command by accident.

### Idle

16. As a player, I want the camera to begin a slow orbit after about 20 seconds without input, so that doing nothing is rewarded.
17. As a player, I want any mouse input to hand the camera back to me at once, so that the idle orbit never fights me.
18. As a player, I want Contacts and the distant crossing light to be most likely while I am idle, so that stillness is when the System hints at company.

### The Ship and its Commands

19. As a player, I want to double-click in space to set a Heading, so that I command the Ship instead of steering it.
20. As a player, I want the Ship to turn toward its new Heading before it accelerates, so that it feels like it has mass.
21. As a player, I want the Ship to accelerate gradually to a modest top speed of about 200 m/s, so that sub-warp travel feels slow and deliberate.
22. As a player, I want to set a new Heading while the Ship is already moving, so that I can change my mind.
23. As a player, I want a Stop Command, so that I can bring the Ship to rest and simply look.
24. As a player, I want the Ship to coast down to a stop instead of halting instantly, so that Stop also feels like it has mass.
25. As a player, I want no direct steering by keyboard or joystick, so that the detached, commanding relationship with the Ship is preserved.
26. As a player, I want the Ship's engine glow and trail to respond to its speed, so that I can read what it is doing without the HUD.
27. As a player, I want the reactor hum to change with the Ship's speed, so that movement can be heard as well as seen.
28. As a player, I want the Ship to be the only warm-coloured thing in most Grids, so that it reads as the one cozy place in the cold.

### Grids and Celestials

29. As a player, I want the System to have four Celestials: an asteroid field, a station, a gas giant, and a close pass of the star, so that there are distinct places to be.
30. As a player, I want each Celestial to have its own Grid, so that arriving somewhere feels like being somewhere.
31. As a player, I want the station to have its lights on but never respond to me, so that I cannot tell whether anyone is there.
32. As a player, I want the gas giant to fill a large part of the sky in its Grid, so that I feel small beside it.
33. As a player, I want the star's Grid to be the one bright, warm place, so that the System has a contrast to its cold.
34. As a player, I want the asteroid field to surround me with many rocks at varied distances, so that I can sense depth and scale.
35. As a player, I want to fly away from a Celestial on engines for as long as I like with nothing stopping me, so that I can drift into total emptiness.
36. As a player, I want the Celestial to shrink and fade as I leave it behind, so that the distance feels real.
37. As a player, I want no invisible wall, warning, or automatic turn-back, so that the emptiness is not broken by the Demo's limits.
38. As a player, I want the Ship and camera to behave identically no matter how far I have drifted, so that long drifts never jitter or break.
39. As a player, I want to be able to Warp back to a Celestial from however far out I have drifted, so that I am never stranded.

### The Backdrop

40. As a player, I want the same Backdrop of stars and nebula visible from every Grid, so that I know I am still in the same System after a Warp.
41. As a player, I want the Backdrop to be mostly black with a cold blue-teal nebula, so that space feels cold.
42. As a player, I want the star and the gas giant to appear on the Backdrop at a different size and position in each Grid, so that I can tell where I am relative to them.
43. As a player, I want the Backdrop not to shift as the Ship moves, only as the camera turns, so that it reads as infinitely far away.

### Warp

44. As a player, I want to Warp to a selected Celestial, so that I can cross the gaps between Grids.
45. As a player, I want the Ship to align toward its destination before Warp begins, so that there is a moment of anticipation.
46. As a player, I want a tunnel effect during Warp, with stretched stars, bloom, a widened field of view, and motion blur, so that Warp is the exciting beat of the Demo.
47. As a player, I want a rising sound through Warp that resolves on arrival, so that the excitement is heard as well as seen.
48. As a player, I want Warp to last about 8 to 10 seconds, so that it is long enough to enjoy and short enough not to bore.
49. As a player, I want the destination Grid to fade in around me at the end of Warp, so that arrival is smooth.
50. As a player, I want the Ship to arrive at rest, so that I can look at where I have come to.
51. As a player, I want to be unable to cancel a Warp once it starts, so that choosing to Warp feels like a commitment.
52. As a player, I want Heading and Stop to be ignored during Warp, so that the rules of commitment are consistent.
53. As a player, I want to keep orbiting and zooming the camera during Warp, so that I can watch the tunnel from any angle.
54. As a player, I want to be unable to Warp to the Celestial whose Grid I am already in and near, so that Warp always takes me somewhere.
55. As a player, I want terse status lines during Warp ("Aligning", "Warp drive active"), so that I know what the Ship is doing.
56. As a player, I want Warp to be the only way between Grids, so that the space between places is absolute.

### The Overview and HUD

57. As a player, I want an Overview listing every Celestial with its name and distance, so that I know what exists and how far away it is.
58. As a player, I want Overview distances shown in large fictional units such as AU or thousands of km, so that the numbers carry the sense of vastness.
59. As a player, I want Overview distances to update as I move, so that I can watch a Celestial recede.
60. As a player, I want to select an entry by clicking it in the Overview, so that I can choose a Warp destination.
61. As a player, I want to select a Celestial by clicking it directly in space when it is visible, so that selection feels natural.
62. As a player, I want the selected object to show a bracket and label pinned over it in space, so that I can find it in the scene.
63. As a player, I want both ways of selecting to produce the same bracket and label, so that there is one idea of "selected".
64. As a player, I want a Warp button on the selection, so that Warp is one click after selecting.
65. As a player, I want a Stop control on the HUD, so that I can find the Stop Command without knowing a shortcut.
66. As a player, I want a speed readout, so that I can see the Ship's slow acceleration in numbers.
67. As a player, I want the HUD to be soft amber on dark with thin lines, so that it feels warm and does not compete with the scene.
68. As a player, I want the HUD to contain nothing else, with no modules, capacitor, chat, inventory, or map, so that the Demo stays quiet.
69. As a player, I want soft ticks when I select or issue a Command, so that the HUD feels tactile.
70. As a player, I want the System and its Celestials to have quiet, original names, so that the place feels particular without borrowing from any existing game.
71. As a player, I want no story text, no tutorial prompts, and no names for the Ship or its pilot, so that I can project myself into it.

### Contacts

72. As a player, I want an unnamed Contact to occasionally appear on the Overview at an unreachable distance, so that I wonder whether I am alone.
73. As a player, I want a Contact to be listed as "Unknown", so that it tells me nothing.
74. As a player, I want to be able to select a Contact but not Warp to it, so that it stays out of reach.
75. As a player, I want a Contact to drop off the Overview after a while, so that it never resolves.
76. As a player, I want at most one or two Contacts at a time, so that the System stays empty.
77. As a player, I want a faint light to occasionally cross the far Backdrop, so that there is a second, even vaguer hint of others.
78. As a player, I want Contacts never to approach, hail, or threaten me, so that the possibility of others stays open in both directions.

### Look and sound

79. As a player, I want a stylised low-poly, flat-shaded look, so that the Ship, station, and asteroids belong to one world.
80. As a player, I want strong bloom on emissive lights, so that windows and engines glow against the dark.
81. As a player, I want a dark, restrained palette, so that the few warm lights matter.
82. As a player, I want a sparse ambient pad under the reactor hum, so that the emptiness has a mood and not just silence.
83. As a player, I want no melody-forward music, combat sounds, or voices, so that the calm is never broken.

### Running it

84. As the developer, I want to start the Demo locally with one command, so that I can see it immediately.
85. As the developer, I want a static production build, so that I can host it later without rework.
86. As the developer, I want the Demo to use WebGPU where available and fall back to WebGL2, so that it runs on most desktop browsers.
87. As the developer, I want the 3D engine and PixiJS versions exact-pinned, so that a 0.x API change cannot break the Demo unannounced.
88. As the developer, I want every downloaded asset to be CC0 with its source recorded, so that the Demo carries no licensing obligations.
89. As the developer, I want the Ship model to be replaceable by swapping one file, so that I can substitute my own later.

## Implementation Decisions

### Stack

- Vite and TypeScript, producing a static build.
- The official PixiJS 3D package (`@pixi/3d` 0.1.0) with `pixi.js` 8.23.0 or later, both exact-pinned. The community "Pixi3D" library is a different project and is not used.
- The 3D package must be imported before the application initialises, or the 3D view draws nothing.
- Renderer preference is WebGPU with WebGL2 fallback. Bloom and cube-map lighting need the float colour buffer extension on WebGL2; a device without it is unsupported.
- TypeScript module resolution must be the bundler mode, or the types for the extras entry point are not found.
- Sound uses the browser's Web Audio API directly, with no audio library.
- No physics engine, no state library, no UI framework. The HUD is PixiJS 2D drawn over the 3D view.

### Modules

- **Simulation.** A pure module with no rendering, audio, or browser dependency. It owns the whole state of the Demo: the Ship's position within its Grid, velocity, facing and Heading; which Grid the Ship is in; the Warp phase; and the Contacts currently present. Its interface is small: issue a Command, and advance by a time step. Randomness (for Contact timing) is injected so the module is deterministic under test. Everything else reads its state and never writes it.
- **System definition.** Static data describing the System: its name, the four Celestials with their names, kinds, fictional positions, and the content of each Grid. Overview distances are derived from these fictional positions plus the Ship's local offset.
- **Scene.** Builds and updates the 3D view from Simulation state: the Ship model, the current Grid's contents, lights, the Backdrop, particles, and post-processing. Owns the orbit camera and the idle auto-rotate.
- **HUD.** Draws the Overview, speed readout, selection bracket and label, Stop and Warp controls, and Warp status lines from Simulation state, and turns clicks into Commands. Holds the current selection, which is a HUD concern and not Simulation state.
- **Audio.** Synthesises the reactor hum, the Warp rise, and HUD ticks, and plays the ambient pad file. Reads speed and Warp phase from Simulation state.
- **Entry point.** Shows the "click to begin" overlay, loads assets, creates the modules, and runs the frame loop: advance the Simulation, then update Scene, HUD, and Audio from its state.

### The Ship and its Grid

- Per ADR 0001, the Ship node stays at the scene origin and the Grid's contents are translated by the inverse of the Ship's motion. The Ship's position within a Grid is a value in the Simulation, not a transform on the Ship node.
- Everything placed in a Grid is a child of one Grid container, never of the scene root.
- The engine trail's particles are emitted into the Grid's space, not the Ship's, so that the trail streams behind the Ship.
- The orbit camera's target is fixed at the origin.
- Motion model: on a new Heading the Ship rotates toward it at a fixed turn rate, and thrust applies along its facing once roughly aligned; speed approaches a top speed of about 200 m/s; Stop decelerates to rest. Exact rates are tuning values.
- A Heading is the direction of the camera ray through the double-clicked point.

### Scale and Grids

- Scale is faked. One unit is a metre, each Grid's content sits within a few kilometres of its centre, and the camera's far distance is raised from its 1000-unit default to suit.
- Only one Grid's content exists in the scene at a time. Warp swaps it.
- Grid content fades with distance so that a Celestial left behind disappears smoothly instead of popping at the far plane.
- Asteroids are procedurally generated low-poly rocks drawn as one batched mesh. The gas giant is a large sphere with a procedural banded surface. The station is a glTF model.
- The star and gas giant, when not the current Grid's Celestial, are impostors placed at a fixed direction and apparent size per Grid, drawn in front of the Backdrop and unaffected by Ship movement.

### Backdrop and lighting

- The Backdrop is a cube map generated in code at startup (stars and a blue-teal nebula) and set as the view's background. It is shared by all Grids.
- Each Grid has one directional light from the direction of the star, with colour and intensity varying per Grid; the star's Grid is the brightest and warmest.
- The Ship's windows and engines are emissive with strength above 1, so that bloom picks them out at its default threshold.
- Tone mapping is set once at view creation and not changed at runtime, to avoid shader recompilation stalls.

### Warp

- Warp is a state machine in the Simulation with phases: idle, aligning, tunnel, arriving. Total duration is 8 to 10 seconds.

  ```ts
  type WarpPhase = 'idle' | 'aligning' | 'tunnel' | 'arriving';
  ```

- Warp is accepted only from idle, only to a Celestial, and not to the current Grid's Celestial while the Ship is still near it. Once the Ship has drifted far from it, Warp back to it is allowed.
- While not idle, Heading and Stop Commands are ignored.
- The Grid swap happens during the tunnel phase, when the view is dominated by the effect.
- The tunnel effect is built from a particle system for streaks, the built-in motion blur and bloom effects, and a field-of-view increase. Effects are created once and driven by changing their cheap properties; they are not enabled and disabled per frame.
- The Ship arrives at rest at a fixed arrival point in the destination Grid.

### Contacts

- Contacts are spawned and expired by the Simulation on randomised timers, biased toward idle periods. The Simulation is told when the player is idle; idleness itself is detected by the Scene from input.
- At most two Contacts exist at once. A Contact has a fictional distance and a lifetime, and no name, model, or position in any Grid.
- A Warp Command targeting a Contact is rejected.
- The crossing light is a Scene-only effect on the Backdrop and is not a Contact.

### Camera and input

- The built-in orbit camera controller is used, with damping, min and max distance set for the "lit windows" to "single pixel" range, and auto-rotate for the idle orbit.
- Idle begins after about 20 seconds without pointer input and ends on any pointer input.
- The canvas prevents the default wheel action so the page does not scroll or zoom.
- A pointer press that moved more than a small threshold before release is a drag and never a click or double-click.
- Celestials in the current Grid and visible impostors take pointer events for selection. The Ship does not.
- Desktop mouse only. No touch, gamepad, or keyboard steering.

### HUD

- The selection bracket and label are 2D objects positioned each frame by projecting the selected object's world position to the screen. When the selection is off-screen or a Contact, no bracket is drawn.
- Text on screen is limited to: the overlay line, the Overview, the speed readout, the selection label, and Warp status lines.

### Assets

- The Ship and station are CC0 glTF models from Quaternius or Kenney. The ambient pad is a CC0 audio file. Each download is confirmed with the developer first, stating filename, source, and size, and its source is recorded alongside the asset.
- All other visuals and sounds are generated in code.
- Names for the System and Celestials are original and invented during implementation.

## Testing Decisions

- A good test here drives the Simulation only through its public interface (issue a Command, advance time) and asserts on the state it exposes. It does not assert on internal fields, intermediate values, or how the state is represented.
- The Simulation is the single test seam. It is the only module with non-trivial logic and it has no rendering or browser dependency, so tests run in plain Node.
- Behaviours to cover:
  - After a Heading Command and enough time, the Ship is moving along that Heading at no more than top speed.
  - The Ship turns before it gains speed along a new Heading.
  - After a Stop Command and enough time, the Ship is at rest.
  - A Warp Command moves through its phases in order and ends in the destination Grid at rest.
  - Heading and Stop are ignored during Warp.
  - Warp to the current Grid's Celestial is rejected while near it, and accepted after drifting far from it.
  - Warp to a Contact is rejected.
  - With a fixed random source, Contacts appear, never exceed two, and expire.
- Scene, HUD, and Audio are not unit tested. They are thin readers of Simulation state and are checked by running the Demo and looking and listening.
- The test runner is Vitest, as the natural fit for a Vite project. There is no prior art in this repository; these are its first tests.

## Out of Scope

- Goals, scoring, progression, fail states, combat, damage, or resources.
- Any interaction with Contacts: approaching, hailing, scanning, or identifying them.
- Multiplayer, networking, accounts, saving, or any backend.
- More than one System, procedural generation of Systems, or a map.
- Docking with the station or entering anything.
- EVE-style modules, capacitor, inventory, chat, or market interfaces.
- Touch, gamepad, and keyboard steering; phones and tablets.
- Realistic rendering, true-to-scale distances, and orbital mechanics.
- Settings, volume controls, and accessibility options beyond what the browser provides.
- Hosting, deployment, and creating a git repository.

## Further Notes

- The vocabulary in this spec follows `GLOSSARY.md`. In particular: the experience is the Demo, never a "game"; the player issues Commands and never "flies"; the sky is the Backdrop; other presences are Contacts, never "NPCs".
- `@pixi/3d` is at 0.1.0. Expect rough edges. Where a built-in behaves differently from its guide, prefer a small workaround over replacing the built-in, and note it in a comment.
- The guides consulted for this spec are the package's Introduction, Installation, Environment, Camera controls, Post-processing, and Particles pages. The guides for interaction, models, batched meshes, and performance were not read and should be before those parts are built.
- The measure of success is subjective: a person sits in the Demo for two minutes and reports feeling both the cold and the cozy. Tuning values (speeds, durations, bloom, palette, sound levels) should be adjusted toward that and are not fixed by this spec.
