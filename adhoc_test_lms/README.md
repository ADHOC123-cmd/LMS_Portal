# ADHOC LMS — Learning Management System

> A premium, frontend-only Learning Management System built with React 19, Vite 6, and Tailwind CSS v4. Designed around the "Digital Curator" aesthetic — deep navy palettes, Manrope/Inter dual-typefaces, and glassmorphism layering for a high-end academic experience.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Features Implemented](#features-implemented)
- [Design System](#design-system)
- [Getting Started](#getting-started)
- [Access Credentials](#access-credentials)
- [Build & Deployment](#build--deployment)

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 |
| **Build Tool** | Vite 6.4 |
| **Styling** | Tailwind CSS v4 (CSS Variables) |
| **Routing** | React Router DOM v7 |
| **Animations** | Framer Motion v12 |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **PDF Generation** | pdf-lib |
| **State** | LocalStorage via `StorageService` |
| **Forms** | React Hook Form + Zod |
| **UI Primitives** | Radix UI |

---

## Project Structure

```
lms_frontend-main/
├── public/
├── src/
│   ├── App.jsx                   # Root Router + Layout
│   ├── index.css                 # Global CSS Variables & Tailwind Theme
│   ├── main.jsx                  # React entry point
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.jsx          # Marketing Landing Page (/)
│   │   │   ├── Catalog.jsx       # Course Catalog with filters (/catalog)
│   │   │   └── CourseDetail.jsx  # Course Details page (/course/:id)
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.jsx         # Login Portal (/auth)
│   │   │   └── Register.jsx      # Registration Page (/auth/register)
│   │   │
│   │   ├── student/
│   │   │   ├── Dashboard.jsx     # Enrolled Courses Dashboard (/dashboard)
│   │   │   ├── CoursePlayer.jsx  # Lesson Player (/student/course/:id)
│   │   │   └── Profile.jsx       # Account Settings (/profile)
│   │   │
│   │   └── admin/
│   │       └── AdminDashboard.jsx # Admin Proctor Console (/admin)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.jsx        # Global Nav Bar (theme + auth aware)
│   │   ├── course/
│   │   │   ├── CourseCard.jsx    # Course listing card
│   │   │   └── SortControls.jsx  # Catalog filter & sort dropdowns
│   │   ├── common/               # Shared utility components
│   │   ├── quiz/                 # Quiz-related components
│   │   └── doubt/                # Doubt/Q&A components
│   │
│   ├── context/
│   │   └── ProtectedRoute.jsx    # Auth guard wrapper
│   │
│   ├── services/
│   │   ├── storage.js            # LocalStorage service (auth, courses, progress)
│   │   └── initialData.js        # Seed data for courses
│   │
│   └── utils/
│       └── storage.js            # Low-level localStorage get/set/remove helpers
│
├── index.html
├── package.json
└── vite.config.js
```

---

## Pages & Routes

| Route | Component | Access |
|---|---|---|
| `/` | `Home.jsx` | Public |
| `/catalog` | `Catalog.jsx` | Public |
| `/course/:id` | `CourseDetail.jsx` | Public |
| `/auth` | `Login.jsx` | Public |
| `/auth/register` | `Register.jsx` | Public |
| `/dashboard` | `Dashboard.jsx` | Protected (Student) |
| `/student/course/:id` | `CoursePlayer.jsx` | Protected (Student) |
| `/profile` | `Profile.jsx` | Protected (Student) |
| `/admin` | `AdminDashboard.jsx` | Protected (Admin) |
| `*` | Redirect → `/` | — |

---

## Features Implemented

### 🏠 Home (Landing Page)
- Hero section with dynamic learner avatars and a live success rate metric card
- Philosophy section with dual-column image layout
- Bento grid feature showcase (Accreditation, Expert Focus, Lifetime Access, Global Network)

### 📚 Course Catalog
- Full-text search across course titles and descriptions
- Category filter pills (All, Cybersecurity, Cloud Infra, AI Matrix, DevOps Ops)
- Sort controls (Most Popular, Newest, etc.) and Level filters
- Responsive course card grid with ratings and instructor info

### 📄 Course Detail
- Cinematic hero with course title, category, and instructor
- Metrics bar (Duration, Level, Certification, ROI)
- Curriculum intent / learning outcomes section
- Enroll button wired to `StorageService.enroll()`

### 🎓 Student Dashboard
- Lists all enrolled courses fetched from LocalStorage
- Empty state with CTA to the Catalog
- Card layout with course image, progress indicator, and resume button

### 🎬 Course Player
- Sidebar curriculum navigator (Module > Lessons tree)
- Active lesson highlighting and completion checkmarks
- Main content area with lesson title and description

### 👤 Profile & Settings
- Account avatar with initials, enrollment count, and role badge
- Security Settings (password update — simulated)
- Platform Preferences (Light/Dark theme toggle, synced across Header and Profile)
- Danger Zone (Delete Identity simulation)

### 🔐 Authentication
- **Login**: Email + Password validation, simulated JWT token in LocalStorage
- **Register**: Full name, email, dual-password validation
- Role detection: if email contains `admin`, role is set to `admin`

### 🛡️ Admin Proctor Console
- Aggregated metrics: Active Learners, Revenue, Curriculum Assets, Security Nodes
- Enrollment Velocity chart panel (placeholder, ready for Recharts integration)
- Operational Nodes table with protocol entries
- Tactical Status card (99.8% health index)

### 🌙 Light / Dark Theme
- Global toggle via Moon/Sun button in Header and Profile page
- Fully synced across components via custom `themeSync` window event
- Persisted to `localStorage`
- All surfaces use CSS custom property variables — zero hardcoded colors

---

## Design System

All design tokens are declared in `src/index.css` and consumed via Tailwind v4 `@theme`.

### Typography
| Role | Font | Weight |
|---|---|---|
| Headlines & Display | Manrope | 600 / 700 / 800 |
| Body & UI | Inter | 400 / 500 / 600 / 700 |

### Color Tokens (Light Mode)
| Token | Value | Usage |
|---|---|---|
| `--primary` | `#00020e` | Main text, CTAs (light mode) |
| `--primary-container` | `#0d1b3e` | Accent panels, active states |
| `--surface` | `#f7f9fc` | Page background |
| `--surface-container-lowest` | `#ffffff` | Card surfaces |
| `--surface-container-low` | `#f2f4f7` | Input backgrounds |
| `--secondary` | `#5e5e5f` | Muted labels |

### Utility Classes
| Class | Effect |
|---|---|
| `.signature-gradient` | Linear gradient `#001529 → #00020e` (135°) |
| `.ambient-shadow` | `0 4px 12px rgba(0,0,0,0.08)` |
| `.no-scrollbar` | Hides scrollbar cross-browser |

---

## Getting Started

### Prerequisites
- Node.js `≥ 18`
- npm `≥ 9`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/lms_frontend-main.git
cd lms_frontend-main

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173/** (or the next available port).

---

## Access Credentials

> ⚠️ This is a **frontend-only prototype**. Authentication is fully simulated using `localStorage`. No backend or database is required.

### Student Account
Any valid email + password combination works:

| Field | Value |
|---|---|
| **Email** | `student@example.com` *(or any valid email)* |
| **Password** | `password123` *(or any 8+ character string)* |

### Admin Account
To unlock the **Proctor Console** (`/admin`) and the admin navigation button, include `admin` anywhere in the email address:

| Field | Value |
|---|---|
| **Email** | `admin@adhoclms.com` |
| **Password** | `password123` |

> **Role Detection Logic**: The system checks if the email string contains `"admin"`. If true, the user is granted the `admin` role automatically on login.

---

## Build & Deployment

### Production Build
```bash
npm run build
```

Output is generated in the `dist/` directory. The build is fully static and can be deployed to any CDN or static hosting provider.

### Deploy to Vercel
```bash
vercel deploy --prod
```

Or simply connect the GitHub repository to a Vercel project. The build command is `npm run build` and the output directory is `dist`.

### Build Output (Reference)
```
dist/index.html                   1.27 kB │ gzip:   0.62 kB
dist/assets/index.css            66.69 kB │ gzip:  10.56 kB
dist/assets/index.js            496.43 kB │ gzip: 148.55 kB
✓ built in ~2.5s
```

---

## Known Limitations

- **No real backend**: All data (auth, enrollments, progress) lives in `localStorage`. Refreshing or clearing browser storage resets state.
- **Course Player**: Video player is a placeholder UI. Actual video streaming requires backend media hosting.
- **Admin Charts**: The "Enrollment Velocity" chart is a placeholder pending Recharts data integration.
- **Certificates**: PDF certificate generation via `pdf-lib` is scaffolded but not fully wired in this version.

---

*Built with precision and speed. Designed around the "Digital Curator" philosophy — authority through whitespace, depth through tonal layering.*
