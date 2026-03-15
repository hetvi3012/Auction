const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProxyBidLimit = sequelize.define('ProxyBidLimit', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    auctionId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    bidderId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    maxWillingToPay: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['auctionId', 'bidderId'] // A user can only have one active proxy limit per auction
        }
    ]
});

module.exports = ProxyBidLimit;
