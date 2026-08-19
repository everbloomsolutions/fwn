/**
 * Hero Section Component
 * Main hero section with title, description, and CTA buttons
 * Supports background images, video backgrounds with parallax effect and overlay options
 * Enhanced with multiple CTAs and badges
 */

'use client';

import { HTMLAttributes, useEffect, useRef, useState } from 'react';
import { Container, Button, Heading, Text, Badge } from '@/shared/ui';
import { MotionDiv } from '@/shared/ui/components/motion/MotionDiv';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroImage {
  src: string;
  alt: string;
}

export interface HeroBadge {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface HeroAction {
  label: string;
  href: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export interface HeroSectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  ctas?: HeroAction[]; // Multiple CTAs support
  badges?: HeroBadge[]; // Badge/announcement banners
  background?: 'gradient' | 'solid' | 'image' | 'video';
  backgroundImage?: string; // Single image (deprecated, use backgroundImages)
  backgroundImageAlt?: string;
  backgroundImages?: HeroImage[]; // Array of images to cycle through
  backgroundVideo?: string; // Video background support
  backgroundVideoPoster?: string; // Poster image for video
  overlay?: 'dark' | 'light' | 'gradient' | 'none';
  overlayOpacity?: number; // 0-1
  parallax?: boolean;
  align?: 'left' | 'center';
  autoplay?: boolean; // Auto-cycle through images
  autoplayInterval?: number; // Milliseconds between image changes (default: 5000)
  showIndicators?: boolean; // Show dot indicators
  showNavigation?: boolean; // Show prev/next arrows
}

export function HeroSection({
  title,
  description,
  primaryAction,
  secondaryAction,
  ctas = [],
  badges = [],
  background = 'gradient',
  backgroundImage,
  backgroundImageAlt = 'Hero background',
  backgroundImages,
  backgroundVideo,
  backgroundVideoPoster,
  overlay = 'dark',
  overlayOpacity = 0.6,
  parallax = true,
  align = 'center',
  autoplay = true,
  autoplayInterval = 5000,
  showIndicators = true,
  showNavigation = true,
  className,
  ...props
}: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Determine which images to use
  const images: HeroImage[] = backgroundImages || (backgroundImage 
    ? [{ src: backgroundImage, alt: backgroundImageAlt }] 
    : []);

  // Parallax effect
  useEffect(() => {
    if (!parallax || (background !== 'image' && background !== 'video') || images.length === 0) return;

    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        setScrollY(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax, background, images.length]);

  // Auto-cycle through images
  useEffect(() => {
    if (!autoplay || images.length <= 1 || background !== 'image') return;

    autoplayTimerRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, autoplayInterval);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplay, images.length, autoplayInterval, background]);

  // Navigation functions
  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    // Reset autoplay timer
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, autoplayInterval);
    }
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    // Reset autoplay timer
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, autoplayInterval);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    // Reset autoplay timer
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, autoplayInterval);
    }
  };

  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-primary-light to-accent-light',
    solid: 'bg-surface',
    image: 'relative overflow-hidden',
    video: 'relative overflow-hidden',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
  };

  const overlayClasses = {
    dark: 'bg-black',
    light: 'bg-white',
    gradient: 'bg-gradient-to-b from-black/80 via-black/60 to-black/80',
    none: '',
  };

  const parallaxTransform = parallax && (background === 'image' || background === 'video') && images.length > 0
    ? `translateY(${scrollY * 0.5}px)`
    : 'none';

  // Combine all actions
  const allActions = [
    ...(primaryAction ? [primaryAction] : []),
    ...(secondaryAction ? [secondaryAction] : []),
    ...ctas,
  ];

  return (
    <section
      ref={heroRef}
      className={cn(
        'relative py-12 md:py-16',
        backgroundClasses[background],
        className
      )}
      {...props}
    >
      {/* Video Background */}
      {background === 'video' && backgroundVideo && (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={backgroundVideoPoster}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: parallaxTransform,
              transition: parallax ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Overlay */}
          {overlay !== 'none' && (
            <div
              className={cn('absolute inset-0 z-10', overlayClasses[overlay])}
              style={{ opacity: overlayOpacity }}
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* Background Images with Parallax and Cycling */}
      {background === 'image' && images.length > 0 && (
        <div className="absolute inset-0 z-0">
          {images.map((image, index) => (
            <div
              key={index}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                index === currentImageIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
              )}
              style={{
                transform: index === currentImageIndex ? parallaxTransform : 'none',
                transition: parallax && index === currentImageIndex ? 'none' : 'transform 0.3s ease-out, opacity 1s ease-in-out',
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
                quality={90}
              />
            </div>
          ))}
          
          {/* Overlay */}
          {overlay !== 'none' && (
            <div
              className={cn('absolute inset-0 z-10', overlayClasses[overlay])}
              style={{ opacity: overlayOpacity }}
              aria-hidden="true"
            />
          )}

          {/* Navigation Arrows */}
          {showNavigation && images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Indicators */}
          {showIndicators && images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    index === currentImageIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <Container maxWidth="xl" className="relative z-20">
        <MotionDiv variant="slideUp" className={cn(alignClasses[align])}>
          {/* Badges */}
          {badges.length > 0 && (
            <div className={cn(
              'flex flex-wrap gap-2 mb-4',
              align === 'center' && 'justify-center',
              align === 'left' && 'justify-start'
            )}>
              {badges.map((badge, index) => {
                const BadgeIcon = badge.icon;
                // Map HeroBadge variants to Badge component variants
                const badgeVariant = badge.variant === 'primary' || badge.variant === 'accent' 
                  ? 'default' 
                  : badge.variant || 'default';
                return (
                  <Badge
                    key={index}
                    variant={badgeVariant}
                    className={cn(
                      'inline-flex items-center',
                      background === 'image' || background === 'video'
                        ? 'bg-white/20 backdrop-blur-sm text-white border-white/30'
                        : ''
                    )}
                  >
                    {BadgeIcon && <BadgeIcon className="h-3 w-3 mr-1 flex-shrink-0" />}
                    <span>{badge.label}</span>
                  </Badge>
                );
              })}
            </div>
          )}

          <Heading 
            level="h1" 
            className={cn(
              'mb-4',
              background === 'image' && 'text-white drop-shadow-lg',
              background === 'video' && 'text-white drop-shadow-lg',
              background === 'gradient' && 'text-text',
              background === 'solid' && 'text-text'
            )}
          >
            {title}
          </Heading>
          <Text 
            size="lg" 
            className={cn(
              'mx-auto mb-8 max-w-2xl',
              background === 'image' && 'text-white/90 drop-shadow-md',
              background === 'video' && 'text-white/90 drop-shadow-md',
              background === 'gradient' && 'text-text-muted',
              background === 'solid' && 'text-text-muted',
              align === 'center' && 'text-center',
              align === 'left' && 'text-left'
            )}
          >
            {description}
          </Text>
          {allActions.length > 0 && (
            <div className={cn(
              'flex flex-col gap-4 sm:flex-row flex-wrap',
              align === 'center' && 'items-center justify-center',
              align === 'left' && 'items-start justify-start'
            )}>
              {allActions.map((action, index) => {
                const buttonVariant = action.variant || (index === 0 ? 'primary' : 'outline');
                const isOutline = buttonVariant === 'outline';
                const isImageOrVideo = background === 'image' || background === 'video';
                
                return (
                  <Link 
                    key={index} 
                    href={action.href}
                    className="inline-block"
                  >
                    <Button 
                      variant={buttonVariant}
                      size={action.size || 'lg'}
                      className={cn(
                        isImageOrVideo && 'shadow-lg',
                        isImageOrVideo && isOutline && 'border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-white/5 backdrop-blur-sm',
                        isImageOrVideo && !isOutline && 'bg-white/90 text-gray-900 hover:bg-white'
                      )}
                    >
                      {action.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </MotionDiv>
      </Container>
    </section>
  );
}

