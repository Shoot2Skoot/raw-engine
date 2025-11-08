// examples/mixed-layout.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const mixedLayoutSheet = SheetBuilder.create('mixed-layout')
  .name('Mixed Layout Demo')
  .size(800, 1000)
  .backgroundColor('#E8F4F8')
  .addGridRegion(
    'score-grid',
    3, // rows
    4, // cols
    60, // cell size
    { x: 50, y: 50 },
    ['checkbox', 'circle']
  )
  .addFreeformRegion('resource-tracks', [
    // Water track - horizontal line of cells
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `water-${i}`,
      shape: 'rect' as const,
      position: { x: 50 + i * 45, y: 300 },
      size: { width: 40, height: 40 },
      allowedMarkTypes: ['fill', 'checkbox'] as Array<'fill' | 'checkbox'>,
      maxMarks: 1,
    })),
    // Energy track - vertical line of cells
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `energy-${i}`,
      shape: 'rect' as const,
      position: { x: 600, y: 50 + i * 45 },
      size: { width: 40, height: 40 },
      allowedMarkTypes: ['number'] as Array<'number'>,
      maxMarks: 1,
    })),
  ])
  .addFreeformRegion('special-zones', [
    {
      id: 'bonus-circle',
      shape: 'circle',
      position: { x: 400, y: 500 },
      radius: 50,
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 2,
    },
    {
      id: 'polygon-zone',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 200, y: 700 },
        { x: 300, y: 680 },
        { x: 320, y: 780 },
        { x: 220, y: 800 },
      ],
      allowedMarkTypes: ['checkbox', 'number'],
      maxMarks: 1,
    },
  ])
  .build();
