import React, { useState } from "react";
import { 
  Building2, Calendar, DollarSign, Award, RefreshCw, Send, CheckCircle, 
  AlertCircle, Globe, Search, PlusCircle, Edit2, Check
} from "lucide-react";

interface UniversityProfile {
  id: string;
  name: string;
  country: string;
  globalRanking: number;
  liveTuitionFee: string;
  intakeCalendar: string;
  scholarshipsAvailable: string;
  lastSynced: string;
}

interface SyncLog {
  time: string;
  type: "info" | "success" | "warning";
  message: string;
}

export function UniversityIntegration() {
  const [universities, setUniversities] = useState<UniversityProfile[]>([
    { id: "uni-1", name: "University of Leeds", country: "United Kingdom", globalRanking: 86, liveTuitionFee: "£19,500 - £26,000", intakeCalendar: "Sep 2026, Jan 2027", scholarshipsAvailable: "Up to £5,000 auto-apply merit", lastSynced: "2026-06-27 18:22" },
    { id: "uni-2", name: "Coventry University", country: "United Kingdom", globalRanking: 550, liveTuitionFee: "£15,000 - £18,500", intakeCalendar: "Sep 2026, Jan 2027, May 2027", scholarshipsAvailable: "£1,500 - £2,000 automatic", lastSynced: "2026-06-27 18:22" },
    { id: "uni-3", name: "York St John University", country: "United Kingdom", globalRanking: 1000, liveTuitionFee: "£13,000 - £14,500", intakeCalendar: "Sep 2026, Jan 2027", scholarshipsAvailable: "£1,000 location bursary", lastSynced: "2026-06-27 18:22" },
    { id: "uni-4", name: "University of Canada West", country: "Canada", globalRanking: 920, liveTuitionFee: "$17,500 CAD", intakeCalendar: "Sep 2026, Jan 2027, Apr 2027", scholarshipsAvailable: "Up to $10,000 regional entry award", lastSynced: "2026-06-27 18:22" }
  ]);

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    { time: "09:41:00", type: "info", message: "System initialized. Standing by for API sync request." }
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Manual admin update inputs
  const [selectedUniId, setSelectedUniId] = useState<string | null>(null);
  const [editTuition, setEditTuition] = useState("");
  const [editIntake, setEditIntake] = useState("");
  const [editScholarship, setEditScholarship] = useState("");

  // New University entry input
  const [newUniName, setNewUniName] = useState("");
  const [newUniCountry, setNewUniCountry] = useState("United Kingdom");
  const [newUniRanking, setNewUniRanking] = useState(500);
  const [newUniTuition, setNewUniTuition] = useState("£16,000");
  const [newUniIntake, setNewUniIntake] = useState("Sep 2026");
  const [newUniSch, setNewUniSch] = useState("£2,000 merit grant");

  const handleSelectUniToEdit = (uni: UniversityProfile) => {
    setSelectedUniId(uni.id);
    setEditTuition(uni.liveTuitionFee);
    setEditIntake(uni.intakeCalendar);
    setEditScholarship(uni.scholarshipsAvailable);
  };

  const handleSaveManualUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniId) return;

    setUniversities(prev => prev.map(uni => {
      if (uni.id === selectedUniId) {
        const updated = {
          ...uni,
          liveTuitionFee: editTuition,
          intakeCalendar: editIntake,
          scholarshipsAvailable: editScholarship,
          lastSynced: new Date().toISOString().replace("T", " ").substring(0, 16)
        };
        
        // Add log
        const logMsg: SyncLog = {
          time: new Date().toLocaleTimeString(),
          type: "success",
          message: `Manual Admin Update triggered: Altered course/fees index for "${uni.name}"`
        };
        setSyncLogs(logs => [logMsg, ...logs]);
        return updated;
      }
      return uni;
    }));

    setSelectedUniId(null);
  };

  const handleCreateUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName.trim()) return;

    const newUni: UniversityProfile = {
      id: "uni-" + Date.now(),
      name: newUniName,
      country: newUniCountry,
      globalRanking: Number(newUniRanking),
      liveTuitionFee: newUniTuition,
      intakeCalendar: newUniIntake,
      scholarshipsAvailable: newUniSch,
      lastSynced: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    setUniversities(prev => [...prev, newUni]);
    
    // Add log
    setSyncLogs(logs => [{
      time: new Date().toLocaleTimeString(),
      type: "success",
      message: `Successfully indexed new university: "${newUniName}" (Ranking: #${newUniRanking})`
    }, ...logs]);

    setNewUniName("");
  };

  // Live Sync Simulation
  const triggerApiSync = () => {
    setIsSyncing(true);
    
    // Staggered log steps to look highly active and authentic
    const steps = [
      { delay: 400, type: "info" as const, msg: "Establishing socket handshake with UCAS, CRICOS, and OUAC centralized servers..." },
      { delay: 1000, type: "info" as const, msg: "Received secure XML schema payload. Downloading latest tuition indexes..." },
      { delay: 1800, type: "warning" as const, msg: "Coventry University reported minor intake calendar revisions for May 2027. Updating local DB..." },
      { delay: 2400, type: "success" as const, msg: "York St John University tuition index updated to £13,000 (Adjusted matching real-time exchange ratios)." },
      { delay: 3000, type: "success" as const, msg: "Handshake completed successfully. All 4 target systems reporting green status codes." }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        const timeStr = new Date().toLocaleTimeString();
        setSyncLogs(prev => [{ time: timeStr, type: step.type, message: step.msg }, ...prev]);
        
        // At the last step, apply fee fluctuations to simulate real sync
        if (idx === steps.length - 1) {
          setUniversities(prev => prev.map(uni => {
            let tuition = uni.liveTuitionFee;
            if (uni.id === "uni-2") tuition = "£15,200 - £18,900"; // updated
            if (uni.id === "uni-3") tuition = "£13,200 - £14,800"; // updated
            
            return {
              ...uni,
              liveTuitionFee: tuition,
              lastSynced: new Date().toISOString().replace("T", " ").substring(0, 16)
            };
          }));
          setIsSyncing(false);
        }
      }, step.delay);
    });
  };

  const filteredUnis = universities.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300" id="uni-integration-root">
      
      {/* 1. Hero Block */}
      <div className="bg-gradient-to-r from-emerald-950 to-[#0B5D3B] border border-emerald-900 text-white p-6 sm:p-8 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#D4AF37] opacity-10 blur-3xl"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] bg-[#D4AF37] text-slate-950 font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
            Partner API Sync Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
            University Integration & Live Course API
          </h2>
          <p className="text-xs text-emerald-100 font-light max-w-2xl leading-relaxed">
            Directly connect your admissions databases with live registrar portals in the UK, Canada, and Australia. Maintain absolute accuracy on tuition fee parameters, intake targets, and scholarship availability.
          </p>
        </div>

        <button
          onClick={triggerApiSync}
          disabled={isSyncing}
          className="bg-white hover:bg-slate-50 text-slate-900 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center space-x-2 shrink-0 relative z-10 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 text-[#0B5D3B] ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Synchronizing Live..." : "Query External APIs"}</span>
        </button>
      </div>

      {/* 2. Unified Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: University Database Table & Search */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
            
            {/* Header Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Partner Institution Catalog
                </h3>
                <p className="text-[11px] text-slate-500 font-light">Showing courses, ranking, intake cycles, and synchronized timestamps.</p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter name or destination..."
                  className="bg-slate-50 border border-slate-200 p-2 pl-8 rounded-lg text-xs w-full sm:w-56 outline-none focus:bg-white focus:border-[#D4AF37]"
                />
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* University List Grid */}
            <div className="space-y-4">
              {filteredUnis.map(uni => (
                <div key={uni.id} className="border border-slate-150 p-4 rounded-xl bg-slate-55/40 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded">
                        Ranking #{uni.globalRanking}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-[#0B5D3B] font-bold px-2 py-0.5 rounded">
                        {uni.country}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-slate-900 text-sm">{uni.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      📅 Intakes: <span className="font-semibold text-slate-700">{uni.intakeCalendar}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      🎁 Scholarship: <span className="font-semibold text-[#0B5D3B]">{uni.scholarshipsAvailable}</span>
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                    <div className="text-left md:text-right space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold font-mono">Live Tuition Estimate</span>
                      <span className="font-mono text-xs font-black text-slate-800 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded block w-fit md:ml-auto">
                        {uni.liveTuitionFee}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-[9px] font-mono text-slate-400">Synced: {uni.lastSynced}</span>
                      <button
                        onClick={() => handleSelectUniToEdit(uni)}
                        className="p-1 bg-slate-100 hover:bg-[#D4AF37] hover:text-slate-900 rounded-md text-slate-500 transition cursor-pointer"
                        title="Edit parameters manually"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Side: Manual updates and system logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Manual Admin Update Panel */}
          {selectedUniId ? (
            <form onSubmit={handleSaveManualUpdate} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Edit2 className="h-4.5 w-4.5 text-[#D4AF37]" />
                <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Override University Parameters
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Live Tuition Estimate</label>
                  <input
                    type="text"
                    required
                    value={editTuition}
                    onChange={(e) => setEditTuition(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Intake Calendar</label>
                  <input
                    type="text"
                    required
                    value={editIntake}
                    onChange={(e) => setEditIntake(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Scholarships & Grants</label>
                  <textarea
                    required
                    rows={2}
                    value={editScholarship}
                    onChange={(e) => setEditScholarship(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#0B5D3B] text-white py-2 rounded text-xs font-bold uppercase transition hover:bg-[#074028]"
                  >
                    Save Alterations
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUniId(null)}
                    className="bg-slate-100 text-slate-600 px-3 py-2 rounded text-xs font-semibold transition hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateUniversity} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <PlusCircle className="h-4.5 w-4.5 text-[#0B5D3B]" />
                <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Register New Institution
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">University Name</label>
                  <input
                    type="text"
                    required
                    value={newUniName}
                    onChange={(e) => setNewUniName(e.target.value)}
                    placeholder="e.g. Coventry London"
                    className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Country</label>
                    <select
                      value={newUniCountry}
                      onChange={(e) => setNewUniCountry(e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">QS World Ranking</label>
                    <input
                      type="number"
                      required
                      value={newUniRanking}
                      onChange={(e) => setNewUniRanking(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tuition Fee Estimate</label>
                  <input
                    type="text"
                    required
                    value={newUniTuition}
                    onChange={(e) => setNewUniTuition(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-2 rounded text-xs font-bold uppercase transition"
                >
                  Create Partner Record
                </button>
              </div>
            </form>
          )}

          {/* Live Sync Ledger Logs */}
          <div className="bg-slate-950 text-[#25D366] font-mono p-5 rounded-2xl shadow-xl space-y-3 border border-slate-800 text-left select-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Socket Stream logs</span>
              </span>
              <button
                onClick={() => setSyncLogs([{ time: new Date().toLocaleTimeString(), type: "info", message: "Console logs cleared." }])}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2 h-40 overflow-y-auto text-[10px] leading-relaxed select-text">
              {syncLogs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5 items-start">
                  <span className="text-slate-500">[{log.time}]</span>
                  <span className={`${
                    log.type === "success" ? "text-emerald-400" : log.type === "warning" ? "text-amber-400" : "text-blue-400"
                  }`}>
                    {log.type.toUpperCase()}: {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
