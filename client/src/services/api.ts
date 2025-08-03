import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ✅ allow sending cookies
});

// Add token to headers on each request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginUser = (data: any) => API.post('/auth/login', data);
export const registerUser = (data: any) => API.post('/auth/register', data);
export const getCurrentUser = () => API.get('/auth/me');

// Profiles
export const createFarmerProfile = (data: any) => API.post('/farmer', data);
export const createBuyerProfile = (data: any) => API.post('/buyer', data);
export const getFarmerProfile = () => API.get('/farmer/me');
export const getBuyerProfile = () => API.get('/buyer/me');

// Products
export const createProduct = (data: any) => API.post('/products', data);
export const getProducts = () => API.get('/products');
export const getProductById = (id: string) => API.get(`/products/${id}`);

// Chats
export const fetchChats = () => API.get('/chat');
export const sendMessage = (chatId: string, message: any) =>
  API.post(`/chat/${chatId}/messages`, message);

export default API;
