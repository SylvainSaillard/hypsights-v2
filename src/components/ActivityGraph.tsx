import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ActivityData {
  name: string;
  briefs: number;
  searches: number;
  deepSearches: number;
}

interface ActivityGraphProps {
  data: ActivityData[];
  weeklyChange: {
    briefs: number;
    searches: number;
    deepSearches: number;
  };
}

const chartConfig = {
  briefs: {
    label: 'Briefs',
    color: '#34D399',
  },
  searches: {
    label: 'Searches',
    color: '#60A5FA',
  },
  deepSearches: {
    label: 'Deep Searches',
    color: '#A78BFA',
  },
};

export function ActivityGraph({ data, weeklyChange }: ActivityGraphProps) {
  return (
    <Card className="bg-[#1A1F2C] text-white">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <p className="text-sm text-gray-400">Activity metrics for the past 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">Briefs Created</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{data.reduce((acc, cur) => acc + cur.briefs, 0)}</p>
              <span className={`flex items-center text-xs ${weeklyChange.briefs > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyChange.briefs > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {weeklyChange.briefs}%
              </span>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">Searches Launched</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{data.reduce((acc, cur) => acc + cur.searches, 0)}</p>
              <span className={`flex items-center text-xs ${weeklyChange.searches > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyChange.searches > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {weeklyChange.searches}%
              </span>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">Deep Searches</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{data.reduce((acc, cur) => acc + cur.deepSearches, 0)}</p>
              <span className={`flex items-center text-xs ${weeklyChange.deepSearches > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyChange.deepSearches > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {weeklyChange.deepSearches}%
              </span>
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Bar dataKey="briefs" fill={chartConfig.briefs.color} name={chartConfig.briefs.label} />
              <Bar dataKey="searches" fill={chartConfig.searches.color} name={chartConfig.searches.label} />
              <Bar dataKey="deepSearches" fill={chartConfig.deepSearches.color} name={chartConfig.deepSearches.label} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
