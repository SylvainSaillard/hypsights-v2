import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import '../../styles/design-tokens.css';
import '../../styles/main.css';

interface BriefFormProps {
  initialData?: BriefData;
  onSubmit: (data: BriefData) => void;
  isSubmitting: boolean;
}

interface ReferenceCompany {
  name: string;
  url: string;
}

interface BriefData {
  title: string;
  description: string;
  reference_companies: ReferenceCompany[];
  maturity: string[];
  capabilities: string[];
  organization_types: string[];
  geographies: string[];
  [key: string]: string | string[] | ReferenceCompany[];
}

const BriefForm: React.FC<BriefFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<BriefData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    reference_companies: initialData?.reference_companies || [],
    maturity: initialData?.maturity || [],
    capabilities: initialData?.capabilities || [],
    organization_types: initialData?.organization_types || [],
    geographies: initialData?.geographies || [],
  });

  const [companyInput, setCompanyInput] = useState('');
  const [companyUrlInput, setCompanyUrlInput] = useState('');

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
    if (companyInput.trim() && companyUrlInput.trim()) {
      setFormData(prev => ({
        ...prev,
        reference_companies: [...prev.reference_companies, {
          name: companyInput.trim(),
          url: companyUrlInput.trim()
        }]
      }));
      setCompanyInput('');
      setCompanyUrlInput('');
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Maturity options
  const maturityOptions = [
    { 
      id: 'commercial', 
      label: t('brief.maturity.commercial', 'Commercial'),
      icon: '🏪',
      description: t('brief.maturity.commercial_desc', 'Ready-to-market solutions')
    },
    { 
      id: 'prototype', 
      label: t('brief.maturity.prototype', 'Prototype'),
      icon: '🔧',
      description: t('brief.maturity.prototype_desc', 'Working prototypes and demos')
    },
    { 
      id: 'research', 
      label: t('brief.maturity.research', 'Research'),
      icon: '🔬',
      description: t('brief.maturity.research_desc', 'Early-stage research and concepts')
    },
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
          
          <div className="space-y-3 mb-4 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder={t('brief.form.company_name_placeholder', 'Company name')}
                className="form-input focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20"
              />
              <input
                type="url"
                value={companyUrlInput}
                onChange={(e) => setCompanyUrlInput(e.target.value)}
                placeholder={t('brief.form.company_url_placeholder', 'Company website URL')}
                className="form-input focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCompany}
              disabled={!companyInput.trim() || !companyUrlInput.trim()}
              className="btn btn-secondary hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('brief.form.add_company', 'Add Company')}
            </button>
          </div>
          
          {formData.reference_companies.length > 0 && (
            <div className="space-y-2 mt-3">
              {formData.reference_companies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      <a 
                        href={company.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {company.url}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        reference_companies: prev.reference_companies.filter((_, i) => i !== index)
                      }));
                    }}
                    className="ml-3 text-gray-400 hover:text-red-500 text-lg font-bold"
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
          <label className="form-label mb-4 text-gray-700 font-medium">
            {t('brief.form.required_maturity', 'Required Maturity')}
          </label>
          <p className="text-sm text-gray-500 mb-4">
            {t('brief.form.required_maturity_help', 'Sélectionnez le niveau de maturité des solutions recherchées')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-lg">
            {maturityOptions.map(option => (
              <label 
                key={option.id} 
                htmlFor={`maturity-${option.id}`} 
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                  formData.maturity.includes(option.id)
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  id={`maturity-${option.id}`}
                  name="maturity"
                  value={option.id}
                  checked={formData.maturity.includes(option.id)}
                  onChange={handleCheckboxChange}
                  className="absolute top-4 right-4 custom-checkbox"
                />
                
                <div className="text-center">
                  <div className="text-4xl mb-3">{option.icon}</div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                </div>
                
                {formData.maturity.includes(option.id) && (
                  <div className="absolute top-4 left-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Types d'Organisation et Capacités */}
        <div>
          <label className="form-label mb-4 text-gray-700 font-medium">
            {t('brief.form.organization_capabilities', 'Types d\'Organisation et Capacités Recherchées')}
          </label>
          <p className="text-sm text-gray-500 mb-4">
            {t('brief.form.organization_capabilities_help', 'Sélectionnez les types d\'organisations et capacités qui correspondent à vos besoins')}
          </p>
          
          <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
            {/* Produits Commerciaux */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                {t('brief.form.commercial_products', 'Produits Commerciaux')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="large_company"
                    checked={formData.organization_types.includes('large_company')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.large_company', 'Large Company')}
                  </span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="sme"
                    checked={formData.organization_types.includes('sme')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.sme', 'SME')}
                  </span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="startup"
                    checked={formData.organization_types.includes('startup')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.startup', 'Startup')}
                  </span>
                </label>
              </div>
            </div>

            {/* Capacités Externalisées */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                {t('brief.form.outsourced_capabilities', 'Capacités Externalisées')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="cro"
                    checked={formData.organization_types.includes('cro')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.cro', 'CRO (Contract Research Organization)')}
                  </span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="cmo"
                    checked={formData.organization_types.includes('cmo')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.cmo', 'CMO (Contract Manufacturing Organization)')}
                  </span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="cdmo"
                    checked={formData.organization_types.includes('cdmo')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.cdmo', 'CDMO (Contract Development & Manufacturing Organization)')}
                  </span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="cpo"
                    checked={formData.organization_types.includes('cpo')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.cpo', 'CPO (Contract Production Organization)')}
                  </span>
                </label>
              </div>
            </div>

            {/* Recherche & Développement */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                {t('brief.form.research_development', 'Recherche & Développement')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="research_institute"
                    checked={formData.organization_types.includes('research_institute')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.research_institute', 'Research Institute')}
                  </span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="universities"
                    checked={formData.organization_types.includes('universities')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.universities', 'Universities')}
                  </span>
                </label>
              </div>
            </div>

            {/* Conseil */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                {t('brief.form.consulting', 'Conseil')}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="organization_types"
                    value="consulting"
                    checked={formData.organization_types.includes('consulting')}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox"
                  />
                  <span className="ml-3 text-sm text-slate-700 font-medium">
                    {t('brief.org_type.consulting', 'Consulting Organizations')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Geographies */}
        <div>
          <label className="form-label mb-3 text-gray-700 font-medium">
            {t('brief.form.preferred_geographies', 'Preferred Geographies')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            {geographyOptions.map(option => (
              <label key={option.id} htmlFor={`geo-${option.id}`} className="flex items-center p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  id={`geo-${option.id}`}
                  name="geographies"
                  value={option.id}
                  checked={formData.geographies.includes(option.id)}
                  onChange={handleCheckboxChange}
                  className="custom-checkbox"
                />
                <span className="ml-3 text-sm text-slate-700 font-medium">
                  {option.label}
                </span>
              </label>
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
            className={`btn bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
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
