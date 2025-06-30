// src/components/briefs/BriefHeader.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';
import { Building, Package, Lightbulb, MapPin, Users, CheckSquare, BarChart2, Calendar, AlertTriangle } from 'lucide-react';

// --- PROPS INTERFACES ---

interface KpiCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
}

interface StructuredFilterCardProps {
    title: string;
    items: string[];
    icon: React.ReactNode;
}

// --- DATA TYPE INTERFACES ---
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
}

interface BriefHeaderData {
    brief: BriefInfo;
    kpis: Kpis;
    structured_filters: StructuredFilters;
}

// --- UI COMPONENTS ---

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center transition-all hover:shadow-md hover:border-purple-300">
        <div className="bg-purple-100 text-purple-600 p-3 rounded-lg mr-4">
            {icon}
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <div className="text-sm text-gray-500 font-medium">{title}</div>
        </div>
    </div>
);

const StructuredFilterCard: React.FC<StructuredFilterCardProps> = ({ title, items, icon }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center mb-3">
            <div className="text-indigo-600 mr-2">{icon}</div>
            <h4 className="font-semibold text-gray-700">{title}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                    {item}
                </span>
            ))}
        </div>
    </div>
);

const BriefHeaderSkeleton: React.FC = () => (
    <div className="animate-pulse bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
        <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
        <div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-28 bg-gray-200 rounded-xl"></div>
                <div className="h-28 bg-gray-200 rounded-xl"></div>
                <div className="h-28 bg-gray-200 rounded-xl"></div>
                <div className="h-28 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    </div>
);


const BriefHeader: React.FC = () => {
    const { briefId } = useParams<{ briefId: string }>();
    const { t } = useI18n();

    const { data, loading, error } = useEdgeFunction(
        'brief-header-data',
        { briefId },
        'POST'
    );

    if (loading) return <BriefHeaderSkeleton />;
    
    if (error) return (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg shadow-md mb-6" role="alert">
            <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3" />
                <div>
                    <p className="font-bold">{t('brief.header.error.title', 'Failed to load brief data')}</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        </div>
    );

    const headerData = data?.data as BriefHeaderData | undefined;
    const briefInfo = headerData?.brief;
    const kpis = headerData?.kpis;
    const filters = headerData?.structured_filters;

    const filterCards = [
        {
            key: 'geographies',
            title: t('brief.header.filters.geographies', 'Geographies'),
            items: filters?.geographies,
            icon: <MapPin size={20} />
        },
        {
            key: 'organization_types',
            title: t('brief.header.filters.organization_types', 'Organization Types'),
            items: filters?.organization_types,
            icon: <Users size={20} />
        },
        {
            key: 'capabilities',
            title: t('brief.header.filters.capabilities', 'Capabilities'),
            items: filters?.capabilities,
            icon: <CheckSquare size={20} />
        },
        {
            key: 'maturity',
            title: t('brief.header.filters.maturity', 'Maturity'),
            items: filters?.maturity,
            icon: <BarChart2 size={20} />
        }
    ];

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800">{briefInfo?.title || t('brief.header.default_title', 'Brief Details')}</h2>
                {briefInfo?.created_at && (
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Calendar size={14} className="mr-2" />
                        <span>{t('brief.header.created_on', 'Created on')} {new Date(briefInfo.created_at).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <KpiCard title={t('brief.header.kpi.solutions', 'Solutions')} value={kpis?.solutions || 0} icon={<Lightbulb />} />
                <KpiCard title={t('brief.header.kpi.companies', 'Suppliers')} value={kpis?.companies || 0} icon={<Building />} />
                <KpiCard title={t('brief.header.kpi.products', 'Products')} value={kpis?.products || 0} icon={<Package />} />
            </div>

            {/* Structured Filters */}
            {filters && Object.values(filters).some(arr => arr.length > 0) && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">{t('brief.header.structured_filters', 'Structured Filters')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filterCards.map(card => (
                            card.items && card.items.length > 0 && (
                                <StructuredFilterCard key={card.key} title={card.title} items={card.items} icon={card.icon} />
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BriefHeader;
