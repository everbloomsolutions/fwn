# Service Images Directory

## Location
Place your service images in this directory:
```
front-end/public/images/services/
```

## Required Images

The following images are used across the frontend:

### Core Services
- `turnkey-electrical.jpg` - Turnkey Electrical Contracting
- `cctv-installation.jpg` - CCTV Installation
- `solar-pv-projects.jpg` - Solar PV Projects
- `fire-fighting.jpg` - Fire Fighting Work
- `networking-solutions.jpg` - Internet & Networking Solutions
- `new-site-setup.jpg` - New Site Setup
- `renovation-work.jpg` - Renovation Work
- `maintenance.jpg` - Annual Maintenance Contract (AMC)

### Specialized Services
- `mep-projects.jpg` - MEP Projects
- `elv-bms-services.jpg` - ELV/BMS Services
- `access-control.jpg` - Access Control Solutions

## Image Specifications

### Recommended Settings
- **Aspect Ratio:** 4:3 (e.g., 800x600)
- **File Format:** JPG
- **File Size:** 100-300KB per image
- **Quality:** High (85% for JPG)
- **Dimensions:** 800x600px minimum

### Image Content Guidelines
- Professional, high-quality photos
- Relevant to the specific service
- Well-lit and clear
- Good contrast for text overlays
- Focus on services, equipment, or completed projects

## Optimization

Run the optimization script to compress images:
```bash
npm run optimize:services
```

This will:
- Resize images to max 800x600 (maintaining aspect ratio)
- Compress with 85% quality
- Use progressive JPEG encoding
- Reduce file sizes by 30-50%

## Usage in Code

Images in this directory are referenced as:
```typescript
image: '/images/services/turnkey-electrical.jpg'
```

Next.js Image component will automatically optimize these images at build time.

