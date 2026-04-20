# 🧪 Test Documentation — FairPlay Auctions Platform

> **Living Document** — Updated every time new tests are added.  
> **Last Updated:** 13 April 2026

---

## Table of Contents

1. [Test Infrastructure](#1-test-infrastructure)
2. [How to Run Tests (Demo Commands)](#2-how-to-run-tests-demo-commands)
3. [Backend Unit Tests](#3-backend-unit-tests)
4. [Frontend Unit Tests](#4-frontend-unit-tests)
5. [Test Summary Matrix](#5-test-summary-matrix)
6. [Design Patterns Verified](#6-design-patterns-verified)
7. [Mocking Strategy](#7-mocking-strategy)
8. [Changelog](#8-changelog)

---

## 1. Test Infrastructure

### Backend

| Item | Detail |
|------|--------|
| **Framework** | [Jest](https://jestjs.io/) |
| **Config** | Default (auto-detected from `package.json`) |
| **Test Pattern** | `*.test.js` co-located with source files |
| **Mocking** | `jest.mock()` for module-level mocking |

### Frontend

| Item | Detail |
|------|--------|
| **Framework** | [Vitest](https://vitest.dev/) (Vite-native test runner) |
| **DOM Environment** | `jsdom` |
| **Component Testing** | `@testing-library/react` + `@testing-library/user-event` |
| **Assertions** | `@testing-library/jest-dom` (extended matchers like `toBeInTheDocument`) |
| **Config** | `vite.config.js` → `test` block |
| **Setup File** | `src/setupTests.js` (imports jest-dom matchers) |
| **Test Pattern** | `*.test.jsx` co-located with source files |

---

## 2. How to Run Tests (Demo Commands)

### 🔧 Prerequisites

Make sure dependencies are installed:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### ▶️ Running Backend Tests

```bash
cd backend

# Run all tests with detailed output (recommended for demo)
npm test

# Alternatively, run directly with npx
npx jest --verbose

# Run a specific test file
npx jest --verbose commands/SettleAuctionCommand.test.js
npx jest --verbose repositories/AuctionRepository.test.js

# Run tests matching a pattern
npx jest --verbose -t "execute"

# Run with coverage report
npx jest --verbose --coverage
```

**Expected Output (demo):**

```
 PASS  commands/SettleAuctionCommand.test.js
  SettleAuctionCommand
    constructor
      ✓ should store the auctionId
      ✓ should initialise result to null
    execute()
      ✓ should call AuctionSettlementService.settleAuction with the correct auctionId
      ✓ should store the settlement result in this.result
      ✓ should propagate errors from the settlement service
    undo()
      ✓ should log a message and not throw

 PASS  repositories/AuctionRepository.test.js
  AuctionRepository
    findActiveAuctions()
      ✓ should query for Active auctions and include Ticket
    findWithTicket()
      ✓ should find by PK with Ticket include and no extra options
      ✓ should spread additional options into the query
    findByIdForUpdate()
      ✓ should find by PK with a row-level lock
    countActive()
      ✓ should count auctions with Active status
    countClosed()
      ✓ should count auctions with Closed status
    getTotalVolume()
      ✓ should return the sum of currentHighestBid for closed auctions
      ✓ should return 0 when there is no volume (null)

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
```

### ▶️ Running Frontend Tests

```bash
cd frontend

# Run all tests (recommended for demo)
npm test

# Alternatively, run directly with npx
npx vitest run

# Run with verbose/detailed output
npx vitest run --reporter=verbose

# Run a specific test file
npx vitest run src/components/Navbar.test.jsx
npx vitest run src/pages/AdminDashboard.test.jsx
npx vitest run src/pages/Auctions.test.jsx

# Run tests matching a name pattern
npx vitest run -t "loading"

# Run in watch mode (re-runs on file changes — great for development)
npx vitest

# Run with coverage
npx vitest run --coverage
```

**Expected Output (demo):**

```
 ✓ src/components/Navbar.test.jsx (6 tests)
 ✓ src/pages/AdminDashboard.test.jsx (5 tests)
 ✓ src/pages/Auctions.test.jsx (7 tests)

 Test Files  3 passed (3)
      Tests  18 passed (18)
   Duration  ~3s
```

### 🎬 Demo Walkthrough (Step-by-Step)

For a live demo, run these commands in order:

```bash
# Step 1: Show backend tests
cd "d:\6th sem\Software\Project\backend"
npx jest --verbose

# Step 2: Show frontend tests
cd "d:\6th sem\Software\Project\frontend"
npx vitest run --reporter=verbose

# Step 3 (Optional): Show coverage
cd "d:\6th sem\Software\Project\backend"
npx jest --coverage

cd "d:\6th sem\Software\Project\frontend"
npx vitest run --coverage
```

---

## 3. Backend Unit Tests

### 3.1 `SettleAuctionCommand.test.js`

**Source:** `backend/commands/SettleAuctionCommand.js`  
**Pattern Tested:** Command Pattern  
**Tests:** 5

| # | Test Name | What It Verifies |
|---|-----------|-----------------|
| 1 | should store the auctionId | Constructor sets `this.auctionId` correctly |
| 2 | should initialise result to null | Constructor sets `this.result` to `null` |
| 3 | should call settleAuction with correct auctionId | `execute()` delegates to `AuctionSettlementService.settleAuction` |
| 4 | should store the settlement result | `execute()` stores and returns the service result |
| 5 | should propagate errors from the service | `execute()` re-throws service errors |
| 6 | should log a message and not throw | `undo()` logs expected message without errors |

**Mocks:** `AuctionSettlementService` (entire module mocked via `jest.mock`)

---

### 3.2 `AuctionRepository.test.js`

**Source:** `backend/repositories/AuctionRepository.js`  
**Pattern Tested:** Repository Pattern (extends BaseRepository)  
**Tests:** 9

| # | Test Name | What It Verifies |
|---|-----------|-----------------|
| 1 | should query for Active auctions and include Ticket | `findActiveAuctions()` passes correct where + include |
| 2 | should find by PK with Ticket include (no extra options) | `findWithTicket()` basic call |
| 3 | should spread additional options into the query | `findWithTicket()` with extra options like `paranoid` |
| 4 | should find by PK with a row-level lock | `findByIdForUpdate()` passes transaction + LOCK.UPDATE |
| 5 | should count auctions with Active status | `countActive()` filters by `Active` |
| 6 | should count auctions with Closed status | `countClosed()` filters by `Closed` |
| 7 | should return the sum of currentHighestBid | `getTotalVolume()` returns correct SUM |
| 8 | should return 0 when there is no volume (null) | `getTotalVolume()` null-safety |

**Mocks:** `Auction` model, `Ticket` model, `sequelize` (all via `jest.mock('../models')`)  
**Also Mocked:** `BaseRepository` (to avoid requiring a real Sequelize connection)

---

## 4. Frontend Unit Tests

### 4.1 `AdminDashboard.test.jsx`

**Source:** `frontend/src/pages/AdminDashboard.jsx`  
**Tests:** 5

| # | Test Name | What It Verifies |
|---|-----------|-----------------|
| 1 | redirects to /login when no user is logged in | `useNavigate('/login')` called when `getCurrentUser()` returns null |
| 2 | renders loading spinner initially | Loading spinner visible while data loads |
| 3 | renders metrics and auctions on successful load | All 4 metric cards display correct values; auction rows appear |
| 4 | renders error banner when API fails | Error message and "Access Restricted" banner shown |
| 5 | close auction button calls adminService.closeAuction | Button click triggers `closeAuction()` with correct auction ID |

**Mocks:** `authService`, `adminService`, `useNavigate`, lucide-react icons

---

### 4.2 `Auctions.test.jsx`

**Source:** `frontend/src/pages/Auctions.jsx`  
**Tests:** 7

| # | Test Name | What It Verifies |
|---|-----------|-----------------|
| 1 | shows loading spinner while fetching | Spinner renders before data loads |
| 2 | shows empty state when no auctions exist | "No active auctions" message appears |
| 3 | renders auction cards with correct details | Event names, strategy badges rendered |
| 4 | shows error when user is not logged in and tries to bid | "Please log in" message appears |
| 5 | shows error for invalid bid amount | "Enter a valid bid amount" for empty input |
| 6 | shows error when bid is too low | "Bid must be higher than" validation |
| 7 | successful bid calls bidService and shows success | `placeBid()` called, "Bid placed successfully!" shown |

**Mocks:** `auctionService`, `authService`, `bidService`, `useSocket`

---

### 4.3 `Navbar.test.jsx`

**Source:** `frontend/src/components/Navbar.jsx`  
**Tests:** 6

| # | Test Name | What It Verifies |
|---|-----------|-----------------|
| 1 | renders brand name | "FairPlay Auctions" visible |
| 2 | shows Sign In and Get Started when user is logged out | Guest links present, profile links absent |
| 3 | shows profile, balance, and sign out for a logged-in user | "My Profile", formatted balance, "Sign Out" present |
| 4 | does NOT show Admin Panel for regular users | Admin link hidden for role=USER |
| 5 | shows Admin Panel link for ADMIN users | Admin link visible for role=ADMIN |
| 6 | renders navigation links | "Active Auctions" and "Sell Ticket" links present |

**Mocks:** `authService`, lucide-react icons  
**Note:** Component is wrapped in `<MemoryRouter>` for `react-router-dom` link support.

---

## 5. Test Summary Matrix

| Test File | Location | Framework | Tests | Status |
|-----------|----------|-----------|-------|--------|
| `SettleAuctionCommand.test.js` | `backend/commands/` | Jest | 5 | ✅ Pass |
| `AuctionRepository.test.js` | `backend/repositories/` | Jest | 9 | ✅ Pass |
| `AdminDashboard.test.jsx` | `frontend/src/pages/` | Vitest | 5 | ✅ Pass |
| `Auctions.test.jsx` | `frontend/src/pages/` | Vitest | 7 | ✅ Pass |
| `Navbar.test.jsx` | `frontend/src/components/` | Vitest | 6 | ✅ Pass |
| **Total** | | | **32** | ✅ **All Pass** |

---

## 6. Design Patterns Verified

| Pattern | File Under Test | Test Verifies |
|---------|----------------|---------------|
| **Command Pattern** | `SettleAuctionCommand.js` | Encapsulation of auction settlement as a dispatchable command with `execute()` and `undo()` |
| **Repository Pattern** | `AuctionRepository.js` | Domain-specific data access abstraction over Sequelize using `BaseRepository` inheritance |
| **Component-Based UI** | `AdminDashboard.jsx`, `Auctions.jsx`, `Navbar.jsx` | React component rendering, state management, and conditional UI based on auth/role |
| **Strategy Pattern** (indirect) | `Auctions.jsx` | UI correctly displays Vickrey vs English auction strategy labels |
| **Observer Pattern** (indirect) | `Auctions.jsx` | Real-time bid updates via `useSocket` hook integration |

---

## 7. Mocking Strategy

### Backend (Jest)

- **`jest.mock('module')`** — Module-level mocking; all exports replaced with jest functions.
- **`BaseRepository`** is mocked to avoid requiring a real database connection.
- All Sequelize model methods (`findAll`, `findByPk`, `count`) are replaced with `jest.fn()`.

### Frontend (Vitest)

- **`vi.mock('module')`** — Module-level mocking identical to Jest API.
- **API services** (`authService`, `adminService`, `bidService`, `auctionService`) are fully mocked.
- **`useSocket` hook** is mocked to return static values (no WebSocket connection needed).
- **`lucide-react` icons** are mocked as simple `<span>` elements (avoids SVG rendering issues in jsdom).
- **`react-router-dom`** — `useNavigate` is mocked as a spy; `MemoryRouter` wraps components that use `<Link>`.

---

## 8. Changelog

| Date | Change | Tests Added |
|------|--------|-------------|
| 13 Apr 2026 | Initial test suite created for 5 files | 32 tests (14 backend + 18 frontend) |

<!-- Add future entries here as you write more tests -->
