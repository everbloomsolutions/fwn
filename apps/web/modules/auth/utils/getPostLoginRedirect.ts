import { User } from '../stores/authStore';
import { ADMIN_ROUTES, ONBOARDING_ROUTES, PUBLIC_ROUTES } from '@/shared/config/routes';

export function getPostLoginRedirect(
  user: User | null,
  options: { isNewUser?: boolean } = {}
): string {
  if (options.isNewUser) {
    return ONBOARDING_ROUTES.WELCOME;
  }

  if (user?.role === 'admin') {
    return ADMIN_ROUTES.DASHBOARD;
  }

  return PUBLIC_ROUTES.SERVICES;
}
