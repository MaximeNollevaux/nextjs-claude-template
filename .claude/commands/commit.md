---
description: Quick commit and push with minimal, clean messages
allowed-tools: Bash, Read, Grep, Glob
model: sonnet
---

# Quick Commit Command

Create a clean, concise commit with an auto-generated message and push to the remote repository.

## Workflow

1. **Check git status**
   ```bash
   git status
   ```

2. **Review changes**
   - Run `git diff` to see all changes
   - Identify the main purpose of the changes

3. **Stage all changes**
   ```bash
   git add .
   ```

4. **Create commit message**
   - Generate a concise commit message (1-2 lines max)
   - Format: `<type>: <description>`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat: add user authentication with Supabase`
   - Example: `fix: resolve login redirect issue`

5. **Commit**
   ```bash
   git commit -m "your message here"
   ```

6. **Push to remote**
   ```bash
   git push
   ```

## Guidelines

- Keep messages short and descriptive
- Focus on WHAT changed, not HOW
- Use present tense ("add" not "added")
- No need for detailed explanations in the message
- If push fails, inform the user

## Example

```bash
git add .
git commit -m "feat: implement dashboard with authentication"
git push
```
