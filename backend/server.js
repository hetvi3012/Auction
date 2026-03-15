const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const dotenv = require('dotenv');
const { initObservers } = require('./services/ObserverRegistry');
const { sequelize } = require('./models');

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: '*', // To be restricted in production
        methods: ['GET', 'POST']
    }
});

app.set('io', io); // Make io accessible in routes

// Initialize Observer Pattern for broadcasting
initObservers(io);

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_auction', (auctionId) => {
        socket.join(auctionId);
        console.log(`Socket ${socket.id} joined auction room: ${auctionId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Connect to Postgres and start server
sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Connected to Postgres and models synced`);
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Postgres connection error:', error);
        process.exit(1);
    });
