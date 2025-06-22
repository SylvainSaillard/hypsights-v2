import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart3, AreaChart } from 'lucide-react';

interface BriefUsageInsightsProps {
  data: {
    totalSearches: number;
    maxSearches: number;
    fastSearches: number;
    deepSearches: number;
    popularSectors: Array<{ name: string; count: number }>;
  };
}

export function BriefUsageInsights({ data }: BriefUsageInsightsProps) {
  const fastSearchPercentage = (data.fastSearches / data.totalSearches) * 100;
  const deepSearchPercentage = (data.deepSearches / data.totalSearches) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brief Usage Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Searches Used</span>
            <span className="text-sm text-muted-foreground">
              {data.totalSearches} of {data.maxSearches}
            </span>
          </div>
          <Progress value={(data.totalSearches / data.maxSearches) * 100} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Fast Search vs Deep Search</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(fastSearchPercentage)}% / {Math.round(deepSearchPercentage)}%
            </span>
          </div>
          <div className="flex w-full h-2 rounded-full overflow-hidden">
            <div
              className="bg-green-500"
              style={{ width: `${fastSearchPercentage}%` }}
            ></div>
            <div
              className="bg-purple-500"
              style={{ width: `${deepSearchPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <div className="flex items-center">
              <BarChart3 className="h-3 w-3 mr-1 text-green-500" /> Fast ({data.fastSearches})
            </div>
            <div className="flex items-center">
              <AreaChart className="h-3 w-3 mr-1 text-purple-500" /> Deep ({data.deepSearches})
            </div>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium">Most Popular Sector</span>
          <p className="text-muted-foreground">
            {data.popularSectors[0]?.name} ({data.popularSectors[0]?.count} briefs)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
