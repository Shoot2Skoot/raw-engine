// examples/02-mixed-layout.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const demoSheet = SheetBuilder.create('demo')
  .name('Demo Game Sheet')
  .size(800, 1000)
  .backgroundColor('#FAFAFA')
  .addGridRegion(
    'number-grid',
    5,  // rows
    5,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['number', 'pencil'],
    5   // gap
  )
  .addGridRegion(
    'checkbox-track',
    1,  // rows
    10, // cols
    40, // cell size
    { x: 50, y: 450 },
    ['checkbox']
  )
  .addGridRegion(
    'circle-track',
    1,  // rows
    10, // cols
    40, // cell size
    { x: 50, y: 550 },
    ['circle']
  )
  .addFreeformRegion('special-areas', [
    {
      id: 'bonus-1',
      shape: 'circle',
      position: { x: 600, y: 100 },
      radius: 40,
      allowedMarkTypes: ['fill', 'symbol'],
      maxMarks: 1
    },
    {
      id: 'bonus-2',
      shape: 'circle',
      position: { x: 700, y: 100 },
      radius: 40,
      allowedMarkTypes: ['fill', 'symbol'],
      maxMarks: 1
    },
    {
      id: 'text-area',
      shape: 'rect',
      position: { x: 550, y: 200 },
      size: { width: 200, height: 150 },
      allowedMarkTypes: ['text'],
      maxMarks: 1
    },
    {
      id: 'polygon-area',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 550, y: 400 },
        { x: 700, y: 400 },
        { x: 750, y: 500 },
        { x: 700, y: 600 },
        { x: 550, y: 600 },
        { x: 500, y: 500 }
      ],
      allowedMarkTypes: ['fill'],
      maxMarks: 1
    }
  ])
  .build();
