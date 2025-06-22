import { QuotaWarning } from '../components/QuotaWarning';
import { HeroSection } from '../components/HeroSection';
import { KPIDashboard } from '../components/KPIDashboard';
import { BriefUsageInsights } from '../components/BriefUsageInsights';
import { RecentActivity } from '../components/RecentActivity';
import { YourBriefsSection } from '../components/YourBriefsSection';
import { ActivityGraph } from '../components/ActivityGraph';
import { DeepSearchCTA } from '../components/DeepSearchCTA';

const kpiData = {
  activeBriefs: 15,
  completedBriefs: 12,
  productsFound: 87,
  suppliersFound: 24,
  solutionsDetected: 42,
  quotaUsage: {
    used: 18,
    total: 30,
  },
};

const briefUsageData = {
  totalSearches: 18,
  maxSearches: 30,
  fastSearches: 15,
  deepSearches: 3,
  popularSectors: [{ name: 'Sustainable mobility', count: 8 }],
};

const recentActivityData = [
  {
    id: '1',
    type: 'brief_created' as const,
    title: 'Brief created: Looking for fast electric charging solutions',
    timestamp: 'Today, 10:23 AM',
    brief_id: '123',
  },
  {
    id: '2',
    type: 'supplier_viewed' as const,
    title: 'Viewed supplier: Supplier A',
    timestamp: 'Yesterday, 2:45 PM',
    supplier_id: '456',
  },
  {
    id: '3',
    type: 'status_change' as const,
    title: 'Brief \'Industrial water filtration\' moved to Deep Search',
    timestamp: 'May 10, 2025',
    brief_id: '789',
  },
];

const briefsData = [
  {
    id: '1',
    title: 'Innovative CRM Solution for SMBs',
    description: 'Find a CRM that integrates seamlessly with existing tools and scales with growth',
    status: 'draft' as const,
    sector: 'Technology',
    budget: '$50k - $100k',
    createdDays: 10,
    fastSearches: 3,
  },
  {
    id: '2',
    title: 'High-Performance Laptops for Engineering Team',
    description: 'Equip our 30-person engineering team with powerful and reliable laptops',
    status: 'deep-waiting' as const,
    sector: 'Hardware',
    budget: '$20k - $50k',
    createdDays: 5,
    hasNewResults: true,
    updates: {
      newCompanies: 12,
      newProducts: 18,
      newSolutions: 6,
    },
    fastSearches: 7,
  },
  {
    id: '3',
    title: 'Enterprise Data Integration Platform',
    description: 'Find a robust data integration platform that connects legacy systems with cloud services',
    status: 'deep-waiting' as const,
    sector: 'Enterprise Software',
    budget: '$100k - $250k',
    createdDays: 15,
    hasNewResults: true,
    updates: {
      newCompanies: 8,
      newProducts: 12,
      newSolutions: 5,
    },
    fastSearches: 12,
  },
];

const activityGraphData = {
  data: [
    { name: 'Mon', briefs: 2, searches: 3, deepSearches: 1 },
    { name: 'Tue', briefs: 1, searches: 2, deepSearches: 1 },
    { name: 'Wed', briefs: 3, searches: 4, deepSearches: 2 },
    { name: 'Thu', briefs: 2, searches: 2, deepSearches: 1 },
    { name: 'Fri', briefs: 2, searches: 3, deepSearches: 0 },
    { name: 'Sat', briefs: 1, searches: 1, deepSearches: 0 },
  ],
  weeklyChange: {
    briefs: 27,
    searches: 15,
    deepSearches: -8,
  },
};

export function DashboardPage() {
  const quotaReached = kpiData.quotaUsage.used >= kpiData.quotaUsage.total;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-4 sm:p-6 lg:p-8">
        <QuotaWarning quotaReached={quotaReached} />
        <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Find the best suppliers for your projects with ease.</p>
          </div>
          <HeroSection isQuotaReached={quotaReached} />
        </div>

        <div className="mt-6">
          <KPIDashboard kpis={kpiData} />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <BriefUsageInsights data={briefUsageData} />
              <RecentActivity activities={recentActivityData} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <YourBriefsSection briefs={briefsData} />
          </div>
        </div>

        <div className="mt-6">
          <ActivityGraph data={activityGraphData.data} weeklyChange={activityGraphData.weeklyChange} />
        </div>

        <div className="mt-6">
          <DeepSearchCTA />
        </div>
      </div>
    </div>
  );
}
