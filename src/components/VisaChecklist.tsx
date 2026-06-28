import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertTriangle, FileText, Upload, Calendar, Compass, Shield, Check, Trash2, HelpCircle } from "lucide-react";

interface VisaChecklistProps {
  currentUser: {
    fullName: string;
    email: string;
    preferredCountry?: string;
    educationLevel?: string;
  };
}

interface ChecklistItem {
  id: string;
  category: "required" | "financial";
  title: string;
  desc: string;
  submitted: boolean;
  fileName?: string;
  fileSize?: string;
}

export function VisaChecklist({ currentUser }: VisaChecklistProps) {
  const [selectedCountry, setSelectedCountry] = useState(currentUser.preferredCountry || "United Kingdom");
  const [selectedLevel, setSelectedLevel] = useState(currentUser.educationLevel || "Bachelor's Degree");
  const [hasGapYears, setHasGapYears] = useState("No");
  const [hasDependents, setHasDependents] = useState("No");
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [timeline, setTimeline] = useState<Array<{ stage: string; action: string; duration: string; completed: boolean }>>([]);
  const [embassyGuidelines, setEmbassyGuidelines] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState<string | null>(null);

  // Generate checklist on preference changes
  useEffect(() => {
    generateCustomChecklist();
  }, [selectedCountry, selectedLevel, hasGapYears, hasDependents]);

  const generateCustomChecklist = () => {
    // Check if there is already a saved state in localStorage to prevent wiping submitted work
    const storageKey = `jel_visa_checklist_${currentUser.email}_${selectedCountry.replace(/\s+/g, "")}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        setChecklist(JSON.parse(saved));
        updateTimelineAndGuidelines();
        return;
      } catch (e) {}
    }

    const requiredDocs: ChecklistItem[] = [
      { id: "req-passport", category: "required", title: "Valid International Passport", desc: "Must be valid for at least 6 months past your intended travel date with empty visa pages.", submitted: false },
      { id: "req-certs", category: "required", title: "Academic Certificates & Marksheets", desc: `Official transcripts, provisional certificates, and board certificates for all degrees culminating in your target level (${selectedLevel}).`, submitted: false },
      { id: "req-english", category: "required", title: "English Language Test Report", desc: "Original IELTS, PTE, or Duolingo certificate meeting your target university standards.", submitted: false },
      { id: "req-sop", category: "required", title: "Statement of Purpose (SOP)", desc: `A tailored ${selectedCountry}-compliant essay covering your career, academic timeline, and return plans.`, submitted: false },
      { id: "req-photos", category: "required", title: "Biometric Passport Sized Photographs", desc: `Embassy compliant color photographs on a white background, size matching ${selectedCountry} standards.`, submitted: false }
    ];

    const financialDocs: ChecklistItem[] = [
      { id: "fin-bank", category: "financial", title: "Liquidity Bank Statement & Certificate", desc: `Comprehensive bank statements covering the full required sum for maintenance and tuition.`, submitted: false },
      { id: "fin-source", category: "financial", title: "Official Source of Funds Declaration", desc: "Tax assessment reports, trade licenses, property rental agreements, or family salary proofs.", submitted: false },
      { id: "fin-sponsor", category: "financial", title: "Sponsor Affidavit of Financial Support", desc: "Authorized stamp agreement from parents committing funds to cover all academic costs.", submitted: false }
    ];

    // Conditional items based on country
    if (selectedCountry === "United Kingdom") {
      financialDocs.push({ id: "fin-cas", category: "financial", title: "CAS (Confirmation of Acceptance for Studies)", desc: "Electronic registrar clearance issued by your university to trigger visa submission.", submitted: false });
      requiredDocs.push({ id: "req-tb", category: "required", title: "Tuberculosis (TB) Test Certificate", desc: "Approved clinical test certificate from IOM Dhaka.", submitted: false });
    } else if (selectedCountry === "Canada") {
      financialDocs.push({ id: "fin-gic", category: "financial", title: "GIC (Guaranteed Investment Certificate)", desc: "Secure $20,635 CAD bank block deposit with Scotiabank, CIBC, or Simplii Financial for SPP stream.", submitted: false });
      requiredDocs.push({ id: "req-caq", category: "required", title: "CAQ Quebec Acceptance Certificate", desc: "Only mandatory if your target institution resides in Quebec region.", submitted: false });
    } else if (selectedCountry === "Australia") {
      requiredDocs.push({ id: "req-coeco", category: "required", title: "eCOE (Electronic Confirmation of Enrollment)", desc: "Issued by the Australian University registrar once deposits clear.", submitted: false });
      requiredDocs.push({ id: "req-med Australian", category: "required", title: "Australian Panel Medical Clearance", desc: "Official health evaluation booked through approved clinics in Dhaka.", submitted: false });
    } else if (selectedCountry === "Germany") {
      financialDocs.push({ id: "fin-blocked", category: "financial", title: "German Blocked Account (Sperrkonto)", desc: "Verified blocked account with €11,904 Euro deposit via Fintiba or Coracle.", submitted: false });
    }

    // Conditional items based on profile gaps
    if (hasGapYears === "Yes") {
      requiredDocs.push({ id: "req-gap", category: "required", title: "Study Gap Experience Certificates", desc: "Formal appointment letters, experience clearances, salary certificates, or business registries proving continuous active employment during your study gap.", submitted: false });
    }

    if (hasDependents === "Yes") {
      requiredDocs.push({ id: "req-marriage", category: "required", title: "Marriage Certificate & Nikahnama", desc: "Government-attested marriage deeds, translations, and joint bank statements to sponsor spouse dependency visa.", submitted: false });
    }

    const merged = [...requiredDocs, ...financialDocs];
    setChecklist(merged);
    localStorage.setItem(storageKey, JSON.stringify(merged));
    updateTimelineAndGuidelines();
  };

  const updateTimelineAndGuidelines = () => {
    // Dynamic timeline stages
    const standardTimeline = [
      { stage: "Stage 1: Document attestation", action: "Get educational sheets attested by Ministry of Foreign Affairs & Education boards.", duration: "3-5 Business Days", completed: true },
      { stage: "Stage 2: Financial holding", action: `Mature bank balances under 28-day (UK) or relevant holding patterns.`, duration: "28 Days", completed: false },
      { stage: "Stage 3: Health screening", action: "Book and complete panel medical check-ups at IOM or designated clinics.", duration: "2-3 Days", completed: false },
      { stage: "Stage 4: Visa dossier submission", action: "Submit electronic visa forms, clear payment of Embassy charges.", duration: "1 Day", completed: false },
      { stage: "Stage 5: Biometric capturing", action: "Walk into VFS Global Dhaka/Sylhet to take digital photographs & fingerprints.", duration: "Scheduled Seat", completed: false }
    ];
    setTimeline(standardTimeline);

    // Dynamic Guidelines
    const guidelines = [
      `Maintain clean, consistent financial records. Embassy officials regularly crosscheck tax files with the National Board of Revenue (NBR).`,
      selectedCountry === "United Kingdom"
        ? `Ensure maintenance balances (approx £12,006 inside London / £9,207 outer London) stay untouched in your sponsor's account for a continuous 28-day period prior to submitting your visa application.`
        : selectedCountry === "Canada"
        ? `For SPP SDS streams, secure your GIC certificate early to achieve seamless processing with no active bank audit requests.`
        : selectedCountry === "Australia"
        ? `Australia enforces rigorous Genuine Student (GS) criteria. Your Statement of Purpose must comprehensively address why Australia was chosen instead of equivalent degrees in Bangladesh.`
        : `Attest all physical certificates prior to presenting papers. All documents not written in English must carry certified legal translations.`,
      `The JEL Tejgaon office team advises candidates to double check that spelling matches exactly between passports, national IDs, and transcript certificates.`
    ];
    setEmbassyGuidelines(guidelines);
  };

  // Toggle submitted checkbox
  const handleToggleSubmitted = (id: string) => {
    const updated = checklist.map(item => {
      if (item.id === id) {
        return { ...item, submitted: !item.submitted };
      }
      return item;
    });
    setChecklist(updated);
    
    const storageKey = `jel_visa_checklist_${currentUser.email}_${selectedCountry.replace(/\s+/g, "")}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Upload simulation
  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(id);

    setTimeout(() => {
      const updated = checklist.map(item => {
        if (item.id === id) {
          return {
            ...item,
            submitted: true,
            fileName: file.name,
            fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB"
          };
        }
        return item;
      });
      setChecklist(updated);

      const storageKey = `jel_visa_checklist_${currentUser.email}_${selectedCountry.replace(/\s+/g, "")}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setUploadLoading(null);
    }, 1200);
  };

  const handleRemoveFile = (id: string) => {
    const updated = checklist.map(item => {
      if (item.id === id) {
        return {
          ...item,
          submitted: false,
          fileName: undefined,
          fileSize: undefined
        };
      }
      return item;
    });
    setChecklist(updated);

    const storageKey = `jel_visa_checklist_${currentUser.email}_${selectedCountry.replace(/\s+/g, "")}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Calculations
  const totalItems = checklist.length;
  const submittedItems = checklist.filter(t => t.submitted).length;
  const progressPercent = totalItems > 0 ? Math.round((submittedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-8" id="visa-checklist-system-canvas">
      
      {/* Upper Selector Grid */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
        <div className="space-y-1.5 col-span-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Destination Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
          >
            <option value="United Kingdom">United Kingdom (UK)</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="United States">United States</option>
            <option value="Germany">Germany</option>
            <option value="Ireland">Ireland</option>
          </select>
        </div>

        <div className="space-y-1.5 col-span-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Course Level</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
          >
            <option value="Bachelor's Degree">Undergraduate (Bachelor's)</option>
            <option value="Master's Degree">Postgraduate (Master's)</option>
            <option value="PhD">Doctorate / PhD Track</option>
            <option value="Diploma">College Diploma / Foundation</option>
          </select>
        </div>

        <div className="space-y-1.5 col-span-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Do you have study gap?</label>
          <select
            value={hasGapYears}
            onChange={(e) => setHasGapYears(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
          >
            <option value="No">No Academic Gap</option>
            <option value="Yes">Yes, I have study gap</option>
          </select>
        </div>

        <div className="space-y-1.5 col-span-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Bringing dependents?</label>
          <select
            value={hasDependents}
            onChange={(e) => setHasDependents(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
          >
            <option value="No">Single applicant</option>
            <option value="Yes">Yes, sponsoring Spouse / Child</option>
          </select>
        </div>
      </div>

      {/* Progress tracker header */}
      <div className="bg-gradient-to-br from-[#0B5D3B] to-[#042a1a] rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#D4AF37] opacity-10 blur-2xl"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 text-left">
          <div className="space-y-1.5 w-full md:w-3/5">
            <span className="text-[10px] font-mono uppercase bg-white/10 text-yellow-300 px-2.5 py-0.5 rounded-md border border-white/10">
              Interactive Submission Tracker
            </span>
            <h3 className="text-xl font-display font-black">Verify Your Visa Compliance Status</h3>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Mark items as submitted or upload copies to track your file readiness. JEL compliance team can see this dashboard.
            </p>
          </div>

          <div className="w-full md:w-2/5 flex flex-col items-end">
            <div className="flex justify-between items-end w-full text-xs font-bold mb-1.5">
              <span>PROGRESS</span>
              <span className="text-yellow-400 font-mono text-sm">{progressPercent}% DONE</span>
            </div>
            <div className="w-full bg-white/15 h-3.5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-300 font-mono mt-2 uppercase tracking-wide">
              {submittedItems} of {totalItems} checklists uploaded or marked
            </span>
          </div>
        </div>
      </div>

      {/* Checklist layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Document Checklist */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Required Academic & Identity Section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider pb-2 border-b border-slate-50 flex items-center space-x-2">
              <FileText className="h-4.5 w-4.5 text-[#0B5D3B]" />
              <span>Category A: Required Identity & Academics</span>
            </h3>

            <div className="space-y-4 pt-1">
              {checklist.filter(item => item.category === "required").map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100/70 hover:border-slate-200 transition duration-200 flex flex-col sm:flex-row justify-between gap-4 text-left items-start">
                  <div className="flex items-start space-x-3 w-full sm:w-2/3">
                    <button
                      onClick={() => handleToggleSubmitted(item.id)}
                      className={`h-5 w-5 rounded-md border mt-0.5 flex items-center justify-center transition shrink-0 cursor-pointer ${
                        item.submitted 
                          ? "bg-[#0B5D3B] border-[#0B5D3B] text-white" 
                          : "border-slate-300 hover:border-[#0B5D3B]"
                      }`}
                    >
                      {item.submitted && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <div className="space-y-1">
                      <h4 className={`text-xs font-bold leading-none ${item.submitted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-light leading-relaxed pt-1">{item.desc}</p>
                      
                      {item.fileName && (
                        <div className="flex items-center space-x-2 bg-[#0B5D3B]/5 border border-[#0B5D3B]/10 rounded-lg py-1 px-2 mt-2 w-fit">
                          <CheckCircle className="h-3 w-3 text-[#0B5D3B]" />
                          <span className="text-[10px] text-[#0B5D3B] font-mono max-w-xs truncate">{item.fileName} ({item.fileSize})</span>
                          <button
                            onClick={() => handleRemoveFile(item.id)}
                            className="text-red-500 hover:text-red-700 ml-1.5 focus:outline-none shrink-0"
                            title="Remove file"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
                    <label className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 cursor-pointer transition">
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      <span>{uploadLoading === item.id ? "Uploading..." : "Upload Copy"}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(item.id, e)}
                        disabled={!!uploadLoading}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Financial & Sponsoring Section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider pb-2 border-b border-slate-50 flex items-center space-x-2">
              <Compass className="h-4.5 w-4.5 text-[#0B5D3B]" />
              <span>Category B: Financial Verification & Holding Checks</span>
            </h3>

            <div className="space-y-4 pt-1">
              {checklist.filter(item => item.category === "financial").map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100/70 hover:border-slate-200 transition duration-200 flex flex-col sm:flex-row justify-between gap-4 text-left items-start">
                  <div className="flex items-start space-x-3 w-full sm:w-2/3">
                    <button
                      onClick={() => handleToggleSubmitted(item.id)}
                      className={`h-5 w-5 rounded-md border mt-0.5 flex items-center justify-center transition shrink-0 cursor-pointer ${
                        item.submitted 
                          ? "bg-[#0B5D3B] border-[#0B5D3B] text-white" 
                          : "border-slate-300 hover:border-[#0B5D3B]"
                      }`}
                    >
                      {item.submitted && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <div className="space-y-1">
                      <h4 className={`text-xs font-bold leading-none ${item.submitted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-light leading-relaxed pt-1">{item.desc}</p>
                      
                      {item.fileName && (
                        <div className="flex items-center space-x-2 bg-[#0B5D3B]/5 border border-[#0B5D3B]/10 rounded-lg py-1 px-2 mt-2 w-fit">
                          <CheckCircle className="h-3 w-3 text-[#0B5D3B]" />
                          <span className="text-[10px] text-[#0B5D3B] font-mono max-w-xs truncate">{item.fileName} ({item.fileSize})</span>
                          <button
                            onClick={() => handleRemoveFile(item.id)}
                            className="text-red-500 hover:text-red-700 ml-1.5 focus:outline-none shrink-0"
                            title="Remove file"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
                    <label className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 cursor-pointer transition">
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      <span>{uploadLoading === item.id ? "Uploading..." : "Upload Copy"}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(item.id, e)}
                        disabled={!!uploadLoading}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Timeline & Guidelines Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Timeline */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider pb-2 border-b border-slate-50 flex items-center space-x-2">
              <Calendar className="h-4.5 w-4.5 text-[#0B5D3B]" />
              <span>Application Timeline</span>
            </h3>

            <div className="space-y-4 pt-1">
              {timeline.map((t, index) => (
                <div key={index} className="flex space-x-3 text-left">
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      t.completed ? "bg-[#0B5D3B] border-[#0B5D3B]" : "bg-white border-slate-300"
                    }`}>
                      {t.completed && <Check className="h-2 w-2 text-white" />}
                    </div>
                    {index < timeline.length - 1 && <div className="w-0.5 h-10 bg-slate-100 my-1" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center gap-4">
                      <h4 className="text-[11px] font-bold text-slate-850">{t.stage}</h4>
                      <span className="text-[9px] font-mono text-[#0B5D3B] bg-[#0B5D3B]/5 px-1.5 rounded">{t.duration}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-light leading-normal">{t.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embassy Guidelines */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-black text-[#0B5D3B] text-sm uppercase tracking-wider pb-2 border-b border-slate-200/60 flex items-center space-x-2">
              <Shield className="h-4.5 w-4.5 text-[#0B5D3B]" />
              <span>Official Embassy Guidelines</span>
            </h3>

            <ul className="space-y-3 pt-1 text-xs text-slate-700 font-light leading-relaxed text-left">
              {embassyGuidelines.map((guideline, i) => (
                <li key={i} className="flex space-x-2 items-start">
                  <span className="text-[#D4AF37] font-bold mt-0.5 shrink-0">✦</span>
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
