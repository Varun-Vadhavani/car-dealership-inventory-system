export default function VehicleSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 animate-pulse"
        >
          {/* Skeleton Image Placeholder */}
          <div className="w-full aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-2xl" />

          {/* Skeleton Header */}
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>

          {/* Skeleton Price & Specs */}
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-7 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>

          {/* Skeleton Button */}
          <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-4" />
        </div>
      ))}
    </div>
  );
}
