import { Car, SearchX, RotateCcw } from 'lucide-react';

interface EmptyInventoryStateProps {
  hasFilters: boolean;
  onResetFilters?: () => void;
}

export default function EmptyInventoryState({ hasFilters, onResetFilters }: EmptyInventoryStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-4">
      <div className="p-4 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl">
        {hasFilters ? <SearchX size={36} /> : <Car size={36} />}
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {hasFilters ? 'No vehicles match your search' : 'Inventory is empty'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {hasFilters
            ? 'Try broadening your search term or clearing active price filters.'
            : 'There are currently no vehicles listed in the dealership system.'}
        </p>
      </div>

      {hasFilters && onResetFilters && (
        <button
          onClick={onResetFilters}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
        >
          <RotateCcw size={14} /> Clear Search Filters
        </button>
      )}
    </div>
  );
}
