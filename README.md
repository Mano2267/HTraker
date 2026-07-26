# 🩺 HIA — Health Insights Agent

**A MERN-stack port of the original Streamlit-based Health Insights Agent** — upload a medical report, get an AI-generated plain-language breakdown, and chat with an assistant grounded in your report's actual content.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)

---

## 📖 Overview

This is a full rewrite of the original Streamlit + Supabase + LangChain app into a modern **MERN** architecture — same core capability (report analysis + RAG-based chat), rebuilt as a proper REST API + SPA.

| Concern | Original | This Version |
|---|---|---|
| Frontend | Streamlit | React (Vite) + Tailwind + Framer Motion |
| Backend | Python (in-process with Streamlit) | Node.js + Express (REST API) |
| Database | Supabase (PostgreSQL) | MongoDB (Mongoose) |
| Auth | Supabase Auth | JWT + bcrypt |
| LLM | Groq (multi-model cascade) | Groq (multi-model cascade) — same models, `groq-sdk` |
| RAG / Vector Store | LangChain + HuggingFace + FAISS | `@xenova/transformers` local embeddings + in-memory cosine similarity |
| PDF Parsing | PDFPlumber | `pdf-parse` |

---

## ✨ Features

- 🔐 **JWT Authentication** — signup/login with bcrypt-hashed passwords
- 📄 **PDF Report Upload** — extracts and validates medical report text
- 🤖 **AI Report Analysis** — structured summary, key findings, abnormal values, and recommendations via a 4-model Groq fallback cascade
- 💬 **RAG-Powered Chat** — ask follow-up questions grounded in your actual report using local embeddings + cosine similarity retrieval
- 📊 **Daily Usage Limits** — per-user analysis quota tracked in MongoDB
- 🎨 **Polished UI** — split-screen auth, glassmorphism, smooth Framer Motion transitions, responsive layout

---

## 🗂️ Project Structure

```
hia-mern/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # auth, sessions, analysis, chat
│   ├── middleware/      # JWT auth guard, rate limiter
│   ├── models/          # User, ChatSession (Mongoose schemas)
│   ├── routes/          # /api/auth, /api/sessions
│   ├── services/        # Groq client, model cascade, RAG, analysis/chat agents
│   ├── utils/           # PDF extraction, report validation
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/  # UI components
    │   ├── pages/       # Auth, Dashboard, Chat views
    │   └── App.jsx
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local `mongod` or a MongoDB Atlas connection string)
- A [Groq API key](https://console.groq.com)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. Vite proxies `/api` requests to the backend on port `5000`.

---

## 🔧 Environment Variables

`backend/.env`

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `GROQ_API_KEY` | API key from console.groq.com |
| `DAILY_ANALYSIS_LIMIT` | Max analyses per user per day |
| `CLIENT_URL` | Frontend origin, for CORS |

---

## 🧠 How the Pieces Map to the Original App

- **Auth** (`authController.js`) — signup/login/me, replacing Supabase Auth with JWT + bcrypt-hashed passwords in MongoDB.
- **Sessions** (`ChatSession` model) — each session stores report text, analysis, patient info, and — instead of a FAISS index file — an array of `{ text, embedding }` chunks used for retrieval.
- **Analysis agent** (`analysisAgent.js`, `modelManager.js`) — same multi-model Groq cascade (`llama-4-maverick` → `llama-3.3-70b` → `llama-3.1-8b` → `llama3-70b-8192`) as the original `model_manager.py`.
- **Chat agent / RAG** (`ragService.js`, `chatAgent.js`) — report text is chunked and embedded locally with `Xenova/all-MiniLM-L6-v2` (same base model as the original's HuggingFace embeddings), retrieved via cosine similarity as a lightweight substitute for FAISS.
- **Daily analysis limit** — tracked on the `User` document (`dailyAnalysisCount`, resets daily).
- **PDF validation** — page-count limit and "does this look like a medical report" heuristic in `pdfExtractor.js` / `validators.js`.

---

## 🎨 Frontend UI/UX

- **Split-Screen Authentication** — background image on the left, form on the right
- **Branded Logo** — consistent HIA Workspace branding in header and sidebar
- **Smooth Animations** — page transitions powered by Framer Motion
- **Responsive Design** — tailored spacing for desktop and mobile
- **Modern Styling** — Tailwind CSS, sky/cyan palette, glassmorphism, gradient accents

---

## 🗺️ Roadmap / Next Steps

- [ ] Swap local embeddings for an embeddings API if you'd rather not download the model on first run
- [ ] Move to MongoDB Atlas Vector Search once chunk counts grow large
- [ ] Add refresh tokens
- [ ] Add per-user rate limiting (current setup is global only)

---

## ⚠️ Disclaimer

This tool provides general informational summaries of medical reports and is **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult a qualified healthcare provider.

---

## 📄 License

MIT
