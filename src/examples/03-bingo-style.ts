/**
 * Example 3: Bingo-Style Sheet
 * Demonstrates a classic 5x5 bingo grid
 */

import { SheetBuilder } from '../builders/SheetBuilder';

export const bingoSheet = SheetBuilder.create('bingo')
  .name('Bingo Card')
  .size(600, 700)
  .backgroundColor('#FFFFFF')

  // Main 5x5 bingo grid
  .addGridRegion(
    'bingo-grid',
    5,  // rows
    5,  // cols
    100, // cell size
    { x: 50, y: 100 },
    ['checkbox', 'circle', 'fill'],
    { gap: 2 }
  )

  // Extra markers at the top
  .addFreeformRegion(
    'markers',
    [
      SheetBuilder.circle('marker-b', 100, 50, 20, ['fill']),
      SheetBuilder.circle('marker-i', 200, 50, 20, ['fill']),
      SheetBuilder.circle('marker-n', 300, 50, 20, ['fill']),
      SheetBuilder.circle('marker-g', 400, 50, 20, ['fill']),
      SheetBuilder.circle('marker-o', 500, 50, 20, ['fill'])
    ]
  )

  .build();
