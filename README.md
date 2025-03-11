# Task Manager Application

A modern task management system built with NestJS, Next.js, and Prisma.

## Features

- ✅ Task Creation and Management
- ✅ User Authentication & Authorization
- ✅ Task Categories and Labels
- ✅ Priority Levels
- ✅ Due Date Management
- ✅ Task Search and Filtering
- ✅ RESTful API
- ✅ Responsive Design

## Tech Stack

- **Frontend**: Next.js + TypeScript + Tailwind CSS + Redux Toolkit
- **Backend**: NestJS + Prisma ORM
- **Database**: PostgreSQL
- **Infrastructure**: Docker & Docker Compose

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git (optional, for cloning)

### Installation

1. Clone the repository (or download):

```bash
git clone <repository-url>
cd task-manager-project
```

2. Set up environment variables:

```bash
# Frontend environment
cd apps/web && cp .env.example .env

# Backend environment
cd apps/api && cp .env.example .env
```

3. Start the application:

```bash
docker-compose up -d
```

The services will be available at:

- Web Application: http://localhost:3000
- API: http://localhost:3001
- Prisma Studio: http://localhost:5555

## Development Setup

If you prefer to run the application without Docker:

1. Install dependencies:

```bash
yarn install
```

2. Start development servers:

```bash
yarn dev
```

## Available Scripts

- `yarn dev` - Start development servers
- `yarn build` - Build all applications
- `yarn test` - Run tests
- `yarn lint` - Lint all files

## API Documentation

The API documentation is available at http://localhost:3001/api when the server is running.

## Project Structure

```
task-manager-project/
├── apps/
│   ├── api/         # NestJS backend
│   └── web/         # Next.js frontend
├── packages/
│   └── config/      # Shared configurations
└── docker-compose.yml
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
