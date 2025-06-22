import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

interface QuotaWarningProps {
  quotaReached: boolean;
}

export function QuotaWarning({ quotaReached }: QuotaWarningProps) {
  if (!quotaReached) {
    return null;
  }

  return (
    <Alert variant="destructive" className="bg-red-500 text-white border-red-500">
      <AlertCircle className="h-4 w-4 !text-white" />
      <AlertTitle>Monthly quota reached</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        You've used all your fast searches for this month.
        <Button variant="outline" className="bg-white text-red-500 border-white hover:bg-gray-100">Upgrade Plan</Button>
      </AlertDescription>
    </Alert>
  );
}
