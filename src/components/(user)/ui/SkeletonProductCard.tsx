export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 an`imate-pulse">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-5 bg-gray-200 rounded-lg w-2/5 mt-2" />
        <div className="flex gap-1.5 mt-2">
          <div className="h-8 bg-gray-200 rounded-xl flex-1" />
          <div className="h-8 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  cols?: string;
}

export function SkeletonGrid({ count = 4, cols = "grid-cols-2 sm:grid-cols-4" }: SkeletonGridProps) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}
