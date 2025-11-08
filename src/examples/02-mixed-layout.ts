// examples/02-mixed-layout.ts

import { SheetBuilder } from '../builders/SheetBuilder';

// Create a demo sheet with mixed layouts
export const demoSheet = SheetBuilder.create('demo')
  .name('Demo Sheet')
  .size(800, 1000)
  .backgroundColor('#FAFAFA')
  // Number grid for scores
  .addGridRegion(
    'score-grid',
    5,  // rows
    3,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['number']
  )
  // Checkbox grid for tracking
  .addGridRegion(
    'checkbox-grid',
    3,  // rows
    4,  // cols
    50, // cell size
    { x: 250, y: 50 },
    ['checkbox']
  )
  // Circle markers
  .addGridRegion(
    'circle-track',
    1,  // rows
    10, // cols
    40, // cell size
    { x: 50, y: 400 },
    ['circle']
  )
  // Color fill region
  .addGridRegion(
    'color-region',
    4,  // rows
    4,  // cols
    70, // cell size
    { x: 50, y: 500 },
    ['fill', 'symbol']
  )
  .build();

// Create a resource tracking sheet
export const resourceSheet = SheetBuilder.create('resources')
  .name('Resource Tracker')
  .size(600, 800)
  .backgroundColor('#E8F4F8')
  .addGridRegion(
    'water-track',
    1,  // rows
    10, // cols
    50, // cell size
    { x: 50, y: 100 },
    ['fill', 'checkbox']
  )
  .addGridRegion(
    'energy-track',
    1,  // rows
    8,  // cols
    60, // cell size
    { x: 50, y: 200 },
    ['number', 'fill']
  )
  .addGridRegion(
    'achievements',
    3,  // rows
    3,  // cols
    80, // cell size
    { x: 50, y: 350 },
    ['checkbox', 'circle']
  )
  .build();

// Export all example sheets
export const exampleSheets = [demoSheet, resourceSheet];
