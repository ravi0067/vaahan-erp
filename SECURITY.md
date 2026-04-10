# Security Guide — VaahanERP

## Environment Variables Setup

**Never commit `.env.local` or any file containing real credentials to Git.**

`.env.local` is already listed in `.gitignore` and will not be tracked.

### Setup for New Developers

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your real credentials in `.env.local` — refer to the sections below.

3. Never share or commit `.env.local`.

---

## Where to Get Each Credential

### Supabase (Database + Auth)
- Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → **Settings → API**
- Copy: Project URL, `anon` key, `service_role` key
- For database URLs: **Settings → Database → Connection string**
  - Use **Transaction** mode (port 6543) for `DATABASE_URL`
  - Use **Session** mode (port 5432) for `DIRECT_DATABASE_URL`

### NextAuth Secret
```bash
openssl rand -base64 32
```
Paste the output as `NEXTAUTH_SECRET`.

### Email / SMTP (Hostinger)
- Log in to your [Hostinger Email Panel](https://hpanel.hostinger.com)
- Go to **Emails → Email Accounts** to manage passwords

### WhatsApp Cloud API (Meta)
- Go to [Meta Business Suite](https://business.facebook.com) → **WhatsApp → API Setup**
- Generate a permanent access token from **System Users**

### Webhook & Cron Secrets
Generate random secrets:
```bash
openssl rand -hex 32
```

---

## Vercel Deployment

All environment variables must be added to Vercel for production:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → **Settings → Environment Variables**
2. Add each key from `.env.example` with your real production values
3. Redeploy after adding new variables

---

## Pushing to GitHub After History Rewrite

Since git history was rewritten to remove exposed credentials, a **force push** is required to update GitHub:

```bash
git push origin vaahanerp-ai-review --force
git push origin main --force
```

> **Important:** If other collaborators have cloned the repo, they need to `git fetch --all` and `git reset --hard origin/<branch>` on their end.

---

## Reporting a Security Issue

If you find a security vulnerability, please email **admin@vaahanerp.com** directly.
Do not open a public GitHub issue for security vulnerabilities.
