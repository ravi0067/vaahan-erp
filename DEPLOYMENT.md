# 🚀 VaahanERP - Deployment Guide (Hindi + English)

Ye guide aapko step-by-step batayegi ki VaahanERP ko kaise live karna hai. Koi coding experience zaruri nahi hai!

---

## Step 1: GitHub pe Code Upload karo

GitHub ek jagah hai jahan aapka code safe rahega aur Vercel se connect hoga.

1. **GitHub account banao** — [github.com](https://github.com) pe jaao aur Sign Up karo
2. **New Repository banao** — Login ke baad "+" icon click karo → "New Repository"
   - Repository name: `vaahan-erp`
   - Public ya Private — jo chaaho (Private recommend hai)
   - "Create Repository" click karo
3. **Code upload karo** — Apne computer ka terminal (Command Prompt / PowerShell) kholo aur ye commands ek ek karke run karo:

```bash
cd vaahan-erp
git init
git add .
git commit -m "VaahanERP v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vaahan-erp.git
git push -u origin main
```

> 💡 **Note:** `YOUR_USERNAME` ki jagah apna GitHub username daalo

---

## Step 2: Supabase pe Database banao (FREE)

Supabase aapka database (data storage) manage karega — bilkul FREE!

1. **[supabase.com](https://supabase.com)** pe jaao aur **Sign Up** karo (GitHub se sign in easiest hai)
2. **"New Project"** click karo:
   - **Name:** `vaahan-erp`
   - **Database Password:** Ek strong password set karo (ye yaad rakhna! ✍️)
   - **Region:** `South Asia (Mumbai)` select karo — sabse fast rahega India ke liye
3. **Project ban jaaye** (2-3 minute lagta hai), phir:
   - Left menu me **Settings** → **Database** pe jaao
   - **"Connection string"** section me **URI** copy karo
   - Ye aapka `DATABASE_URL` hai — save kar lo! 📋

> ⚠️ Connection string me `[YOUR-PASSWORD]` likha hoga — uski jagah Step 2 me jo password diya tha wo daalo

---

## Step 3: Vercel pe Deploy karo (FREE)

Vercel aapki website ko live karega — ye bhi FREE hai!

1. **[vercel.com](https://vercel.com)** pe jaao aur **GitHub se Sign In** karo
2. **"Add New..." → "Project"** click karo
3. Apna **vaahan-erp** repository select karo aur **"Import"** click karo
4. **Environment Variables** section me ye 3 variables add karo:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Step 2 me jo connection string copy kiya tha |
| `NEXTAUTH_SECRET` | Koi bhi random string, jaise: `vaahan-erp-secret-2025-xyz` |
| `NEXTAUTH_URL` | `https://vaahan-erp.vercel.app` (baad me change kar sakte ho) |

5. **"Deploy"** button click karo
6. ☕ Chai banao — **2-3 minute me aapka ERP live ho jayega!**

> 🎉 Deploy hone ke baad Vercel aapko ek URL dega jaise `https://vaahan-erp.vercel.app` — ye aapki live website hai!

---

## Step 4: Database Setup (Prisma Migrate)

Database me tables banane ke liye ye commands run karo. Ye aap local machine se kar sakte ho ya Vercel CLI se:

### Option A: Local machine se (Recommended)

```bash
# Pehle apne project folder me jaao
cd vaahan-erp

# .env file me DATABASE_URL set karo
echo 'DATABASE_URL="your-supabase-connection-string"' > .env

# Database tables banao
npx prisma migrate deploy

# Sample data daalo (agar seed script hai)
npx prisma db seed
```

### Option B: Vercel CLI se

```bash
# Vercel CLI install karo
npm i -g vercel

# Login karo
vercel login

# Environment variables pull karo
vercel env pull .env

# Phir migrate run karo
npx prisma migrate deploy
```

---

## Step 5: Custom Domain Connect karo

Agar aapke paas apna domain hai (jaise `erp.vaahan.com`), toh usse connect karo:

1. **Vercel Dashboard** me jaao → apna project select karo
2. **Settings** → **Domains** pe jaao
3. **"Add Domain"** click karo → apna domain type karo (e.g., `erp.vaahan.com`)
4. Vercel aapko **DNS records** dega. Ye 2 tarah ke ho sakte hain:

### Subdomain ke liye (e.g., erp.vaahan.com):
| Type | Name | Value |
|------|------|-------|
| CNAME | erp | cname.vercel-dns.com |

### Root domain ke liye (e.g., vaahan.com):
| Type | Value |
|------|-------|
| A | 76.76.21.21 |

5. Apne **domain provider** (GoDaddy / Namecheap / Hostinger / BigRock) me jaao
6. **DNS Settings** me upar wale records add karo
7. **5-30 minute** me domain connect ho jayega ✅
8. **HTTPS/SSL** automatic mil jayega — Vercel free SSL deta hai! 🔒

> 💡 **Tip:** Agar domain GoDaddy pe hai toh: My Products → DNS → Add Record

---

## Step 6: First Login Setup

1. Browser me apni Vercel URL kholo (ya custom domain)
2. **Default login credentials:**
   - Email: `admin@vaahan.com`
   - Password: `admin123`
3. **⚠️ IMPORTANT: Turant password change karo!**
4. Settings me jaake apni dealership ki details bharo

---

## 🔧 Troubleshooting (Problems aaye toh)

### ❌ Build fail ho raha hai
- Vercel Dashboard → apna project → **"Deployments"** tab → latest deployment pe click karo → logs padho
- Usually koi missing environment variable hota hai

### ❌ Database connect nahi ho raha
- Supabase Dashboard → Settings → Database
- **"Connection Pooling"** section me **"Transaction mode"** wali URL use karo (port 6543 wali)
- Ye URL `DATABASE_URL` me daalo

### ❌ Custom domain nahi lag raha
- DNS propagation me **24 hours tak** lag sakta hai
- [dnschecker.org](https://dnschecker.org) pe check karo ki DNS update hua ya nahi
- Make sure DNS records sahi se add kiye hain

### ❌ Page load nahi ho raha / 500 error
- Vercel Dashboard → **"Functions"** tab → error logs check karo
- Usually `DATABASE_URL` galat hota hai

---

## 💰 Monthly Cost (Kitna kharcha?)

| Service | Cost |
|---------|------|
| **Vercel** (Hosting) | ₹0 FREE (Hobby plan — starting ke liye kaafi hai) |
| **Supabase** (Database) | ₹0 FREE (500MB database, 2GB bandwidth) |
| **Domain** (optional) | ₹500-800/year |
| **TOTAL** | **~₹0-800/year only! 🎉** |

> 💡 Jab traffic badhe toh Vercel Pro (₹1600/month) aur Supabase Pro (₹2000/month) pe upgrade kar sakte ho

---

## 📱 Mobile pe bhi chalega?

Haan! VaahanERP responsive hai — phone, tablet, laptop sab pe sahi se kaam karega. Koi alag app install karne ki zarurat nahi hai.

---

## 🆘 Help chahiye?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

---

**Congratulations! 🎊 Aapka VaahanERP live hai!**
