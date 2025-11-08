// tests/unit/geometry.test.ts

import { describe, test, expect } from 'vitest';
import { Geometry } from '../../utils/geometry';
import type { Hotspot } from '../../engine/types';

describe('Geometry utilities', () => {
  test('point in rectangle detection', () => {
    const rect: Hotspot = {
      id: 'test',
      shape: 'rect',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      allowedMarkTypes: []
    };

    expect(Geometry.pointInRect({ x: 50, y: 50 }, rect)).toBe(true);
    expect(Geometry.pointInRect({ x: 0, y: 0 }, rect)).toBe(true);
    expect(Geometry.pointInRect({ x: 100, y: 100 }, rect)).toBe(true);
    expect(Geometry.pointInRect({ x: 150, y: 50 }, rect)).toBe(false);
    expect(Geometry.pointInRect({ x: -10, y: 50 }, rect)).toBe(false);
  });

  test('point in circle detection', () => {
    const circle: Hotspot = {
      id: 'test',
      shape: 'circle',
      position: { x: 50, y: 50 },
      radius: 25,
      allowedMarkTypes: []
    };

    expect(Geometry.pointInCircle({ x: 50, y: 50 }, circle)).toBe(true);
    expect(Geometry.pointInCircle({ x: 60, y: 50 }, circle)).toBe(true);
    expect(Geometry.pointInCircle({ x: 100, y: 50 }, circle)).toBe(false);
  });

  test('point in polygon detection', () => {
    const polygon: Hotspot = {
      id: 'test',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ],
      allowedMarkTypes: []
    };

    expect(Geometry.pointInPolygon({ x: 50, y: 50 }, polygon)).toBe(true);
    expect(Geometry.pointInPolygon({ x: 0, y: 0 }, polygon)).toBe(true);
    expect(Geometry.pointInPolygon({ x: 150, y: 50 }, polygon)).toBe(false);
  });

  test('generate grid hotspots', () => {
    const hotspots = Geometry.generateGridHotspots(
      {
        type: 'grid',
        rows: 2,
        cols: 3,
        cellSize: 50,
        origin: { x: 0, y: 0 }
      },
      ['number']
    );

    expect(hotspots).toHaveLength(6); // 2 rows x 3 cols
    expect(hotspots[0].id).toBe('cell-0-0');
    expect(hotspots[0].position).toEqual({ x: 0, y: 0 });
    expect(hotspots[0].size).toEqual({ width: 50, height: 50 });
  });
});
