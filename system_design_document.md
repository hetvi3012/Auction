# FairPlay Auctions: Comprehensive System Design Document

## 1. Executive Summary & Purpose
This document provides a comprehensive architectural and design overview of the **FairPlay Ticket Auction Platform**. It outlines the technology choices, structural patterns, database design, and interaction flows necessary to fulfill the requirements of a high-concurrency, real-time ticket auction system.

---

## 2. Architecture Justification ("The Why")

### 2.1 Technology Stack
*   **React.js (Frontend UI):** Chosen for its component-based architecture enabling a highly responsive, single-page application (SPA). Vite is used over CRA for drastically improved build and HMR (Hot Module Replacement) speeds.
*   **Node.js & Express.js (Backend API):** Chosen for its non-blocking, event-driven I/O model, which is perfectly suited for managing high volumes of concurrent asynchronous requests—like those generated during the final seconds of a high-demand ticket auction.
*   **PostgreSQL (Database Layer):** Originally planned as MongoDB, migrated to **PostgreSQL**. Why? Ticket auctions and wallet settlements require strict, guaranteed **ACID properties** (Atomicity, Consistency, Isolation, Durability) at the database level. Relational databases with explicit row-locking prevent race conditions (e.g., two users bidding the exact same amount at the exact same millisecond).
*   **Socket.io (Real-Time Engine):** Long-polling fallbacks and WebSocket abstraction. Essential for broadcasting live price updates to all connected clients viewing an auction instantly, eliminating the need for inefficient HTTP polling.

### 2.2 Design Patterns (GoF)
We strictly adhered to Gang of Four (GoF) principles to keep the complex backend logic maintainable:
1.  **Strategy Pattern:** Used to isolate the logic between English (Ascending) and Vickrey (Sealed-bid) auctions. This allows the system to easily add a "Dutch Auction" or "Buy It Now" model later without altering core bid processing code.
2.  **Observer Pattern:** Used to decouple the REST API bid-processing logic from the WebSocket broadcasting logic. When a bid saves to DB, it emits an event. The WebSocket service "observes" this and pushes it to clients without the HTTP route needing to know about WebSockets.
3.  **Mediator Pattern:** Used in the [AuctionSettlementService](file:///d:/6th%20sem/Software/Project/backend/services/AuctionSettlementService.js#5-90). It encapsulates the complex interactions between Users (Wallets), Tickets (Ownership), and Auctions (Status) during the escrow checkout phase inside a single transactional boundary.

---

## 3. High-Level System Architecture Diagram

This diagram shows how the client interacts with our backend services.

```mermaid
graph TD
    Client[React Client SPA] <-->|HTTP REST| API[Express API Gateway]
    Client <-->|WebSockets| WSS[Socket.io Server]
    
    API --> Auth[Auth Service / JWT]
    API --> AuctionCtrl[Auction Controller]
    API --> BidCtrl[Bid Controller]
    
    BidCtrl --> Strategy{Auction Strategy Context}
    Strategy --> English[English Logic]
    Strategy --> Vickrey[Vickrey Logic]
    
    BidCtrl -.->|Notifies| Observer[Observer Registry]
    Observer -.->|Triggers| WSS
    
    API --> Med[Mediator: Settlement Service]
    Med <--> DB[(PostgreSQL Database)]
    AuctionCtrl <--> DB
    BidCtrl <--> DB
```

---

## 4. Database Entity Relationship Diagram (ERD)

The relational schema ensuring data integrity.

```mermaid
erDiagram
    USER ||--o{ TICKET : "sells"
    USER ||--o{ BID : "places"
    USER ||--o{ AUCTION : "wins"
    
    TICKET ||--o| AUCTION : "listed in"
    
    AUCTION ||--o{ BID : "receives"
    
    USER {
        uuid id PK
        string name
        string email UK
        string passwordHash
        float walletBalance
        boolean isVerified
    }
    
    TICKET {
        uuid id PK
        uuid sellerId FK
        string eventId
        jsonb seatInfo
        enum status "Available, In_Auction, Sold"
    }
    
    AUCTION {
        uuid id PK
        uuid ticketId FK
        uuid winningBidderId FK "nullable"
        enum strategyType "English, Vickrey"
        float startingPrice
        float currentHighestBid
        enum status "Active, Closed, Pending"
        datetime startTime
        datetime endTime
    }
    
    BID {
        uuid id PK
        uuid auctionId FK
        uuid bidderId FK
        float amount
        datetime timestamp
    }
```

---

## 5. Detailed UML & Interaction Sequences

### 5.1 Class Diagram (Strategy Pattern Implementation)
This displays how the system processes bids dynamically based on the auction type.

```mermaid
classDiagram
    class AuctionContext {
      -AuctionStrategy strategy
      +setStrategy(strategyType: String)
      +validateBid(currentHighest: Float, newBid: Float, walletBal: Float): Boolean
      +determineWinnerAndPrice(bids: Bid[]): SettlementDetails
    }
    
    class AuctionStrategy {
      <<interface>>
      +validateBid(currentHighest, newBid, walletBal)
      +determineWinnerAndPrice(bids)
    }
    
    class EnglishAuctionStrategy {
      +validateBid() // Ensures newBid > currentHighest
      +determineWinnerAndPrice() // Returns highest bid
    }
    
    class VickreyAuctionStrategy {
      +validateBid() // Ensures walletBal >= newBid, accepts hidden bids
      +determineWinnerAndPrice() // Returns highest bidder, second highest price
    }

    AuctionContext "1" *-- "1" AuctionStrategy : Uses
    AuctionStrategy <|.. EnglishAuctionStrategy : Implements
    AuctionStrategy <|.. VickreyAuctionStrategy : Implements
```

### 5.2 Sequence Diagram: Real-Time Bidding Flow
This sequence demonstrates the REST POST request coupled with the Observer pattern for WebSocket broadcasting.

```mermaid
sequenceDiagram
    participant UI as React Client
    participant API as Express Router
    participant Context as AuctionContext
    participant DB as PostgreSQL
    participant Observer as AuctionSubject
    participant WS as Socket.io Server
    participant Clients as Connected Peers

    UI->>API: POST /api/bids { auctionId, amount }
    activate API
    
    API->>DB: BEGIN TRANSACTION
    API->>DB: Fetch Auction (FOR UPDATE lock)
    API->>Context: setStrategy(auction.strategy)
    API->>Context: validateBid(amount)
    Context-->>API: Valid = true
    
    API->>DB: Update Auction (currentHighestBid)
    API->>DB: Insert new Bid
    API->>DB: COMMIT TRANSACTION
    
    API->>Observer: notifyNewBid({ amount, user })
    Observer->>WS: Broadcast to Room (auctionId)
    WS->>Clients: 'new_bid' event payload
    
    API-->>UI: 201 Created (Success)
    deactivate API
    
    Note over Clients,UI: UI instantly updates to show the new price
```

### 5.3 Sequence Diagram: Auction Settlement (Mediator)
This diagram maps out exactly what happens when time runs out on an auction, handled by the [AuctionSettlementService](file:///d:/6th%20sem/Software/Project/backend/services/AuctionSettlementService.js#5-90).

```mermaid
sequenceDiagram
    participant Cron as Scheduler/Manual Close
    participant Med as SettlementService (Mediator)
    participant DB as PostgreSQL
    participant Strat as Valuation Strategy

    Cron->>Med: settleAuction(auctionId)
    activate Med
    
    Med->>DB: BEGIN TRANSACTION
    Med->>DB: Fetch Auction (Lock), Ticket, Top Bids
    
    Med->>Strat: determineWinnerAndPrice(Top Bids)
    Strat-->>Med: { winnerId, finalPrice }
    
    Note over Med,DB: Escrow Processing Phase
    
    Med->>DB: Fetch Buyer Wallet (Lock)
    Med->>DB: UPDATE Buyer Wallet: Balance -= finalPrice
    
    Med->>DB: Fetch Seller Wallet (Lock)
    Med->>DB: UPDATE Seller Wallet: Balance += finalPrice
    
    Note over Med,DB: Asset Transfer Phase
    Med->>DB: UPDATE Ticket: sellerId = winnerId, status = 'Sold'
    Med->>DB: UPDATE Auction: status = 'Closed', winner = winnerId
    
    Med->>DB: COMMIT TRANSACTION
    
    Med-->>Cron: Success / Failure
    deactivate Med
```

---

## 6. Security Considerations & Protections
*   **Race Conditions:** Mitigated using PostgreSQL explicit locks (`SELECT ... FOR UPDATE`) during bid placements and checkout to prevent DB inconsistencies when 100 users bid simultaneously.
*   **JWT Authentication:** All sensitive routes (bidding, selling, wallet access) restrict execution via a Bearer token verification middleware.
*   **Escrow Safety:** The Settlement mediator forces an all-or-nothing rollback. If transferring the ticket fails due to an error, the buyer's funds are instantly rolled back in the transaction.
