import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  ListOrdered,
  History,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CampaignStatsCard: React.FC = () => {
  const { stats, clearCampaign } = useApp();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleConfirmClear = async () => {
    await clearCampaign();
    setShowConfirmClear(false);
  };

  return (
    <div className="rounded-2xl shadow-md p-4 sm:p-6 mb-6 text-white bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 transition-all">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-white">Campaign Stats</h2>
            <p className="text-xs text-blue-100/80">Real-time outreach session telemetry</p>
          </div>
        </div>

        {stats.totalGenerated > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Clear current campaign list"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 4 Telemetry Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-blue-100 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Sent</span>
          </div>
          <div className="text-2xl font-black tracking-tight">{stats.sent}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-blue-100 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Remaining</span>
          </div>
          <div className="text-2xl font-black tracking-tight">{stats.remaining}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-blue-100 mb-1">
            <ListOrdered className="w-3.5 h-3.5 text-indigo-200" />
            <span>Total Generated</span>
          </div>
          <div className="text-2xl font-black tracking-tight">{stats.totalGenerated}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-blue-100 mb-1">
            <History className="w-3.5 h-3.5 text-cyan-200" />
            <span>Sent (24h)</span>
          </div>
          <div className="text-2xl font-black tracking-tight">{stats.sent24h}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
          <span>Outreach Progress</span>
          <span>{stats.completionRate}% Complete</span>
        </div>
        <div className="w-full bg-black/25 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
          <div
            className="bg-emerald-400 h-2 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowConfirmClear(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 text-slate-800 dark:text-slate-100 shadow-2xl z-10 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">
              Clear Generated Campaign?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              This will remove all {stats.totalGenerated} generated emails from your active campaign.
              Sent history records in the last 24 hours will remain safe.
            </p>
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Yes, Clear List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

