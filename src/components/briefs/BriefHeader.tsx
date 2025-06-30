// src/components/briefs/BriefHeader.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';

// Placeholder for icons, replace with actual icons from a library like react-icons
const IconCompanies = () => <span>🏢</span>;
const IconProducts = () => <span>📦</span>;
const IconSolutions = () => <span>💡</span>;

interface KpiCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    change?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, change }) => (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center">
        <div className="mr-4">{icon}</div>
        <div>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{title}</div>
        </div>
        {change && <div className="ml-auto text-sm text-green-400">{change}</div>}
    </div>
);

interface StructuredFilterCardProps {
    title: string;
    items: string[];
}

const StructuredFilterCard: React.FC<StructuredFilterCardProps> = ({ title, items }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="font-semibold text-white mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <span key={index} className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm">
                    {item}
                </span>
            ))}
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

    if (loading) return <div>Loading header...</div>;
    if (error) return <div className="text-red-500">Error loading brief data: {error}</div>;

    const headerData = data?.data;
    const briefInfo = headerData?.brief;
    const kpis = headerData?.kpis;
    const filters = headerData?.structured_filters;

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg mb-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">{briefInfo?.title || 'Brief'}</h2>
                <p className="text-sm text-gray-400">{briefInfo?.created_at ? new Date(briefInfo.created_at).toLocaleDateString() : ''}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <KpiCard title={t('brief.header.companies', 'Companies')} value={kpis?.companies || 0} icon={<IconCompanies />} change="+2" />
                <KpiCard title={t('brief.header.products', 'Products')} value={kpis?.products || 0} icon={<IconProducts />} change="+3" />
                <KpiCard title={t('brief.header.solutions', 'Solutions')} value={kpis?.solutions || 0} icon={<IconSolutions />} />
            </div>

            {/* Structured Filters */}
            <div>
                <h3 className="text-xl font-semibold mb-4">{t('brief.header.structured_filters', 'Structured Filters')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filters?.geographies?.length > 0 && <StructuredFilterCard title="Geographies" items={filters.geographies} />}
                    {filters?.organization_types?.length > 0 && <StructuredFilterCard title="Organization Types" items={filters.organization_types} />}
                    {filters?.capabilities?.length > 0 && <StructuredFilterCard title="Capabilities" items={filters.capabilities} />}
                    {filters?.maturity?.length > 0 && <StructuredFilterCard title="Maturity" items={filters.maturity} />}
                </div>
            </div>
        </div>
    );
};

export default BriefHeader;
