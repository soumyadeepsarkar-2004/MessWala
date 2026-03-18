## [1.1.2](https://github.com/soumyadeepsarkar-2004/MessWala/compare/v1.1.1...v1.1.2) (2026-03-18)


### Bug Fixes

* correct CSV export formatting and ensure proper string interpolation ([727b832](https://github.com/soumyadeepsarkar-2004/MessWala/commit/727b832eb66b3b23158c63987df2f664e10bb7fd))
* document required GitHub secrets for Vercel deployment ([fa21199](https://github.com/soumyadeepsarkar-2004/MessWala/commit/fa211991ee23eed695837b5fd67361bf0b2b6fde))
* make Vercel deployment conditional on token availability and add quotes around secrets ([d5871c3](https://github.com/soumyadeepsarkar-2004/MessWala/commit/d5871c3129ae6852da9e8fc1d7406e9319f8079b))
* make Vercel deployment secrets optional with conditional check ([d2b0152](https://github.com/soumyadeepsarkar-2004/MessWala/commit/d2b0152e14527d5326339981a9da91917ec07c27))
* move Vercel secrets to step-level env and add runtime check with documentation ([18e0e2a](https://github.com/soumyadeepsarkar-2004/MessWala/commit/18e0e2a48168e49a5edc88f12297d86ecbbc3f2e))
* normalize line endings (LF) for all files ([74e0c9a](https://github.com/soumyadeepsarkar-2004/MessWala/commit/74e0c9aa554d80f101fca567e1c01859e9de459a))
* remove manual Vercel deployment job (Vercel GitHub integration handles auto-deployment) ([aecc476](https://github.com/soumyadeepsarkar-2004/MessWala/commit/aecc476d5b954f6cf231187e96408bf88ea8d039))
* update Vercel deployment action to official vercel/action and add environment context ([474fbff](https://github.com/soumyadeepsarkar-2004/MessWala/commit/474fbffe5e0bc9b84bd9709932f862238ef19fd6))
* use default empty values for optional Vercel secrets to avoid context warnings ([25b2f73](https://github.com/soumyadeepsarkar-2004/MessWala/commit/25b2f732eb18683d0acb6e0c094a258344a2c3af))
* use official vercel/action for cleaner deployment workflow ([4aa4a7b](https://github.com/soumyadeepsarkar-2004/MessWala/commit/4aa4a7b062fd74d8cd2aa76ca9f9faad89a384fa))
* use step-level condition for optional Vercel secrets with env context ([de38538](https://github.com/soumyadeepsarkar-2004/MessWala/commit/de385384c3823521eeb9b09d00298f2e6a5f6504))
* use Vercel CLI for deployment with proper environment variable handling ([6a495c8](https://github.com/soumyadeepsarkar-2004/MessWala/commit/6a495c8695d2a949a648ace752ec7ab2fac37141))

## [1.1.1](https://github.com/soumyadeepsarkar-2004/MessWala/compare/v1.1.0...v1.1.1) (2026-03-18)


### Bug Fixes

* correct Navbar test import path ([de4e3d5](https://github.com/soumyadeepsarkar-2004/MessWala/commit/de4e3d52e6b6062b32f420ee9422031494e91e65))
* remove unused import in mealController ([746bfee](https://github.com/soumyadeepsarkar-2004/MessWala/commit/746bfee332aa6b1f3c72813a73822568be71367d))
* update validation utilities to support default parameters ([dfb38ec](https://github.com/soumyadeepsarkar-2004/MessWala/commit/dfb38ec246b72932d729b086196829db2fca6f2d))

# [1.1.0](https://github.com/soumyadeepsarkar-2004/MessWala/compare/v1.0.0...v1.1.0) (2026-03-18)


### Bug Fixes

* resolve linting and formatting issues across backend and frontend ([eba025b](https://github.com/soumyadeepsarkar-2004/MessWala/commit/eba025b0d53bb4bfe0f420249abe374a09862a12))


### Features

* enterprise-grade utilities, comprehensive testing, and infrastructure ([5b772dd](https://github.com/soumyadeepsarkar-2004/MessWala/commit/5b772dda84112d63392842eab26da32d92def3ce))

# 1.0.0 (2026-03-18)


### Bug Fixes

* Add JWT_SECRET fallback and startup validation to prevent login failures ([3a1f237](https://github.com/soumyadeepsarkar-2004/MessWala/commit/3a1f237fb0a90284cf3f206379bc070d1adb9d79))
* Add newline at end of vercel.json for proper formatting ([9435a48](https://github.com/soumyadeepsarkar-2004/MessWala/commit/9435a48ec880b3d800f8a17e06d5cdd99d28977a))
* Add railway.json to explicitly set build/start commands for backend-only deployment ([422c5ee](https://github.com/soumyadeepsarkar-2004/MessWala/commit/422c5ee5c47bebb7cd08445cda271fdde12e632f))
* Add vite-plugin-pwa to frontend dependencies ([27b192d](https://github.com/soumyadeepsarkar-2004/MessWala/commit/27b192dce674669e7225599edce49daddbfe15df))
* await MongoDB connection before handling serverless requests ([cd37110](https://github.com/soumyadeepsarkar-2004/MessWala/commit/cd37110aec5c18ee067cc8aacdef0cb1650a2035))
* CORS - move before helmet, use origin:true for preflight; CSP - allow Google Fonts in connect-src ([eb09ef6](https://github.com/soumyadeepsarkar-2004/MessWala/commit/eb09ef614b10a2eb4208b6b0477d82551a3a7dca))
* **deploy:** Add explicit fatal error for missing env vars and set node version ([4acb313](https://github.com/soumyadeepsarkar-2004/MessWala/commit/4acb3135f2ff0bd3e9d2dd8044d564e41098b6ea))
* **deploy:** Add root package.json and Procfile for Railway ([65f30cb](https://github.com/soumyadeepsarkar-2004/MessWala/commit/65f30cb2b552d7b410f4472df9b3efc1ff7b83d0))
* **deploy:** Bump version to 1.0.1 and force rebuild with fallback URI ([3ce10ac](https://github.com/soumyadeepsarkar-2004/MessWala/commit/3ce10ac160d98d39b64bd903829c626fec38e3a1))
* **deploy:** Configure Vercel build directory ([9f6ee3f](https://github.com/soumyadeepsarkar-2004/MessWala/commit/9f6ee3fe5f91add18fd1cb9dd2b26de677633195))
* **deploy:** Embed MongoDB URI as fallback to fix startup crash ([fc829b5](https://github.com/soumyadeepsarkar-2004/MessWala/commit/fc829b5cbc9354cf3147586da2a56c98827a531c))
* **deploy:** Enhanced logging and graceful shutdown for errors ([2b0368f](https://github.com/soumyadeepsarkar-2004/MessWala/commit/2b0368fcafb40eb8765adfd6b7aea0d643ca8d02))
* explicitly bind to 0.0.0.0 for container IPv4 compatibility ([f12c059](https://github.com/soumyadeepsarkar-2004/MessWala/commit/f12c05966e0b53cb4d75974f830a0291e87be8a6))
* Force Vite build via builds array and allow unsafe-eval in CSP for Recharts ([25eb227](https://github.com/soumyadeepsarkar-2004/MessWala/commit/25eb227ef2042acf463575271ee600b623e33d03))
* Move health check route before error handler so it responds correctly ([c485c2b](https://github.com/soumyadeepsarkar-2004/MessWala/commit/c485c2b0ff61df3b1771650108c7024bbcaf2070))
* Move vercel.json to root with builds array to fix Git-triggered deployments ([2c26c3b](https://github.com/soumyadeepsarkar-2004/MessWala/commit/2c26c3bfa3540f2697316cbd3b203ed3feee6395))
* Refactor rate limiting and CORS configuration for improved readability ([8166fd1](https://github.com/soumyadeepsarkar-2004/MessWala/commit/8166fd16e6f7d139fcd3179dc402e487e26d4817))
* Relax helmet policies for Railway proxy compatibility ([28da1f0](https://github.com/soumyadeepsarkar-2004/MessWala/commit/28da1f0a0a9c537a58d4741f1ccf99a924fd862c))
* Remove 0.0.0.0 binding, add root route, add .railwayignore ([3f6a48b](https://github.com/soumyadeepsarkar-2004/MessWala/commit/3f6a48b79c91dccd0fbe1d14aa7ee82923efb32f))
* Remove build script from root pkg.json so Railway doesn't build frontend; update vercel.json to use installCommand/buildCommand ([75ca3bb](https://github.com/soumyadeepsarkar-2004/MessWala/commit/75ca3bb73b2da1c3fc5e86f20fbc03de894695d0))
* Remove railway.json and Procfile - will set Root Directory to backend in Railway settings ([bb1f775](https://github.com/soumyadeepsarkar-2004/MessWala/commit/bb1f775e9d7df91a0c6f02394cf2857d61abc1a2))
* resolve npm peer dependency conflicts in frontend build ([154c9ea](https://github.com/soumyadeepsarkar-2004/MessWala/commit/154c9eaa59cace76787876c7ca4ebc6e384c7805))
* resolve vite and @vitejs/plugin-react version conflict ([43b6bce](https://github.com/soumyadeepsarkar-2004/MessWala/commit/43b6bcec9c181d9ad8115c291c48f1dca7bcc1e9))
* resolve vite build compatibility and npm dependency conflicts ([c703627](https://github.com/soumyadeepsarkar-2004/MessWala/commit/c7036273a9bc5849ece955b452cc7373107caec6))
* Retry MongoDB connection with backoff, bind port immediately to prevent Railway crashes ([cc8d85f](https://github.com/soumyadeepsarkar-2004/MessWala/commit/cc8d85f89dc71cef270602b9299a669a87a09b0d))
* Set Vercel output directory to dist for Vite ([a226f0a](https://github.com/soumyadeepsarkar-2004/MessWala/commit/a226f0abe2e31ec5d2aa56817a7b161c7544c277))
* use direct node command to avoid nested npm subprocess issue on Railway ([306a004](https://github.com/soumyadeepsarkar-2004/MessWala/commit/306a004e0ab77e7fadc86fb184f57d18a94fd9f2))
* Use stronger JWT_SECRET fallback ([42259f7](https://github.com/soumyadeepsarkar-2004/MessWala/commit/42259f73bdb90a92b03de22d538dd4c74db77298))


### Features

* add Render.com deployment config, update CSP for Render domain ([0a16702](https://github.com/soumyadeepsarkar-2004/MessWala/commit/0a16702f5d76d0f446569161608a9c6b5669adf5))
* Complete remaining features - PWA, security, forecast, fixes ([97782f6](https://github.com/soumyadeepsarkar-2004/MessWala/commit/97782f685e7ad4558828ef87fb97aaf47e5dcdc3))
* deploy backend as Vercel serverless function ([fb117a1](https://github.com/soumyadeepsarkar-2004/MessWala/commit/fb117a1ea6270314a1211983d70a9e12348eefe1))
* Implement initial authentication context, API client, and backend server setup. ([9fe1e22](https://github.com/soumyadeepsarkar-2004/MessWala/commit/9fe1e2294095818137d69eb18f3fd1b00986b217))
* implement Phases 2-4 infrastructure, features, and enterprise support ([ec90305](https://github.com/soumyadeepsarkar-2004/MessWala/commit/ec90305cf28dc89c18cfa7901a3285566ce67c7a))
* replace email/password auth with Google Sign-In + reCAPTCHA v3 ([944806e](https://github.com/soumyadeepsarkar-2004/MessWala/commit/944806ea3d9681023c3da578799fe5ea79e58f86))

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
