import React, { useState } from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';
import { AlertTriangle, BarChart2, Building2, CheckSquare, ChevronDown, FileText, Lightbulb, MapPin, Package, Star, TrendingUp, Users, Wrench } from 'lucide-react';

// --- TYPE INTERFACES ---
interface BriefHeaderProps {
    briefId: string;
}

interface BriefHeaderData {
    title: string;
    description: string;
    created_at: string;
    solutions_count: number;
    suppliers_count: number;
    products_count: number;
    fast_searches_used?: number; // Ajout du champ
    geographies: string[];
    organization_types: string[];
    capabilities: string[];
    maturity: string[];
    reference_companies?: string[];
    goals?: string;
    timeline?: string;
    budget?: string;
    key_questions?: string[];
    nda_required?: boolean;
    report_format?: string;
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
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: color }}>
            {icon}
        </div>
    </div>
);

const FilterGroup: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
    <div className="mb-8">
        <div className="flex items-center mb-3 text-slate-400">
            {icon}
            <h3 className="ml-2 font-semibold text-sm text-slate-300">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
            {items.map(item => (
                <span key={item} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                    {item}
                </span>
            ))}
        </div>
    </div>
);

const StructuredFilterCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex items-center mb-3 text-slate-400">
            {icon}
            <h4 className="ml-2 font-semibold text-sm text-slate-300">{title}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
            {items.map(item => (
                <span key={item} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                    {item}
                </span>
            ))}
        </div>
    </div>
);

const BriefHeaderSkeleton: React.FC = () => (
    <div className="animate-pulse bg-slate-900 p-6 rounded-lg mb-6">
        <div className="h-8 bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="h-24 bg-slate-800 rounded-xl"></div>
            <div className="h-24 bg-slate-800 rounded-xl"></div>
            <div className="h-24 bg-slate-800 rounded-xl"></div>
        </div>
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-slate-800 rounded-xl"></div>
            <div className="h-28 bg-slate-800 rounded-xl"></div>
            <div className="h-28 bg-slate-800 rounded-xl"></div>
            <div className="h-28 bg-slate-800 rounded-xl"></div>
        </div>
    </div>
);

const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; value?: string | boolean | string[] | null }> = ({ icon, label, value }) => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  const displayValue = Array.isArray(value)
    ? value.join(', ')
    : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  return (
    <div className="py-2 grid grid-cols-3 gap-4 items-start">
      <dt className="col-span-1 text-sm font-medium text-gray-400 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </dt>
      <dd className="col-span-2 mt-0 text-sm text-white whitespace-pre-wrap">{displayValue}</dd>
    </div>
  );
};

const BriefHeader: React.FC<BriefHeaderProps> = ({ briefId }) => {
    const { t } = useI18n();
    const [detailsVisible, setDetailsVisible] = useState(false);

  const { data, loading, error } = useEdgeFunction('brief-header-data', 
    { brief_id: briefId }, 
    { 
      method: 'POST',
      enabled: !!briefId, // Only run query if briefId is available
    }
  );

    if (loading) return <BriefHeaderSkeleton />;
    
    if (error) return (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6" role="alert">
            <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-3" />
                <p className="font-semibold">{t('brief.header.error.title', 'Failed to load brief data')}: {error}</p>
            </div>
        </div>
    );

    const headerData = data?.data as BriefHeaderData | undefined;

    if (!headerData) return null;

    const { title, description, created_at, solutions_count, suppliers_count, products_count, fast_searches_used, geographies, organization_types, capabilities, maturity, reference_companies } = headerData;

    const filterCards = [
        { key: 'geographies', title: t('brief.header.filters.geographies', 'Geographies'), items: geographies, icon: <MapPin size={16} /> },
        { key: 'organization_types', title: t('brief.header.filters.organization_types', 'Organization Types'), items: organization_types, icon: <Building2 size={16} /> },
        { key: 'capabilities', title: t('brief.header.filters.capabilities', 'Capabilities'), items: capabilities, icon: <CheckSquare size={16} /> },
        { key: 'maturity', title: t('brief.header.filters.maturity', 'Maturity'), items: maturity, icon: <BarChart2 size={16} /> }
    ];

    return (
        <div className="bg-slate-900 p-6 rounded-xl mb-6 border border-slate-800">
            <div className="flex items-center mb-1">
                <FileText className="text-green-400 mr-3" size={28} />
                <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            <p className="text-slate-400 text-sm mb-6 ml-10">{new Date(created_at).toLocaleDateString()}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KpiCard title={t('brief.header.kpi.companies', 'Companies')} value={suppliers_count} icon={<Building2 size={20} className="text-blue-200" />} color="#2563eb40" />
                <KpiCard title={t('brief.header.kpi.products', 'Products')} value={products_count} icon={<Package size={20} className="text-purple-200" />} color="#7c3aed40" />
                <KpiCard title={t('brief.header.kpi.solutions', 'Solutions')} value={solutions_count} icon={<Lightbulb size={20} className="text-amber-200" />} color="#d9770640" />
                <KpiCard title={t('brief.header.kpi.fast_searches', 'Fast Searches')} value={fast_searches_used ?? 0} icon={<BarChart2 size={20} className="text-green-200" />} color="#16a34a40" />
            </div>

            {reference_companies && reference_companies.length > 0 && (
                <FilterGroup title={t('brief.header.reference_companies', 'Reference Companies')} items={reference_companies} icon={<Users size={16} />} />
            )}

            <div>
                <div className="flex items-center mb-3 text-slate-400">
                    <CheckSquare size={16} />
                    <h3 className="ml-2 font-semibold text-sm text-slate-300">{t('brief.header.structured_filters', 'Structured Filters')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filterCards.map(({ key, ...cardProps }) => (
                        cardProps.items && cardProps.items.length > 0 && <StructuredFilterCard key={key} {...cardProps} />
                    ))}
                </div>
            </div>

            {/* Collapsible Brief Details */}
            <div className="mt-8 border-t border-slate-800 pt-6">
                <button
                    onClick={() => setDetailsVisible(!detailsVisible)}
                    className="flex justify-between items-center w-full text-left text-slate-300 hover:text-white transition-colors"
                >
                    <h3 className="font-semibold text-sm">
                        {t('brief.header.details.title', 'Brief Details')}
                    </h3>
                    <ChevronDown
                        size={20}
                        className={`text-slate-400 transform transition-transform ${detailsVisible ? 'rotate-180' : ''}`}
                    />
                </button>

                {detailsVisible && (
                    <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {description && <DetailItem icon={<FileText size={16} />} label={t('brief.header.details.description', 'Description')} value={description} />}
                      {geographies && geographies.length > 0 && <DetailItem icon={<MapPin size={16} />} label={t('brief.header.structured_filters.geographies', 'Geographies')} value={geographies} />}
                      {organization_types && organization_types.length > 0 && <DetailItem icon={<Building2 size={16} />} label={t('brief.header.structured_filters.organization_types', 'Organization Types')} value={organization_types} />}
                      {capabilities && capabilities.length > 0 && <DetailItem icon={<Wrench size={16} />} label={t('brief.header.structured_filters.capabilities', 'Capabilities')} value={capabilities} />}
                      {maturity && maturity.length > 0 && <DetailItem icon={<TrendingUp size={16} />} label={t('brief.header.structured_filters.maturity', 'Maturity')} value={maturity} />}
                      {reference_companies && reference_companies.length > 0 && <DetailItem icon={<Star size={16} />} label={t('brief.header.reference_companies', 'Reference Companies')} value={reference_companies} />}
                    </dl>
                )}
            </div>
        </div>
    );
};

export default BriefHeader;
