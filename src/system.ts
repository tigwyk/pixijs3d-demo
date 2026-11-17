// The System definition: the one star system the Demo takes place in. Static data only.
import type { Vec3 } from './simulation';

export const AU = 1.496e11; // metres

export type CelestialKind = 'star' | 'planet' | 'station' | 'asteroid-field';

export interface Celestial {
  readonly id: string;
  readonly name: string;
  readonly kind: CelestialKind;
  /** Fictional position of the Celestial's centre in the System, in metres. Scale is faked; only distances use it. */
  readonly position: Vec3;
  /** Where a Ship arrives in this Celestial's Grid, as an offset from the Celestial's centre, in metres. */
  readonly arrival: Vec3;
}

const au = (x: number, y: number, z: number): Vec3 => ({ x: x * AU, y: y * AU, z: z * AU });

export const SYSTEM = {
  name: 'Tarn',
  celestials: [
    { id: 'scatter', name: 'The Scatter', kind: 'asteroid-field', position: au(2.1, 0.0, 0.4), arrival: { x: -300, y: -100, z: 900 } },
    { id: 'lantern', name: 'Lantern Station', kind: 'station', position: au(0.9, 0.02, -0.6), arrival: { x: 0, y: 40, z: 1200 } },
    { id: 'morrow', name: 'Morrow', kind: 'planet', position: au(-4.8, 0.1, 2.2), arrival: { x: 16000, y: 6000, z: 41500 } }, // 45 km out from a 30 km body: it fills the sky
    { id: 'tarn', name: 'Tarn', kind: 'star', position: au(0, 0, 0), arrival: { x: -18000, y: -5000, z: 40000 } },
  ] as readonly Celestial[],
};

/** Vector from the Ship to a Celestial's centre, given the Grid the Ship is in and its position within it. */
export function fromShip(target: Celestial, grid: Celestial, shipInGrid: Vec3): Vec3 {
  return {
    x: target.position.x - grid.position.x - grid.arrival.x - shipInGrid.x,
    y: target.position.y - grid.position.y - grid.arrival.y - shipInGrid.y,
    z: target.position.z - grid.position.z - grid.arrival.z - shipInGrid.z,
  };
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  if (metres < 100_000) return `${(metres / 1000).toFixed(1)} km`;
  if (metres < 0.01 * AU) return `${Math.round(metres / 1000).toLocaleString('en-US')} km`;
  return `${(metres / AU).toFixed(2)} AU`;
}
