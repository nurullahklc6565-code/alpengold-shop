export default function OrdersLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-32 rounded bg-gray-200" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
