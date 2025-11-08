/**
 * Example 1: Simple Grid (Yahtzee-style)
 * Demonstrates basic grid layout with number input
 */

import { SheetBuilder } from '../builders/SheetBuilder';

export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 800)
  .backgroundColor('#F5F5DC')
  .addGridRegion(
    'upper-section',
    6,  // rows (Ones, Twos, Threes, Fours, Fives, Sixes)
    1,  // cols
    60, // cell size
    { x: 150, y: 100 },
    ['number'],
    { gap: 5 }
  )
  .addGridRegion(
    'lower-section',
    7,  // rows (3 of a kind, 4 of a kind, Full House, Small Straight, Large Straight, Yahtzee, Chance)
    1,  // cols
    60, // cell size
    { x: 150, y: 550 },
    ['number'],
    { gap: 5 }
  )
  .build();
