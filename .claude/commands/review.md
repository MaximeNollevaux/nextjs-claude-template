---
description: Review code quality before committing
allowed-tools: Bash, Read, Grep, Glob
model: sonnet
---

# Code Review Command

Perform a thorough code review before committing changes.

## Review Checklist

### 1. Code Quality
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code follows project conventions
- [ ] Functions are properly typed
- [ ] No any types used

### 2. Security
- [ ] No hardcoded credentials or API keys
- [ ] No sensitive data in console.logs
- [ ] Input validation is present
- [ ] SQL injection prevention (if applicable)
- [ ] XSS prevention (if applicable)

### 3. Performance
- [ ] No unnecessary re-renders
- [ ] Proper use of useMemo/useCallback
- [ ] Images are optimized
- [ ] No memory leaks
- [ ] Efficient database queries

### 4. Testing
- [ ] Critical paths have tests
- [ ] Edge cases are handled
- [ ] Error states are handled
- [ ] Loading states are handled

### 5. Documentation
- [ ] Complex logic has comments
- [ ] Functions have JSDoc (if needed)
- [ ] README is updated (if needed)

### 6. Git
- [ ] No debug code left in
- [ ] No commented-out code
- [ ] Commit message is clear
- [ ] Changes are atomic

## Workflow

1. **Run checks**
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```

2. **Review changes**
   ```bash
   git diff
   ```

3. **Look for issues**
   - Search for `console.log`, `debugger`, `TODO`, `FIXME`
   - Check for hardcoded values
   - Verify error handling

4. **Provide feedback**
   - List any issues found
   - Suggest improvements
   - Confirm if ready to commit

## Example Output

```
✅ TypeScript: No errors
✅ ESLint: No warnings
✅ Build: Successful
⚠️  Found 2 console.log statements
⚠️  Missing error handling in UserProfile component
✅ No hardcoded credentials
✅ Code follows conventions

Recommendation: Fix the warnings above before committing.
```
