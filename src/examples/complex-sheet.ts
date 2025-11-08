import { SheetBuilder } from '../builders/SheetBuilder';

/**
 * Example 2: Complex sheet with multiple mark types
 * Demonstrates various hotspot shapes and mark types
 */
export const complexSheet = SheetBuilder.create('complex')
  .name('Mixed Layout Demo')
  .size(800, 600)
  .backgroundColor('#FFFFFF')
  .addGridRegion(
    'checkboxes',
    3,  // rows
    4,  // cols
    50, // cell size
    { x: 50, y: 50 },
    ['checkbox'],
    5  // gap
  )
  .addGridRegion(
    'numbers',
    2,  // rows
    5,  // cols
    50, // cell size
    { x: 50, y: 250 },
    ['number'],
    5  // gap
  )
  .addGridRegion(
    'colors',
    2,  // rows
    4,  // cols
    50, // cell size
    { x: 450, y: 50 },
    ['fill'],
    5  // gap
  )
  .addGridRegion(
    'circles',
    3,  // rows
    3,  // cols
    50, // cell size
    { x: 450, y: 250 },
    ['circle'],
    5  // gap
  )
  .addFreeformRegion('custom', [
    {
      id: 'custom-polygon-1',
      shape: 'polygon',
      position: { x: 0, y: 0 },
      points: [
        { x: 350, y: 450 },
        { x: 400, y: 430 },
        { x: 420, y: 480 },
        { x: 380, y: 510 },
        { x: 340, y: 490 }
      ],
      allowedMarkTypes: ['symbol'],
      maxMarks: 1
    },
    {
      id: 'custom-circle-1',
      shape: 'circle',
      position: { x: 100, y: 500 },
      radius: 30,
      allowedMarkTypes: ['symbol', 'fill'],
      maxMarks: 1
    }
  ])
  .build();
