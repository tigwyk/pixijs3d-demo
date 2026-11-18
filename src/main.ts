import { Container3D, CubeGeometry, DirectionalLight, IcosahedronGeometry, Material3D, Mesh3D, Model3D, Sphere, Vector3, View3D, type Scene3DSource } from '@pixi/3d'; // must load before app.init
import { BloomEffect, OrbitCamera, ParticleSystem3D } from '@pixi/3d/extras';
import { Application, Assets, Graphics, Point, Texture } from 'pixi.js';
import { createAsteroidField } from './asteroids';
import { createAudio } from './audio';
import { createBackdrop, mulberry32 } from './backdrop';
import { createGasGiant, createStarBody, createStation, GAS_GIANT_COLOUR, GRID_LIGHT, type GridBody } from './grids';
import { createHud, IMPOSTOR_RANGE } from './hud';
import { createSimulation, TOP_SPEED } from './simulation';
import { AU, fromShip, SYSTEM } from './system';

const app = new Application();

await app.init({
  // ?renderer=webgl forces the fallback path, for checking it on a WebGPU machine
  preference: new URLSearchParams(location.search).get('renderer') === 'webgl' ? 'webgl' : 'webgpu',
  resizeTo: window,
  antialias: true,
  background: 0x000000,
  // ?res=3 in a 640x360 window gives a 1080p frame with a HUD three times the size, for recording
  resolution: Number(new URLSearchParams(location.search).get('res')) || Math.min(window.devicePixelRatio, 2),
  autoDensity: true,
});
document.body.appendChild(app.canvas);
// PixiJS listens to the wheel passively; without this the page scrolls or pinch-zooms too.
app.canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

const FOG_NEAR = 2500, FOG_FAR = 9000;
// The view keeps this object, so Warp can close the fog in and open it out again for free.
const fog = { type: 'linear' as const, color: 0x000000, near: FOG_NEAR, far: FOG_FAR };
const bloom = new BloomEffect({ threshold: 0.9, intensity: 1.4 });
// Fill light around the Ship. The view keeps this object too, so each Grid can set its own.
const environment = { skyColor: 0x1c2a3a, groundColor: 0x05070a, intensity: 0.6 };
const view3d = new View3D({
  autoResize: true,
  background: createBackdrop(),
  environment,
  // Grid content fades to the black of space with distance instead of popping at the far plane.
  // Fog does not touch the Backdrop, and the Ship's own materials opt out of it.
  fog,
  passes: [bloom],
});
app.stage.addChild(view3d);

// One unit is a metre. A Grid spans a few km; near is raised to keep depth precision over that range.
view3d.camera.near = 2;
view3d.camera.far = 100_000;

// The star's light. Its direction, colour and strength are set per Grid, when the Grid is shown.
const star = new DirectionalLight({ color: 0xfff1dc, intensity: 3 });
star.position.set(-4, 3, 2);
view3d.root.addChild(star);
star.lookAt({ x: 0, y: 0, z: 0 });

// The Ship. It never leaves the origin (ADR 0001). To use another model, replace the .glb file;
// materials are matched by name, so a model with other material names keeps its own.
const SHIP_LENGTH = 25; // metres
const GLOW = 0xff8a2a;
const hull = (baseColor: number): Material3D => new Material3D({ baseColor, roughness: 0.8, flatShading: true, fog: false });
const shipSource = await Assets.load<Scene3DSource>('/assets/craft_cargoB.glb');
const shipModel = new Model3D({
  source: shipSource,
  materials: {
    metal: hull(0x8f98a3),
    metalDark: hull(0x5b636e),
    // Strength above 1 is what bloom picks out: this is the Ship's warm light.
    dark: new Material3D({ baseColor: 0x2a1608, roughness: 1, fog: false, emissive: { color: GLOW, strength: 2.2 } }),
    metalRed: hull(0x7a4526), // cargo
  },
});
{
  // Scale the file to SHIP_LENGTH and centre it on the origin, wherever the file put its pivot.
  const bounds = shipModel.getLocalBounds();
  const centre = bounds.getCenter();
  const scale = SHIP_LENGTH / (bounds.max.z - bounds.min.z);
  shipModel.scale.set(scale);
  shipModel.position.set(-centre.x * scale, -centre.y * scale, -centre.z * scale);
}
const ship = new Container3D(); // its -Z is the Ship's nose
ship.addChild(shipModel);
view3d.root.addChild(ship);

// The Grid: everything local to this Celestial. It moves; the Ship does not (ADR 0001).
const grid = new Container3D();
view3d.root.addChild(grid);
const asteroids = createAsteroidField();

// What each Grid holds, placed at its Celestial's centre. Only the current Grid's content is in the scene; Warp swaps it.
const bodies: Record<string, GridBody> = { lantern: createStation(), morrow: createGasGiant(), tarn: createStarBody() };
const gridContent: Record<string, Container3D> = { scatter: asteroids.node };
/** Which Celestial a clicked node stands for. */
const celestialOf = new Map<object, string>();
for (const celestial of SYSTEM.celestials) {
  const body = bodies[celestial.id];
  if (!body) continue;
  body.node.position.set(-celestial.arrival.x, -celestial.arrival.y, -celestial.arrival.z);
  gridContent[celestial.id] = body.node;
  celestialOf.set(body.node, celestial.id);
}

// Impostors: the star and the gas giant as seen from the other Grids. They hang off the root at a
// fixed range, so like the Backdrop they ignore the Ship's motion; each Grid sets their direction and size.
const impostorGeometry = new IcosahedronGeometry({ radius: 1, detail: 2 });
const impostors = [
  { id: 'tarn', size: 900, material: new Material3D({ baseColor: 0x000000, fog: false, emissive: { color: 0xffd9a0, strength: 3 } }) },
  { id: 'morrow', size: 1500, material: new Material3D({ baseColor: GAS_GIANT_COLOUR, roughness: 1, fog: false }) },
].map(({ id, size, material }) => {
  const node = new Mesh3D({ geometry: impostorGeometry, material });
  node.eventMode = 'static';
  node.hitVolume = new Sphere(new Vector3(0, 0, 0), 4); // generous: it is only a few pixels across
  node.visible = false;
  view3d.root.addChild(node);
  celestialOf.set(node, id);
  return { celestial: SYSTEM.celestials.find((c) => c.id === id)!, size, node };
});

/** Point the star's light, set this Grid's light and fill, and place the impostors, for the Grid just entered. */
function lightGrid(gridId: string): void {
  const here = SYSTEM.celestials.find((c) => c.id === gridId)!;
  const light = GRID_LIGHT[gridId];
  star.color = light.color;
  star.intensity = light.intensity;
  Object.assign(environment, { skyColor: light.sky, groundColor: light.ground, intensity: light.fill });
  const arrival = { x: 0, y: 0, z: 0 };
  for (const { celestial, size, node } of impostors) {
    const v = fromShip(celestial, here, arrival);
    const distance = Math.hypot(v.x, v.y, v.z);
    node.visible = celestial.id !== gridId; // in its own Grid the real body is there instead
    node.position.set((v.x / distance) * IMPOSTOR_RANGE, (v.y / distance) * IMPOSTOR_RANGE, (v.z / distance) * IMPOSTOR_RANGE);
    node.scale.set(Math.min(2500, Math.max(200, size / (distance / AU)))); // bigger when nearer, never invisible
    if (celestial.id === 'tarn') {
      star.position.set(v.x / distance, v.y / distance, v.z / distance);
      star.lookAt({ x: 0, y: 0, z: 0 }); // light travels from the star toward the Ship
    }
  }
}
let shownGrid = '';

// Warp tunnel: streaks rushing past the Ship along its nose. They ride on the Ship, so they follow its facing.
const STREAK_SPAN = 1500; // metres ahead of and behind the Ship
const STREAK_LENGTH = 220;
const STREAK_SPEED = 4500; // m/s
const tunnel = new Container3D();
{
  const random = mulberry32(11);
  const geometry = new CubeGeometry({ width: 0.7, height: 0.7, depth: 1 });
  const material = new Material3D({ baseColor: 0x000000, fog: false, emissive: { color: 0xa8d4ff, strength: 3 } });
  for (let i = 0; i < 180; i++) {
    const streak = new Mesh3D({ geometry, material });
    const radius = 35 + 380 * random(), angle = random() * Math.PI * 2;
    streak.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (random() * 2 - 1) * STREAK_SPAN);
    tunnel.addChild(streak);
  }
}
tunnel.visible = false;
ship.addChild(tunnel);
const BASE_FOV = view3d.camera.fov;

// The crossing light: now and then a faint point drifts across the far Backdrop. It is not a Contact,
// only a second, vaguer hint. It hangs off the root, so like the Backdrop it ignores the Ship's motion.
const LIGHT_RANGE = 60_000; // metres; inside the camera's far distance
const LIGHT_SECONDS = 28; // time to cross
const lightMaterial = new Material3D({ baseColor: 0x000000, fog: false, emissive: { color: 0xfff0d8, strength: 0 } });
const crossingLight = new Mesh3D({ geometry: new IcosahedronGeometry({ radius: 70, detail: 0 }), material: lightMaterial });
crossingLight.visible = false;
view3d.root.addChild(crossingLight);
let lightWait = 15 + Math.random() * 15; // seconds until the next one, counted faster while idle
let lightAge = 0;
const lightFrom = { x: 0, y: 0, z: 0 }, lightSide = { x: 0, y: 0, z: 0 };
function startCrossingLight(): void {
  // Two perpendicular unit vectors pick a great circle; the light travels a short arc of it.
  const z = Math.random() * 1.2 - 0.6, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - z * z);
  Object.assign(lightFrom, { x: r * Math.cos(a), y: z, z: r * Math.sin(a) });
  const b = Math.random() * Math.PI * 2;
  const up = { x: 0, y: 1, z: 0 };
  // side = normalised (from x up), then tilted by b around from; a plain cross product is enough variety
  const sx = lightFrom.y * up.z - lightFrom.z * up.y, sy = lightFrom.z * up.x - lightFrom.x * up.z, sz = lightFrom.x * up.y - lightFrom.y * up.x;
  const length = Math.hypot(sx, sy, sz) * (Math.cos(b) < 0 ? -1 : 1);
  Object.assign(lightSide, { x: sx / length, y: sy / length, z: sz / length });
  lightAge = 0;
  crossingLight.visible = true;
}

// Idle: no pointer input for a while. The camera then orbits by itself, and that is when the System hints at company.
const IDLE_AFTER_MS = 20_000;
let lastInput = -Infinity; // so the Demo opens already idle, in its slow orbit
for (const type of ['pointerdown', 'pointermove', 'wheel'] as const) {
  // On the canvas, not the window: the click on the begin overlay must not count, so the Demo opens idle.
  app.canvas.addEventListener(type, () => (lastInput = performance.now()), { passive: true });
}

// Engine trail. It lives in the Grid's space, not the Ship's, so particles stay where they were
// born and stream behind the Ship; the ticker spawns them at the engine's position in the Grid.
const dot = document.createElement('canvas');
dot.width = dot.height = 64;
{
  const ctx = dot.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
}
const TRAIL_SPACING = 3; // metres between particles
const TRAIL_LIFE = 2.5; // seconds
const trail = new ParticleSystem3D({
  texture: Texture.from(dot),
  blendMode: 'add',
  space: 'local', // positions are the Grid's, so the trail moves with the Grid, not the world
  capacity: Math.ceil((TOP_SPEED / TRAIL_SPACING) * TRAIL_LIFE),
  emitRate: 0,
  life: TRAIL_LIFE,
  size: 3.5,
  sizeEnd: 0.5,
  alpha: 0.35,
  alphaEnd: 0,
  color: 0xffb060,
  colorEnd: 0xc03a08,
});
grid.addChild(trail);
let trailDebt = 0;

// Zoomed far out the Ship is smaller than a pixel and its glow is lost, so a 2D dot stands in for it:
// the single warm pixel against the Backdrop. It sits under the HUD and fades in with camera distance.
const beacon = new Graphics().circle(0, 0, 1.5).fill(GLOW);
app.stage.addChild(beacon);
const ORIGIN = { x: 0, y: 0, z: 0 };
const beaconAt = new Point();

const sim = createSimulation();
const audio = createAudio('/assets/ambient.mp3');
const hud = createHud(app, view3d, sim, audio.tick);

// A press that moved is an orbit drag, never a click. One click on a rock selects the asteroid field;
// a double-click anywhere in space sets a Heading along the camera ray.
const DRAG_PIXELS = 6;
const DOUBLE_CLICK_MS = 350;
let pressX = 0, pressY = 0, lastTap = -Infinity;
view3d.on('pointerdowncapture', (e) => {
  pressX = e.global.x;
  pressY = e.global.y;
});
view3d.on('pointertap', (e) => {
  if (Math.hypot(e.global.x - pressX, e.global.y - pressY) > DRAG_PIXELS) return;
  const ray = view3d.screenToRay(e.global);
  const { position } = sim.state;
  // The field lives in the Grid, which sits at minus the Ship's position; shift the ray into its space.
  const origin = { x: ray.origin.x + position.x, y: ray.origin.y + position.y, z: ray.origin.z + position.z };
  // A body or an impostor says which Celestial it is; rocks take no pointer events, so they get a ray test.
  const clicked = e.target3D ? celestialOf.get(e.target3D) : undefined;
  if (clicked) hud.select(clicked);
  else if (sim.state.grid === 'scatter' && asteroids.hit(origin, ray.direction)) hud.select('scatter');
  const now = performance.now();
  if (now - lastTap < DOUBLE_CLICK_MS) {
    if (sim.state.warp.phase === 'idle') audio.tick('command');
    sim.command({ type: 'heading', direction: ray.direction });
    lastTap = -Infinity;
  } else {
    lastTap = now;
  }
});

// The begin overlay is the only thing before the scene. Sound cannot start without a click, so it is that click.
let begun = false;
const overlay = document.getElementById('begin') as HTMLButtonElement;
overlay.disabled = false; // everything above has loaded
overlay.addEventListener('click', () => {
  begun = true;
  void audio.start();
  overlay.classList.add('gone');
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
});

app.ticker.add((ticker) => {
  if (!begun) return;
  sim.step(Math.min(ticker.deltaMS / 1000, 0.1)); // a backgrounded tab must not produce one huge step
  const { position, facing, warp } = sim.state;
  const dt = ticker.deltaMS / 1000;

  const idle = performance.now() - lastInput > IDLE_AFTER_MS;
  orbit.autoRotate = idle; // any pointer input ends it on the next frame
  sim.setIdle(idle);

  if (crossingLight.visible) {
    lightAge += dt;
    const t = lightAge / LIGHT_SECONDS;
    const angle = (t - 0.5) * 0.5; // about 29 degrees of sky in all
    const c = Math.cos(angle) * LIGHT_RANGE, s = Math.sin(angle) * LIGHT_RANGE;
    crossingLight.position.set(lightFrom.x * c + lightSide.x * s, lightFrom.y * c + lightSide.y * s, lightFrom.z * c + lightSide.z * s);
    lightMaterial.emissive!.strength = 1.6 * Math.sin(Math.PI * Math.min(1, t)); // fades in and out
    if (t >= 1) {
      crossingLight.visible = false;
      lightWait = 60 + Math.random() * 120;
    }
  } else {
    lightWait -= dt * (idle ? 4 : 1);
    if (lightWait <= 0 && warp.phase === 'idle') startCrossingLight();
  }

  if (sim.state.grid !== shownGrid) {
    if (shownGrid) grid.removeChild(gridContent[shownGrid]);
    grid.addChild(gridContent[sim.state.grid]);
    trail.clear(); // its particles belong to the Grid just left
    shownGrid = sim.state.grid;
    lightGrid(shownGrid);
  }

  // Warp tunnel strength: builds over the first part of the tunnel phase and falls away over the last.
  // The Grid changes at its midpoint, hidden behind fog closed all the way in.
  const edge = warp.phase === 'tunnel' ? Math.min(1, warp.progress / 0.15, (1 - warp.progress) / 0.15) : 0;
  const k = edge * edge * (3 - 2 * edge);
  bodies[shownGrid]?.update(dt);
  // Impostors move when the Grid changes, so they are hidden while the tunnel is at full strength.
  for (const { celestial, node } of impostors) node.visible = celestial.id !== shownGrid && k < 0.9;
  grid.visible = k < 0.9; // the giant and the star ignore fog, so they need hiding outright
  tunnel.visible = k > 0;
  if (tunnel.visible) {
    for (const streak of tunnel.children) {
      // The Ship's nose is its local +z, so streaks rush toward -z: from ahead, past the Ship, out behind.
      streak.position.z -= STREAK_SPEED * k * dt;
      if (streak.position.z < -STREAK_SPAN) streak.position.z += STREAK_SPAN * 2;
      streak.scale.z = 1 + STREAK_LENGTH * k;
    }
  }
  fog.near = FOG_NEAR * (1 - k);
  fog.far = FOG_FAR * (1 - k) + 1;
  view3d.camera.fov = BASE_FOV * (1 + 0.4 * k);
  bloom.intensity = 1.4 + 1.4 * k;

  grid.position.set(-position.x, -position.y, -position.z);
  // shortcut: lookAt rolls unpredictably when facing is almost straight up or down; use a quaternion if that shows
  ship.lookAt(facing);
  // One particle per few metres travelled, so the trail thickens with speed and is absent at rest.
  // None inside the tunnel: the Ship is between Grids there, with nowhere for a trail to lie.
  trailDebt = warp.phase === 'tunnel' ? 0 : trailDebt + (sim.state.speed * dt) / TRAIL_SPACING;
  const born = Math.floor(trailDebt);
  if (born > 0) {
    trailDebt -= born;
    const back = SHIP_LENGTH * 0.45;
    trail.spawn(born, { position: { x: position.x - facing.x * back, y: position.y - facing.y * back, z: position.z - facing.z * back } });
  }
  const centre = view3d.worldToScreen(ORIGIN, beaconAt);
  beacon.visible = centre !== null;
  if (centre) beacon.position.copyFrom(centre);
  beacon.alpha = Math.min(1, Math.max(0, (orbit.distance - 800) / 1500));
  hud.update();
  audio.update(sim.state);
});

view3d.camera.position.set(-42, 18, 45); // on the star's side of the Ship, so it opens lit
const orbit = new OrbitCamera({
  view: view3d,
  target: { x: 0, y: 0, z: 0 },
  enableDamping: true,
  autoRotateSpeed: 0.35, // slow enough to read as drift
  zoomSpeed: 3, // the range is wide; the default takes hundreds of wheel ticks to cross it
  minDistance: 30, // close enough to see the Ship's windows
  maxDistance: 5000, // the Ship is about one warm pixel
});

// Dev only: a handle for poking at the Demo from the browser console, e.g. demo.startCrossingLight().
if (import.meta.env.DEV) Object.assign(window, { demo: { sim, view3d, hud, orbit, crossingLight, startCrossingLight } });
