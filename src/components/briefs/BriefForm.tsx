import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import '../../styles/design-tokens.css';
import '../../styles/main.css';

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
    { id: 'sme', label: t('brief.org_type.sme', 'SME') },
    { id: 'startup', label: t('brief.org_type.startup', 'Startup') },
  ];

  // Geography options
  const geographyOptions = [
    { id: 'africa', label: t('brief.geography.africa', 'Africa') },
    { id: 'asia', label: t('brief.geography.asia', 'Asia') },
    { id: 'europe', label: t('brief.geography.europe', 'Europe') },
    { id: 'middle_east', label: t('brief.geography.middle_east', 'Middle East') },
    { id: 'north_america', label: t('brief.geography.north_america', 'North America') },
    { id: 'oceania', label: t('brief.geography.oceania', 'Oceania') },
    { id: 'south_america', label: t('brief.geography.south_america', 'South America') },
  ];

  return (
    <form onSubmit={handleSubmitForm} className="space-y-8">
      <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border-l-4 border border-primary border-l-primary">
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">Create New Brief</h2>
        {/* Title */}
        <div>
          <label htmlFor="title" className="form-label text-gray-700 font-medium">
            {t('brief.form.title', 'Brief Title')} <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder={t('brief.form.title_placeholder', 'Enter a descriptive title for your brief')}
            className="form-input focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="form-label text-gray-700 font-medium">
            {t('brief.form.description', 'Brief Description')} <span className="text-primary">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder={t('brief.form.description_placeholder', 'Describe your business needs in detail')}
            className="form-textarea focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20"
          />
        </div>

        {/* Reference Companies */}
        <div>
          <label className="form-label text-gray-700 font-medium">
            {t('brief.form.reference_companies', 'Reference Companies')}
          </label>
          <p className="text-sm text-gray-500 mb-2">
            {t('brief.form.reference_companies_help', 'Add companies that you consider as references for this brief')}
          </p>
          
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              placeholder={t('brief.form.company_placeholder', 'Enter company name')}
              className="form-input flex-1 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20"
            />
            <button
              type="button"
              onClick={handleAddCompany}
              className="btn btn-secondary hover:bg-gray-50 border-gray-300"
            >
              {t('brief.form.add', 'Add')}
            </button>
          </div>
          
          {formData.reference_companies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.reference_companies.map((company, index) => (
                <div key={index} className="flex items-center px-3 py-1.5 rounded-full text-sm bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20">
                  <span>{company}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        reference_companies: prev.reference_companies.filter((_, i) => i !== index)
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
          <label className="form-label mb-3 text-gray-700 font-medium">
            {t('brief.form.required_maturity', 'Required Maturity')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
            {maturityOptions.map(option => (
              <div key={option.id} className="flex items-center hover:bg-white p-2 rounded transition-colors duration-150">
                <input
                  type="checkbox"
                  id={`maturity-${option.id}`}
                  name="required_maturity"
                  value={option.id}
                  checked={formData.required_maturity.includes(option.id)}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
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
          <label className="form-label mb-3 text-gray-700 font-medium">
            {t('brief.form.required_capabilities', 'Required Capabilities')}
          </label>
          
          <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-lg">
            {capabilityOptions.map(option => (
              <div 
                key={option.id}
                className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-200 border ${
                  formData.required_capabilities.includes(option.id)
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  const isSelected = formData.required_capabilities.includes(option.id);
                  setFormData(prev => ({
                    ...prev,
                    required_capabilities: isSelected
                      ? prev.required_capabilities.filter(id => id !== option.id)
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
          <label className="form-label mb-3 text-gray-700 font-medium">
            {t('brief.form.preferred_organization_types', 'Preferred Type(s) of Organisation')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
            {organizationTypes.map(option => (
              <div key={option.id} className="flex items-center hover:bg-white p-2 rounded transition-colors duration-150">
                <input
                  type="checkbox"
                  id={`org-${option.id}`}
                  name="preferred_organization_types"
                  value={option.id}
                  checked={formData.preferred_organization_types.includes(option.id)}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
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
          <label className="form-label mb-3 text-gray-700 font-medium">
            {t('brief.form.preferred_geographies', 'Preferred Geographies')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
            {geographyOptions.map(option => (
              <div key={option.id} className="flex items-center hover:bg-white p-2 rounded transition-colors duration-150">
                <input
                  type="checkbox"
                  id={`geo-${option.id}`}
                  name="preferred_geographies"
                  value={option.id}
                  checked={formData.preferred_geographies.includes(option.id)}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor={`geo-${option.id}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-secondary hover:bg-gray-50 border-gray-300"
          >
            <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> {t('brief.form.cancel', 'Cancel')}</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary shadow-md hover:shadow-lg transition-all ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
            }`}
          >
            {isSubmitting 
              ? <span className="flex items-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> {t('brief.form.submitting', 'Submitting...')}</span>
              : <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {t('brief.form.create_brief', 'Create Brief')}</span>}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BriefForm;
