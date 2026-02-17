import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  Users, FileText, Search, TrendingUp, RefreshCw, 
  ChevronDown, ChevronUp, ExternalLink, Calendar, Mail,
  Settings, Save, CheckCircle, AlertCircle
} from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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
  user_id: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  solutions_count: number;
  suppliers_count: number;
  products_count: number;
  fast_searches_launched: number;
  solutions: Solution[];
}

interface UserWithMetadata {
  user_id: string;
  email: string;
  role: string;
  fast_searches_quota: number;
  fast_searches_used: number;
  deep_searches_count: number;
  preferred_locale: string;
  onboarding_completed: boolean;
  created_at: string;
  last_active_at: string | null;
}

const AdminDashboard = () => {
  const { isAdmin, session } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [briefs, setBriefs] = useState<BriefWithStats[]>([]);
  const [users, setUsers] = useState<UserWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'briefs' | 'users' | 'settings'>('briefs');
  const [expandedBriefs, setExpandedBriefs] = useState<Set<string>>(new Set());
  const [filterUser, setFilterUser] = useState<string>('');
  
  // Settings state
  const [testWebhookUrl, setTestWebhookUrl] = useState<string>('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const callAdminApi = async (action: string, params: object = {}) => {
    const token = session?.access_token;
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action, ...params })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'API call failed');
    return data.data;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, briefsData, usersData] = await Promise.all([
        callAdminApi('get_admin_metrics'),
        callAdminApi('get_all_briefs'),
        callAdminApi('get_all_users')
      ]);
      setMetrics(metricsData);
      setBriefs(briefsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'test_fast_search_webhook_url')
        .single();
      
      if (fetchError) {
        console.error('Error fetching admin settings:', fetchError);
      } else if (data) {
        setTestWebhookUrl(data.setting_value || '');
      }
    } catch (err) {
      console.error('Exception fetching settings:', err);
    }
  };

  const saveSettings = async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSaved(false);
    try {
      const { error: updateError } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: testWebhookUrl,
          updated_by: session?.user?.id
        })
        .eq('setting_key', 'test_fast_search_webhook_url');
      
      if (updateError) {
        throw updateError;
      }
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSettingsError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      fetchSettings();
    }
  }, [isAdmin]);

  const toggleBriefExpanded = (briefId: string) => {
    setExpandedBriefs(prev => {
      const next = new Set(prev);
      if (next.has(briefId)) {
        next.delete(briefId);
      } else {
        next.add(briefId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      archived: 'bg-red-100 text-red-700',
      validated: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-700';
  };

  // Redirect non-admins
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredBriefs = filterUser 
    ? briefs.filter(b => b.user_email.toLowerCase().includes(filterUser.toLowerCase()))
    : briefs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Gérer les utilisateurs et les briefs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retour au Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
                  <p className="text-sm text-gray-500">Utilisateurs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalBriefs}</p>
                  <p className="text-sm text-gray-500">Briefs totaux</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalFastSearches}</p>
                  <p className="text-sm text-gray-500">Fast Searches</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metrics.briefsThisWeek}</p>
                  <p className="text-sm text-gray-500">Briefs cette semaine</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('briefs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'briefs'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Briefs ({briefs.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Utilisateurs ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Paramétrage
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Briefs Tab */}
            {activeTab === 'briefs' && (
              <div className="space-y-4">
                {/* Filter */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <input
                    type="text"
                    placeholder="Filtrer par email utilisateur..."
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Briefs List */}
                {filteredBriefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleBriefExpanded(brief.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {brief.title || 'Brief sans titre'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(brief.status)}`}>
                              {brief.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {brief.user_email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(brief.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-3 text-sm">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              {brief.solutions_count} solutions
                            </span>
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                              {brief.suppliers_count} suppliers
                            </span>
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                              {brief.fast_searches_launched} searches
                            </span>
                          </div>
                          {expandedBriefs.has(brief.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedBriefs.has(brief.id) && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            {brief.description || 'Pas de description'}
                          </p>
                        </div>

                        {/* Solutions */}
                        {brief.solutions && brief.solutions.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-700 mb-2">Solutions:</h4>
                            {brief.solutions.map((solution) => (
                              <div
                                key={solution.id}
                                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                              >
                                <div>
                                  <span className="font-medium text-gray-800">{solution.name}</span>
                                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getStatusBadge(solution.status)}`}>
                                    {solution.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  {solution.fast_search_launched_at ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <Search className="w-4 h-4" />
                                      Fast Search: {formatDate(solution.fast_search_launched_at)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">Pas de Fast Search</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <Link
                            to={`/dashboard/briefs/${brief.id}/chat`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Voir le brief
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredBriefs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Aucun brief trouvé
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rôle</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fast Searches</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Langue</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Créé le</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dernière activité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.fast_searches_used} / {user.fast_searches_quota}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.preferred_locale}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.last_active_at ? formatDate(user.last_active_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Fast Search Test Webhook */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Fast Search - Webhook de Test</h3>
                      <p className="text-sm text-gray-500">URL du webhook N8n utilisé pour les tests de Fast Search (environnement de recette)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL du webhook de test
                      </label>
                      <input
                        type="url"
                        value={testWebhookUrl}
                        onChange={(e) => setTestWebhookUrl(e.target.value)}
                        placeholder="https://n8n-hypsights.proxiwave.app/webhook-test/..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Ce webhook sera utilisé à la place du webhook de production lorsqu'un admin lance un "Test Fast Search"
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={saveSettings}
                        disabled={settingsLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium text-sm"
                      >
                        <Save className={`w-4 h-4 ${settingsLoading ? 'animate-spin' : ''}`} />
                        {settingsLoading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      
                      {settingsSaved && (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Paramètres sauvegardés
                        </span>
                      )}
                      
                      {settingsError && (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {settingsError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Comment utiliser le Test Fast Search ?</p>
                      <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Configurez l'URL du webhook de test ci-dessus</li>
                        <li>Sur la page d'un brief, un bouton orange "Test Fast Search" apparaît sous chaque solution validée</li>
                        <li>Ce bouton est <strong>uniquement visible pour les administrateurs</strong></li>
                        <li>Le test utilise le webhook configuré ici au lieu du webhook de production</li>
                        <li>Les données envoyées au webhook sont identiques au mode production</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
