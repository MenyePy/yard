import { Suspense } from 'react';
import ProductGrid from '@/components/ProductGrid';
import ProductFilters from '@/components/ProductFilters';
import LoadingProducts from '@/components/LoadingProducts';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Yard Sale Pro
        </h1>
        <p className="text-lg leading-8 text-gray-600 dark:text-gray-300">
          Find amazing deals on quality items
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters />
        </aside>

        <div>
          <Suspense fallback={<LoadingProducts />}>
            <ProductGrid />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 