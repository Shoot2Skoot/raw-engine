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
    allowedMarks: MarkType[],
    options?: { gap?: number; zIndex?: number }
  ): this {
    const layout: GridLayout = {
      type: 'grid',
      rows,
      cols,
      cellSize,
      gap: options?.gap,
      origin
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

  addRectHotspot(
    regionId: string,
    id: string,
    position: Point,
    width: number,
    height: number,
    allowedMarks: MarkType[]
  ): this {
    const hotspot: Hotspot = {
      id,
      shape: 'rect',
      position,
      size: { width, height },
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    };
    return this.addHotspot(regionId, hotspot);
  }

  addCircleHotspot(
    regionId: string,
    id: string,
    position: Point,
    radius: number,
    allowedMarks: MarkType[]
  ): this {
    const hotspot: Hotspot = {
      id,
      shape: 'circle',
      position,
      radius,
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    };
    return this.addHotspot(regionId, hotspot);
  }

  addPolygonHotspot(
    regionId: string,
    id: string,
    points: Point[],
    allowedMarks: MarkType[]
  ): this {
    const hotspot: Hotspot = {
      id,
      shape: 'polygon',
      position: points[0], // Use first point as reference
      points,
      allowedMarkTypes: allowedMarks,
      maxMarks: 1
    };
    return this.addHotspot(regionId, hotspot);
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
