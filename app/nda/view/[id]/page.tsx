'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Shield, Printer, CheckCircle2, AlertTriangle, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

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

export default function NDAViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [nda, setNda] = useState<NDARecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const checkLocal = () => {
      try {
        const localItem = localStorage.getItem(`dailycab_nda_${id}`);
        if (localItem) {
          return JSON.parse(localItem);
        }
        const localListRaw = localStorage.getItem('dailycab_nda_list');
        if (localListRaw) {
          const list = JSON.parse(localListRaw);
          const found = list.find((item: NDARecord) => item.id === id);
          if (found) return found;
        }
      } catch (e) {
        console.warn('localStorage check error:', e);
      }
      return null;
    };

    fetch(`/api/nda/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setNda(data.data);
        } else {
          const localMatch = checkLocal();
          if (localMatch) {
            setNda(localMatch);
          } else {
            setError(data.message || 'NDA record not found');
          }
        }
      })
      .catch(err => {
        const localMatch = checkLocal();
        if (localMatch) {
          setNda(localMatch);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-content flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Loading Signed NDA ({id})...
        </div>
      </div>
    );
  }

  if (error || !nda) {
    return (
      <div className="min-h-screen bg-canvas text-content flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-4 border border-hairline">
          <AlertTriangle className="w-10 h-10 text-danger mx-auto" />
          <h1 className="text-xl font-bold font-display">NDA Not Found</h1>
          <p className="text-xs text-content-secondary">{error || `Could not find an executed NDA with ID: ${id}`}</p>
          <Link href="/nda" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 underline">
            <ArrowLeft className="w-4 h-4" /> Go to NDA Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-content font-sans pb-20 print:pb-0 print:bg-white print:text-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-canvas/80 backdrop-blur-md border-b border-hairline py-4 px-6 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <SjyCabsLogo />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Copy
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 print:mt-0 print:px-0 print:max-w-none space-y-6">
        
        {/* Verification Banner */}
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs font-black text-content">EXECUTED LEGAL AGREEMENT RECORD</div>
              <div className="text-micro text-content-secondary font-mono">Reference ID: {nda.id} • Submitted on {new Date(nda.createdAt).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-surface-2 hover:bg-surface-3 text-content font-bold text-xs px-3 py-2 rounded-xl border border-hairline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Download Copy
          </button>
        </div>

        {/* Document Header */}
        <div className="flex flex-col items-center mb-8 border-b-2 border-black pb-6">
          <div className="scale-125 mb-4 opacity-50 grayscale">
            <SjyCabsLogo />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest font-display text-center">
            NON-DISCLOSURE, PROPRIETARY RIGHTS & INTELLECTUAL PROPERTY AGREEMENT
          </h1>
          <p className="text-xs font-bold mt-2">AGREEMENT ID: {nda.id} | EXECUTED ON: {nda.date}</p>
          <p className="text-[10px] text-gray-600 mt-1">Under Indian Contract Act, 1872 & Indian Patents Act, 1970</p>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          {/* Party A */}
          <div className="p-4 rounded-xl border border-black space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1">
              PARTY A (The Disclosing Party / Founder)
            </h2>
            <div className="space-y-1 text-xs leading-relaxed">
              <p><span className="font-bold">Founder & Proprietor:</span> Sanjay Thakur</p>
              <p><span className="font-bold">Trade Name / Brand:</span> DailyCab (d/b/a SJY Mobility)</p>
              <p><span className="font-bold">Address:</span> 15, Bandichhod Marg, Sharda Nagar, Dhar, Madhya Pradesh — 454001</p>
              <p><span className="font-bold">Phone / WhatsApp:</span> +91-8109745019</p>
              <p><span className="font-bold">Email:</span> founder@dailycab.in</p>
            </div>
          </div>

          {/* Party B */}
          <div className="p-4 rounded-xl border border-black space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1">
              PARTY B (The Receiving Party / Signatory)
            </h2>
            <div className="space-y-1 text-xs leading-relaxed">
              <p><span className="font-bold">Full Name:</span> {nda.fullName}</p>
              <p><span className="font-bold">Father's/Spouse's Name:</span> {nda.fatherName}</p>
              <p><span className="font-bold">Role / Designation:</span> {nda.designation}</p>
              <p><span className="font-bold">Aadhaar Number:</span> XXXX-XXXX-{nda.aadhaar.slice(-4)}</p>
              <p><span className="font-bold">PAN Number:</span> {nda.pan.toUpperCase()}</p>
              <p><span className="font-bold">Phone:</span> {nda.phone}</p>
              <p><span className="font-bold">Email:</span> {nda.email}</p>
              <p><span className="font-bold">Address:</span> {nda.address}, {nda.cityState} - {nda.pinCode}</p>
            </div>
          </div>
        </div>

        {/* Agreement Text */}
        <div className="text-xs leading-relaxed space-y-4 pt-4 border-t border-black text-justify">
          <section>
            <h3 className="font-bold text-xs uppercase">Article 1 — Definition of Proprietary & Confidential Information</h3>
            <p>Includes all technical, operational, financial, business, and strategic information disclosed by Sanjay Thakur, including the intercity Ertiga 6-seat daily commuter shuttle model, route optimization logic, doorstep cluster pickup algorithms, 20/50-ride subscription passes, patent-pending inventions, seat maps, female safety locks, B2B parcel monetization, source code, DPRs, customer data, and broadcast groups.</p>
          </section>

          <section>
            <h3 className="font-bold text-xs uppercase">Article 2 — Patent Protection & Non-Circumvention Covenant</h3>
            <p>The Receiving Party acknowledges that Sanjay Thakur is filing utility/process patents under the Indian Patents Act, 1970 and agrees not to file competing patents, clone/reverse-engineer the shuttle model, or circumvent Sanjay Thakur to directly deal with DailyCab's drivers, investors, or vendors.</p>
          </section>

          <section>
            <h3 className="font-bold text-xs uppercase">Article 3 — Non-Compete & Non-Solicitation (Pan-India)</h3>
            <p>For 24 months post-termination, the Receiving Party shall NOT operate, invest in, advise, or be employed by any intercity daily commuter shuttle or subscription transport business in India, nor solicit DailyCab's team, drivers, or passengers.</p>
          </section>

          <section>
            <h3 className="font-bold text-xs uppercase">Article 4 — Ownership of Intellectual Property</h3>
            <p>All work product, code, designs, algorithms, customer lists, and brand assets created during the association belong exclusively to Sanjay Thakur from inception.</p>
          </section>

          <section>
            <h3 className="font-bold text-xs uppercase">Article 5 — Pre-Incorporation & Automatic Assignment</h3>
            <p>Upon incorporation of DailyCabs Pvt Ltd (or successor corporate entity), all rights, covenants, non-compete enforcement, and IP assignments held by Sanjay Thakur automatically transfer and vest in said company.</p>
          </section>

          <section>
            <h3 className="font-bold text-xs uppercase">Article 6 — Penalties & Remedies</h3>
            <p>Liquidated damages of ₹25,00,000 (Rupees Twenty-Five Lakhs Only) per instance of breach, plus ex-parte temporary injunction rights under Specific Relief Act 1963 and criminal prosecution under IPC/BNS and IT Act Section 66.</p>
          </section>

          <section>
            <h3 className="font-bold text-xs uppercase">Article 7 — Governing Law & Jurisdiction</h3>
            <p>Governed by Indian Law; exclusive jurisdiction of the competent Courts at Dhar, Madhya Pradesh.</p>
          </section>
        </div>

        {/* Signatures Block */}
        <div className="mt-12 pt-6 border-t-2 border-black w-full text-black">
          <div className="flex justify-between w-full">
            <div className="w-1/2 pr-8">
              <p className="text-xs font-bold mb-10 uppercase border-b border-black pb-1 inline-block">PARTY A (Founder & Disclosing Party)</p>
              <div className="h-16 mb-2 flex items-end">
                <p className="italic text-gray-700 font-serif text-sm">Sanjay Thakur</p>
              </div>
              <div className="border-t border-black pt-2">
                <p className="text-xs font-bold">SANJAY THAKUR</p>
                <p className="text-[10px]">Founder & Sole Proprietor — DailyCab (SJY Mobility)</p>
              </div>
            </div>
            <div className="w-1/2 pl-8">
              <p className="text-xs font-bold mb-10 uppercase border-b border-black pb-1 inline-block">PARTY B (The Receiving Party)</p>
              <div className="h-16 mb-2 flex items-end">
                {nda.signatureData ? (
                  <img src={nda.signatureData} alt="Signature" className="max-h-16 object-contain" />
                ) : (
                  <p className="italic text-gray-500 text-xs">Signature Present</p>
                )}
              </div>
              <div className="border-t border-black pt-2">
                <p className="text-xs font-bold">{nda.fullName}</p>
                <p className="text-[10px]">{nda.designation}</p>
                <p className="text-[10px]"><span className="font-bold">Executed:</span> {nda.date} at {nda.place}</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
