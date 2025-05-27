import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import { Product } from '../types';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<string>('newest');
  const [category, setCategory] = useState<string>('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll(sort, category);
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [sort, category]);

  useEffect(() => {
    fetchProducts();
  }, [sort, category, fetchProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          Welcome to Afonne Market
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            <option value="clothing">Clothing</option>
            <option value="technology">Technology</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No products available
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="aspect-w-16 aspect-h-9 mb-2 sm:mb-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-full h-32 sm:h-48 rounded-md"
                />
              </div>
              
              <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
                {product.name}
              </h2>
              
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-lg font-medium text-gray-900">
                  MWK {product.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">
                  {product.category.toLocaleUpperCase() || 'Uncategorized'}
                </span>
              </div>
              
              {product.offers.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  {product.offers.length} offer(s)
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
