# Next.js + Claude Code Template 🚀

A **cutting-edge Next.js 15 template** with **Claude Code superpowers** - featuring autonomous database management, complete authentication system, modern UI design, and AI-assisted development workflows.

[![CI](https://github.com/MaximeNollevaux/nextjs-claude-template/actions/workflows/ci.yml/badge.svg)](https://github.com/MaximeNollevaux/nextjs-claude-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🤖 Claude Code Integration
- **Database Autonomy**: Claude Code can autonomously modify your Supabase schema
- **5 Slash Commands**: `/commit`, `/epct`, `/create-pr`, `/fix`, `/review`
- **MCP Servers**: Pre-configured for Supabase and N8N integration
- **Autonomous Migrations**: Create, test, and deploy database changes safely
- **GitHub Actions**: Automated CI/CD and PR management

### 🔐 Authentication (NEW!)
- **Complete auth system** with Supabase Auth
- Login & Signup pages with glass morphism design
- Protected routes with middleware
- Auth hooks (`useAuth`)
- Session management
- Email verification

### 🎨 Modern UI (2025 Design)
- **Glass morphism** design language
- **Dark mode** by default
- Gradient backgrounds
- Smooth transitions and hover effects
- Mobile-responsive
- Tailwind CSS v4

### 🏗️ Tech Stack
- **Framework**: Next.js 15.5 with App Router
- **React**: React 19
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Automation**: N8N workflows (optional)
- **Build Tools**: Turbopack (default) or Bun support

### 📊 Database Management
- Execute raw SQL queries
- Create/alter tables autonomously
- Add/drop/rename columns
- Create indexes and constraints
- Run validated migrations with rollback
- Auto-generate TypeScript types

## 🚀 Quick Start

### 1. Use this template

```bash
# Using degit (recommended)
npx degit MaximeNollevaux/nextjs-claude-template my-app

# Or clone
git clone https://github.com/MaximeNollevaux/nextjs-claude-template my-app
cd my-app
rm -rf .git
```

### 2. Run the setup script

```bash
npm install
npm run setup
```

The setup script will:
- Ask for your Supabase credentials
- Ask for your N8N credentials (optional)
- Generate `.env.local`
- Generate `.claude/.mcp.json`
- Configure the project

### 3. Initialize Supabase

```bash
npm run init:supabase
```

This creates the `exec_sql` function in your Supabase database, enabling Claude Code to manage schema changes autonomously.

### 4. Start developing!

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication Setup

The template includes a **complete authentication system**:

### Pages Included
- `/` - Landing page
- `/login` - Login page with glass morphism design
- `/signup` - Signup page with email verification
- `/dashboard` - Protected dashboard (requires auth)

### How It Works

1. **Middleware**: Automatically redirects unauthenticated users
2. **Auth Hook**: `useAuth()` provides user state and signOut
3. **Protected Routes**: Define in `middleware.ts`
4. **Session Management**: Automatic session refresh

### Example: Adding a Protected Route

```typescript
// In middleware.ts
const protectedPaths = ['/dashboard', '/profile', '/settings'];
```

### Example: Using Auth in Components

```tsx
'use client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MyComponent() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <p>Welcome {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## 💻 Slash Commands

Type these commands in Claude Code for instant productivity:

- **`/commit`** - Quick commit with auto-generated message and push
- **`/epct <feature>`** - Explore, Plan, Code, Test workflow for systematic feature implementation
- **`/create-pr`** - Create PR with auto-generated title and description
- **`/fix`** - Automatically detect and fix errors (TypeScript, ESLint, build)
- **`/review`** - Comprehensive code review before committing

### Example Usage

```
You: /commit
Claude: Analyzing changes... Creating commit...
        ✓ Committed: "feat: add user profile page"
        ✓ Pushed to origin/main

You: /epct add user preferences
Claude: 🔍 EXPLORE: Researching user preferences patterns...
        📋 PLAN: Creating implementation plan...
        💻 CODE: Implementing feature...
        🧪 TEST: Running tests...
        ✓ Feature complete!
```

## 🎨 UI Design

The template features a **modern 2025 design** with:

### Glass Morphism
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### Gradients
```css
background: linear-gradient(to br, #1f2937, #111827, #1f2937);
```

### Smooth Transitions
```css
transition: all 0.3s ease;
transform: scale(1.02);
```

All pages use this design language for a consistent, modern look.

## 🤖 Autonomous Database Management

### Quick Example

```javascript
import { sqlHelper } from './scripts/supabase-sql-helper.mjs';

// Add a column
await sqlHelper.addColumn('users', 'bio', 'TEXT');

// Create an index
await sqlHelper.createIndex('users', 'email');

// Run a migration
const migration = {
  name: 'add_user_roles',
  async up(helper) {
    await helper.execSQL(`
      CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
    `);
    await helper.addColumn('users', 'role', "user_role DEFAULT 'user'");
    return { success: true };
  },
  async down(helper) {
    await helper.dropColumn('users', 'role');
    return { success: true };
  }
};

await sqlHelper.runMigration(migration);

// Regenerate TypeScript types
await sqlHelper.regenerateTypes();
```

## 🔄 GitHub Actions

The template includes **automated workflows**:

### CI Workflow
- Runs on every push and PR
- Lints code with ESLint
- Type-checks with TypeScript
- Builds the project
- Uploads build artifacts

### PR Auto-Assignment
- Automatically assigns PR to creator
- Adds size labels (small/medium/large/huge)
- Adds category labels (documentation, auth, database, etc.)

### How Claude Code Uses It

When Claude creates a PR, GitHub Actions automatically:
1. ✅ Run all checks
2. ✅ Assign the PR
3. ✅ Add labels
4. ✅ Report status

No manual intervention needed! 🎉

## 📁 Project Structure

```
├── .github/
│   ├── workflows/              # GitHub Actions
│   │   ├── ci.yml             # CI/CD pipeline
│   │   ├── auto-assign-pr.yml # Auto-assign PRs
│   │   └── pr-label.yml       # Auto-label PRs
│   └── labeler.yml            # Label configuration
├── .claude/
│   ├── .mcp.json              # MCP server configuration
│   ├── commands/              # Slash commands
│   │   ├── commit.md          # /commit command
│   │   ├── epct.md            # /epct command
│   │   ├── create-pr.md       # /create-pr command
│   │   ├── fix.md             # /fix command
│   │   └── review.md          # /review command
├── scripts/
│   ├── supabase-sql-helper.mjs # Database helper
│   ├── setup-project.mjs       # Setup script
│   └── init-supabase.mjs       # Supabase initialization
├── src/
│   ├── app/
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── dashboard/         # Protected dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── auth/              # Auth components
│   └── lib/
│       ├── hooks/
│       │   └── useAuth.ts     # Auth hook
│       ├── supabase/
│       │   ├── client.ts      # Supabase browser client
│       │   └── server.ts      # Supabase server client
│       └── types/
│           └── generated.ts   # Auto-generated types
├── middleware.ts              # Auth middleware
├── .env.example               # Environment variables template
├── .env.local                 # Your environment (gitignored)
└── README.md
```

## 🛠️ Available Scripts

```bash
npm run dev              # Start development server (Turbopack)
npm run dev:bun          # Start development server (Bun)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run gen:types        # Generate TypeScript types from Supabase
npm run setup            # Interactive project setup
npm run init:supabase    # Initialize Supabase with exec_sql function
```

## 🎯 Why This Template?

### Traditional Development
1. ❌ Claude suggests changes
2. ❌ **You** manually update database in Supabase
3. ❌ **You** manually create auth pages
4. ❌ **You** manually configure CI/CD
5. ❌ **You** manually regenerate types
6. ❌ **You** commit and push

### With This Template
1. ✅ **Claude** explores codebase
2. ✅ **Claude** updates database autonomously
3. ✅ **Auth system** ready out of the box
4. ✅ **GitHub Actions** configured
5. ✅ **Claude** regenerates types
6. ✅ **Claude** uses `/commit` command

**Result**: **10x faster development**, fewer errors, consistent patterns! 🚀

## 🎨 Design Showcase

### Login Page
- Glass morphism card
- Gradient background
- Smooth animations
- Error handling
- Redirect after login

### Dashboard
- Protected route
- User info display
- Stats cards with glass effect
- Sign out button
- Modern layout

### Responsive
- Mobile-first design
- Works on all screen sizes
- Touch-friendly

## 🔐 Security

- ✅ Service role keys in `.env.local` (gitignored)
- ✅ Readonly mode for SELECT queries
- ✅ Pre/post validation in migrations
- ✅ Automatic rollback on errors
- ✅ Middleware protection for routes
- ✅ Session management
- ✅ Email verification

## 📚 Documentation

- **[Database Autonomy Guide](.claude/AUTONOMOUS_DATABASE_WORKFLOW.md)** - Complete guide (coming soon)
- **[Quick Database Reference](.claude/QUICK_DB_REFERENCE.md)** - Quick reference (coming soon)
- **Slash Commands** - See `.claude/commands/` directory

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_ID`

### Other Platforms
- **Netlify**: Works out of the box
- **Railway**: Configure environment variables
- **AWS Amplify**: Add build settings

## 🤝 Contributing

Contributions welcome! This template is designed to be:
- **Extensible**: Add your own commands and patterns
- **Customizable**: Adapt to your needs
- **Shareable**: Use as a base for your projects

## 📝 License

MIT License - feel free to use this template for any project!

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Claude Code](https://claude.com/claude-code)
- Database by [Supabase](https://supabase.com/)
- Automation by [N8N](https://n8n.io/)

## 🎁 What's Included

- ✅ Next.js 15 with App Router
- ✅ TypeScript strict mode
- ✅ Tailwind CSS v4
- ✅ Complete authentication system
- ✅ Glass morphism design
- ✅ Database autonomy tools
- ✅ 5 slash commands
- ✅ GitHub Actions CI/CD
- ✅ MCP server configuration
- ✅ Interactive setup script
- ✅ Auto-generated types
- ✅ Protected routes middleware
- ✅ Auth hooks
- ✅ Modern UI components

## 🌟 Star History

If you find this template useful, please consider giving it a star ⭐

---

**Made with ❤️ by [Maxime Nollevaux](https://github.com/MaximeNollevaux)**

Start building amazing things with AI-assisted development! 🚀

**Questions?** Open an issue or discussion on GitHub.

**Need help?** Check the documentation in `.claude/` directory.
