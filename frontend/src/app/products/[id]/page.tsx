'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useProduct } from '@/hooks/useProducts';
import { formatCurrency, formatPhoneNumber, isValidPhoneNumber } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface OfferFormData {
  phoneNumber: string;
  amount: string;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const { product, isLoading, error, submitOffer, isSubmitting } = useProduct(params.id);
  const [formData, setFormData] = useState<OfferFormData>({
    phoneNumber: '',
    amount: '',
  });
  const [formError, setFormError] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading product</div>;
  if (!product) return <div>Product not found</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setFormError('Please enter a valid phone number (+265 format)');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    if (amount <= product.price) {
      setFormError('Offer must be higher than the current price');
      return;
    }

    submitOffer({
      phoneNumber: formData.phoneNumber,
      amount,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="h-full w-full"
          >
            {product.images.map((image, index) => (
              <SwiperSlide key={image.publicId}>
                <Image
                  src={image.url}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              {product.description}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(product.price)}
              </span>
              <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </span>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact Number
              </h3>
              <p className="text-gray-900 dark:text-white">
                {formatPhoneNumber(product.contactNumber)}
              </p>
            </div>

            {product.status === 'available' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+265 99 123 4567"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Your Offer (MWK)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min={product.price + 1}
                    step="100"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                </button>
              </form>
            )}

            {product.offers.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Highest Offer
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(Math.max(...product.offers.map(o => o.amount)))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 