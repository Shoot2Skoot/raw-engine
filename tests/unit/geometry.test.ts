/**
 * Unit tests for geometry utilities
 */

import { describe, test, expect } from 'vitest';
import { Geometry } from '../../src/utils/geometry';
import { Hotspot } from '../../src/engine/types';

describe('Geometry utilities', () => {
  describe('pointInRect', () => {
    test('detects point inside rectangle', () => {
      const rect: Hotspot = {
        id: 'test-rect',
        shape: 'rect',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        allowedMarkTypes: []
      };

      expect(Geometry.pointInRect({ x: 50, y: 50 }, rect)).toBe(true);
      expect(Geometry.pointInRect({ x: 0, y: 0 }, rect)).toBe(true);
      expect(Geometry.pointInRect({ x: 100, y: 100 }, rect)).toBe(true);
    });

    test('detects point outside rectangle', () => {
      const rect: Hotspot = {
        id: 'test-rect',
        shape: 'rect',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        allowedMarkTypes: []
      };

      expect(Geometry.pointInRect({ x: 150, y: 50 }, rect)).toBe(false);
      expect(Geometry.pointInRect({ x: -10, y: 50 }, rect)).toBe(false);
      expect(Geometry.pointInRect({ x: 50, y: 150 }, rect)).toBe(false);
    });
  });

  describe('pointInCircle', () => {
    test('detects point inside circle', () => {
      const circle: Hotspot = {
        id: 'test-circle',
        shape: 'circle',
        position: { x: 50, y: 50 },
        radius: 25,
        allowedMarkTypes: []
      };

      expect(Geometry.pointInCircle({ x: 50, y: 50 }, circle)).toBe(true);
      expect(Geometry.pointInCircle({ x: 60, y: 50 }, circle)).toBe(true);
    });

    test('detects point outside circle', () => {
      const circle: Hotspot = {
        id: 'test-circle',
        shape: 'circle',
        position: { x: 50, y: 50 },
        radius: 25,
        allowedMarkTypes: []
      };

      expect(Geometry.pointInCircle({ x: 100, y: 50 }, circle)).toBe(false);
      expect(Geometry.pointInCircle({ x: 0, y: 0 }, circle)).toBe(false);
    });
  });

  describe('pointInPolygon', () => {
    test('detects point inside polygon', () => {
      const polygon: Hotspot = {
        id: 'test-polygon',
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

    test('detects point outside polygon', () => {
      const polygon: Hotspot = {
        id: 'test-polygon',
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
      expect(Geometry.pointInPolygon({ x: -10, y: 50 }, polygon)).toBe(false);
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
          cellSize: 100,
          origin: { x: 10, y: 20 }
        },
        ['number']
      );

      expect(hotspots[0].position).toEqual({ x: 10, y: 20 });
      expect(hotspots[1].position).toEqual({ x: 110, y: 20 });
      expect(hotspots[2].position).toEqual({ x: 10, y: 120 });
      expect(hotspots[3].position).toEqual({ x: 110, y: 120 });
    });

    test('generates hotspots with correct size', () => {
      const hotspots = Geometry.generateGridHotspots(
        {
          type: 'grid',
          rows: 1,
          cols: 1,
          cellSize: 75,
          origin: { x: 0, y: 0 }
        },
        ['number']
      );

      expect(hotspots[0].size).toEqual({ width: 75, height: 75 });
    });
  });

  describe('distance', () => {
    test('calculates distance between two points', () => {
      expect(Geometry.distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(Geometry.distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
    });
  });

  describe('getBoundingBox', () => {
    test('calculates bounding box for points', () => {
      const points = [
        { x: 10, y: 20 },
        { x: 50, y: 30 },
        { x: 30, y: 60 }
      ];

      const bbox = Geometry.getBoundingBox(points);
      expect(bbox.min).toEqual({ x: 10, y: 20 });
      expect(bbox.max).toEqual({ x: 50, y: 60 });
    });

    test('handles empty array', () => {
      const bbox = Geometry.getBoundingBox([]);
      expect(bbox.min).toEqual({ x: 0, y: 0 });
      expect(bbox.max).toEqual({ x: 0, y: 0 });
    });
  });
});
