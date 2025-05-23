'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: 'available' | 'sold' | 'pending';
  contactNumber: string;
  images: { url: string; publicId: string }[];
  createdAt: string;
}

async function getProducts() {
  const response = await fetch('/api/admin/products');
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

async function deleteProduct(id: string) {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
}

async function updateProductStatus(id: string, status: Product['status']) {
  const response = await fetch(`/api/admin/products/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update product status');
  return response.json();
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['adminProducts'],
    queryFn: getProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Product['status'] }) =>
      updateProductStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update product status');
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage all products in the yard sale platform.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <PlusIcon className="inline-block h-5 w-5" /> Add Product
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {products?.map((product) => (
                    <tr key={product._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.images[0]?.url}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={product.status}
                          onChange={(e) =>
                            statusMutation.mutate({
                              id: product._id,
                              status: e.target.value as Product['status'],
                            })
                          }
                          className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="available">Available</option>
                          <option value="pending">Pending</option>
                          <option value="sold">Sold</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {product.contactNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this product?')) {
                              deleteMutation.mutate(product._id);
                            }
                          }}
                          className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Product Modal will be added here */}
    </div>
  );
} 