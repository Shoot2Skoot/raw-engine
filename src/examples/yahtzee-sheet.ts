import { SheetBuilder } from '../builders/SheetBuilder';

/**
 * Example 1: Simple grid (Yahtzee-style)
 * A basic score sheet with number entry cells
 */
export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F5F5DC')
  .addGridRegion(
    'upper-section',
    6,  // rows (Aces, Twos, Threes, Fours, Fives, Sixes)
    1,  // cols
    60, // cell size
    { x: 170, y: 100 },
    ['number'],
    5  // gap
  )
  .addGridRegion(
    'lower-section',
    7,  // rows (Three of a kind, Four of a kind, Full House, Small Straight, Large Straight, Yahtzee, Chance)
    1,  // cols
    60, // cell size
    { x: 170, y: 500 },
    ['number'],
    5  // gap
  )
  .build();
