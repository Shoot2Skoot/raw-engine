/**
 * Geometry utilities for hit detection and shape operations
 */

import type { Point, Hotspot, GridLayout, MarkType } from '../engine/types';

export class Geometry {
  /** Point-in-rectangle test (AABB) */
  static pointInRect(point: Point, rect: Hotspot): boolean {
    const { x, y } = point;
    const { position, size } = rect;
    if (!size) return false;

    return (
      x >= position.x &&
      x <= position.x + size.width &&
      y >= position.y &&
      y <= position.y + size.height
    );
  }

  /** Point-in-circle test */
  static pointInCircle(point: Point, circle: Hotspot): boolean {
    const { x, y } = point;
    const { position, radius } = circle;
    if (!radius) return false;

    const dx = x - position.x;
    const dy = y - position.y;
    return (dx * dx + dy * dy) <= (radius * radius);
  }

  /** Point-in-polygon test (ray casting algorithm) */
  static pointInPolygon(point: Point, polygon: Hotspot): boolean {
    const { points } = polygon;
    if (!points || points.length < 3) return false;

    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }
    return inside;
  }

  /** Main hit detection dispatcher */
  static isPointInHotspot(point: Point, hotspot: Hotspot): boolean {
    switch (hotspot.shape) {
      case 'rect':
        return this.pointInRect(point, hotspot);
      case 'circle':
        return this.pointInCircle(point, hotspot);
      case 'polygon':
        return this.pointInPolygon(point, hotspot);
      case 'point': {
        // Point hotspots have implicit 20px radius for clicks
        const threshold = 20;
        const dx = point.x - hotspot.position.x;
        const dy = point.y - hotspot.position.y;
        return (dx * dx + dy * dy) <= (threshold * threshold);
      }
    }
  }

  /** Generate grid hotspots from layout definition */
  static generateGridHotspots(
    gridLayout: GridLayout,
    allowedMarkTypes: MarkType[]
  ): Hotspot[] {
    const hotspots: Hotspot[] = [];
    const { rows, cols, cellSize, gap = 0, origin } = gridLayout;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        hotspots.push({
          id: `cell-${row}-${col}`,
          shape: 'rect',
          position: {
            x: origin.x + col * (cellSize + gap),
            y: origin.y + row * (cellSize + gap)
          },
          size: { width: cellSize, height: cellSize },
          allowedMarkTypes,
          maxMarks: 1
        });
      }
    }
    return hotspots;
  }

  /** Calculate center point of a hotspot */
  static getHotspotCenter(hotspot: Hotspot): Point {
    switch (hotspot.shape) {
      case 'rect':
        if (hotspot.size) {
          return {
            x: hotspot.position.x + hotspot.size.width / 2,
            y: hotspot.position.y + hotspot.size.height / 2
          };
        }
        return hotspot.position;

      case 'circle':
        return hotspot.position;

      case 'polygon':
        if (hotspot.points && hotspot.points.length > 0) {
          // Calculate centroid
          const sum = hotspot.points.reduce(
            (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
            { x: 0, y: 0 }
          );
          return {
            x: sum.x / hotspot.points.length,
            y: sum.y / hotspot.points.length
          };
        }
        return hotspot.position;

      case 'point':
        return hotspot.position;
    }
  }

  /** Get bounding box for a hotspot */
  static getHotspotBounds(hotspot: Hotspot): { min: Point; max: Point } {
    switch (hotspot.shape) {
      case 'rect':
        if (hotspot.size) {
          return {
            min: hotspot.position,
            max: {
              x: hotspot.position.x + hotspot.size.width,
              y: hotspot.position.y + hotspot.size.height
            }
          };
        }
        return { min: hotspot.position, max: hotspot.position };

      case 'circle':
        const r = hotspot.radius || 0;
        return {
          min: {
            x: hotspot.position.x - r,
            y: hotspot.position.y - r
          },
          max: {
            x: hotspot.position.x + r,
            y: hotspot.position.y + r
          }
        };

      case 'polygon':
        if (hotspot.points && hotspot.points.length > 0) {
          const xs = hotspot.points.map(p => p.x);
          const ys = hotspot.points.map(p => p.y);
          return {
            min: { x: Math.min(...xs), y: Math.min(...ys) },
            max: { x: Math.max(...xs), y: Math.max(...ys) }
          };
        }
        return { min: hotspot.position, max: hotspot.position };

      case 'point':
        const threshold = 20;
        return {
          min: {
            x: hotspot.position.x - threshold,
            y: hotspot.position.y - threshold
          },
          max: {
            x: hotspot.position.x + threshold,
            y: hotspot.position.y + threshold
          }
        };
    }
  }
}
