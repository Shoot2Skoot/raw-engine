/**
 * SheetBuilder - Fluent API for creating sheet definitions
 */

import type { SheetDefinition, Region, Hotspot, Point, MarkType } from '../engine/types';
import { Geometry } from '../utils/geometry';

export class SheetBuilder {
  private definition: Partial<SheetDefinition> = {
    regions: []
  };

  static create(id: string): SheetBuilder {
    const builder = new SheetBuilder();
    builder.definition.id = id;
    return builder;
  }

  name(name: string): this {
    this.definition.name = name;
    return this;
  }

  size(width: number, height: number): this {
    this.definition.width = width;
    this.definition.height = height;
    return this;
  }

  background(imageUrl: string): this {
    this.definition.backgroundImage = imageUrl;
    return this;
  }

  backgroundColor(color: string): this {
    this.definition.backgroundColor = color;
    return this;
  }

  /**
   * Add a grid region (auto-generates hotspots)
   */
  addGridRegion(
    id: string,
    rows: number,
    cols: number,
    cellSize: number,
    origin: Point,
    allowedMarks: MarkType[],
    options?: { gap?: number; zIndex?: number }
  ): this {
    const region: Region = {
      id,
      type: 'grid',
      layout: {
        type: 'grid',
        rows,
        cols,
        cellSize,
        origin,
        gap: options?.gap
      },
      hotspots: Geometry.generateGridHotspots(
        {
          type: 'grid',
          rows,
          cols,
          cellSize,
          origin,
          gap: options?.gap
        },
        allowedMarks
      ),
      zIndex: options?.zIndex
    };
    this.definition.regions!.push(region);
    return this;
  }

  /**
   * Add a freeform region (manually specify hotspots)
   */
  addFreeformRegion(id: string, hotspots: Hotspot[], zIndex?: number): this {
    const region: Region = {
      id,
      type: 'freeform',
      hotspots,
      zIndex
    };
    this.definition.regions!.push(region);
    return this;
  }

  /**
   * Add a single hotspot to an existing region
   */
  addHotspot(regionId: string, hotspot: Hotspot): this {
    const region = this.definition.regions!.find(r => r.id === regionId);
    if (region) {
      if (!region.hotspots) region.hotspots = [];
      region.hotspots.push(hotspot);
    } else {
      console.warn(`Region ${regionId} not found`);
    }
    return this;
  }

  /**
   * Add metadata to the sheet
   */
  metadata(metadata: Record<string, unknown>): this {
    this.definition.metadata = metadata;
    return this;
  }

  /**
   * Build and validate the sheet definition
   */
  build(): SheetDefinition {
    if (!this.definition.id || !this.definition.width || !this.definition.height) {
      throw new Error('Sheet must have id, width, and height');
    }

    if (!this.definition.name) {
      this.definition.name = this.definition.id;
    }

    if (!this.definition.regions || this.definition.regions.length === 0) {
      console.warn('Sheet has no regions defined');
    }

    return this.definition as SheetDefinition;
  }

  /**
   * Helper: Create a rectangular hotspot
   */
  static rect(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    allowedMarks: MarkType[]
  ): Hotspot {
    return {
      id,
      shape: 'rect',
      position: { x, y },
      size: { width, height },
      allowedMarkTypes: allowedMarks
    };
  }

  /**
   * Helper: Create a circular hotspot
   */
  static circle(
    id: string,
    x: number,
    y: number,
    radius: number,
    allowedMarks: MarkType[]
  ): Hotspot {
    return {
      id,
      shape: 'circle',
      position: { x, y },
      radius,
      allowedMarkTypes: allowedMarks
    };
  }

  /**
   * Helper: Create a polygon hotspot
   */
  static polygon(
    id: string,
    points: Point[],
    allowedMarks: MarkType[]
  ): Hotspot {
    return {
      id,
      shape: 'polygon',
      position: points[0], // First point as reference
      points,
      allowedMarkTypes: allowedMarks
    };
  }

  /**
   * Helper: Create a point hotspot
   */
  static point(
    id: string,
    x: number,
    y: number,
    allowedMarks: MarkType[]
  ): Hotspot {
    return {
      id,
      shape: 'point',
      position: { x, y },
      allowedMarkTypes: allowedMarks
    };
  }
}
