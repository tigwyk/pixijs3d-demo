// What the station, gas giant and star Grids hold, and how each Grid is lit.
// Every body is built around its own origin; the caller places it at the Celestial's centre in the Grid.
import {
  Container3D,
  CubeGeometry,
  CylinderGeometry,
  Material3D,
  Mesh3D,
  Sphere,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from '@pixi/3d';
import { Texture } from 'pixi.js';
import { mulberry32 } from './backdrop';

/** A Grid body, plus anything it wants to do each frame (turn, blink). */
export interface GridBody {
  readonly node: Container3D;
  update(dt: number): void;
}

/** Light for one Grid: the star's colour and strength there, and the fill light around it. */
export interface GridLight {
  readonly color: number;
  readonly intensity: number;
  readonly sky: number;
  readonly ground: number;
  readonly fill: number;
}

export const GRID_LIGHT: Record<string, GridLight> = {
  scatter: { color: 0xfff1dc, intensity: 3, sky: 0x1c2a3a, ground: 0x0a0e14, fill: 1.5 },
  lantern: { color: 0xfff4e6, intensity: 3.4, sky: 0x1c2a3a, ground: 0x0a0e14, fill: 1.5 },
  morrow: { color: 0xdfe8ff, intensity: 1.7, sky: 0x16283a, ground: 0x080c12, fill: 1.2 }, // far out: dimmer, colder
  tarn: { color: 0xffc98a, intensity: 7, sky: 0x6a3a18, ground: 0x2a1206, fill: 1.6 }, // the one bright, warm Grid
};

export const GAS_GIANT_RADIUS = 30_000; // metres. Scale is faked: it only has to fill the sky.
export const STAR_RADIUS = 30_000;
/** Average colour of the gas giant's bands, for its far-off impostor. */
export const GAS_GIANT_COLOUR = 0x7f9aa6;

/** The station: lights on, ring turning, nobody answering. Its windows are cool, so the Ship stays the warm thing. */
export function createStation(): GridBody {
  const node = new Container3D();
  const hull = new Material3D({ baseColor: 0x77818c, roughness: 0.85, flatShading: true });
  const dark = new Material3D({ baseColor: 0x3a424c, roughness: 0.9, flatShading: true });
  const panel = new Material3D({ baseColor: 0x14233c, roughness: 0.4, flatShading: true });
  const windows = new Material3D({ baseColor: 0x05080a, emissive: { color: 0xbfe8ff, strength: 2 } });
  const beaconMaterial = new Material3D({ baseColor: 0x100404, emissive: { color: 0xff4030, strength: 0 } });

  const add = (parent: Container3D, mesh: Mesh3D, x = 0, y = 0, z = 0): Mesh3D => {
    mesh.position.set(x, y, z);
    parent.addChild(mesh);
    return mesh;
  };

  // Hub and its caps
  add(node, new Mesh3D({ geometry: new CylinderGeometry({ radiusTop: 55, radiusBottom: 55, height: 260, radialSegments: 10 }), material: hull }));
  add(node, new Mesh3D({ geometry: new CylinderGeometry({ radiusTop: 20, radiusBottom: 55, height: 50, radialSegments: 10 }), material: dark }), 0, 155);
  add(node, new Mesh3D({ geometry: new CylinderGeometry({ radiusTop: 55, radiusBottom: 20, height: 50, radialSegments: 10 }), material: dark }), 0, -155);
  add(node, new Mesh3D({ geometry: new CylinderGeometry({ radiusTop: 3, radiusBottom: 3, height: 90, radialSegments: 5 }), material: dark }), 0, 225);
  add(node, new Mesh3D({ geometry: new SphereGeometry({ radius: 5, widthSegments: 6, heightSegments: 4 }), material: beaconMaterial }), 0, 272);

  // Hub windows: one geometry and one material, so they draw together
  const pane = new CubeGeometry({ width: 9, height: 5, depth: 2 });
  for (const y of [-80, -40, 0, 40, 80]) {
    for (let i = 0; i < 10; i++) {
      const angle = ((i + 0.5) / 10) * Math.PI * 2;
      const w = add(node, new Mesh3D({ geometry: pane, material: windows }), Math.sin(angle) * 53, y, Math.cos(angle) * 53);
      w.rotation.y = angle;
    }
  }

  // Solar panels on a boom
  add(node, new Mesh3D({ geometry: new CubeGeometry({ width: 620, height: 6, depth: 6 }), material: dark }), 0, -190);
  for (const side of [-1, 1]) {
    add(node, new Mesh3D({ geometry: new CubeGeometry({ width: 190, height: 2, depth: 110 }), material: panel }), side * 290, -190);
  }

  // The ring, its spokes and its windows turn together
  const ring = new Container3D();
  node.addChild(ring);
  const torus = add(ring, new Mesh3D({ geometry: new TorusGeometry({ radius: 230, tube: 20, radialSegments: 6, tubularSegments: 28 }), material: hull }));
  torus.rotation.x = Math.PI / 2; // the torus is built standing up; lay it flat around the hub
  const spoke = new CubeGeometry({ width: 460, height: 8, depth: 8 });
  for (let i = 0; i < 3; i++) add(ring, new Mesh3D({ geometry: spoke, material: dark })).rotation.y = (i / 3) * Math.PI;
  for (let i = 0; i < 40; i++) {
    if (i % 5 === 4) continue; // gaps, so the windows read as groups
    const angle = (i / 40) * Math.PI * 2;
    const w = add(ring, new Mesh3D({ geometry: pane, material: windows }), Math.sin(angle) * 251, 0, Math.cos(angle) * 251);
    w.rotation.y = angle;
  }

  node.rotation.set(0.25, 0, 0.12); // a little off-axis, so it is not seen dead level
  node.eventMode = 'static'; // children are passive, so a click on any part arrives here

  let time = 0;
  return {
    node,
    update(dt) {
      time += dt;
      ring.rotation.y += 0.05 * dt;
      // A short flash every few seconds: the only thing here that looks like a signal.
      beaconMaterial.emissive!.strength = time % 4 < 0.15 ? 6 : 0;
    },
  };
}

/** The gas giant: a huge banded sphere. It ignores fog, since it is meant to loom from tens of kilometres off. */
export function createGasGiant(): GridBody {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const random = mulberry32(21);
  const palette = ['#5f7f8c', '#8fa9b0', '#3f5a6b', '#b9c7c4', '#6d8a94', '#2f4656', '#9db3b3'];
  // Bands of uneven width, top to bottom, then soft streaks across them
  for (let y = 0; y < canvas.height; ) {
    const height = 6 + Math.floor(random() * 46);
    ctx.fillStyle = palette[Math.floor(random() * palette.length)];
    ctx.fillRect(0, y, canvas.width, height);
    y += height;
  }
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = `rgba(${random() < 0.5 ? '230,240,240' : '20,35,50'},${0.04 + random() * 0.1})`;
    ctx.fillRect(0, random() * canvas.height, canvas.width, 1 + random() * 5);
  }

  const mesh = new Mesh3D({
    geometry: new SphereGeometry({ radius: GAS_GIANT_RADIUS, widthSegments: 48, heightSegments: 32 }),
    material: new Material3D({ baseColorTexture: Texture.from(canvas), roughness: 1, fog: false }),
  });
  mesh.rotation.set(0.2, 0, 0.35); // tilted, so the bands are not level
  mesh.eventMode = 'static';
  mesh.hitVolume = new Sphere(new Vector3(0, 0, 0), GAS_GIANT_RADIUS); // the default box would count its empty corners
  return { node: mesh, update: () => {} };
}

/** The star, seen close: a sphere that only glows. Bloom does the rest. */
export function createStarBody(): GridBody {
  const mesh = new Mesh3D({
    geometry: new SphereGeometry({ radius: STAR_RADIUS, widthSegments: 40, heightSegments: 24 }),
    material: new Material3D({ baseColor: 0x000000, fog: false, emissive: { color: 0xffb060, strength: 2.4 } }),
  });
  mesh.eventMode = 'static';
  mesh.hitVolume = new Sphere(new Vector3(0, 0, 0), STAR_RADIUS);
  return { node: mesh, update: () => {} };
}
