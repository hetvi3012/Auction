const sequelize = require('../config/db');
const User = require('./User');
const Ticket = require('./Ticket');
const Auction = require('./Auction');
const Bid = require('./Bid');
const ProxyBidLimit = require('./ProxyBidLimit');

// Setup Associations
// User -> Ticket (Seller)
User.hasMany(Ticket, { foreignKey: 'sellerId' });
Ticket.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Ticket -> Auction
Ticket.hasOne(Auction, { foreignKey: 'ticketId' });
Auction.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// Auction -> Bid
Auction.hasMany(Bid, { foreignKey: 'auctionId' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

// User -> Bid (Bidder)
User.hasMany(Bid, { foreignKey: 'bidderId' });
Bid.belongsTo(User, { foreignKey: 'bidderId', as: 'bidder' });

// User -> Auction (Winner)
User.hasMany(Auction, { foreignKey: 'winningBidderId' });
Auction.belongsTo(User, { foreignKey: 'winningBidderId', as: 'winningBidder' });

// ProxyBid Associations
Auction.hasMany(ProxyBidLimit, { foreignKey: 'auctionId' });
ProxyBidLimit.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

User.hasMany(ProxyBidLimit, { foreignKey: 'bidderId' });
ProxyBidLimit.belongsTo(User, { foreignKey: 'bidderId', as: 'bidder' });

module.exports = {
    sequelize,
    User,
    Ticket,
    Auction,
    Bid,
    ProxyBidLimit
};
