// examples/mixed-layout.ts - Medium complexity (Mixed layout)

import { SheetBuilder } from '../builders/SheetBuilder';

export const twilightSheet = SheetBuilder.create('twilight-main')
  .name('Command Sheet')
  .size(1000, 1400)
  .backgroundColor('#2C3E50')
  .addGridRegion(
    'tech-tree',
    3, // rows
    4, // cols
    60, // cell size
    { x: 50, y: 50 },
    ['checkbox', 'circle']
  )
  .addFreeformRegion(
    'resource-tracks',
    // Linear resource tracks
    Array.from({ length: 10 }, (_, i) => ({
      id: `water-${i}`,
      shape: 'rect' as const,
      position: { x: 100 + i * 45, y: 300 },
      size: { width: 40, height: 40 },
      allowedMarkTypes: ['fill', 'number'] as const,
      maxMarks: 1,
    }))
  )
  .addFreeformRegion(
    'energy-track',
    // Energy resource track
    Array.from({ length: 10 }, (_, i) => ({
      id: `energy-${i}`,
      shape: 'rect' as const,
      position: { x: 100 + i * 45, y: 360 },
      size: { width: 40, height: 40 },
      allowedMarkTypes: ['fill', 'number'] as const,
      maxMarks: 1,
    }))
  )
  .addFreeformRegion('planet-map', [
    // Irregular shaped regions
    {
      id: 'region-alpha',
      shape: 'polygon',
      position: { x: 500, y: 600 },
      points: [
        { x: 500, y: 600 },
        { x: 580, y: 620 },
        { x: 560, y: 700 },
        { x: 480, y: 680 },
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 1,
    },
    {
      id: 'region-beta',
      shape: 'polygon',
      position: { x: 600, y: 600 },
      points: [
        { x: 600, y: 600 },
        { x: 680, y: 620 },
        { x: 660, y: 700 },
        { x: 580, y: 680 },
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 1,
    },
    {
      id: 'region-gamma',
      shape: 'polygon',
      position: { x: 700, y: 600 },
      points: [
        { x: 700, y: 600 },
        { x: 780, y: 620 },
        { x: 760, y: 700 },
        { x: 680, y: 680 },
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 1,
    },
  ])
  .addGridRegion(
    'victory-points',
    5, // rows
    2, // cols
    50, // cell size
    { x: 50, y: 1200 },
    ['number', 'checkbox']
  )
  .build();
