import React, { useState, useEffect } from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { devLog } from '../../lib/devTools';

interface BriefFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

type BriefFormData = {
  title: string;
  description: string;
  reference_companies: string[];
  maturity: string[]; // Add missing maturity field
  geographies: string[];
  organization_types: string[];
  capabilities: string[];
}

const BriefForm: React.FC<BriefFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  // Load form options - Call i18n-handler Edge Function to get translations in current locale
  // Using get_translations action instead of get_form_options to work with current deployment
  const { data: translationsData, loading: translationsLoading, error: translationsError } = useEdgeFunction('i18n-handler', {
    action: 'get_translations',
    group: 'form_options'
  }, 'POST');
  
  // Hook for draft operations using consistent Edge Function pattern
  const { refresh: refreshDraft } = useEdgeFunction('brief-operations', {}, 'POST');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form state
  const [formData, setFormData] = useState<BriefFormData>({
    title: '',
    description: '',
    reference_companies: [],
    maturity: [],
    geographies: [],
    organization_types: [],
    capabilities: []
  });

  // Set initial data if provided (editing mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        reference_companies: initialData.reference_companies || [],
        maturity: initialData.maturity || [],
        geographies: initialData.geographies || [],
        organization_types: initialData.organization_types || [],
        capabilities: initialData.capabilities || []
      });
    }
  }, [initialData]);

  // Auto-save as draft with debounce
  useEffect(() => {
    // Skip initial render and only auto-save if we have a title
    if (!formData.title || isSubmitting) return;
    
    const draftTimer = setTimeout(() => {
      saveDraft();
    }, 2000); // 2 second debounce
    
    return () => clearTimeout(draftTimer);
  }, [formData]);

  const saveDraft = async () => {
    try {
      // Only auto-save if this is not an edit (initialData doesn't exist)
      // Also prevent saving when submitting to avoid race conditions
      if (!initialData && !isSubmitting) {
        devLog('Auto-saving draft brief', { formData });
        
        // Use the useEdgeFunction hook's refresh method directly
        // This ensures consistent auth token handling and removes development mode toggles
        await (refreshDraft as (params?: Record<string, any>) => Promise<void>)({
          action: 'create_brief',
          brief_data: { 
            ...formData, 
            status: 'draft' 
          }
        });
      }
    } catch (error) {
      devLog('Auto-save draft failed', { error });
      // Don't show error to user for background auto-save
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const currentValues = prev[name as keyof BriefFormData] as string[];
      
      if (currentValues.includes(value)) {
        // Remove if already selected
        return {
          ...prev,
          [name]: currentValues.filter(item => item !== value)
        };
      } else {
        // Add if not already selected
        return {
          ...prev,
          [name]: [...currentValues, value]
        };
      }
    });
  };

  const handleReferenceCompanyAdd = () => {
    const companyInput = document.getElementById('company-input') as HTMLInputElement;
    if (companyInput && companyInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        reference_companies: [...prev.reference_companies, companyInput.value.trim()]
      }));
      companyInput.value = '';
    }
  };

  const handleReferenceCompanyRemove = (company: string) => {
    setFormData(prev => ({
      ...prev,
      reference_companies: prev.reference_companies.filter(c => c !== company)
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strong protection against duplicate submissions
    if (isSubmitting) {
      console.log('Form submission already in progress, preventing duplicate');
      return;
    }
    
    // Validate form before submission
    if (validateForm()) {
      // Call onSubmit and let the parent component manage the submission state
      try {
        onSubmit(formData);
      } catch (error) {
        console.error('Error in form submission:', error);
      }
    }
  };

  // Define option type
  type FormOption = {
    value: string;
    label: string;
  };

  // Define default options if translations are not available
  const defaultMaturityOptions: FormOption[] = [
    { value: 'commercial', label: 'Commercial' },
    { value: 'commercial_ots', label: 'Commercial / Off-the-shelf to adapt' },
    { value: 'proof_concept', label: 'Proof of Concept (Feasibility)' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'research', label: 'Research' }
  ];

  const defaultCapabilitiesOptions: FormOption[] = [
    { value: 'consulting', label: 'Consulting or expertise' },
    { value: 'manufacturing', label: 'Manufacturing capabilities' },
    { value: 'new_technology', label: 'New Technology' },
    { value: 'outsourced', label: 'Outsourced capability' },
    { value: 'process', label: 'Process' },
    { value: 'product', label: 'Product' },
    { value: 'prototyping', label: 'Prototyping capabilities' },
    { value: 'supplier', label: 'Supplier' }
  ];

  const defaultOrganizationOptions: FormOption[] = [
    { value: 'consulting', label: 'Consulting' },
    { value: 'cro', label: 'CRO' },
    { value: 'encyclopedia', label: 'Encyclopedia' },
    { value: 'large_company', label: 'Large Company' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'research_institute', label: 'Research Institute or Laboratory' },
    { value: 'small_business', label: 'Small Business' }
  ];

  const defaultGeographyOptions: FormOption[] = [
    { value: 'anywhere', label: 'Anywhere' },
    { value: 'asia_pacific', label: 'Asia-Pacific' },
    { value: 'europe', label: 'Europe' },
    { value: 'latin_america', label: 'Latin America' },
    { value: 'middle_east_africa', label: 'Middle East and Africa' },
    { value: 'north_america', label: 'North America' }
  ];

  // Create translated options from API response
  const formOptions = translationsData?.translations?.form_options || {};

  // Helper function to generate options with translations
  const getTranslatedOptions = (optionType: string, defaultOptions: FormOption[]): FormOption[] => {
    if (!formOptions[optionType]) return defaultOptions;
    
    return defaultOptions.map(option => ({
      ...option,
      label: formOptions[optionType][option.value] || option.label
    }));
  };

  // Apply translations to each option type
  const maturityOptions = getTranslatedOptions('maturity', defaultMaturityOptions);
  const capabilitiesOptions = getTranslatedOptions('capabilities', defaultCapabilitiesOptions);
  const organizationOptions = getTranslatedOptions('organization_types', defaultOrganizationOptions);
  const geographyOptions = getTranslatedOptions('geographies', defaultGeographyOptions);

  // Display loading state
  if (translationsLoading) {
    return <p className="text-center py-4">Loading form options...</p>;
  }

  // Display error state
  if (translationsError) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-500">Error loading form options</p>
        <p className="text-sm text-red-400">
          {typeof translationsError === 'string' 
            ? translationsError 
            : (translationsError as Error)?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.maturity.length === 0) {
      newErrors.maturity = 'Please select at least one maturity option';
    }
    
    if (formData.capabilities.length === 0) {
      newErrors.capabilities = 'Please select at least one capability';
    }
    
    setErrors(newErrors);
    setTouched({
      title: true,
      description: true,
      maturity: true,
      capabilities: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
      {/* Brief Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Brief Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Concise title describing what you're looking for"
          className={`w-full px-3 py-2 border ${errors.title && touched.title ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          required
        />
        {errors.title && touched.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Brief Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Brief Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border ${errors.description && touched.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
          placeholder="Describe what you're looking for in detail"
          required
        ></textarea>
        {errors.description && touched.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Reference Companies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reference Companies
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="company-input"
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Add a company name"
          />
          <button
            type="button"
            onClick={handleReferenceCompanyAdd}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        
        {formData.reference_companies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.reference_companies.map(company => (
              <div key={company} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                <span className="text-sm">{company}</span>
                <button
                  type="button"
                  onClick={() => handleReferenceCompanyRemove(company)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Structured Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Maturity & Readiness of the Expected Solution (NEW FIELD) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maturity & Readiness of the Expected Solution
          </label>
          <div className={`space-y-2 p-2 border ${errors.maturity && touched.maturity ? 'border-red-500' : 'border-gray-200'} rounded-md`}>
            {maturityOptions.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`maturity-${option.value}`}
                  checked={formData.maturity.includes(option.value)}
                  onChange={() => handleMultiSelectChange('maturity', option.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`maturity-${option.value}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {errors.maturity && touched.maturity && (
            <p className="mt-1 text-sm text-red-500">{errors.maturity}</p>
          )}
        </div>

        {/* Capabilities */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Capabilities
          </label>
          <div className={`flex flex-wrap gap-2 p-2 border ${errors.capabilities && touched.capabilities ? 'border-red-500' : 'border-gray-200'} rounded-md`}>
            {capabilitiesOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleMultiSelectChange('capabilities', option.value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.capabilities.includes(option.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.capabilities && touched.capabilities && (
            <p className="mt-1 text-sm text-red-500">{errors.capabilities}</p>
          )}
        </div>
        
        {/* Organization Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Type(s) of Organisation
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
            {organizationOptions.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`type-${option.value}`}
                  checked={formData.organization_types.includes(option.value)}
                  onChange={() => handleMultiSelectChange('organization_types', option.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`type-${option.value}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Geographies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Geographies
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
            {geographyOptions.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`geo-${option.value}`}
                  checked={formData.geographies.includes(option.value)}
                  onChange={() => handleMultiSelectChange('geographies', option.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`geo-${option.value}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm text-sm font-medium hover:scale-105 transition duration-200 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Brief'}
        </button>
      </div>
    </form>
  );
};

export default BriefForm;
