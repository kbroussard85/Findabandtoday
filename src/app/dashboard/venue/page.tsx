import React from 'react';
import { InventoryCalendar } from '@/components/venue/InventoryCalendar';
import { AgreementVault } from '@/components/venue/AgreementVault';
import { SubmissionStack } from '@/components/venue/SubmissionStack';
import { UpgradeButton } from '@/components/profile/UpgradeButton';

// Mock data for the submission stack
const MOCK_SUBMISSIONS = [
  { id: '1', band_name: 'Neon Horizon', stats: { followers: '12.4k', avg_draw: '150', payout: '$800' } },
  { id: '2', band_name: 'The Midnight Echo', stats: { followers: '8.2k', avg_draw: '90', payout: '$450' } },
  { id: '3', band_name: 'Crimson Sky', stats: { followers: '24k', avg_draw: '300', payout: '$1200' } }
];

export default async function VenueDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tight text-gray-900">
              Venue <span className="text-indigo-600">Command</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Manage your dates, review submissions, and automate contracts.</p>
          </div>
          <UpgradeButton role="VENUE" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <InventoryCalendar />
            <AgreementVault />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
              <h2 className="text-2xl font-bold mb-4">Pending Submissions</h2>
              <p className="text-gray-500 mb-8 text-sm">Review incoming requests for your selected dates.</p>
              
              <SubmissionStack initialSubmissions={MOCK_SUBMISSIONS} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold mb-4">Past Shows</h2>
              <div className="text-gray-500 text-sm italic">
                Historical payout and attendance data will populate here after your events.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}