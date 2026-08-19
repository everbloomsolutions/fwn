/**
 * Centralized Spacing Configuration
 * Single source of truth for all spacing values across the application
 */

export const spacing = {
  // Section vertical padding
  section: {
    // Main sections (hero, primary content areas)
    main: 'py-16 sm:py-20 lg:py-24',
    // Sub-sections (nested sections, secondary content)
    sub: 'py-12 sm:py-16 lg:py-20',
    // Compact sections (smaller content areas)
    compact: 'py-8 sm:py-12 lg:py-16',
  },
  
  // Container horizontal padding
  container: {
    default: 'px-4 sm:px-6 lg:px-8',
  },
  
  // Margins
  margin: {
    // Section header margin (below heading)
    sectionHeader: 'mb-12',
    // Heading margin (below heading, above content)
    heading: 'mb-4',
    // Text margin (between paragraphs)
    text: 'mb-6',
  },
  
  // Grid gaps
  gap: {
    // Card grids (feature cards, service cards)
    cardGrid: 'gap-8',
    // Small grids (icon grids, compact layouts)
    smallGrid: 'gap-6',
    // Service areas grid
    serviceAreas: 'gap-6 md:gap-8',
  },
  
  // Card spacing
  card: {
    // CardHeader padding
    header: 'p-6 pb-4',
    // CardContent padding
    content: 'p-6',
    // Icon margin in card headers
    iconMargin: 'mb-4',
  },
} as const;

export type SpacingConfig = typeof spacing;

