import axios, { AxiosError } from 'axios';
import { Product, LoginCredentials, AuthResponse, ApiError } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'https://yard-lyart.vercel.app';

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
export const api = axios.create({
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

interface SearchResponse {
  searchResults: Product[];
  similarProducts: Product[];
}

export const productsApi = {
  search: async (query: string) => {
    const response = await api.get<SearchResponse>(`/products/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getAll: async (sort?: string, category?: string, includeReserved?: boolean) => {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (category) params.append('category', category);
    if (includeReserved) params.append('includeReserved', 'true');
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

  update: async (id: string, data: Partial<Omit<Product, '_id' | 'images' | 'reserved' | 'reservedBy' | 'offers' | 'createdAt' | 'updatedAt'>> & { coverImageIndex?: number }) => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get<Product[]>('/products/featured');
    return response.data;
  },

  toggleFeatured: async (id: string) => {
    const response = await api.post<Product>(`/products/${id}/toggle-featured`);
    return response.data;
  },

  addImages: async (id: string, images: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }
    const response = await api.post<Product>(`/products/${id}/images`, formData);
    return response.data;
  },

  removeImage: async (id: string, imageIndex: number) => {
    const response = await api.delete<Product>(`/products/${id}/images/${imageIndex}`);
    return response.data;
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
