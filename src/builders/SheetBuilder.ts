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

  addHotspot(regionId: string, hotspot: Hotspot): this {
    const region = this.definition.regions!.find(r => r.id === regionId);
    if (region) {
      if (!region.hotspots) region.hotspots = [];
      region.hotspots.push(hotspot);
    }
    return this;
  }

  // Convenience method for adding a rectangular hotspot
  addRectHotspot(
    regionId: string,
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    allowedMarks: MarkType[]
  ): this {
    return this.addHotspot(regionId, {
      id,
      shape: 'rect',
      position: { x, y },
      size: { width, height },
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    });
  }

  // Convenience method for adding a circular hotspot
  addCircleHotspot(
    regionId: string,
    id: string,
    x: number,
    y: number,
    radius: number,
    allowedMarks: MarkType[]
  ): this {
    return this.addHotspot(regionId, {
      id,
      shape: 'circle',
      position: { x, y },
      radius,
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    });
  }

  // Convenience method for adding a polygon hotspot
  addPolygonHotspot(
    regionId: string,
    id: string,
    points: Point[],
    allowedMarks: MarkType[]
  ): this {
    return this.addHotspot(regionId, {
      id,
      shape: 'polygon',
      position: points[0], // First point as reference
      points,
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    });
  }

  metadata(metadata: Record<string, unknown>): this {
    this.definition.metadata = metadata;
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
