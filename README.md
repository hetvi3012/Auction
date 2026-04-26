# FairPlay Ticket Auction Platform 🎟️

![FairPlay Banner](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-blueviolet)

Welcome to **FairPlay Tickets**, a highly scalable, real-time ticket auction platform explicitly designed to tackle scalping in the secondary ticketing market. By utilizing dynamic bidding, automated settlements, and real-time socket connections, FairPlay ensures a transparent and fair ticket purchasing experience.

---

## ✨ Key Features
- **Secure Authentication:** JWT-based user authentication and role-based access (Bidder, Seller, Admin).
- **Real-Time Bidding:** Live websocket connections for instant bid updates using Socket.io.
- **Automated Settlement:** Background jobs utilizing Redis and BullMQ to automatically close expired auctions and determine winners.
- **Microservice-Ready Architecture:** Designed as a layered monolith with clear domain boundaries, making it straightforward to divide into microservices later.
- **Fully Dockerized:** Effortless local development experience with `docker-compose`.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, TailwindCSS (served via Nginx)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with Sequelize ORM)
- **Queue/Cache (Jobs):** Redis, BullMQ
- **Deployment & Containerization:** Docker, Docker Compose

---

## 🚀 Getting Started (Local Development)

The easiest and recommended way to run this application locally is by using **Docker**.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Git](https://git-scm.com/) installed.

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/hetvi3012/Auction.git
   cd Auction
   ```

2. **Spin up the application**
   Make sure Docker Desktop is open. Run the following command in the root of the project to build the images and start the services:
   ```bash
   docker compose up --build -d
   ```

3. **Access the application**
   Once the containers are running, you can access the platform:
   - **Frontend UI:** [http://localhost](http://localhost)
   - **Backend API API Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

4. **Stopping the application**
   When you are done testing, you can gracefully stop and remove all the containers by running:
   ```bash
   docker compose down
   ```

---

## 📂 Project Structure

```text
Auction/
├── backend/                  # Node.js Express API
│   ├── controllers/          # Route handlers
│   ├── models/               # Sequelize DB Models
│   ├── routes/               # API endpoints
│   ├── services/             # Core business logic (Bidding, Sockets)
│   ├── jobs/                 # BullMQ worker background tasks
│   └── Dockerfile            # Container definition for the backend
├── frontend/                 # React UI (Vite)
│   ├── src/                  # React components, pages, and hooks
│   ├── nginx.conf            # Nginx config for routing
│   └── Dockerfile            # Container definition for the frontend
├── docker-compose.yml        # Multi-container orchestration (DB, Cache, App)
└── ARCHITECTURE.md           # Extensive architectural documentation
```

---

## 📚 Documentation
For a deeper dive into the system's architecture, design decisions, and testing guidelines, please refer to the following documents located in the repository root:
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - System architecture and flow
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Deployment steps on platforms like Render
- [`TEST_DOCUMENTATION.md`](./TEST_DOCUMENTATION.md) - Unit, acceptance, and integration test guidelines
- [`system_design_document.md`](./system_design_document.md) - System-level requirements and models

---

### Developed By
Hetvi and the FairPlay Auctions Engineering Team.
