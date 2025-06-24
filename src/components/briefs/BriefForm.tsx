import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import '../../styles/design-tokens.css';

interface BriefFormProps {
  initialData?: BriefData;
  onSubmit: (data: BriefData) => void;
  isSubmitting: boolean;
}

interface BriefData {
  title: string;
  description: string;
  reference_companies: string[];
  required_maturity: string[];
  required_capabilities: string[];
  preferred_organization_types: string[];
  preferred_geographies: string[];
  [key: string]: string | string[];
}

const BriefForm: React.FC<BriefFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<BriefData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    reference_companies: initialData?.reference_companies || [],
    required_maturity: initialData?.required_maturity || [],
    required_capabilities: initialData?.required_capabilities || [],
    preferred_organization_types: initialData?.preferred_organization_types || [],
    preferred_geographies: initialData?.preferred_geographies || [],
  });

  const [companyInput, setCompanyInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    setFormData(prev => {
      const currentValues = prev[name] as string[] || [];
      
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter((v: string) => v !== value) };
      }
    });
  };

  const handleAddCompany = () => {
    if (companyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        reference_companies: [...prev.reference_companies, companyInput.trim()]
      }));
      setCompanyInput('');
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Capability options
  const capabilityOptions = [
    { id: 'consulting', label: t('brief.capabilities.consulting', 'Consulting or expertise') },
    { id: 'manufacturing', label: t('brief.capabilities.manufacturing', 'Manufacturing capabilities') },
    { id: 'technology', label: t('brief.capabilities.technology', 'New Technology') },
    { id: 'outsourcing', label: t('brief.capabilities.outsourcing', 'Outsourced capability') },
    { id: 'process', label: t('brief.capabilities.process', 'Process') },
    { id: 'product', label: t('brief.capabilities.product', 'Product') },
    { id: 'prototyping', label: t('brief.capabilities.prototyping', 'Prototyping capabilities') },
    { id: 'supplier', label: t('brief.capabilities.supplier', 'Supplier') },
  ];

  // Maturity options
  const maturityOptions = [
    { id: 'commercial', label: t('brief.maturity.commercial', 'Commercial') },
    { id: 'off_the_shelf', label: t('brief.maturity.off_the_shelf', 'Commercial / Off-the-shelf to adapt') },
    { id: 'poc', label: t('brief.maturity.poc', 'Proof of Concept (Feasibility)') },
    { id: 'prototype', label: t('brief.maturity.prototype', 'Prototype') },
    { id: 'research', label: t('brief.maturity.research', 'Research') },
  ];

  // Organization types
  const organizationTypes = [
    { id: 'consulting', label: t('brief.org_type.consulting', 'Consulting') },
    { id: 'cro', label: t('brief.org_type.cro', 'CRO') },
    { id: 'encyclopedia', label: t('brief.org_type.encyclopedia', 'Encyclopedia') },
    { id: 'large_company', label: t('brief.org_type.large_company', 'Large Company') },
    { id: 'marketplace', label: t('brief.org_type.marketplace', 'Marketplace') },
    { id: 'not_specified', label: t('brief.org_type.not_specified', 'Not Specified') },
    { id: 'research_institute', label: t('brief.org_type.research_institute', 'Research Institute') },
    { id: 'startup', label: t('brief.org_type.startup', 'Startup') },
  ];

  // Geography options
  const geographyOptions = [
    { id: 'anywhere', label: t('brief.geography.anywhere', 'Anywhere') },
    { id: 'asia_pacific', label: t('brief.geography.asia_pacific', 'Asia-Pacific') },
    { id: 'europe', label: t('brief.geography.europe', 'Europe') },
    { id: 'latin_america', label: t('brief.geography.latin_america', 'Latin America') },
    { id: 'middle_east_africa', label: t('brief.geography.middle_east_africa', 'Middle East and Africa') },
    { id: 'north_america', label: t('brief.geography.north_america', 'North America') },
  ];

  return (
    <form onSubmit={handleSubmitForm} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      <div className="space-y-8">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            {t('brief.form.title', 'Title')}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={t('brief.form.title_placeholder', 'Enter a clear and concise title for your brief')}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {t('brief.form.description', 'Description')}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t('brief.form.description_placeholder', 'Describe your business need in detail. The more context you provide, the better the AI can assist you.')}
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
            required
          />
        </div>

        {/* Reference Companies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('brief.form.reference_companies', 'Reference Companies')} ({t('brief.form.optional', 'Optional')})
          </label>
          <p className="text-sm text-gray-500 mb-2">
            {t('brief.form.reference_companies_help', 'Add companies whose work you admire or want to emulate')}
          </p>
          
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              placeholder={t('brief.form.company_placeholder', 'Enter company name')}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
            />
            <button
              type="button"
              onClick={handleAddCompany}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-200"
            >
              {t('brief.form.add_company', 'Add Company')}
            </button>
          </div>
          
          {formData.reference_companies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.reference_companies.map((company: string, index: number) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  {company}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        reference_companies: prev.reference_companies.filter((_: string, i: number) => i !== index)
                      }));
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Required Maturity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('brief.form.required_maturity', 'Required Maturity')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {maturityOptions.map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`maturity-${option.id}`}
                  name="required_maturity"
                  value={option.id}
                  checked={formData.required_maturity.includes(option.id)}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor={`maturity-${option.id}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Required Capabilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('brief.form.required_capabilities', 'Required Capabilities')}
          </label>
          
          <div className="flex flex-wrap gap-3">
            {capabilityOptions.map(option => (
              <div 
                key={option.id}
                className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-200 border ${
                  formData.required_capabilities.includes(option.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  const isSelected = formData.required_capabilities.includes(option.id);
                  setFormData(prev => ({
                    ...prev,
                    required_capabilities: isSelected
                      ? prev.required_capabilities.filter((id: string) => id !== option.id)
                      : [...prev.required_capabilities, option.id]
                  }));
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Type(s) of Organisation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('brief.form.preferred_organization_types', 'Preferred Type(s) of Organisation')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {organizationTypes.map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`org-${option.id}`}
                  name="preferred_organization_types"
                  value={option.id}
                  checked={formData.preferred_organization_types.includes(option.id)}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor={`org-${option.id}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Geographies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('brief.form.preferred_geographies', 'Preferred Geographies')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {geographyOptions.map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`geo-${option.id}`}
                  name="preferred_geographies"
                  value={option.id}
                  checked={formData.preferred_geographies.includes(option.id)}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor={`geo-${option.id}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            {t('brief.form.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2.5 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition duration-200 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting 
              ? t('brief.form.submitting', 'Submitting...') 
              : t('brief.form.create_brief', 'Create Brief')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BriefForm;
