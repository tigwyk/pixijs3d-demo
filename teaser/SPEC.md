# Spec: One Warp

The earlier cut, "The Unknown", is kept in `versions/unknown/`.

```text
GOAL:    The viewer feels the Ship is alone, then feels the rush of a Warp, and wants to fly it.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    27 s x 30 fps = 810 frames. No beat grid; the bed is an ambient pad.
LOOK:    The medium is the Demo itself, recorded live in one unbroken take (assets/take.mp4, HUD at 2x via ?res=2).
         Ground: the Demo's black sky and blue-teal nebula. Ink: HUD amber #ffb454, nothing else.
         Type: IBM Plex Mono caps. Lines 62 px / 500 / +8% tracking. Name 118 px / 700 / +10%.
         Address 34 px / 400. All text left edge x=150, lower third, clear of the Overview and speed readout.
         No grade, grain, vignette or glow added to the footage.
OBJECTS: The Ship (amber engines), the Overview panel, the Warp streaks, Lantern Station with its bracket.
MOTION:  Text prints a character at a time (steps ease, 0.5-0.8 s), then holds still. No fades or slides.
         One added camera move: open at 1.7x on the Ship, pull back to 1x over 36 frames (power3.inOut) at 4.4 s.
         Every other move is the Demo's own camera, including the swing behind the Ship during the Warp.
SHOTS:   One shot, no cuts.
         f0-168    Close on the Ship among the rocks. "NOBODY IS EXPECTING YOU" prints at 0.5 s, holds to 4.2 s.
         f132-180  Pull back; the Overview comes into frame.
         f180-240  Lantern Station row selected at 6 s; [ WARP TO LANTERN STATION ] appears.
         f240-330  Aligning, 8-11 s. The Ship turns and the engine trail starts.
         f330-480  The tunnel, 11-16 s. The camera swings behind the Ship.
         f480-525  Arrival. Lantern Station dead ahead, bracketed, 1.2 km.
         f558-666  "THE UNIVERSE IS YOURS" prints at 18.6 s, holds to 22.2 s.
         f690-810  End card: SPACE DEMO at 23 s, the repo address at 23.6 s, over the Ship and the station.
         Sound: assets/ambient.mp3 (the Demo's own CC0 pad), fade in 1.5 s, fade out 2.5 s. No effects.
BANNED:  Added glow or particles; dimming the footage under text; fades and slide-ups; a docked logo;
         invented HUD elements; any text that moves after it lands; cuts.
QA:      2 s Ship fills the frame, line printed. 6.5 s row highlighted and Warp button visible. 9.5 s aligning.
         13 s tunnel. 17.5 s station in frame and not behind the Overview. 20 s line clear of the Ship.
         26 s name and address fully printed, clear of the Ship, the station and the HUD.
```
