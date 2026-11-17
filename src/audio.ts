// Audio: the reactor hum, the Warp sound and HUD ticks are synthesised; the ambient pad is a file.
// It reads Simulation state and never writes it. Nothing sounds until start(), which needs a user gesture.
import { type SimulationState, TOP_SPEED } from './simulation';

export type Tick = 'select' | 'command';

export interface Audio {
  /** Begin sound. Call from a click or key handler, or the browser will keep the context suspended. */
  start(): Promise<void>;
  /** Follow the Simulation. Call once a frame. */
  update(state: SimulationState): void;
  tick(kind: Tick): void;
}

// Tuned down after a first listen ("a bit loud for ambience"). The pad is the quietest layer.
const LEVEL = { master: 0.55, hum: 0.08, warp: 0.07, pad: 0.1, tick: 0.05 };
const FADE_IN_SECONDS = 5;

export function createAudio(padUrl: string): Audio {
  // Fetched behind the overlay; decoded once there is a context to decode with.
  const padBytes = fetch(padUrl).then((response) => (response.ok ? response.arrayBuffer() : null)).catch(() => null);
  let ctx: AudioContext | null = null;
  let hum: { a: OscillatorNode; b: OscillatorNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  let warp: { tone: OscillatorNode; toneGain: GainNode; band: BiquadFilterNode; noiseGain: GainNode } | null = null;
  let master: GainNode | null = null;

  /** Ease a parameter toward a value; smooth enough to call every frame without clicks. */
  const ease = (param: AudioParam, value: number, seconds = 0.15): void => {
    param.setTargetAtTime(value, ctx!.currentTime, seconds);
  };

  return {
    async start() {
      if (ctx) return;
      ctx = new AudioContext();
      const now = ctx.currentTime;
      master = ctx.createGain();
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(LEVEL.master, now + FADE_IN_SECONDS);
      master.connect(ctx.destination);

      // Reactor hum: two low tones a hair apart, so they beat slowly, under a low-pass filter.
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 140;
      const gain = ctx.createGain();
      gain.gain.value = LEVEL.hum * 0.6;
      const a = ctx.createOscillator(), b = ctx.createOscillator();
      a.type = b.type = 'sawtooth';
      a.connect(filter);
      b.connect(filter);
      filter.connect(gain).connect(master);
      a.start();
      b.start();
      hum = { a, b, filter, gain };

      // Warp: a rising tone plus band-passed noise for the rush. Silent until a Warp begins.
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      noise.loop = true;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = 1.2;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0;
      noise.connect(band).connect(noiseGain).connect(master);
      noise.start();
      const tone = ctx.createOscillator();
      tone.type = 'triangle';
      const toneGain = ctx.createGain();
      toneGain.gain.value = 0;
      tone.connect(toneGain).connect(master);
      tone.start();
      warp = { tone, toneGain, band, noiseGain };

      // Ambient pad: decoded to a buffer so it loops without the gap an <audio> element leaves.
      const bytes = await padBytes;
      if (!bytes) return; // the Demo still works without it
      try {
        const pad = ctx.createBufferSource();
        pad.buffer = await ctx.decodeAudioData(bytes);
        pad.loop = true;
        const padGain = ctx.createGain();
        padGain.gain.value = LEVEL.pad;
        pad.connect(padGain).connect(master);
        pad.start();
      } catch {
        // an undecodable file is not worth stopping for
      }
    },

    update(state) {
      if (!ctx || !hum || !warp) return;
      const { phase, progress } = state.warp;
      const throttle = Math.min(1, state.speed / TOP_SPEED);

      // The hum rises a little in pitch, brightness and level with speed.
      const pitch = 48 * (1 + 0.22 * throttle);
      ease(hum.a.frequency, pitch);
      ease(hum.b.frequency, pitch * 1.012);
      ease(hum.filter.frequency, 140 + 320 * throttle);
      ease(hum.gain.gain, LEVEL.hum * (0.6 + 0.4 * throttle));

      // The Warp sound climbs through aligning and the tunnel, then falls away and settles on arrival.
      let frequency = 60, level = 0;
      if (phase === 'aligning') {
        frequency = 60 * 2 ** (1.5 * progress);
        level = progress;
      } else if (phase === 'tunnel') {
        frequency = 170 * 2 ** progress;
        level = 1;
      } else if (phase === 'arriving') {
        frequency = 340 * 2 ** (-1.6 * progress);
        level = (1 - progress) ** 2;
      }
      ease(warp.tone.frequency, frequency, 0.05);
      ease(warp.toneGain.gain, LEVEL.warp * 0.5 * level);
      ease(warp.band.frequency, frequency * 5, 0.05);
      ease(warp.noiseGain.gain, LEVEL.warp * level);
    },

    tick(kind) {
      if (!ctx || !master) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = kind === 'select' ? 1320 : 880;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(LEVEL.tick, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + 0.1);
    },
  };
}
