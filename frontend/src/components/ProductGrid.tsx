'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import LoadingProducts from './LoadingProducts';

export default function ProductGrid() {
  const { products, isLoading, error } = useProducts();

  if (isLoading) return <LoadingProducts />;
  if (error) return <div>Error loading products</div>;
  if (!products?.length) return <div>No products found</div>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product._id}
          href={`/products/${product._id}`}
          className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
        >
          <div className="aspect-square overflow-hidden">
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={500}
              height={500}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.status !== 'available' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
                  {product.status === 'pending' ? 'Pending' : 'Sold'}
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              {product.name}
            </h3>
            <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(product.price)}
              </span>
              {product.offers?.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Highest offer: {formatCurrency(Math.max(...product.offers.map(o => o.amount)))}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 