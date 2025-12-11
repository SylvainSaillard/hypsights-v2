import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Package, Sparkles, HelpCircle } from 'lucide-react';
import type { SupplierGroup } from '../../types/supplierTypes';
import { useSupplierGroups } from '../../hooks/useSupplierGroups';
import { useSupplierProducts } from '../../hooks/useSupplierProducts';
import StarRating from '../../components/suppliers/StarRating';
import ScoringTransparencyModal from '../../components/suppliers/ScoringTransparencyModal';
import { useI18n } from '../../contexts/I18nContext';

const SupplierDetailPage: React.FC = () => {
  const { supplierId, briefId } = useParams<{ supplierId: string; briefId: string }>();
  const navigate = useNavigate();
  const { supplierGroups, isLoading } = useSupplierGroups({ briefId: briefId || '' });
  const [supplier, setSupplier] = useState<SupplierGroup | null>(null);
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState(false);
  const { t } = useI18n();
  
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
        {/* Hero Section - Aligned with SupplierCard */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 mb-8 overflow-hidden">
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {supplier.supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {supplier.supplier.name}
                    </h1>
                  </div>
                </div>
                
                <p className="text-blue-100 text-lg leading-relaxed max-w-3xl mb-4">
                  {supplier.supplier.overview || supplier.supplier.description || 'No description available'}
                </p>
                
                {/* Badges d'informations */}
                <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <span>{getRegionFlag(supplier.supplier.region)}</span>
                    <span className="text-white">{supplier.supplier.country || supplier.supplier.region || 'Global'}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <span>{getCompanySizeIcon(supplier.supplier.company_size)}</span>
                    <span className="text-white">{supplier.supplier.company_size || supplier.supplier.company_type || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <span>📋</span>
                    <span className="text-white">{supplier.total_products} {supplier.total_products === 1 ? 'Product' : 'Products'}</span>
                  </div>
                  {supplier.supplier.url && (
                    <a
                      href={supplier.supplier.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-300/30 rounded-full px-4 py-1.5 hover:from-blue-500/30 hover:to-indigo-500/30 hover:border-blue-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span className="text-blue-200">🌐</span>
                      <span className="font-medium text-blue-100">Visit Website</span>
                      <svg className="w-3 h-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc Solution Associée */}
        {supplier.solutions && supplier.solutions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-800">Found for Solution</h3>
            </div>
            
            <div className="space-y-4">
              {supplier.solutions.map((solution, index) => (
                <div key={solution.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {solution.solution_number || index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">
                          Solution {solution.solution_number || index + 1}: {solution.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            solution.status === 'validated' 
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : solution.status === 'proposed'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {solution.status === 'validated' ? '✓ Validated' : 
                             solution.status === 'proposed' ? '💡 Proposed' : 
                             solution.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description de la solution */}
                  {solution.description && (
                    <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">📝</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800 mb-2">Solution Description</div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {solution.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis Section - Aligned with SupplierCard */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-800">{t('supplier.detailed_analysis', 'Analyse Détaillée')}</h3>
            </div>
            {/* Icône de transparence */}
            {supplier.scores.scoring_reasoning && (
              <button
                onClick={() => setIsTransparencyModalOpen(true)}
                className="p-2 hover:bg-indigo-100 rounded-full transition-colors group"
                title={t('supplier.scoring_transparency', 'Transparence du Score')}
              >
                <HelpCircle size={20} className="text-indigo-600 group-hover:text-indigo-800" />
              </button>
            )}
          </div>
          
          {/* AI Hypsights Analysis */}
          {supplier.ai_explanation && (
            <div className="mb-6 pb-6 border-b border-gray-300">
              {/* Badge AI Hypsights Analysis */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-full px-4 py-2">
                  <Sparkles size={16} className="text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">
                    AI Hypsights Analysis
                  </span>
                </div>
              </div>
              
              {/* Texte de l'analyse */}
              <p className="text-base text-gray-700 italic leading-relaxed">
                {supplier.ai_explanation}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Adéquation Produit/Brief - 5 étoiles avec explication */}
            {supplier.scores.score_produit_brief !== undefined && (
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <StarRating 
                  score={supplier.scores.score_produit_brief} 
                  maxStars={5} 
                  label={t('supplier.product_fit', 'Adéquation Produit')}
                  explanation={supplier.scores.score_produit_brief_explanation}
                  learnMoreLabel={t('supplier.learn_more', 'En savoir plus')}
                  hideLabel={t('supplier.hide', 'Masquer')}
                />
              </div>
            )}
            
            {/* Fiabilité Entreprise - 5 étoiles avec explication */}
            {supplier.scores.score_fiabilite !== undefined && (
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <StarRating 
                  score={supplier.scores.score_fiabilite} 
                  maxStars={5} 
                  label={t('supplier.company_reliability', 'Fiabilité Entreprise')}
                  explanation={supplier.scores.score_fiabilite_explanation}
                  learnMoreLabel={t('supplier.learn_more', 'En savoir plus')}
                  hideLabel={t('supplier.hide', 'Masquer')}
                />
              </div>
            )}
            
            {/* Critères Stricts - 3 étoiles avec explication */}
            {supplier.scores.score_criteres !== undefined && (
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <StarRating 
                  score={supplier.scores.score_criteres} 
                  maxStars={3} 
                  label={t('supplier.strict_criteria', 'Critères Stricts')}
                  explanation={supplier.scores.score_criteres_explanation}
                  learnMoreLabel={t('supplier.learn_more', 'En savoir plus')}
                  hideLabel={t('supplier.hide', 'Masquer')}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de transparence du scoring */}
        <ScoringTransparencyModal
          isOpen={isTransparencyModalOpen}
          onClose={() => setIsTransparencyModalOpen(false)}
          scoringReasoning={supplier.scores.scoring_reasoning}
          title={t('supplier.scoring_transparency', 'Transparence du Score')}
        />

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
              {products
                .sort((a, b) => {
                  // Normaliser les scores : si <= 1, c'est l'ancien format (0-1), sinon c'est le nouveau (0-100)
                  const normalizeScore = (score: number) => score <= 1 ? Math.round(score * 100) : Math.round(score);
                  const avgScoreA = Math.round((normalizeScore(a.ai_solution_fit_score || 0) + normalizeScore(a.ai_brief_fit_score || 0)) / 2);
                  const avgScoreB = Math.round((normalizeScore(b.ai_solution_fit_score || 0) + normalizeScore(b.ai_brief_fit_score || 0)) / 2);
                  return avgScoreB - avgScoreA;
                })
                .map((product) => (
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
                  
                  {/* Maturité Produit */}
                  {product.maturity && (
                    <div className="mb-4">
                      <h6 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                        <span>📊</span> Product Maturity
                      </h6>
                      <div className="inline-flex">
                        {/* Affichage du critère unique sélectionné */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-50 transition-all">
                          <span className="text-lg">
                            {product.maturity === 'commercial' ? '🏪' : 
                             product.maturity === 'prototype' ? '🔧' : '🔬'}
                          </span>
                          <div className="text-xs">
                            <div className="font-medium text-blue-800">
                              {product.maturity === 'commercial' ? 'Commercial' : 
                               product.maturity === 'prototype' ? 'Prototype' : 'Research'}
                            </div>
                            <div className="text-xs text-blue-600">
                              {product.maturity === 'commercial' ? 'Ready-to-market' : 
                               product.maturity === 'prototype' ? 'Working demos' : 'Early-stage'}
                            </div>
                          </div>
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Encarts IA avec affichage intelligent */}
                  {(() => {
                    // Normaliser les scores : si <= 1, c'est l'ancien format (0-1), sinon c'est le nouveau (0-100)
                    const normalizeScore = (score: number) => score <= 1 ? Math.round(score * 100) : Math.round(score);
                    const solutionScore = normalizeScore(product.ai_solution_fit_score || 0);
                    const briefScore = normalizeScore(product.ai_brief_fit_score || 0);
                    const scoreDifference = Math.abs(solutionScore - briefScore);
                    const showBothScores = scoreDifference >= 50; // Seuil de 50% d'écart
                    
                    if (showBothScores) {
                      // Afficher les deux encarts avec un indicateur d'écart
                      return (
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">⚠</span>
                              </div>
                              <p className="text-amber-800 text-xs font-medium">
                                Significant difference detected ({scoreDifference}% gap) - showing detailed analysis
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-blue-900 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-black text-xs font-bold">AI</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-blue-200 text-xs font-medium">Solution Fit Analysis</div>
                                  {solutionScore > 0 && (
                                    <div className="bg-blue-400 text-blue-900 px-2 py-0.5 rounded text-xs font-bold">
                                      {solutionScore}%
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
                                  {briefScore > 0 && (
                                    <div className="bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded text-xs font-bold">
                                      {briefScore}%
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
                      );
                    } else {
                      // Afficher uniquement le Solution Fit avec un design unifié
                      const avgScore = Math.round((solutionScore + briefScore) / 2);
                      return (
                        <div className="space-y-3">
                          <div className="bg-gradient-to-r from-blue-900 to-emerald-900 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-black text-xs font-bold">AI</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-blue-100 text-xs font-medium flex items-center gap-2">
                                    Overall Fit Analysis
                                  </div>
                                  {avgScore > 0 && (
                                    <div className="bg-gradient-to-r from-blue-400 to-emerald-400 text-gray-900 px-2 py-0.5 rounded text-xs font-bold">
                                      {avgScore}%
                                    </div>
                                  )}
                                </div>
                                <p className="text-blue-100 text-xs leading-relaxed">
                                  {product.ai_solution_fit_explanation || 
                                   'This product shows excellent alignment with both your solution requirements and brief specifications.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                  
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
