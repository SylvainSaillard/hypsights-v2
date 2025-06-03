import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BriefForm from '../../components/briefs/BriefForm';
import useEdgeFunction from '../../hooks/useEdgeFunction';

const BriefCreationPage: React.FC = () => {
  const { briefId } = useParams<{ briefId?: string }>();
  const isEditing = Boolean(briefId);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // If editing, fetch the existing brief
  const { 
    data: existingBriefData, 
    loading: briefLoading, 
    error: briefError 
  } = useEdgeFunction(
    'brief-operations', 
    isEditing ? { action: 'get_brief', brief_id: briefId } : {},
    'POST'
  );

  // Extract the brief data from the response
  const existingBrief = existingBriefData?.brief || existingBriefData?.data?.brief;

  // Hook for brief creation/update using the simplified approach
  const [briefActionParams, setBriefActionParams] = useState<Record<string, any>>({});
  
  const { 
    refresh: submitBrief,
    loading: submitting,
    error: submitError,
    data: submitResponse
  } = useEdgeFunction(
    'brief-operations',
    briefActionParams, // Parameters will be updated by form submission
    'POST'
  );

  // Handle effect when submit response is received
  useEffect(() => {
    if (submitResponse && !submitting) {
      // Extract brief ID from the response
      let briefId = submitResponse.brief_id || 
                   (submitResponse.brief && submitResponse.brief.id) || 
                   (submitResponse.data && submitResponse.data.brief_id);
      
      if (briefId) {
        console.log('Successfully created/updated brief with ID:', briefId);
        // Navigate to the brief chat page
        navigate(`/dashboard/briefs/${briefId}/chat`);
      }
    }
  }, [submitResponse, submitting, navigate]);

  // Handle effect when submit error occurs
  useEffect(() => {
    if (submitError) {
      setError(submitError);
      setIsSubmitting(false);
    }
  }, [submitError]);

  // Add a manual refresh capability for edge cases, like retrying after a failure
  const handleManualRefresh = () => {
    submitBrief();
  };

  const handleFormSubmit = async (briefData: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    // Set parameters for the Edge Function call
    // This will trigger the useEdgeFunction hook to refresh with new params
    setBriefActionParams({
      action: isEditing ? 'update_brief' : 'create_brief',
      brief_id: isEditing ? briefId : undefined,
      brief_data: briefData
      // No need to manually set request_id - it's added automatically by useEdgeFunction
    });
    
    // The actual API call happens automatically through the useEffect dependency on briefActionParams
  };

  if (isEditing && briefLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-lg">Loading brief data...</div>
      </div>
    );
  }

  if (isEditing && briefError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <h2 className="text-lg font-medium text-red-800">Error Loading Brief</h2>
        <p className="text-sm text-red-700 mt-2">{briefError}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Brief' : 'Create New Brief'}
      </h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <BriefForm 
        initialData={isEditing ? existingBrief : undefined}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting || submitting}
      />
    </div>
  );
};

export default BriefCreationPage;
