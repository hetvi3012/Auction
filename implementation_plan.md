# Fair-Play Ticket Auction & Exchange Platform - Low-Level Design (LLD)

## 1. System Overview
The system is a real-time ticket auction platform facilitating both English (ascending) and Vickrey (sealed-bid) auctions. It employs Node.js/Express for the REST API, Socket.io for real-time bid broadcasting, MongoDB for ACID-compliant transactions, and React.js for the UI. Optional Redis integration can manage high-frequency concurrent bids.

## User Review Required
> [!IMPORTANT]
> Please review the defined Database Schema, API Endpoints, and Class Structures below. Let me know if any specific fields, business rules, or endpoints need adjustment before we begin the implementation phase.

## 2. Database Schema Design (MongoDB / Mongoose)

### `User` Collection
- **`_id`**: ObjectId
- **`name`**: String, required
- **`email`**: String, required, unique
- **`passwordHash`**: String, required
- **`walletBalance`**: Number, default: 0
- **`isVerified`**: Boolean, default: false
- **`createdAt`**: Date
- **`updatedAt`**: Date

### `Ticket` Collection
- **`_id`**: ObjectId
- **`sellerId`**: ObjectId (Ref: User), required
- **`eventId`**: String, required (e.g., "TechConf 2026")
- **`seatInfo`**: Object (e.g., `{ section: String, row: String, seat: String }`)
- **`status`**: Enum `['Available', 'In_Auction', 'Sold']`, default: 'Available'
- **`createdAt`**: Date

### `Auction` Collection
- **`_id`**: ObjectId
- **`ticketId`**: ObjectId (Ref: Ticket), required
- **`strategyType`**: Enum `['English', 'Vickrey']`, required
- **`startingPrice`**: Number, required
- **`currentHighestBid`**: Number, default: startingPrice
- **`winningBidderId`**: ObjectId (Ref: User), default: null
- **`status`**: Enum `['Active', 'Closed', 'Pending']`, default: 'Pending'
- **`startTime`**: Date
- **`endTime`**: Date, required
- **`createdAt`**: Date

### `Bid` Collection
- **`_id`**: ObjectId
- **`auctionId`**: ObjectId (Ref: Auction), required, indexed
- **`bidderId`**: ObjectId (Ref: User), required
- **`amount`**: Number, required, indexed
- **`timestamp`**: Date, default: Date.now

## 3. High-Level API Endpoints (Express.js)

### Auth & Users
- `POST /api/auth/register`: Create a new user.
- `POST /api/auth/login`: Authenticate and return JWT.
- `GET /api/users/me`: Get current user details/wallet.
- `POST /api/users/wallet/fund`: Add funds to wallet.

### Tickets
- `POST /api/tickets`: Create a new ticket (Seller).
- `GET /api/tickets`: List available tickets.
- `GET /api/tickets/:id`: Get ticket details.

### Auctions
- `POST /api/auctions`: Create an auction for a ticket (Changes ticket status to `In_Auction`).
- `GET /api/auctions`: List active auctions.
- `GET /api/auctions/:id`: Get auction details and current high bid.
- `POST /api/auctions/:id/close`: Manually or chron-triggered endpoint to close an auction and trigger mediator settlement.

### Bids (REST portion, backed by WebSockets)
- `POST /api/bids`: Place a new bid.
  - Body: `{ auctionId, amount }`
  - Logic: Validate strategy, start DB transaction, verify wallet balance, update `currentHighestBid`, insert `Bid`, commit transaction. Emit WebSocket event.

## 4. Real-Time Events (Socket.io)

### Client to Server
- `join_auction`: Client joins a specific room corresponding to the `auctionId` to receive targeted updates.

### Server to Client
- `new_bid`: Broadcasted to the auction room when a valid bid is placed. Payload: `{ auctionId, amount, timestamp, isOutbid (flag for specific users) }`
- `auction_closed`: Broadcasted when the auction ends. Payload: `{ auctionId, winningBidderId, finalPrice }`

## 5. Core Class & Pattern Design (Backend)

### A. Strategy Pattern (Auction Pricing Engine)
```typescript
interface AuctionStrategy {
  validateBid(currentHighest: number, newBid: number, walletBalance: number): boolean;
  determineWinnerAndPrice(bids: Bid[]): { winnerId: ObjectId, finalPrice: number } | null;
}

class EnglishAuctionStrategy implements AuctionStrategy {
  validateBid(currentHighest, newBid, walletBalance) {
    return newBid > currentHighest && walletBalance >= newBid;
  }
  determineWinnerAndPrice(bids) {
    // Sort descending, pick index 0. Price is the highest bid.
  }
}

class VickreyAuctionStrategy implements AuctionStrategy {
  validateBid(currentHighest, newBid, walletBalance) {
    // In Vickrey, sealed bids are accepted as long as user has funds.
    return walletBalance >= newBid;
  }
  determineWinnerAndPrice(bids) {
    // Sort descending. Winner is index 0. Price is index 1's bid amount.
  }
}

class AuctionContext {
  constructor(private strategy: AuctionStrategy) {}
  setStrategy(strategy: AuctionStrategy) { this.strategy = strategy; }
  processBid(...) { return this.strategy.validateBid(...); }
}
```

### B. Mediator Pattern (Checkout & Settlement)
```typescript
class AuctionSettlementService {
  async settleAuction(auctionId: ObjectId) {
    // 1. Start MongoDB Session / Transaction
    // 2. Load Auction, Ticket, and Top Bids
    // 3. Delegate to AuctionStrategy to get Winner & Final Price
    // 4. If Winner:
    //    a. Deduct Final Price from Buyer's Wallet
    //    b. Add Final Price (minus fees) to Seller's Wallet
    //    c. Transfer Ticket ownership to Buyer
    //    d. Update Auction status to 'Closed'
    // 5. Commit Transaction. If any fail, Abort Transaction.
    // 6. Trigger Observer notifications (Winner email, Seller email, etc.)
  }
}
```

### C. Observer Pattern (Live Notifications)
```typescript
class AuctionSubject {
  private observers: Observer[] = [];
  addObserver(obs: Observer) { this.observers.push(obs); }
  notifyNewBid(bidData) { this.observers.forEach(o => o.onNewBid(bidData)); }
}

class WebSocketBroadcaster implements Observer {
  onNewBid(bidData) { io.to(bidData.auctionId).emit('new_bid', bidData); }
}
```

## 6. Implementation Plan / Workspace Structure
We will initialize the following directory structure in the project root:
- `/backend`: Node.js, Express, Mongoose, Socket.io
- `/frontend`: React.js, Socket.io-client, modern UI framework (TailwindCSS or modular CSS as per guidelines).

## Next Steps
Once approved, we will:
1. Initialize the `/backend` and `/frontend` directories.
2. Setup the MongoDB connection and Mongoose models.
3. Implement the GoF patterns (Strategy, Mediator, Observer) in the backend.
4. Expose the REST APIs and Socket.io endpoints.
5. Build the React frontend.
