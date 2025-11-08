// examples/03-mixed-layout.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const twilightSheet = SheetBuilder.create('twilight-main')
  .name('Command Sheet')
  .size(1000, 1400)
  .backgroundColor('#f5f5dc')
  .addGridRegion(
    'tech-tree',
    3,  // rows
    4,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['checkbox', 'circle']
  )
  .addFreeformRegion('resource-tracks',
    // Linear resource tracks
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
    // Irregular shaped regions
    {
      id: 'region-alpha',
      shape: 'polygon',
      position: { x: 530, y: 650 },
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
      position: { x: 630, y: 650 },
      points: [
        { x: 600, y: 600 },
        { x: 680, y: 620 },
        { x: 660, y: 700 },
        { x: 580, y: 680 }
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 3
    }
  ])
  .build();
