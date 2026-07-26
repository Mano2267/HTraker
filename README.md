# HIA (Health Insights Agent) — Node/Express + React + MongoDB port


| Concern            | Original                          | This version                                      |
|---------------------|------------------------------------|----------------------------------------------------|
| Frontend            | Streamlit                          | React (Vite) + Tailwind + Framer Motion                                        |
| Backend             | Python (in-process with Streamlit) | Node.js + Express (REST API)                         |
| Database            | Supabase (PostgreSQL)              | MongoDB (Mongoose)                                   |
| Auth                | Supabase Auth                      | JWT + bcrypt                                         |
| LLM                 | Groq (multi-model cascade)         | Groq (multi-model cascade) — same models, `groq-sdk` |
| RAG / vector store  | LangChain + HuggingFace + FAISS    | `@xenova/transformers` (local embeddings) + in-memory cosine similarity over chunks stored per-session in MongoDB |
| PDF parsing         | PDFPlumber                         | `pdf-parse`                                          |

## Project structure

```
hia-mern/
├── backend/     # Express API, MongoDB models, Groq services
└── frontend/    # React (Vite) SPA
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev
```

Requires a running MongoDB instance (local `mongod` or MongoDB Atlas connection string).
Get a Groq API key from https://console.groq.com.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. Vite proxies `/api` to `http://localhost:5000`.

## Frontend UI/UX Enhancements

The React frontend features a modern, polished interface with:

- **Split-Screen Authentication**: Login and signup pages display a background image on the left and the form on the right for an engaging, balanced layout
- **Branded Logo**: Consistent HIA Workspace branding with logo display in the header and sidebar
- **Smooth Animations**: Page transitions and interactive elements powered by Framer Motion for a fluid user experience
- **Responsive Design**: Optimized layout for desktop and mobile devices with tailored spacing and proportions
- **Tailwind CSS Styling**: Modern color palette (sky/cyan) with rounded corners, glassmorphism effects, and gradient accents
- **Assets**: Professional branding image (`logo.png`) and background illustration (`background.png`)

## How the pieces map to the original app

- **Auth** (`routes/authRoutes.js`, `controllers/authController.js`): signup/login/me,
  replacing Supabase Auth with JWT + bcrypt-hashed passwords in MongoDB.
- **Sessions** (`ChatSession` model): each session stores its report text, analysis,
  patient info, and — instead of a separate FAISS index file — an array of
  `{ text, embedding }` chunks used for retrieval.
- **Analysis agent** (`services/analysisAgent.js`, `services/modelManager.js`): same
  multi-model Groq cascade (`llama-4-maverick` → `llama-3.3-70b` → `llama-3.1-8b` →
  `llama3-70b-8192`) as the original `model_manager.py`.
- **Chat agent / RAG** (`services/ragService.js`, `services/chatAgent.js`): report text
  is chunked and embedded locally with `Xenova/all-MiniLM-L6-v2` (same base model as the
  original's HuggingFace embeddings), then retrieved via cosine similarity — a
  lightweight in-app substitute for FAISS since plain MongoDB (non-Atlas) has no native
  vector search.
- **Daily analysis limit**: tracked on the `User` document (`dailyAnalysisCount`,
  resets daily), shown in the sidebar.
- **PDF validation**: page-count limit and "does this look like a medical report"
  heuristic ported to `utils/pdfExtractor.js` / `utils/validators.js`.

## Notes / next steps

**Frontend**:
- Animations use `framer-motion` for page transitions and interactive effects
- Split-screen auth layout is responsive; on smaller screens, the image panel hides (lg breakpoint)
- Logo and background assets are bundled with Vite and optimized for production

**Backend**:
- If you'd rather not run local embeddings (`@xenova/transformers` downloads a small
  model on first run), swap `services/ragService.js` to call an embeddings API instead.
- For production, consider MongoDB Atlas Vector Search instead of the in-app cosine
  similarity scan once chunk counts grow large.
- Add refresh tokens / rate limiting per-user if deploying publicly — current setup has
  a global rate limiter only.
