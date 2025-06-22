import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Users, AlertTriangle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'brief_created' | 'supplier_viewed' | 'status_change';
  title: string;
  timestamp: string;
  brief_id?: string;
  supplier_id?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const iconMap = {
  brief_created: <FileText className="h-5 w-5 text-gray-500" />,
  supplier_viewed: <Users className="h-5 w-5 text-gray-500" />,
  status_change: <AlertTriangle className="h-5 w-5 text-gray-500" />,
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.slice(0, 3).map((activity) => (
            <li key={activity.id} className="flex items-start space-x-4">
              <div>{iconMap[activity.type]}</div>
              <div>
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
