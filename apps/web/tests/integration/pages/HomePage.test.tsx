import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/(public)/page';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Hero and other complex components
jest.mock('@/shared/ui', () => ({
  Hero: ({ primaryAction }: any) => (
    <div data-testid="hero">
      {primaryAction?.label && <button>{primaryAction.label}</button>}
    </div>
  ),
  FeatureSection: () => <div data-testid="feature-section">Features</div>,
  CTA: () => <div data-testid="cta">CTA</div>,
  Heading: ({ children }: any) => <h1>{children}</h1>,
  Text: ({ children }: any) => <p>{children}</p>,
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  BackToTop: () => <div data-testid="back-to-top">Back to Top</div>,
}));

describe('HomePage', () => {
  it('should render home page', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/contact us/i)).toBeInTheDocument();
  });

  it('should display hero section', () => {
    render(<HomePage />);
    
    // Check for hero content
    expect(screen.getByText(/contact us/i)).toBeInTheDocument();
  });
});

