import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { productsApi, handleApiError } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { categories, getCategoryLabel } from '../utils/categoryUtils';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0] as ProductCategory,
    price: '',
    contactNumber: '',
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReserved, setShowReserved] = useState(false);
  const [showOffers, setShowOffers] = useState(false);

  // Get all offers from products and sort by timestamp
  const allOffers = React.useMemo(() => {
    return products
      .flatMap(product => 
        product.offers.map(offer => ({
          ...offer,
          productName: product.name,
          productId: product._id,
          productPrice: product.price
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Get all products for admin, including reserved ones
      const data = await productsApi.getAll(undefined, undefined, true);
      setProducts(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'category') {
      // Validate that the value is a valid ProductCategory
      if (categories.includes(value as ProductCategory)) {
        setFormData(prev => ({
          ...prev,
          category: value as ProductCategory
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 5) {
        alert('Maximum 5 images allowed');
        return;
      }
      setImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images || images.length === 0) {
      setError('At least one image is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('contactNumber', formData.contactNumber);

      for (let i = 0; i < images.length; i++) {
        formDataToSend.append('images', images[i]);
      }

      await productsApi.create(formDataToSend);
        // Reset form
      setFormData({
        name: '',
        description: '',
        category: categories[0] as ProductCategory,
        price: '',
        contactNumber: '',
      });
      setImages(null);
      
      // Refresh products list
      await fetchProducts();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.delete(id);
      await fetchProducts();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleToggleFeatured = async (id: string, currentlyFeatured: boolean) => {
    try {
      setSubmitting(true);
      await productsApi.toggleFeatured(id);
      await fetchProducts();
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
        
        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 input-field"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 input-field"
              required
            >              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">              Price (MWK)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="mt-1 input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              className="mt-1 input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              Images (1-5)
            </label>
            <input
              type="file"
              id="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary"
          >
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>      <div className="card mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Products</h2>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showReserved}
                onChange={(e) => setShowReserved(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Show Reserved Only</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showOffers}
                onChange={(e) => setShowOffers(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Show Offers Only</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {showOffers ? (
          // Offers view
          <div className="space-y-4">
            {allOffers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No offers yet</p>
            ) : (
              allOffers.map((offer, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-100">
                  <div className="flex-1">
                    <h3 className="font-medium" onClick={() => navigate(`/products/${offer.productId}`)} style={{ cursor: 'pointer' }}>
                      {offer.productName}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {offer.phoneNumber.substring(0, 4)}****
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(offer.timestamp).toLocaleDateString()} {new Date(offer.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-lg">
                      MWK {offer.offerPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Listed: MWK {offer.productPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(offer.offerPrice / offer.productPrice * 100).toFixed(1)}% of list price
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (          // Products list view
          <div className="space-y-4">
            {products.filter(p => showReserved ? p.reserved : true).map((product) => (
              <div key={product._id} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
                <div className="relative flex-shrink-0">
                  <img
                    src={product.images[product.coverImageIndex]}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded"
                  />                  {product.featured && (
                    <span className="absolute top-0 left-0 bg-yellow-400 text-white px-2 py-1 rounded-br text-sm font-medium shadow-sm">
                      Featured
                    </span>)}
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">{getCategoryLabel(product.category)}</div>
                      <div className="text-lg font-bold mt-1">MWK {product.price.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{product.contactNumber}</div>
                      {product.reserved && (
                        <div className="text-sm mt-1">
                          <span className="font-semibold">Reserved by:</span> {product.reservedBy?.phoneNumber}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleFeatured(product._id, product.featured)}
                        className={`p-1 rounded-full transition-colors ${
                          product.featured
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-yellow-400 hover:text-white'
                        }`}
                        title={product.featured ? 'Remove from featured' : 'Add to featured'}
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>                      <button
                        onClick={() => navigate(`/products/${product._id}/edit`)}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        Edit
                      </button>
                      {product.reserved && (
                        <button
                          onClick={async () => {
                            try {
                              await productsApi.unreserve(product._id);
                              fetchProducts();
                            } catch (err) {
                              setError(handleApiError(err));
                            }
                          }}
                          className="px-3 py-1 text-sm bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded"
                        >
                          Unreserve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
