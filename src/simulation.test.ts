import { expect, test } from 'vitest';
import { createSimulation, TOP_SPEED, type Simulation } from './simulation';
import { fromShip, SYSTEM } from './system';

/** How far ahead of the Ship its Grid's Celestial is, and how far off its nose (0 is dead ahead). */
function celestialAhead(sim: Simulation): { distance: number; offNose: number } {
  const grid = SYSTEM.celestials.find((c) => c.id === sim.state.grid)!;
  const v = fromShip(grid, grid, sim.state.position);
  const distance = Math.hypot(v.x, v.y, v.z);
  const f = sim.state.facing;
  return { distance, offNose: 1 - (v.x * f.x + v.y * f.y + v.z * f.z) / distance };
}

function run(sim: Simulation, seconds: number): void {
  for (let t = 0; t < seconds; t += 1 / 60) sim.step(1 / 60);
}

test('after a Heading and enough time, the Ship moves along it at no more than top speed', () => {
  const sim = createSimulation();
  sim.command({ type: 'heading', direction: { x: 3, y: 0, z: 0 } });
  run(sim, 60);

  expect(sim.state.speed).toBeCloseTo(TOP_SPEED);
  expect(sim.state.speed).toBeLessThanOrEqual(TOP_SPEED);
  expect(sim.state.facing.x).toBeCloseTo(1);

  const before = { ...sim.state.position };
  run(sim, 1);
  expect(sim.state.position.x - before.x).toBeGreaterThan(TOP_SPEED * 0.9);
  expect(sim.state.position.y - before.y).toBeCloseTo(0);
  expect(sim.state.position.z - before.z).toBeCloseTo(0);
});

test('the Ship turns before it gains speed along a new Heading', () => {
  const sim = createSimulation();
  const start = { ...sim.state.facing };
  sim.command({ type: 'heading', direction: { x: -start.x, y: -start.y, z: -start.z } }); // dead astern
  run(sim, 1);

  expect(sim.state.facing).not.toEqual(start);
  expect(sim.state.speed).toBeLessThan(1);
});

test('a new Heading can be set while moving', () => {
  const sim = createSimulation();
  sim.command({ type: 'heading', direction: { x: 1, y: 0, z: 0 } });
  run(sim, 30);
  sim.command({ type: 'heading', direction: { x: 0, y: 1, z: 0 } });
  run(sim, 60);

  expect(sim.state.facing.y).toBeCloseTo(1);
  expect(sim.state.speed).toBeCloseTo(TOP_SPEED);
});

test('after Stop and enough time, the Ship is at rest, having coasted down', () => {
  const sim = createSimulation();
  sim.command({ type: 'heading', direction: { x: 0, y: 0, z: -1 } });
  run(sim, 30);
  sim.command({ type: 'stop' });
  run(sim, 1);
  expect(sim.state.speed).toBeGreaterThan(0); // not an instant halt
  expect(sim.state.speed).toBeLessThan(TOP_SPEED);

  run(sim, 30);
  expect(sim.state.speed).toBe(0);
  const rest = { ...sim.state.position };
  run(sim, 1);
  expect(sim.state.position).toEqual(rest);
});

test('a zero-length Heading is ignored', () => {
  const sim = createSimulation();
  sim.command({ type: 'heading', direction: { x: 0, y: 0, z: 0 } });
  run(sim, 5);
  expect(sim.state.speed).toBe(0);
});

// Warp

function phasesDuring(sim: Simulation, seconds: number): string[] {
  const seen = [sim.state.warp.phase as string];
  for (let t = 0; t < seconds; t += 1 / 60) {
    sim.step(1 / 60);
    if (seen[seen.length - 1] !== sim.state.warp.phase) seen.push(sim.state.warp.phase);
  }
  return seen;
}

test('a Warp moves through its phases in order and ends at rest in the destination Grid, with its Celestial dead ahead', () => {
  const sim = createSimulation();
  const start = sim.state.grid;
  sim.command({ type: 'warp', target: 'lantern' });

  expect(phasesDuring(sim, 12)).toEqual(['aligning', 'tunnel', 'arriving', 'idle']);
  expect(sim.state.grid).toBe('lantern');
  expect(sim.state.grid).not.toBe(start);
  expect(sim.state.speed).toBe(0);
  expect(sim.state.warp.target).toBeNull();
  const lantern = SYSTEM.celestials.find((c) => c.id === 'lantern')!;
  const ahead = celestialAhead(sim);
  expect(ahead.offNose).toBeCloseTo(0);
  expect(Math.abs(ahead.distance - Math.hypot(lantern.arrival.x, lantern.arrival.y, lantern.arrival.z))).toBeLessThan(5);

  const rest = { ...sim.state.position };
  run(sim, 2);
  expect(sim.state.position).toEqual(rest);
});

test('a Warp takes between 8 and 10 seconds', () => {
  const sim = createSimulation();
  sim.command({ type: 'warp', target: 'morrow' });
  run(sim, 8);
  expect(sim.state.warp.phase).not.toBe('idle');
  run(sim, 2);
  expect(sim.state.warp.phase).toBe('idle');
});

test('Heading, Stop and another Warp are ignored during a Warp', () => {
  const sim = createSimulation();
  sim.command({ type: 'warp', target: 'lantern' });
  run(sim, 1);
  const heading = { ...sim.state.heading! };

  sim.command({ type: 'heading', direction: { x: 0, y: 1, z: 0 } });
  sim.command({ type: 'stop' });
  sim.command({ type: 'warp', target: 'tarn' });
  expect(sim.state.heading).toEqual(heading);
  expect(sim.state.warp.target).toBe('lantern');

  run(sim, 12);
  expect(sim.state.grid).toBe('lantern');
});

test('Warp to the current Grid\'s Celestial is rejected when near and accepted after drifting far', () => {
  const sim = createSimulation();
  const home = sim.state.grid;
  expect(sim.canWarp(home)).toBe(false);
  sim.command({ type: 'warp', target: home });
  expect(sim.state.warp.phase).toBe('idle');

  sim.command({ type: 'heading', direction: { x: 0, y: 0, z: 1 } });
  run(sim, 400); // about 80 km at top speed
  expect(sim.canWarp(home)).toBe(true);
  sim.command({ type: 'warp', target: home });
  expect(sim.state.warp.phase).toBe('aligning');

  run(sim, 12);
  expect(sim.state.grid).toBe(home);
  expect(celestialAhead(sim).distance).toBeLessThan(2000); // back beside it
  expect(celestialAhead(sim).offNose).toBeCloseTo(0);
});

test('Warp to something that is not a Celestial is rejected', () => {
  const sim = createSimulation();
  sim.command({ type: 'warp', target: 'nowhere' });
  expect(sim.state.warp.phase).toBe('idle');
});

// Contacts

/** A fixed random source, so Contact timing is the same every run. */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test('with a fixed random source, Contacts appear, never exceed two, and expire', () => {
  const sim = createSimulation(undefined, seeded(1));
  expect(sim.state.contacts).toHaveLength(0);

  const ids = new Set<string>();
  let most = 0;
  let sawNone = false;
  for (let t = 0; t < 3600; t += 0.25) {
    sim.step(0.25);
    for (const contact of sim.state.contacts) ids.add(contact.id);
    most = Math.max(most, sim.state.contacts.length);
    if (ids.size > 0 && sim.state.contacts.length === 0) sawNone = true;
  }

  expect(ids.size).toBeGreaterThan(3); // several came
  expect(most).toBeLessThanOrEqual(2);
  expect(sawNone).toBe(true); // and went
});

test('Contacts come sooner while the player is idle', () => {
  const firstContactAt = (idle: boolean): number => {
    const sim = createSimulation(undefined, seeded(5));
    sim.setIdle(idle);
    let t = 0;
    while (sim.state.contacts.length === 0 && t < 1000) {
      sim.step(0.25);
      t += 0.25;
    }
    return t;
  };
  expect(firstContactAt(true)).toBeLessThan(firstContactAt(false) / 2);
});

test('a Contact is far beyond every Celestial and a Warp to it is rejected', () => {
  const sim = createSimulation(undefined, seeded(2));
  sim.setIdle(true);
  while (sim.state.contacts.length === 0) sim.step(0.25);
  const [contact] = sim.state.contacts;

  expect(contact.distance).toBeGreaterThan(10 * 1.496e11);
  expect(sim.canWarp(contact.id)).toBe(false);
  sim.command({ type: 'warp', target: contact.id });
  expect(sim.state.warp.phase).toBe('idle');
});
