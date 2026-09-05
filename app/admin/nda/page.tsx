'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Shield, FileText, Search, Download, Eye, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/toast-provider';

interface NDARecord {
  id: string;
  fullName: string;
  fatherName: string;
  designation: string;
  aadhaar: string;
  pan: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  pinCode: string;
  place: string;
  date: string;
  signatureData: string;
  createdAt: string;
}

export default function AdminNDADashboard() {
  const { toast } = useToast();
  const [records, setRecords] = useState<NDARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');

  const fetchRecords = () => {
    setLoading(true);

    const getLocalRecords = (): NDARecord[] => {
      try {
        const localListRaw = localStorage.getItem('dailycab_nda_list');
        if (localListRaw) {
          return JSON.parse(localListRaw);
        }
      } catch (e) {
        console.warn('localStorage error:', e);
      }
      return [];
    };

    fetch('/api/nda')
      .then(res => res.json())
      .then(data => {
        const serverItems: NDARecord[] = data.status === 'success' ? (data.data || []) : [];
        const localItems = getLocalRecords();

        // Merge by ID to avoid duplicates
        const map = new Map<string, NDARecord>();
        for (const item of [...localItems, ...serverItems]) {
          if (item && item.id) map.set(item.id, item);
        }

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        setRecords(merged);
        setSource(data.source || (localItems.length > 0 ? 'Local + Vercel Database' : 'Vercel Database'));
      })
      .catch(err => {
        const localItems = getLocalRecords();
        if (localItems.length > 0) {
          setRecords(localItems);
          setSource('Client Offline Backup');
        } else {
          toast({ tone: 'error', title: 'Network Error', detail: err.message });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(r => {
    const q = search.toLowerCase();
    return (
      r.id?.toLowerCase().includes(q) ||
      r.fullName?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.aadhaar?.includes(q) ||
      r.pan?.toLowerCase().includes(q) ||
      r.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-canvas text-content font-sans pb-12">
      <header className="sticky top-0 z-10 bg-canvas/80 backdrop-blur-md border-b border-hairline py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SjyCabsLogo />
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> ADMIN NDA VAULT
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecords}
            className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-content border border-hairline transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        
        {/* Header Banner */}
        <div className="glass-card p-6 md:p-8 rounded-2xl border border-emerald-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black font-display tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-500" />
                Submitted Legal NDAs & IP Protection Repository
              </h1>
              <p className="text-xs text-content-secondary mt-1">
                All executed non-disclosure and intellectual property agreements collected via Vercel Database.
              </p>
            </div>
            <div className="bg-surface-2 px-4 py-2 rounded-xl border border-hairline text-xs font-mono font-bold shrink-0">
              Database: <span className="text-emerald-600 dark:text-emerald-400">{source || 'Vercel Database'}</span> • Total: <span className="text-content font-black">{records.length}</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Name, Phone, Aadhaar, PAN, or Reference ID..."
              className="w-full bg-surface-2 border border-hairline rounded-xl pl-11 pr-4 py-3 text-xs text-content focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* NDA Table */}
        <div className="glass-card rounded-2xl border border-hairline overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading NDA Repository...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-xs text-content-muted space-y-2">
              <FileText className="w-8 h-8 mx-auto text-content-muted opacity-50" />
              <p className="font-bold text-content">No NDA submissions found</p>
              <p>{search ? 'Try adjusting your search criteria.' : 'When members sign the NDA at /nda, they will automatically appear here.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-content-muted uppercase font-bold border-b border-hairline">
                  <tr>
                    <th className="p-3.5">Agreement ID</th>
                    <th className="p-3.5">Signatory Name</th>
                    <th className="p-3.5">Role / Designation</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Aadhaar / PAN</th>
                    <th className="p-3.5">Execution Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredRecords.map(r => (
                    <tr key={r.id} className="text-content hover:bg-surface-2/50 transition-all">
                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{r.id}</td>
                      <td className="p-3.5 font-bold">
                        <div>{r.fullName}</div>
                        <div className="text-micro text-content-muted font-normal">S/O: {r.fatherName}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full text-micro font-bold">{r.designation}</span>
                      </td>
                      <td className="p-3.5 font-mono">
                        <div>{r.phone}</div>
                        <div className="text-micro text-content-muted">{r.email}</div>
                      </td>
                      <td className="p-3.5 font-mono text-micro">
                        <div>Aadhaar: XXXX-XXXX-{r.aadhaar.slice(-4)}</div>
                        <div>PAN: {r.pan.toUpperCase()}</div>
                      </td>
                      <td className="p-3.5 text-content-secondary">{r.date}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/nda/view/${r.id}`}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-micro px-3 py-1.5 rounded-lg shadow-sm"
                          target="_blank"
                        >
                          <Eye className="w-3 h-3" /> View & Print Copy
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
