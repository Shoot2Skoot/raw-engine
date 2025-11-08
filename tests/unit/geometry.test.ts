import { describe, it, expect } from 'vitest';
import { Geometry } from '../../src/utils/geometry';
import { Hotspot } from '../../src/engine/types';

describe('Geometry utilities', () => {
  describe('pointInRect', () => {
    it('should detect point inside rectangle', () => {
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
    });

    it('should detect point outside rectangle', () => {
      const rect: Hotspot = {
        id: 'test',
        shape: 'rect',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        allowedMarkTypes: []
      };

      expect(Geometry.pointInRect({ x: 150, y: 50 }, rect)).toBe(false);
      expect(Geometry.pointInRect({ x: -1, y: 50 }, rect)).toBe(false);
      expect(Geometry.pointInRect({ x: 50, y: 150 }, rect)).toBe(false);
    });
  });

  describe('pointInCircle', () => {
    it('should detect point inside circle', () => {
      const circle: Hotspot = {
        id: 'test',
        shape: 'circle',
        position: { x: 50, y: 50 },
        radius: 25,
        allowedMarkTypes: []
      };

      expect(Geometry.pointInCircle({ x: 50, y: 50 }, circle)).toBe(true);
      expect(Geometry.pointInCircle({ x: 60, y: 50 }, circle)).toBe(true);
      expect(Geometry.pointInCircle({ x: 50, y: 60 }, circle)).toBe(true);
    });

    it('should detect point outside circle', () => {
      const circle: Hotspot = {
        id: 'test',
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
    it('should detect point inside polygon', () => {
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
      expect(Geometry.pointInPolygon({ x: 10, y: 10 }, polygon)).toBe(true);
    });

    it('should detect point outside polygon', () => {
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
      expect(Geometry.pointInPolygon({ x: -10, y: 50 }, polygon)).toBe(false);
    });
  });

  describe('generateGridHotspots', () => {
    it('should generate correct number of hotspots', () => {
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

      expect(hotspots).toHaveLength(12); // 3 * 4
    });

    it('should generate hotspots with correct positions', () => {
      const hotspots = Geometry.generateGridHotspots(
        {
          type: 'grid',
          rows: 2,
          cols: 2,
          cellSize: 50,
          origin: { x: 100, y: 100 }
        },
        ['number']
      );

      expect(hotspots[0].position).toEqual({ x: 100, y: 100 });
      expect(hotspots[1].position).toEqual({ x: 150, y: 100 });
      expect(hotspots[2].position).toEqual({ x: 100, y: 150 });
      expect(hotspots[3].position).toEqual({ x: 150, y: 150 });
    });

    it('should respect gap parameter', () => {
      const hotspots = Geometry.generateGridHotspots(
        {
          type: 'grid',
          rows: 2,
          cols: 2,
          cellSize: 50,
          gap: 10,
          origin: { x: 0, y: 0 }
        },
        ['number']
      );

      expect(hotspots[0].position).toEqual({ x: 0, y: 0 });
      expect(hotspots[1].position).toEqual({ x: 60, y: 0 }); // 50 + 10 gap
      expect(hotspots[2].position).toEqual({ x: 0, y: 60 });
      expect(hotspots[3].position).toEqual({ x: 60, y: 60 });
    });
  });
});
