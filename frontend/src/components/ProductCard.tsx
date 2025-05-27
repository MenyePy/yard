import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { getCategoryLabel } from '../utils/categoryUtils';

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}

export default function ProductCard({ product, showCategory = false }: ProductCardProps) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="card hover:shadow-lg transition-shadow duration-200"
    >
      <div className="aspect-w-16 aspect-h-9 mb-2 sm:mb-4">
        <img
          src={product.images[product.coverImageIndex]}
          alt={product.name}
          className="object-cover w-full h-32 sm:h-48 rounded-md"
        />
      </div>
      
      <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
        {product.name}
      </h2>
      
      <div className="flex flex-col gap-1">
        {showCategory && (
          <span className="text-sm text-gray-600">
            {getCategoryLabel(product.category)}
          </span>
        )}
        <span className="text-sm sm:text-lg font-medium text-gray-900">
          MWK {product.price.toLocaleString()}
        </span>
      </div>
    </Link>
  );
};
