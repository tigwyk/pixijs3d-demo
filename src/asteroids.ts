import { BatchedMesh3D, IcosahedronGeometry, Material3D, Matrix4, Quaternion, RenderPassBit, Vector3 } from '@pixi/3d';
import { mulberry32 } from './backdrop';
import type { Vec3 } from './simulation';

export interface AsteroidField {
  readonly node: BatchedMesh3D;
  /** Whether a ray, given in the field's own space, passes through any rock. */
  hit(origin: Vec3, direction: Vec3): boolean;
}

/** The asteroid field: low-poly rocks around the arrival point, drawn as one batched mesh. */
export function createAsteroidField(count = 700, seed = 3): AsteroidField {
  const field = new BatchedMesh3D({ size: count });
  // One geometry for every rock keeps the field to a single draw call; uneven scale gives the variety.
  const geometry = new IcosahedronGeometry({ radius: 1, detail: 1 });
  const material = new Material3D({ baseColor: 0x5a544c, roughness: 1, flatShading: true });

  const random = mulberry32(seed);
  const matrix = new Matrix4();
  const position = new Vector3();
  const rotation = new Quaternion();
  const scale = new Vector3();
  const axis = new Vector3();
  // Batched slots take no pointer events, so clicks are tested against a sphere per rock instead.
  const spheres = new Float32Array(count * 4);

  for (let i = 0; i < count; i++) {
    do {
      position.set((random() * 2 - 1) * 3000, (random() * 2 - 1) * 900, (random() * 2 - 1) * 3000);
    } while (Math.hypot(position.x, position.y, position.z) < 150); // keep the arrival point clear
    const size = 5 + 90 * random() ** 3; // mostly small, a few large
    scale.set(size * (0.6 + 0.6 * random()), size * (0.6 + 0.6 * random()), size * (0.6 + 0.6 * random()));
    axis.set(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
    rotation.setFromAxisAngle(axis, random() * Math.PI * 2);

    spheres.set([position.x, position.y, position.z, Math.max(scale.x, scale.y, scale.z)], i * 4);

    field.setGeometryAt(i, geometry);
    field.setMaterialAt(i, material);
    field.setMatrixAt(i, matrix.compose(position, rotation, scale));
    field.setPassesAt(i, RenderPassBit.OPAQUE);
  }
  return {
    node: field,
    hit(origin, direction) {
      for (let i = 0; i < spheres.length; i += 4) {
        const x = spheres[i] - origin.x, y = spheres[i + 1] - origin.y, z = spheres[i + 2] - origin.z;
        const along = x * direction.x + y * direction.y + z * direction.z; // direction is unit length
        if (along > 0 && x * x + y * y + z * z - along * along < spheres[i + 3] ** 2) return true;
      }
      return false;
    },
  };
}
