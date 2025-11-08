import type { SheetDefinition, Region, Hotspot, Point, MarkType } from '../engine/types';
import { Geometry } from '../utils/geometry';

/**
 * Fluent API for building sheet definitions
 */
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
   * Set the sheet name
   */
  name(name: string): this {
    this.definition.name = name;
    return this;
  }

  /**
   * Set the sheet dimensions
   */
  size(width: number, height: number): this {
    this.definition.width = width;
    this.definition.height = height;
    return this;
  }

  /**
   * Set background image
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
   * Add a grid region with auto-generated hotspots
   */
  addGridRegion(
    id: string,
    rows: number,
    cols: number,
    cellSize: number,
    origin: Point,
    allowedMarks: MarkType[],
    gap: number = 0
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
        gap
      },
      hotspots: Geometry.generateGridHotspots(
        { type: 'grid', rows, cols, cellSize, origin, gap },
        allowedMarks
      )
    };
    this.definition.regions!.push(region);
    return this;
  }

  /**
   * Add a freeform region with custom hotspots
   */
  addFreeformRegion(id: string, hotspots: Hotspot[]): this {
    const region: Region = {
      id,
      type: 'freeform',
      hotspots
    };
    this.definition.regions!.push(region);
    return this;
  }

  /**
   * Add a hotspot to an existing region
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
   * Set metadata for the sheet
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

    return this.definition as SheetDefinition;
  }
}
