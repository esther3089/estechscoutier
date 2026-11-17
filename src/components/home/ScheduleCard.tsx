import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Bell,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ScheduleCard: React.FC = () => {
  const { schedule, updateSchedule, emails, addToast } = useApp();

  // Get current date formatted for date input YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const [dateVal, setDateVal] = useState<string>(todayStr);
  const [timeVal, setTimeVal] = useState<string>(nowTimeStr);
  const [countdown, setCountdown] = useState<string>('');
  const [isPastError, setIsPastError] = useState(false);

  // Parse existing scheduled time if present
  useEffect(() => {
    if (schedule.scheduledTime) {
      const d = new Date(schedule.scheduledTime);
      if (!isNaN(d.getTime())) {
        setDateVal(d.toISOString().slice(0, 10));
        setTimeVal(d.toTimeString().slice(0, 5));
      }
    }
  }, [schedule.scheduledTime]);

  // Request notification permissions
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.warn('Notification permission request error:', err);
      }
    }
  };

  const handleToggleSchedule = async (enabled: boolean) => {
    if (enabled) {
      await requestNotificationPermission();
      const combined = new Date(`${dateVal}T${timeVal}:00`);
      if (combined.getTime() <= Date.now()) {
        setIsPastError(true);
        updateSchedule({ enabled: true, scheduledTime: null });
      } else {
        setIsPastError(false);
        updateSchedule({ enabled: true, scheduledTime: combined.toISOString() });
        addToast('info', `Emails scheduled for ${combined.toLocaleDateString()} at ${combined.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }
    } else {
      setIsPastError(false);
      updateSchedule({ enabled: false, scheduledTime: null });
      setCountdown('');
    }
  };

  const handleDateTimeChange = (newDate: string, newTime: string) => {
    setDateVal(newDate);
    setTimeVal(newTime);
    if (!newDate || !newTime) return;

    const combined = new Date(`${newDate}T${newTime}:00`);
    if (combined.getTime() <= Date.now()) {
      setIsPastError(true);
      updateSchedule({ scheduledTime: null });
    } else {
      setIsPastError(false);
      updateSchedule({ scheduledTime: combined.toISOString() });
    }
  };

  // Live countdown timer & notification trigger
  useEffect(() => {
    if (!schedule.enabled || !schedule.scheduledTime) {
      setCountdown('');
      return;
    }

    const interval = setInterval(() => {
      const target = new Date(schedule.scheduledTime!).getTime();
      const diff = target - Date.now();

      if (diff <= 0) {
        setCountdown('Schedule time reached!');
        clearInterval(interval);

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('EstechScoutier: Scheduled Campaign Ready!', {
            body: `Your outreach session is scheduled to begin now (${emails.length} emails prepared).`,
            icon: '/icons/icon-192.svg',
          });
        }

        addToast('success', 'Scheduled outreach time reached! Start tapping your emails.');

        // Disable schedule once triggered
        updateSchedule({ enabled: false, scheduledTime: null });

        // Scroll to generated list
        const elem = document.getElementById('generated-emails-card');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(
          `${hours.toString().padStart(2, '0')}h ${mins
            .toString()
            .padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule.enabled, schedule.scheduledTime, emails.length, addToast, updateSchedule]);

  const scheduledDateObj = schedule.scheduledTime ? new Date(schedule.scheduledTime) : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6 transition-all">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#2F6B2F] dark:text-emerald-400">
              Email Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set a planned time to begin your outreach session
            </p>
          </div>
        </div>

        {/* Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={schedule.enabled}
            onChange={(e) => handleToggleSchedule(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F6B2F]"></div>
        </label>
      </div>

      {schedule.enabled && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Schedule Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={dateVal}
                onChange={(e) => handleDateTimeChange(e.target.value, timeVal)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Schedule Time
              </label>
              <input
                type="time"
                value={timeVal}
                onChange={(e) => handleDateTimeChange(dateVal, e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Validation Error or Countdown Info */}
          {isPastError ? (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>Please pick a future date and time. Past times cannot be scheduled.</span>
            </div>
          ) : scheduledDateObj ? (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Emails scheduled for {scheduledDateObj.toLocaleDateString()} at{' '}
                  {scheduledDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {countdown && (
                <div className="text-emerald-700 dark:text-emerald-300 font-mono text-sm font-bold pt-1">
                  Starting in: {countdown}
                </div>
              )}
            </div>
          ) : null}

          {/* How scheduling works info box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>How scheduling works:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <li>The browser tab must stay open in background for the timer to trigger.</li>
              <li>You will receive a native system notification when sending time arrives.</li>
              <li>Scheduling is a beta helper feature designed for local sessions.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

