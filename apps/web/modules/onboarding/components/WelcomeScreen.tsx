'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Heading, Text } from '@/shared/ui';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onSkip?: () => void;
}

export function WelcomeScreen({ onGetStarted, onSkip }: WelcomeScreenProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      router.push('/onboarding/profile');
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.push(PUBLIC_ROUTES.SERVICES);
    }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-muted px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">
            Welcome{userName !== 'there' ? `, ${userName}` : ''}!
          </CardTitle>
          <CardDescription className="text-base">
            We're excited to have you on board
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <Text className="text-text-muted">
              Let's get you set up in just a few quick steps. You'll be able to:
            </Text>
            <ul className="space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">✓</span>
                <Text className="text-text-muted">
                  Complete your profile to personalize your experience
                </Text>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">✓</span>
                <Text className="text-text-muted">
                  Access all our features and services
                </Text>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">✓</span>
                <Text className="text-text-muted">
                  Get started right away with our platform
                </Text>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleGetStarted} className="flex-1" size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={handleSkip} variant="outline" className="flex-1" size="lg">
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

