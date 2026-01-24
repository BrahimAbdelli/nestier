# Changelog

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
