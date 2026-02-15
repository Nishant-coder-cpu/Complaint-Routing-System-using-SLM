# Frontend - Grievance Redressal System

React frontend built with Vite for the grievance redressal web application.

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
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_API_URL`: Backend API URL (default: http://localhost:3000/api)

3. **Start development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

## Features

### Public Access
- **Track Complaint** (`/track`) - Track complaint status without login using complaint ID

### Complainant Portal (`/complainant`)
- Submit new complaints
- Anonymous submission option
- AI-powered automatic classification
- Receive unique complaint ID

### Authority Dashboard (`/authority`)
- View department-specific complaints
- Update complaint status (Pending → In Progress → Resolved)
- Add resolution notes
- SLA monitoring

### Admin Dashboard (`/admin`)
- Complete system overview with KPIs
- Severity and department distribution charts
- SLA breach monitoring
- AI chatbot for analytics queries

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── supabase.js          # Supabase client
│   │   └── api.js                # Axios API client
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── TrackComplaint.jsx
│   │   ├── ComplainantPortal.jsx
│   │   ├── AuthorityDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Authentication

Uses Supabase Auth. Users are automatically redirected based on their role:
- `complainant` → `/complainant`
- `authority` → `/authority`
- `admin` → `/admin`

## Deployment

Deploy to Vercel or Netlify:
```bash
npm run build
# Upload dist/ folder or connect Git repository
```
