# 🐛 AI Debugging Agent

An AI-powered full-stack web application for automated code debugging, analysis, optimization, and learning — powered by **Groq LLM (Llama 3.3 70B)**.

---

## ✨ Features

- **AI Code Analysis** — syntax errors, logical errors, bug detection
- **AI Chat Assistant** — 7 modes: Chat, Explain, Test Cases, Optimize, Complexity, Bug Predict, Interview
- **10 Programming Languages** — Java, Python, C++, JavaScript, C#, TypeScript, Go, Rust, Swift, Kotlin
- **10 UI Languages** — English, Tamil, Hindi, French, Spanish, German, Chinese, Arabic, Portuguese, Japanese
- **Code Translation** — convert between any 2 languages
- **Flowchart Generator** — visual flowchart from code
- **Debug History** — searchable, filterable analysis history
- **PDF Reports** — download full analysis as PDF
- **Dashboard** — stats, charts, recent activity
- **Dark / Light Theme**
- **User Settings** — theme, font size, autosave

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Monaco Editor |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |
| AI | Groq API (Llama 3.3 70B) |
| Auth | JWT |

---

## 🚀 Deployment Guide

### Architecture
```
Frontend (React)  →  Vercel
Backend (Node.js) →  Render
Database (MySQL)  →  PlanetScale (free) or Railway
```

---

### Step 1 — Set up MySQL Database (PlanetScale — free)

1. Go to **https://planetscale.com** → sign up free
2. Create a database → name it `debugging_agent`
3. Get the connection string — note host, user, password
4. Run the SQL schema:
   - Copy contents of `database/init.sql`
   - Run in PlanetScale console
   - Run `database/migrate.sql`
   - Run `database/add_user_fields.sql`

---

### Step 2 — Deploy Backend to Render (free)

1. Go to **https://render.com** → sign up with GitHub
2. **New** → **Web Service** → connect your `DebuggingAgent` repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DB_HOST` | your PlanetScale host |
| `DB_PORT` | `3306` |
| `DB_USER` | your DB user |
| `DB_PASSWORD` | your DB password |
| `DB_NAME` | `debugging_agent` |
| `JWT_SECRET` | any random 32+ char string |
| `JWT_EXPIRES_IN` | `7d` |
| `GROQ_API_KEY` | your Groq key from console.groq.com |
| `FRONTEND_URL` | your Vercel URL (add after Step 3) |

5. Click **Deploy** → copy the URL e.g. `https://debugging-agent-backend.onrender.com`

---

### Step 3 — Deploy Frontend to Vercel (free)

1. Go to **https://vercel.com** → sign up with GitHub
2. **New Project** → import `DebuggingAgent` repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variable**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://debugging-agent-backend.onrender.com/api` |

5. Click **Deploy** → copy the URL e.g. `https://debugging-agent.vercel.app`

---

### Step 4 — Update Backend CORS

Go back to **Render** → your backend service → **Environment** → update:

```
FRONTEND_URL=https://debugging-agent.vercel.app
```

Click **Save** — backend redeploys automatically.

---

## 💻 Local Development

```bash
# 1. Clone
git clone https://github.com/DEEPIKA-A-27/DebuggingAgent.git
cd DebuggingAgent

# 2. Backend
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                 # runs on http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env        # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # runs on http://localhost:5173
```

---

## 🔑 Required API Keys

| Service | Where to get | Free tier |
|---|---|---|
| **Groq API** | https://console.groq.com/keys | 14,400 req/day |
| **MySQL** | PlanetScale / Railway / local | Free tier available |

---

## 📁 Project Structure

```
DebuggingAgent/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/   # DB + AI config
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── database/         # SQL schema files
```
