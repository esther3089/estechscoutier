import React from 'react';
import { Video, Clock, Tag, Play } from 'lucide-react';
import { TUTORIAL_VIDEOS } from '../data/videos';

export const Videos: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
            <Video className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Video Tutorials & Masterclasses
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Watch quick visual guides on setting up high-speed outreach batches on mobile devices and managing large lists.
        </p>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TUTORIAL_VIDEOS.map((video) => (
          <div
            key={video.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* 16:9 Aspect Ratio Embed */}
            <div className="relative w-full pb-[56.25%] bg-black">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Video Details */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                    {video.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </span>
                </div>

                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {video.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {video.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

