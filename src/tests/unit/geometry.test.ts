/**
 * Unit tests for geometry utilities
 */

import { describe, test, expect } from 'vitest';
import { Geometry } from '../../utils/geometry';
import type { Hotspot } from '../../engine/types';

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

    test('point on rectangle edge', () => {
      const rect: Hotspot = {
        id: 'test',
        shape: 'rect',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        allowedMarkTypes: []
      };

      expect(Geometry.pointInRect({ x: 100, y: 100 }, rect)).toBe(true);
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
  });

  describe('generateGridHotspots', () => {
    test('generates correct number of hotspots', () => {
      const hotspots = Geometry.generateGridHotspots(
        { type: 'grid', rows: 3, cols: 4, cellSize: 50, origin: { x: 0, y: 0 } },
        ['number']
      );

      expect(hotspots).toHaveLength(12);
    });

    test('generates hotspots with correct IDs', () => {
      const hotspots = Geometry.generateGridHotspots(
        { type: 'grid', rows: 2, cols: 2, cellSize: 50, origin: { x: 0, y: 0 } },
        ['number']
      );

      expect(hotspots[0].id).toBe('cell-0-0');
      expect(hotspots[1].id).toBe('cell-0-1');
      expect(hotspots[2].id).toBe('cell-1-0');
      expect(hotspots[3].id).toBe('cell-1-1');
    });

    test('respects gap parameter', () => {
      const hotspots = Geometry.generateGridHotspots(
        { type: 'grid', rows: 1, cols: 2, cellSize: 50, gap: 10, origin: { x: 0, y: 0 } },
        ['number']
      );

      expect(hotspots[0].position).toEqual({ x: 0, y: 0 });
      expect(hotspots[1].position).toEqual({ x: 60, y: 0 });
    });
  });
});
