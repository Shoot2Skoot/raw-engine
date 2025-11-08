// examples/01-simple-grid.ts - Simple Yahtzee-style grid example

import { SheetBuilder } from '../builders/SheetBuilder';

/**
 * Example 1: Simple grid layout (Yahtzee-style)
 * Demonstrates basic grid functionality with number marks
 */
export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F5F5F5')
  .addGridRegion(
    'upper-section',
    6,  // rows (Ones, Twos, Threes, Fours, Fives, Sixes)
    1,  // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number']
  )
  .addGridRegion(
    'lower-section',
    7,  // rows (Three of a Kind, Four of a Kind, Full House, etc.)
    1,  // cols
    80, // cell size
    { x: 50, y: 600 },
    ['number', 'checkbox']
  )
  .build();
