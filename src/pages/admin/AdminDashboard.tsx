import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Users, FileText, Search, Building2, 
  ChevronDown, ChevronRight, ExternalLink, Calendar, Clock,
  Filter, RefreshCw, AlertCircle
} from 'lucide-react';

interface AdminMetrics {
  totalUsers: number;
  totalBriefs: number;
  activeBriefs: number;
  totalSolutions: number;
  totalSuppliers: number;
  totalFastSearches: number;
  briefsThisWeek: number;
  activeUsersThisWeek: number;
}

interface Solution {
  id: string;
  name: string;
  status: string;
  fast_search_launched_at: string | null;
  created_at: string;
}

interface BriefWithStats {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email: string;
  solutions_count: number;
  suppliers_count: number;
  products_count: number;
  fast_searches_launched: number;
  solutions: Solution[];
  deep_search_requested: boolean;
}

const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const BriefRow: React.FC<{ brief: BriefWithStats }> = ({ brief }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      archived: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getSolutionStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      validated: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      finished: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-3 bg-white hover:shadow-sm transition-shadow">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <button className="text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{brief.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(brief.status)}`}>
                {brief.status}
              </span>
              {brief.deep_search_requested && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  Deep Search
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{brief.user_email}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-semibold text-gray-900">{brief.solutions_count}</p>
            <p className="text-xs text-gray-500">Solutions</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{brief.fast_searches_launched}</p>
            <p className="text-xs text-gray-500">Searches</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{brief.suppliers_count}</p>
            <p className="text-xs text-gray-500">Suppliers</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{brief.products_count}</p>
            <p className="text-xs text-gray-500">Products</p>
          </div>
          <div className="text-gray-400 text-xs">
            <Calendar size={14} className="inline mr-1" />
            {new Date(brief.created_at).toLocaleDateString()}
          </div>
          <Link 
            to={`/dashboard/briefs/${brief.id}/chat`}
            className="text-indigo-600 hover:text-indigo-800"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={18} />
          </Link>
        </div>
      </div>

      {expanded && brief.solutions.length > 0 && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Solutions</h4>
          <div className="space-y-2">
            {brief.solutions.map((solution) => (
              <div key={solution.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSolutionStatusBadge(solution.status)}`}>
                    {solution.status}
                  </span>
                  <span className="text-sm text-gray-900">{solution.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {solution.fast_search_launched_at && (
                    <span className="flex items-center gap-1">
                      <Search size={12} />
                      {new Date(solution.fast_search_launched_at).toLocaleString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(solution.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && brief.solutions.length === 0 && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 text-center text-sm text-gray-500">
          No solutions created yet
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { isAdmin, session } = useAuth();
  useI18n(); // Available for future translations
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [briefs, setBriefs] = useState<BriefWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchAdminData = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      };

      // Fetch metrics
      const metricsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`,
        {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ action: 'get_admin_metrics' })
        }
      );
      const metricsData = await metricsRes.json();
      if (metricsData.success) {
        setMetrics(metricsData.data);
      }

      // Fetch briefs
      const briefsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`,
        {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ 
            action: 'get_all_briefs',
            user_id: filterUser || undefined,
            status: filterStatus || undefined
          })
        }
      );
      const briefsData = await briefsRes.json();
      if (briefsData.success) {
        setBriefs(briefsData.data);
      } else {
        setError(briefsData.error || 'Failed to fetch briefs');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && session) {
      fetchAdminData();
    }
  }, [isAdmin, session, filterUser, filterStatus]);

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor all users and briefs</p>
          </div>
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Total Users"
              value={metrics.totalUsers}
              icon={<Users size={24} className="text-blue-600" />}
              color="bg-blue-100"
              subtitle={`${metrics.activeUsersThisWeek} active this week`}
            />
            <MetricCard
              title="Total Briefs"
              value={metrics.totalBriefs}
              icon={<FileText size={24} className="text-green-600" />}
              color="bg-green-100"
              subtitle={`${metrics.briefsThisWeek} created this week`}
            />
            <MetricCard
              title="Fast Searches"
              value={metrics.totalFastSearches}
              icon={<Search size={24} className="text-purple-600" />}
              color="bg-purple-100"
            />
            <MetricCard
              title="Suppliers Found"
              value={metrics.totalSuppliers}
              icon={<Building2 size={24} className="text-orange-600" />}
              color="bg-orange-100"
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <input
              type="text"
              placeholder="Filter by user email..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Briefs List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Briefs</h2>
            <span className="text-sm text-gray-500">{briefs.length} briefs</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : briefs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No briefs found</p>
            </div>
          ) : (
            <div>
              {briefs.map((brief) => (
                <BriefRow key={brief.id} brief={brief} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
