/**
 * Fluent API for building sheet definitions
 */

import type {
  SheetDefinition,
  Region,
  Hotspot,
  Point,
  MarkType,
  GridLayout
} from '../engine/types';
import { Geometry } from '../utils/geometry';

export class SheetBuilder {
  private definition: Partial<SheetDefinition> = {
    regions: []
  };

  /**
   * Create a new sheet builder
   */
  static create(id: string): SheetBuilder {
    const builder = new SheetBuilder();
    builder.definition.id = id;
    return builder;
  }

  /**
   * Set sheet name
   */
  name(name: string): this {
    this.definition.name = name;
    return this;
  }

  /**
   * Set sheet dimensions
   */
  size(width: number, height: number): this {
    this.definition.width = width;
    this.definition.height = height;
    return this;
  }

  /**
   * Set background image URL
   */
  background(imageUrl: string): this {
    this.definition.backgroundImage = imageUrl;
    return this;
  }

  /**
   * Set background color
   */
  backgroundColor(color: string): this {
    this.definition.backgroundColor = color;
    return this;
  }

  /**
   * Add metadata
   */
  metadata(key: string, value: unknown): this {
    if (!this.definition.metadata) {
      this.definition.metadata = {};
    }
    this.definition.metadata[key] = value;
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
    options?: {
      gap?: number;
      zIndex?: number;
    }
  ): this {
    const layout: GridLayout = {
      type: 'grid',
      rows,
      cols,
      cellSize,
      origin,
      gap: options?.gap
    };

    const region: Region = {
      id,
      type: 'grid',
      layout,
      hotspots: Geometry.generateGridHotspots(layout, allowedMarks),
      zIndex: options?.zIndex
    };

    this.definition.regions!.push(region);
    return this;
  }

  /**
   * Add a freeform region with custom hotspots
   */
  addFreeformRegion(
    id: string,
    hotspots: Hotspot[],
    options?: {
      zIndex?: number;
    }
  ): this {
    const region: Region = {
      id,
      type: 'freeform',
      hotspots,
      zIndex: options?.zIndex
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
    }
    return this;
  }

  /**
   * Add multiple hotspots to an existing region
   */
  addHotspots(regionId: string, hotspots: Hotspot[]): this {
    const region = this.definition.regions!.find(r => r.id === regionId);
    if (region) {
      if (!region.hotspots) region.hotspots = [];
      region.hotspots.push(...hotspots);
    }
    return this;
  }

  /**
   * Build and return the sheet definition
   */
  build(): SheetDefinition {
    if (!this.definition.id) {
      throw new Error('Sheet must have an id');
    }
    if (!this.definition.name) {
      throw new Error('Sheet must have a name');
    }
    if (!this.definition.width || !this.definition.height) {
      throw new Error('Sheet must have width and height');
    }
    if (!this.definition.regions || this.definition.regions.length === 0) {
      throw new Error('Sheet must have at least one region');
    }

    return this.definition as SheetDefinition;
  }
}

/**
 * Helper functions for creating common hotspot patterns
 */
export class HotspotHelpers {
  /**
   * Create a rectangular hotspot
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
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    };
  }

  /**
   * Create a circular hotspot
   */
  static circle(
    id: string,
    cx: number,
    cy: number,
    radius: number,
    allowedMarks: MarkType[]
  ): Hotspot {
    return {
      id,
      shape: 'circle',
      position: { x: cx, y: cy },
      radius,
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    };
  }

  /**
   * Create a polygon hotspot
   */
  static polygon(
    id: string,
    points: Point[],
    allowedMarks: MarkType[]
  ): Hotspot {
    return {
      id,
      shape: 'polygon',
      position: points[0], // Use first point as reference
      points,
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    };
  }

  /**
   * Create a point hotspot (for small clickable areas)
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
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    };
  }

  /**
   * Create a row of rectangular hotspots
   */
  static row(
    idPrefix: string,
    count: number,
    x: number,
    y: number,
    cellWidth: number,
    cellHeight: number,
    gap: number,
    allowedMarks: MarkType[]
  ): Hotspot[] {
    const hotspots: Hotspot[] = [];
    for (let i = 0; i < count; i++) {
      hotspots.push(
        this.rect(
          `${idPrefix}-${i}`,
          x + i * (cellWidth + gap),
          y,
          cellWidth,
          cellHeight,
          allowedMarks
        )
      );
    }
    return hotspots;
  }

  /**
   * Create a column of rectangular hotspots
   */
  static column(
    idPrefix: string,
    count: number,
    x: number,
    y: number,
    cellWidth: number,
    cellHeight: number,
    gap: number,
    allowedMarks: MarkType[]
  ): Hotspot[] {
    const hotspots: Hotspot[] = [];
    for (let i = 0; i < count; i++) {
      hotspots.push(
        this.rect(
          `${idPrefix}-${i}`,
          x,
          y + i * (cellHeight + gap),
          cellWidth,
          cellHeight,
          allowedMarks
        )
      );
    }
    return hotspots;
  }

  /**
   * Create a circular arrangement of hotspots
   */
  static circularArrangement(
    idPrefix: string,
    count: number,
    centerX: number,
    centerY: number,
    radius: number,
    hotspotRadius: number,
    allowedMarks: MarkType[]
  ): Hotspot[] {
    const hotspots: Hotspot[] = [];
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      hotspots.push(
        this.circle(`${idPrefix}-${i}`, x, y, hotspotRadius, allowedMarks)
      );
    }

    return hotspots;
  }
}
