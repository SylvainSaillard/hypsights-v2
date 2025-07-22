import { useState } from 'react';
import { ChevronDown, ChevronRight, Package } from 'react-feather';
import SupplierMatchCard from './SupplierMatchCard';
import type { SupplierMatch } from './SupplierMatchCard';

interface SolutionSectionProps {
  solutionName: string;
  suppliers: SupplierMatch[];
  defaultExpanded?: boolean;
}

export function SolutionSection({ solutionName, suppliers, defaultExpanded = true }: SolutionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
      {/* Header de la section solution */}
      <div 
        className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 cursor-pointer hover:from-blue-500 hover:to-blue-600 transition-all duration-200"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{solutionName}</h3>
              <p className="text-blue-100 text-sm">
                {suppliers.length} supplier{suppliers.length > 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-blue-100 text-sm mr-2">
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
            {isExpanded ? (
              <ChevronDown size={20} className="text-white" />
            ) : (
              <ChevronRight size={20} className="text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Contenu pliable */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-gray-900">
          {suppliers.map((supplier) => (
            <SupplierMatchCard key={supplier.supplier_id} match={supplier} />
          ))}
        </div>
      )}
    </div>
  );
}
