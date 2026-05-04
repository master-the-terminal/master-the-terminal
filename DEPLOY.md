# Deploy Master The Terminal to Hostinger Cloud Startup

These are the exact steps to deploy **this** application — React 19 + Vite frontend, Hono + tRPC backend, Drizzle ORM, Kimi OAuth.

---

## What This App Actually Is

- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui (`src/`)
- **Backend**: Hono + tRPC + Drizzle ORM (`api/`)
- **Database**: MySQL (moving from TiDB Cloud to Hostinger MySQL)
- **Auth**: Kimi OAuth 2.0
- **Build**: Vite compiles frontend to `dist/public/`, esbuild bundles backend to `dist/boot.js`
- **Serve**: One Node.js process (`dist/boot.js`) serves both the API and the frontend files
- **Port**: Backend reads `process.env.PORT` (Hostinger sets this)

---

## Step 1: Buy Hostinger Cloud Startup

1. Go to [hostinger.com](https://www.hostinger.com)
2. Select **Cloud Startup** plan
3. Register your domain or use an existing one
4. After checkout, check your email for the **hPanel** login link
5. Log into hPanel

---

## Step 2: Prepare Your ZIP File Locally

Before touching Hostinger, build the project on your local machine and zip it up.

```bash
cd /path/to/this-project

# 1. Install dependencies
npm install

# 2. Build the project
npm run build
```

**What `npm run build` does:**
- `vite build` → compiles React frontend into `dist/public/`
- `esbuild api/boot.ts` → bundles Hono backend into `dist/boot.js`

### Verify the build worked

```bash
ls dist/
# Should show: boot.js  public/

ls dist/public/
# Should show: index.html  assets/  (your frontend files)
```

### Create the ZIP

```bash
# Zip everything — the full project including dist/
zip -r deploy.zip . -x "node_modules/*" -x ".git/*" -x "db/node_modules/*"
```

This creates `deploy.zip` in your project root. That is what you upload to Hostinger.

> **Do NOT include `node_modules/` in the zip.** Hostinger runs `npm install` during the build. The zip only needs your source code, config files, and the pre-built `dist/` folder.

---

## Step 3: Create the Node.js App in hPanel (with ZIP Upload)

1. In hPanel, go to **Websites > Manage > Node.js**
2. Click **Create Application**
3. Fill in these **exact** values:

| Field | Value |
|-------|-------|
| **Node.js version** | `20.x` |
| **Application mode** | `Production` |
| **Application root** | `/` |
| **Application URL** | `yourdomain.com` |
| **Application startup file** | `dist/boot.js` |
| **Framework** | **Hono** |
| **Build command** | `npm install` |
| **Start command** | `npm start` |

4. Look for the **Upload Source Code** or **Upload ZIP** section
5. Upload your `deploy.zip` file
6. Click **Create**

**Why `dist/boot.js`?**

- `npm run build` already ran locally → created `dist/public/` (frontend) and `dist/boot.js` (backend)
- `npm start` runs `node dist/boot.js`
- The backend serves the frontend from `dist/public/` automatically
- The backend already has a catch-all handler that sends `index.html` for React Router

**Why build command = `npm install` only?**

You already built locally. Hostinger only needs to install dependencies. The `dist/` folder is already in the zip.

If you prefer Hostinger to build instead:
- Change build command to `npm run build`
- Make sure `dist/` is NOT in the zip (Hostinger will create it)

---

## Step 4: Create the MySQL Database

Now that the Node.js app exists:

1. In hPanel, go to **Websites > Manage > Databases > Management**
2. Click **Create Database**
3. Name it `mastertheterminal`
4. Create a user with a strong password

You will get credentials like:

```
Database: u123456789_mastertheterminal
Username: u123456789_mastertheterminal
Password: YourStrongPassword123!
Host:     localhost
Port:     3306
```

**Write these down.** You need them in the next step.

Click the **phpMyAdmin** button to verify it opens.

---

## Step 5: Set Environment Variables in hPanel

In hPanel, go to your **Node.js App > Environment Variables**. Add every single one:

### Database
```
DATABASE_URL=mysql://u123456789_mastertheterminal:YourStrongPassword123!@localhost:3306/u123456789_mastertheterminal
```

### App Secrets (copy from your local `.env` file)
```
APP_ID=19dde6c2-6702-84fa-8000-00003a5aac91
APP_SECRET=lyIDvamxajyfS9cqhDKXvIcVkeRumlgp
```

### Frontend OAuth (exposed to browser)
```
VITE_APP_ID=19dde6c2-6702-84fa-8000-00003a5aac91
VITE_KIMI_AUTH_URL=https://auth.kimi.com
```

### Backend OAuth
```
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com
```

### Admin
```
OWNER_UNION_ID=d7l3fttgsoa7ilc80ojg
```

### Production flag
```
NODE_ENV=production
```

Click **Save**, then click **Restart**.

> **Do NOT commit `.env` to Git.** Hostinger's environment variable manager stores secrets securely. The `.env` on your local machine is for development only.

---

## Step 6: Create the Database Tables

This app uses Drizzle ORM. The tables do not exist yet on your Hostinger MySQL database.

**Two options:**

### Option A: Run from your local machine (easiest)

```bash
cd /path/to/this-project

# Temporarily point at Hostinger MySQL
export DATABASE_URL="mysql://u123456789_mastertheterminal:YourStrongPassword123!@localhost:3306/u123456789_mastertheterminal"

# Push the schema
npx drizzle-kit push
```

### Option B: Run from Hostinger (if SSH is enabled)

```bash
# SSH into your Hostinger account
# Navigate to your app directory
# Then:
npx drizzle-kit push
```

**What this does:** Reads `db/schema.ts` and creates tables (`users`, `courses`, `lessons`, `progress`, `payments`) in your Hostinger MySQL database.

### Verify it worked

1. Open **phpMyAdmin** in hPanel
2. You should see tables: `courses`, `lessons`, `payments`, `progress`, `users`
3. If they are there, it worked

---

## Step 7: Enable SSL

1. In hPanel, go to **Websites > Manage > SSL**
2. Click **Install SSL**
3. Hostinger requests a free Let's Encrypt certificate
4. Wait 2-3 minutes
5. It auto-renews forever

Your app is now at `https://yourdomain.com`.

---

## Step 8: Verify the Deploy

| Check | How |
|-------|-----|
| Homepage loads | Visit `https://yourdomain.com` |
| API works | Visit `https://yourdomain.com/api/trpc/course.list` — should return JSON |
| React Router works | Navigate to `/courses`, then refresh the page. Should not 404. |
| OAuth works | Click **Sign in with Kimi** — should redirect and come back |
| Database works | Sign in, your user appears in phpMyAdmin `users` table |

If any of these fail, read the **Deployment Logs** in hPanel Node.js app page.

---

## Step 9: Push Future Updates

For updates after the initial deploy, you have two options:

### Option A: Re-upload ZIP

1. Make changes locally
2. Run `npm run build`
3. Create a new `deploy.zip`
4. In hPanel, go to **Node.js App > Source Code**
5. Upload the new ZIP
6. Click **Deploy**

### Option B: Connect GitHub (optional)

If you prefer auto-deploy:
1. In hPanel, go to your **Node.js App > Git Repository**
2. Click **Connect Repository**
3. Authorise Hostinger to access GitHub
4. Select your repo, branch `main`
5. Turn **Automatic Deployment** ON
6. Now every `git push origin main` auto-deploys in 2-3 minutes

---

## What the Deploy Actually Does

When Hostinger deploys, it runs:

```bash
npm install       # installs all deps
npm start         # NODE_ENV=production node dist/boot.js
```

The `dist/` folder is already in your zip (from `npm run build` locally). Hostinger just installs deps and starts the server.

`dist/boot.js` serves `dist/public/` (frontend files) and handles `/api/trpc/*` (backend API). All in one process.

---

## If It Breaks

### Error: Cannot find module 'hono'

`npm install` failed. Check Deployment Logs. Try changing build command to `npm install --legacy-peer-deps`.

### Error: Missing required environment variable: DATABASE_URL

You forgot to add `DATABASE_URL` in hPanel Environment Variables.

### Error: connect ECONNREFUSED localhost:3306

Database credentials wrong, or database not created yet. Go back to Step 4.

### 404 on every page except `/`

`dist/public/` is missing from the zip, or `npm run build` failed locally. Make sure you ran `npm run build` before zipping.

### Blank white page

Frontend built but API is not responding. Check `VITE_APP_ID` and `VITE_KIMI_AUTH_URL` are set in hPanel env vars.

---

## Rollback

Keep a working `deploy.zip` on your computer. If a deploy breaks:

1. In hPanel, go to **Node.js App > Source Code**
2. Re-upload the last working ZIP
3. Click **Deploy**

Or if using GitHub:

```bash
git revert HEAD
git push origin main
```

