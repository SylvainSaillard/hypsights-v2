import React, { useState, useMemo } from 'react';
import {
  Trophy, Target, ShieldCheck, CheckCircle, Building2, Globe,
  SlidersHorizontal, X, ChevronDown, ChevronUp, MapPin, Building,
  Filter, Sparkles
} from 'lucide-react';
import type { SupplierGroup } from '../../types/supplierTypes';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SupplierFilters {
  badgeTypes: string[];
  countries: string[];
  companySizes: string[];
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
  best_overall:     { icon: Trophy,      label: 'Best Match',          color: 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100',       activeColor: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-400 shadow-sm shadow-amber-100' },
  best_product_fit: { icon: Target,      label: 'Best Product Fit',    color: 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100', activeColor: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-900 border-emerald-400 shadow-sm shadow-emerald-100' },
  best_reliability: { icon: ShieldCheck, label: 'Most Reliable',       color: 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100',           activeColor: 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-900 border-blue-400 shadow-sm shadow-blue-100' },
  best_criteria:    { icon: CheckCircle, label: 'Best Criteria Match', color: 'bg-violet-50 text-violet-700 border-violet-300 hover:bg-violet-100',     activeColor: 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-900 border-violet-400 shadow-sm shadow-violet-100' },
  best_company:     { icon: Building2,   label: 'Strongest Company',   color: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100',           activeColor: 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-900 border-rose-400 shadow-sm shadow-rose-100' },
  best_geography:   { icon: Globe,       label: 'Best Geographic Fit', color: 'bg-cyan-50 text-cyan-700 border-cyan-300 hover:bg-cyan-100',           activeColor: 'bg-gradient-to-r from-cyan-100 to-sky-100 text-cyan-900 border-cyan-400 shadow-sm shadow-cyan-100' },
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

  const hasAdvancedActive = filters.minOverallScore > 0 || filters.minProductFit > 0 || filters.minReliability > 0 || filters.minProductScore > 0;
  const advancedActiveCount = [filters.minOverallScore, filters.minProductFit, filters.minReliability, filters.minProductScore].filter(v => v > 0).length;

  return (
    <div className="mb-6 space-y-3">
      {/* ── Header row: icon + result count + solution dropdown + clear ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Filter size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {isFiltered ? (
              <><span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{filteredCount}</span><span className="text-gray-400 font-normal"> / {totalCount}</span></>
            ) : (
              <>{totalCount} supplier{totalCount !== 1 ? 's' : ''}</>
            )}
          </span>
        </div>

        {/* Solution dropdown */}
        {solutions.length > 1 && (
          <div className="relative">
            <select
              className="appearance-none bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm hover:shadow transition-all"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-400">
              <ChevronDown size={13} />
            </div>
          </div>
        )}

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 border border-red-200/60 hover:bg-red-100 transition-all"
          >
            <X size={12} />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* ── Quick filter chips ── */}
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                active ? cfg.activeColor : cfg.color
              }`}
            >
              <Icon size={14} strokeWidth={2.5} />
              {cfg.label}
            </button>
          );
        })}

        {/* Separator */}
        {availableBadgeTypes.length > 0 && (availableSizes.length > 0) && (
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-0.5" />
        )}

        {/* Company size chips */}
        {availableSizes.map(({ size, count }) => {
          const active = filters.companySizes.includes(size);
          return (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-900 border-indigo-400 shadow-sm shadow-indigo-100'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100'
              }`}
            >
              <Building size={13} />
              {companySizeLabels[size] || size}
              <span className="text-[10px] opacity-50">({count})</span>
            </button>
          );
        })}

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
            showAdvanced || hasAdvancedActive
              ? 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-900 border-purple-400 shadow-sm shadow-purple-100'
              : 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
          }`}
        >
          <SlidersHorizontal size={13} />
          Advanced
          {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {hasAdvancedActive && (
            <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center shadow-sm">
              {advancedActiveCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Country chips ── */}
      {availableCountries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <MapPin size={13} className="text-blue-400 mr-0.5" />
          {availableCountries.slice(0, 12).map(({ country, count }) => {
            const active = filters.countries.includes(country);
            return (
              <button
                key={country}
                onClick={() => toggleCountry(country)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-sky-100 to-blue-100 text-sky-900 border-sky-400 shadow-sm'
                    : 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100'
                }`}
              >
                {country}
                <span className="text-[9px] opacity-50">({count})</span>
              </button>
            );
          })}
          {availableCountries.length > 12 && (
            <span className="text-[11px] text-gray-400 italic">+{availableCountries.length - 12} more</span>
          )}
        </div>
      )}

      {/* ── Advanced filters panel ── */}
      {showAdvanced && (
        <div className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 rounded-xl border border-purple-100/80 p-5 shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-purple-500" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Score Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreSlider
              label="Overall Score"
              value={filters.minOverallScore}
              onChange={(v) => update({ minOverallScore: v })}
              color="blue"
            />
            <ScoreSlider
              label="Product Fit"
              value={filters.minProductFit}
              onChange={(v) => update({ minProductFit: v })}
              color="emerald"
            />
            <ScoreSlider
              label="Reliability"
              value={filters.minReliability}
              onChange={(v) => update({ minReliability: v })}
              color="amber"
            />
            <ScoreSlider
              label="Product Score"
              value={filters.minProductScore}
              onChange={(v) => update({ minProductScore: v })}
              color="purple"
              tooltip="Suppliers with at least 1 product scoring above this value"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Score slider sub-component ─────────────────────────────────────────────────

const colorMap: Record<string, { track: string; bg: string; text: string; border: string; label: string }> = {
  blue:    { track: 'accent-blue-600',    bg: 'bg-gradient-to-br from-blue-50 to-sky-50',       text: 'text-blue-700',    border: 'border-blue-200/60',    label: 'text-blue-600' },
  emerald: { track: 'accent-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-green-50',   text: 'text-emerald-700', border: 'border-emerald-200/60', label: 'text-emerald-600' },
  amber:   { track: 'accent-amber-500',   bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',   text: 'text-amber-700',   border: 'border-amber-200/60',   label: 'text-amber-600' },
  purple:  { track: 'accent-purple-600',  bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50', text: 'text-purple-700',  border: 'border-purple-200/60',  label: 'text-purple-600' },
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
    <div className={`${colors.bg} rounded-lg border ${colors.border} p-3`}>
      <div className="flex items-center justify-between mb-2">
        <label className={`text-xs font-bold ${colors.label}`} title={tooltip}>
          {label}
          {tooltip && <span className="ml-1 opacity-50 cursor-help" title={tooltip}>ⓘ</span>}
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
        className={`w-full h-1.5 bg-white/80 rounded-full appearance-none cursor-pointer ${colors.track}`}
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
