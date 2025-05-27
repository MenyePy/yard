import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, handleApiError } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ImageModal from '../components/ImageModal';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [offerPrice, setOfferPrice] = useState('');  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productsApi.getById(id!);
      setProduct(data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !phoneNumber) return;

    try {
      setSubmitting(true);
      await productsApi.reserve(product._id, phoneNumber);
      await fetchProduct();
      setPhoneNumber('');
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnreserve = async () => {
    if (!product) return;

    try {
      setSubmitting(true);
      await productsApi.unreserve(product._id);
      await fetchProduct();
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !phoneNumber || !offerPrice) return;

    try {
      setSubmitting(true);
      await productsApi.makeOffer(product._id, phoneNumber, Number(offerPrice));
      await fetchProduct();
      setPhoneNumber('');
      setOfferPrice('');
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setSubmitting(true);
      await productsApi.delete(product._id);
      navigate('/');
    } catch (error) {
      setError(handleApiError(error));
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

  if (error || !product) {
    return (
      <div className="text-center text-red-600 py-8">
        {error || 'Product not found'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">      {/* Image Gallery */}
      <div className="space-y-4">
        <div 
          className="aspect-w-16 aspect-h-9 cursor-pointer"
          onClick={() => {
            setCurrentImageIndex(0);
            setIsModalOpen(true);
          }}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-96 rounded-lg hover:opacity-90 transition-opacity"
          />
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((image, index) => (
              <div
                key={index}
                className="cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(index + 1);
                  setIsModalOpen(true);
                }}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 2}`}
                  className="object-cover w-full h-24 rounded-md hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        )}

        <ImageModal
          images={product.images}
          currentIndex={currentImageIndex}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onNext={() => setCurrentImageIndex(prev => 
            prev < product.images.length - 1 ? prev + 1 : prev
          )}
          onPrev={() => setCurrentImageIndex(prev => 
            prev > 0 ? prev - 1 : prev
          )}
        />
      </div>

      {/* Product Details */}
      <div className="space-y-6">        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-xl text-gray-500">MWK {product.price.toLocaleString()}</p>
          <span className="mt-2 inline-block px-2 py-1 text-sm rounded-full bg-gray-100">
            {product.category}
          </span>
        </div>

        {product.description && (
          <p className="text-gray-700">{product.description}</p>
        )}

        {/* Reservation Status */}
        {product.reserved ? (
          <div className="card bg-yellow-50">
            <p className="text-yellow-800">
              This product is currently reserved
              {isAuthenticated && (
                <button
                  onClick={handleUnreserve}
                  disabled={submitting}
                  className="ml-4 btn-secondary"
                >
                  Cancel Reservation
                </button>
              )}
            </p>
          </div>
        ) : (
          /* Reserve Form */
          <form onSubmit={handleReserve} className="card">
            <h3 className="text-lg font-semibold mb-4">Reserve This Product</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="reservePhone" className="block text-sm font-medium text-gray-700">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  id="reservePhone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 input-field"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary"
              >
                Reserve Now
              </button>
            </div>
          </form>
        )}

        {/* Make Offer Form */}
        {!product.reserved && (
          <form onSubmit={handleMakeOffer} className="card">
            <h3 className="text-lg font-semibold mb-4">Make an Offer</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="offerPhone" className="block text-sm font-medium text-gray-700">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  id="offerPhone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 input-field"
                  required
                />
              </div>
              <div>                <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-700">
                  Your Offer (MWK)
                </label>
                <input
                  type="number"
                  id="offerPrice"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="mt-1 input-field"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary"
              >
                Submit Offer
              </button>
            </div>
          </form>
        )}

        {/* Offers List */}
        {product.offers.length > 0 && !product.reserved && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Current Offers</h3>
            <div className="space-y-2">
              {product.offers.map((offer, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-gray-600">
                    {offer.phoneNumber.substring(0, 4)}****
                  </span>                  <span className="font-medium">MWK {offer.offerPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}        {/* Admin Actions */}
        {isAuthenticated && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate(`/products/${product._id}/edit`)}
              disabled={submitting}
              className="btn-primary"
            >
              Edit Product
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="btn-secondary bg-red-100 text-red-700 hover:bg-red-200"
            >
              Delete Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
