import React, { useState } from 'react';
import { ShoppingBag, Check, Sparkles, Mail, ShieldCheck, Zap } from 'lucide-react';
import { SHOP_PRODUCTS } from '../data/shopProducts';
import { ShopProduct } from '../types';
import { useApp } from '../context/AppContext';

export const Shop: React.FC = () => {
  const { addToast } = useApp();
  const [activePlanModal, setActivePlanModal] = useState<ShopProduct | null>(null);

  const handleAction = (product: ShopProduct) => {
    setActivePlanModal(product);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Plans & Pro Outreach Packs
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Supercharge your campaigns with proven high-converting template packs, enterprise consultations, and domain audits.
        </p>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SHOP_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${product.highlighted
              ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl border-2 border-purple-400/50'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm'
              }`}
          >
            {product.badge && (
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 shadow-md">
                {product.badge}
              </span>
            )}

            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold mb-1">{product.name}</h2>
                <p
                  className={`text-xs ${product.highlighted ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  {product.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 mb-5 pb-4 border-b border-slate-200/40 dark:border-slate-800">
                <span className="text-3xl font-black">{product.price}</span>
                {product.period && (
                  <span
                    className={`text-xs ${product.highlighted ? 'text-purple-300' : 'text-slate-400'
                      }`}
                  >
                    / {product.period}
                  </span>
                )}
              </div>

              {/* Features list */}
              <ul className="space-y-2.5 mb-6 text-xs">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 shrink-0 mt-0.5 ${product.highlighted ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                    />
                    <span
                      className={
                        product.highlighted ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'
                      }
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleAction(product)}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${product.highlighted
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950'
                : product.ctaType === 'buy'
                  ? 'bg-[#2F6B2F] hover:bg-emerald-800 text-white'
                  : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                }`}
            >
              {product.ctaType === 'buy' ? (
                <Zap className="w-4 h-4" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>{product.ctaText}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Plan / Inquiry Modal */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActivePlanModal(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {activePlanModal.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activePlanModal.description}
            </p>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300">
                Selected Option: {activePlanModal.price} ({activePlanModal.period || 'Access'})
              </div>
              <p>
                EstechScoutier is completely free and client-side! Optional paid packs support continuous open-source maintenance.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Your contact email or company handle"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActivePlanModal(null)}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  addToast('success', `Inquiry registered for ${activePlanModal.name}!`);
                  setActivePlanModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#2F6B2F] hover:bg-emerald-800 text-white"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

