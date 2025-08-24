# 📚 Novella Platform

A modern, scalable social media platform for book lovers to share reviews, discover new reads, and connect with fellow readers.

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + TailwindCSS + Vite
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL with Redis for caching
- **Deployment**: Docker + Docker Compose + Nginx

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)

### Development Setup

1. **Clone and setup environment**:
   ```bash
   cd novella-platform
   cp .env.example .env
   ```

2. **Start all services with Docker**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database Admin (PgAdmin): http://localhost:5050
   - Health Check: http://localhost:3001/health

### Development Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# Run database migrations
docker-compose exec backend npm run db:migrate

# Generate Prisma client
docker-compose exec backend npm run db:generate
```

## 📁 Project Structure

```
novella-platform/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & validation
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema
│   └── Dockerfile
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route components
│   │   ├── store/          # State management
│   │   ├── services/       # API calls
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── database/               # Database initialization
├── nginx/                  # Load balancer config
└── docker-compose.yml     # Container orchestration
```

## 🔧 Services

### Backend API (Port 3001)
- **Authentication**: JWT tokens with Redis sessions
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Helmet, CORS, rate limiting
- **Health Check**: `/health` endpoint

### Frontend App (Port 3000)
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom design system
- **Routing**: React Router v6
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation

### Database (Port 5432)
- **PostgreSQL 15** with persistent storage
- **PgAdmin** available at port 5050
- **Redis** for sessions and caching

## 🎯 Features

### Implemented
- ✅ Modern Docker-based development environment
- ✅ PostgreSQL database with comprehensive schema
- ✅ JWT authentication system
- ✅ React frontend with TypeScript
- ✅ TailwindCSS styling with custom design system
- ✅ User registration and login
- ✅ Protected routes and auth state management

### Planned
- 🔄 User profiles and following system
- 🔄 Book search integration (Open Library API)
- 🔄 Review creation and management
- 🔄 Social feed and discovery
- 🔄 Real-time notifications
- 🔄 Image upload for profiles and reviews
- 🔄 Full-text search
- 🔄 Reading lists and progress tracking

## 🔐 Authentication

The platform uses JWT tokens for authentication:
- Tokens stored in local storage (frontend)
- Redis sessions for server-side state
- Protected routes with middleware
- Automatic token refresh

## 📊 Database Schema

Key entities:
- **Users**: Profiles, auth, social connections
- **Books**: Metadata, ratings, cached from Open Library
- **Reviews**: User ratings and detailed reviews
- **Follows**: Social following relationships
- **Reading Lists**: Personal book collections
- **Notifications**: Real-time user notifications

## 🐳 Docker Services

| Service | Description | Port |
|---------|-------------|------|
| frontend | React development server | 3000 |
| backend | Node.js API server | 3001 |
| postgres | PostgreSQL database | 5432 |
| redis | Redis cache & sessions | 6379 |
| pgadmin | Database admin UI | 5050 |
| nginx | Load balancer (production) | 80 |

## 🚀 Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose --profile production up -d
```

## 🔍 Monitoring

- **Health checks** for all services
- **Container logging** via Docker
- **Database monitoring** via PgAdmin
- **API monitoring** via health endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for book lovers everywhere**