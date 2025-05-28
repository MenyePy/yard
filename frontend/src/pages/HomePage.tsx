import React, { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import { categories, getCategoryLabel } from '../utils/categoryUtils';
import ProductCard from '../components/ProductCard';
import debounce from 'lodash/debounce';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<string>('newest');
  const [category, setCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setSimilarProducts([]);
        setIsSearching(false);
        return;
      }

      try {
        const { searchResults, similarProducts } = await productsApi.search(query);
        setSearchResults(searchResults);
        setSimilarProducts(similarProducts);
        setIsSearching(true);
      } catch (err) {
        setError('Search failed');
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      fetchProducts();
    }
  }, [searchQuery, debouncedSearch, fetchProducts]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await productsApi.getFeatured();
        setFeaturedProducts(data);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      }
    };
    fetchFeaturedProducts();
  }, []);

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
      {/* Featured Products Section */}
      {featuredProducts.length > 0 && !isSearching && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <div key={product._id} className="card hover:shadow-lg transition-shadow duration-200 relative">
                {/* Featured badge */}
                <div className="absolute top-2 right-2 z-10">                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-400 text-white text-sm font-medium shadow-sm">
                    Featured
                  </span>
                </div>

                {/* Product content */}
                <Link to={`/products/${product._id}`} className="block">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={product.images[product.coverImageIndex]}
                      alt={product.name}
                      className="object-cover w-full h-48 rounded-t-lg"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-gray-600">
                        {getCategoryLabel(product.category)}
                      </span>
                      <span className="text-lg font-medium text-gray-900">
                        MWK {product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to Afonne Market
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
          />
          
          {!isSearching && (
            <>
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {isSearching ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            {searchResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {searchResults.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    showCategory
                  />
                ))}
              </div>
            )}
          </div>

          {similarProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Similar Products</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {similarProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    showCategory
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {products.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No products available
            </div>
          ) : (            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  showCategory
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
