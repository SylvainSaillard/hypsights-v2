import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { FileText, Building2, Package, Lightbulb, Users, MapPin, CheckSquare, BarChart2 } from 'lucide-react';

// --- DATA INTERFACES ---
export interface KpiData {
  solutions_count: number;
  companies_count: number;
  products_count: number;
}

export interface StructuredFilter {
  type: string;
  value: string;
}

export interface BriefData {
  title: string;
  created_at: string;
  status: string;
  user_id: string;
}

interface BriefHeaderProps {
  brief: BriefData;
  kpis: KpiData;
  structuredFilters: StructuredFilter[];
  referenceCompanies: string[];
}

// --- UI COMPONENTS ---
const KpiCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center`}>
    <div>
      <div className="flex items-baseline space-x-2">
        <span className="text-4xl font-bold text-white">{value}</span>
      </div>
      <p className="text-slate-400 text-sm">{title}</p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
  </div>
);

const FilterChip: React.FC<{ text: string; icon: React.ReactNode }> = ({ text, icon }) => (
  <div className="flex items-center bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full">
    {icon}
    <span className="ml-1.5">{text}</span>
  </div>
);

const FilterGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-slate-400 mb-3">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  </div>
);

export const BriefHeaderSkeleton: React.FC = () => (
  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl animate-pulse">
    <div className="h-8 bg-slate-700 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-slate-700 rounded w-1/2 mb-8"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="h-24 bg-slate-700 rounded-lg"></div>
      <div className="h-24 bg-slate-700 rounded-lg"></div>
      <div className="h-24 bg-slate-700 rounded-lg"></div>
    </div>
    <div className="h-20 bg-slate-700 rounded-lg"></div>
  </div>
);

const BriefHeader: React.FC<BriefHeaderProps> = ({ brief, kpis, structuredFilters, referenceCompanies }) => {
  const { t } = useI18n();

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'active': return <div className="text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 bg-green-200 text-green-700 rounded-full">{t('status.active', 'Active')}</div>;
      case 'draft': return <div className="text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 bg-yellow-200 text-yellow-700 rounded-full">{t('status.draft', 'Draft')}</div>;
      case 'archived': return <div className="text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 bg-gray-200 text-gray-700 rounded-full">{t('status.archived', 'Archived')}</div>;
      default: return null;
    }
  };

  // Group filters by type
  const filtersByType = structuredFilters.reduce((acc, filter) => {
    if (!acc[filter.type]) {
      acc[filter.type] = [];
    }
    acc[filter.type].push(filter.value);
    return acc;
  }, {} as Record<string, string[]>);

  const filterCardsMeta = {
    geographies: { icon: <MapPin size={14} />, title: t('brief.header.filters.geographies', 'Geographies') },
    organization_types: { icon: <Users size={14} />, title: t('brief.header.filters.organization_types', 'Organization Types') },
    capabilities: { icon: <CheckSquare size={14} />, title: t('brief.header.filters.capabilities', 'Capabilities') },
    maturity: { icon: <BarChart2 size={14} />, title: t('brief.header.filters.maturity', 'Maturity') },
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl text-white">
      {/* Main Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{brief.title}</h1>
          <div className="flex items-center text-slate-400 text-sm space-x-4">
            <span>{new Date(brief.created_at).toLocaleDateString()}</span>
            {getStatusPill(brief.status)}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <KpiCard title={t('brief.header.kpi.solutions', 'Solutions')} value={kpis.solutions_count} icon={<Lightbulb />} color="bg-purple-500/30" />
          <KpiCard title={t('brief.header.kpi.companies', 'Companies')} value={kpis.companies_count} icon={<Building2 />} color="bg-sky-500/30" />
          <KpiCard title={t('brief.header.kpi.products', 'Products')} value={kpis.products_count} icon={<Package />} color="bg-amber-500/30" />
        </div>
      </div>
      {referenceCompanies && referenceCompanies.length > 0 &&
        <FilterGroup title={t('brief.header.filters.reference_companies', 'Reference Companies')}>
          {referenceCompanies.map(company => <FilterChip key={company} text={company} icon={<FileText size={14} />} />)}
        </FilterGroup>
      }

      {/* Structured Filters */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(filtersByType).map(([key, items]) => {
            const meta = filterCardsMeta[key as keyof typeof filterCardsMeta];
            if (!meta || items.length === 0) return null;
            return (
              <FilterGroup key={key} title={meta.title}>
                {items.map(item => <FilterChip key={item} text={item} icon={meta.icon} />)}
              </FilterGroup>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BriefHeader;
