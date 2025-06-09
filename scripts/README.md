# Baseline Comparison Tool

A powerful script to compare generated code with the baseline reference implementation.

## Usage

```bash
# Compare all hooks files across all models
bun run test:baseline hooks

# Compare all atoms files across all models  
bun run test:baseline atoms

# Compare only post model hooks file
bun run test:baseline post hooks

# Compare all files for all models
bun run test:baseline all

# Compare all files for post model only
bun run test:baseline post all
```

## Available File Types

- `hooks` - React hooks for state management
- `atoms` - Base Jotai atoms
- `actions` - Server actions
- `derived` - Derived atoms and selectors
- `fx` - Effect atoms for async operations
- `types` - TypeScript type definitions  
- `schemas` - Zod validation schemas
- `config` - Model configuration
- `index` - Barrel exports
- `all` - All file types

## Available Models

- `post` - Blog post model
- `author` - Author model  
- `category` - Category model
- `comment` - Comment model

## Script Workflow

1. **Build Generator** - Compiles the latest generator code
2. **Generate Code** - Runs `prisma generate` in examples/blog
3. **Discover Files** - Finds matching baseline and generated files
4. **Compare Files** - Shows detailed diffs with colored output
5. **Summary Report** - Displays pass/fail statistics

## Exit Codes

- `0` - All files match baseline (success)
- `1` - Differences found between baseline and generated code
- `2` - Script error (build failed, invalid arguments, etc.)

## Output Features

- ✅ **Colored Diffs** - Green for additions, red for removals
- 📊 **Summary Statistics** - Pass rate and difference counts
- 🎯 **Smart Filtering** - Filter by model and/or file type
- 🧹 **Content Normalization** - Ignores timestamps and volatile content

## Examples

### Check specific model and file
```bash
bun run test:baseline post hooks
# Output: Compares only baseline/post/hooks.ts with generated/post/hooks.ts
```

### Check all atoms files
```bash
bun run test:baseline atoms
# Output: Compares all atoms.ts files across all models
```

### Full comparison
```bash
bun run test:baseline all
# Output: Compares every file in the baseline with generated equivalent
```

## Development Workflow

This tool is essential for:

- **Validating Generator Changes** - Ensure new templates match baseline quality
- **Regression Testing** - Catch unintended changes to generated code
- **Debugging** - Quickly identify what changed between baseline and generated code
- **Quality Assurance** - Maintain consistency across all generated files

The tool automatically normalizes generated timestamps and headers for meaningful comparisons.