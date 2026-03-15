const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    sellerId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    eventId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    seatInfo: {
        type: DataTypes.JSONB, // Postgres supports JSON/JSONB
    },
    status: {
        type: DataTypes.ENUM('Available', 'In_Auction', 'Sold'),
        defaultValue: 'Available',
    }
}, {
    timestamps: true,
});

module.exports = Ticket;
