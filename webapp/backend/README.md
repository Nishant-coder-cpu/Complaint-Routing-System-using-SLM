# Backend - Grievance Redressal System

Node.js/Express backend that integrates with FastAPI AI service and Supabase database.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `AI_API_URL`: FastAPI endpoint (default: http://localhost:8000)
- `PORT`: Server port (default: 3000)

3. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Public
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints/:id` - Track complaint

### Authenticated
- `GET /api/complaints/my` - User's complaints
- `GET /api/complaints/department` - Department complaints (authority)
- `PATCH /api/complaints/:id/status` - Update status (authority/admin)

### Admin Only
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/sla-breaches` - SLA violations
- `GET /api/admin/complaints` - All complaints
- `POST /api/admin/chat` - AI chatbot

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client
│   ├── middleware/
│   │   └── auth.js               # Auth & role verification
│   ├── routes/
│   │   ├── complaints.js         # Complaint endpoints
│   │   └── admin.js              # Admin endpoints
│   ├── services/
│   │   └── ai.service.js         # AI API integration
│   └── server.js                 # Express app
├── package.json
└── .env.example
```

## Authentication

Uses Supabase Auth with JWT tokens. Include token in Authorization header:
```
Authorization: Bearer <token>
```

## Role-Based Access

- **Complainant**: Submit and track own complaints
- **Authority**: View/update department complaints
- **Admin**: Full access + analytics
