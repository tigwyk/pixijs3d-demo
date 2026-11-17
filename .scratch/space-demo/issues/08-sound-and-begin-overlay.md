# 08: Sound and the begin overlay

**What to build:** The Demo opens on a single "click to begin" overlay with one line explaining the three Commands. After the click the scene appears and a low reactor hum fades in, changing with the Ship's speed. Warp has a rising sound that resolves on arrival. Selecting and issuing Commands produce soft ticks. A sparse CC0 ambient pad plays underneath. There is no other menu, title or settings screen. See the spec's Starting stories, and the Audio module and Assets decisions.

**Blocked by:** 05

**Status:** done

- [x] The overlay is the only thing shown before the scene, and carries one line naming Heading, Stop and Warp and how to issue them
- [x] No sound plays before the click; assets load behind the overlay
- [x] The reactor hum is synthesised with Web Audio, fades in after the click, and follows the Ship's speed
- [x] The Warp sound is synthesised, rises through aligning and tunnel, and resolves on arrival
- [x] Selecting and issuing a Command each produce a soft synthesised tick
- [x] The developer has confirmed the ambient pad download (filename, source, size) before it is fetched, and its source and CC0 licence are recorded beside the asset
- [x] The ambient pad loops under the hum at a low level
- [x] No audio library is added; there is no melody-forward music, combat sound or voice
- [x] The Audio module only reads Simulation state and never writes it

## Comments

- All criteria are met in code and the Demo runs without errors, but none of the sound has been listened to: it was built by an agent that cannot hear. Levels, pitches and the choice of ambient track need a human pass.
