import { SheetBuilder } from '../builders/SheetBuilder';

export const mixedLayoutSheet = SheetBuilder.create('mixed-demo')
  .name('Mixed Layout Demo')
  .size(1000, 800)
  .backgroundColor('#ffffff')
  .addGridRegion(
    'tech-tree',
    3,  // rows
    4,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['checkbox', 'circle'],
    { gap: 8, zIndex: 1 }
  )
  .addFreeformRegion('resource-tracks',
    // Create a linear resource track
    Array.from({ length: 10 }, (_, i) => ({
      id: `resource-${i}`,
      shape: 'rect' as const,
      position: { x: 100 + i * 45, y: 300 },
      size: { width: 40, height: 40 },
      allowedMarkTypes: ['fill' as const, 'number' as const],
      maxMarks: 1
    })),
    2
  )
  .addFreeformRegion('special-zones', [
    {
      id: 'bonus-zone',
      shape: 'polygon',
      position: { x: 600, y: 400 },
      points: [
        { x: 600, y: 400 },
        { x: 750, y: 400 },
        { x: 700, y: 550 },
        { x: 650, y: 550 }
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 3
    }
  ])
  .build();
