import React, { useMemo } from 'react';
import { PieChart, Globe2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';

// Register ChartJS modules
ChartJS.register(ArcElement, Tooltip, Legend);

export const AnalyticsCard: React.FC = () => {
  const { emails, stats, settings } = useApp();

  // Top domains computation
  const domainBreakdown = useMemo(() => {
    if (emails.length === 0) return [];

    const counts: Record<string, number> = {};
    for (const item of emails) {
      const parts = item.email.split('@');
      const domain = parts[1]?.toLowerCase();
      if (domain) {
        counts[domain] = (counts[domain] || 0) + 1;
      }
    }

    const sorted = Object.entries(counts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return sorted;
  }, [emails]);

  const maxDomainCount = domainBreakdown.length > 0 ? domainBreakdown[0].count : 1;

  // ChartJS Data
  const chartData = useMemo(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    return {
      labels: ['Sent', 'Remaining'],
      datasets: [
        {
          label: 'Emails',
          data: [stats.sent, stats.remaining],
          backgroundColor: [
            '#F59E0B', // Amber/Orange for Sent
            '#10B981', // Emerald for Remaining
          ],
          borderColor: isDark ? '#0f172a' : '#ffffff',
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [stats.sent, stats.remaining, settings.theme]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct =
              stats.totalGenerated > 0
                ? Math.round((val / stats.totalGenerated) * 100)
                : 0;
            return ` ${context.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6 transition-all">
      <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
          <PieChart className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-base sm:text-lg text-[#2F6B2F] dark:text-emerald-400">
            Email Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time delivery progress & domain distribution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Doughnut Chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            {stats.totalGenerated === 0 ? (
              <div className="w-full h-full rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 font-medium">
                No active list
              </div>
            ) : (
              <>
                <Doughnut data={chartData} options={chartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {stats.completionRate}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Completed
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Email Domains */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            <Globe2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Top Recipient Domains</span>
          </div>

          {domainBreakdown.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No data available
            </div>
          ) : (
            <div className="space-y-2.5">
              {domainBreakdown.map((item) => {
                const pct = Math.round((item.count / stats.totalGenerated) * 100);
                const barWidth = Math.round((item.count / maxDomainCount) * 100);
                return (
                  <div key={item.domain} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-700 dark:text-slate-200 font-medium truncate max-w-[180px]">
                        {item.domain}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

