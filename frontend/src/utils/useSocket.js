import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = (auctionId) => {
    const [socket, setSocket] = useState(null);
    const [latestBid, setLatestBid] = useState(null);
    const [auctionClosed, setAuctionClosed] = useState(null);

    useEffect(() => {
        if (!auctionId) return;

        const newSocket = io(SOCKET_URL);
        
        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            newSocket.emit('join_auction', auctionId);
        });

        newSocket.on('new_bid', (bidData) => {
            console.log('New bid received:', bidData);
            setLatestBid(bidData);
        });

        newSocket.on('auction_closed', (auctionData) => {
            console.log('Auction closed:', auctionData);
            setAuctionClosed(auctionData);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [auctionId]);

    return { socket, latestBid, auctionClosed };
};
