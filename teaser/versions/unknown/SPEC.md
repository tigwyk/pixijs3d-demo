# Spec: The Unknown

```text
GOAL:    The viewer feels the Ship is alone, and wants to fly it.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    30 s x 30 fps = 900 frames. No beat grid; the bed is an ambient pad.
LOOK:    The medium is the Demo itself, recorded live (assets/take.mp4, HUD at 2x via ?res=2).
         Ground: the Demo's black sky and blue-teal nebula. Ink: HUD amber #ffb454, nothing else.
         Type: IBM Plex Mono caps. Lines 62 px / 500 / +8% tracking. Name 118 px / 700 / +10%.
         Address 40 px / 400. All text left edge x=150, lower third, clear of the Overview and speed readout.
         No grade, grain, vignette or glow added to the footage.
OBJECTS: The Ship (amber engines), the Overview panel (top right), the UNKNOWN row, the Warp streaks.
MOTION:  Text prints a character at a time (steps ease, 0.5-0.9 s), then holds still. No fades or slides.
         Camera: one move per shot. Pull-back power3.inOut 33 frames; pushes linear over the whole shot.
SHOTS:   1  f0-180    Tight on the Overview (2.2x). UNKNOWN row ticks in at 1.5 s. Pull back at 3.2 s to the Ship.
         2  f180-330  Row selected at 6.5 s. Slow push 1 -> 1.05. No Warp button appears. Nothing answers.
         3  f330-450  Row vanishes at 12 s. Line "SOMETIMES THERE IS SOMEONE" prints at 12.6 s, holds to 15 s.
         4  f450-525  Lantern Station selected, [ WARP TO LANTERN STATION ] appears, aligning starts.
         5  f525-900  Aligning ends, tunnel 18-23 s, arrival. "MOSTLY THERE IS YOU" 23.6-26.6 s.
                      End card 27-30 s: SPACE DEMO, then the repo address, over the Ship at rest.
         Sound: assets/ambient.mp3 (the Demo's own CC0 pad), fade in 1.5 s, fade out 2.5 s. No effects.
BANNED:  Added glow or particles; dimming the footage under text; fades and slide-ups; a docked logo;
         invented HUD elements; any text that moves after it lands.
QA:      1.0 s Overview legible, no UNKNOWN yet. 2.5 s UNKNOWN row present. 8 s row highlighted.
         13.5 s row gone, line fully printed. 16.5 s Warp button visible. 20 s tunnel. 25 s line over arrival.
         29 s name and address fully printed, clear of the Ship and HUD.
```
