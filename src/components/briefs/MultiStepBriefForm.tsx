import React, { useState, useEffect } from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';

// Re-define interfaces from BriefForm.tsx
interface BriefFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

type BriefFormData = {
  title: string;
  description: string;
  reference_companies: string[];
  maturity: string[];
  geographies: string[];
  organization_types: string[];
  capabilities: string[];
};

// Define option type
interface FormOption {
  value: string;
  label: string;
}

const MultiStepBriefForm: React.FC<BriefFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  useI18n();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BriefFormData>(() => {
    const savedDraft = localStorage.getItem('briefDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Basic validation to ensure it's not just "null" or empty
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse brief draft from localStorage", e);
      }
    }
    return {
      title: '',
      description: '',
      reference_companies: [],
      maturity: [],
      geographies: [],
      organization_types: [],
      capabilities: []
    };
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('briefDraft', JSON.stringify(formData));
  }, [formData]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData).then(() => {
      localStorage.removeItem('briefDraft');
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name: keyof BriefFormData, value: string) => {
    setFormData(prev => {
      const list = prev[name] as string[];
      const newList = list.includes(value)
        ? list.filter(item => item !== value)
        : [...list, value];
      return { ...prev, [name]: newList };
    });
  };

  const { data: translationsData, loading: translationsLoading } = useEdgeFunction('i18n-handler', {
    action: 'get_translations',
    group: 'form_options'
  }, 'POST');

  const getTranslatedOptions = (optionType: string, defaultOptions: FormOption[]): FormOption[] => {
    if (translationsLoading || !translationsData?.translations) {
      return defaultOptions;
    }
    return defaultOptions.map(opt => ({
      ...opt,
      label: translationsData.translations[`${optionType}.${opt.value}`] || opt.label
    }));
  };

  const maturityOptions = getTranslatedOptions('maturity', [
    { value: 'commercial', label: 'Commercial' },
    { value: 'commercial_off_the_shelf', label: 'Commercial / Off-the-shelf to adapt' },
    { value: 'poc', label: 'Proof of Concept (Feasibility)' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'research', label: 'Research' },
  ]);

  const capabilitiesOptions = getTranslatedOptions('capabilities', [
      { value: 'consulting_or_expertise', label: 'Consulting or expertise' },
      { value: 'manufacturing_capabilities', label: 'Manufacturing capabilities' },
      { value: 'new_technology', label: 'New Technology' },
      { value: 'outsourced_capability', label: 'Outsourced capability' },
      { value: 'process', label: 'Process' },
      { value: 'product', label: 'Product' },
      { value: 'prototyping_capabilities', label: 'Prototyping capabilities' },
      { value: 'supplier', label: 'Supplier' },
  ]);

  const organizationOptions = getTranslatedOptions('organization_types', [
    { value: 'consulting', label: 'Consulting' },
    { value: 'cro', label: 'CRO' },
    { value: 'encyclopedia', label: 'Encyclopedia' },
    { value: 'large_company', label: 'Large Company' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'not_specified', label: 'Not Specified' },
  ]);

  const geographyOptions = getTranslatedOptions('geographies', [
    { value: 'anywhere', label: 'Anywhere' },
    { value: 'asia_pacific', label: 'Asia-Pacific' },
    { value: 'europe', label: 'Europe' },
    { value: 'latin_america', label: 'Latin America' },
    { value: 'middle_east_africa', label: 'Middle East and Africa' },
    { value: 'north_america', label: 'North America' },
  ]);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Core Details</h2>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Eco-friendly packaging solution" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Describe your business need in detail..."></textarea>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Refinements</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Maturity</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {maturityOptions.map(option => (
                  <div key={option.value} className={`p-4 border rounded-lg cursor-pointer ${formData.maturity.includes(option.value) ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`} onClick={() => handleMultiSelectChange('maturity', option.value)}>
                    <input type="checkbox" id={`maturity-${option.value}`} checked={formData.maturity.includes(option.value)} onChange={() => {}} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor={`maturity-${option.value}`} className="ml-3 text-sm font-medium text-gray-800">{option.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Targeting</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Capabilities</label>
              <div className="flex flex-wrap gap-3">
                {capabilitiesOptions.map(option => (
                  <button key={option.value} type="button" onClick={() => handleMultiSelectChange('capabilities', option.value)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.capabilities.includes(option.value) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{option.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Organisation Types</label>
                <div className="space-y-3">
                  {organizationOptions.map(option => (
                     <div key={option.value} className={`p-3 border rounded-lg cursor-pointer ${formData.organization_types.includes(option.value) ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`} onClick={() => handleMultiSelectChange('organization_types', option.value)}>
                      <input type="checkbox" id={`org-${option.value}`} checked={formData.organization_types.includes(option.value)} onChange={() => {}} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor={`org-${option.value}`} className="ml-3 text-sm font-medium text-gray-800">{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Geographies</label>
                <div className="space-y-3">
                  {geographyOptions.map(option => (
                    <div key={option.value} className={`p-3 border rounded-lg cursor-pointer ${formData.geographies.includes(option.value) ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`} onClick={() => handleMultiSelectChange('geographies', option.value)}>
                      <input type="checkbox" id={`geo-${option.value}`} checked={formData.geographies.includes(option.value)} onChange={() => {}} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor={`geo-${option.value}`} className="ml-3 text-sm font-medium text-gray-800">{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl mx-auto my-8">
      <div className="mb-8">
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={`${step >= 1 ? 'text-blue-600 font-semibold' : ''}`}>Core Details</span>
          <span className={`${step >= 2 ? 'text-blue-600 font-semibold' : ''}`}>Refinements</span>
          <span className={`${step >= 3 ? 'text-blue-600 font-semibold' : ''}`}>Targeting</span>
        </div>
      </div>
      <form onSubmit={handleFormSubmit} className="space-y-8">
        {renderStepContent()}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button type="button" onClick={prevStep} className={`px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${step === 1 ? 'invisible' : 'visible'}`}>
            Back
          </button>
          {step < 3 ? (
            <button type="button" onClick={nextStep} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Next
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className={`px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Submitting...' : 'Create Brief'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MultiStepBriefForm;
