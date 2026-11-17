// The HUD: 2D drawn over the view, so it takes the pointer before the view does.
// It reads Simulation state, holds the selection, and turns clicks into Commands.
import { Vector3, type View3D } from '@pixi/3d';
import { type Application, Container, Graphics, Point, Rectangle, Text } from 'pixi.js';
import type { Tick } from './audio';
import type { Simulation } from './simulation';
import { type Celestial, formatDistance, fromShip, SYSTEM } from './system';

const AMBER = 0xffb454;
const FONT = { fill: AMBER, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 14, letterSpacing: 1 };
const PANEL_WIDTH = 300;
const ROW_HEIGHT = 26;
const PAD = 12;
/** Beyond this a Celestial is drawn nowhere in the Grid, so its bracket marks only its direction. */
const LOCAL_RANGE = 50_000;
/** How far from the Ship a far-off Celestial's impostor and bracket are placed. Inside the camera's far distance. */
export const IMPOSTOR_RANGE = 80_000;

export interface Hud {
  /** Select a Celestial or Contact by id, or null to clear. Same result whether it came from the Overview or from space. */
  select(id: string | null): void;
  update(): void;
}

const STATUS = { idle: '', aligning: 'ALIGNING', tunnel: 'WARP DRIVE ACTIVE', arriving: '' } as const;

export function createHud(app: Application, view3d: View3D, sim: Simulation, onTick: (kind: Tick) => void = () => {}): Hud {
  // The selection is a Celestial id or a Contact id. It lives here, not in the Simulation.
  let selectedId: string | null = null;
  const selectedCelestial = (): Celestial | null => SYSTEM.celestials.find((c) => c.id === selectedId) ?? null;

  // Overview: one row per Celestial, then one per Contact present
  const overview = new Container();
  const makeRow = (label: string) => {
    const row = new Container();
    row.eventMode = 'static';
    row.cursor = 'pointer';
    row.hitArea = new Rectangle(0, 0, PANEL_WIDTH, ROW_HEIGHT);
    const highlight = new Graphics().rect(0, 0, PANEL_WIDTH, ROW_HEIGHT).fill({ color: AMBER, alpha: 0.16 });
    const name = new Text({ text: label, style: FONT, x: PAD, y: 5 });
    const distance = new Text({ text: '', style: FONT, anchor: { x: 1, y: 0 }, x: PANEL_WIDTH - PAD, y: 5 });
    row.addChild(highlight, name, distance);
    return { id: '', row, highlight, distance };
  };
  const rows = SYSTEM.celestials.map((celestial) => ({ ...makeRow(celestial.name), id: celestial.id, celestial }));
  // A Contact says nothing about itself, so its row is dimmer and reads only 'Unknown'.
  const contactRows = [makeRow('Unknown'), makeRow('Unknown')];
  for (const r of contactRows) r.row.alpha = 0.75;
  const allRows = [...rows, ...contactRows];
  allRows.forEach((r, i) => {
    r.row.y = PAD + ROW_HEIGHT * (i + 1) + 6;
    r.row.on('pointertap', () => select(r.id));
  });
  const panel = new Graphics();
  let panelRows = -1;
  function drawPanel(count: number): void {
    if (count === panelRows) return;
    panelRows = count;
    panel
      .clear()
      .rect(0, 0, PANEL_WIDTH, PAD * 2 + ROW_HEIGHT * (count + 1) + 6)
      .fill({ color: 0x000000, alpha: 0.45 })
      .stroke({ color: AMBER, alpha: 0.45, width: 1 })
      .moveTo(PAD, PAD + ROW_HEIGHT)
      .lineTo(PANEL_WIDTH - PAD, PAD + ROW_HEIGHT)
      .stroke({ color: AMBER, alpha: 0.3, width: 1 });
  }
  overview.addChild(
    panel,
    new Text({ text: `OVERVIEW · ${SYSTEM.name.toUpperCase()}`, style: { ...FONT, fontSize: 12, letterSpacing: 3 }, x: PAD, y: PAD + 4, alpha: 0.7 }),
    ...allRows.map((r) => r.row),
  );
  overview.eventMode = 'static'; // a click on the panel must not fall through to the view as a Heading

  // Selection bracket and label
  const HALF = 16, ARM = 6;
  const bracket = new Graphics();
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    bracket.moveTo(sx * HALF, sy * (HALF - ARM)).lineTo(sx * HALF, sy * HALF).lineTo(sx * (HALF - ARM), sy * HALF);
  }
  bracket.stroke({ color: AMBER, width: 1.5 });
  const label = new Text({ text: '', style: FONT, x: HALF + 8, y: -HALF });
  const marker = new Container();
  marker.addChild(bracket, label);
  marker.visible = false;

  // Speed and Stop
  const speedText = new Text({ text: '', style: { ...FONT, fontSize: 16, letterSpacing: 2 }, anchor: { x: 0.5, y: 1 } });
  const stopButton = new Text({ text: '[ STOP ]', style: { ...FONT, fontSize: 16, letterSpacing: 2 }, anchor: { x: 0.5, y: 1 } });
  stopButton.eventMode = 'static';
  stopButton.cursor = 'pointer';
  stopButton.on('pointertap', () => {
    if (sim.state.warp.phase !== 'idle') return; // ignored during Warp, so it makes no sound either
    sim.command({ type: 'stop' });
    onTick('command');
  });

  // Warp: shown only while a Warp to the selection would be accepted
  const warpButton = new Text({ text: '', style: { ...FONT, fontSize: 16, letterSpacing: 2 }, anchor: { x: 0.5, y: 1 } });
  warpButton.eventMode = 'static';
  warpButton.cursor = 'pointer';
  warpButton.on('pointertap', () => {
    if (!selectedId || !sim.canWarp(selectedId)) return;
    sim.command({ type: 'warp', target: selectedId });
    onTick('command');
  });
  const statusText = new Text({ text: '', style: { ...FONT, fontSize: 16, letterSpacing: 6 }, anchor: { x: 0.5, y: 0 } });

  app.stage.addChild(marker, overview, speedText, stopButton, warpButton, statusText);

  function select(id: string | null): void {
    if (id && id !== selectedId) onTick('select');
    selectedId = id || null;
  }

  const world = new Vector3();
  const screen = new Point();

  return {
    select,
    update() {
      const state = sim.state;
      const grid = SYSTEM.celestials.find((c) => c.id === state.grid)!;
      const { width, height } = app.screen;
      overview.position.set(width - PANEL_WIDTH - 16, 16);
      speedText.position.set(width / 2, height - 56);
      stopButton.position.set(width / 2, height - 24);
      speedText.text = state.warp.phase === 'tunnel' ? 'WARP' : `${Math.round(state.speed)} m/s`;
      statusText.text = STATUS[state.warp.phase];
      statusText.position.set(width / 2, 96);
      // A Contact that has gone takes the selection with it.
      if (selectedId && !selectedCelestial() && !state.contacts.some((c) => c.id === selectedId)) selectedId = null;
      const selected = selectedCelestial();
      // canWarp is false for a Contact, so a selected Contact never offers a Warp.
      warpButton.visible = selected !== null && sim.canWarp(selected.id);
      if (warpButton.visible) warpButton.text = `[ WARP TO ${selected!.name.toUpperCase()} ]`;
      warpButton.position.set(width / 2, height - 88);
      stopButton.alpha = state.warp.phase === 'idle' ? 1 : 0.3; // Stop is ignored during Warp

      for (const r of rows) {
        const v = fromShip(r.celestial, grid, state.position);
        r.distance.text = formatDistance(Math.hypot(v.x, v.y, v.z));
      }
      contactRows.forEach((r, i) => {
        const contact = state.contacts[i];
        r.row.visible = contact !== undefined;
        r.id = contact?.id ?? '';
        if (contact) r.distance.text = formatDistance(contact.distance);
      });
      for (const r of allRows) r.highlight.visible = r.id !== '' && r.id === selectedId;
      drawPanel(rows.length + state.contacts.length);

      marker.visible = false;
      if (!selected) return; // nothing selected, or a Contact: it has no place in space to bracket
      const v = fromShip(selected, grid, state.position);
      const distance = Math.hypot(v.x, v.y, v.z);
      if (distance <= LOCAL_RANGE) {
        world.set(v.x, v.y, v.z); // the Ship is at the origin, so this is already world space
      } else {
        const far = IMPOSTOR_RANGE / distance; // where its impostor sits
        world.set(v.x * far, v.y * far, v.z * far);
      }
      const point = view3d.worldToScreen(world, screen);
      if (!point || point.x < 0 || point.y < 0 || point.x > width || point.y > height) return;
      marker.position.copyFrom(point);
      label.text = `${selected.name}\n${formatDistance(distance)}`;
      marker.visible = true;
    },
  };
}
