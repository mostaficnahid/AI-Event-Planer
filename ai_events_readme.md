# 🚀 AI Events

> **AI-powered event management platform that helps organizers plan smarter, manage guests in real time, estimate budgets instantly, and optimize every event with GPT-5.**

---

## 🌟 Overview

**AI Events** is a full-stack SaaS application built to modernize event management.

Instead of juggling spreadsheets, manual RSVPs, budget templates, and scattered communications, event organizers can use a single intelligent platform to:

- 🧠 Generate event descriptions, schedules, and tags with AI
- 👥 Manage guests and track RSVPs in real time
- 💰 Get instant budget estimates with category breakdowns
- 📊 Monitor attendance and performance analytics
- 🎨 Receive theme and content suggestions
- 💬 Chat with an AI co-pilot for planning support

This project demonstrates advanced full-stack engineering, AI integration, analytics, authentication, and production-grade UI/UX.

---

## 🎯 Problem Statement

Professional event organizers often rely on:

- Multiple spreadsheets
- Manual email tracking
- Static budget templates
- Time-consuming content creation
- Fragmented reporting tools

This leads to inefficiencies, inaccurate forecasting, and poor visibility.

### ✅ Solution

AI Events consolidates the entire event lifecycle into one intelligent platform.

---

## ✨ Core Features

### 🤖 AI Event Planning

Generate in seconds:

- Event titles
- Descriptions
- Session schedules
- Tags and categories
- Publish-ready content

### 👥 Guest Management

- Unlimited guest lists
- RSVP tracking (confirmed / pending / declined)
- Per-guest notes
- Real-time attendance updates

### 💰 Budget Intelligence

- Natural language budget estimation
- Category-by-category breakdown
- Confidence scoring
- Estimated vs actual tracking

### 📊 Analytics Dashboard

Interactive charts for:

- Attendance trends
- Event status breakdown
- Budget vs actual
- Category distribution

### 🎨 Theme Suggestions

AI-generated:

- Creative concepts
- Audience engagement ideas
- Improvement recommendations

### 💬 AI Assistant

24/7 event planning co-pilot that answers:

- Venue recommendations
- Catering estimates
- Budget advice
- Logistics planning
- Engagement strategies

### 🔐 Authentication & Role-Based Access

- JWT authentication
- Register & login flows
- Roles:
  - Event Organizer
  - Attendee
  - Admin

### 🗂️ Event & Category Management

- Create, update, and manage events
- Organize events by categories
- Search and filter by status/category

---

## 📸 Screenshots

> Create a `screenshots/` folder in the root of the repository and save the provided images using the filenames below. GitHub will automatically render them in this README.

### 🌐 Landing Page

&#x20;   &#x20;

### 🔍 Feature Deep Dive

&#x20;  &#x20;

### 🔐 Authentication

&#x20;

### 📊 Admin Dashboard



### 📅 Events Management



### 🏷️ Categories Management



### 💬 AI Assistant



> 📁 Recommended folder structure:
>
> ```text
> screenshots/
> ├── 01-hero.png
> ├── 02-metrics.png
> ├── 03-modules.png
> ├── 04-ai-planning.png
> ├── 05-analytics.png
> ├── 06-budget-ai.png
> ├── 07-guest-management.png
> ├── 09-how-it-works.png
> ├── 10-ai-copilot.png
> ├── 11-testimonials.png
> ├── 12-cta.png
> ├── 13-login.png
> ├── 14-register.png
> ├── 15-dashboard.png
> ├── 16-events.png
> ├── 17-categories.png
> └── 18-ai-assistant.png
> ```

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────────┐
│                        Frontend UI                        │
│                React + Vite + TypeScript                  │
│      Tailwind CSS • ShadCN UI • Recharts • Framer Motion  │
└─────────────────────────────┬──────────────────────────────┘
                              │ HTTPS / REST API
                              ▼
┌────────────────────────────────────────────────────────────┐
│                     Backend API Server                    │
│                  Node.js + Express + TypeScript           │
└───────────────┬─────────────────────┬─────────────────────┘
                │                     │
                ▼                     ▼
      ┌─────────────────┐   ┌─────────────────────────┐
      │ Authentication  │   │ Business Logic Modules  │
      │ JWT + RBAC      │   │ Events • Guests • AI    │
      └─────────────────┘   └─────────────────────────┘
                │                     │
                └────────────┬────────┘
                             ▼
                  ┌───────────────────────┐
                  │     PostgreSQL DB     │
                  │ Users • Events • RSVPs│
                  └───────────────────────┘
                             │
                             ▼
                  ┌───────────────────────┐
                  │     OpenAI GPT-5      │
                  │ AI Planning Engine    │
                  └───────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion
- Recharts

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL

### AI Integration

- OpenAI GPT-5 API

### Tooling

- pnpm workspaces
- TypeScript project references
- Prettier

---

## 📁 Project Structure

```text
AI-Event-Planner/
├── artifacts/              # Application modules
├── lib/                    # Shared libraries
├── scripts/                # Utility scripts
├── package.json            # Root workspace configuration
├── pnpm-workspace.yaml
└── tsconfig.json
```

The root `package.json` uses a monorepo architecture with strict `pnpm` workspace management.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-events.git
cd ai-events
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_events
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

### 4. Run Development Server

```bash
pnpm dev
```

### 5. Build for Production

```bash
pnpm build
```

---

## 📜 Available Scripts

| Command          | Description                         |
| ---------------- | ----------------------------------- |
| `pnpm install`   | Install dependencies                |
| `pnpm dev`       | Start development server            |
| `pnpm build`     | Type-check and build all workspaces |
| `pnpm typecheck` | Run TypeScript validation           |
| `pnpm format`    | Format code with Prettier           |

---

## 🔐 Authentication & Authorization

### Roles

| Role            | Permissions                   |
| --------------- | ----------------------------- |
| Admin           | Full system access            |
| Event Organizer | Create and manage events      |
| Attendee        | View and interact with events |

### Security Features

- JWT authentication
- Password hashing
- Protected API routes
- Role-based access control (RBAC)

---

## 📊 Dashboard Metrics

The analytics dashboard provides:

- Total events
- Total attendees
- Total allocated budget
- Budget used
- Attendance trends
- Event status distribution
- Category insights

---

## 🤖 AI Use Cases

| Module              | AI Capability                          |
| ------------------- | -------------------------------------- |
| Event Planning      | Generate descriptions, schedules, tags |
| Budget Intelligence | Estimate event costs                   |
| Theme Suggestions   | Recommend creative concepts            |
| AI Assistant        | Conversational planning support        |

---

## 🌍 Deployment

### Frontend Deployment

- Vercel
- Netlify

### Backend Deployment

- Railway
- Render
- Fly.io

### Database Hosting

- Neon
- Supabase
- Railway PostgreSQL

---

## ⚙️ GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm build
```

---

## 📈 Product Metrics (Landing Page Highlights)

- 50,000+ Events Managed
- 98% Organizer Satisfaction
- 3× Faster Planning
- 40% Higher Attendance

---

## 🧠 Engineering Highlights

This project demonstrates:

- Full-stack TypeScript development
- Monorepo architecture
- SaaS product design
- AI integration with OpenAI
- Authentication and RBAC
- PostgreSQL data modeling
- Data visualization
- Production-ready UI/UX

---

## 🗺️ Roadmap

- 📱 Mobile app
- 🔔 Notifications and reminders
- 📧 Email invitation automation
- 💳 Subscription billing
- 🌍 Multi-tenant SaaS support
- 📅 Calendar integrations

---

## 🤝 Contributing

Contributions are welcome.

```bash
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Nahid**\
Software Engineer • Full-Stack Developer • AI Builder

- GitHub: [https://github.com/your-username](https://github.com/your-username)
- LinkedIn: [https://linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)
- Portfolio: [https://your-portfolio.com](https://your-portfolio.com)

---

## ⭐ Why Recruiters Love This Project

This is more than a CRUD application.

It combines:

- 🧠 AI product development
- 🏗️ Scalable architecture
- 📊 Analytics dashboards
- 🔐 Enterprise authentication
- 🎨 Exceptional design
- 🚀 Startup-level execution

---

