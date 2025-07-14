import React from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';
import { FileText, Building2, Package, Lightbulb, Users, MapPin, CheckSquare, BarChart2, AlertTriangle } from 'lucide-react';

// --- TYPE INTERFACES ---
interface BriefHeaderProps {
    briefId: string;
}

interface BriefInfo {
    title: string;
    created_at: string;
}

interface Kpis {
    solutions: number;
    companies: number;
    products: number;
}

interface StructuredFilters {
    geographies: string[];
    organization_types: string[];
    capabilities: string[];
    maturity: string[];
    reference_companies?: string[];
}

interface BriefHeaderData {
    brief: BriefInfo;
    kpis: Kpis;
    structured_filters: StructuredFilters;
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

const BriefHeader: React.FC<BriefHeaderProps> = ({ briefId }) => {
    const { t } = useI18n();
    console.log(`[BriefHeader] Mounting for briefId: ${briefId}. Fetching data...`);

  const { data, loading, error } = useEdgeFunction('brief-header-data', 
    { brief_id: briefId }, 
    'POST'
  );

  console.log('[BriefHeader] Data state:', { briefId, loading, error, data });

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

    const { brief, kpis, structured_filters } = headerData;
    const reference_companies = structured_filters.reference_companies || [];

    const filterCards = [
        { key: 'geographies', title: t('brief.header.filters.geographies', 'Geographies'), items: structured_filters.geographies, icon: <MapPin size={16} /> },
        { key: 'organization_types', title: t('brief.header.filters.organization_types', 'Organization Types'), items: structured_filters.organization_types, icon: <Building2 size={16} /> },
        { key: 'capabilities', title: t('brief.header.filters.capabilities', 'Capabilities'), items: structured_filters.capabilities, icon: <CheckSquare size={16} /> },
        { key: 'maturity', title: t('brief.header.filters.maturity', 'Maturity'), items: structured_filters.maturity, icon: <BarChart2 size={16} /> }
    ];

    return (
        <div className="bg-slate-900 p-6 rounded-lg mb-6 border border-slate-800">
            <div className="flex items-center mb-1">
                <FileText className="text-green-400 mr-3" size={28} />
                <h1 className="text-2xl font-bold text-white">{brief.title}</h1>
            </div>
            <p className="text-slate-400 text-sm mb-6 ml-10">{new Date(brief.created_at).toLocaleDateString()}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <KpiCard title={t('brief.header.kpi.companies', 'Companies')} value={kpis.companies} icon={<Building2 size={20} className="text-blue-200" />} color="#2563eb40" />
                <KpiCard title={t('brief.header.kpi.products', 'Products')} value={kpis.products} icon={<Package size={20} className="text-purple-200" />} color="#7c3aed40" />
                <KpiCard title={t('brief.header.kpi.solutions', 'Solutions')} value={kpis.solutions} icon={<Lightbulb size={20} className="text-amber-200" />} color="#d9770640" />
            </div>

            {reference_companies.length > 0 && (
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
        </div>
    );
};

export default BriefHeader;
