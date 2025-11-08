// examples/02-mixed-layout.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const diceGameSheet = SheetBuilder.create('dice-game')
  .name('Dice Roll Sheet')
  .size(600, 800)
  .backgroundColor('#FFF9E6')
  .addGridRegion(
    'main-grid',
    5,  // rows
    5,  // cols
    80, // cell size
    { x: 100, y: 100 },
    ['number', 'checkbox', 'fill']
  )
  .addFreeformRegion('bonus-stars', [
    {
      id: 'star-1',
      shape: 'circle',
      position: { x: 80, y: 600 },
      radius: 30,
      allowedMarkTypes: ['checkbox', 'symbol'],
      maxMarks: 1
    },
    {
      id: 'star-2',
      shape: 'circle',
      position: { x: 180, y: 600 },
      radius: 30,
      allowedMarkTypes: ['checkbox', 'symbol'],
      maxMarks: 1
    },
    {
      id: 'star-3',
      shape: 'circle',
      position: { x: 280, y: 600 },
      radius: 30,
      allowedMarkTypes: ['checkbox', 'symbol'],
      maxMarks: 1
    },
    {
      id: 'total-score',
      shape: 'rect',
      position: { x: 400, y: 600 },
      size: { width: 120, height: 60 },
      allowedMarkTypes: ['number', 'text'],
      maxMarks: 1
    }
  ])
  .build();
