# Task Manager Application

A modern task management system built with NestJS, Next.js, and Prisma.

## Features

- ✅ Task Assignment
- ✅ User Authentication & Authorization
- ✅ Task Status
- ✅ Priority Levels
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
- Node 22.x or higher
- Yarn and NPS (Node Package Scripts) installed globally
- Git (optional, for cloning)

### Installation

1. Clone the repository (or download):

```bash
git clone <repository-url>
cd task-manager-project
```

2. Start the application:

```bash
docker-compose up
```

It will start all three services: DB, API, and Web.
Default user created is `admin@example.com` with password `admin123`.
Some initial tasks will be pre-generated.

The services will be available at:

- Web Application: http://localhost:3000
- API: http://localhost:5002
- Database: http://localhost:5432

## Development Setup

If you prefer to run the application without Docker:

1. Prepare dependencies:

```bash
nps prepare
```

2. Start PostgreSQL:

```bash
docker-compose up -d db
```

3. Update environment DATABASE_URL variable in API `.env` file to be correct, refer Postgres Image in `docker-compose.yml` file:

4. Start development servers:

```bash
nps dev
```

## Available Scripts

- `nps dev` - Start development servers
- `nps test` - Run tests

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
