import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, ArrowRight, X, Sparkles } from 'lucide-react';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { BlogArticle } from '../types';

export const Blog: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', 'Deliverability', 'Copywriting', 'Compliance', 'Productivity'];

  const filtered = categoryFilter === 'all'
    ? BLOG_ARTICLES
    : BLOG_ARTICLES.filter((a) => a.category.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#2F6B2F] dark:text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Outreach Mastery Blog
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Expert guides, deliverability tactics, and proven copywriting frameworks to maximize your response rates.
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${categoryFilter === cat
                ? 'bg-[#2F6B2F] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((article) => (
          <article
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                {article.title}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
                {article.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {article.date}
              </span>
              <span className="text-[#2F6B2F] dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedArticle(null)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedArticle.readTime}
                </span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
              {selectedArticle.title}
            </h1>
            <div className="text-xs text-slate-400 mb-6 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Published on {selectedArticle.date} &bull; EstechScoutier Editorial
            </div>

            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-3 font-sans">
              {selectedArticle.content}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

