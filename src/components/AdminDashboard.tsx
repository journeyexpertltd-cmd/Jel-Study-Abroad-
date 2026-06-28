import React, { useState, useEffect } from "react";
import { Users, Filter, CheckCircle, Search, Edit3, MoreHorizontal, UserCheck, Plus, Trash2, Calendar, FileText, ChevronRight, Activity, ClipboardList, Coins } from "lucide-react";
import { Lead } from "../types";

const INITIAL_LEADS: Lead[] = [
  {
    id: "l-1",
    fullName: "Sayed Al-Mamun",
    email: "mamun.cse@gmail.com",
    mobileNumber: "+8801712345678",
    preferredCountry: "Canada",
    educationLevel: "Bachelor's Degree",
    message: "Seeking direct admission for M.Sc. in Computer Science with a budget of CAD $25,000/year. I scored 7.0 in IELTS.",
    status: "In Assessment",
    notes: "Assigned counselor: Tashfeen Ahmed. Transcripts and IELTS papers verified.",
    createdAt: "2026-06-19 14:32"
  },
  {
    id: "l-2",
    fullName: "Tasnia Rahman",
    email: "tasnia.rahman@gmail.com",
    mobileNumber: "+8801912445566",
    preferredCountry: "United Kingdom",
    educationLevel: "Higher Secondary / HSC",
    message: "Looking for scholarships at the University of Greenwich or Coventry for Bachelor of Business.",
    status: "New",
    notes: "Awaiting HSC certificate file scan. Follow-up set for Wednesday.",
    createdAt: "2026-06-21 09:12"
  },
  {
    id: "l-3",
    fullName: "Imtiaz Karim Shuvo",
    email: "shuvo.graphics@yahoo.com",
    mobileNumber: "+8801811559988",
    preferredCountry: "Australia",
    educationLevel: "Bachelor's Degree",
    message: "Intends to apply for Sydney or Adelaide. Secured a 6.5 in PTE, currently working as Web QA in Dhaka.",
    status: "Uni Approved",
    notes: "Offer letter issued by Deakin University! Financial documentation holding period checks started.",
    createdAt: "2026-06-15 11:45"
  },
  {
    id: "l-4",
    fullName: "Tahmina Akter",
    email: "tahmina.akter@outlook.com",
    mobileNumber: "+8801511222333",
    preferredCountry: "Ireland",
    educationLevel: "Master's Degree",
    message: "Interested in Cloud Computing postgraduate programs in Dublin. GPA 3.70/4.00.",
    status: "Visa Pending",
    notes: "Embassy file submitted in Delhi. Awaiting biometrics visa approval report.",
    createdAt: "2026-06-12 16:00"
  },
  {
    id: "l-5",
    fullName: "Zishan Ahmed Chowdury",
    email: "zishan@outlook.com",
    mobileNumber: "+8801311009988",
    preferredCountry: "United Kingdom",
    educationLevel: "Bachelor's Degree",
    message: "Wants to do MBA. IELTS 6.5. Good financial backing.",
    status: "Visa Approved",
    notes: "Congratulations! Student visa stamped. Pre-departure briefing completed at Tejgaon office.",
    createdAt: "2026-06-08 10:20"
  }
];

export function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingStatus, setEditingStatus] = useState<Lead["status"]>("New");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Counselor panel sub-mode
  const [crmView, setCrmView] = useState<"leads" | "payments">("leads");
  const [txList, setTxList] = useState<any[]>([]);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [txWarning, setTxWarning] = useState<string | null>(null);

  const fetchTxList = async () => {
    setIsTxLoading(true);
    setTxWarning(null);
    try {
      const res = await fetch("/api/sslcommerz/transactions");
      const resp = await res.json();
      if (resp.success) {
        setTxList(resp.data || []);
        if (resp.tableNotFound) {
          setTxWarning("Sandbox working! Stored in transient memories. Add the 'transactions' table to your Supabase postgres project to enable persistent bookkeeping.");
        }
      }
    } catch (e: any) {
      setTxWarning("Failed to connect to merchant transaction listener.");
    } finally {
      setIsTxLoading(false);
    }
  };

  useEffect(() => {
    if (crmView === "payments") {
      fetchTxList();
    }
  }, [crmView]);

  // Supabase dynamic state management
  const [supabaseStatus, setSupabaseStatus] = useState<"loading" | "connected" | "missing_table" | "error">("loading");
  const [supabaseErrorMessage, setSupabaseErrorMessage] = useState("");
  const [supabaseConfig, setSupabaseConfig] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSupabaseData = async () => {
    try {
      // 1. Fetch Supabase configuration info
      const configRes = await fetch("/api/supabase/config");
      const configData = await configRes.json();
      setSupabaseConfig(configData);

      // 2. Fetch remote leads
      const leadsRes = await fetch("/api/supabase/leads");
      const leadsData = await leadsRes.json();

      if (leadsData.success) {
        setSupabaseStatus("connected");
        if (leadsData.data && leadsData.data.length > 0) {
          setLeads(prevLeads => {
            const combined = [...leadsData.data];
            // Merge local leads that aren't on Supabase yet
            prevLeads.forEach(localLead => {
              if (!combined.some(c => c.id === localLead.id)) {
                combined.push(localLead);
              }
            });
            localStorage.setItem("jel_consult_leads", JSON.stringify(combined));
            return combined;
          });
        }
      } else if (leadsData.tableNotFound) {
        setSupabaseStatus("missing_table");
        setSupabaseErrorMessage(leadsData.error || "Table 'leads' not found in Supabase.");
      } else {
        setSupabaseStatus("error");
        setSupabaseErrorMessage(leadsData.error || "Failed to query database.");
      }
    } catch (err: any) {
      console.error("Failed to fetch Supabase status:", err);
      setSupabaseStatus("error");
      setSupabaseErrorMessage(err.message || "Failed to reach server backend API");
    }
  };

  const handleBackupToSupabase = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    showToast("Starting Supabase database sync...");
    try {
      const response = await fetch("/api/supabase/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads })
      });
      const result = await response.json();
      if (result.success) {
        showToast(`✅ Synced ${result.synced || leads.length} leads to Supabase!`);
        await fetchSupabaseData(); // Refresh indicators
      } else if (result.tableNotFound) {
        setSupabaseStatus("missing_table");
        showToast("⚠️ leads table does not exist in Supabase yet. Run the SQL setup below!");
      } else {
        showToast(`Sync failed: ${result.error}`);
      }
    } catch (err: any) {
      showToast(`Sync failed with error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("jel_consult_leads");
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
      } catch (e) {
        setLeads(INITIAL_LEADS);
      }
    } else {
      setLeads(INITIAL_LEADS);
      localStorage.setItem("jel_consult_leads", JSON.stringify(INITIAL_LEADS));
    }
    
    // Check & sync Supabase on dashboard mount
    fetchSupabaseData();
  }, []);

  const saveLeadsToStorage = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem("jel_consult_leads", JSON.stringify(updatedLeads));
  };

  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const targetLead = {
      ...selectedLead,
      status: editingStatus,
      notes: editingNotes
    };

    const updated = leads.map(l => {
      if (l.id === selectedLead.id) {
        return targetLead;
      }
      return l;
    });

    saveLeadsToStorage(updated);
    setSelectedLead(null);
    showToast("Updating lead & submitting to Supabase...");

    // Fire real-time insert/update to Supabase
    fetch("/api/supabase/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(targetLead)
    }).then(res => res.json())
      .then(d => {
        if (d.success) {
          showToast("Lead updated locally & cloud database synced!");
          // Reload remote count
          fetch("/api/supabase/leads").then(r => r.json()).then(ld => {
            if (ld.success) setSupabaseStatus("connected");
          });
        } else {
          showToast("Lead updated locally (Supabase setup pending table creation)");
        }
      })
      .catch(() => {
        showToast("Lead updated locally (Supabase offline)");
      });
  };

  const handleDeleteLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this consultation lead from CRM?")) {
      const filtered = leads.filter(l => l.id !== id);
      saveLeadsToStorage(filtered);
      showToast("Lead deleted from database.");
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    }
  };

  const handleSimulateLead = () => {
    const names = ["Abrar Fahim", "Sumaiya Tasnim", "Tanvir Hasan", "Farhana Kabir", "Naimur Rahman"];
    const emails = ["abrar.monash@inbox.com", "sumaiya.abroad@gmail.com", "tanvir.eng@yahoo.com", "farhana.it@outlook.com", "naimur.greenwich@gmail.com"];
    const countries = ["Canada", "United Kingdom", "Australia", "Ireland", "United States", "Malaysia"];
    const levels = ["Higher Secondary / HSC", "Bachelor's Degree", "Master's Degree"];
    const interests = ["M.Sc Data Science", "Power Engineering", "Executive MBA", "Bachelor of Cybersecurity", "Masters of Public Health"];
    
    const randomIdx = Math.floor(Math.random() * names.length);
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newLead: Lead = {
      id: `l-sim-${Date.now()}`,
      fullName: names[Math.floor(Math.random() * names.length)],
      email: emails[Math.floor(Math.random() * emails.length)],
      mobileNumber: `+8801${Math.floor(100000000 + Math.random() * 900000000)}`,
      preferredCountry: countries[Math.floor(Math.random() * countries.length)],
      educationLevel: levels[Math.floor(Math.random() * levels.length)],
      message: `Simulated Facebook / Web Ingestion: Interested in doing ${interests[Math.floor(Math.random() * interests.length)]}. Looking for intake starting earliest. GPA is satisfactory.`,
      status: "New",
      notes: "Auto-ingested lead. Awaiting executive phone review assignment.",
      createdAt: dateStr
    };

    const updated = [newLead, ...leads];
    saveLeadsToStorage(updated);
    showToast(`🔔 Lead ingested locally. Writing to Supabase...`);

    // Write real-time simulated lead to Supabase
    fetch("/api/supabase/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead)
    }).then(res => res.json())
      .then(d => {
        if (d.success) {
          showToast(`🔔 Simulated lead ingested successfully to Supabase!`);
        } else {
          showToast(`🔔 Lead ingested locally (Supabase setup pending table creation)`);
        }
      })
      .catch(() => {
        showToast(`🔔 Lead ingested locally (Supabase offline)`);
      });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filter and search
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.preferredCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.mobileNumber.includes(searchTerm) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalCount = leads.length;
  const newCount = leads.filter(l => l.status === "New").length;
  const inProgressCount = leads.filter(l => ["In Assessment", "Uni Approved", "Visa Pending"].includes(l.status)).length;
  const approvedCount = leads.filter(l => l.status === "Visa Approved" || l.status === "Completed").length;

  return (
    <div className="font-sans space-y-6" id="admin-crm-dashboard">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#05452d] text-[#00AEEF] px-4 py-3 rounded-xl shadow-2xl border border-[#00AEEF]/30 text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-bounce">
          <Activity className="h-4 w-4 text-emerald-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Intro and simulator header */}
      <div className="bg-gradient-to-r from-[#05452d] via-[#085a3c] to-[#05452d] text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-[#00AEEF] text-slate-900 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Internal Workspace</span>
          <h2 className="text-2xl font-display font-black text-white mt-1">JEL Study Abroad CRM Terminal</h2>
          <p className="text-slate-200 text-xs mt-0.5 leading-normal">
            Real-time consultation lead tracking, offer letters progress monitoring, and counselor auditing workspace.
          </p>
        </div>

        <button
          onClick={handleSimulateLead}
          className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1.5 transition-all shadow-md shrink-0 active:scale-95"
          id="btn-simulate-lead"
        >
          <Plus className="h-4 w-4" />
          <span>Ingest simulated Lead (AI/Meta Ads)</span>
        </button>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center md:text-left relative overflow-hidden">
          <div className="bg-slate-100 p-2 rounded-xl inline-block mb-2 md:mb-0 md:absolute md:top-4 md:right-4 text-[#05452d]">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest block">Total Inquiries</span>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-[#05452d] mt-1">{totalCount}</h3>
          <span className="text-[10px] font-mono text-emerald-600 font-bold mt-1 block">Live cloud sync ready</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center md:text-left relative overflow-hidden">
          <div className="bg-blue-100 p-2 rounded-xl inline-block mb-2 md:mb-0 md:absolute md:top-4 md:right-4 text-[#00AEEF]">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest block">Unassigned Leads</span>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-[#00AEEF] mt-1">{newCount}</h3>
          <span className="text-[10px] text-slate-500 block mt-1">Response target &lt; 5m</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center md:text-left relative overflow-hidden">
          <div className="bg-amber-100 p-2 rounded-xl inline-block mb-2 md:mb-0 md:absolute md:top-4 md:right-4 text-amber-500">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest block">Under Assessment</span>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-amber-500 mt-1">{inProgressCount}</h3>
          <span className="text-[10px] text-slate-500 block mt-1">SOP & Visa filing stages</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center md:text-left relative overflow-hidden">
          <div className="bg-green-100 p-2 rounded-xl inline-block mb-2 md:mb-0 md:absolute md:top-4 md:right-4 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest block">Visa Successes</span>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-emerald-600 mt-1">{approvedCount}</h3>
          <span className="text-[10px] font-bold text-green-600 block mt-1">98.2% conversion ratio</span>
        </div>
      </div>

      {/* Supabase Cloud Connection Panel */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-sm text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-xl transform translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c5a059]/10 rounded-full filter blur-xl transform -translate-x-12 translate-y-12"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full inline-block animate-pulse ${
                supabaseStatus === 'connected' ? 'bg-emerald-500' :
                supabaseStatus === 'missing_table' ? 'bg-amber-500' :
                supabaseStatus === 'loading' ? 'bg-indigo-500' : 'bg-rose-500'
              }`}></span>
              <h4 className="font-display font-bold text-sm text-[#05452d] uppercase tracking-wider">
                Supabase Integration Hub
              </h4>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                Project: fkwujxzeahauouhquhdw
              </span>
            </div>
            
            <p className="text-xs text-slate-600 mt-1.5 max-w-xl leading-relaxed">
              {supabaseStatus === 'connected' && `Your international student database is operating directly in live mode. Any website appointments will save onto your Supabase Cloud cluster in real time.`}
              {supabaseStatus === 'missing_table' && `Connected to Supabase account, but you haven't created the table structure yet! Please execute the SQL schema below to activate your CRM.`}
              {supabaseStatus === 'loading' && `Securing handshake with Supabase Cloud project containers...`}
              {supabaseStatus === 'error' && `Error connecting: ${supabaseErrorMessage}. Please double check project and key availability.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleBackupToSupabase}
              disabled={isSyncing || supabaseStatus === 'loading'}
              className="bg-[#05452d] hover:bg-[#03301f] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center space-x-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 text-[#c5a059]" />
                  <span>Sync Local &rarr; Supabase</span>
                </>
              )}
            </button>
            
            <button
              onClick={fetchSupabaseData}
              disabled={isSyncing || supabaseStatus === 'loading'}
              className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
            >
              Refresh Config
            </button>
          </div>
        </div>

        {/* If table is pending, show high contrast workspace copy section */}
        {supabaseStatus === 'missing_table' && supabaseConfig && (
          <div className="mt-4 border-t border-slate-250 pt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs font-sans text-amber-950">
              <span className="font-bold uppercase tracking-wider block text-amber-900 mb-1">
                ⚠️ Required Step: Supabase Schema Query
              </span>
              Navigate to your Supabase Dashboard &rarr; SQL Editor &rarr; Create New Query, copy-paste the query below, then click "Run" to initialize your database structure:
              
              <div className="mt-3 relative">
                <textarea
                  readOnly
                  value={supabaseConfig.requiredSql}
                  className="w-full bg-slate-900 text-lime-400 font-mono text-[11px] p-3 rounded-lg h-36 border border-slate-850 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(supabaseConfig.requiredSql);
                    showToast("SQL query copied to clipboard!");
                  }}
                  className="absolute right-2 top-2 bg-[#05452d] hover:bg-[#03301f] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all shadow-md"
                >
                  Copy SQL Query
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-100 pb-2 space-x-2">
        <button
          onClick={() => setCrmView("leads")}
          className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            crmView === "leads"
              ? "bg-[#05452d] text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          👥 Candidate Leads ({leads.length})
        </button>
        <button
          onClick={() => setCrmView("payments")}
          className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            crmView === "payments"
              ? "bg-amber-500 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          💳 SSLCOMMERZ Payments Ledger
        </button>
      </div>

      {crmView === "leads" ? (
        <>
          {/* Search / Filters Controls */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate name or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#05452d]"
            id="admin-lead-search"
          />
        </div>

        {/* Filter buttons group */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center">
            <Filter className="h-3.5 w-3.5 mr-1" /> Filters:
          </span>
          {["All", "New", "In Assessment", "Uni Approved", "Visa Pending", "Visa Approved"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-[10px] sm:text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                statusFilter === status
                  ? "bg-[#05452d] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Details editor overlay sidebar */}
      {selectedLead && (
        <div className="bg-amber-50/50 border border-[#f5a623]/20 p-5 rounded-2xl animate-in slide-in-from-top-6 duration-300">
          <div className="flex items-center justify-between mb-4 border-b border-amber-200/50 pb-2.5">
            <h4 className="font-display font-bold text-base text-[#05452d] flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-[#f5a623]" />
              <span>Update Consultation: {selectedLead.fullName}</span>
            </h4>
            <button onClick={() => setSelectedLead(null)} className="text-xs text-slate-500 hover:underline">
              Cancel edit
            </button>
          </div>

          <form onSubmit={handleUpdateLead} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-bold uppercase block">Change Status</label>
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value as Lead["status"])}
                className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg font-medium text-[#05452d]"
              >
                {["New", "Contacted", "In Assessment", "Uni Approved", "Visa Pending", "Visa Approved", "Completed", "No Response"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-600 font-bold uppercase block">Counselor internal details & notes</label>
              <input
                type="text"
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Assign counselors, update transcripts received, GTE audits..."
                className="w-full bg-white border border-slate-200 text-xs py-2 px-3 rounded-lg text-slate-800"
                required
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-[#05452d] hover:bg-[#03301f] text-white py-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#05452d]/15 cursor-pointer"
              >
                Update CRM entries
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Table wrapper of filtered leads */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="workspace-leads-table">
        <div className="p-4 border-b border-slate-100 bg-slate-50 text-slate-600 text-xs font-bold grid grid-cols-12 gap-2 text-left">
          <div className="col-span-3">Candidate & Contacts</div>
          <div className="col-span-2">Education Completed</div>
          <div className="col-span-2">destination & Intake</div>
          <div className="col-span-3">Counselor Notes / Message</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ClipboardList className="h-12 w-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm font-medium">No consultation leads found matching this filter criteria.</p>
            <p className="text-xs text-slate-400 mt-0.5">Simulate some live leads using the button in top headers.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => {
                  setSelectedLead(lead);
                  setEditingNotes(lead.notes || "");
                  setEditingStatus(lead.status);
                }}
                className={`p-4 grid grid-cols-12 gap-2 text-xs text-slate-700 items-center hover:bg-slate-50 cursor-pointer transition-all ${
                  selectedLead?.id === lead.id ? "bg-amber-100/30" : ""
                }`}
              >
                {/* Candidate */}
                <div className="col-span-3 space-y-1">
                  <h4 className="font-display font-bold text-slate-900 text-sm leading-tight">{lead.fullName}</h4>
                  <div className="text-[11px] text-slate-500 font-mono">
                    <p>{lead.email}</p>
                    <p>{lead.mobileNumber}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-sans">Registered: {lead.createdAt}</span>
                </div>

                {/* Level */}
                <div className="col-span-2 text-slate-600 font-medium font-sans">
                  {lead.educationLevel}
                </div>

                {/* Country */}
                <div className="col-span-2 space-y-1">
                  <span className="font-bold text-[#05452d] bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase">
                    {lead.preferredCountry}
                  </span>
                  <p className="text-[11px] text-slate-500 font-sans italic">Intake: Fall 2026/28</p>
                </div>

                {/* Notes Column */}
                <div className="col-span-3 space-y-1 pr-2">
                  <p className="text-slate-500 line-clamp-1 italic">"{lead.message}"</p>
                  {lead.notes ? (
                    <p className="text-emerald-700 font-medium bg-emerald-50 leading-tight px-1.5 py-0.5 rounded border border-emerald-100/50 inline-block text-[10px]">
                      ✍️ {lead.notes}
                    </p>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">No internal notes</span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="col-span-1 text-center">
                  <span
                    className={`inline-block py-1 px-2.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      lead.status === "New" ? "bg-red-100 text-red-700 border border-red-200" :
                      lead.status === "Visa Approved" ? "bg-green-100 text-green-700 border border-green-200" :
                      lead.status === "Uni Approved" ? "bg-[#c5a059]/20 text-[#05452d] border border-[#c5a059]/30" :
                      "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>

                {/* Delete/Action */}
                <div className="col-span-1 text-right flex justify-end space-x-1.5">
                  <button
                    onClick={(e) => handleDeleteLead(lead.id, e)}
                    className="p-1 px-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200/50 text-slate-400 rounded-lg transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      ) : (
        /* SSLCOMMERZ Payments Ledger View for Internal Counselors */
        <div className="space-y-4 text-left animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                Safe Payment Settlement Ledger & Receipts
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Authorized financial payments synced directly from SSLCOMMERZ gateway container nodes.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={fetchTxList}
                disabled={isTxLoading}
                className="bg-[#05452d] hover:bg-[#03301f] text-white text-xs font-bold py-2 px-3.5 rounded-lg transition-all active:scale-95 cursor-pointer font-sans select-none"
              >
                {isTxLoading ? "Refreshing..." : "Sync Fresh Logs"}
              </button>
            </div>
          </div>

          {txWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed font-sans">
              💡 {txWarning}
            </div>
          )}

          {isTxLoading ? (
            <div className="text-center py-12 space-y-2">
              <span className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="text-xs text-slate-500 font-sans">Querying candidate payments from live sandbox cluster...</p>
            </div>
          ) : txList.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-500 bg-slate-50">
              <Coins className="h-8 w-8 text-slate-300 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-bold text-slate-700">No payment settlement logs located.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Initialize simulated payment logs inside Candidate's Schedule screen using SSLCOMMERZ Pay Online.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-extrabold select-none me-2">
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">Candidate Profile</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Charged</th>
                    <th className="py-3 px-4">Gate Bank Ref</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txList.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {tx.id}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          📅 {tx.createdAt}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-950 font-sans">{tx.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          📧 {tx.email} &bull; {tx.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium font-sans">
                        {tx.feeType}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[#05452d] font-mono text-sm">
                          {tx.currency === "BDT" ? "৳" : "$"} {tx.amount.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {tx.currency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold font-mono text-slate-800">
                          {tx.bankTranId || "N/A"}
                        </div>
                        <span className="text-[10px] text-slate-500 font-sans">
                          💳 Method: {tx.cardType || "Online / SSL"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block ${
                          tx.status.toLowerCase() === "success"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : tx.status.toLowerCase() === "pending"
                            ? "bg-amber-100 text-amber-800 border border-amber-250 animate-pulse"
                            : tx.status.toLowerCase() === "cancelled"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-rose-100 text-rose-800 border border-rose-220"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Integration hints footer details */}
      <div className="bg-slate-50 p-4 rounded-xl text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border border-slate-200/50 select-none">
        <span>✅ Local consultation files synced with browser memory (`localStorage`).</span>
        <span>🔥 Designed ready for direct migration to Firebase Firestore or Supabase backend.</span>
      </div>
    </div>
  );
}
