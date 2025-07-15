import React, { useState } from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';
import { AlertTriangle, Building2, ChevronDown, FileText, Lightbulb, MapPin, Package, Star, TrendingUp, Wrench, Users } from 'lucide-react';

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

// --- SUB-COMPONENTS (for internal use) ---

const KpiCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-slate-800/80 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-700/80">
        <div style={{ backgroundColor: color }} className="w-10 h-10 rounded-full flex items-center justify-center mb-2">
            {icon}
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{title}</span>
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

    const { title, description, created_at, solutions_count, suppliers_count, products_count, geographies, organization_types, capabilities, maturity, reference_companies } = headerData;

    return (
        <div className="bg-slate-900 p-6 rounded-lg mb-6 border border-slate-800">
            <div className="flex items-center mb-1">
                <FileText className="text-green-400 mr-3" size={28} />
                <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            <p className="text-sm text-slate-400 ml-10 mb-6">{t('brief.header.created_on', 'Created on')} {new Date(created_at).toLocaleDateString()}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title={t('brief.header.kpi.companies', 'Companies')} value={suppliers_count} icon={<Users size={20} className="text-sky-200" />} color="#0ea5e940" />
                <KpiCard title={t('brief.header.kpi.products', 'Products')} value={products_count} icon={<Package size={20} className="text-purple-200" />} color="#7c3aed40" />
                <KpiCard title={t('brief.header.kpi.solutions', 'Solutions')} value={solutions_count} icon={<Lightbulb size={20} className="text-amber-200" />} color="#d9770640" />
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6">
                <button
                    onClick={() => setDetailsVisible(!detailsVisible)}
                    className="w-full flex justify-between items-center text-left text-lg font-semibold text-white mb-2"
                >
                    <span>{t('brief.header.details_title', 'Brief Details')}</span>
                    <ChevronDown
                        size={24}
                        className={`transform transition-transform duration-200 ${detailsVisible ? 'rotate-180' : ''}`}
                    />
                </button>

                {detailsVisible && (
                    <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {description && <DetailItem icon={<FileText size={16} />} label={t('brief.header.details.description', 'Description')} value={description} />}
                      {reference_companies && reference_companies.length > 0 && <DetailItem icon={<Star size={16} />} label={t('brief.header.reference_companies', 'Reference Companies')} value={reference_companies} />}
                      {geographies && geographies.length > 0 && <DetailItem icon={<MapPin size={16} />} label={t('brief.header.structured_filters.geographies', 'Geographies')} value={geographies} />}
                      {organization_types && organization_types.length > 0 && <DetailItem icon={<Building2 size={16} />} label={t('brief.header.structured_filters.organization_types', 'Organization Types')} value={organization_types} />}
                      {capabilities && capabilities.length > 0 && <DetailItem icon={<Wrench size={16} />} label={t('brief.header.structured_filters.capabilities', 'Capabilities')} value={capabilities} />}
                      {maturity && maturity.length > 0 && <DetailItem icon={<TrendingUp size={16} />} label={t('brief.header.structured_filters.maturity', 'Maturity')} value={maturity} />}
                    </dl>
                )}
            </div>
        </div>
    );
};

export default BriefHeader;
