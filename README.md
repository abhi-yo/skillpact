# SkillPact

> _**Trade skills, build community. A platform that connects people through expertise⚡**_

<div align="center">
  <img src="./public/og.png" alt="SkillPact Banner" />
  <br><br>
  <p align="left">
    <strong>SkillPact is a web application that facilitates peer-to-peer skill and service exchanges within communities.</strong>
    Built with modern web technologies, it enables users to offer their expertise and request services from others using an internal credit system for value exchange.<br>
    </br>
    <em>Designed for local communities, educational institutions, and professional networks seeking efficient resource sharing and skill development opportunities.</em>
    </br>
  </p>
  <br>
  <p align="center">
    <img src="https://img.shields.io/github/stars/abhi-yo/skillpact?style=social" alt="GitHub stars" />
    <img src="https://img.shields.io/github/forks/abhi-yo/skillpact?style=social" alt="GitHub forks" />
    <img src="https://img.shields.io/github/license/abhi-yo/skillpact?style=social" alt="License" />
    <a href="https://neon.com">
      <img src="https://img.shields.io/badge/Sponsored%20by-Neon-00E599?style=social&logo=neon&logoColor=white" alt="Sponsored by Neon" />
    </a>
  </p>
</div>

---

>**This project is proudly sponsored by [Neon](https://neon.tech). Thank you for supporting open source and powering our database infrastructure!**

<p align="center">
  <a href="https://neon.tech">
    <img src="https://neon.tech/brand/neon-logo-dark-color.svg" alt="Powered by Neon" height="40">
  </a>
</p>

## 🚀 Live Demo

**[Visit SkillPact](https://skillpact.co)**

## ✨ Features

- **Credit-Based Exchange System** - Internal economy for tracking and managing service transactions
- **User Profile Management** - Comprehensive profiles with skills, services, and reputation tracking
- **Geolocation Services** - Location-based service discovery and filtering
- **Real-time Communication** - Built-in messaging system for coordination and negotiation
- **Reputation & Rating System** - User feedback and trust building mechanisms
- **Exchange Lifecycle Management** - Complete workflow from proposal to completion
- **Notification System** - Real-time updates for exchange activities and messages
- **Responsive Web Design** - Cross-platform compatibility with mobile-first approach
- **Authentication & Authorization** - Secure user management with OAuth integration
- **Service Categorization** - Organized taxonomy for easy service discovery

## 🎯 Application Workflow

1. **User Registration & Profile Setup** - Account creation with skill and service listing
2. **Service Discovery** - Browse and filter available services by category, location, and user ratings
3. **Exchange Initiation** - Submit requests with proposed terms and credit allocation
4. **Negotiation & Scheduling** - Real-time communication for finalizing exchange details
5. **Service Delivery & Completion** - Execute exchanges with status tracking and updates
6. **Rating & Feedback** - Post-completion evaluation system for reputation building

## 🛠️ Tech Stack

- **Frontend Framework** - [Next.js 14](https://nextjs.org/) with App Router
- **Language** - [TypeScript](https://www.typescriptlang.org/) for type-safe development
- **Styling** - [Tailwind CSS](https://tailwindcss.com/) for responsive design
- **Database** - [PostgreSQL](https://www.postgresql.org/) hosted on [Neon](https://neon.tech)
- **ORM** - [Prisma](https://www.prisma.io/) for database management
- **Authentication** - [NextAuth.js](https://next-auth.js.org/) with multiple providers
- **Real-time Communication** - [tRPC](https://trpc.io/) for type-safe APIs
- **State Management** - [TanStack Query](https://tanstack.com/query) for server state
- **UI Components** - [Radix UI](https://www.radix-ui.com/) with custom design system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- PostgreSQL database (we recommend [Neon](https://neon.tech))

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/abhi-yo/skillpact.git
cd skillpact
```

2. **Install dependencies:**

```bash
pnpm install
# or
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@hostname:5432/skillpact"
SHADOW_DATABASE_URL="postgresql://username:password@hostname:5432/skillpact_shadow"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Set up the database:**

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

5. **Start the development server:**

```bash
pnpm dev
```

6. **Open your browser and visit:** [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
skillpact/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication pages
│   ├── api/                      # API routes and tRPC
│   ├── dashboard/                # User dashboard
│   ├── exchanges/                # Exchange management
│   ├── services/                 # Service listings
│   ├── messages/                 # Messaging system
│   └── profile/                  # User profiles
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (Radix + custom)
│   └── *.tsx                     # Feature-specific components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client setup
│   └── trpc.ts                   # tRPC configuration
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Database migrations
├── server/                       # Backend logic
│   ├── routers/                  # tRPC routers
│   └── trpc.ts                   # tRPC server setup
└── types/                        # TypeScript type definitions
```

## 🔧 Architecture & Core Systems

### **Exchange Management System**
- Credit-based transaction engine with balance tracking and validation
- Multi-stage exchange workflow (proposed → negotiated → scheduled → completed)
- Automated status updates and transaction history

### **User Management & Social Features**
- Comprehensive user profiling with skill taxonomy and service offerings
- Location-based service matching and proximity algorithms
- Reputation scoring system with weighted feedback mechanisms

### **Communication Infrastructure**
- Real-time messaging with WebSocket implementation
- Push notification system for exchange updates and messages
- In-app coordination tools for service delivery logistics

### **Data & Analytics**
- PostgreSQL database with optimized queries for scalability
- User activity tracking and engagement metrics
- Service performance analytics and recommendation algorithms

## 🤝 Contributing

We welcome contributions to make SkillPact even better! Here's how you can help:

### **Adding New Features**

1. Fork the repository
2. Create a feature branch:

```bash
git checkout -b feature/amazing-feature
```

3. Make your changes and commit:

```bash
git commit -m "feat: add amazing feature"
```

4. Push to your branch and create a Pull Request

### **Areas for Contribution**

- **UI/UX Improvements** - Enhance the user interface and experience
- **New Features** - Add functionality like group exchanges, skill workshops
- **Internationalization** - Add support for multiple languages
- **Mobile App** - React Native or Flutter implementation
- **Testing** - Add comprehensive test coverage
- **Documentation** - Improve docs and add tutorials

### **Development Guidelines**

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design across devices

## 📊 Database Architecture

The application uses a relational database design with the following core entities:

- **Users** - Authentication, profile data, skills inventory, location, and credit balance
- **Services** - Service offerings with metadata, categorization, and availability
- **Exchanges** - Transaction records with status tracking, terms, and completion data
- **Messages** - Communication history with threading and real-time delivery
- **Ratings** - User feedback system with weighted scoring for reputation calculation
- **Notifications** - System alerts, user notifications, and delivery tracking

## 🚀 Deployment

### **Deploy on Vercel (Recommended)**

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on every push to main

### **Database Setup with Neon**

1. Create a [Neon](https://neon.tech) account
2. Create a new project and database
3. Copy the connection string to your environment variables
4. Run migrations: `pnpm prisma migrate deploy`

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SHADOW_DATABASE_URL` | Shadow database for migrations | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | 🔧 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | 🔧 |

## 🙏 Sponsored by Neon

**This project is proudly powered by [Neon](https://neon.tech) — the serverless PostgreSQL platform that makes database management effortless.**

Neon provides:
- **Serverless PostgreSQL** with instant branching
- **Automatic scaling** based on your app's needs
- **Built-in connection pooling** for optimal performance
- **Database branching** for safe development and testing

<i>Special thanks to Neon for sponsoring this open source project and supporting the developer community!</i>

<a href="https://neon.tech">
  <img src="https://neon.tech/brand/neon-logo-dark-color.svg" alt="Powered by Neon" height="50">
</a>

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🏗️ Built By

- **GitHub**: [@abhi-yo](https://github.com/abhi-yo)
- **Project**: [SkillPact](https://github.com/abhi-yo/skillpact)

---

## ⭐ Show Your Support

If you find SkillPact helpful, please consider:

- ⭐ **Starring this repository** on GitHub
- 🐛 **Reporting bugs** and suggesting features
- 🤝 **Contributing** to the codebase
- 📢 **Sharing** with your community

**Together, let's advance community-driven resource sharing through technology!**

---

> _**Join SkillPact and experience collaborative learning and service delivery.**_
