import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe, Building2, Users, Package, Star, TrendingUp } from 'lucide-react';
import type { SupplierGroup } from '../../types/supplierTypes';
import { useSupplierGroups } from '../../hooks/useSupplierGroups';
import { useSupplierProducts } from '../../hooks/useSupplierProducts';

const SupplierDetailPage: React.FC = () => {
  const { supplierId, briefId } = useParams<{ supplierId: string; briefId: string }>();
  const navigate = useNavigate();
  const { supplierGroups, isLoading } = useSupplierGroups({ briefId: briefId || '' });
  const [supplier, setSupplier] = useState<SupplierGroup | null>(null);
  
  // Récupérer les vrais produits depuis la table products
  const { products, isLoading: productsLoading } = useSupplierProducts({
    supplierId: supplierId || '',
    briefId: briefId,
    enabled: !!supplierId
  });

  useEffect(() => {
    if (supplierGroups.length > 0 && supplierId) {
      const foundSupplier = supplierGroups.find(sg => sg.supplier.id === supplierId);
      setSupplier(foundSupplier || null);
    }
  }, [supplierGroups, supplierId]);

  const getRegionFlag = (region?: string) => {
    switch (region?.toLowerCase()) {
      case 'europe': return '🇪🇺';
      case 'north america': case 'usa': return '🇺🇸';
      case 'asia': return '🌏';
      case 'africa': return '🌍';
      default: return '🌐';
    }
  };

  const getCompanySizeIcon = (size?: string) => {
    switch (size?.toLowerCase()) {
      case 'startup': return '🚀';
      case 'sme': case 'small': return '🏢';
      case 'large': case 'enterprise': return '🏭';
      default: return '🏢';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Supplier not found</h2>
          <p className="text-gray-600 mb-6">The supplier you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Suppliers</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 mb-8 overflow-hidden">
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                    {supplier.supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {supplier.supplier.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                        <span>{getRegionFlag(supplier.supplier.region)}</span>
                        <span className="text-white">{supplier.supplier.country || supplier.supplier.region || 'Global'}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                        <span>{getCompanySizeIcon(supplier.supplier.company_size)}</span>
                        <span className="text-white">{supplier.supplier.company_size || 'Company'}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                        <Package className="w-4 h-4 text-white" />
                        <span className="text-white">{supplier.total_products} Products</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
                  {supplier.supplier.overview || supplier.supplier.description || 'No description available'}
                </p>
                
                {supplier.supplier.url && (
                  <a
                    href={supplier.supplier.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>

              {/* Score global */}
              <div className="lg:text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text mb-2">
                    {supplier.scores.overall}%
                  </div>
                  <div className="text-white/90 font-medium">Overall Match</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(supplier.scores.overall / 20) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-white/30'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scores détaillés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Solution Fit */}
          {supplier.scores.solution_fit && (
            <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white">Solution Fit</h3>
                  </div>
                  <div className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                    {supplier.scores.solution_fit}%
                  </div>
                </div>
                
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${supplier.scores.solution_fit}%` }}
                  ></div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black text-xs font-bold">AI</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      This supplier demonstrates exceptional alignment with your solution requirements. Their capabilities directly address your core needs with proven expertise and innovative approaches in this domain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Brief Fit */}
          {supplier.scores.brief_fit && (
            <div className="relative bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 rounded-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-8 bg-gradient-to-b from-emerald-400 to-green-400 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white">Brief Fit</h3>
                  </div>
                  <div className="text-2xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text">
                    {supplier.scores.brief_fit}%
                  </div>
                </div>
                
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${supplier.scores.brief_fit}%` }}
                  ></div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black text-xs font-bold">AI</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Outstanding match with your original brief specifications. This supplier meets your stated requirements and project scope with remarkable precision and understanding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Critères d'évaluation */}
        {supplier.scores.criteria_match && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-800">Criteria Assessment</h3>
              <div className="ml-auto text-2xl font-black text-indigo-600">
                {supplier.scores.criteria_match}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Geography */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">Geography</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    (supplier.scores.criteria_match >= 75) ? 'bg-green-500' : 
                    (supplier.scores.criteria_match >= 50) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <p className="text-sm text-gray-600">{supplier.supplier.region || supplier.supplier.country || 'Global presence'}</p>
              </div>

              {/* Company Size */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-gray-800">Company Size</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    (supplier.scores.criteria_match >= 70) ? 'bg-green-500' : 
                    (supplier.scores.criteria_match >= 45) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <p className="text-sm text-gray-600">{supplier.supplier.company_size || 'Mid-market'}</p>
              </div>

              {/* Maturity */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-800">Maturity</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    (supplier.scores.criteria_match >= 65) ? 'bg-green-500' : 
                    (supplier.scores.criteria_match >= 40) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <p className="text-sm text-gray-600">Well-established</p>
              </div>

              {/* Organization */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-gray-800">Organization</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    (supplier.scores.criteria_match >= 60) ? 'bg-green-500' : 
                    (supplier.scores.criteria_match >= 35) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <p className="text-sm text-gray-600">{supplier.supplier.company_type || 'Private'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section Produits */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            <h3 className="text-2xl font-bold text-gray-800">Products & Solutions</h3>
            <div className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {productsLoading ? 'Loading...' : `${products.length} Products Found`}
            </div>
          </div>

          {productsLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  {/* En-tête du produit avec catégorie et URL */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-bold text-gray-800 text-lg leading-tight">{product.name}</h5>
                        {product.url && (
                          <a 
                            href={product.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      {product.category && (
                        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium inline-block">
                          {product.category}
                        </div>
                      )}
                    </div>
                    {product.price_range && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium ml-3">
                        {typeof product.price_range === 'object' ? 'Pricing Available' : product.price_range}
                      </div>
                    )}
                  </div>
                  
                  {/* Tags si disponibles */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                      {product.tags.length > 4 && (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                          +{product.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {product.product_description || 'No description available'}
                  </p>
                  
                  {/* Features enrichies du scraping */}
                  {product.features && (
                    <div className="mb-4">
                      <h6 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                        <span>🔧</span> Key Features
                      </h6>
                      <div className="text-xs text-gray-600">
                        {Array.isArray(product.features) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {product.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="leading-relaxed">{feature}</li>
                            ))}
                            {product.features.length > 3 && (
                              <li className="text-gray-500 italic">+{product.features.length - 3} more features</li>
                            )}
                          </ul>
                        ) : typeof product.features === 'object' ? (
                          <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(product.features, null, 2)}
                          </pre>
                        ) : (
                          <p>{product.features}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Encarts IA avec scores réels */}
                  <div className="space-y-3">
                    <div className="bg-blue-900 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-black text-xs font-bold">AI</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-blue-200 text-xs font-medium">Solution Fit Analysis</div>
                            {product.ai_solution_fit_score && (
                              <div className="bg-blue-400 text-blue-900 px-2 py-0.5 rounded text-xs font-bold">
                                {product.ai_solution_fit_score}%
                              </div>
                            )}
                          </div>
                          <p className="text-blue-100 text-xs leading-relaxed">
                            {product.ai_solution_fit_explanation || 
                             'This product directly addresses your solution requirements with innovative features and proven market success.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-900 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-black text-xs font-bold">AI</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-emerald-200 text-xs font-medium">Brief Fit Analysis</div>
                            {product.ai_brief_fit_score && (
                              <div className="bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded text-xs font-bold">
                                {product.ai_brief_fit_score}%
                              </div>
                            )}
                          </div>
                          <p className="text-emerald-100 text-xs leading-relaxed">
                            {product.ai_brief_fit_explanation || 
                             'Excellent alignment with your brief specifications and project timeline requirements.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Données de scraping enrichies */}
                  {product.scraping_data && Object.keys(product.scraping_data).length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h6 className="font-semibold text-gray-700 text-xs mb-2 flex items-center gap-1">
                        <span>📊</span> Additional Data
                      </h6>
                      <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded max-h-20 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(product.scraping_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Footer avec metadata */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(product.created_at).toLocaleDateString()}
                    </p>
                    {product.visual_assets && Object.keys(product.visual_assets).length > 0 && (
                      <div className="text-xs text-blue-600 flex items-center gap-1">
                        <span>🖼️</span> Visual assets available
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-semibold mb-2">No products found</h4>
              <p>This supplier doesn't have any products available for your brief.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailPage;
