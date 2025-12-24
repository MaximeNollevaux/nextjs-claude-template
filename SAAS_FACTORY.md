# 🏭 SaaS Factory Architecture

**Transform this template into a complete SaaS application in < 5 minutes**

This template is not just a boilerplate—it's a **project factory** that lets you instantly create production-ready SaaS applications with modular, feature-flag-driven architecture.

---

## 🎯 Vision

**One Template → Multiple SaaS Products**

Instead of copying code between projects or starting from scratch, this template provides:
- ✅ **Presets** - Pre-configured project types (SaaS Starter, AI App, Internal Tool)
- ✅ **Modules** - Autonomous feature bricks (Teams, Billing, AI, Audit Log, etc.)
- ✅ **Feature Flags** - Runtime module activation/deactivation
- ✅ **Zero Hardcoding** - Everything is configurable

---

## 📦 Core Concepts

### 1. **Modules** - Self-Contained Features

Each module is a complete feature with:
```
src/features/teams/
├── components/       # UI components
├── lib/             # Business logic & API calls
├── types/           # TypeScript definitions
├── db/              # Database migrations
└── config.ts        # Module configuration
```

**Available Modules**:
- `auth` - Authentication & authorization ✅ **Built-in**
- `teams` - Multi-tenant team management ✅ **Implemented**
- `billing` - Stripe subscription management
- `emails` - Transactional emails (Resend/SendGrid)
- `audit-log` - Activity tracking & compliance
- `file-uploads` - File storage & management
- `landing` - Marketing pages & pricing
- `ai-features` - AI capabilities with usage tracking

### 2. **Presets** - Project Templates

Choose a preset when creating a new project:

| Preset | Modules Enabled | Use Case |
|--------|----------------|----------|
| **SaaS Starter** | auth, teams, billing, emails, audit-log, landing | Full-featured SaaS |
| **AI Application** | auth, ai-features, file-uploads, audit-log, landing | AI-powered apps |
| **Internal Tool** | auth, audit-log, file-uploads | Internal dashboards |
| **Custom** | Choose your own | Flexible setup |

### 3. **Feature Flags** - Runtime Control

Modules are enabled/disabled via:
- ✅ **Environment Variables** - Deployment-time configuration
- ✅ **Database Flags** - Runtime toggles (coming soon)
- ✅ **React Hooks** - Client-side checks
- ✅ **Server Functions** - Server-side checks

**Example Usage**:
```typescript
// Client Component
import { useModuleEnabled } from '@/lib/feature-flags';

export function MyComponent() {
  const teamsEnabled = useModuleEnabled('teams');

  if (!teamsEnabled) return null;
  return <TeamsList />;
}

// Server Component
import { isModuleEnabled } from '@/lib/feature-flags/server';

export async function MyPage() {
  const canShowBilling = await isModuleEnabled('billing');

  return <div>{canShowBilling && <BillingSection />}</div>;
}

// JSX with FeatureGate
import { FeatureGate } from '@/lib/feature-flags';

<FeatureGate module="audit-log">
  <AuditLogViewer />
</FeatureGate>
```

---

## 🚀 Quick Start

### Option 1: Clone & Setup
```bash
# Clone the template
npx degit MaximeNollevaux/nextjs-claude-template my-saas-app
cd my-saas-app

# Install dependencies
npm install

# Run interactive setup
npm run setup

# Start development
npm run dev
```

### Option 2: Use a Preset
```bash
# Clone with preset selection
npx degit MaximeNollevaux/nextjs-claude-template my-ai-app
cd my-ai-app
npm install

# The setup script will ask you to choose a preset:
# 1. SaaS Starter
# 2. AI Application
# 3. Internal Tool
# 4. Custom
npm run setup
```

---

## 🏗️ Architecture Overview

### Folder Structure
```
nextjs-claude-template/
├── src/
│   ├── features/              # 🆕 Modular features
│   │   ├── teams/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── types/
│   │   │   ├── db/migrations/
│   │   │   └── config.ts
│   │   └── [other-modules]/
│   │
│   ├── lib/
│   │   ├── feature-flags/     # 🆕 Feature flag system
│   │   │   ├── client.tsx
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── modules/           # 🆕 Module registry
│   │   │   ├── registry.ts
│   │   │   └── types.ts
│   │   ├── presets/           # 🆕 Project presets
│   │   │   ├── saas-starter.ts
│   │   │   ├── ai-app.ts
│   │   │   └── internal-tool.ts
│   │   └── supabase/
│   │
│   ├── components/
│   │   ├── DynamicNavigation.tsx  # 🆕 Adaptive navigation
│   │   ├── Sidebar.tsx            # 🆕 Module-aware sidebar
│   │   └── ui/
│   │
│   └── app/
│       └── layout.tsx         # 🆕 With FeatureFlagsProvider
│
└── scripts/
    ├── setup-project.mjs      # Interactive setup
    ├── select-preset.mjs      # 🆕 Preset selection
    └── supabase-sql-helper.mjs
```

---

## 🎛️ Module System

### Module Registry

All modules are defined in `src/lib/modules/registry.ts`:

```typescript
export const MODULE_REGISTRY = {
  'teams': {
    key: 'teams',
    name: 'Teams & Workspaces',
    description: 'Multi-tenant team management',
    dependencies: ['auth'],
    routes: ['/teams', '/teams/:id'],
    migrations: ['002_teams_setup.sql'],
    premium: false,
    defaultConfig: {
      maxMembersPerTeam: 10,
      allowInvitations: true,
    },
  },
  // ... other modules
};
```

### Creating a New Module

1. **Create module directory**:
```bash
mkdir -p src/features/my-feature/{components,lib,types,db/migrations}
```

2. **Add to registry** (`src/lib/modules/registry.ts`):
```typescript
'my-feature': {
  key: 'my-feature',
  name: 'My Feature',
  description: 'Description',
  dependencies: ['auth'],
  routes: ['/my-feature'],
  migrations: ['00X_my_feature.sql'],
  premium: false,
},
```

3. **Create migration** (`src/features/my-feature/db/migrations/00X_my_feature.sql`)

4. **Build components** in `components/`

5. **Add business logic** in `lib/`

---

## 🔧 Configuration

### Environment Variables

Enable/disable modules via environment variables:

```bash
# .env.local
NEXT_PUBLIC_MODULE_TEAMS=true
NEXT_PUBLIC_MODULE_BILLING=true
NEXT_PUBLIC_MODULE_AI_FEATURES=false
```

### Module Configuration

Each module can have custom configuration:

```typescript
// src/features/teams/config.ts
export const TEAMS_CONFIG = {
  maxMembersPerTeam: 10,
  invitationExpiryDays: 7,
  defaultRole: 'member',
  roles: {
    owner: { permissions: ['*'] },
    admin: { permissions: ['manage_members', 'manage_settings'] },
    member: { permissions: ['view_team'] },
  },
};
```

---

## 🛠️ Available Scripts

```bash
# Setup & Development
npm run setup           # Interactive project setup with preset selection
npm run dev             # Start development server (Turbopack)
npm run build           # Build for production

# Database
npm run init:supabase   # Initialize database with exec_sql function
npm run gen:types       # Generate TypeScript types from database

# Module Management (coming soon)
npm run module:enable teams
npm run module:disable billing
npm run module:list

# Claude Code Slash Commands
/epct                   # Explore → Plan → Code → Test workflow
/commit                 # Auto-commit with generated message
/create-pr              # Create pull request with auto-description
/fix                    # Auto-fix TypeScript/ESLint errors
/review                 # Code quality review
```

---

## 📚 Documentation

- **[README.md](./README.md)** - Main template documentation
- **[SAAS_FACTORY.md](./SAAS_FACTORY.md)** - This file (architecture guide)
- **Module READMEs** - Each feature has its own documentation

---

## 🎓 Examples

### Example 1: Creating a SaaS with Teams & Billing

```bash
npm run setup
# Select: "1. SaaS Starter"
# Enabled modules: auth, teams, billing, emails, audit-log, landing

npm run dev
# Navigate to /teams → Team management ready
# Navigate to /billing → Stripe integration ready
```

### Example 2: Building an AI Application

```bash
npm run setup
# Select: "2. AI Application"
# Enabled modules: auth, ai-features, file-uploads, audit-log, landing

npm run dev
# Navigate to /ai → AI features ready
# Navigate to /files → File uploads ready
```

---

## 🔐 Security & Best Practices

- ✅ **Row Level Security (RLS)** - All database tables protected
- ✅ **Environment Variables** - Secrets never committed
- ✅ **TypeScript Strict Mode** - Type safety enforced
- ✅ **Feature Flags** - Gradual rollouts & A/B testing
- ✅ **Modular Architecture** - Easy to maintain & test
- ✅ **Claude Code Integration** - Autonomous development

---

## 🚢 Deployment

This template works with:
- ✅ **Vercel** - Recommended (zero-config)
- ✅ **Netlify** - Works great
- ✅ **Railway** - Docker support
- ✅ **Self-hosted** - Docker Compose ready

**Environment Setup**:
```bash
# Production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Enable modules in production
NEXT_PUBLIC_MODULE_TEAMS=true
NEXT_PUBLIC_MODULE_BILLING=true
```

---

## 🤝 Contributing

Want to add a new module? Follow this pattern:

1. Create module in `src/features/[module-name]/`
2. Add to `MODULE_REGISTRY` in `src/lib/modules/registry.ts`
3. Create database migration in `db/migrations/`
4. Add documentation
5. Submit PR!

---

## 📊 Roadmap

- [x] Core architecture (modules, presets, feature flags)
- [x] Teams/Workspaces module
- [x] Dynamic navigation
- [ ] Billing module (Stripe integration)
- [ ] Emails module (Resend/SendGrid)
- [ ] AI Features module (Anthropic/OpenAI)
- [ ] File Uploads module (Supabase Storage)
- [ ] Audit Log module
- [ ] Landing pages module
- [ ] CLI tool for module management
- [ ] Module marketplace

---

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Claude Code Documentation](https://github.com/anthropics/claude-code)
- [Tailwind CSS v4](https://tailwindcss.com)

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

**Built with ❤️ by the Claude Code community**
