'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getCurrentUser } from '@/modules/auth/services/authService';
import { updateOnboardingProfile, completeOnboarding } from '../services/onboardingService';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { OnboardingProgress } from './OnboardingProgress';
import { CheckCircle } from 'lucide-react';

interface ProfileCompletionFormProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function ProfileCompletionForm({ onComplete, onSkip }: ProfileCompletionFormProps) {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    company: user?.company || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await updateOnboardingProfile(formData);
      await completeOnboarding();
      
      // Refresh user data
      if (result.user) {
        setUser(result.user);
      } else {
        // Fallback: fetch current user
        const updatedUser = await getCurrentUser();
        setUser(updatedUser);
      }

      if (onComplete) {
        onComplete();
      } else {
        router.push(PUBLIC_ROUTES.SERVICES);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.push(PUBLIC_ROUTES.SERVICES);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-muted px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <OnboardingProgress currentStep={1} totalSteps={2} className="mb-4" />
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Help us personalize your experience by providing a few details (all fields are optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              autoComplete="name"
              placeholder="Enter your full name"
            />
            <Input
              type="tel"
              name="phoneNumber"
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              autoComplete="tel"
              placeholder="Enter your phone number"
            />
            <Input
              type="text"
              name="company"
              label="Company/Organization"
              value={formData.company}
              onChange={handleChange}
              error={errors.company}
              autoComplete="organization"
              placeholder="Enter your company name"
            />
            {errors.submit && (
              <div className="rounded-md bg-status-error/10 p-3 text-sm text-status-error">
                {errors.submit}
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="flex-1" loading={isSubmitting} size="lg">
                {isSubmitting ? 'Saving...' : 'Save & Continue'}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
                size="lg"
                disabled={isSubmitting}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

