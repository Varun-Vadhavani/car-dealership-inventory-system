# Car Dealership Inventory System

A full-stack inventory management system for a car dealership, built as a
Test-Driven Development (TDD) technical assessment. It provides secure,
role-based access for browsing and purchasing vehicles as a regular user, and
full inventory management (add, update, delete, restock) as an admin.

---

## Table of Contents

* [Features](#features)
* [API Endpoints](#api-endpoints)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
  * [Backend Setup](#backend-setup)
  * [Frontend Setup](#frontend-setup)
* [Testing & Test Coverage](#testing--test-coverage)
* [My AI Usage](#my-ai-usage)
* [License](#license)

---

## Features

* **Role-Based Authentication**
  * Registration and login with JWT-based session management
  * Passwords hashed with bcrypt, never stored or returned in plaintext
  * Two roles — `USER` and `ADMIN` — enforced server-side via middleware

* **Vehicle Inventory Management**
  * Admins can add, update, and delete vehicle listings
  * Duplicate vehicle configurations (same make/model/year/category) are
    rejected rather than silently merged

* **Purchasing & Restocking**
  * Any authenticated user can purchase a vehicle, decreasing its quantity
  * Purchases are handled with an atomic database update to prevent race
    conditions when multiple users purchase the last unit simultaneously
  * Admins can restock vehicles, increasing quantity

* **Search & Filtering**
  * Filter the vehicle list by make and by price range
  * Case-insensitive matching

* **Frontend**
  * Protected routes — unauthenticated users are redirected to login
  * Role-aware UI — the "Add Vehicle" form only renders for admins
    (a UX convenience; the real enforcement is the backend's admin middleware)

---

## API Endpoints

### Authentication
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### Vehicles
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/vehicles` | Authenticated |
| GET | `/api/vehicles` | Authenticated |
| GET | `/api/vehicles/search` | Authenticated |
| PUT | `/api/vehicles/:id` | Authenticated |
| DELETE | `/api/vehicles/:id` | Admin only |

### Inventory
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/vehicles/:id/purchase` | Authenticated |
| POST | `/api/vehicles/:id/restock` | Admin only |

### Data Model

**Vehicle**: `id`, `make`, `model`, `year`, `category`, `price`, `quantity`,
`createdAt`, `updatedAt` — with a composite unique constraint on
`(make, model, year, category)`.

**User**: `id`, `email`, `password` (bcrypt hash), `role` (`USER` | `ADMIN`),
`createdAt`, `updatedAt`.

---

## Tech Stack

### Backend
* Node.js + TypeScript
* Express.js
* PostgreSQL
* Prisma ORM
* JWT (`jsonwebtoken`) for authentication, `bcrypt` for password hashing
* Jest + Supertest for testing

### Frontend
* React + TypeScript
* Vite
* Tailwind CSS
* TanStack React Query for server state, caching, and mutations
* React Router
* Vitest + React Testing Library for testing

---

## Project Structure

```bash
car-dealership-inventory-system/
│
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request/response handling
│   │   ├── services/          # Business logic
│   │   ├── routes/            # Route definitions
│   │   ├── middleware/        # authenticate, requireAdmin, error handling
│   │   ├── lib/                # Shared Prisma client singleton
│   │   └── index.ts           # App entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts            # Sample data for local development
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/                # API client functions
│   │   ├── components/         # ProtectedRoute, etc.
│   │   ├── pages/              # Login, Register, Dashboard
│   │   ├── utils/              # JWT decoding helper
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/
│   ├── package.json
│   └── .env.example
│
├── docs/
│   └── screenshots/
├── .gitignore
├── LICENSE
├── PROMPTS.md
└── README.md
```

---

## Getting Started

### Clone the Repository

```bash
git clone <your-repo-url>
cd car-dealership-inventory-system
```

### Backend Setup

**Prerequisites:** Node.js, and a running local PostgreSQL instance.

```bash
cd backend
npm install
```

Create a database, then copy the example environment file and fill in your
own values:

```bash
cp .env.example .env
```

`.env` needs:
```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/dealership_db?schema=public"
JWT_SECRET="a long random string"
```

Run migrations and (optionally) seed sample vehicle data:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the backend:

```bash
npm run dev              # runs at http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` needs:
```
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev               # runs at http://localhost:5173
```

---

## Testing & Test Coverage

### Backend Tests

Written with Jest and Supertest, split into unit tests (no database) and
integration tests (against a real PostgreSQL database), covering:

* Auth: registration, login, credential validation
* Middleware: token verification, admin-role gating
* Vehicle CRUD: create, list, search/filter, update, delete
* Inventory: purchase (including out-of-stock rejection), restock

```bash
cd backend
npx jest                  # run the full suite
npx jest --coverage       # run with a coverage report
```

### Frontend Tests

Written with Vitest and React Testing Library, covering:

* Login and Register forms (rendering, validation, API integration)
* `ProtectedRoute` redirect behavior
* Dashboard: vehicle list rendering, purchase flow, search/filter,
  admin-only form visibility

```bash
cd frontend
npm test                  # run the full suite
npx vitest run --coverage # run with a coverage report
```

> **Note:** run the `--coverage` commands above and paste the actual output
> here before submitting — real numbers, not estimates.

## My AI Usage

### Tools Utilized

* **ChatGPT (OpenAI)**
* **Antigravity (Google)**
* **Claude (Anthropic)**

### How These Tools Were Integrated Into My Workflow

#### **ChatGPT (OpenAI)**

Used early, before writing any code, for planning and architecture
discussion:

* Talked through tech stack options and tradeoffs for the backend and
  frontend before committing to Node/Express/PostgreSQL/Prisma and
  React/Vite.
* Used as a sounding board for high-level project structure and sequencing
  (what to build first, how auth/CRUD/inventory phases should depend on
  each other) before the detailed, test-by-test implementation work began.

#### **Antigravity (Google)**

Used for scaffolding boilerplate and UI:

* Generated initial boilerplate and scaffolding for frontend
  components/layout, reducing repetitive setup work.
* Output was reviewed and adapted to match the project's actual component
  structure and Tailwind conventions rather than used as-is.

#### **Claude (Anthropic)**

Used throughout the entire implementation as a mentor and pair programmer,
not a code-generation shortcut. The working method for every backend and
frontend feature was:

1. Discuss the requirement and design decisions before writing any code
   (e.g., what fields `Vehicle` actually needed beyond the spec's explicit
   list; where the JWT should live on the client; whether a duplicate
   vehicle configuration should be rejected or auto-merged).
2. Write a failing test first and confirm it actually failed for the right
   reason (Red).
3. Write the minimum implementation to pass (Green).
4. Refactor where real duplication or improvement opportunities existed —
   and explicitly *not* refactor when none did, rather than manufacturing
   busywork.
5. Commit Red and Green as separate, clearly-messaged commits, with
   `Co-authored-by: Claude` on commits where AI assistance was used for
   implementation.

Specific ways Claude contributed:

* **Architecture guidance** — the layered route → controller → service →
  Prisma structure, and the reasoning for keeping business logic out of
  controllers.
* **Security-relevant decisions** — bcrypt salt rounds, returning a generic
  401 for both "wrong password" and "unknown email" to avoid user
  enumeration, and using an atomic database update (rather than a
  read-then-write) to prevent a race condition when purchasing the last unit
  of a vehicle in stock.
* **Debugging** — diagnosed a `PrismaClientInitializationError` caused by
  Jest not auto-loading `.env` (only the Prisma CLI does this by default),
  and a `localStorage` failure in the frontend test environment caused by a
  Node experimental flag shadowing jsdom's implementation.
* **Catching a real bug** — a route-by-route access-control audit (prompted
  after a test caught the `restock` endpoint returning `200` instead of
  `403` for a non-admin user) confirmed the fix and verified no other route
  had the same gap.
* **Documentation** — this README and `PROMPTS.md` were drafted with
  Claude's help, then reviewed and adjusted for accuracy against what was
  actually built.

### Reflection

Each tool played a distinct, non-overlapping role: ChatGPT helped shape the
plan before any code existed, Antigravity accelerated repetitive frontend
scaffolding, and Claude was the constant throughout actual implementation —
used as a Socratic pair programmer asked to explain the "why" behind each
decision rather than just produce working code. That meant every endpoint,
schema choice, and architectural pattern in this project is one I can
actually defend and explain, which was the explicit point of the exercise
given the interview will probe this kind of reasoning directly. It was
slower per-feature than asking for a finished project outright, but the
tradeoff was intentional: the goal was to learn and be able to rebuild this
without AI, not just to submit working code.

---

## License

This project is licensed under the **MIT License**. See `LICENSE` for more
details.