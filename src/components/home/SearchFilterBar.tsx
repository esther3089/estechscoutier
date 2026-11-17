import React from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SearchFilterBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    emails,
    filteredEmails,
  } = useApp();

  const sentCount = emails.filter((e) => e.status === 'sent').length;
  const pendingCount = emails.filter((e) => e.status === 'pending').length;

  return (
    <div className="sticky top-14 z-30 bg-gray-100/95 dark:bg-slate-950/95 backdrop-blur-md py-2.5 px-3 sm:px-0 -mx-3 sm:mx-0 border-b border-slate-200/60 dark:border-slate-800/60 mb-4 transition-all">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search an email or filter by status..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-center sm:self-auto shrink-0 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-300/80 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-[#2F6B2F] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({emails.length})
          </button>
          <button
            onClick={() => setStatusFilter('sent')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'sent'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sent ({sentCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'pending'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Show alert if filtered out */}
      {emails.length > 0 && filteredEmails.length === 0 && (
        <div className="mt-2 text-center text-xs text-rose-500 dark:text-rose-400 font-semibold py-1">
          Email not found!
        </div>
      )}
    </div>
  );
};

