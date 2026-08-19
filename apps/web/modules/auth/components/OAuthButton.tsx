'use client';

import { Button, ButtonProps } from '@/shared/ui';
import { OAuthProvider } from '../services/oauthService';
import { initiateOAuth } from '../services/oauthService';
import { motion } from 'framer-motion';
import { Chrome, Facebook, Linkedin } from 'lucide-react';

interface OAuthButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  provider: OAuthProvider;
  children?: React.ReactNode;
}

const providerLabels: Record<OAuthProvider, string> = {
  google: 'Continue with Google',
  facebook: 'Continue with Facebook',
  linkedin: 'Continue with LinkedIn',
};

const providerIcons: Record<OAuthProvider, typeof Chrome> = {
  google: Chrome,
  facebook: Facebook,
  linkedin: Linkedin,
};

const providerColors: Record<OAuthProvider, string> = {
  google: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500',
  facebook: 'bg-[#1877F2] text-white hover:bg-[#166FE5] border-[#1877F2] hover:border-[#166FE5]',
  linkedin: 'bg-[#0077B5] text-white hover:bg-[#006399] border-[#0077B5] hover:border-[#006399]',
};

export function OAuthButton({
  provider,
  children,
  className,
  ...props
}: OAuthButtonProps) {
  const handleClick = () => {
    initiateOAuth(provider);
  };

  const Icon = providerIcons[provider];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        type="button"
        variant="outline"
        className={`w-full group transition-all duration-200 ${providerColors[provider]} ${className || ''}`}
        onClick={handleClick}
        size="lg"
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {children || providerLabels[provider]}
        </span>
      </Button>
    </motion.div>
  );
}
