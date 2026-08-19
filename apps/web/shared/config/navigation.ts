import {
  Briefcase,
} from 'lucide-react';
import { PUBLIC_ROUTES } from './routes';

export interface NavigationItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  badge?: string | number;
  external?: boolean;
}

/**
 * Sidebar navigation configuration
 * Used for authenticated user area navigation
 */
export const navigationConfig: NavigationItem[] = [
  {
    label: 'Services',
    href: PUBLIC_ROUTES.SERVICES,
    icon: Briefcase,
  },
];

/**
 * Navbar navigation links
 * Used for public and authenticated navigation in the top navbar
 */
export const navbarNavigationLinks = [
  { href: PUBLIC_ROUTES.HOME, label: 'Home' },
  { href: PUBLIC_ROUTES.ABOUT, label: 'About Us' },
  { href: PUBLIC_ROUTES.SHOP, label: 'Shop' },
  { href: PUBLIC_ROUTES.CART, label: 'Cart' },
  { href: PUBLIC_ROUTES.CONTACT, label: 'Contact Us' },
] as const;

