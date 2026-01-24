# Contributing to Nestier

Thank you for your interest in contributing to Nestier! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, constructive, and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nestier.git
   cd nestier
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/BrahimAbdelli/nestier.git
   ```
4. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js >= 20.x
- npm >= 9.x
- MongoDB >= 5.0
- Docker (optional, for containerized development)

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.example .env

# Start MongoDB (using Docker)
docker-compose up -d mongodb

# Run in development mode
npm run start:dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run build` | Build the application |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Project Structure

Nestier follows **hexagonal architecture** (ports & adapters). Each module has four layers:

```
src/modules/{module-name}/
├── application/           # Use cases, services, port interfaces
│   ├── ports/            # Input/output interfaces
│   ├── services/         # Application services
│   └── use-cases/        # Business use cases
├── domain/               # Business logic, entities, value objects
│   ├── entities/         # Domain entities
│   ├── errors/           # Domain-specific errors
│   ├── repositories/     # Repository interfaces (ports)
│   └── value-objects/    # Value objects
├── infrastructure/       # External concerns, adapters
│   ├── adapters/         # Repository implementations
│   ├── entities/         # Database entities (TypeORM)
│   └── mappers/          # Entity <-> Domain mappers
├── presentation/         # HTTP layer
│   ├── controllers/      # REST controllers
│   ├── dtos/            # Data Transfer Objects
│   └── mappers/         # DTO <-> Domain mappers
└── test/                # Module-specific tests
```

## Coding Guidelines

### General Principles

- Follow **SOLID** principles
- Write **clean, readable code**
- Keep functions **small and focused**
- Use **meaningful variable and function names**
- Add **JSDoc comments** for public APIs

### TypeScript Guidelines

- Enable **strict mode** (already configured)
- Use **interfaces** for object shapes
- Use **type** for unions and primitives
- Avoid **any** type - use **unknown** if necessary
- Use **readonly** where applicable

### Architecture Rules

1. **Domain layer** must have no external dependencies
2. **Application layer** depends only on domain
3. **Infrastructure layer** implements domain ports
4. **Presentation layer** handles HTTP concerns only

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `UserService` |
| Interfaces | PascalCase with prefix | `IUserRepository` or `UserRepositoryInterface` |
| Functions | camelCase | `findByEmail` |
| Variables | camelCase | `userEmail` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Files | kebab-case | `user.service.ts` |
| Directories | kebab-case | `error-handling` |

### File Organization

- One class per file
- Group related files in directories
- Use barrel exports (`index.ts`)
- Keep test files next to source files

## Commit Guidelines

We use **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```
feat(user): add password reset functionality

- Add forgot-password endpoint
- Add reset-password endpoint
- Add email template for password reset

Closes #123
```

```
fix(product): correct price validation logic

The validation was allowing negative prices.
```

## Pull Request Process

1. **Ensure your code follows** the coding guidelines
2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Run all tests** and ensure they pass:
   ```bash
   npm run lint
   npm test
   npm run test:e2e
   ```
5. **Update the CHANGELOG.md** with your changes
6. **Create a Pull Request** with a clear description

### PR Title Format

Use the same format as commit messages:
```
feat(user): add two-factor authentication
```

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how to test the changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

## Testing

### Unit Tests

- Place unit tests in a `test` directory within the module
- Use `*.spec.ts` extension
- Mock external dependencies
- Test edge cases

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:cov

# Run specific test file
npm test -- user.service.spec.ts
```

### E2E Tests

- Place E2E tests in the module's `test` directory
- Use `*.e2e-spec.ts` extension
- Test full request/response cycle

```bash
# Run E2E tests
npm run test:e2e
```

### Coverage Requirements

- Maintain minimum 80% code coverage
- All new features must have tests
- Bug fixes should include regression tests

## Documentation

- Update **README.md** for user-facing changes
- Add **JSDoc comments** for public APIs
- Update **Swagger decorators** for API changes
- Keep **CHANGELOG.md** up to date

## Questions?

If you have questions, feel free to:
- Open an issue on GitHub
- Contact the maintainer

Thank you for contributing!
