/**
 * Example 3: Mixed Layout (Complex sheet combining grids and freeform)
 * Demonstrates multiple regions with different interaction types
 */

import { SheetBuilder, HotspotHelpers } from '../builders/SheetBuilder';

export const twilightInscriptionSheet = SheetBuilder.create('twilight-main')
  .name('Twilight Inscription - Command Sheet')
  .size(1000, 1400)
  .backgroundColor('#2C2416')
  .addGridRegion(
    'tech-tree',
    3,  // rows
    4,  // cols
    70, // cell size
    { x: 50, y: 50 },
    ['checkbox', 'circle'],
    { gap: 8, zIndex: 10 }
  )
  .addFreeformRegion(
    'resource-tracks',
    [
      // Culture track (curved/irregular)
      ...HotspotHelpers.row('culture', 10, 50, 350, 45, 40, 3, ['fill', 'number']),
      // Military track
      ...HotspotHelpers.row('military', 10, 50, 450, 45, 40, 3, ['fill', 'number']),
      // Industry track
      ...HotspotHelpers.row('industry', 10, 50, 550, 45, 40, 3, ['fill', 'number']),
      // Science track
      ...HotspotHelpers.row('science', 10, 50, 650, 45, 40, 3, ['fill', 'number'])
    ],
    { zIndex: 5 }
  )
  .addFreeformRegion(
    'planet-map',
    [
      // Irregular planet territories (using polygons)
      HotspotHelpers.polygon(
        'territory-mecatol',
        [
          { x: 500, y: 800 },
          { x: 580, y: 780 },
          { x: 600, y: 860 },
          { x: 520, y: 880 }
        ],
        ['symbol', 'fill']
      ),
      HotspotHelpers.polygon(
        'territory-alpha',
        [
          { x: 400, y: 750 },
          { x: 480, y: 730 },
          { x: 500, y: 800 },
          { x: 420, y: 820 }
        ],
        ['symbol', 'fill']
      ),
      HotspotHelpers.polygon(
        'territory-beta',
        [
          { x: 500, y: 800 },
          { x: 580, y: 780 },
          { x: 600, y: 700 },
          { x: 520, y: 720 }
        ],
        ['symbol', 'fill']
      ),
      HotspotHelpers.polygon(
        'territory-gamma',
        [
          { x: 520, y: 880 },
          { x: 600, y: 860 },
          { x: 620, y: 940 },
          { x: 540, y: 960 }
        ],
        ['symbol', 'fill']
      ),
      HotspotHelpers.polygon(
        'territory-delta',
        [
          { x: 420, y: 820 },
          { x: 500, y: 800 },
          { x: 520, y: 880 },
          { x: 440, y: 900 }
        ],
        ['symbol', 'fill']
      )
    ],
    { zIndex: 3 }
  )
  .addFreeformRegion(
    'special-actions',
    [
      // Special action circles arranged around the map
      ...HotspotHelpers.circularArrangement(
        'action',
        6,
        500,
        1100,
        180,
        30,
        ['checkbox', 'number']
      )
    ],
    { zIndex: 8 }
  )
  .addGridRegion(
    'achievement-tracker',
    2,  // rows
    5,  // cols
    60, // cell size
    { x: 350, y: 1250 },
    ['checkbox', 'symbol'],
    { gap: 5, zIndex: 10 }
  )
  .build();

/**
 * Civilization building sheet
 */
export const civilizationSheet = SheetBuilder.create('civilization')
  .name('Civilization Builder')
  .size(900, 1200)
  .backgroundColor('#E8DCC4')
  .addGridRegion(
    'city-grid',
    4,  // rows
    4,  // cols
    80, // cell size
    { x: 50, y: 50 },
    ['symbol', 'fill'],
    { gap: 10 }
  )
  .addFreeformRegion(
    'wonder-track',
    [
      // Great Wonders as special hotspots
      HotspotHelpers.rect('wonder-pyramids', 550, 80, 100, 80, ['checkbox', 'fill']),
      HotspotHelpers.rect('wonder-colossus', 670, 80, 100, 80, ['checkbox', 'fill']),
      HotspotHelpers.rect('wonder-lighthouse', 790, 80, 100, 80, ['checkbox', 'fill']),
      HotspotHelpers.rect('wonder-gardens', 550, 180, 100, 80, ['checkbox', 'fill']),
      HotspotHelpers.rect('wonder-temple', 670, 180, 100, 80, ['checkbox', 'fill']),
      HotspotHelpers.rect('wonder-statue', 790, 180, 100, 80, ['checkbox', 'fill'])
    ]
  )
  .addFreeformRegion(
    'technology-advances',
    [
      // Tech tree branches
      ...HotspotHelpers.column('tech-military', 8, 100, 500, 50, 50, 5, ['checkbox', 'number']),
      ...HotspotHelpers.column('tech-civic', 8, 250, 500, 50, 50, 5, ['checkbox', 'number']),
      ...HotspotHelpers.column('tech-science', 8, 400, 500, 50, 50, 5, ['checkbox', 'number']),
      ...HotspotHelpers.column('tech-culture', 8, 550, 500, 50, 50, 5, ['checkbox', 'number'])
    ]
  )
  .addFreeformRegion(
    'victory-points',
    [
      // Victory point tracker (curved path simulation)
      ...HotspotHelpers.row('vp-track', 15, 50, 1100, 50, 40, 3, ['number', 'fill'])
    ]
  )
  .build();
