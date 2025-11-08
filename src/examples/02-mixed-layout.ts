import { SheetBuilder } from '../builders/SheetBuilder';

// More complex sheet with multiple regions and different mark types
export const mixedLayoutSheet = SheetBuilder.create('demo-mixed')
  .name('Demo: Mixed Layout')
  .size(800, 1000)
  .backgroundColor('#F0F4F8')
  .addGridRegion(
    'number-grid',
    5, // rows
    5, // cols
    60, // cell size
    { x: 50, y: 50 },
    ['number', 'pencil'],
    5 // gap
  )
  .addGridRegion(
    'checkbox-grid',
    3, // rows
    4, // cols
    50, // cell size
    { x: 450, y: 50 },
    ['checkbox'],
    8 // gap
  )
  .addGridRegion(
    'circle-track',
    1, // rows
    10, // cols
    40, // cell size
    { x: 50, y: 450 },
    ['circle'],
    5 // gap
  )
  .addFreeformRegion('resource-pools', [
    {
      id: 'water-pool',
      shape: 'circle',
      position: { x: 100, y: 600 },
      radius: 50,
      allowedMarkTypes: ['fill', 'number'],
      maxMarks: 1,
    },
    {
      id: 'energy-pool',
      shape: 'circle',
      position: { x: 250, y: 600 },
      radius: 50,
      allowedMarkTypes: ['fill', 'number'],
      maxMarks: 1,
    },
    {
      id: 'crystal-pool',
      shape: 'circle',
      position: { x: 400, y: 600 },
      radius: 50,
      allowedMarkTypes: ['fill', 'number'],
      maxMarks: 1,
    },
  ])
  .addFreeformRegion('special-zones', [
    {
      id: 'bonus-zone',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 550, y: 450 },
        { x: 750, y: 450 },
        { x: 750, y: 550 },
        { x: 550, y: 550 },
      ],
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 2,
    },
  ])
  .build();
