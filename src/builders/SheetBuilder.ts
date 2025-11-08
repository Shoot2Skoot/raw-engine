// builders/SheetBuilder.ts

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

  addGridRegion(
    id: string,
    rows: number,
    cols: number,
    cellSize: number,
    origin: Point,
    allowedMarks: MarkType[]
  ): this {
    const region: Region = {
      id,
      type: 'grid',
      layout: {
        type: 'grid',
        rows,
        cols,
        cellSize,
        origin
      },
      hotspots: Geometry.generateGridHotspots(
        { type: 'grid', rows, cols, cellSize, origin },
        allowedMarks
      )
    };
    this.definition.regions!.push(region);
    return this;
  }

  addFreeformRegion(id: string, hotspots: Hotspot[]): this {
    const region: Region = {
      id,
      type: 'freeform',
      hotspots
    };
    this.definition.regions!.push(region);
    return this;
  }

  addHotspot(regionId: string, hotspot: Hotspot): this {
    const region = this.definition.regions!.find(r => r.id === regionId);
    if (region) {
      if (!region.hotspots) region.hotspots = [];
      region.hotspots.push(hotspot);
    }
    return this;
  }

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
