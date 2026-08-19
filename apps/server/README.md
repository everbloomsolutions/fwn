# Backend API

Backend API server for the Foodworld Naturals natural food products e-commerce platform, built with TypeScript, Express, and MongoDB.

## Features

- **Authentication**: JWT-based authentication with OAuth support (Google, Facebook, LinkedIn)
- **Property Management**: Full CRUD operations for properties with search and filtering
- **Notifications**: In-app and push notifications via FCM
- **Analytics**: Event tracking and analytics
- **File Upload**: Image uploads via Cloudinary
- **Geocoding**: Address to coordinates conversion via Google Maps
- **Background Jobs**: Email queue, cleanup tasks, analytics processing
- **Caching**: Redis-based caching
- **Security**: Rate limiting, input sanitization, CSRF protection, compression

## Prerequisites

- Node.js 20+
- MongoDB
- Redis (optional, for caching and job queues)
- Cloudinary account (optional, for image uploads)
- Firebase account (optional, for push notifications)
- Google Maps API key (optional, for geocoding)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/fwn

   # Redis
   REDIS_URL=redis://localhost:6379

   # JWT
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key

   # OAuth (optional)
   OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
   OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Cloudinary (optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Firebase (optional)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email

   # Google Maps (optional)
   GOOGLE_MAPS_API_KEY=your-api-key
   ```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## API Documentation

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for detailed API documentation.

## Architecture

See [docs/ARCHITECTURE_OVERVIEW.md](docs/ARCHITECTURE_OVERVIEW.md) for architecture details.

## Containerization

### Podman (Recommended)

Podman is a daemonless, rootless container engine that is Docker-compatible.

#### Install Podman

```bash
# Ubuntu/Debian
sudo apt-get install -y podman

# RHEL/CentOS/Fedora
sudo dnf install -y podman

# macOS
brew install podman

# Verify installation
podman --version
```

#### Start Redis with Podman

```bash
# Use the management script
./scripts/podman-redis.sh start

# Or manually (use fully qualified image name)
podman pull docker.io/library/redis:7-alpine
podman run -d \
  --name back-end-redis \
  -p 6379:6379 \
  -v back-end-redis-data:/data \
  --restart unless-stopped \
  docker.io/library/redis:7-alpine \
  redis-server --appendonly yes
```

#### Build and Run Application

```bash
# Build image
podman build -t back-end .

# Run container
podman run -p 8080:8080 --env-file .env back-end
```

#### Podman Compose

```bash
# Install podman-compose
pip3 install podman-compose

# Start services
podman-compose -f podman-compose.yml up -d

# Or use podman play kube
podman play kube redis.podman.yml
```

#### Redis Management

```bash
# Start Redis
./scripts/podman-redis.sh start

# Check status
./scripts/podman-redis.sh status

# View logs
./scripts/podman-redis.sh logs -f

# Stop Redis
./scripts/podman-redis.sh stop

# Access Redis CLI
./scripts/podman-redis.sh exec redis-cli
```

For complete Podman documentation, see [docs/PODMAN_GUIDE.md](docs/PODMAN_GUIDE.md).

### Docker (Alternative)

#### Build Docker image

```bash
docker build -t back-end .
```

#### Run with Docker

```bash
docker run -p 8080:8080 --env-file .env back-end
```

#### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/fwn
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
```

See [docs/PODMAN_MIGRATION_PLAN.md](docs/PODMAN_MIGRATION_PLAN.md) for migration guide from Docker to Podman.

## Scripts

- `npm run seed`: Seed database with sample data
- `npm run migrate`: Run database migrations
- `npm run backup`: Backup database
- `npm run manage-users`: Manage user accounts

## Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration
```

## Deployment

See [scripts/deploy.sh](scripts/deploy.sh) for deployment automation.

## License

ISC

