import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp } from 'lucide-react';

interface KPIDashboardProps {
  kpis: {
    activeBriefs: number;
    completedBriefs: number;
    productsFound: number;
    suppliersFound: number;
  };
}

export function KPIDashboard({ kpis }: KPIDashboardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-hypsights-green/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Briefs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activeBriefs}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" /> Increased from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Completed Briefs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.completedBriefs}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" /> Increased from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Suppliers Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.suppliersFound}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" /> Matching your requirements
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Products Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.productsFound}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" /> Matching your requirements
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
