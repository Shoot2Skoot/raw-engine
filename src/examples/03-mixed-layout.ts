// examples/03-mixed-layout.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const twilightSheet = SheetBuilder.create('twilight-main')
  .name('Command Sheet')
  .size(1000, 1400)
  .backgroundColor('#E8E4D9')
  .addGridRegion(
    'tech-tree',
    3,  // rows
    4,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['checkbox', 'circle']
  )
  .addFreeformRegion('resource-tracks',
    // Generate a linear track of resource boxes
    Array.from({ length: 10 }, (_, i) => ({
      id: `water-${i}`,
      shape: 'rect' as const,
      position: { x: 100 + i * 45, y: 300 },
      size: { width: 40, height: 40 },
      allowedMarkTypes: ['fill', 'number'] as const,
      maxMarks: 1
    }))
  )
  .addFreeformRegion('planet-map', [
    // Irregular shaped regions using polygons
    {
      id: 'region-alpha',
      shape: 'polygon',
      position: { x: 500, y: 600 },
      points: [
        { x: 500, y: 600 },
        { x: 580, y: 620 },
        { x: 560, y: 700 },
        { x: 480, y: 680 }
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 3
    },
    {
      id: 'region-beta',
      shape: 'polygon',
      position: { x: 600, y: 600 },
      points: [
        { x: 600, y: 600 },
        { x: 680, y: 610 },
        { x: 690, y: 690 },
        { x: 610, y: 680 }
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 3
    }
  ])
  .addGridRegion(
    'scoring',
    5,
    2,
    50,
    { x: 50, y: 800 },
    ['number', 'checkbox']
  )
  .build();
