// utils/coordinates.ts - Coordinate transformation utilities

import type { Point } from '../engine/types';

/**
 * Coordinate transformation utilities for converting between screen and SVG space
 */
export class CoordinateTransform {
  /**
   * Convert screen click to SVG sheet coordinates
   * Handles scaling, pan, zoom
   */
  static screenToSheet(
    screenPoint: Point,
    svgElement: SVGSVGElement
  ): Point {
    const ctm = svgElement.getScreenCTM();
    if (!ctm) return screenPoint;

    const inverse = ctm.inverse();
    return {
      x: inverse.a * screenPoint.x + inverse.c * screenPoint.y + inverse.e,
      y: inverse.b * screenPoint.x + inverse.d * screenPoint.y + inverse.f
    };
  }

  /**
   * Convert SVG sheet coordinates to screen coordinates
   * Useful for positioning UI elements relative to sheet elements
   */
  static sheetToScreen(
    sheetPoint: Point,
    svgElement: SVGSVGElement
  ): Point {
    const ctm = svgElement.getScreenCTM();
    if (!ctm) return sheetPoint;

    return {
      x: ctm.a * sheetPoint.x + ctm.c * sheetPoint.y + ctm.e,
      y: ctm.b * sheetPoint.x + ctm.d * sheetPoint.y + ctm.f
    };
  }
}
