import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
      try {
          const user = JSON.parse(userStr);
          if (user.token) {
              config.headers.Authorization = `Bearer ${user.token}`;
          }
      } catch (e) {
          console.error("Failed to parse user from localstorage", e);
      }
  }
  return config;
});

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
};

export const ticketService = {
  createTicket: async (ticketData) => {
      const response = await api.post('/tickets', ticketData);
      return response.data;
  },
  getAvailableTickets: async () => {
      const response = await api.get('/tickets');
      return response.data;
  }
}

export const auctionService = {
  createAuction: async (auctionData) => {
      const response = await api.post('/auctions', auctionData);
      return response.data;
  },
  getActiveAuctions: async () => {
      const response = await api.get('/auctions');
      return response.data;
  }
}

export const bidService = {
  placeBid: async (bidData) => {
      const response = await api.post('/bids', bidData);
      return response.data;
  },
  placeProxyBid: async (proxyData) => {
      const response = await api.post('/bids/proxy', proxyData);
      return response.data;
  }
}

export const adminService = {
  getAnalytics: async () => {
      const response = await api.get('/admin/analytics');
      return response.data;
  }
}

export default api;
