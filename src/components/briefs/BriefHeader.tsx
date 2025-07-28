import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Building2, MapPin, ChevronDown, Lightbulb, Package, Star, TrendingUp, Users, Wrench, BarChart2 } from 'lucide-react';
import { useEdgeFunction } from '@/hooks/useEdgeFunction';

interface BriefHeaderProps {
    briefId: string;
}

interface BriefHeaderData {
    id: string;
    title: string;
    description: string;
    created_at: string;
    solutions_count: number;
    suppliers_count: number;
    products_count: number;
    fast_searches_used?: number;
    geographies: string[];
    organization_types: string[];
    capabilities: string[];
    maturity: string[];
    reference_companies: string[];
}

const KpiCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg flex items-center" style={{ borderLeft: `3px solid ${color}` }}>
        <div className="mr-4" style={{ color }}>{icon}</div>
        <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-gray-400">{title}</div>
        </div>
    </div>
);

const StructuredFilterCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center text-sm font-semibold text-gray-300 mb-3">
            {icon}
            <span className="ml-2">{title}</span>
        </div>
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <span key={index} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
                    {item}
                </span>
            ))}
        </div>
    </div>
);

const BriefHeader: React.FC<BriefHeaderProps> = ({ briefId }) => {
    const { t } = useI18n();
    const [detailsVisible, setDetailsVisible] = useState(false);

    const { data: briefDataPayload, loading, error } = useEdgeFunction(
        'brief-operations',
        { action: 'get_brief', brief_id: briefId },
        { method: 'POST' }
    );

    console.log('BriefHeader data received:', briefDataPayload); // DEBUG LOG

    if (loading) return <div className="p-4 bg-gray-800 rounded-lg animate-pulse"></div>;
    if (error) return <div className="p-4 bg-red-900 text-white rounded-lg">Error fetching brief data.</div>;
    if (!briefDataPayload || !briefDataPayload.brief) return null;

    const { brief: headerData }: { brief: BriefHeaderData } = briefDataPayload;

    const { 
        title, 
        description, 
        created_at, 
        solutions_count, 
        suppliers_count, 
        products_count, 
        fast_searches_used, 
        geographies, 
        organization_types, 
        capabilities, 
        maturity, 
        reference_companies 
    } = headerData;

    const filterCards = [
        { key: 'geographies', title: t('brief.header.filters.geographies', 'Geographies'), items: geographies, icon: <MapPin size={16} /> },
        { key: 'organization_types', title: t('brief.header.filters.organization_types', 'Organization Types'), items: organization_types, icon: <Users size={16} /> },
        { key: 'capabilities', title: t('brief.header.filters.capabilities', 'Capabilities'), items: capabilities, icon: <Wrench size={16} /> },
        { key: 'maturity', title: t('brief.header.filters.maturity', 'Maturity'), items: maturity, icon: <TrendingUp size={16} /> },
    ];

    return (
        <div className="bg-gray-800/30 p-6 rounded-lg mb-8">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="text-sm text-gray-400">Created on {new Date(created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KpiCard title={t('brief.header.kpi.companies', 'Companies')} value={suppliers_count} icon={<Building2 size={20} className="text-blue-200" />} color="#2563eb40" />
                <KpiCard title={t('brief.header.kpi.products', 'Products')} value={products_count} icon={<Package size={20} className="text-purple-200" />} color="#7c3aed40" />
                <KpiCard title={t('brief.header.kpi.solutions', 'Solutions')} value={solutions_count} icon={<Lightbulb size={20} className="text-amber-200" />} color="#d9770640" />
                <KpiCard title={t('brief.header.kpi.fast_searches', 'Fast Searches')} value={fast_searches_used ?? 0} icon={<BarChart2 size={20} className="text-green-200" />} color="#16a34a40" />
            </div>

            {reference_companies && reference_companies.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                        <Star size={16} className="mr-2 text-amber-400" />
                        Reference Companies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {reference_companies.map((company, index) => (
                            <span key={index} className="bg-gray-700/50 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {filterCards.map(card => (
                    card.items && card.items.length > 0 && <StructuredFilterCard key={card.key} title={card.title} items={card.items} icon={card.icon} />
                ))}
            </div>

            <div className="border-t border-gray-700/50 pt-4">
                <button 
                    onClick={() => setDetailsVisible(!detailsVisible)} 
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                >
                    {detailsVisible ? 'Hide' : 'Show'} Brief Details
                    <ChevronDown size={16} className={`ml-1 transition-transform ${detailsVisible ? 'rotate-180' : ''}`} />
                </button>
                {detailsVisible && (
                    <div className="mt-4 prose prose-invert max-w-none text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }} />
                )}
            </div>
        </div>
    );
};

export default BriefHeader;
