# VaahanERP — Vehicle Dealership ERP

A multi-tenant SaaS ERP platform for vehicle dealerships built with Next.js 14, Prisma, Supabase, and NextAuth.

## Features

- Multi-tenant architecture with role-based permissions
- Lead management and follow-up tracking
- Vehicle stock and booking management
- Customer & RTO registration
- Service job cards
- Cash flow / Daybook
- Expense management with budgets
- Promotions and marketing
- WhatsApp bot integration
- AI-powered Vaani Avatar for showroom visitor engagement
- Blog and content management
- Subscription plans (Free, Starter, Basic, Professional, Enterprise)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/ravi0067/vaahan-erp.git
cd vaahan-erp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials. See [SECURITY.md](./SECURITY.md) for where to find each value.

**Never commit `.env.local` to Git.**

### 4. Set up the database

```bash
npm run db:migrate
npm run db:seed   # optional: seed demo data
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for the full list of required variables.
See `SECURITY.md` for instructions on where to get each credential.

## Deployment (Vercel)

1. Push code to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` in **Vercel → Settings → Environment Variables**
4. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via [Supabase](https://supabase.com)
- **ORM**: Prisma
- **Auth**: NextAuth v4
- **UI**: Shadcn UI + Tailwind CSS
- **Charts**: Recharts
- **State**: Zustand
- **3D**: Three.js + React Three Fiber

## Security

See [SECURITY.md](./SECURITY.md) for security guidelines and how to report vulnerabilities. 
