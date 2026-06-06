export default function ProductsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-32 rounded-lg bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square rounded-xl bg-gray-200 mb-3" />
            <div className="h-3 w-2/3 rounded bg-gray-200 mb-2" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
