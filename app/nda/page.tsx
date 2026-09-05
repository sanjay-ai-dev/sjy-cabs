'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { SignaturePad, SignaturePadRef } from '@/components/signature-pad';
import { useToast } from '@/components/toast-provider';
import { Shield, Lock, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function NDAPage() {
  const { toast } = useToast();
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    designation: '',
    aadhaar: '',
    pan: '',
    address: '',
    cityState: '',
    pinCode: '',
    phone: '',
    email: '',
    consent: false,
    place: '',
    date: '',
  });

  const [signatureData, setSignatureData] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    const requiredFields = [
      'fullName', 'fatherName', 'designation', 'aadhaar', 'pan',
      'address', 'cityState', 'pinCode', 'phone', 'email', 'place'
    ] as const;

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        toast({ tone: 'error', title: 'Incomplete Form', detail: `Please fill in all required fields.` });
        return false;
      }
    }

    if (formData.aadhaar.replace(/\s/g, '').length !== 12) {
      toast({ tone: 'error', title: 'Invalid Aadhaar', detail: 'Aadhaar number must be exactly 12 digits.' });
      return false;
    }

    if (formData.pan.length !== 10) {
      toast({ tone: 'error', title: 'Invalid PAN', detail: 'PAN card must be exactly 10 characters.' });
      return false;
    }

    if (!formData.consent) {
      toast({ tone: 'error', title: 'Consent Required', detail: 'Please agree to the terms and conditions.' });
      return false;
    }
    
    const sig = signaturePadRef.current?.getSignatureDataUrl();
    if (!sig) {
      toast({ tone: 'error', title: 'Signature Required', detail: 'Please sign the document before submitting.' });
      return false;
    }
    
    setSignatureData(sig);
    return sig;
  };

  const [submitting, setSubmitting] = useState(false);
  const [submittedNdaId, setSubmittedNdaId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sig = validateForm();
    if (!sig) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        signatureData: sig
      };

      const res = await fetch('/api/nda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      const assignedId = data.ndaId || `NDA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Client-side persistent backup in localStorage
      try {
        const fullRecord = data.data || {
          id: assignedId,
          ...payload,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`dailycab_nda_${assignedId}`, JSON.stringify(fullRecord));

        const existingListRaw = localStorage.getItem('dailycab_nda_list');
        const existingList = existingListRaw ? JSON.parse(existingListRaw) : [];
        existingList.unshift(fullRecord);
        localStorage.setItem('dailycab_nda_list', JSON.stringify(existingList));
      } catch (e) {
        console.warn('localStorage save warning:', e);
      }

      setSubmittedNdaId(assignedId);
      toast({ tone: 'success', title: 'NDA Executed & Saved', detail: `Agreement record created: ${assignedId}` });
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err: any) {
      toast({ tone: 'error', title: 'Network Error', detail: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-content font-sans pb-20 print:pb-0 print:bg-white print:text-black">
      {/* Web Header */}
      <header className="sticky top-0 z-10 bg-canvas/80 backdrop-blur-md border-b border-hairline py-4 px-6 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <SjyCabsLogo />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-black px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Legally Binding Proprietorship NDA & IP Protection
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 print:mt-0 print:px-0 print:max-w-none">
        
        {/* Print Only Header */}
        <div className="hidden print:flex flex-col items-center mb-8 border-b-2 border-black pb-6">
          <div className="scale-125 mb-4 opacity-50 grayscale">
            <SjyCabsLogo />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest font-display text-center">
            NON-DISCLOSURE, PROPRIETARY RIGHTS & INTELLECTUAL PROPERTY AGREEMENT
          </h1>
          <p className="text-xs font-bold mt-2">EXECUTED ON: {formData.date}</p>
          <p className="text-[10px] text-gray-600 mt-1">Under Indian Contract Act, 1872 & Indian Patents Act, 1970</p>
        </div>

        {/* Web Header */}
        <div className="text-center mb-10 print:hidden space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black">
            <Lock className="w-4 h-4" />
            PATENT-PENDING MODEL & PROPRIETARY BUSINESS PROTECTION
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight">
            Non-Disclosure & Intellectual Property Agreement
          </h1>
          <p className="text-content-secondary text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            This agreement is executed between <strong>Sanjay Thakur (Founder)</strong> and the joining member/partner to protect the patent-pending intercity daily commuter shuttle model, proprietary algorithms, trade secrets, and business operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Party Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Party A */}
            <div className="glass-card p-6 rounded-2xl border border-hairline print:border-black print:rounded-none print:shadow-none print:p-4 space-y-3">
              <h2 className="text-sm font-display font-black uppercase tracking-wider pb-2 border-b border-hairline print:border-black text-emerald-600 dark:text-emerald-400 print:text-black">
                PARTY A (The Disclosing Party / Founder)
              </h2>
              <div className="space-y-2 text-xs text-content-secondary print:text-black leading-relaxed">
                <p><span className="font-bold text-content print:text-black">Founder & Proprietor:</span> Sanjay Thakur</p>
                <p><span className="font-bold text-content print:text-black">Trade Name / Brand:</span> DailyCab (d/b/a SJY Mobility)</p>
                <p><span className="font-bold text-content print:text-black">Residential & Business Address:</span> 15, Bandichhod Marg, Sharda Nagar, Dhar, Madhya Pradesh — 454001</p>
                <p><span className="font-bold text-content print:text-black">Contact Phone / WhatsApp:</span> +91-8109745019</p>
                <p><span className="font-bold text-content print:text-black">Official Email:</span> founder@dailycab.in</p>
                <p className="text-[11px] text-content-muted italic pt-1 border-t border-hairline print:border-gray-300">
                  *Executing in personal capacity as Founder & Sole Proprietor. All rights, covenants, and remedies automatically assignable to "DailyCabs Pvt Ltd" (or successor corporate entity) upon incorporation.
                </p>
              </div>
            </div>

            {/* Party B */}
            <div className="glass-card p-6 rounded-2xl border border-hairline print:border-black print:rounded-none print:shadow-none print:p-4 space-y-3">
              <h2 className="text-sm font-display font-black uppercase tracking-wider pb-2 border-b border-hairline print:border-black text-brand print:text-black">
                PARTY B (The Receiving Party / Signatory)
              </h2>
              
              <div className="space-y-3 print:hidden">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-micro font-bold mb-1 text-content-secondary">Full Legal Name *</label>
                    <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium" placeholder="Full Name as per Aadhaar" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-micro font-bold mb-1 text-content-secondary">Father's / Spouse's Name *</label>
                    <input required name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium" placeholder="Father/Spouse Name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-micro font-bold mb-1 text-content-secondary">Designation / Role Joining As *</label>
                    <select required name="designation" value={formData.designation} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium">
                      <option value="">Select Role...</option>
                      <option value="Co-Founder / Core Team Member">Co-Founder / Core Team Member</option>
                      <option value="CTO / Tech Lead">CTO / Tech Lead</option>
                      <option value="Operations Manager / Head">Operations Manager / Head</option>
                      <option value="Marketing Lead">Marketing Lead</option>
                      <option value="Driver Partner / Vehicle Owner">Driver Partner / Vehicle Owner</option>
                      <option value="Investor / Angel Partner">Investor / Angel Partner</option>
                      <option value="Strategic Advisor">Strategic Advisor</option>
                      <option value="Contractor / Consultant">Contractor / Consultant</option>
                      <option value="Other">Other Partner</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-micro font-bold mb-1 text-content-secondary">Phone / WhatsApp Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium" placeholder="10-digit mobile" maxLength={10} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-micro font-bold mb-1 text-content-secondary">Aadhaar Number (12-digit) *</label>
                    <input required name="aadhaar" value={formData.aadhaar} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono" placeholder="12-digit number" maxLength={14} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-micro font-bold mb-1 text-content-secondary">PAN Card Number *</label>
                    <input required name="pan" value={formData.pan} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono uppercase" placeholder="ABCDE1234F" maxLength={10} />
                  </div>
                </div>

                <div>
                  <label className="block text-micro font-bold mb-1 text-content-secondary">Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium" placeholder="email@example.com" />
                </div>

                <div>
                  <label className="block text-micro font-bold mb-1 text-content-secondary">Full Permanent Address *</label>
                  <textarea required name="address" value={formData.address} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 resize-none font-medium" rows={2} placeholder="House No., Street, Landmark" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-micro font-bold mb-1 text-content-secondary">City & State *</label>
                    <input required name="cityState" value={formData.cityState} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium" placeholder="e.g. Dhar, MP" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-micro font-bold mb-1 text-content-secondary">PIN Code *</label>
                    <input required name="pinCode" value={formData.pinCode} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium" placeholder="454001" maxLength={6} />
                  </div>
                </div>
              </div>

              {/* Print View of Party B */}
              <div className="hidden print:block space-y-1.5 text-black text-xs">
                <p><span className="font-bold">Full Legal Name:</span> {formData.fullName || '________________________'}</p>
                <p><span className="font-bold">Father's/Spouse's Name:</span> {formData.fatherName || '________________________'}</p>
                <p><span className="font-bold">Role / Joining As:</span> {formData.designation || '________________________'}</p>
                <p><span className="font-bold">Aadhaar Number:</span> {formData.aadhaar ? 'XXXX-XXXX-' + formData.aadhaar.slice(-4) : '________________________'}</p>
                <p><span className="font-bold">PAN Number:</span> {formData.pan ? formData.pan.toUpperCase() : '________________________'}</p>
                <p><span className="font-bold">Phone:</span> {formData.phone || '________________________'}</p>
                <p><span className="font-bold">Email:</span> {formData.email || '________________________'}</p>
                <p><span className="font-bold">Address:</span> {formData.address || '________________________'}, {formData.cityState || '___________'} - {formData.pinCode || '______'}</p>
              </div>
            </div>
          </div>

          {/* Agreement Clauses */}
          <div className="glass-card p-6 md:p-10 rounded-2xl border border-hairline text-xs sm:text-sm leading-relaxed space-y-6 print:border-none print:p-0 print:shadow-none print:text-black print:text-xs print:leading-normal">
            
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs space-y-1 print:hidden">
              <div className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                STRICT LEGAL WARNING & INTELLECTUAL PROPERTY NOTICE
              </div>
              <p className="text-content-secondary leading-relaxed">
                This agreement protects the trade secrets, patent-pending business processes, algorithm designs, and intercity commuter operational frameworks developed by Sanjay Thakur. Any unauthorized replication, reverse-engineering, poaching, or disclosure will face immediate legal action under civil and criminal laws of India.
              </p>
            </div>
            
            <p className="print:hidden italic text-content-muted text-center text-xs">
              This Agreement is entered into on this {formData.date} by and between <strong>Sanjay Thakur (Founder & Sole Proprietor of DailyCab)</strong> and <strong>{formData.fullName || '[The Receiving Party]'}</strong>.
            </p>
            
            <div className="space-y-6">
              
              <section>
                <h3 className="font-display font-black text-sm sm:text-base mb-1.5 text-content print:text-black">
                  Article 1 — Definition of Proprietary & Confidential Information & Exclusions
                </h3>
                <p className="text-content-secondary print:text-black text-justify leading-relaxed">
                  "Confidential Information" shall include all technical, operational, financial, business, and strategic information disclosed by Sanjay Thakur (Founder) or accessed by the Receiving Party, including: (a) Intercity Ertiga 6-seat daily commuter shuttle model, route optimization algorithms, doorstep cluster pickup logic, and schedule pairing mechanisms; (b) Subscription pass structures and recurring payment workflows; (c) Patent-pending intercity commuter pooling, seat allocation maps, and B2B express parcel monetization in passenger shuttles; (d) Source code, database schemas, UI/UX mockups, mobile applications, AIS-140 GPS telematics integration, and website platforms (`dailycab.in`); (e) Financial models, Detailed Project Reports (DPRs), cost-per-kilometer metrics, investor decks, driver payout plans, and partner revenue splits.<br />
                  <strong>Exclusions:</strong> Confidential Information shall not include information which: (i) is or becomes publicly available without breach of this Agreement; (ii) was lawfully known prior to disclosure; (iii) is independently developed without use of DailyCab’s Confidential Information; (iv) is lawfully obtained from a third party; or (v) consists of general industry knowledge and experience of the Receiving Party without reference to, incorporation of, or reliance upon DailyCab’s proprietary route algorithms, unit economics, or trade secrets.
                </p>
              </section>

              <section>
                <h3 className="font-display font-black text-sm sm:text-base mb-1.5 text-content print:text-black">
                  Article 2 — Purpose, Non-Use & Investor Non-Circumvention
                </h3>
                <p className="text-content-secondary print:text-black text-justify leading-relaxed">
                  The Receiving Party agrees to maintain strict confidentiality and use Confidential Information <strong>SOLELY</strong> for the purpose of evaluating and executing the potential business association with DailyCab. If the Parties do not enter into a formal agreement or if the association terminates, the Receiving Party shall <strong>NOT use, directly or indirectly</strong>, any Confidential Information, route economics, or business playbooks to launch, advise, assist, or invest in any competing intercity shuttle service.<br />
                  <strong>Non-Circumvention:</strong> General recruitment qualifications apply to pre-existing contacts or public job postings; provided that nothing in this clause shall dilute or exempt the Receiving Party from non-circumvention obligations regarding prospective investors, financial institutions, or corporate partners specifically introduced during the mandate.
                </p>
              </section>

              <section>
                <h3 className="font-display font-black text-sm sm:text-base mb-1.5 text-content print:text-black">
                  Article 3 — Non-Compete & Active Mandate Competitor Firewall
                </h3>
                <p className="text-content-secondary print:text-black text-justify leading-relaxed">
                  The Receiving Party acting in an advisory capacity shall not be subject to an unreasonable blanket post-termination non-compete. However, during the active term of association with DailyCab: (a) The Receiving Party shall not provide advisory services to a direct intercity shuttle competitor operating on DailyCab's active routes in Madhya Pradesh (e.g., Indore-Bhopal, Indore-Ujjain); (b) The Receiving Party shall not solicit or hire any key employee, developer, or operations head of DailyCab; (c) Any general industry experience retained in unaided memory shall <strong>EXCLUDE</strong> DailyCab's proprietary algorithms, route profitability metrics, financial models, and driver payout logic.
                </p>
              </section>

              <section>
                <h3 className="font-display font-black text-sm sm:text-base mb-1.5 text-content print:text-black">
                  Article 4 — Ownership of Intellectual Property & Work Product
                </h3>
                <p className="text-content-secondary print:text-black text-justify leading-relaxed">
                  All work product, code, designs, branding, domain names, customer lists, marketing materials, trade secrets, concepts, algorithms, and operational workflows conceived, developed, written, or contributed by the Receiving Party during or in connection with their association with DailyCab shall be the sole, exclusive, and unencumbered property of Sanjay Thakur from inception. The Receiving Party hereby irrevocably and permanently assigns all global intellectual property rights, copyrights, patents, and domain rights in such work product to Sanjay Thakur without additional compensation.
                </p>
              </section>

              <section>
                <h3 className="font-display font-black text-sm sm:text-base mb-1.5 text-content print:text-black">
                  Article 5 — Term, Pre-Incorporation Assignment & Survival
                </h3>
                <p className="text-content-secondary print:text-black text-justify leading-relaxed">
                  Upon incorporation of <strong>DailyCabs Pvt Ltd</strong> (or successor corporate entity), all rights, benefits, covenants, and remedies under this Agreement shall automatically assign to said corporate entity. In the event negotiations terminate or association ends, all confidentiality and non-use covenants shall <strong>survive for a period of three (3) years</strong> from the date of disclosure.
                </p>
              </section>

              <section>
                <h3 className="font-display font-black text-sm sm:text-base mb-1.5 text-content print:text-black">
                  Article 6 — Penalties, Remedies & Injunctive Relief
                </h3>
                <p className="text-content-secondary print:text-black text-justify leading-relaxed">
                  The Receiving Party agrees that any violation of confidentiality or non-use will cause irreparable harm for which monetary damages alone are inadequate. Therefore: (a) Sanjay Thakur / DailyCab shall be entitled to seek an immediate ex-parte temporary injunction and permanent restraining order from a court of competent jurisdiction under the Specific Relief Act, 1963; (b) Monetary compensation shall cover actual direct losses legally recoverable under Indian law, along with reasonable legal expenses, court costs, and investigation fees incurred in enforcing this Agreement.
                </p>
              </section>

              <section>
                <h3 className="font-display font-black text-sm sm:text-base mb-1.5 text-content print:text-black">
                  Article 7 — Governing Law & Exclusive Jurisdiction
                </h3>
                <p className="text-content-secondary print:text-black text-justify leading-relaxed">
                  This Agreement shall be governed by and construed in accordance with the laws of the Republic of India, including the Indian Contract Act, 1872 and the Information Technology Act, 2000. Any legal proceedings arising out of or relating to this Agreement shall be subject to the exclusive jurisdiction of the competent Courts at <strong>Indore / Dhar, Madhya Pradesh</strong>.
                </p>
              </section>

              <section>
                <h3 className="font-display font-black text-sm sm:text-base mb-1.5 text-content print:text-black">
                  Article 8 — Miscellaneous Provisions
                </h3>
                <p className="text-content-secondary print:text-black text-justify leading-relaxed">
                  (a) <strong>Survival:</strong> Confidentiality and non-use obligations shall survive for three (3) years post-termination; (b) <strong>Severability:</strong> If any provision is held invalid, remaining provisions remain in full force; (c) <strong>Entirety:</strong> This Agreement constitutes the complete understanding regarding confidentiality; (d) <strong>Electronic Execution:</strong> Execution via digital canvas signature or uploaded image is legally binding under Section 10A of the IT Act, 2000.
                </p>
              </section>

            </div>
          </div>

          {/* Consent and Signatures */}
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 print:bg-transparent print:border-none print:shadow-none print:p-0 print:mt-10">
            
            <div className="mb-6 print:hidden">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input type="checkbox" required name="consent" checked={formData.consent} onChange={handleChange} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-emerald-500/50 rounded bg-canvas peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all flex items-center justify-center group-hover:border-emerald-500">
                    <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-content-secondary select-none">
                  I, <span className="font-bold text-content">{formData.fullName || '[Full Legal Name]'}</span>, have read, understood, and solemnly agree to all terms, non-compete covenants, patent protection clauses, and liquidated damages of this Non-Disclosure & IP Agreement executed with Sanjay Thakur (DailyCab).
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 print:hidden">
              <div>
                <label className="block text-micro font-bold mb-1 text-content-secondary">Date of Execution</label>
                <input type="text" readOnly value={formData.date} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-content-muted cursor-not-allowed font-medium" />
              </div>
              <div>
                <label className="block text-micro font-bold mb-1 text-content-secondary">Place of Signing *</label>
                <input required name="place" value={formData.place} onChange={handleChange} className="w-full bg-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium" placeholder="e.g. Dhar / Indore, Madhya Pradesh" />
              </div>
            </div>

            <div className="mb-8 print:hidden">
              <SignaturePad ref={signaturePadRef} onSignatureChange={(hasSig) => {
                if (hasSig) {
                  const data = signaturePadRef.current?.getSignatureDataUrl();
                  if (data) setSignatureData(data);
                } else {
                  setSignatureData(null);
                }
              }} />
            </div>

            {/* Print Signatures Block */}
            <div className="hidden print:block mt-12 w-full text-black">
              <div className="flex justify-between w-full">
                <div className="w-1/2 pr-8">
                  <p className="text-xs font-bold mb-10 uppercase border-b border-black pb-1 inline-block">PARTY A (Founder & Disclosing Party)</p>
                  <div className="h-16 mb-2 flex items-end">
                    <p className="italic text-gray-700 font-serif text-sm">Sanjay Thakur</p>
                  </div>
                  <div className="border-t border-black pt-2">
                    <p className="text-xs font-bold">SANJAY THAKUR</p>
                    <p className="text-[10px]">Founder & Sole Proprietor — DailyCab (SJY Mobility)</p>
                    <p className="text-[10px]">Address: 15, Bandichhod Marg, Sharda Nagar, Dhar M.P. 454001</p>
                  </div>
                </div>
                <div className="w-1/2 pl-8">
                  <p className="text-xs font-bold mb-10 uppercase border-b border-black pb-1 inline-block">PARTY B (The Receiving Party)</p>
                  <div className="h-16 mb-2 flex items-end">
                    {signatureData ? (
                      <img src={signatureData} alt="Signature" className="max-h-16 object-contain" />
                    ) : (
                      <p className="italic text-gray-500 text-xs">Signature Missing</p>
                    )}
                  </div>
                  <div className="border-t border-black pt-2">
                    <p className="text-xs font-bold">{formData.fullName || '_________________________'}</p>
                    <p className="text-[10px]">{formData.designation || '_________________________'}</p>
                    <p className="text-[10px]"><span className="font-bold">Aadhaar:</span> XXXX-XXXX-{formData.aadhaar ? formData.aadhaar.slice(-4) : '____'}</p>
                    <p className="text-[10px]"><span className="font-bold">Place:</span> {formData.place || '____________________'}</p>
                    <p className="text-[10px]"><span className="font-bold">Date:</span> {formData.date}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {submittedNdaId && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 space-y-2 print:hidden">
                <div className="font-extrabold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  NDA Executed & Saved Successfully!
                </div>
                <div className="text-xs text-content-secondary">
                  Agreement Reference ID: <strong className="font-mono text-content">{submittedNdaId}</strong>
                </div>
                <div className="text-xs pt-1 flex items-center gap-3">
                  <a
                    href={`/nda/view/${submittedNdaId}`}
                    target="_blank"
                    className="font-bold underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
                  >
                    View & Print Permanent Copy ➔
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end print:hidden">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-xs sm:text-sm active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Agreement to Vercel Database...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Submit & Print / Download Legal Agreement
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
