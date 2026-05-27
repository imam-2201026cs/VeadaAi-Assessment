# VedaAI – AI Assessment Creator

A full-stack AI-powered question paper generator that allows teachers to create structured exam papers using LLMs, with real-time progress via WebSockets.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│   Next.js 14 + TypeScript + Zustand + Socket.io-client          │
│                                                                 │
│   [Form Page] → [Generating Page] → [Output Page]              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP (REST) + WebSocket
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                  │
│                                                                 │
│   POST /api/assignments  ──→  BullMQ Queue                      │
│   GET  /api/assignments/:id   MongoDB lookup + Redis cache      │
│   Socket.io Server  ──→  Rooms per assignmentId                 │
└──────┬──────────────────────────────────────┬───────────────────┘
       │                                      │
┌──────▼──────┐   ┌──────────────┐   ┌───────▼────────┐
│  MongoDB    │   │    Redis     │   │  BullMQ Worker │
│  Stores:    │   │  - Job state │   │  - Picks jobs  │
│  - Assign.  │   │  - Cache     │   │  - Calls AI    │
│  - Papers   │   │  - Queues    │   │  - Emits WS    │
└─────────────┘   └──────────────┘   └────────────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │  Anthropic Claude  │
                                    │  (LLM Generation)  │
                                    └────────────────────┘
```

### Request Flow

1. **Teacher fills form** → Frontend validates with Zod → POST `/api/assignments`
2. **Backend creates** MongoDB document (status: `pending`) → adds job to **BullMQ queue** → returns `assignmentId`
3. **Frontend joins** WebSocket room `assignment:{id}` and shows progress screen
4. **BullMQ Worker** picks up the job → calls **Anthropic Claude API** with structured prompt
5. **Worker emits progress** via Socket.io at each step (10% → 30% → 70% → 90% → 100%)
6. On completion: **stores result** in MongoDB + **invalidates Redis cache** → emits `job:completed`
7. **Frontend receives** WebSocket event → Zustand store updates → navigates to Output page
8. **Output page** displays structured paper (never raw LLM text), with PDF export via jsPDF

---

## Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Zustand, Socket.io-client, React Hook Form + Zod, jsPDF |
| Backend    | Node.js, Express, TypeScript                   |
| Database   | MongoDB (via Mongoose)                         |
| Cache/Queue| Redis + BullMQ                                 |
| Realtime   | Socket.io (WebSocket)                          |
| AI         | Anthropic Claude (structured JSON prompting)   |
| Container  | Docker + Docker Compose                        |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Anthropic API key

### Option 1 — Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/vedaai-assessment-creator
cd vedaai-assessment-creator

# 2. Set your API key
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-...

# 3. Start everything
docker-compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
```

### Option 2 — Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env:
#   MONGODB_URI=mongodb://localhost:27017/vedaai
#   REDIS_URL=redis://localhost:6379
#   ANTHROPIC_API_KEY=sk-ant-...
#   FRONTEND_URL=http://localhost:3000

# Terminal 1: Start API server
npm run dev

# Terminal 2: Start BullMQ worker
npm run worker
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:5000
#   NEXT_PUBLIC_WS_URL=http://localhost:5000

# Start dev server
npm run dev

# → http://localhost:3000
```

---

## API Reference

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| POST   | `/api/assignments`              | Create assignment + queue job      |
| GET    | `/api/assignments`              | List all assignments (paginated)   |
| GET    | `/api/assignments/:id`          | Get assignment + generated paper   |
| GET    | `/api/assignments/:id/status`   | Get job status                     |
| DELETE | `/api/assignments/:id`          | Delete assignment                  |
| GET    | `/health`                       | Health check                       |

### POST `/api/assignments` — Request Body

```json
{
  "title": "Mid-Term Examination",
  "subject": "Mathematics",
  "dueDate": "2025-03-21",
  "questionTypes": ["MCQ", "Short Answer"],
  "numQuestions": 10,
  "totalMarks": 50,
  "difficulty": "mixed",
  "additionalInstructions": "Focus on chapters 3-5"
}
```

### WebSocket Events

| Event           | Direction         | Payload                                      |
|-----------------|-------------------|----------------------------------------------|
| `join:assignment` | Client → Server | `assignmentId: string`                       |
| `job:progress`  | Server → Client   | `{ progress, message, assignmentId }`        |
| `job:completed` | Server → Client   | `{ paper: GeneratedPaper, assignmentId }`    |
| `job:failed`    | Server → Client   | `{ error: string, assignmentId }`            |

---

## Features

### Core
- ✅ Assignment creation form with full validation (Zod + server-side)
- ✅ AI question paper generation (Claude API)
- ✅ Real-time progress via WebSocket (Socket.io)
- ✅ Background job processing (BullMQ)
- ✅ MongoDB persistence for assignments and papers
- ✅ Redis caching for completed papers
- ✅ Structured output page (never renders raw LLM response)
- ✅ PDF export (proper formatting via jsPDF)
- ✅ Assignment history page

### Question Paper Output
- Sections (A, B, C) with titles and instructions
- Each question: text, difficulty badge (Easy/Moderate/Hard), type, marks
- Student info section (Name, Roll Number, Section)
- General instructions
- Total marks and duration display

### Bonus
- ✅ PDF export with proper A4 formatting
- ✅ Regenerate action
- ✅ Difficulty color-coded badges
- ✅ Mobile responsive
- ✅ History page with view/delete
- ✅ Docker Compose for one-command setup

---

## Project Structure

```
vedaai/
├── backend/
│   ├── src/
│   │   ├── config/          # DB and Redis connections
│   │   ├── controllers/     # Express route handlers
│   │   ├── middleware/       # Validation middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # AI, Queue, WebSocket services
│   │   ├── workers/         # BullMQ worker process
│   │   ├── types/           # TypeScript interfaces
│   │   └── index.ts         # App entry point
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── form/        # Assignment creation form
│   │   │   ├── output/      # Question paper display
│   │   │   └── ui/          # Navbar, GeneratingScreen
│   │   ├── hooks/           # useWebSocket hook
│   │   ├── lib/             # API client, PDF export, validation
│   │   ├── store/           # Zustand store
│   │   └── types/           # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Design Decisions

- **BullMQ over direct API call**: AI generation can take 5–15 seconds. Offloading to a queue lets the HTTP request return immediately and delivers results push-style via WebSocket — far better UX.
- **Redis dual role**: Acts as both the BullMQ job store and a cache layer for completed papers, reducing MongoDB reads on the output page.
- **Structured prompting + JSON parsing**: The LLM is instructed to return strict JSON. The worker parses and validates the structure before storing — the frontend always renders typed data, never raw text.
- **Zustand over Redux**: Lighter API, no boilerplate, works great with Next.js App Router. Redux would also satisfy the requirement.
- **Socket.io rooms**: Each assignment gets its own room (`assignment:{id}`), so progress events are scoped — no broadcasting to unrelated clients.
