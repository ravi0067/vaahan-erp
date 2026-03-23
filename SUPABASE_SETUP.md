# 🗄️ Supabase Setup Guide - VaahanERP

## Step 1: Create Supabase Project

1. **[supabase.com](https://supabase.com)** pe jaao aur **Sign Up** karo (GitHub se sign in easiest hai)
2. **"New Project"** click karo:
   - **Name:** `vaahan-erp`
   - **Database Password:** Strong password set karo (save kar lena! ✍️)
   - **Region:** `South Asia (Mumbai)` - fastest for India
3. Project create hone ka wait karo (2-3 minutes)

## Step 2: Get Database URL

1. **Settings** → **Database** pe jaao
2. **Connection String** section me **"URI"** copy karo
3. Ye format hoga: 
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

## Step 3: Update Environment Variables

**.env file me update karo:**

```bash
# Supabase Database URL (Connection Pooling enabled)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# NextAuth (Production ke liye update karna)
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-super-secret-key-generate-new-one"

# Optional: Supabase Direct Connection (migrations ke liye)
DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

## Step 4: Run Database Migration

Terminal me commands run karo:

```bash
# Dependencies install karo (agar nahi hai)
npm install

# Database schema migrate karo
npx prisma migrate deploy

# Database generate karo
npx prisma generate

# Optional: Sample data seed karo
npx prisma db seed
```

## Step 5: Verify Connection

Test karne ke liye:

```bash
# Dev server start karo
npm run dev

# Browser me localhost:3000 kholo
# Login try karo - credentials:
# Email: admin@vaahan.com
# Password: admin123
```

## Production Deployment (Vercel)

**Environment Variables add karo Vercel Dashboard me:**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase connection string (with pgbouncer) |
| `NEXTAUTH_SECRET` | Strong secret generate karo |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

## Troubleshooting

### ❌ Connection Error
- Make sure password sahi hai
- Region Mumbai select kiya hai
- Connection pooling URL use kar rahe ho (port 6543)

### ❌ Migration Fails
- Direct connection URL use karo (port 5432)
- Supabase project active hai

### ❌ Auth Issues
- `NEXTAUTH_SECRET` strong aur unique hona chahiye
- `NEXTAUTH_URL` correct domain pe point karna chahiye

---

**Next:** Deploy karne ke liye `DEPLOYMENT.md` follow karo!