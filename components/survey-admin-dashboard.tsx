'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  MessageSquare, 
  PhoneCall, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  Award,
  Trash2
} from 'lucide-react';
import { SurveyResponseItem } from '@/app/api/survey/route';

export function SurveyAdminDashboard() {
  const [responses, setResponses] = useState<SurveyResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [filterPlan, setFilterPlan] = useState('ALL');

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/survey');
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.responses)) {
        // Combine with localStorage if any local submissions exist
        const local = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('dailycab_survey_responses') || '[]')
          : [];
        
        // Merge and deduplicate by phone/timestamp
        const combined = [...data.responses];
        local.forEach((locItem: any) => {
          if (!combined.some(c => c.phone === locItem.phone && c.timestamp === locItem.timestamp)) {
            combined.unshift({
              id: `LOC-${Math.floor(1000 + Math.random() * 9000)}`,
              ...locItem
            });
          }
        });

        setResponses(combined);
      }
    } catch (err) {
      console.error('Failed to load survey responses', err);
    } finally {
      setLoading(false);
    }
  };

  const clearAllResponses = async () => {
    if (!confirm('Are you sure you want to clear all survey responses? This action cannot be undone.')) {
      return;
    }
    try {
      await fetch('/api/survey', { method: 'DELETE' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dailycab_survey_responses');
      }
      setResponses([]);
    } catch (err) {
      console.error('Failed to clear responses', err);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  // Filtered responses logic
  const filteredResponses = responses.filter(item => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      (item.feedback && item.feedback.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRoute = filterRoute === 'ALL' || item.route === filterRoute;
    const matchesPlan = 
      filterPlan === 'ALL' || 
      item.preferredPlan === filterPlan ||
      (filterPlan === 'single_299' && (item.preferredPlan === 'single_299' || item.preferredPlan === 'single_249'));

    return matchesSearch && matchesRoute && matchesPlan;
  });

  // Calculate Metrics
  const totalCount = responses.length;
  const pass50Count = responses.filter(r => r.preferredPlan === 'pass_50').length;
  const pass20Count = responses.filter(r => r.preferredPlan === 'pass_20').length;
  const singleCount = responses.filter(r => r.preferredPlan === 'single_299' || r.preferredPlan === 'single_249').length;
  const doorstepCount = responses.filter(r => r.pickupPreference === 'doorstep').length;

  const pass50Percent = totalCount ? Math.round((pass50Count / totalCount) * 100) : 0;
  const doorstepPercent = totalCount ? Math.round((doorstepCount / totalCount) * 100) : 0;

  // Export to CSV logic
  const exportToCSV = () => {
    if (!responses.length) return;

    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'User Category', 'Route', 'Frequency', 'Preferred Plan', 'Pickup Preference', 'Top Priority', 'Feedback', 'Timestamp'];
    const rows = filteredResponses.map(r => [
      r.id,
      `"${r.fullName}"`,
      `"${r.phone}"`,
      `"${r.email || ''}"`,
      r.userCategory || '',
      r.route,
      r.frequency,
      r.preferredPlan,
      r.pickupPreference,
      r.topPriority,
      `"${(r.feedback || '').replace(/"/g, '""')}"`,
      r.timestamp
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dailycab_survey_responses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Refresh Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-2 p-5 rounded-3xl border border-hairline">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Market Validation Control Center
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display text-content">
            Public Survey & Lead Submissions
          </h2>
          <p className="text-xs text-content-muted">
            Real-time public responses submitted via dailycab.in coming soon portal.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchResponses}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-surface-1 border border-hairline hover:border-content text-content px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={totalCount === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {totalCount > 0 && (
            <button
              onClick={clearAllResponses}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              title="Clear all responses"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Total Responses */}
        <div className="glass-card p-4 md:p-5 border border-hairline space-y-1">
          <div className="flex justify-between items-center text-content-muted">
            <span className="text-micro font-black uppercase tracking-wider">Total Submissions</span>
            <Users className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl md:text-3xl font-black font-display text-content">
            {totalCount}
          </div>
          <div className="text-micro text-content-muted font-semibold">
            Real Verified Leads
          </div>
        </div>

        {/* Card 2: Daily Pass 9999 Demand */}
        <div className="glass-card p-4 md:p-5 border-2 border-emerald-500/40 bg-emerald-500/5 space-y-1">
          <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
            <span className="text-micro font-black uppercase tracking-wider">₹9,999 Pass Demand</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-black font-display text-emerald-600 dark:text-emerald-400">
            {pass50Percent}%
          </div>
          <div className="text-micro font-bold text-success">
            {pass50Count} users want 50-Ride Pass
          </div>
        </div>

        {/* Card 3: Starter Pass 4999 */}
        <div className="glass-card p-4 md:p-5 border border-hairline space-y-1">
          <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
            <span className="text-micro font-black uppercase tracking-wider">₹4,999 Pass Demand</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-black font-display text-indigo-600 dark:text-indigo-400">
            {pass20Count}
          </div>
          <div className="text-micro text-content-muted font-semibold">
            20-Ride Starter Pass Leads
          </div>
        </div>

        {/* Card 4: Doorstep Pickup Preference */}
        <div className="glass-card p-4 md:p-5 border border-hairline space-y-1">
          <div className="flex justify-between items-center text-warning">
            <span className="text-micro font-black uppercase tracking-wider">Doorstep Pick %</span>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-2xl md:text-3xl font-black font-display text-content">
            {doorstepPercent}%
          </div>
          <div className="text-micro text-content-muted font-semibold">
            Prefer Home Doorstep Pick
          </div>
        </div>

      </div>

      {/* Plan Preference Distribution Progress Bar */}
      <div className="glass-card p-5 border border-hairline space-y-3">
        <div className="flex justify-between items-center text-xs font-black">
          <span className="text-content uppercase tracking-wider">Pricing Plan Willingness-To-Pay Breakdown</span>
          <span className="text-content-muted">{totalCount} Responses</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-4 w-full bg-surface-2 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${totalCount ? (pass50Count / totalCount) * 100 : 33}%` }} 
            className="bg-emerald-500 h-full flex items-center justify-center text-[9px] font-black text-white"
            title="Daily Pass ₹9999"
          >
            {pass50Count > 0 && `₹9,999 (${pass50Count})`}
          </div>
          <div 
            style={{ width: `${totalCount ? (pass20Count / totalCount) * 100 : 33}%` }} 
            className="bg-indigo-500 h-full flex items-center justify-center text-[9px] font-black text-white"
            title="Starter Pass ₹4999"
          >
            {pass20Count > 0 && `₹4,999 (${pass20Count})`}
          </div>
          <div 
            style={{ width: `${totalCount ? (singleCount / totalCount) * 100 : 34}%` }} 
            className="bg-amber-500 h-full flex items-center justify-center text-[9px] font-black text-white"
            title="Single Ride ₹299"
          >
            {singleCount > 0 && `₹299 (${singleCount})`}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-micro font-bold">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Daily Pass 50-Rides @ ₹9,999 ({pass50Count})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Starter Pass 20-Rides @ ₹4,999 ({pass20Count})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Single Ride @ ₹299 ({singleCount})</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-content-muted" />
          <input
            type="text"
            placeholder="Search by passenger name, phone, or feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand"
          />
        </div>

        {/* Filter Route */}
        <div className="w-full md:w-48">
          <select
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand cursor-pointer"
          >
            <option value="ALL">All Corridors</option>
            <option value="DHR-IND">Dhar ↔ Indore</option>
            <option value="UJJ-IND">Ujjain ↔ Indore</option>
            <option value="DEW-IND">Dewas ↔ Indore</option>
          </select>
        </div>

        {/* Filter Plan */}
        <div className="w-full md:w-48">
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand cursor-pointer"
          >
            <option value="ALL">All Pricing Plans</option>
            <option value="pass_50">Daily Pass (₹9,999)</option>
            <option value="pass_20">Starter Pass (₹4,999)</option>
            <option value="single_299">Single Ride (₹299)</option>
          </select>
        </div>

      </div>

      {/* Submissions Table */}
      <div className="glass-card border border-hairline rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-hairline text-content-muted font-extrabold uppercase tracking-wider text-micro">
              <tr>
                <th className="p-4">Responder</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Route</th>
                <th className="p-4">Preferred Plan</th>
                <th className="p-4">Pickup Style</th>
                <th className="p-4">Top Priority</th>
                <th className="p-4">Feedback / Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline font-medium text-content">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-content-muted font-bold">
                    No real user survey submissions recorded yet. Submissions from dailycab.in will appear here in real-time.
                  </td>
                </tr>
              ) : (
                filteredResponses.map((item) => {
                  const cleanPhone = item.phone.replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=Hi%20${encodeURIComponent(item.fullName)},%20thank%20you%20for%20your%20interest%20in%20DailyCab!%20Your%20Phase-1%20VIP%20seat%20reservation%20is%20received.%20Your%20code%20is%20DAILYCAB10.`;

                  return (
                    <tr key={item.id} className="hover:bg-surface-2/60 transition-colors">
                      {/* Name */}
                      <td className="p-4">
                        <div className="font-extrabold text-content">{item.fullName}</div>
                        <div className="text-micro text-content-muted font-mono">{item.id} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        {item.userCategory && (
                          <span className="inline-block mt-0.5 text-micro font-bold text-brand bg-brand/10 px-1.5 py-0.2 rounded capitalize">
                            {item.userCategory}
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="p-4 font-mono font-bold text-brand">
                        {item.phone}
                      </td>

                      {/* Route */}
                      <td className="p-4">
                        <span className="bg-indigo-500/10 border border-indigo-500/30 text-brand px-2 py-0.5 rounded text-micro font-extrabold">
                          {item.route}
                        </span>
                        <div className="text-micro text-content-muted mt-0.5 capitalize">{item.frequency.replace('_', ' ')}</div>
                      </td>

                      {/* Plan */}
                      <td className="p-4">
                        {item.preferredPlan === 'pass_50' && (
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-micro font-black">
                            Daily Pass ₹9,999
                          </span>
                        )}
                        {item.preferredPlan === 'pass_20' && (
                          <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-micro font-black">
                            Starter Pass ₹4,999
                          </span>
                        )}
                        {(item.preferredPlan === 'single_299' || item.preferredPlan === 'single_249') && (
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-micro font-black">
                            Single Ride ₹299
                          </span>
                        )}
                      </td>

                      {/* Pickup */}
                      <td className="p-4">
                        <span className={`text-micro font-bold ${item.pickupPreference === 'doorstep' ? 'text-success' : 'text-content-muted'}`}>
                          {item.pickupPreference === 'doorstep' ? '📍 Doorstep' : '🚏 Bus Stand'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="p-4 text-micro font-bold text-content-secondary capitalize">
                        {item.topPriority.replace('_', ' ')}
                      </td>

                      {/* Feedback */}
                      <td className="p-4 max-w-xs text-micro text-content-secondary truncate" title={item.feedback}>
                        {item.feedback || '—'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-micro font-black px-2.5 py-1.5 rounded-lg shadow transition-all"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
