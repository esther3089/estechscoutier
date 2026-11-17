import React from 'react';
import { SearchFilterBar } from '../components/home/SearchFilterBar';
import { BulkMailForm } from '../components/home/BulkMailForm';
import { UploadCard } from '../components/home/UploadCard';
import { TemplatesCard } from '../components/home/TemplatesCard';
import { ScheduleCard } from '../components/home/ScheduleCard';
import { CampaignStatsCard } from '../components/home/CampaignStatsCard';
import { GeneratedEmailsCard } from '../components/home/GeneratedEmailsCard';
import { AnalyticsCard } from '../components/home/AnalyticsCard';

export const Home: React.FC = () => {
  return (
    <div className="space-y-2">
      {/* 1. Search and filter bar (sticky) */}
      <SearchFilterBar />

      {/* 2. Bulk Mail Send Form Card */}
      <BulkMailForm />

      {/* 3. Upload CSV or TXT Card */}
      <UploadCard />

      {/* 4. Email Templates Card */}
      <TemplatesCard />

      {/* 5. Email Schedule Card */}
      <ScheduleCard />

      {/* 6. Campaign Stats Gradient Card */}
      <CampaignStatsCard />

      {/* 7. Generated Emails Virtualized Card */}
      <GeneratedEmailsCard />

      {/* 8. Email Analytics Doughnut & Domains Card */}
      <AnalyticsCard />
    </div>
  );
};

