# 🛡️ SURAKSHA — Women Safety PWA

> **"Emergency must work WITHOUT THINKING"**

A production-grade, mobile-first women safety application built on the MERN stack with Google Maps integration, real-time emergency alerts, cloud recording, and AI-powered risk scoring.

---

## 📦 Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 18, React Router v6, Context API  |
| Styling     | Pure CSS (design tokens, mobile-first)  |
| Backend     | Node.js, Express.js                     |
| Database    | MongoDB + Mongoose                       |
| Auth        | JWT (30-day expiry, localStorage)        |
| Real-time   | Socket.IO                               |
| Maps        | Google Maps JavaScript API + Directions |
| Storage     | AWS S3 / Firebase Storage               |
| SMS Alerts  | Twilio                                  |
| PWA         | Workbox (offline support)               |

---

## 🎨 Color System

| Role              | Color     | Used For                        |
|-------------------|-----------|---------------------------------|
| Primary BG        | `#0B1220` | Deep midnight navy — calm auth  |
| Pink Core         | `#E11D74` | Brand, CTAs, logo — empowerment |
| Pink Soft         | `#F472B6` | Secondary highlights            |
| Emergency Red     | `#991B1B` | SOS button base                 |
| Active Red        | `#DC2626` | Emergency screen, alerts        |
| Safe Green        | `#16A34A` | Status confirmed, safe zones    |
| Warning Yellow    | `#D97706` | Moderate risk areas             |
| Nav Blue          | `#1D4ED8` | Route highlights, active states |

**Psychology:**
- 🌸 Pink = feminine strength, trust, empowerment
- 🔴 Dark Red = urgency only — never decorative
- 🌑 Navy = calm authority, government-grade
- 🔵 Blue = directional, reliable

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Maps API key (with Maps JS + Directions + Geocoding)
- AWS S3 bucket (for recording uploads)
- Twilio account (for SMS alerts) — optional

### 1. Clone & install

```bash
git clone https://github.com/your-repo/suraksha.git
cd suraksha

# Backend
cd backend
npm install
cp .env.example .env
# Fill in your .env values

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Fill in your .env values
```

### 2. Configure environment variables

**Backend `.env`:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/suraksha
JWT_SECRET=your_super_secret_key
GOOGLE_MAPS_API_KEY=AIza...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=suraksha-recordings
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_KEY=AIza...
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

App runs at `http://localhost:3000`

---

## 🗂️ Project Structure

```
suraksha/
├── backend/
│   ├── controllers/
│   │   ├── alertController.js    ← Emergency trigger + risk engine
│   │   ├── authController.js     ← JWT login/register
│   │   ├── contactController.js  ← Emergency contacts CRUD
│   │   ├── routeController.js    ← Safe route scoring
│   │   └── zoneController.js     ← NSHM risk zones
│   ├── middleware/
│   │   └── auth.js               ← protect + optionalAuth
│   ├── models/
│   │   ├── User.js               ← Users with emergency contacts
│   │   ├── Alert.js              ← Emergency alert records
│   │   ├── Recording.js          ← Cloud recording metadata
│   │   └── Zone.js               ← Risk zone data + seeder
│   ├── routes/                   ← Express routers
│   └── server.js                 ← Entry + Socket.IO
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Emergency/
        │   │   └── SOSButton.js  ← Hold-to-activate SOS with progress
        │   ├── Home/
        │   │   ├── RiskMeter.js  ← Zone risk score display
        │   │   └── QuickActions.js
        │   └── Layout/
        │       ├── Navbar.js
        │       ├── BottomNav.js
        │       └── Logo.js
        ├── context/
        │   ├── AuthContext.js    ← JWT auth + persistence
        │   └── EmergencyContext.js ← Global emergency state
        ├── hooks/
        │   ├── useLocation.js    ← Geolocation + reverse geocode
        │   └── useNetwork.js     ← Online/offline + speed detection
        ├── pages/
        │   ├── Home.js           ← SOS + quick actions + risk score
        │   ├── MapPage.js        ← Google Maps + zone markers + routes
        │   ├── EmergencyScreen.js ← Full-screen emergency mode
        │   ├── Profile.js        ← Auth + emergency contacts
        │   └── Alerts.js         ← Alert history + stats
        └── utils/
            └── api.js            ← Axios instance + all API calls
```

---

## 🚨 Emergency Flow

```
User presses SOS (hold 0.8s)
    ↓
EmergencyContext.triggerEmergency()
    ↓
[Vibrate pattern] → [Navigate to /emergency]
    ↓
POST /api/alerts  (optionalAuth — works without login)
    ↓
Backend: calculateRiskScore(lat, lng)
    → Check user's zone against NSHM dataset
    → Apply time-of-day factor
    → Clamp 0–100
    ↓
Alert saved to MongoDB
    ↓
Socket.IO emits to emergency room
    ↓
Contacts notified (Twilio SMS in production)
    ↓
Frontend: start audio recording (MediaRecorder)
    ↓
Live location updates every 10s → PATCH /api/alerts/:id/location
```

---

## 🔐 Security Notes

- JWT with 30-day expiry (no forced logout)
- bcrypt password hashing (12 rounds)
- `optionalAuth` middleware allows emergency without login
- Helmet.js for HTTP security headers
- Rate limiting on auth routes
- Recording files encrypted at rest on S3

---

## 📡 API Endpoints

| Method | Endpoint                    | Auth     | Purpose                  |
|--------|-----------------------------|----------|--------------------------|
| POST   | /api/auth/register          | None     | Create account           |
| POST   | /api/auth/login             | None     | Get JWT token            |
| GET    | /api/auth/me                | Required | Get profile              |
| POST   | /api/alerts                 | Optional | **Trigger emergency**    |
| PATCH  | /api/alerts/:id/location    | None     | Update live location     |
| PATCH  | /api/alerts/:id/resolve     | None     | Cancel/resolve alert     |
| GET    | /api/alerts/my              | Required | Alert history            |
| GET    | /api/zones                  | None     | All risk zones           |
| GET    | /api/zones/nearby           | None     | Nearby zones by coords   |
| GET    | /api/routes/safe            | None     | Safe route comparison    |
| GET    | /api/contacts               | Required | Emergency contacts       |
| POST   | /api/contacts               | Required | Add contact              |
| DELETE | /api/contacts/:id           | Required | Remove contact           |

---

## 🗺️ NSHM Risk Zones (Pre-seeded)

| Zone                  | Risk Score | Level    |
|-----------------------|------------|----------|
| NSHM Main Gate        | 25         | Safe     |
| Hostel Road           | 45         | Moderate |
| Market Area           | 50         | Moderate |
| Durgapur Station Road | 60         | Moderate |
| Dark Side Streets     | 70         | High     |
| Industrial Stretch    | 75         | High     |
| Isolated Bypass       | 80         | Critical |

Scores increase at night: +10 (8PM–10PM), +20 (10PM–5AM)

---

## 🚀 Production Deployment

### Backend → Railway / Render / EC2
```bash
npm start
# Set NODE_ENV=production
# Set all env vars in platform dashboard
```

### Frontend → Vercel / Netlify
```bash
npm run build
# Set REACT_APP_* env vars in platform dashboard
```

### MongoDB → MongoDB Atlas (M0 Free tier works)

### Storage → AWS S3 ap-south-1 (Mumbai region for India)

---

## 🆘 Emergency Numbers (India)
- Police: **100**
- Ambulance: **102**
- Women Helpline: **1091**
- Disaster: **108**

---

*Built for NSHM Knowledge Campus, Durgapur — but deployable anywhere.*
#   S u r a k s h a  
 