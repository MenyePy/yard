import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: { url: string; publicId: string }[];
  type: string;
  status: 'available' | 'pending' | 'sold';
  contactNumber: string;
  offers: Array<{
    _id: string;
    phoneNumber: string;
    amount: number;
    createdAt: string;
  }>;
}

interface OfferData {
  phoneNumber: string;
  amount: number;
}

async function getProducts(searchParams: URLSearchParams) {
  const response = await fetch(`/api/products?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

async function getProduct(id: string) {
  const response = await fetch(`/api/products/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
}

async function submitOffer(id: string, data: OfferData) {
  const response = await fetch(`/api/products/${id}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit offer');
  }
  return response.json();
}

export function useProducts() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const productsQuery = useQuery<Product[]>({
    queryKey: ['products', searchParams.toString()],
    queryFn: () => getProducts(searchParams),
  });

  return {
    products: productsQuery.data,
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
  };
}

export function useProduct(id: string) {
  const queryClient = useQueryClient();

  const productQuery = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
  });

  const submitOfferMutation = useMutation({
    mutationFn: (data: OfferData) => submitOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Offer submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    product: productQuery.data,
    isLoading: productQuery.isLoading,
    error: productQuery.error,
    submitOffer: submitOfferMutation.mutate,
    isSubmitting: submitOfferMutation.isPending,
  };
} 