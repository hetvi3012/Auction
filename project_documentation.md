# FairPlay Ticket Auction Platform — Comprehensive Project Documentation

**Last Updated:** 20 April 2026

---

## 1. Project Overview

FairPlay is a **real-time ticketing auction platform** designed to combat ticket scalping by enforcing strict market-value discovery. It enables verified users to list event tickets in competitive auctions (both English ascending and Vickrey sealed-bid) and allows buyers to bid securely via an internal wallet escrow system.

The platform implements **10 Gang of Four (GoF) design patterns**, follows a **Layered (N-Tier) Monolithic Architecture**, and is fully containerized with Docker. All components have exhaustive unit test coverage (36 suites, 257+ tests, 100% pass rate).

The application utilizes a monorepo structure consisting of a **Node.js/Express backend API** and a **React.js (Vite) frontend SPA**.

---

## 2. Architecture Style

**Style:** Layered (N-Tier) Monolithic Architecture

The backend is organized into 5 horizontal layers with strict downward-only dependencies:

| Layer | Technology | Components |
|-------|-----------|------------|
| **Presentation** | React 19, Vite 8, Tailwind CSS 4 | 7 pages, 1 component, 1 service module, 1 custom hook |
| **Controller** | Express.js | 5 controllers, auth/RBAC middleware |
| **Business Logic** | Pure JavaScript (GoF patterns) | Facade, Commands, Strategies, Observers, Builders, Factories, Decorators, Validation Chain |
| **Data Access** | Sequelize ORM + Repository Pattern | 1 base + 4 domain repositories |
| **Infrastructure** | PostgreSQL, Redis, Socket.io, JWT | RDBMS, job queues, real-time engine, auth |

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full architectural breakdown with diagrams.

---

## 3. Core Methodologies & Design Patterns

The backend implements the following GoF patterns:

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **Strategy** | `EnglishAuctionStrategy`, `VickreyAuctionStrategy`, `AuctionContext` | Interchangeable bidding rules per auction type |
| **Observer** | `AuctionSubject`, `NotificationService`, `WebSocketBroadcaster` | Decoupled real-time event broadcasting |
| **Command** | `CommandInvoker`, `CreateAuctionCommand`, `PlaceBidCommand`, `SettleAuctionCommand` | Encapsulated operations with history tracking |
| **Factory** | `StrategyFactory`, `AuctionFactory` | Centralized object creation with validation |
| **Builder** | `AuctionBuilder` | Step-by-step config construction with immutable output |
| **Decorator** | `LoggingDecorator`, `ValidationDecorator` | Transparent cross-cutting concerns |
| **Facade** | `AuctionFacade` | Single entry point for all controller operations |
| **Chain of Responsibility** | `BidValidationChain` (5 handlers) | Sequential bid validation pipeline |
| **Mediator** | `AuctionSettlementService` | Multi-entity transactional settlement |
| **Repository** | `BaseRepository` + domain repos | Database-agnostic data access |

---

## 4. Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x | Runtime |
| Express.js | 4.x | HTTP framework |
| PostgreSQL | 16 | RDBMS (ACID transactions, row-level locking) |
| Sequelize | 6.x | ORM |
| Socket.io | 4.x | Real-time WebSocket engine |
| JWT | — | Stateless authentication |
| Redis | 7 | Background job queues |
| BullMQ | latest | Job queue framework |
| Jest | 30.3.0 | Testing framework (27 suites, 190 tests) |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.4 | UI framework |
| Vite | 8.0.0 | Build tool + dev server |
| Tailwind CSS | 4.2.1 | Utility-first CSS |
| React Router | 7.13.1 | Client-side routing |
| Socket.io Client | 4.8.3 | WebSocket client |
| Axios | 1.13.6 | HTTP client |
| Lucide React | latest | Icons |
| Vitest | 4.1.4 | Testing framework (9 suites, 67+ tests) |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Docker | Container runtime |
| Docker Compose | Multi-container orchestration |
| Nginx | Frontend static file serving + reverse proxy |
| Git | Version control |

---

## 5. Key Functional Features

### 5.1 Authentication & Wallets
*   **Registration & Login:** Users register with name/email/password and receive a JWT. Auth payload stored in `localStorage` via the frontend `api.js` service module.
*   **Virtual Wallet:** Every account is issued a virtual wallet (seeded with initial funds). Balance is strictly checked before any bid is permitted.
*   **Wallet Top-Up:** Users can add funds via the Profile page with predefined quick amounts ($100, $500, $1000).

### 5.2 Ticket Listing
*   Users can list event tickets with event name, section/row/seat details.
*   Sellers choose the auction format (English or Vickrey), starting price, and duration.
*   Ticket status transitions: `Available` → `In_Auction` → `Sold`

### 5.3 Real-Time English Auctions & Proxy Bidding
*   **Manual Bidding:** Users see live bid updates via WebSocket rooms. The database enforces pessimistic locking during bid placement, preventing race conditions.
*   **Proxy Bidding Engine:** Users can set a hidden `maxWillingToPay` limit. When a competing manual bid arrives, the engine auto-bids in $1 increments within the same transaction until the limit is exhausted.

### 5.4 Vickrey Auctions (Sealed-Bid)
*   Users submit hidden bids (bid amounts are not revealed to other bidders).
*   The system verifies wallet balance but does not announce the leading amount.
*   The **highest bidder wins** but pays the **second-highest bid** price (plus a small increment). This incentivizes truthful bidding.

### 5.5 Automated Settlement & Escrow
*   When auction `endTime` is reached (via `AuctionScheduler` cron), the `AuctionSettlementService` (Mediator) locks both wallets.
*   The final amount is atomically deducted from the winner and credited to the seller.
*   Ticket ownership transfers to the winner. All within a single database transaction (all-or-nothing).
*   Background jobs dispatched via Redis/BullMQ: winner email notification + receipt PDF generation.

### 5.6 Role-Based Access Control (RBAC) & Admin Analytics
*   **Admin Dashboard:** Users with `ADMIN` role access `/admin` with specialized analytics.
*   Metrics include: Total Volume, Active Auctions, Closed Auctions, Total Users, Platform Revenue.
*   Admins can manually close/settle auctions from the dashboard.

### 5.7 Real-Time WebSocket Events
*   `new_bid` — broadcasted when any user places a bid (all viewers see the update instantly)
*   `auction_closed` — broadcasted when an auction is settled (all viewers see the result)

---

## 6. Containerization & Deployment

### 6.1 Docker Setup

The project is fully containerized with 4 services:

| Container | Image | Port | Health Check |
|-----------|-------|------|-------------|
| `fairplay-frontend` | `nginx:alpine` | 80 | HTTP check on `/` |
| `fairplay-backend` | `node:20-alpine` | 5000 | HTTP check on `/api/health` |
| `fairplay-db` | `postgres:16-alpine` | 5432 | `pg_isready` |
| `fairplay-redis` | `redis:7-alpine` | 6379 | `redis-cli ping` |

### 6.2 Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop all
docker-compose down
```

### 6.3 Running Locally (without Docker)

```bash
# Terminal 1: Backend
cd backend
npm install
npm start          # Starts Express on port 5000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev        # Starts Vite dev server on port 5173
```

**Prerequisites:** PostgreSQL running locally, Redis running locally (optional for job queues).

### 6.4 Free Cloud Deployment

| Service | Platform | Plan |
|---------|----------|------|
| Backend API | Render.com Web Service | Free |
| Frontend | Render.com Static Site | Free |
| PostgreSQL | Render.com PostgreSQL | Free (90 days) |
| Redis | Upstash | Free tier |

---

## 7. Testing Overview

| Metric | Backend | Frontend | Total |
|--------|---------|----------|-------|
| **Framework** | Jest 30.3 | Vitest 4.1 | — |
| **Test Suites** | 27 | 9 | **36** |
| **Individual Tests** | 190 | 67+ | **257+** |
| **Pass Rate** | 100% | 100% | **100%** |
| **Execution Time** | ~2s | ~7s | **~9s** |

### Running Tests

```bash
# Backend tests (27 suites, 190 tests)
cd backend && npm test

# Frontend tests (9 suites)
cd frontend && npm test
```

See [TEST_DOCUMENTATION.md](TEST_DOCUMENTATION.md) for the complete exhaustive test report covering every test case.

---

## 8. File Structure

```
FairPlay Auctions/
├── docker-compose.yml              # Multi-container orchestration
├── ARCHITECTURE.md                 # Layered architecture documentation
├── TEST_DOCUMENTATION.md           # Exhaustive test report
├── system_design_document.md       # System design + UML diagrams
├── project_documentation.md        # This file
├── .gitignore                      # Git exclusions
│
├── backend/                        # Backend monolith (Node.js)
│   ├── Dockerfile                  # Multi-stage Docker build
│   ├── .dockerignore
│   ├── server.js                   # HTTP + WebSocket bootstrap
│   ├── app.js                      # Express app + route binding
│   ├── config/db.js                # Sequelize connection
│   ├── models/                     # Sequelize models (User, Auction, Ticket, Bid, ProxyBidLimit)
│   ├── repositories/               # Repository Pattern (Base + 4 domain)
│   ├── services/                   # Business logic (Strategies, Observers, Settlement, Proxy)
│   ├── commands/                   # Command Pattern (Invoker + 3 commands)
│   ├── facades/                    # Facade Pattern
│   ├── factories/                  # Factory Pattern
│   ├── builders/                   # Builder Pattern
│   ├── decorators/                 # Decorator Pattern (Logging, Validation)
│   ├── middleware/                  # Chain of Responsibility (BidValidationChain)
│   ├── controllers/                # Express controllers (5)
│   ├── routes/                     # Express route definitions (5)
│   └── utils/                      # Auth + RBAC middleware
│
└── frontend/                       # Frontend SPA (React)
    ├── Dockerfile                  # Multi-stage Docker build (Vite → Nginx)
    ├── .dockerignore
    ├── nginx.conf                  # SPA routing + API/WS proxy
    ├── vite.config.js
    └── src/
        ├── pages/                  # 7 page components
        ├── components/             # Navbar
        ├── services/api.js         # Axios service layer
        └── utils/useSocket.js      # WebSocket hook
```
