# Release Process

This document outlines the process for releasing new versions of Next Prisma Flow Generator.

## Prerequisites

1. **NPM Account**: Ensure you have an npm account with publishing permissions
2. **NPM Token**: Set up `NPM_TOKEN` secret in GitHub repository settings
3. **GitHub Permissions**: Ensure you have write access to create releases

## Release Types

### 1. Stable Release (Recommended)

For production-ready releases:

```bash
# 1. Update version in package.json
# 2. Update CHANGELOG.md with new features/fixes
# 3. Commit changes
git add .
git commit -m "chore: prepare release v1.0.1"

# 4. Create and push version tag
git tag v1.0.1
git push origin v1.0.1

# 5. GitHub Actions will automatically:
#    - Run tests on Node 18, 20, 22
#    - Build the generator
#    - Test with TodoList example
#    - Publish to npm
#    - Create GitHub release
```

### 2. Preview Release (Testing)

For testing new features before stable release:

```bash
# 1. Go to GitHub repository
# 2. Navigate to "Actions" tab
# 3. Select "Publish to NPM" workflow
# 4. Click "Run workflow" button
# 5. This will create a preview version like: 1.0.0-preview.20250601123456.abc1234

# Install preview version:
npm install next-prisma-flow@preview
```

## Automated Testing

Every release automatically runs:

### ✅ **Build Verification**
- Compiles TypeScript to JavaScript
- Verifies output file exists
- Checks bundle size

### ✅ **Generator Testing**
- Runs generator on TodoList example
- Verifies all expected files are generated
- Checks for required functions and types

### ✅ **Code Quality**
- TypeScript compilation check
- Linting with Biome (if configured)
- Security audit

### ✅ **Package Validation**
- Validates package.json structure
- Tests package installation
- Verifies binary availability

## GitHub Secrets Required

Set these in your repository settings under "Settings" > "Secrets and variables" > "Actions":

### `NPM_TOKEN`
```bash
# 1. Login to npm
npm login

# 2. Create automation token
npm token create --type=automation

# 3. Copy the token and add as GitHub secret
```

### `GITHUB_TOKEN`
This is automatically provided by GitHub Actions.

## Version Naming Convention

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features, backward compatible (v1.1.0)
- **PATCH**: Bug fixes, backward compatible (v1.0.1)

### Examples:
```bash
# Bug fix release
v1.0.1

# New feature release
v1.1.0

# Breaking change release
v2.0.0

# Preview releases (automatic)
v1.0.0-preview.20250601123456.abc1234
```

## Release Checklist

Before creating a release:

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with new changes
- [ ] Test locally with `bun run build`
- [ ] Test generator with example: `cd examples/todolist && npx prisma generate`
- [ ] Commit all changes
- [ ] Create and push git tag
- [ ] Verify GitHub Actions run successfully
- [ ] Check npm package is published: `npm view next-prisma-flow`

## Rollback Process

If a release has critical issues:

### 1. Unpublish from npm (within 24 hours)
```bash
npm unpublish next-prisma-flow@1.0.1
```

### 2. Or deprecate the version
```bash
npm deprecate next-prisma-flow@1.0.1 "Critical bug, use v1.0.2 instead"
```

### 3. Fix and release patch version
```bash
git tag v1.0.2
git push origin v1.0.2
```

## Monitoring

After release:

- [ ] Check npm download stats
- [ ] Monitor GitHub issues for bug reports
- [ ] Verify package works in different environments
- [ ] Update documentation if needed

## Troubleshooting

### Common Issues:

1. **"npm ERR! 403 Forbidden"**
   - Check NPM_TOKEN is valid and has publish permissions
   - Verify package name is available

2. **"Tests failed"**
   - Check GitHub Actions logs
   - Fix issues and create new tag

3. **"Package not found after publish"**
   - npm packages can take 5-10 minutes to propagate
   - Check npm registry status

### Getting Help:

- Check GitHub Actions logs
- Review npm publish documentation
- Open issue in repository for assistance