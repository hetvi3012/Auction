# FairPlay Ticket Auction Platform - Comprehensive Guide

## 1. Project Overview
FairPlay is a real-time ticketing auction platform designed to combat ticket scalping by enforcing strict market-value discovery. It enables verified users to list event tickets in competitive auctions (both English ascending and Vickrey sealed-bid) and allows buyers to bid securely via an internal wallet escrow system. 

The application utilizes a monorepo structure consisting of a Node.js/Express backend API and a React.js (Vite) frontend SPA.

---

## 2. Core Methodologies & Design Patterns

The backend heavily implements Gang of Four (GoF) design patterns to manage complexity and support future enhancements:
*   **Strategy Pattern:** Bidding logic is completely decoupled from the endpoint router. The `AuctionContext` dynamically loads either the `EnglishAuctionStrategy` or `VickreyAuctionStrategy` depending on the auction's configuration, allowing easy addition of new auction types (e.g., Dutch auctions) later.
*   **Observer Pattern:** The WebSocket functionality (`Socket.io`) is isolated from the REST controllers. The `AuctionSubject` registry listens for bid creation events during the REST POST flow and independently broadcasts `new_bid` events to connected frontend clients, ensuring real-time synchronized UI updates.
*   **Mediator Pattern:** The `AuctionSettlementService` acts as a mediator when an auction concludes. It coordinates the complex transactional handover between the [User](file:///d:/6th%20sem/Software/Project/frontend/src/services/api.js#42-45) wallets (exchanging funds) and the [Ticket](file:///d:/6th%20sem/Software/Project/frontend/src/services/api.js#48-52) ownership without the individual models needing direct dependencies on one another.

---

## 3. Technology Stack

### Backend
*   **Runtime/Framework:** Node.js with Express.js
*   **Database:** PostgreSQL (chosen for rigid schema requirements and strict ACID compliance using row-level locking via `transaction.LOCK.UPDATE` during bid placements to stop race conditions).
*   **ORM:** Sequelize
*   **Real-time engine:** Socket.io
*   **Authentication:** JSON Web Tokens (JWT)
*   **Task Queues:** Redis with BullMQ (used for delayed background jobs like post-auction receipt generation).

### Frontend
*   **Framework:** React 18, bootstrapped with Vite for instant server start and HMR.
*   **Routing:** React Router v6.
*   **Styling:** Tailwind CSS (configured dynamically via [index.css](file:///d:/6th%20sem/Software/Project/frontend/src/index.css) and [App.css](file:///d:/6th%20sem/Software/Project/frontend/src/App.css), with full dark mode support).
*   **Icons:** Lucide React.
*   **State Management/API Calls:** Axios interceptors reading from Local Storage tokens. Real-time updates handled directly via socket listeners within components.

---

## 4. Key Functional Features

### 4.1 Authentication & Wallets
*   **Registration & Login:** Users register and receive a JWT. The auth payload is stored in `localStorage` by the [api.js](file:///d:/6th%20sem/Software/Project/frontend/src/services/api.js) frontend service.
*   **Virtual Wallet:** Every registered account is issued a virtual wallet (seeded with initial test funds). This balance is strictly checked before any bid is permitted. If the user doesn't have sufficient funds for their `maxWillingToPay` proxy limit or direct bid, it is rejected.

### 4.2 Ticket Listing
*   Users can list physical or digital tickets for upcoming events.
*   Sellers define the starting price, auction duration (start/end times), and the required auction strategy (`English` or `Vickrey`).

### 4.3 Real-Time English Auctions & Proxy Bidding
*   **Manual Bidding:** Users connect via WebSocket rooms specific to the `auctionId`. When a manual bid is placed via the REST API, the DB enforces pessimistic locking, ensuring no two people can claim a bid at the exact same millisecond.
*   **Enterprise Extensions (Proxy Bidding):** The backend features a [ProxyBiddingEngine](file:///d:/6th%20sem/Software/Project/backend/services/ProxyBiddingEngine.js#5-90). Users can declare a `maxWillingToPay` hidden limit. When another user places a manual bid, this engine fires synchronously within the same database transaction. It evaluates the challenger's manual bid against all existing proxy limits, and auto-bids in standard increments ($1) on behalf of the proxy user until their limit is exhausted.

### 4.4 Vickrey Auctions (Sealed-Bid)
*   Users submit hidden bids.
*   The system verifies the bidder has the wallet balance but does not publicly announce the leading amount until the auction closes.
*   At the end of the auction, the *highest* bidder wins, but they only pay the price submitted by the *second-highest* bidder (plus a small increment).

### 4.5 Automated Settlement & Escrow
*   When the auction `endTime` is reached, the mediator locks both the buyer's and seller's wallet rows.
*   The final amount is deducted from the winner and credited to the seller in an all-or-nothing database transaction.
*   The ticket ownership `userId` is updated to the winner.

### 4.6 Role-Based Access Control (RBAC) & Analytics 
*   **Admin Dashboard:** Users designated with the `ADMIN` role can access a specialized frontend route (`/admin`) and backend data aggregations.
*   The admin panel provides top-level metrics like Total Volume, Active Tickets, Platform Revenue, and historical graphs mapping auction activity over time.
