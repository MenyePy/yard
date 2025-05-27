export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: 'clothing' | 'technology' | 'other';
  price: number;
  images: string[];
  contactNumber: string;
  reserved: boolean;
  reservedBy?: {
    phoneNumber: string;
    reservedAt: Date;
  };
  offers: Offer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  phoneNumber: string;
  offerPrice: number;
  timestamp: Date;
}

export interface Admin {
  _id: string;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface ApiError {
  error: string;
  errors?: { msg: string; param: string }[];
}
