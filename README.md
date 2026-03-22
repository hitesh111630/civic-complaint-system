# The Civil Dialogue — Civic Complaint Management System

A full-stack production-ready civic complaint platform with AI-powered categorization,
JWT auth, file uploads, role-based dashboards, and public transparency portal.

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 18 + Vite + TypeScript + Tailwind CSS   |
| Backend   | FastAPI (Python 3.11+)                        |
| Database  | PostgreSQL + SQLAlchemy ORM                   |
| Auth      | JWT (python-jose + passlib/bcrypt)            |
| Uploads   | Multipart/form-data → local filesystem        |
| AI        | Keyword-based classifier (swappable with ML)  |

---

## Project Structure

```
civic/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # /api/auth/*
│   │   │   ├── complaints.py    # /api/complaints/*
│   │   │   └── users.py         # /api/users/*
│   │   ├── models/
│   │   │   └── __init__.py      # SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── __init__.py      # Pydantic request/response schemas
│   │   ├── services/
│   │   │   └── classifier.py    # AI text classification
│   │   ├── utils/
│   │   │   ├── auth.py          # JWT + password hashing
│   │   │   └── files.py         # File upload helpers
│   │   ├── config.py            # Settings from .env
│   │   └── database.py          # SQLAlchemy engine + session
│   ├── uploads/                 # Uploaded media (gitignored)
│   ├── main.py                  # FastAPI app entrypoint
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── complaints/
    │   │   │   ├── ComplaintCard.tsx
    │   │   │   ├── ComplaintForm.tsx   # File upload + AI preview
    │   │   │   └── ProcessJourney.tsx  # Status timeline
    │   │   ├── dashboard/
    │   │   │   └── StatCard.tsx
    │   │   ├── layout/
    │   │   │   └── Navbar.tsx
    │   │   └── ui/
    │   │       └── StatusBadge.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx    # Global auth state
    │   ├── hooks/
    │   │   └── useAsync.ts        # Generic async state hook
    │   ├── lib/
    │   │   └── api.ts             # Axios client + all API calls
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── SignUpPage.tsx
    │   │   ├── CitizenDashboard.tsx
    │   │   ├── OfficialDashboard.tsx
    │   │   ├── ComplaintDetail.tsx
    │   │   └── PublicTransparency.tsx
    │   ├── types/
    │   │   └── index.ts           # TypeScript interfaces
    │   ├── App.tsx                # Route definitions
    │   └── main.tsx               # React root
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    └── package.json
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Database Setup

```bash
# Start PostgreSQL and create the database
psql -U postgres

CREATE USER civic_user WITH PASSWORD 'civic_pass';
CREATE DATABASE civic_db OWNER civic_user;
GRANT ALL PRIVILEGES ON DATABASE civic_db TO civic_user;
\q
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — update DATABASE_URL and SECRET_KEY at minimum

# Start the server (tables are auto-created on first run)
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
Interactive docs: `http://localhost:8000/api/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create env file (optional — Vite proxy handles /api by default)
echo "VITE_API_URL=/api" > .env

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`

---

### 4. Seed Demo Data (optional)

```bash
cd backend
python seed.py
```

This creates:
- 1 citizen account: `citizen@demo.com` / `password123`
- 1 official account: `official@demo.com` / `password123`
- 10 sample complaints across different departments and statuses

---

## API Reference

### Auth

| Method | Endpoint          | Auth | Description          |
|--------|-------------------|------|----------------------|
| POST   | /api/auth/register | —   | Register new user    |
| POST   | /api/auth/login    | —   | Login, returns JWT   |
| GET    | /api/auth/me       | ✓   | Current user profile |

### Complaints

| Method | Endpoint                        | Auth     | Description              |
|--------|---------------------------------|----------|--------------------------|
| POST   | /api/complaints/                | citizen  | Create (multipart/form)  |
| GET    | /api/complaints/                | any      | List (filtered)          |
| GET    | /api/complaints/public          | —        | Public transparency feed |
| GET    | /api/complaints/stats           | official | Dashboard metrics        |
| GET    | /api/complaints/distribution    | official | Category breakdown       |
| GET    | /api/complaints/{id}            | any      | Complaint detail         |
| PUT    | /api/complaints/{id}/status     | official | Post update + status     |
| POST   | /api/complaints/{id}/rate       | citizen  | Rate resolved complaint  |

### Users

| Method | Endpoint            | Auth     | Description        |
|--------|---------------------|----------|--------------------|
| GET    | /api/users/officials | official | List officials     |
| GET    | /api/users/leaderboard | —      | Civic points board |

---

## User Roles & Flows

### Citizen
1. Register / Login → Citizen Dashboard
2. Submit complaint with description, location, photo/video
3. AI auto-categorizes → department assigned
4. Track status via Process Journey timeline
5. Rate resolved complaints (+5 civic points)

### Official
1. Login → Executive Dashboard
2. View all complaints with stats and distribution
3. Open complaint → post update + change status
4. Route complaints to departments

### Public (no auth)
- `/transparency` — public map with all complaints, filters, stats

---

## Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql://civic_user:civic_pass@localhost:5432/civic_db
SECRET_KEY=your-long-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
```

### Frontend `.env` (optional)

```env
VITE_API_URL=/api
```

---

## Production Deployment

### Backend

```bash
# Use gunicorn with uvicorn workers
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or with Docker
docker build -t civil-backend .
docker run -p 8000:8000 --env-file .env civil-backend
```

### Frontend

```bash
npm run build        # Outputs to dist/
# Serve dist/ with nginx, Vercel, Netlify, etc.
```

### Nginx Reverse Proxy (example)

```nginx
server {
    listen 80;
    server_name yourcity.gov;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        client_max_body_size 25M;
    }

    location /uploads {
        proxy_pass http://localhost:8000;
    }

    location / {
        root /var/www/civil-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Upgrading the AI Classifier

The classifier in `backend/app/services/classifier.py` uses keyword matching.
To upgrade to a real ML model:

```python
# Option A: HuggingFace zero-shot (no training needed)
from transformers import pipeline
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
labels = ["Water Leakage", "Potholes & Roads", "Garbage Collection", "Street Lighting"]
result = classifier(description, candidate_labels=labels)

# Option B: OpenAI
import openai
# Send description, get JSON category + department back
```

---

## Common Issues

**`psycopg2` install fails on Mac M1/M2:**
```bash
brew install postgresql
pip install psycopg2-binary
```

**CORS errors in browser:**
Make sure `CORS_ORIGINS` in `.env` matches your frontend URL exactly (no trailing slash).

**Uploads not serving:**
Check `UPLOAD_DIR` path exists and is readable. The `/uploads` static mount requires the directory to exist at startup.

**JWT expired (401 on refresh):**
Increase `ACCESS_TOKEN_EXPIRE_MINUTES` in `.env` or implement token refresh.
