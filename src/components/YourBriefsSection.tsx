import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Package, Calendar, Bell, Sparkles } from 'lucide-react';

interface Brief {
  id: string;
  title: string;
  description: string;
  sector?: string;
  budget?: string;
  createdDays: number;
  hasNewResults?: boolean;
  updates?: {
    newCompanies?: number;
    newProducts?: number;
    newSolutions?: number;
  };
  fastSearches?: number;
}

interface YourBriefsSectionProps {
  briefs: Brief[];
}

function BriefCard({ brief }: { brief: Brief }) {
  const hasNewResults = brief.hasNewResults;

  return (
    <Card className={`p-4 ${hasNewResults ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{brief.title}</h3>
        {hasNewResults && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Bell className="mr-1 h-3 w-3" />
            New Content
          </Badge>
        )}
      </div>
      <div className="text-sm text-muted-foreground mt-2 space-x-4 flex items-center">
        {brief.sector && <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1" /> {brief.sector}</span>}
        {brief.budget && <span className="flex items-center"><Package className="h-4 w-4 mr-1" /> {brief.budget}</span>}
        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {brief.createdDays} days ago</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {brief.updates ? (
          <>
            <div>
              <p className="font-bold text-lg">{brief.updates.newCompanies}</p>
              <p className="text-xs text-muted-foreground">Companies</p>
            </div>
            <div>
              <p className="font-bold text-lg">{brief.updates.newProducts}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div>
              <p className="font-bold text-lg">{brief.updates.newSolutions}</p>
              <p className="text-xs text-muted-foreground">Solutions</p>
            </div>
          </>
        ) : (
          <>
            <div className="py-2 bg-gray-100 rounded-md">
              <p className="text-muted-foreground">-</p>
              <p className="text-xs text-muted-foreground">Companies</p>
            </div>
            <div className="py-2 bg-gray-100 rounded-md">
              <p className="text-muted-foreground">-</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div className="py-2 bg-gray-100 rounded-md">
              <p className="text-muted-foreground">-</p>
              <p className="text-xs text-muted-foreground">Solutions</p>
            </div>
          </>
        )}
      </div>
      <Button className="w-full mt-4 bg-slate-500 hover:bg-slate-600">
        {hasNewResults ? (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            View {brief.updates?.newCompanies || 0} New Results
          </>
        ) : (
          'Complete & Submit Brief'
        )}
      </Button>
    </Card>
  );
}

export function YourBriefsSection({ briefs }: YourBriefsSectionProps) {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold">Your Briefs</h2>
      <p className="text-muted-foreground">Select a brief to view its details and progress</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {briefs.map((brief) => (
          <BriefCard key={brief.id} brief={brief} />
        ))}
      </div>
    </Card>
  );
}
