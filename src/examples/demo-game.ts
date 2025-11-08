// examples/demo-game.ts

import { SheetBuilder } from '../builders/SheetBuilder';

// A demo game that showcases all features
export const demoGameSheet = SheetBuilder.create('demo-game')
  .name('Demo Game')
  .size(800, 1000)
  .backgroundColor('#FAFAF8')
  .addGridRegion(
    'number-grid',
    3,  // rows
    5,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['number', 'pencil']
  )
  .addGridRegion(
    'checkbox-grid',
    2,  // rows
    4,  // cols
    50, // cell size
    { x: 450, y: 50 },
    ['checkbox']
  )
  .addGridRegion(
    'circle-grid',
    2,  // rows
    4,  // cols
    50, // cell size
    { x: 450, y: 200 },
    ['circle']
  )
  .addFreeformRegion('special-zones', [
    {
      id: 'star-1',
      shape: 'circle',
      position: { x: 100, y: 400 },
      radius: 40,
      allowedMarkTypes: ['symbol', 'fill']
    },
    {
      id: 'star-2',
      shape: 'circle',
      position: { x: 200, y: 400 },
      radius: 40,
      allowedMarkTypes: ['symbol', 'fill']
    },
    {
      id: 'star-3',
      shape: 'circle',
      position: { x: 300, y: 400 },
      radius: 40,
      allowedMarkTypes: ['symbol', 'fill']
    },
    {
      id: 'bonus-zone',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 50, y: 550 },
        { x: 200, y: 550 },
        { x: 200, y: 650 },
        { x: 50, y: 650 }
      ],
      allowedMarkTypes: ['fill', 'text']
    },
    {
      id: 'notes-area',
      shape: 'rect',
      position: { x: 450, y: 400 },
      size: { width: 300, height: 200 },
      allowedMarkTypes: ['text', 'pencil']
    }
  ])
  .build();

// A second sheet to demonstrate multi-sheet support
export const secondSheet = SheetBuilder.create('second-sheet')
  .name('Player Stats')
  .size(800, 600)
  .backgroundColor('#E8F4F8')
  .addGridRegion(
    'stats-grid',
    5,  // rows
    3,  // cols
    80, // cell size
    { x: 100, y: 100 },
    ['number', 'checkbox', 'circle']
  )
  .build();
