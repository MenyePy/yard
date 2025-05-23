export default function LoadingProducts() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800"
        >
          <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
          <div className="p-4">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-4 space-y-2">
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 