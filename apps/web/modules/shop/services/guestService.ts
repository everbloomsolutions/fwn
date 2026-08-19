/**
 * Guest session ID helpers
 * Persisted in localStorage so unauthenticated users can have a persistent cart.
 */

const GUEST_ID_KEY = 'fwn-guest-id';

export function generateGuestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function getGuestId(): string | null {
  if (typeof window === 'undefined') return null;
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export function clearGuestId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_ID_KEY);
  }
}
