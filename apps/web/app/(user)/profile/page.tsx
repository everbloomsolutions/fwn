'use client';

import { useState } from 'react';
import { Heading, Text, Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Breadcrumbs, BackToTop, Avatar } from '@/shared/ui';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ProfileForm } from '@/modules/user/components/ProfileForm';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Edit, CheckCircle2, Clock } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  const handleEditSuccess = () => {
    setIsEditing(false);
    setActiveTab('view');
  };

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
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Breadcrumbs
            items={[
              { label: 'Services', href: PUBLIC_ROUTES.SERVICES },
              { label: 'Profile' },
            ]}
            className="mb-6"
          />
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-border/50 bg-gradient-to-br from-surface to-bg-muted">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar
                    src={null}
                    alt={user?.name || user?.email}
                    fallback={user?.name?.[0] || user?.email?.[0] || 'U'}
                    size="xl"
                    className="ring-4 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-status-success rounded-full border-4 border-surface flex items-center justify-center">
                    <div className="w-2 h-2 bg-status-success rounded-full" />
                  </div>
                </div>
                <div className="flex-1">
                  <Heading level="h1" className="mb-2">
                    {user?.name || 'User Profile'}
                  </Heading>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <Badge variant={user?.isActive ? 'success' : 'error'}>
                        {user?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {!isEditing && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsEditing(true);
                      setActiveTab('edit');
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} defaultValue="view" onValueChange={(value) => {
          setActiveTab(value as 'view' | 'edit');
          setIsEditing(value === 'edit');
        }} className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto bg-surface-hover">
            <TabsTrigger value="view" className="flex-1 sm:flex-none">
              <User className="h-4 w-4 mr-2" />
              View Profile
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex-1 sm:flex-none">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 sm:grid-cols-2"
            >
              <motion.div variants={itemVariants}>
                <Card className="h-full border-2 border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Text className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                            Name
                          </Text>
                          <Text className="text-base font-medium text-text">
                            {user?.name || 'Not set'}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Text className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                            Email
                          </Text>
                          <Text className="text-base font-medium text-text break-all">
                            {user?.email || 'N/A'}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Text className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                            Role
                          </Text>
                          <div className="mt-1">
                            <Badge variant="default" className="text-sm">
                              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full border-2 border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-status-success/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-status-success" />
                        </div>
                        <div className="flex-1">
                          <Text className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                            Account Status
                          </Text>
                          <div className="mt-1">
                            <Badge variant={user?.isActive ? 'success' : 'error'} className="text-sm">
                              {user?.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Text className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                            Member Since
                          </Text>
                          <Text className="text-base font-medium text-text">
                            {user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Text className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                            Last Updated
                          </Text>
                          <Text className="text-base font-medium text-text">
                            {user?.updatedAt
                              ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="edit">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-2xl"
            >
              <ProfileForm onSuccess={handleEditSuccess} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      <BackToTop />
    </div>
  );
}
