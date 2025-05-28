import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, handleApiError } from '../services/api';
import { Product, ProductCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { categories, getCategoryLabel } from '../utils/categoryUtils';

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'clothing' as ProductCategory,
    price: '',
    contactNumber: '',
  });
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [newImages, setNewImages] = useState<FileList | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const productData = await productsApi.getById(id);
        setProduct(productData);
        setFormData({
          name: productData.name,
          description: productData.description || '',
          category: productData.category,
          price: productData.price.toString(),
          contactNumber: productData.contactNumber,
        });
        setLoading(false);
      } catch (err) {
        setError(handleApiError(err));
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      await productsApi.update(id!, {
        name: formData.name,
        description: formData.description,
        category: formData.category as ProductCategory,
        price: parseFloat(formData.price),
        contactNumber: formData.contactNumber,
      });
      
      navigate(`/products/${id}`);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCoverImage = async (index: number) => {
    if (!product || !id) return;
    
    try {
      setSubmitting(true);
      await productsApi.update(id, { coverImageIndex: index });
      setProduct({ ...product, coverImageIndex: index });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const totalImages = (product?.images.length || 0) + e.target.files.length;
      if (totalImages > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      setNewImages(e.target.files);
    }
  };

  const handleAddImages = async () => {
    if (!product || !newImages) return;

    try {
      setSubmitting(true);
      setError('');
      const updatedProduct = await productsApi.addImages(product._id, newImages);
      setProduct(updatedProduct);
      setNewImages(null);
      // Reset file input
      const fileInput = document.getElementById('new-images') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveImage = async (imageIndex: number) => {
    if (!product || submitting) return;
    
    if (product.images.length <= 1) {
      setError('Product must have at least one image');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this image?')) return;

    try {
      setSubmitting(true);
      setError('');
      const updatedProduct = await productsApi.removeImage(product._id, imageIndex);
      setProduct(updatedProduct);
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
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
        
        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {product && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Images ({product.images.length}/5)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="new-images"
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={submitting}
                />
                <label
                  htmlFor="new-images"
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Add Images
                </label>
                {newImages && (
                  <button
                    type="button"
                    onClick={handleAddImages}
                    disabled={submitting}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className={`w-full h-32 object-cover rounded-lg ${
                      index === product.coverImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    {index !== product.coverImageIndex && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(index)}
                        className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        title="Set as cover"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Remove image"
                      disabled={product.images.length <= 1 || submitting}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {index === product.coverImageIndex && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
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
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (MWK)
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

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/products/${id}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
