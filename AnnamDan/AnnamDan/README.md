# 🌶️ Annam Daan — Surplus to Sacred Smiles

An AI-powered food-rescue ecosystem that connects **donors** (hotels, wedding
halls, caterers), **NGOs/Trusts**, **volunteers**, and the **public** to
redistribute surplus food safely and in real time.

> Built like a funded startup — Apple-quality UI, Airbnb-grade UX, Stripe-class
> design system.

---

## 🧱 Architecture

```
annam-daan/
├── frontend/        React + Vite + TS + Tailwind + ShadCN + Framer Motion
├── backend/         Node.js + Express + TypeScript (JWT, Firebase Admin)
├── ai-services/     Python + FastAPI (Tesseract OCR + TensorFlow CNN)
├── firebase/        Firestore + Storage rules, indexes, hosting config
└── docker-compose.yml
```

## 🚀 Quickstart

### 1) Frontend
```bash
cd frontend
cp .env.example .env       # fill Firebase keys when ready
npm install
npm run dev                # http://localhost:5173
```

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev                # http://localhost:5000
```

### 3) AI services (optional in dev — backend falls back to mock)
```bash
cd ai-services
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

### 4) All in one (Docker)
```bash
docker compose up --build
```

---

## 🎨 Design system

Premium red + white, designed for emotional clarity:

| Token        | Color                |
|--------------|----------------------|
| `brand-700`  | `#8B0000`            |
| `brand-600`  | `#A11212`            |
| `brand-500`  | `#C62828`            |
| `brand-300`  | `#E57373`            |
| `brand-100`  | `#FFCDD2`            |
| `success`    | `#16A34A`            |
| `warning`    | `#F59E0B`            |

Typography: **Inter** + **Poppins** (display). Glassmorphism, soft shadows,
rounded-2xl cards, animated counters, micro-interactions throughout.

## 🧩 Modules

- **Auth** — Email/Password, OTP, Google (Firebase), role-based JWT.
- **Donor** — Add donation, OCR-verified FSSAI, AI safety check, tracking, analytics.
- **NGO / Trust** — Nearby map, real-time matching, accept pickup, encrypted QR.
- **Volunteer** — Assignments, live route, GPS tracking, donor contact.
- **Public user** — Impact feed, contribute to trust needs.
- **Admin** — Command center, users, AI monitoring, verifications, fraud signals.

## 🤖 AI engine

- **OCR (Tesseract)** — Extracts FSSAI license, validates format, confidence.
- **CNN (TensorFlow)** — Classifies food into `fresh / slightly_stale / unsafe`
  with shelf-life prediction. Heuristic fallback ships in repo; drop trained
  weights into `ai-services/models/food_safety.h5` to enable.

## 🛰️ Real-time matching engine

`backend/src/services/matchingService.ts` ranks NGOs by capacity fit,
distance, rating, reliability, and remaining pickup window — returns top-N.

## 🔐 QR verification

`backend/src/services/qrService.ts` issues HMAC-signed encrypted tokens with:
- donation ID, NGO ID, GPS coordinates, expiry timestamp
- verified server-side against signature, time window, and geofence radius.

## 🔥 Firebase

- `firebase/firestore.rules` — role-based read/write enforcement
- `firebase/storage.rules` — per-user license + image uploads
- `firebase/firestore.indexes.json` — composite indexes for queries

```bash
cd firebase
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## ☁️ Deployment

| Service     | Platform              |
|-------------|------------------------|
| Frontend    | Vercel (recommended) or Firebase Hosting |
| Backend     | Render / Railway / Fly |
| AI services | Render / Railway (Docker) |
| Database    | Firebase Firestore    |
| Storage     | Firebase Cloud Storage |
| Push        | Firebase Cloud Messaging |

**Vercel (frontend):**
```bash
cd frontend && vercel --prod
```

**Render (backend + AI):** point at `./backend/Dockerfile` and
`./ai-services/Dockerfile` respectively, set env vars from the `.env.example`.

## 🧠 API reference (summary)

| Method | Path                          | Notes                              |
|--------|-------------------------------|------------------------------------|
| POST   | `/api/auth/login`             | Email/password — returns JWT       |
| POST   | `/api/auth/register`          | Create account                     |
| GET    | `/api/auth/me`                | Current user (auth)                |
| GET    | `/api/donations`              | List (scoped by role)              |
| GET    | `/api/donations/nearby`       | Live donations near caller         |
| POST   | `/api/donations`              | Donor only                         |
| PATCH  | `/api/donations/:id/status`   | live → accepted → picked_up        |
| POST   | `/api/qr/issue`               | Issue encrypted token              |
| POST   | `/api/qr/verify`              | Verify token + geofence + expiry   |
| POST   | `/api/ai/ocr/fssai`           | Proxy to AI service                |
| POST   | `/api/ai/cnn/safety`          | Proxy to AI service                |
| POST   | `/api/matching`               | Rank NGOs for a donation           |

## 🛡️ Security

- Helmet, CORS, rate limiting, JSON limits
- JWT auth + role middleware
- Firestore/Storage rules enforce ownership
- Validated inputs via Zod
- HMAC-signed, expiring, geofenced QR tokens

## 📦 Folder map

See `frontend/src/{components,pages,layouts,hooks,services,store}` and
`backend/src/{controllers,routes,services,middleware,validators}` — both
follow a clean, scalable layered architecture.

---

> Made with love. Every plate has a destination.
