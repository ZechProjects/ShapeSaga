# Contributing to ShapeSaga

Thank you for your interest in contributing to ShapeSaga! This document provides guidelines for contributing to the project.

## Code of Conduct

Please be respectful and professional in all interactions. We're building an inclusive community where everyone can contribute.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Git
- MetaMask or compatible Ethereum wallet
- Basic knowledge of React, TypeScript, and Solidity

### Setup Development Environment

1. **Fork and clone the repository**

```bash
git clone https://github.com/yourusername/ShapeSaga.git
cd ShapeSaga
```

2. **Install dependencies**

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Set up environment variables**

```bash
# In contracts directory
cp .env.example .env

# In frontend directory
cp .env.example .env
```

4. **Run tests**

```bash
# Test smart contracts
cd contracts && npm test

# Test frontend (once implemented)
cd frontend && npm test
```

## Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

- `feat(contracts): add story branching functionality`
- `fix(frontend): resolve wallet connection issue`
- `docs(readme): update installation instructions`

## Smart Contract Development

### Guidelines

- Use OpenZeppelin contracts when possible
- Follow Solidity style guide
- Include comprehensive tests
- Add NatSpec documentation
- Consider gas optimization

### Testing

- Unit tests for all functions
- Integration tests for contract interactions
- Edge case and error condition testing
- Gas usage analysis

### Security

- Follow security best practices
- Use reentrancy guards where needed
- Validate all inputs
- Consider front-running attacks

## Frontend Development

### Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Implement responsive design
- Ensure accessibility compliance
- Optimize for performance

### Component Structure

```typescript
interface ComponentProps {
  // Define prop types
}

export function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### State Management

- Use React hooks for local state
- Use Zustand for global state
- Use React Query for server state

## Pull Request Process

### Before Submitting

1. Ensure all tests pass
2. Update documentation if needed
3. Follow code style guidelines
4. Rebase on latest main branch

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

### Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. Address all feedback before merge
4. Squash commits when merging

## Issue Reporting

### Bug Reports

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment**

- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
```

### Feature Requests

```markdown
**Problem Description**
What problem does this solve?

**Proposed Solution**
Describe your solution

**Alternatives Considered**
Other solutions you considered

**Additional Context**
Any other context or screenshots
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Prefer functional components
- Use meaningful variable names
- Add JSDoc comments for complex functions

### Solidity

- Follow official Solidity style guide
- Use latest stable compiler version
- Include NatSpec documentation
- Optimize for gas efficiency

### CSS/Styling

- Use Tailwind CSS utilities
- Create reusable component classes
- Follow mobile-first approach
- Ensure accessibility compliance

## Documentation

### Requirements

- Update README files for significant changes
- Add inline code comments
- Document API changes
- Include examples for new features

### Style Guide

- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use proper markdown formatting

## Release Process

### Version Numbering

- Follow Semantic Versioning (SemVer)
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Git tag created

## Community

### Communication Channels

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Discord: Real-time community chat

### Getting Help

1. Check existing documentation
2. Search existing issues
3. Ask in GitHub Discussions
4. Join community Discord

## Recognition

Contributors will be recognized in:

- README contributor section
- Release notes
- Community highlights

Thank you for contributing to ShapeSaga! 🚀
