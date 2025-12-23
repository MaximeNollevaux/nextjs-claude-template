---
description: Explore, Plan, Code, Test - Systematic feature implementation
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task, TodoWrite, AskUserQuestion, WebSearch, WebFetch
model: sonnet
---

# EPCT: Explore → Plan → Code → Test

Systematic methodology for implementing features with high quality and zero hallucinations.

## Phase 1: EXPLORE 🔍

### External Research
1. **Web research**
   - Search for best practices: `<feature> best practices 2025`
   - Find official documentation
   - Learn common pitfalls

2. **Codebase exploration**
   - Use Task tool with `subagent_type: "Explore"` and `thoroughness: "very thorough"`
   - Understand existing architecture
   - Find similar implementations
   - Identify patterns and conventions

### Deliverable
- Summary of findings
- Links to relevant documentation
- List of affected files
- Existing patterns to follow

## Phase 2: PLAN 📋

### Create Implementation Plan
1. **Break down the feature**
   - List all files to create/modify
   - Identify dependencies
   - Plan database changes (if needed)

2. **Use TodoWrite tool**
   - Create tasks for each step
   - Make tasks specific and actionable

3. **Get user approval**
   - Present the plan to the user
   - Use AskUserQuestion if clarification needed
   - Wait for approval before coding

### Deliverable
- Detailed implementation plan
- List of all changes
- Database migrations (if needed)
- User approval ✅

## Phase 3: CODE 💻

### Implement the Feature
1. **Follow the plan**
   - Work through tasks one by one
   - Update TodoWrite as you progress
   - Mark tasks as in_progress → completed

2. **Follow existing patterns**
   - Use patterns discovered in Explore phase
   - Match code style
   - Reuse existing utilities

3. **Database changes** (if needed)
   - Use scripts/supabase-sql-helper.mjs
   - Run migrations with validation
   - Regenerate TypeScript types

### Guidelines
- Don't over-engineer
- Keep changes minimal
- Follow project conventions
- Test as you go

## Phase 4: TEST 🧪

### Verify Implementation
1. **TypeScript check**
   ```bash
   npx tsc --noEmit
   ```

2. **Lint check**
   ```bash
   npm run lint
   ```

3. **Build check**
   ```bash
   npm run build
   ```

4. **Manual testing**
   ```bash
   npm run dev
   ```
   - Test the feature
   - Test edge cases
   - Test error states

5. **Database verification** (if changes made)
   - Verify schema changes
   - Check data integrity
   - Test queries

### Deliverable
- ✅ All tests pass
- ✅ Feature works as expected
- ✅ No regressions
- ✅ Ready to commit

## Example Usage

User: "Add a user profile page"

**Explore:**
- Research Next.js 15 best practices for profile pages
- Find existing user-related code
- Check authentication setup
- Find similar pages in codebase

**Plan:**
- Create src/app/profile/page.tsx
- Add route in navigation
- Create ProfileForm component
- Update user type if needed
- Add API route for updates (if needed)

**Code:**
- Implement according to plan
- Follow existing patterns
- Use auth from existing setup

**Test:**
- TypeScript ✅
- Lint ✅
- Build ✅
- Manual testing ✅
- Profile page works ✅

**Result:** Feature complete, high quality, no bugs! 🎉

## Benefits

- **No hallucinations**: Research first, code later
- **No wasted effort**: Plan approved before coding
- **High quality**: Follow existing patterns
- **No regressions**: Thorough testing
- **User alignment**: Approval at each phase
