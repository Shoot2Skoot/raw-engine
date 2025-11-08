// utils/coordinates.ts - Coordinate system transformations

import type { Point } from '../engine/types';

export class CoordinateTransform {
  /**
   * Convert screen click to SVG sheet coordinates
   * Handles scaling, pan, zoom
   */
  static screenToSheet(screenPoint: Point, svgElement: SVGSVGElement): Point {
    const ctm = svgElement.getScreenCTM();
    if (!ctm) return screenPoint;

    const inverse = ctm.inverse();
    return {
      x: inverse.a * screenPoint.x + inverse.c * screenPoint.y + inverse.e,
      y: inverse.b * screenPoint.x + inverse.d * screenPoint.y + inverse.f,
    };
  }

  /**
   * Convert SVG sheet coordinates to screen coordinates
   * Useful for positioning overlays and tooltips
   */
  static sheetToScreen(sheetPoint: Point, svgElement: SVGSVGElement): Point {
    const ctm = svgElement.getScreenCTM();
    if (!ctm) return sheetPoint;

    return {
      x: ctm.a * sheetPoint.x + ctm.c * sheetPoint.y + ctm.e,
      y: ctm.b * sheetPoint.x + ctm.d * sheetPoint.y + ctm.f,
    };
  }

  /**
   * Get point from mouse or touch event
   */
  static getEventPoint(
    event: MouseEvent | TouchEvent | PointerEvent,
    svgElement: SVGSVGElement
  ): Point {
    let clientX: number;
    let clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return this.screenToSheet({ x: clientX, y: clientY }, svgElement);
  }

  /**
   * Calculate distance between two points
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
