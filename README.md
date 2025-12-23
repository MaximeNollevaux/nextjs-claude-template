# Next.js + Claude Code Template

A powerful **Next.js 15** template with **Claude Code superpowers** - enabling autonomous database management, workflow automation, and AI-assisted development.

## ✨ Features

### 🤖 Claude Code Integration
- **Database Autonomy**: Claude Code can autonomously modify your Supabase schema
- **Custom Slash Commands**: Productivity-boosting commands like `/epct`, `/explore`, `/commit`
- **MCP Servers**: Pre-configured for Supabase and N8N integration
- **Autonomous Migrations**: Create, test, and deploy database changes safely

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

### 3. Initialize Supabase (if using)

```bash
npm run init:supabase
```

This creates the `exec_sql` function in your Supabase database, enabling Claude Code to manage schema changes autonomously.

### 4. Start developing!

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

- **[Database Autonomy Guide](.claude/AUTONOMOUS_DATABASE_WORKFLOW.md)** - Complete guide to autonomous database management
- **[Quick Database Reference](.claude/QUICK_DB_REFERENCE.md)** - Quick reference for common operations
- **[Setup Script](scripts/setup-project.mjs)** - Interactive project configuration
- **[SQL Helper](scripts/supabase-sql-helper.mjs)** - Database helper utilities

## 🎯 Usage Examples

### Autonomous Database Modifications

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

### Using Slash Commands

When working with Claude Code, you can use these commands:

- `/epct <feature>` - Explore, Plan, Code, Test workflow
- `/explore <question>` - Deep codebase exploration
- `/commit` - Quick commit with AI-generated message
- `/create-pull-request` - Create PR with auto-generated description

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

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PROJECT_ID=your_project_id

# N8N (optional)
N8N_API_URL=https://n8n.yourdomain.com
N8N_API_KEY=your_n8n_api_key
```

### MCP Servers

MCP (Model Context Protocol) servers are configured in `.claude/.mcp.json`:

- **Supabase MCP**: Direct database access for Claude Code
- **N8N MCP**: Workflow automation integration

## 📁 Project Structure

```
├── .claude/
│   ├── .mcp.json                    # MCP server configuration
│   ├── commands/                    # Slash commands
│   ├── AUTONOMOUS_DATABASE_WORKFLOW.md
│   └── QUICK_DB_REFERENCE.md
├── scripts/
│   ├── supabase-sql-helper.mjs     # Database helper
│   ├── setup-project.mjs            # Setup script
│   └── init-supabase.mjs            # Supabase initialization
├── src/
│   ├── app/                         # Next.js app directory
│   ├── components/                  # React components
│   └── lib/
│       ├── supabase/                # Supabase clients
│       └── types/
│           └── generated.ts         # Auto-generated types
├── .env.example                     # Environment variables template
├── .env.local                       # Your environment (gitignored)
├── package.json
└── README.md
```

## 🎨 Claude Code Capabilities

This template enables Claude Code to:

### ✅ Database Management
- Modify database schema autonomously
- Create and alter tables
- Add/remove/rename columns
- Create indexes and constraints
- Run complex migrations with validation
- Test changes before applying

### ✅ Development Workflow
- Explore codebase thoroughly
- Plan implementations before coding
- Generate code following project patterns
- Test implementations automatically
- Create commits and pull requests
- Fix issues based on PR comments

### ✅ Automation
- Execute N8N workflows
- Query Supabase directly
- Generate TypeScript types
- Run tests and builds

## 🌟 Why This Template?

### Traditional Development
1. Claude suggests changes
2. **You** manually update database in Supabase dashboard
3. **You** manually regenerate types
4. **You** update code
5. **You** test
6. **You** commit

### With This Template
1. **Claude** explores codebase
2. **Claude** plans changes
3. **Claude** updates database autonomously
4. **Claude** regenerates types
5. **Claude** updates code
6. **Claude** tests
7. **Claude** commits

**Result**: 10x faster development, fewer errors, consistent patterns!

## 🔐 Security

- Service role keys are kept in `.env.local` (gitignored)
- Readonly mode for SELECT queries prevents accidental modifications
- Pre/post validation in migrations
- Automatic rollback on errors

## 🤝 Contributing

Contributions are welcome! This template is designed to be:
- **Extensible**: Add your own commands, helpers, and patterns
- **Customizable**: Adapt to your specific needs
- **Shareable**: Use as a base for your projects

## 📝 License

MIT License - feel free to use this template for any project!

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Claude Code](https://claude.com/claude-code)
- Database by [Supabase](https://supabase.com/)
- Automation by [N8N](https://n8n.io/)

---

**Made with ❤️ by [Maxime Nollevaux](https://github.com/MaximeNollevaux)**

Start building amazing things with AI-assisted development! 🚀
