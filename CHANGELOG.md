# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive input validation utilities to prevent NoSQL injection
- Date/month/enum validation across all API endpoints
- Support for rate-limited users to see helpful error messages
- Enhanced security documentation
- Code of Conduct (Contributor Covenant)
- Security Policy for vulnerability reporting
- MkDocs documentation system with Material theme
- GitHub Pages deployment for documentation

### Changed
- Improved error handling in all controllers
- Replaced regex-based filtering with safer string comparison operators
- Updated vite from ^8.0.0 to ^5.0.0 for React plugin compatibility
- Enhanced documentation structure with docs-src separation

### Fixed
- 91+ code scanning issues related to unsafe input handling
- Resolved vite and @vitejs/plugin-react peer dependency conflicts
- Fixed broken internal documentation links
- Removed all credential-like patterns from documentation examples

### Security
- Fixed potential ReDoS attacks by removing untrusted regex expressions
- Implemented comprehensive input validation framework
- Added security headers (Helmet.js)
- Rate limiting for authentication endpoints

## [1.0.1] - 2024-03-17

### Added
- Expanded admin documentation and setup wizard
- Additional troubleshooting guides for common issues
- More detailed API endpoint examples
- Cost per plate analytics calculations

### Changed
- Improved feedback collection system
- Enhanced task management UI
- Better error messages for authentication failures

### Fixed
- Login page accessibility improvements
- Mobile responsiveness issues
- Expense export CSV formatting

## [1.0.0] - 2024-03-01

### Initial Release

#### Features
- **Multi-Role Authentication:** Google OAuth for students, credential-based for admins
- **Role-Based Access Control:** Student, Mess Manager, Treasurer, Admin roles
- **Cost Analytics:** Monthly expense trends, category breakdown, cost per plate
- **Meal Management:** Daily attendance tracking, menu management, feedback system
- **Predictive Analytics:** Linear regression-based expense forecasting
- **Task Management:** Assignment and tracking of mess-related tasks
- **Real-time Dashboard:** Comprehensive analytics dashboard
- **Data Export:** CSV export for accounting and record-keeping

#### Backend
- Express.js REST API
- MongoDB database
- JWT authentication
- Rate limiting with MongoDB store
- Helmet.js security headers
- CORS support for multiple origins

#### Frontend
- React 18 with Vite build tool
- Tailwind CSS styling
- React Router for navigation
- Recharts for analytics visualization
- Responsive design for mobile and desktop
- PWA support

#### Infrastructure
- Backend hosted on Render
- Frontend hosted on Vercel
- GitHub Pages documentation
- CodeQL security scanning
- Environment-based configuration

#### Documentation
- Comprehensive API documentation
- User guides for different roles
- Deployment guides for Render and Vercel
- Architecture overview
- Troubleshooting guides

### Known Limitations
- No mobile app (web-responsive only)
- Single MongoDB instance (no replication)
- Limited internationalization (English only)
- No offline support

---

## Version Numbering

We use Semantic Versioning (MAJOR.MINOR.PATCH):

- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes and minor improvements

## How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Reporting Issues

Found a bug or want to suggest a feature? See [Security Policy](SECURITY.md) for security issues, or open a regular [GitHub Issue](https://github.com/soumyadeepsarkar-2004/MessWala/issues).

---

**Note:** This changelog is actively maintained. Unreleased changes will be collected here and released in the next version.
