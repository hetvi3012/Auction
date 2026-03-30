const AuctionSubject = require('./AuctionSubject');
const WebSocketBroadcaster = require('./WebSocketBroadcaster');
const NotificationService = require('./NotificationService');

let ioInstance = null;

/**
 * Observer Pattern — ObserverRegistry
 * Initialises and registers all observers with the AuctionSubject.
 * Now includes NotificationService alongside WebSocketBroadcaster.
 */
const initObservers = (io) => {
    ioInstance = io;

    // Observer 1: WebSocket broadcaster for real-time UI updates
    const wsBroadcaster = new WebSocketBroadcaster(io);
    AuctionSubject.addObserver(wsBroadcaster);

    // Observer 2: Notification service for logging/email/push notifications
    const notificationService = new NotificationService();
    AuctionSubject.addObserver(notificationService);

    console.log('[ObserverRegistry] Registered observers: WebSocketBroadcaster, NotificationService');
};

module.exports = { initObservers, AuctionSubject };
