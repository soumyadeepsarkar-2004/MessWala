# Contributing to MessWala

Thanks for your interest in contributing to MessWala! 🍛

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/soumyadeepsarkar-2004/MessWala.git`
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit both .env files with your credentials
   ```
5. Start development:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

> **Note:** To populate development data, set `NODE_ENV=development` and run `ALLOW_SEED=true npm run seed` in the backend folder. This is for local development only.

## Development Guidelines

- Follow existing code style and patterns
- Write descriptive commit messages
- Test your changes before submitting a PR
- Update documentation if needed

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit
3. Push to your fork and submit a Pull Request
4. Describe your changes in the PR description

## Issues

- Check existing issues before creating new ones
- Use issue templates when available
- Include steps to reproduce for bug reports

## Code of Conduct

Be respectful, inclusive, and constructive.
