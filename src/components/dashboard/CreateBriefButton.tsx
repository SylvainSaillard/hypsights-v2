import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';

/**
 * Prominent Create Brief CTA button
 * Following Hypsights design system with primary color and hover animation
 */
const CreateBriefButton: React.FC = () => {
  const { t } = useI18n();
  return (
    <Link 
      to="/dashboard/briefs/new" 
      className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:scale-105 transition duration-200"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 mr-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 4v16m8-8H4" 
        />
      </svg>
      {t('brief.button.create_new', 'Create Brief')}
    </Link>
  );
};

export default CreateBriefButton;
