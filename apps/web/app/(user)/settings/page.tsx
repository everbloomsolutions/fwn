'use client';

import { Heading, Text, Card, CardContent, CardDescription, CardHeader, CardTitle, ThemeToggle, Button, Breadcrumbs, BackToTop } from '@/shared/ui';
import { useColorMode } from '@/shared/core/theme/hooks/useColorMode';
import { ChangePasswordForm } from '@/modules/user/components/ChangePasswordForm';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { motion } from 'framer-motion';
import { Palette, Moon, Sun, Monitor, Lock, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { colorMode, setLightMode, setDarkMode, setSystemMode } = useColorMode();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Breadcrumbs
            items={[
              { label: 'Services', href: PUBLIC_ROUTES.SERVICES },
              { label: 'Settings' },
            ]}
            className="mb-6"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <Heading level="h1" className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Settings
          </Heading>
          <Text className="text-text-muted mt-2">
            Manage your account preferences and application settings
          </Text>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-2 border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the theme of the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-hover">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text mb-1">
                        Theme Preference
                      </p>
                      <p className="text-xs text-text-muted">
                        Current: <span className="font-medium capitalize text-primary">{colorMode === 'system' ? 'System' : colorMode}</span>
                      </p>
                    </div>
                    <ThemeToggle variant="switch" showLabel={false} />
                  </div>
                  
                  <div>
                    <label className="mb-4 block text-sm font-medium text-text">Quick Theme Selection</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        variant={colorMode === 'light' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={setLightMode}
                        className="flex items-center justify-center gap-2 h-auto py-4 hover:scale-105 transition-transform"
                      >
                        <Sun className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Light</div>
                          <div className="text-xs opacity-80">Bright theme</div>
                        </div>
                      </Button>
                      <Button
                        variant={colorMode === 'dark' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={setDarkMode}
                        className="flex items-center justify-center gap-2 h-auto py-4 hover:scale-105 transition-transform"
                      >
                        <Moon className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Dark</div>
                          <div className="text-xs opacity-80">Dark theme</div>
                        </div>
                      </Button>
                      <Button
                        variant={colorMode === 'system' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={setSystemMode}
                        className="flex items-center justify-center gap-2 h-auto py-4 hover:scale-105 transition-transform"
                      >
                        <Monitor className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">System</div>
                          <div className="text-xs opacity-80">Auto-detect</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-2 border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      <BackToTop />
    </div>
  );
}

