import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, handleApiError } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ImageModal from '../components/ImageModal';
import { getWhatsAppLink, openProductPurchaseWhatsApp } from '../utils/phoneUtils';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Set the initial image index to the cover image when product loads
    if (product) {
      setCurrentImageIndex(product.coverImageIndex);
    }
  }, [product]);

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
  }, [id, fetchProduct]);  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !phoneNumber) return;

    try {
      setSubmitting(true);
      await productsApi.reserve(product._id, phoneNumber);
      
      // Open WhatsApp with purchase message
      openProductPurchaseWhatsApp({
        name: product.name,
        price: product.price,
        contactNumber: product.contactNumber
      });
      
      await fetchProduct();
      setPhoneNumber('');
      
      window.alert('Product marked as pending! We\'ve opened WhatsApp for you to contact the seller and arrange payment and delivery.');
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
      setSubmitting(true);      await productsApi.makeOffer(product._id, phoneNumber, Number(offerPrice));
      await fetchProduct();
      setPhoneNumber('');
      setOfferPrice('');
      window.alert(`Offer submitted successfully! Please contact the seller on WhatsApp to discuss your offer. Click the "Contact Seller" button to start chatting.`);
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

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image Gallery */}
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
      <div className="space-y-6">        <div>          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-xl text-gray-500">MWK {product.price.toLocaleString()}</p>          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              {product.category.toLocaleUpperCase()}
            </span>
            <a 
              href={getWhatsAppLink(product.contactNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 hover:bg-green-200"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact Seller
            </a>
          </div>
        </div>

        {product.description && (
          <p className="text-gray-700">{product.description}</p>
        )}

        {/* Purchase Status */}
        {product.reserved ? (
          <div className="card bg-yellow-50">
            <p className="text-yellow-800">
              This product is currently pending purchase
              {isAuthenticated && (
                <button
                  onClick={handleUnreserve}
                  disabled={submitting}
                  className="ml-4 btn-secondary"
                >
                  Cancel Purchase
                </button>
              )}
            </p>
          </div>        ) : (
          /* Buy Form */
          <form onSubmit={handleReserve} className="card">
            <h3 className="text-lg font-semibold mb-4">Buy This Product</h3>
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
                Buy Now
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
