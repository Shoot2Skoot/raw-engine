// examples/02-mixed-layout.ts

import { SheetBuilder } from '../builders/SheetBuilder';
import type { MarkType } from '../engine/types';

export const mixedLayoutSheet = SheetBuilder.create('mixed-demo')
  .name('Mixed Layout Demo')
  .size(800, 1000)
  .backgroundColor('#FFFFFF')
  .addGridRegion(
    'checkbox-grid',
    3,  // rows
    4,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['checkbox', 'circle'] as MarkType[],
    5   // gap
  )
  .addGridRegion(
    'number-grid',
    2,  // rows
    5,  // cols
    50, // cell size
    { x: 50, y: 300 },
    ['number'] as MarkType[],
    8   // gap
  )
  .addFreeformRegion('custom-regions', [
    // Circle hotspot
    {
      id: 'circle-1',
      shape: 'circle',
      position: { x: 500, y: 100 },
      radius: 40,
      allowedMarkTypes: ['fill', 'symbol'] as MarkType[],
      maxMarks: 1
    },
    // Rectangle hotspot
    {
      id: 'rect-1',
      shape: 'rect',
      position: { x: 450, y: 200 },
      size: { width: 100, height: 80 },
      allowedMarkTypes: ['text', 'number'] as MarkType[],
      maxMarks: 1
    },
    // Polygon hotspot (triangle)
    {
      id: 'poly-1',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 500, y: 400 },
        { x: 600, y: 400 },
        { x: 550, y: 320 }
      ],
      allowedMarkTypes: ['checkbox', 'fill'] as MarkType[],
      maxMarks: 1
    }
  ])
  .addGridRegion(
    'fill-track',
    1,  // rows
    10, // cols
    40, // cell size
    { x: 50, y: 600 },
    ['fill'] as MarkType[],
    5   // gap
  )
  .build();
