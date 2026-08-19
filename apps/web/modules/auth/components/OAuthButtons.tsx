'use client';

import { OAuthButton } from './OAuthButton';

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-surface px-2 text-text-light">
            Or continue with
          </span>
        </div>
      </div>
      <OAuthButton provider="google" />
      <OAuthButton provider="facebook" />
      <OAuthButton provider="linkedin" />
    </div>
  );
}
