# Changelog

## [2.0.3] - 2026-07-26

### Changed (hexagonal Phase 1 — base kernel)
- Moved `BaseEntity` from domain to `infrastructure/persistence/typeorm/`
- `BaseRepository<D>` / `BaseService<D>` no longer parameterized by TypeORM entities
- Repository `findAndCount` uses domain `FindAndCountCriteria` (TypeORM translation in adapter only)
- `BaseControllerInterface` lives under presentation; `findOne` returns DTOs via mapper
- Port IDs use `string` (adapters convert to/from `ObjectId`)

### Fixed
- Easy ESLint wins: unused imports/vars, redundant `return await` / useless `async`, missing return types, typed user route params (~36 warnings cleared)
- CI `format:check`: force LF via `.editorconfig` / Prettier / `.gitattributes` (was CRLF locally vs LF on Linux runners)

### Changed (dependencies)
- `npm update --legacy-peer-deps` within caret ranges (NestJS 11.1.28, TypeORM 0.3.31, mongodb 7.5.0, eslint 10.8.0, …)
- Left major bumps alone (AutoMapper 9, TypeScript 7, nodemailer 9, puppeteer 25, sonarqube-scanner 5)
- Add `@eslint/js` (required by flat `eslint.config.js` on ESLint 10)
- Track `package-lock.json` again so CI `npm ci` works; add `format:check` script

### Verified
- Unit tests: 127/127
- E2E tests: 85/85

## [2.0.2] - 2026-07-19

### Changed
- Repository `delete` uses criteria `{ _id }` instead of a bare id argument
- Mailer template path resolves from `process.cwd()/templates` (works in dist and Docker)
- Docker Compose / CI MongoDB image bumped to `mongo:7.0` (matches MongoDB driver 7)
- README badges and tech stack versions synced with `package.json`
- Dependency updates via `npm update --legacy-peer-deps` (NestJS 11.1.28, TypeORM 0.3.31, mongodb 7.5.0, …)
- Enable `esModuleInterop`; E2E specs use default `supertest` import (compatible with newer `@types/supertest`)

### Notes
- TypeORM `Equal()` is **not** used in Mongo persistence: FindOperators are not applied the same way as on SQL and break lookups. Use `Equal()` when forking to MySQL/Postgres (ChainVault pattern).

### Verified
- Unit tests: 127/127
- E2E tests: 85/85

## [2.0.1] - 2026-01-24

### Changed
- **Major Updates**: Migrated to NestJS v11.1.12 and MongoDB driver v7.0.0
- Updated all NestJS packages to v11 (common, core, platform-express, swagger, testing)
- Updated MongoDB driver from v6.21.0 to v7.0.0
- Updated nodemailer to v7.0.12 (security fix for MEDIUM vulnerability)

### Dependencies Updated
- `@nestjs/common`: 10.3.8 → 11.1.12
- `@nestjs/core`: 10.3.8 → 11.1.12
- `@nestjs/platform-express`: 10.4.22 → 11.1.12
- `@nestjs/swagger`: 7.4.2 → 11.2.5
- `@nestjs/testing`: 10.3.8 → 11.1.12
- `mongodb`: 6.21.0 → 7.0.0
- `nodemailer`: 7.0.10 → 7.0.12 (security fix)

### Verified
- ✅ All unit tests passing (127/127)
- ✅ All E2E tests passing
- ✅ Build successful
- ✅ No breaking changes detected

## [2.0.0] - 2025-01-24

### Added
- Hexagonal architecture implementation
- Generic repository pattern for MongoDB with TypeORM
- JWT authentication with password reset
- Email service with Mailjet integration
- Advanced search with filtering and pagination
- Structured logging with Winston
- Comprehensive error handling
- 80%+ test coverage (212 tests: 127 unit + 85 e2e)
- SonarQube integration
- Docker support
- Swagger API documentation
- ConfigProductModel for product-specific configuration
- Environment-based restricted words configuration
- GitHub Actions CI/CD workflows
- Postman collection with environment variables

### Modules
- **Base Module**: Generic CRUD operations
- **Category Module**: Full generic implementation
- **Product Module**: Extended with custom features and restricted word validation
- **User Module**: Custom auth implementation with email notifications

### Changed
- Refactored validation pipes for better type safety
- Improved error mapping and handling
- Optimized database queries
- Fixed race conditions in E2E tests
- Enhanced code organization and structure

### Fixed

#### Bug Fixes
- 🐛 **E2E Test Failures**: Fixed race conditions in user tests
- 🐛 **Archive/Unarchive Tests**: Resolved user creation conflicts
- 🐛 **Logger Errors**: Fixed missing method implementations
- 🐛 **Validation Issues**: Corrected validation logic in pipes

#### Code Smells
- 🧹 **Duplicate Imports**: Consolidated duplicate import statements
- 🧹 **Nested Ternaries**: Refactored complex conditional logic
- 🧹 **Boolean Literals**: Improved boolean comparisons
- 🧹 **String Interpolation**: Better error message formatting
- 🧹 **Commented Code**: Removed or properly documented commented code
- 🧹 **Empty Methods**: Added meaningful comments or implementations
- 🧹 **Static Properties**: Made static properties readonly
- 🧹 **Deprecated APIs**: Replaced deprecated TypeORM methods
- 🧹 **Unused Imports**: Removed unused import statements
- 🧹 **TODO Comments**: Implemented or documented all TODOs
- 🧹 **Redundant Type Aliases**: Removed unnecessary type aliases in logger service

#### Security
- 🔒 **Email Regex**: Fixed ReDoS vulnerability in email validation
- 🔒 **Password Hashing**: Secure bcrypt implementation
- 🔒 **JWT Security**: Proper token validation and expiration
- 🔒 **Input Sanitization**: Enhanced validation and sanitization

### Technical Debt Resolved
- ✅ Achieved 80%+ test coverage
- ✅ Zero critical SonarQube violations
- ✅ All tests passing (212/212)
- ✅ Comprehensive documentation
- ✅ Production-ready configuration
- ✅ Docker deployment support
- ✅ Synchronized environment files (.env, .env.example, .env.test)

## [1.0.0] - Initial Release

Basic NestJS setup with MongoDB and TypeORM.
