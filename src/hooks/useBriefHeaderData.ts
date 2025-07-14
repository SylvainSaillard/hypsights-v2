import { useEdgeFunction } from './useEdgeFunction';
import { BriefData, KpiData, StructuredFilter } from '../components/briefs/BriefHeader';

interface BriefHeaderData {
  brief: BriefData;
  kpis: KpiData;
  structured_filters: StructuredFilter[];
  reference_companies: string[];
}

export const useBriefHeaderData = (briefId: string | undefined) => {
  const { data, loading, error, refresh } = useEdgeFunction<BriefHeaderData>(
    'get-brief-header-data',
    briefId ? { brief_id: briefId } : {},
    'POST',
    !briefId // Désactiver si briefId n'est pas défini
  );

  return {
    headerData: data,
    isHeaderLoading: loading,
    headerError: error,
    refreshHeaderData: refresh,
  };
};
