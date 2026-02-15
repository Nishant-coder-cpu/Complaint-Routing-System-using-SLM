# Grievance Redressal System - Full Stack Web Application

AI-powered grievance classification and management system with React frontend, Node.js backend, and Supabase database.

## System Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Frontend │ ───> │  Node.js Backend │ ───> │ FastAPI AI      │
│  (Port 5173)    │      │  (Port 3000)     │      │ (Port 8000)     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Supabase        │
                         │ (Postgres + Auth)│
                         └─────────────────┘
```

## Features

### Three User Roles
1. **Complainant** - Submit and track complaints
2. **Authority** - Manage department complaints
3. **Admin** - Full system oversight with analytics

### AI-Powered Classification
- Automatic category detection
- Severity assignment (Critical/High/Normal)
- Smart department routing
- SLA calculation
- Anonymity recommendation

### Security & Privacy
- Anonymous complaint support
- Role-based access control
- Supabase RLS policies
- Identity protection for sensitive cases

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+ (for AI service)
- Supabase account

### 1. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the schema:
```bash
# In Supabase SQL Editor, run:
cat database/schema.sql
```

### 2. AI Service (Existing FastAPI)

Your existing AI service should be running:
```bash
cd ../  # Back to Smolify root
uvicorn api:app --reload
```

### 3. Backend Setup

```bash
cd webapp/backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### 4. Frontend Setup

```bash
cd webapp/frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
AI_API_URL=http://localhost:8000
PORT=3000
```

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3000/api
```

## Project Structure

```
webapp/
├── database/
│   └── schema.sql              # Postgres schema with RLS
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── README.md
└── README.md (this file)
```

## API Endpoints

### Public
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints/:id` - Track complaint

### Authenticated
- `GET /api/complaints/my` - User's complaints
- `GET /api/complaints/department` - Department complaints
- `PATCH /api/complaints/:id/status` - Update status

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/sla-breaches` - SLA violations
- `POST /api/admin/chat` - AI chatbot

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
cd backend
# Connect Git repository or deploy directly
```

### Database
- Already hosted on Supabase

### AI Service
- Keep running locally or containerize with Docker

## User Roles Setup

Create users in Supabase Auth, then insert into `users` table:

```sql
INSERT INTO users (id, email, role, department) VALUES
('user-uuid', 'admin@example.com', 'admin', NULL),
('user-uuid', 'authority@example.com', 'authority', 'Internal Complaints Committee'),
('user-uuid', 'user@example.com', 'complainant', NULL);
```

## Tech Stack

- **Frontend**: React 18, Vite, Recharts
- **Backend**: Node.js, Express, Axios
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: FastAPI (existing)
- **Deployment**: Vercel + Railway + Supabase

## License

MIT
