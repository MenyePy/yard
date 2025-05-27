import { ProductCategory } from '../types';

export const getCategoryLabel = (category: ProductCategory): string => {
  const labels: Record<ProductCategory, string> = {
    'clothing': 'Clothing',
    'electronics': 'Electronics',
    'home-and-kitchen': 'Home & Kitchen',
    'health': 'Health',
    'outdoors': 'Outdoors',
    'stationery': 'Stationery',
    'toys-and-games': 'Toys & Games',
    'automotive': 'Automotive',
    'other': 'Other'
  };
  return labels[category];
};

export const categories: ProductCategory[] = [
  'clothing',
  'electronics',
  'home-and-kitchen',
  'health',
  'outdoors',
  'stationery',
  'toys-and-games',
  'automotive',
  'other'
];
