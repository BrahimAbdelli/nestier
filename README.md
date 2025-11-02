<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  <h1>Nestier</h1>
  <p>
    <strong>A production-ready NestJS boilerplate with Hexagonal Architecture and Generic Repository Pattern</strong>
  </p>
  
  <p>
    <a href="https://github.com/BrahimAbdelli/nestier/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/typescript-5.1.3-blue.svg" alt="TypeScript"></a>
    <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/nestjs-10.0.0-red.svg" alt="NestJS"></a>
    <img src="https://img.shields.io/badge/coverage-82%25-brightgreen.svg" alt="Coverage">
    <img src="https://img.shields.io/badge/tests-177%20passing-success.svg" alt="Tests">
  </p>
</div>

---

## What is this?

Nestier is a boilerplate that shows you how to build scalable NestJS applications using hexagonal architecture and generic repositories. It includes three example modules that demonstrate different implementation patterns:

- **Category Module**: Uses the base repository directly
- **Product Module**: Extends the base repository with custom queries
- **User Module**: Full custom implementation with authentication

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run the app
npm run start:dev
```

The API will be available at `http://localhost:80/api` and Swagger docs at `http://localhost:80/docs`.

## Project Structure

```
src/
├── modules/
│   ├── base/          # Generic base module (repository, service, controller)
│   ├── category/      # Simple CRUD example
│   ├── product/       # Extended CRUD with custom features
│   └── user/          # Custom auth implementation
└── shared/
    ├── common/        # Utilities (logger, error handling, email)
    └── config/        # Configuration management
```

## Architecture

The project follows hexagonal architecture with four layers:

1. **Domain**: Business entities and rules
2. **Application**: Use cases and services
3. **Infrastructure**: Database, external services
4. **Presentation**: Controllers and DTOs

<div align="center">
  <img src="./public/architecture-diagram.svg" alt="Architecture" width="100%">
</div>

## Key Features

- JWT authentication with password reset
- Generic CRUD operations (create, read, update, delete, archive)
- Advanced search with filtering and pagination
- Email service with Mailjet
- Structured logging with Winston
- Comprehensive error handling
- 82% test coverage
- Docker support

## Environment Variables

```env
# Server
PORT=80
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE_NAME=shop

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h

# Email
MAILJET_API_KEY=your-api-key
MAILJET_SECRET_KEY=your-secret-key
MAILJET_SENDER_EMAIL=noreply@example.com
```

## API Examples

### Authentication

```bash
# Sign up
POST /api/users/signup
{
  "username": "john",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Login
POST /api/users/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### CRUD Operations

```bash
# Create
POST /api/products
{
  "name": "Product Name",
  "price": 99.99
}

# Get all
GET /api/products

# Get by ID
GET /api/products/find/:id

# Update
PUT /api/products/:id

# Archive (soft delete)
PATCH /api/products/archive/:id

# Delete
DELETE /api/products/:id
```

### Advanced Search

```bash
POST /api/products/search
{
  "attributes": [
    { "key": "price", "value": 100, "comparator": "GREATER_THAN" }
  ],
  "orders": { "price": "DESC" },
  "take": 10,
  "skip": 0
}
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## Code Quality

```bash
# Run linter
npm run lint

# Run SonarQube analysis
npm run sonar:analyze
```

## Docker

```bash
# Start all services (app + MongoDB + SonarQube)
docker-compose up -d

# Stop services
docker-compose down
```

## Tech Stack

- **NestJS** - Framework
- **TypeScript** - Language
- **MongoDB** - Database
- **TypeORM** - ORM
- **JWT** - Authentication
- **Winston** - Logging
- **Mailjet** - Email service
- **Jest** - Testing
- **SonarQube** - Code quality

## License

MIT

## Author

**Brahim Abdelli**
- Website: [brahimabdelli.dev](https://brahimabdelli.dev)
- GitHub: [@BrahimAbdelli](https://github.com/BrahimAbdelli)
