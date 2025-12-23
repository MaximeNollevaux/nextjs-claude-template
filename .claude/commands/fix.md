---
description: Analyze and fix errors in the codebase
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task
model: sonnet
---

# Fix Errors Command

Automatically detect, analyze, and fix errors in your codebase.

## Workflow

### 1. Detect Errors

**TypeScript errors:**
```bash
npx tsc --noEmit
```

**ESLint errors:**
```bash
npm run lint
```

**Build errors:**
```bash
npm run build 2>&1 | head -50
```

### 2. Analyze Errors

- Read the error messages carefully
- Identify the root cause
- Locate the problematic files

### 3. Fix Errors

For each error:
- Read the file with the error
- Understand the context
- Apply the fix using the Edit tool
- Verify the fix doesn't break anything else

### 4. Verify Fixes

After fixing:
```bash
npx tsc --noEmit  # No TypeScript errors
npm run lint      # No ESLint errors
npm run build     # Successful build
```

## Common Fixes

### Type Errors
- Add missing type annotations
- Fix type mismatches
- Update interfaces/types

### Import Errors
- Fix import paths
- Add missing imports
- Remove unused imports

### Logic Errors
- Fix undefined/null checks
- Correct async/await usage
- Fix conditional logic

## Guidelines

- **Fix one error at a time**
- **Test after each fix**
- **Don't introduce new errors**
- **Keep changes minimal**
- **Preserve existing functionality**

## Example Flow

```bash
# 1. Detect
npx tsc --noEmit
# Error: Property 'name' does not exist on type 'User'

# 2. Read the file
# Read the User type definition

# 3. Fix
# Add 'name' property to User interface

# 4. Verify
npx tsc --noEmit
# ✓ No errors
```
