import { CubeTexture } from 'pixi.js';

type Vec = [number, number, number];
type FaceName = 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back';

// Standard cube map layout: u runs right and v runs down the face image, both -1..1.
const FACES: Record<FaceName, { dir: (u: number, v: number) => Vec; uv: (d: Vec) => [number, number] }> = {
  right: { dir: (u, v) => [1, -v, -u], uv: ([x, y, z]) => [-z / x, -y / x] },
  left: { dir: (u, v) => [-1, -v, u], uv: ([x, y, z]) => [z / -x, -y / -x] },
  top: { dir: (u, v) => [u, 1, v], uv: ([x, y, z]) => [x / y, z / y] },
  bottom: { dir: (u, v) => [u, -1, -v], uv: ([x, y, z]) => [x / -y, -z / -y] },
  front: { dir: (u, v) => [u, -v, 1], uv: ([x, y, z]) => [x / z, -y / z] },
  back: { dir: (u, v) => [-u, -v, -1], uv: ([x, y, z]) => [-x / -z, -y / -z] },
};

export function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number, z: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t: number): number => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

function noise(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = smooth(x - xi), v = smooth(y - yi), w = smooth(z - zi);
  const c = (dx: number, dy: number, dz: number): number => hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}

function fbm(x: number, y: number, z: number): number {
  let sum = 0, amp = 0.5;
  for (let i = 0; i < 5; i++, amp *= 0.5, x *= 2, y *= 2, z *= 2) sum += amp * noise(x, y, z);
  return sum;
}

function faceOf([x, y, z]: Vec): FaceName {
  const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
  if (ax >= ay && ax >= az) return x > 0 ? 'right' : 'left';
  if (ay >= az) return y > 0 ? 'top' : 'bottom';
  return z > 0 ? 'front' : 'back';
}

/** The Backdrop: stars and a cold blue-teal nebula, generated once as a cube map. */
export function createBackdrop(size = 1024, seed = 7): CubeTexture {
  const NEBULA = 256; // nebula is soft, so compute it small and scale up
  const faces = {} as Record<FaceName, HTMLCanvasElement>;
  const contexts = {} as Record<FaceName, CanvasRenderingContext2D>;

  for (const name of Object.keys(FACES) as FaceName[]) {
    const small = document.createElement('canvas');
    small.width = small.height = NEBULA;
    const image = new ImageData(NEBULA, NEBULA);
    for (let py = 0; py < NEBULA; py++) {
      for (let px = 0; px < NEBULA; px++) {
        // Edge texels sit exactly on the cube edge, so neighbouring faces agree there.
        const [x, y, z] = FACES[name].dir((px / (NEBULA - 1)) * 2 - 1, (py / (NEBULA - 1)) * 2 - 1);
        const len = Math.hypot(x, y, z);
        const nx = (x / len) * 1.6, ny = (y / len) * 1.6, nz = (z / len) * 1.6;
        const density = Math.min(1, Math.max(0, fbm(nx + 11, ny + 5, nz + 3) - 0.46) * 3.5);
        const teal = fbm(nx * 2 + 40, ny * 2, nz * 2);
        const i = (py * NEBULA + px) * 4;
        image.data[i] = 255 * density * density * 0.1;
        image.data[i + 1] = 255 * density * density * (0.22 + 0.3 * teal);
        image.data[i + 2] = 255 * density * density * 0.55;
        image.data[i + 3] = 255;
      }
    }
    small.getContext('2d')!.putImageData(image, 0, 0);

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(small, 0, 0, size, size);
    faces[name] = canvas;
    contexts[name] = ctx;
  }

  const random = mulberry32(seed);
  for (let i = 0; i < 6000; i++) {
    const z = random() * 2 - 1, a = random() * Math.PI * 2, r = Math.sqrt(1 - z * z);
    const d: Vec = [r * Math.cos(a), z, r * Math.sin(a)];
    const name = faceOf(d);
    const [u, v] = FACES[name].uv(d);
    const brightness = random() ** 6; // most stars are faint
    const tint = random();
    const ctx = contexts[name];
    ctx.fillStyle = `rgba(${200 + 55 * tint}, ${215 + 30 * tint}, 255, ${0.25 + 0.75 * brightness})`;
    ctx.beginPath();
    ctx.arc(((u + 1) / 2) * size, ((v + 1) / 2) * size, 0.5 + 1.2 * brightness, 0, Math.PI * 2);
    ctx.fill();
  }

  return CubeTexture.from({ faces, label: 'backdrop' });
}
