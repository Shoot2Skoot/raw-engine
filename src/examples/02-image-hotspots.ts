/**
 * Example 2: Image with Hotspots (Welcome to the Moon style)
 * Demonstrates freeform hotspots over a background image
 */

import { SheetBuilder, HotspotHelpers } from '../builders/SheetBuilder';

export const moonMissionSheet = SheetBuilder.create('moon-mission-1')
  .name('Mission 1: First Steps')
  .size(800, 1000)
  .backgroundColor('#1a1a2e')
  // Note: You would add an actual background image here
  // .background('/demo-sheets/moon-mission-1.png')
  .addFreeformRegion(
    'resources',
    [
      // Water resource circles
      HotspotHelpers.circle('water-1', 120, 80, 20, ['checkbox']),
      HotspotHelpers.circle('water-2', 180, 80, 20, ['checkbox']),
      HotspotHelpers.circle('water-3', 240, 80, 20, ['checkbox']),
      HotspotHelpers.circle('water-4', 300, 80, 20, ['checkbox']),

      // Energy track (horizontal row)
      ...HotspotHelpers.row('energy', 10, 100, 150, 50, 30, 5, ['number', 'fill']),

      // Oxygen reserves
      ...HotspotHelpers.column('oxygen', 5, 600, 200, 40, 40, 10, ['checkbox', 'circle'])
    ],
    { zIndex: 10 }
  )
  .addFreeformRegion(
    'planet-exploration',
    [
      // Planet grid (using polygons for irregular spaces)
      HotspotHelpers.polygon(
        'planet-zone-1',
        [
          { x: 200, y: 400 },
          { x: 280, y: 380 },
          { x: 300, y: 450 },
          { x: 220, y: 470 }
        ],
        ['fill', 'symbol']
      ),
      HotspotHelpers.polygon(
        'planet-zone-2',
        [
          { x: 300, y: 450 },
          { x: 380, y: 430 },
          { x: 400, y: 500 },
          { x: 320, y: 520 }
        ],
        ['fill', 'symbol']
      ),
      HotspotHelpers.polygon(
        'planet-zone-3',
        [
          { x: 220, y: 470 },
          { x: 300, y: 450 },
          { x: 320, y: 520 },
          { x: 240, y: 540 }
        ],
        ['fill', 'symbol']
      )
    ],
    { zIndex: 5 }
  )
  .addFreeformRegion(
    'mission-objectives',
    [
      // Circular mission tracker
      ...HotspotHelpers.circularArrangement(
        'mission',
        8,  // 8 missions
        400, // center X
        750, // center Y
        150, // radius from center
        25,  // hotspot radius
        ['checkbox', 'fill']
      )
    ]
  )
  .build();

/**
 * Simplified space-themed sheet without background image
 */
export const spaceStationSheet = SheetBuilder.create('space-station')
  .name('Space Station Builder')
  .size(600, 800)
  .backgroundColor('#0f3460')
  .addFreeformRegion(
    'modules',
    [
      // Different module types as hexagons (simplified as circles for now)
      HotspotHelpers.circle('module-life-support', 300, 150, 40, ['checkbox', 'fill']),
      HotspotHelpers.circle('module-power', 200, 250, 40, ['checkbox', 'fill']),
      HotspotHelpers.circle('module-research', 400, 250, 40, ['checkbox', 'fill']),
      HotspotHelpers.circle('module-storage', 150, 350, 40, ['checkbox', 'fill']),
      HotspotHelpers.circle('module-crew', 300, 350, 40, ['checkbox', 'fill']),
      HotspotHelpers.circle('module-navigation', 450, 350, 40, ['checkbox', 'fill'])
    ]
  )
  .addFreeformRegion(
    'resources',
    [
      // Resource tracks
      ...HotspotHelpers.column('energy-track', 10, 50, 500, 35, 25, 2, ['number', 'fill']),
      ...HotspotHelpers.column('water-track', 10, 150, 500, 35, 25, 2, ['number', 'fill']),
      ...HotspotHelpers.column('oxygen-track', 10, 250, 500, 35, 25, 2, ['number', 'fill'])
    ]
  )
  .build();
