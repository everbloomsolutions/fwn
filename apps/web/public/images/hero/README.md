# Hero Images Directory

## Location
Place your hero background images in this directory:
```
front-end/public/images/hero/
```

## Recommended Image Specifications

### File Format
- **Format:** JPG or WebP (WebP recommended for better compression)
- **Quality:** High quality (80-90% for JPG, 85-95% for WebP)

### Dimensions
- **Recommended Size:** 1920x1080 pixels (16:9 aspect ratio)
- **Minimum Size:** 1280x720 pixels
- **Maximum Size:** 3840x2160 pixels (4K)

### File Naming Convention
Use descriptive names that match your services:
```
hero-electrical-contracting.jpg
hero-cctv-installation.jpg
hero-solar-projects.jpg
hero-fire-safety.jpg
hero-networking-solutions.jpg
hero-new-site-setup.jpg
hero-renovation-work.jpg
hero-maintenance.jpg
```

## Image Requirements

### Content Guidelines
- High-quality, professional images
- Relevant to electrical contracting services
- Well-lit and clear
- No text overlays (text is added by the component)
- Focus on services, equipment, or completed projects

### Technical Requirements
- Optimized file size (aim for 200-500KB per image)
- Proper aspect ratio (16:9 recommended)
- Good contrast for text readability
- Professional photography preferred

## Usage in Code

Images placed in `public/images/hero/` can be referenced as:
```typescript
backgroundImages={[
  {
    src: '/images/hero/hero-electrical-contracting.jpg',
    alt: 'Description of image',
  },
  // ... more images
]}
```

All images should be stored locally in the `public/images/` directory for optimal performance and reliability.

## Image Optimization Tips

1. **Compress images** before uploading
2. **Use WebP format** for better compression
3. **Test on different devices** to ensure quality
4. **Keep file sizes reasonable** for fast loading
5. **Use descriptive alt text** for accessibility

## Current Configuration

The hero component cycles through images every 5 seconds by default.
You can adjust this in the component props:
- `autoplayInterval={5000}` - Change interval (in milliseconds)
- `autoplay={true}` - Enable/disable auto-cycling
- `showIndicators={true}` - Show dot indicators
- `showNavigation={true}` - Show prev/next arrows

