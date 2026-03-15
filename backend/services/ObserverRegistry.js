const AuctionSubject = require('./AuctionSubject');
const WebSocketBroadcaster = require('./WebSocketBroadcaster');

let ioInstance = null;

const initObservers = (io) => {
    ioInstance = io;
    const wsBroadcaster = new WebSocketBroadcaster(io);
    AuctionSubject.addObserver(wsBroadcaster);
    // Future observers like EmailNotificationService can be added here
};

module.exports = { initObservers, AuctionSubject };
