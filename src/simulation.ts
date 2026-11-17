// The Simulation: all of the Demo's state, with no rendering, audio or browser dependency.
// Everything else reads `state` and never writes it.
import { AU, type Celestial, fromShip, SYSTEM } from './system';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type Command =
  | { type: 'heading'; direction: Vec3 }
  | { type: 'stop' }
  | { type: 'warp'; target: string };

export type WarpPhase = 'idle' | 'aligning' | 'tunnel' | 'arriving';

/** An unnamed sign of another presence. It has a distance and nothing else: no name, model or place in any Grid. */
export interface Contact {
  readonly id: string;
  /** Fictional distance from the Ship, in metres. Always far beyond reach. */
  readonly distance: number;
}

export interface SimulationState {
  /** Id of the Celestial whose Grid the Ship is in. */
  readonly grid: string;
  /** The Ship's position within its Grid, in metres from the arrival point. The Ship node itself stays at the origin (ADR 0001). */
  readonly position: Vec3;
  /** Unit vector the Ship's nose points along. The Ship only ever moves along it. */
  readonly facing: Vec3;
  /** Unit vector the Ship has been commanded to travel along, or null when stopped. */
  readonly heading: Vec3 | null;
  readonly speed: number;
  /** Contacts currently present, oldest first. Never more than two. */
  readonly contacts: readonly Contact[];
  readonly warp: {
    readonly phase: WarpPhase;
    /** Id of the destination Celestial, or null when idle. */
    readonly target: string | null;
    /** 0 to 1 through the current phase. */
    readonly progress: number;
  };
}

export interface Simulation {
  readonly state: SimulationState;
  command(command: Command): void;
  /** Whether a Warp Command to this Celestial would be accepted right now. */
  canWarp(target: string): boolean;
  /** Tell the Simulation whether the player is idle. Contacts are likelier while they are. */
  setIdle(idle: boolean): void;
  /** Advance by `dt` seconds. */
  step(dt: number): void;
}

export const TOP_SPEED = 200; // m/s
const ACCELERATION = 16; // m/s²
const DECELERATION = 24; // m/s²
const TURN_RATE = 0.5; // rad/s
/** Seconds each Warp phase lasts; 9.5 s in all. The Grid changes halfway through the tunnel. */
export const WARP_SECONDS = { aligning: 3, tunnel: 5, arriving: 1.5 } as const;
/** Within this distance of its Grid's Celestial the Ship is already there, so Warp to it is refused. */
const NEAR_RANGE = 50_000; // metres
const MAX_CONTACTS = 2;
/** Contact timers run this many times faster while the player is idle. */
const IDLE_RATE = 4;

const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

function normalize(v: Vec3): Vec3 | null {
  const length = Math.hypot(v.x, v.y, v.z);
  return length > 1e-9 && Number.isFinite(length) ? { x: v.x / length, y: v.y / length, z: v.z / length } : null;
}

/** Rotate unit vector `from` toward unit vector `to` by at most `maxAngle` radians. */
function turnToward(from: Vec3, to: Vec3, maxAngle: number): Vec3 {
  const angle = Math.acos(Math.min(1, Math.max(-1, dot(from, to))));
  if (angle <= maxAngle) return to;
  let target = to;
  if (Math.PI - angle < 1e-3) {
    // Dead astern has no unique turn direction, so turn toward any perpendicular first.
    const axis = Math.abs(from.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
    const k = dot(axis, from);
    target = normalize({ x: axis.x - from.x * k, y: axis.y - from.y * k, z: axis.z - from.z * k })!;
    return turnToward(from, target, maxAngle);
  }
  const t = maxAngle / angle;
  const a = Math.sin((1 - t) * angle) / Math.sin(angle);
  const b = Math.sin(t * angle) / Math.sin(angle);
  return normalize({ x: from.x * a + target.x * b, y: from.y * a + target.y * b, z: from.z * a + target.z * b })!;
}

export function createSimulation(
  system: { readonly celestials: readonly Celestial[] } = SYSTEM,
  random: () => number = Math.random,
): Simulation {
  const between = (min: number, max: number): number => min + (max - min) * random();
  const celestial = (id: string): Celestial | undefined => system.celestials.find((c) => c.id === id);
  const state = {
    grid: system.celestials[0].id,
    position: { x: 0, y: 0, z: 0 },
    facing: { x: 0, y: 0, z: -1 } as Vec3,
    heading: null as Vec3 | null,
    speed: 0,
    contacts: [] as { id: string; distance: number; drift: number; life: number }[],
    warp: { phase: 'idle' as WarpPhase, target: null as string | null, progress: 0 },
  };
  let idle = false;
  let nextContactIn = between(40, 80); // seconds, counted faster while idle
  let contactsSeen = 0;

  function stepContacts(dt: number): void {
    for (const contact of state.contacts) {
      contact.life -= dt;
      contact.distance += contact.drift * dt;
    }
    state.contacts = state.contacts.filter((contact) => contact.life > 0);

    nextContactIn -= dt * (idle ? IDLE_RATE : 1);
    if (nextContactIn > 0) return;
    nextContactIn = between(60, 160);
    if (state.contacts.length >= MAX_CONTACTS) return;
    state.contacts.push({
      id: `contact-${++contactsSeen}`,
      distance: between(18, 70) * AU,
      drift: between(-0.02, 0.02) * AU, // metres per second; it is going somewhere, slowly
      life: between(25, 70),
    });
  }
  let phaseTime = 0;
  let swapped = false;

  function canWarp(target: string): boolean {
    const to = celestial(target);
    if (!to || state.warp.phase !== 'idle') return false;
    if (target !== state.grid) return true;
    const v = fromShip(to, to, state.position);
    return Math.hypot(v.x, v.y, v.z) > NEAR_RANGE;
  }

  function enter(phase: WarpPhase): void {
    state.warp.phase = phase;
    state.warp.progress = 0;
    phaseTime = 0;
    if (phase === 'idle') state.warp.target = null;
  }

  function move(dt: number): void {
    state.position.x += state.facing.x * state.speed * dt;
    state.position.y += state.facing.y * state.speed * dt;
    state.position.z += state.facing.z * state.speed * dt;
  }

  function stepWarp(dt: number): void {
    const phase = state.warp.phase as Exclude<WarpPhase, 'idle'>;
    const duration = WARP_SECONDS[phase];
    phaseTime = Math.min(duration, phaseTime + dt);
    state.warp.progress = phaseTime / duration;

    if (phase === 'aligning') {
      // Turn at whatever rate brings the nose onto the destination by the end of the phase.
      const remaining = Math.max(duration - phaseTime, dt);
      const angle = Math.acos(Math.min(1, Math.max(-1, dot(state.facing, state.heading!))));
      state.facing = turnToward(state.facing, state.heading!, Math.max(TURN_RATE * dt, (angle / remaining) * dt));
      state.speed = Math.min(TOP_SPEED, state.speed + ACCELERATION * dt);
      move(dt);
      if (phaseTime >= duration) {
        state.facing = state.heading!;
        swapped = false;
        enter('tunnel');
      }
    } else if (phase === 'tunnel') {
      state.speed = TOP_SPEED;
      if (!swapped && state.warp.progress >= 0.5) {
        swapped = true;
        state.grid = state.warp.target!;
        // Come to rest short of the Celestial along the line of travel, so it is dead ahead on arrival,
        // at the distance its arrival offset gives. Start further back by what the arriving phase covers.
        const { arrival } = celestial(state.grid)!;
        const back = Math.hypot(arrival.x, arrival.y, arrival.z) + (TOP_SPEED * WARP_SECONDS.arriving) / 2;
        state.position = {
          x: -arrival.x - state.facing.x * back,
          y: -arrival.y - state.facing.y * back,
          z: -arrival.z - state.facing.z * back,
        };
      }
      if (phaseTime >= duration) enter('arriving');
    } else {
      const before = state.speed;
      state.speed = TOP_SPEED * (1 - state.warp.progress);
      const mean = (before + state.speed) / 2;
      state.position.x += state.facing.x * mean * dt;
      state.position.y += state.facing.y * mean * dt;
      state.position.z += state.facing.z * mean * dt;
      if (phaseTime >= duration) {
        state.speed = 0;
        state.heading = null;
        enter('idle');
      }
    }
  }

  return {
    state,
    canWarp,
    setIdle(value) {
      idle = value;
    },
    command(command) {
      if (state.warp.phase !== 'idle') return; // a Warp cannot be cancelled or steered
      if (command.type === 'stop') {
        state.heading = null;
      } else if (command.type === 'heading') {
        state.heading = normalize(command.direction) ?? state.heading; // ignore a zero or non-finite direction
      } else if (canWarp(command.target)) {
        const to = celestial(command.target)!;
        state.heading = normalize(fromShip(to, celestial(state.grid)!, state.position)) ?? state.facing;
        state.warp.target = command.target;
        enter('aligning');
      }
    },
    step(dt) {
      stepContacts(dt);
      if (state.warp.phase !== 'idle') return stepWarp(dt);
      let targetSpeed = 0;
      if (state.heading) {
        state.facing = turnToward(state.facing, state.heading, TURN_RATE * dt);
        // Thrust only counts once the nose is roughly on the Heading, so the Ship turns before it goes.
        targetSpeed = TOP_SPEED * Math.max(0, dot(state.facing, state.heading)) ** 4;
      }
      state.speed =
        state.speed < targetSpeed
          ? Math.min(targetSpeed, state.speed + ACCELERATION * dt)
          : Math.max(targetSpeed, state.speed - DECELERATION * dt);
      move(dt);
    },
  };
}
