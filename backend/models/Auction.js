const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Auction = sequelize.define('Auction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    strategyType: {
        type: DataTypes.ENUM('English', 'Vickrey'),
        allowNull: false,
    },
    startingPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    currentHighestBid: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    winningBidderId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Closed', 'Pending'),
        defaultValue: 'Pending',
    },
    startTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    timestamps: true,
});

module.exports = Auction;
