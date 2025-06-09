import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Supplier } from './types';

interface FastSearchResultsPanelProps {
  suppliers: Supplier[];
  status: string | null;
  loading: boolean;
}

const FastSearchResultsPanel: React.FC<FastSearchResultsPanelProps> = ({
  suppliers,
  status,
  loading
}) => {
  const { t } = useI18n();
  
  // Ajouter des logs pour déboguer
  console.log('FastSearchResultsPanel - Props reçues:', { suppliers, status, loading });
  
  return (
    <div className="mt-6 border rounded-lg bg-white">
      <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">
          {t('fast_search_results.title', 'Fast Search Results')}
        </h2>
        {status && (
          <div className="text-sm">
            {status === 'pending' && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                {t('fast_search_results.status.pending', 'Pending')}
              </span>
            )}
            {status === 'processing' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {t('fast_search_results.status.processing', 'Processing')}
              </span>
            )}
            {status === 'completed' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {t('fast_search_results.status.completed', 'Completed')}
              </span>
            )}
            {status === 'failed' && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                {t('fast_search_results.status.failed', 'Failed')}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {loading && suppliers.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            {t('fast_search_results.loading', 'Loading search results...')}
          </div>
        )}
        
        {!loading && suppliers.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {status === 'completed' 
              ? t('fast_search_results.no_results', 'No suppliers found matching your criteria.')
              : t('fast_search_results.waiting', 'Waiting for search results...')}
          </div>
        )}
        
        {suppliers.length > 0 && (
          <div className="space-y-6">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <h3 className="text-lg font-semibold">{supplier.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{supplier.description}</p>
                
                {supplier.website && (
                  <a 
                    href={supplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {supplier.website}
                  </a>
                )}
                
                {supplier.products && supplier.products.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-2">
                      {t('fast_search_results.products', 'Products')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {supplier.products.map(product => (
                        <div key={product.id} className="bg-gray-50 p-2 rounded text-sm">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-600">{product.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FastSearchResultsPanel;
