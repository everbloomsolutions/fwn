'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Popover } from '@/shared/ui/overlays/Popover';
import { Avatar } from '@/shared/ui/data/Avatar';
import { Button } from '@/shared/ui';
import { User, Settings, LogOut, ChevronDown, Mail } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { PUBLIC_ROUTES } from '@/shared/config/routes';

export function AccountMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Detect Gmail accounts
  const isGmail = user?.email?.endsWith('@gmail.com') || 
                  user?.email?.endsWith('@googlemail.com');

  const handleLogout = () => {
    setIsOpen(false);
    // Navigate first using replace to avoid back button, then logout
      router.replace(PUBLIC_ROUTES.HOME);
    // Use a small delay to ensure navigation completes before logout state change
    // This prevents AuthGuard from redirecting to login
    setTimeout(() => {
      logout();
    }, 50);
  };

  // Trigger button
  const trigger = (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      className="flex items-center gap-2 h-9 px-2 hover:bg-surface-hover rounded-lg transition-all transform hover:scale-105 active:scale-95"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      <Avatar
        src={null}
        alt={user?.name || user?.email}
        fallback={user?.name?.[0] || user?.email?.[0] || 'U'}
        size="sm"
        className="ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
      />
      <span className="hidden sm:inline-block text-sm font-medium max-w-[120px] truncate">
        {user?.name || user?.email}
      </span>
      <ChevronDown className={cn(
        "h-4 w-4 text-text-muted transition-transform duration-200",
        isOpen && "rotate-180"
      )} />
    </Button>
  );

  // Dropdown content
  const content = (
    <div className={cn(
      "w-64 rounded-xl shadow-xl border border-border bg-surface",
      "max-w-[calc(100vw-2rem)]", // Responsive width on mobile
      "animate-in fade-in slide-in-from-top-2 duration-200"
    )}>
      {/* User Info Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <Avatar
          src={null}
          alt={user?.name || user?.email}
          fallback={user?.name?.[0] || user?.email?.[0] || 'U'}
          size="md"
          className="ring-2 ring-primary/20"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate">
            {user?.name || 'User'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
            {isGmail && (
              <span className="flex items-center text-xs text-text-light" title="Gmail account">
                <Mail className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <Link
          href="/profile"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface-hover rounded-lg transition-all duration-200 hover:translate-x-1 group"
        >
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">Profile</span>
        </Link>
        <Link
          href="/settings"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface-hover rounded-lg transition-all duration-200 hover:translate-x-1 group"
        >
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="pt-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-status-error hover:bg-status-error/10 rounded-lg transition-all duration-200 w-full text-left hover:translate-x-1 group"
        >
          <div className="p-1.5 rounded-lg bg-status-error/10 group-hover:bg-status-error/20 transition-colors">
            <LogOut className="h-4 w-4 text-status-error" />
          </div>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <Popover
      trigger={trigger}
      content={content}
      position="bottom"
      align="end"
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}

