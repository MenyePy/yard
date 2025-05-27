import axios, { AxiosError } from 'axios';
import { Product, LoginCredentials, AuthResponse, ApiError } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5010';

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      const apiError = axiosError.response.data;
      return apiError.error || apiError.errors?.[0]?.msg || 'An error occurred';
    }
  }
  return 'An unexpected error occurred';
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productsApi = {
  getAll: async (sort?: string, category?: string) => {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (category) params.append('category', category);
    const response = await api.get<Product[]>(`/products?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (formData: FormData) => {
    const response = await api.post<Product>('/products', formData);
    return response.data;
  },

  reserve: async (id: string, phoneNumber: string) => {
    const response = await api.post<Product>(`/products/${id}/reserve`, { phoneNumber });
    return response.data;
  },

  unreserve: async (id: string) => {
    const response = await api.post<Product>(`/products/${id}/unreserve`);
    return response.data;
  },

  makeOffer: async (id: string, phoneNumber: string, offerPrice: number) => {
    const response = await api.post<Product>(`/products/${id}/offer`, { phoneNumber, offerPrice });
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/admin/login', credentials);
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  createAdmin: async (credentials: LoginCredentials) => {
    await api.post('/admin/create', credentials);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.post('/admin/change-password', { currentPassword, newPassword });
  },
};
