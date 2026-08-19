'use client';

import Link from 'next/link';
import { Button, Heading, Text, Card, CardContent } from '@/shared/ui';
import { motion } from 'framer-motion';
import { FileQuestion, LogIn, UserPlus, Home, ArrowLeft } from 'lucide-react';

export default function AuthNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-bg-muted to-primary/5 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-border/50 shadow-xl">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
                <FileQuestion className="w-12 h-12 text-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <Heading level="h1" className="mb-4 text-7xl font-bold text-primary">
                404
              </Heading>
              <Heading level="h2" className="mb-4 text-2xl">
                Page Not Found
              </Heading>
              <Text size="lg" color="muted" className="mb-8">
                The authentication page you&apos;re looking for doesn&apos;t exist.
              </Text>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col gap-3"
            >
              <Link href="/login">
                <Button className="w-full group" size="lg">
                  <LogIn className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Go to Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full group" size="lg">
                  <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Create Account
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full group" size="lg">
                  <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full group"
                size="lg"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Go back
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

