// utils/coordinates.ts

import type { Point } from '../engine/types';

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

  /**
   * Get point from mouse event
   */
  static getPointFromMouseEvent(
    event: MouseEvent | React.MouseEvent,
    svgElement: SVGSVGElement
  ): Point {
    return this.screenToSheet(
      { x: event.clientX, y: event.clientY },
      svgElement
    );
  }

  /**
   * Get point from touch event (uses first touch)
   */
  static getPointFromTouchEvent(
    event: TouchEvent | React.TouchEvent,
    svgElement: SVGSVGElement
  ): Point | null {
    if (event.touches.length === 0) return null;
    const touch = event.touches[0];
    return this.screenToSheet(
      { x: touch.clientX, y: touch.clientY },
      svgElement
    );
  }

  /**
   * Get point from pointer event (unified mouse/touch)
   */
  static getPointFromPointerEvent(
    event: PointerEvent | React.PointerEvent,
    svgElement: SVGSVGElement
  ): Point {
    return this.screenToSheet(
      { x: event.clientX, y: event.clientY },
      svgElement
    );
  }
}
