# 🚀 Deployment Guide — FairPlay Auctions

> **Last Updated:** 20 April 2026
> Free deployment on [Render.com](https://render.com) (recommended) — no credit card required.

---

## Table of Contents

1. [Quick Start (Docker — Local)](#1-quick-start-docker--local)
2. [Free Cloud Deployment (Render.com)](#2-free-cloud-deployment-rendercom)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Manual Local Setup (No Docker)](#4-manual-local-setup-no-docker)

---

## 1. Quick Start (Docker — Local)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
# Clone the repository
git clone <your-repo-url>
cd Project

# Build and launch all 4 services (Postgres, Redis, Backend, Frontend)
docker-compose up --build

# Access the app
# Frontend:  http://localhost
# Backend:   http://localhost:5000/api/health
# Database:  localhost:5432
# Redis:     localhost:6379
```

### Useful Docker Commands

```bash
# Run in background (detached)
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all containers
docker-compose down

# Stop and delete the database volume (full reset)
docker-compose down -v

# Rebuild a single service
docker-compose up --build backend
```

---

## 2. Free Cloud Deployment (Render.com)

### Architecture on Render

```
[Render Static Site]    [Render Web Service]   [Render PostgreSQL]
  Frontend (React)  →→→  Backend (Node.js)  →→→  PostgreSQL DB
  (Free tier)            (Free tier)             (Free tier)
                              ↕
                        [Upstash Redis]
                        (Free tier, external)
```

### Step 1: Push to GitHub

Make sure your code is pushed to a GitHub repository (already done).

### Step 2: Create PostgreSQL Database on Render

1. Go to [render.com](https://render.com) → **New** → **PostgreSQL**
2. Set:
   - **Name:** `fairplay-db`
   - **Region:** Oregon (US West) — or closest to you
   - **Plan:** Free
3. Click **Create Database**
4. Copy the **Internal Database URL** (looks like `postgres://user:pass@host/dbname`) — you'll need it in Step 3.

### Step 3: Deploy the Backend

1. Go to Render → **New** → **Web Service**
2. Connect your GitHub repository
3. Set the following **Build & Deploy** settings:

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | Free |

4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *(paste Internal DB URL from Step 2)* |
   | `JWT_SECRET` | *(any long random string — e.g., generate at [randomkeygen.com](https://randomkeygen.com))* |
   | `NODE_ENV` | `production` |
   | `REDIS_URL` | *(from Step 4, or leave blank — jobs are gracefully skipped)* |

5. Click **Create Web Service**.
6. Wait for build. Copy the URL (e.g., `https://fairplay-backend.onrender.com`).

### Step 4: Set Up Redis (Optional — for background jobs)

1. Go to [upstash.com](https://upstash.com) → **Create Database**
2. Choose **Redis**, **Free tier**
3. Copy the **Redis URL** (looks like `rediss://default:pass@host:port`)
4. Go back to Render → your backend service → **Environment** → add:
   - `REDIS_URL` = *(paste Upstash URL)*

### Step 5: Deploy the Frontend

1. Go to Render → **New** → **Static Site**
2. Connect your GitHub repository
3. Set:

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |
   | **Plan** | Free |

4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://fairplay-backend.onrender.com` |

5. Click **Create Static Site**.

> ⚠️ **SPA Routing:** Render Static Sites need a rewrite rule so React Router works.
> Go to **Redirects/Rewrites** → Add:
> - **Source:** `/*`
> - **Destination:** `/index.html`
> - **Type:** Rewrite

6. Your frontend URL will be something like `https://fairplay-auctions.onrender.com`

---

### ⚠️ Important Notes for Free Tier

| Issue | Solution |
|-------|---------|
| **Backend sleeps after 15 min** | Render free tier spins down on inactivity. First request after sleep takes ~30s. Use [UptimeRobot](https://uptimerobot.com) (free) to ping `/api/health` every 10 minutes. |
| **Database auto-deletes after 90 days** | Render free PostgreSQL expires after 90 days. You'll need to back up or recreate. |
| **WebSockets on free tier** | Socket.io works on Render free Web Services. Ensure your frontend WebSocket URL points to the backend Render URL. |

---

## 3. Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | HTTP server port |
| `DATABASE_URL` | Cloud only | — | Full Postgres connection string (Render/Railway) |
| `DB_NAME` | Local only | `fairplay_auction` | Database name |
| `DB_USER` | Local only | `postgres` | Database user |
| `DB_PASSWORD` | Local only | `301204` | Database password |
| `DB_HOST` | Local only | `localhost` | Database host (`postgres` in Docker) |
| `JWT_SECRET` | **Yes** | — | Secret for signing JWTs — change in production! |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection string — omit to disable background jobs |
| `NODE_ENV` | No | — | Set to `production` to enable SSL for Postgres |

### Frontend (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Cloud only | — | Backend API base URL (e.g., `https://fairplay-backend.onrender.com`) |

> **Note:** If `VITE_API_URL` is not set (local dev), the frontend Vite dev server proxies API calls via `localhost:5000`.

---

## 4. Manual Local Setup (No Docker)

### Prerequisites
- [Node.js 20+](https://nodejs.org)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [Redis](https://redis.io/download) *(optional — job queues gracefully degrade without it)*

### Setup

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE fairplay_auction;"

# 2. Configure backend environment
cd backend
cp .env .env.local
# Edit .env with your Postgres credentials

# 3. Install backend dependencies and start
npm install
npm start
# → API running on http://localhost:5000

# 4. In a new terminal, install frontend and start dev server
cd frontend
npm install
npm run dev
# → Frontend running on http://localhost:5173
```

### Running Tests

```bash
# Backend (27 suites, 190 tests)
cd backend && npm test

# Frontend (9 suites)
cd frontend && npm test
```
