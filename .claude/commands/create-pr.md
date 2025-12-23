---
description: Create and push PR with auto-generated title and description
allowed-tools: Bash, Read, Grep, Glob, Task
model: sonnet
---

# Create Pull Request Command

Automatically create a pull request with a well-formatted title and description.

## Workflow

1. **Check current state**
   ```bash
   git status
   git branch
   ```

2. **Get commit history**
   ```bash
   git log origin/main..HEAD --oneline
   ```

3. **Analyze changes**
   - Run `git diff origin/main...HEAD` to see all changes
   - Identify the main feature/fix being added

4. **Ensure changes are pushed**
   ```bash
   git push -u origin $(git branch --show-current)
   ```

5. **Create PR with gh CLI**
   ```bash
   gh pr create --title "Title" --body "Description"
   ```

## PR Title Format

- Format: `<type>: <concise description>`
- Examples:
  - `feat: Add user authentication system`
  - `fix: Resolve dashboard loading issue`
  - `refactor: Improve database query performance`

## PR Description Format

```markdown
## Summary
- Bullet point 1
- Bullet point 2
- Bullet point 3

## Changes
- List of main changes
- Keep it concise

## Testing
- How to test this PR
- What to verify

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Example

```bash
gh pr create \
  --title "feat: Add authentication with Supabase" \
  --body "$(cat <<'EOF'
## Summary
- Implemented login and signup pages
- Added middleware for protected routes
- Created authentication hooks

## Testing
- Test login flow at /login
- Verify protected routes redirect properly

🤖 Generated with Claude Code
EOF
)"
```
