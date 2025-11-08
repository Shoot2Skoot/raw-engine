import { describe, test, expect } from 'vitest';
import { Geometry } from '../../src/utils/geometry';
import type { Hotspot } from '../../src/engine/types';

describe('Geometry utilities', () => {
  describe('pointInRect', () => {
    test('point inside rectangle', () => {
      const rect: Hotspot = {
        id: 'test',
        shape: 'rect',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        allowedMarkTypes: []
      };

      expect(Geometry.pointInRect({ x: 50, y: 50 }, rect)).toBe(true);
    });

    test('point outside rectangle', () => {
      const rect: Hotspot = {
        id: 'test',
        shape: 'rect',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        allowedMarkTypes: []
      };

      expect(Geometry.pointInRect({ x: 150, y: 50 }, rect)).toBe(false);
    });

    test('point on edge of rectangle', () => {
      const rect: Hotspot = {
        id: 'test',
        shape: 'rect',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        allowedMarkTypes: []
      };

      expect(Geometry.pointInRect({ x: 100, y: 50 }, rect)).toBe(true);
      expect(Geometry.pointInRect({ x: 0, y: 0 }, rect)).toBe(true);
    });
  });

  describe('pointInCircle', () => {
    test('point inside circle', () => {
      const circle: Hotspot = {
        id: 'test',
        shape: 'circle',
        position: { x: 50, y: 50 },
        radius: 25,
        allowedMarkTypes: []
      };

      expect(Geometry.pointInCircle({ x: 50, y: 50 }, circle)).toBe(true);
      expect(Geometry.pointInCircle({ x: 60, y: 60 }, circle)).toBe(true);
    });

    test('point outside circle', () => {
      const circle: Hotspot = {
        id: 'test',
        shape: 'circle',
        position: { x: 50, y: 50 },
        radius: 25,
        allowedMarkTypes: []
      };

      expect(Geometry.pointInCircle({ x: 100, y: 100 }, circle)).toBe(false);
    });

    test('point on circle edge', () => {
      const circle: Hotspot = {
        id: 'test',
        shape: 'circle',
        position: { x: 50, y: 50 },
        radius: 25,
        allowedMarkTypes: []
      };

      expect(Geometry.pointInCircle({ x: 75, y: 50 }, circle)).toBe(true);
    });
  });

  describe('pointInPolygon', () => {
    test('point inside polygon', () => {
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
    });

    test('point outside polygon', () => {
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

      expect(Geometry.pointInPolygon({ x: 150, y: 50 }, polygon)).toBe(false);
    });

    test('point in triangle', () => {
      const triangle: Hotspot = {
        id: 'test',
        shape: 'polygon',
        position: { x: 0, y: 0 },
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 }
        ],
        allowedMarkTypes: []
      };

      expect(Geometry.pointInPolygon({ x: 50, y: 40 }, triangle)).toBe(true);
      expect(Geometry.pointInPolygon({ x: 10, y: 90 }, triangle)).toBe(false);
    });
  });

  describe('generateGridHotspots', () => {
    test('generates correct number of hotspots', () => {
      const hotspots = Geometry.generateGridHotspots(
        {
          type: 'grid',
          rows: 3,
          cols: 4,
          cellSize: 50,
          origin: { x: 0, y: 0 }
        },
        ['number']
      );

      expect(hotspots).toHaveLength(12); // 3 rows * 4 cols
    });

    test('generates hotspots with correct positions', () => {
      const hotspots = Geometry.generateGridHotspots(
        {
          type: 'grid',
          rows: 2,
          cols: 2,
          cellSize: 50,
          gap: 10,
          origin: { x: 100, y: 200 }
        },
        ['number']
      );

      expect(hotspots[0].position).toEqual({ x: 100, y: 200 });
      expect(hotspots[1].position).toEqual({ x: 160, y: 200 }); // 100 + 50 + 10
      expect(hotspots[2].position).toEqual({ x: 100, y: 260 }); // 200 + 50 + 10
    });

    test('generates hotspots with correct IDs', () => {
      const hotspots = Geometry.generateGridHotspots(
        {
          type: 'grid',
          rows: 2,
          cols: 2,
          cellSize: 50,
          origin: { x: 0, y: 0 }
        },
        ['number']
      );

      expect(hotspots[0].id).toBe('cell-0-0');
      expect(hotspots[1].id).toBe('cell-0-1');
      expect(hotspots[2].id).toBe('cell-1-0');
      expect(hotspots[3].id).toBe('cell-1-1');
    });
  });

  describe('isPointInHotspot', () => {
    test('dispatches to correct shape handler', () => {
      const rectHotspot: Hotspot = {
        id: 'test',
        shape: 'rect',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        allowedMarkTypes: []
      };

      expect(Geometry.isPointInHotspot({ x: 50, y: 50 }, rectHotspot)).toBe(true);
      expect(Geometry.isPointInHotspot({ x: 150, y: 50 }, rectHotspot)).toBe(false);
    });

    test('handles point hotspot with threshold', () => {
      const pointHotspot: Hotspot = {
        id: 'test',
        shape: 'point',
        position: { x: 50, y: 50 },
        allowedMarkTypes: []
      };

      // Within threshold (20px)
      expect(Geometry.isPointInHotspot({ x: 55, y: 55 }, pointHotspot)).toBe(true);
      // Outside threshold
      expect(Geometry.isPointInHotspot({ x: 80, y: 80 }, pointHotspot)).toBe(false);
    });
  });
});
