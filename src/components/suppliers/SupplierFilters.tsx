import React, { useState, useMemo } from 'react';
import {
  Trophy, Target, ShieldCheck, CheckCircle, Building2, Globe,
  SlidersHorizontal, X, ChevronDown, ChevronUp, MapPin, Building, Package
} from 'lucide-react';
import type { SupplierGroup } from '../../types/supplierTypes';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SupplierFilters {
  badgeTypes: string[];
  countries: string[];
  companySizes: string[];
  hasProducts: boolean;
  minOverallScore: number;
  minProductFit: number;
  minReliability: number;
  minProductScore: number;
  solutionNumber: number | 'all';
}

export const DEFAULT_FILTERS: SupplierFilters = {
  badgeTypes: [],
  countries: [],
  companySizes: [],
  hasProducts: false,
  minOverallScore: 0,
  minProductFit: 0,
  minReliability: 0,
  minProductScore: 0,
  solutionNumber: 'all',
};

interface SupplierFiltersBarProps {
  supplierGroups: SupplierGroup[];
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
  filteredCount: number;
  totalCount: number;
  solutions: { id: string; name: string; number: number }[];
}

// ── Badge config (shared with SupplierBadges) ──────────────────────────────────

const badgeConfig: Record<string, { icon: React.ElementType; label: string; color: string; activeColor: string }> = {
  best_overall:     { icon: Trophy,      label: 'Best Match',          color: 'bg-gray-100 text-gray-500 border-gray-200',   activeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  best_product_fit: { icon: Target,      label: 'Best Product Fit',    color: 'bg-gray-100 text-gray-500 border-gray-200',   activeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  best_reliability: { icon: ShieldCheck, label: 'Most Reliable',       color: 'bg-gray-100 text-gray-500 border-gray-200',   activeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  best_criteria:    { icon: CheckCircle, label: 'Best Criteria Match', color: 'bg-gray-100 text-gray-500 border-gray-200',   activeColor: 'bg-violet-100 text-violet-800 border-violet-300' },
  best_company:     { icon: Building2,   label: 'Strongest Company',   color: 'bg-gray-100 text-gray-500 border-gray-200',   activeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
  best_geography:   { icon: Globe,       label: 'Best Geographic Fit', color: 'bg-gray-100 text-gray-500 border-gray-200',   activeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
};

const companySizeLabels: Record<string, string> = {
  small: 'Small / Startup',
  medium: 'Medium / SME',
  large: 'Large / Enterprise',
};

// ── Component ──────────────────────────────────────────────────────────────────

const SupplierFiltersBar: React.FC<SupplierFiltersBarProps> = ({
  supplierGroups,
  filters,
  onFiltersChange,
  filteredCount,
  totalCount,
  solutions,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Derive available badge types from data
  const availableBadgeTypes = useMemo(() => {
    const types = new Set<string>();
    supplierGroups.forEach(g => {
      g.match_insights?.badges?.forEach(b => types.add(b.type));
    });
    return Array.from(types).filter(t => badgeConfig[t]);
  }, [supplierGroups]);

  // Derive available countries from data
  const availableCountries = useMemo(() => {
    const countMap = new Map<string, number>();
    supplierGroups.forEach(g => {
      const c = g.supplier.country || 'N/A';
      if (c !== 'N/A') countMap.set(c, (countMap.get(c) || 0) + 1);
    });
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count }));
  }, [supplierGroups]);

  // Derive available company sizes
  const availableSizes = useMemo(() => {
    const sizeMap = new Map<string, number>();
    supplierGroups.forEach(g => {
      const s = g.supplier.company_size || 'N/A';
      if (s !== 'N/A') sizeMap.set(s, (sizeMap.get(s) || 0) + 1);
    });
    return Array.from(sizeMap.entries())
      .filter(([size]) => companySizeLabels[size])
      .sort((a, b) => b[1] - a[1])
      .map(([size, count]) => ({ size, count }));
  }, [supplierGroups]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.badgeTypes.length > 0) count++;
    if (filters.countries.length > 0) count++;
    if (filters.companySizes.length > 0) count++;
    if (filters.hasProducts) count++;
    if (filters.minOverallScore > 0) count++;
    if (filters.minProductFit > 0) count++;
    if (filters.minReliability > 0) count++;
    if (filters.minProductScore > 0) count++;
    if (filters.solutionNumber !== 'all') count++;
    return count;
  }, [filters]);

  const update = (partial: Partial<SupplierFilters>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const toggleBadge = (type: string) => {
    const next = filters.badgeTypes.includes(type)
      ? filters.badgeTypes.filter(t => t !== type)
      : [...filters.badgeTypes, type];
    update({ badgeTypes: next });
  };

  const toggleCountry = (country: string) => {
    const next = filters.countries.includes(country)
      ? filters.countries.filter(c => c !== country)
      : [...filters.countries, country];
    update({ countries: next });
  };

  const toggleSize = (size: string) => {
    const next = filters.companySizes.includes(size)
      ? filters.companySizes.filter(s => s !== size)
      : [...filters.companySizes, size];
    update({ companySizes: next });
  };

  const clearAll = () => onFiltersChange({ ...DEFAULT_FILTERS });

  const isFiltered = filteredCount !== totalCount;

  return (
    <div className="mb-6 space-y-4">
      {/* ── Row 1: Solution filter + result count + clear ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Solution dropdown */}
          {solutions.length > 1 && (
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
                value={filters.solutionNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  update({ solutionNumber: v === 'all' ? 'all' : Number(v) });
                }}
              >
                <option value="all">All Solutions</option>
                {solutions.map(s => (
                  <option key={s.id} value={s.number}>
                    Solution {s.number}: {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          )}

          {/* Result count */}
          <span className="text-sm text-gray-500">
            {isFiltered ? (
              <><span className="font-semibold text-blue-600">{filteredCount}</span> of {totalCount} suppliers</>
            ) : (
              <>{totalCount} supplier{totalCount !== 1 ? 's' : ''}</>
            )}
          </span>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={12} />
              Clear filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Row 2: Quick filter chips ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Badge type chips */}
        {availableBadgeTypes.map(type => {
          const cfg = badgeConfig[type];
          if (!cfg) return null;
          const Icon = cfg.icon;
          const active = filters.badgeTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleBadge(type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                active ? cfg.activeColor : cfg.color
              } hover:shadow-sm`}
            >
              <Icon size={14} strokeWidth={2.5} />
              {cfg.label}
            </button>
          );
        })}

        {/* Separator */}
        {availableBadgeTypes.length > 0 && (availableCountries.length > 0 || availableSizes.length > 0) && (
          <div className="w-px h-6 bg-gray-200 mx-1" />
        )}

        {/* Company size chips */}
        {availableSizes.map(({ size, count }) => {
          const active = filters.companySizes.includes(size);
          return (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              } hover:shadow-sm`}
            >
              <Building size={13} />
              {companySizeLabels[size] || size}
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          );
        })}

        {/* Has products toggle */}
        <button
          onClick={() => update({ hasProducts: !filters.hasProducts })}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${
            filters.hasProducts
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          } hover:shadow-sm`}
        >
          <Package size={13} />
          Has Products
        </button>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${
            showAdvanced || filters.minOverallScore > 0 || filters.minProductFit > 0 || filters.minReliability > 0 || filters.minProductScore > 0
              ? 'bg-purple-100 text-purple-800 border-purple-300'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          } hover:shadow-sm`}
        >
          <SlidersHorizontal size={13} />
          Advanced
          {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {(filters.minOverallScore > 0 || filters.minProductFit > 0 || filters.minReliability > 0 || filters.minProductScore > 0) && (
            <span className="bg-purple-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
              {[filters.minOverallScore, filters.minProductFit, filters.minReliability, filters.minProductScore].filter(v => v > 0).length}
            </span>
          )}
        </button>
      </div>

      {/* ── Row 3: Country multi-select (if enough countries) ── */}
      {availableCountries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <MapPin size={14} className="text-gray-400" />
          {availableCountries.slice(0, 12).map(({ country, count }) => {
            const active = filters.countries.includes(country);
            return (
              <button
                key={country}
                onClick={() => toggleCountry(country)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                } hover:shadow-sm`}
              >
                {country}
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
          {availableCountries.length > 12 && (
            <span className="text-xs text-gray-400">+{availableCountries.length - 12} more</span>
          )}
        </div>
      )}

      {/* ── Advanced filters panel ── */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-5 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ScoreSlider
              label="Min Overall Score"
              value={filters.minOverallScore}
              onChange={(v) => update({ minOverallScore: v })}
              color="blue"
            />
            <ScoreSlider
              label="Min Product Fit"
              value={filters.minProductFit}
              onChange={(v) => update({ minProductFit: v })}
              color="emerald"
            />
            <ScoreSlider
              label="Min Reliability"
              value={filters.minReliability}
              onChange={(v) => update({ minReliability: v })}
              color="amber"
            />
            <ScoreSlider
              label="Min Product Score"
              value={filters.minProductScore}
              onChange={(v) => update({ minProductScore: v })}
              color="purple"
              tooltip="Suppliers with at least 1 product scoring ≥ this value"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Score slider sub-component ─────────────────────────────────────────────────

const colorMap: Record<string, { track: string; thumb: string; text: string }> = {
  blue:    { track: 'accent-blue-600',    thumb: 'text-blue-600',    text: 'text-blue-700' },
  emerald: { track: 'accent-emerald-600', thumb: 'text-emerald-600', text: 'text-emerald-700' },
  amber:   { track: 'accent-amber-500',   thumb: 'text-amber-500',   text: 'text-amber-700' },
  purple:  { track: 'accent-purple-600',  thumb: 'text-purple-600',  text: 'text-purple-700' },
};

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  tooltip?: string;
}

const ScoreSlider: React.FC<ScoreSliderProps> = ({ label, value, onChange, color, tooltip }) => {
  const colors = colorMap[color] || colorMap.blue;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-600" title={tooltip}>
          {label}
          {tooltip && <span className="ml-1 text-gray-400 cursor-help" title={tooltip}>ⓘ</span>}
        </label>
        <span className={`text-sm font-bold ${value > 0 ? colors.text : 'text-gray-400'}`}>
          {value > 0 ? `≥ ${value}` : 'Any'}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer ${colors.track}`}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">0</span>
        <span className="text-[10px] text-gray-400">50</span>
        <span className="text-[10px] text-gray-400">100</span>
      </div>
    </div>
  );
};

// ── Filter application helper ──────────────────────────────────────────────────

export function applySupplierFilters(
  groups: SupplierGroup[],
  filters: SupplierFilters
): SupplierGroup[] {
  return groups.filter(g => {
    // Solution filter
    if (filters.solutionNumber !== 'all') {
      if (!g.solutions.some(s => s.solution_number === filters.solutionNumber)) return false;
    }

    // Badge filter (any of the selected badges)
    if (filters.badgeTypes.length > 0) {
      const supplierBadges = g.match_insights?.badges?.map(b => b.type) || [];
      if (!filters.badgeTypes.some(bt => supplierBadges.includes(bt))) return false;
    }

    // Country filter
    if (filters.countries.length > 0) {
      if (!filters.countries.includes(g.supplier.country || '')) return false;
    }

    // Company size filter
    if (filters.companySizes.length > 0) {
      if (!filters.companySizes.includes(g.supplier.company_size || '')) return false;
    }

    // Has products
    if (filters.hasProducts && g.total_products === 0) return false;

    // Score filters
    if (filters.minOverallScore > 0 && (g.scores.score_entreprise ?? g.scores.overall ?? 0) < filters.minOverallScore) return false;
    if (filters.minProductFit > 0 && (g.scores.score_produit_brief ?? 0) < filters.minProductFit) return false;
    if (filters.minReliability > 0 && (g.scores.score_fiabilite ?? 0) < filters.minReliability) return false;

    // Min product score
    if (filters.minProductScore > 0 && (g.max_product_score ?? 0) < filters.minProductScore) return false;

    return true;
  });
}

export default SupplierFiltersBar;
