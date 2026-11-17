import { expect, test } from 'vitest';
import { AU, formatDistance, fromShip, SYSTEM } from './system';

test('distances read in metres, then km, then AU', () => {
  expect(formatDistance(412.4)).toBe('412 m');
  expect(formatDistance(12_345_678)).toBe('12,346 km');
  expect(formatDistance(2.5 * AU)).toBe('2.50 AU');
});

test('the Ship starts at its Grid Celestial\'s arrival offset, and moving changes the distance', () => {
  const [grid, other] = SYSTEM.celestials;
  const atArrival = fromShip(grid, grid, { x: 0, y: 0, z: 0 });
  expect(Math.hypot(atArrival.x, atArrival.y, atArrival.z)).toBeCloseTo(Math.hypot(grid.arrival.x, grid.arrival.y, grid.arrival.z));

  const moved = fromShip(grid, grid, { x: 0, y: 0, z: 5000 });
  expect(Math.hypot(moved.x, moved.y, moved.z)).toBeGreaterThan(5000);

  const far = fromShip(other, grid, { x: 0, y: 0, z: 0 });
  expect(Math.hypot(far.x, far.y, far.z)).toBeGreaterThan(AU);
});
