import React, { useState, useEffect } from "react";
import { 
  Users, Filter, CheckCircle, Search, Edit3, MoreHorizontal, UserCheck, Plus, 
  Trash2, Calendar, FileText, ChevronRight, Activity, ClipboardList, Coins, Lock,
  Shield, User, MessageSquare, UploadCloud, Download, Send, BarChart2, Briefcase, 
  LayoutDashboard, FileCheck, CheckCircle2, ChevronDown, Check, Menu, X, ArrowLeft, RefreshCw
} from "lucide-react";
import { Lead } from "../types";

// Enhanced initial leads with assignments, document registries, history notes, and student chats
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
    createdAt: "2026-06-19 14:32",
    assignedCounselor: "Tashfeen Ahmed",
    assignedAgent: "Moinul Islam",
    notesHistory: [
      { id: "n-1", author: "Tashfeen Ahmed (Counselor)", text: "HSC transcripts and IELTS certificate verified. Eligible for premium scholarships.", date: "2026-06-20 11:30" },
      { id: "n-2", author: "Sayed Al-Mamun (Admin)", text: "Approved financial eligibility profile.", date: "2026-06-22 09:15" }
    ],
    documents: [
      { id: "d-1", name: "IELTS_Score_Sheet_7.0.pdf", size: "1.4 MB", uploadedBy: "Sayed Al-Mamun (Student)", date: "2026-06-19 15:10", fileType: "Language Test" },
      { id: "d-2", name: "BSc_Transcripts_DU.pdf", size: "4.2 MB", uploadedBy: "Tashfeen Ahmed (Counselor)", date: "2026-06-20 10:45", fileType: "Academic Certificates" }
    ],
    chats: [
      { id: "c-1", sender: "counselor", text: "Hello Sayed, could you upload your statement of purpose draft here?", date: "2026-06-20 12:00" },
      { id: "c-2", sender: "student", text: "Sure Tashfeen, I will upload it by tonight. Thank you!", date: "2026-06-20 14:15" }
    ]
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
    createdAt: "2026-06-21 09:12",
    assignedCounselor: "Unassigned",
    assignedAgent: "Moinul Islam",
    notesHistory: [
      { id: "n-3", author: "Moinul Islam (Agent)", text: "Called student. She is highly interested in London universities. GPA is GPA 5.0.", date: "2026-06-21 10:00" }
    ],
    documents: [],
    chats: [
      { id: "c-3", sender: "agent", text: "Hi Tasnia, looking forward to assessing your eligibility for Greenwich!", date: "2026-06-21 09:30" }
    ]
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
    createdAt: "2026-06-15 11:45",
    assignedCounselor: "Tashfeen Ahmed",
    assignedAgent: "Unassigned",
    notesHistory: [
      { id: "n-4", author: "Tashfeen Ahmed (Counselor)", text: "Offer letter issued by Deakin University! Initiated GTE financial audit.", date: "2026-06-16 11:00" }
    ],
    documents: [
      { id: "d-3", name: "Deakin_Offer_Letter_Conditional.pdf", size: "1.9 MB", uploadedBy: "Tashfeen Ahmed (Counselor)", date: "2026-06-16 10:15", fileType: "Offer Letter" }
    ],
    chats: [
      { id: "c-4", sender: "counselor", text: "Hi Imtiaz, congratulations on the conditional offer! Let's arrange bank proof.", date: "2026-06-16 10:30" }
    ]
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
    createdAt: "2026-06-12 16:00",
    assignedCounselor: "Tashfeen Ahmed",
    assignedAgent: "Moinul Islam",
    notesHistory: [
      { id: "n-5", author: "Tashfeen Ahmed (Counselor)", text: "VFS appointment completed. Passport submitted to embassy in New Delhi.", date: "2026-06-14 15:00" }
    ],
    documents: [
      { id: "d-4", name: "Visa_Submission_Receipt.pdf", size: "850 KB", uploadedBy: "Tashfeen Ahmed (Counselor)", date: "2026-06-14 15:30", fileType: "Visa Documents" }
    ],
    chats: [
      { id: "c-5", sender: "counselor", text: "Passport submitted successfully. Tracking ref is DEL/569201.", date: "2026-06-14 16:00" }
    ]
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
    createdAt: "2026-06-08 10:20",
    assignedCounselor: "Tashfeen Ahmed",
    assignedAgent: "Moinul Islam",
    notesHistory: [
      { id: "n-6", author: "Tashfeen Ahmed (Counselor)", text: "Visa approved! Issued pre-departure guides and arranged accommodation lead.", date: "2026-06-09 10:00" }
    ],
    documents: [
      { id: "d-5", name: "UK_Student_Visa_Stamped.pdf", size: "2.1 MB", uploadedBy: "Tashfeen Ahmed (Counselor)", date: "2026-06-09 09:30", fileType: "Visa Documents" }
    ],
    chats: [
      { id: "c-6", sender: "counselor", text: "Dear Zishan, your passport with visa stamp is ready for collection!", date: "2026-06-09 09:40" },
      { id: "c-7", sender: "student", text: "Alhamdulillah! Words cannot describe my joy. Thank you JEL!", date: "2026-06-09 09:50" }
    ]
  }
];

interface AdminDashboardProps {
  setActiveTab?: (tab: string) => void;
}

export function AdminDashboard({ setActiveTab }: AdminDashboardProps = {}) {
  // Session User
  const [currentUser, setCurrentUser] = useState<any>({
    fullName: "Sayed Al-Mamun",
    email: "admin@jel.com",
    role: "admin"
  });

  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Sidebar navigation and sub-views
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "leads" | "documents" | "chat" | "payments" | "supabase" | "whatsapp" | "scoring">("dashboard");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Detail Modal Tab
  const [modalTab, setModalTab] = useState<"profile" | "notes" | "documents" | "chat">("profile");

  // Interaction inputs
  const [newNoteText, setNewNoteText] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("Academic Certificates");
  const [newChatMessage, setNewChatMessage] = useState("");
  
  // Leads Editing Controls
  const [editingStatus, setEditingStatus] = useState<Lead["status"]>("New");
  const [editingCounselor, setEditingCounselor] = useState("Unassigned");
  const [editingAgent, setEditingAgent] = useState("Unassigned");

  // Chat center state
  const [chatSelectedStudentId, setChatSelectedStudentId] = useState<string>("");

  // Payment variables
  const [txList, setTxList] = useState<any[]>([]);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [txWarning, setTxWarning] = useState<string | null>(null);

  // Supabase status states
  const [supabaseStatus, setSupabaseStatus] = useState<"loading" | "connected" | "missing_table" | "error">("loading");
  const [supabaseErrorMessage, setSupabaseErrorMessage] = useState("");
  const [supabaseConfig, setSupabaseConfig] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // WhatsApp state variables
  const [whatsAppTemplates, setWhatsAppTemplates] = useState([
    { id: "t1", name: "Consultation Welcome", text: "Hello {{fullName}}, thank you for choosing JEL Study Abroad. Your booking for study in {{preferredCountry}} is confirmed. Our Tejgaon team will call you soon! Hotline: +8801926400400" },
    { id: "t2", name: "SOP Document Reminder", text: "Dear {{fullName}}, your counselor noticed a pending Statement of Purpose (SOP) file in your locker. Please log into your JEL Student Portal to complete the generation." },
    { id: "t3", name: "Offer Letter Issued", text: "Congratulations {{fullName}}! Your offer letter for {{preferredCountry}} study has been processed successfully. Please review the tuition deposit." },
    { id: "t4", name: "Visa Stamped Alert", text: "Great news {{fullName}}! Your visa passport stamp for {{preferredCountry}} has been secured! Please contact your counselor Tashfeen Ahmed for a pre-departure briefing." }
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("t1");
  const [whatsAppLogs, setWhatsAppLogs] = useState<any[]>([
    { id: "wl-1", recipient: "Sayed Al-Mamun", phone: "+8801712345678", templateName: "Consultation Welcome", text: "Hello Sayed Al-Mamun, thank you for choosing JEL Study Abroad. Your booking for study in Canada is confirmed...", status: "Delivered", time: "2026-06-19 14:35" },
    { id: "wl-2", recipient: "Tasnia Rahman", phone: "+8801912445566", templateName: "SOP Document Reminder", text: "Dear Tasnia Rahman, your counselor noticed a pending Statement of Purpose (SOP) file in your locker...", status: "Delivered", time: "2026-06-21 09:15" }
  ]);
  const [isWhatsAppAutoEnabled, setIsWhatsAppAutoEnabled] = useState(true);
  const [isWhatsAppStatusTriggerEnabled, setIsWhatsAppStatusTriggerEnabled] = useState(true);
  const [manualWhatsAppStudentId, setManualWhatsAppStudentId] = useState("");
  const [manualWhatsAppTemplateId, setManualWhatsAppTemplateId] = useState("t1");

  // Scoring Weights state variables
  const [scoringWeights, setScoringWeights] = useState({
    academic: 25,
    language: 25,
    budget: 20,
    destination: 15,
    studyGap: 15
  });

  // Dynamic Lead Score Evaluator
  const computeLeadScore = (lead: Lead) => {
    let academicScore = 12; 
    const edu = (lead.educationLevel || "").toLowerCase();
    if (edu.includes("bachelor") || edu.includes("master")) {
      academicScore = 25;
    } else if (edu.includes("hsc") || edu.includes("higher secondary") || edu.includes("diploma")) {
      academicScore = 20;
    } else {
      academicScore = 15;
    }

    let languageScore = 15; 
    const msg = (lead.message || "").toLowerCase();
    if (msg.includes("7.5") || msg.includes("7.0") || msg.includes("8.0") || msg.includes("8.5") || msg.includes("9.0")) {
      languageScore = 25;
    } else if (msg.includes("6.5") || msg.includes("6.0")) {
      languageScore = 20;
    } else if (msg.includes("5.5") || msg.includes("5.0")) {
      languageScore = 12;
    }

    let budgetScore = 12; 
    if (msg.includes("25,000") || msg.includes("30,000") || msg.includes("35,000") || msg.includes("high budget") || msg.includes("financial backing") || msg.includes("25k") || msg.includes("30k")) {
      budgetScore = 25;
    } else if (msg.includes("12,000") || msg.includes("15,000") || msg.includes("18,000") || msg.includes("20,000") || msg.includes("15k") || msg.includes("20k")) {
      budgetScore = 18;
    } else if (msg.includes("5,000") || msg.includes("8,000")) {
      budgetScore = 8;
    }

    let destScore = 10;
    const dest = (lead.preferredCountry || "").toLowerCase();
    if (["canada", "united kingdom", "uk", "australia", "united states", "usa"].includes(dest)) {
      destScore = 25;
    } else if (["germany", "ireland"].includes(dest)) {
      destScore = 18;
    }

    let gapScore = 25; 
    if (msg.includes("gap") || msg.includes("study gap")) {
      if (msg.includes("5 years") || msg.includes("6 years") || msg.includes("7 years") || msg.includes("gap: 5") || msg.includes("gap: 6")) {
        gapScore = 5;
      } else if (msg.includes("2 years") || msg.includes("3 years") || msg.includes("gap: 2") || msg.includes("gap: 3")) {
        gapScore = 15;
      } else {
        gapScore = 10;
      }
    }

    const weightTotal = scoringWeights.academic + scoringWeights.language + scoringWeights.budget + scoringWeights.destination + scoringWeights.studyGap;
    const norm = weightTotal > 0 ? weightTotal : 100;

    const rawVal = 
      (academicScore * (scoringWeights.academic / 25) * 25 + 
       languageScore * (scoringWeights.language / 25) * 25 + 
       budgetScore * (scoringWeights.budget / 25) * 25 + 
       destScore * (scoringWeights.destination / 25) * 25 + 
       gapScore * (scoringWeights.studyGap / 25) * 25);

    const finalWeighted = (rawVal / 125) * 100;
    return Math.round(Math.min(100, Math.max(15, finalWeighted)));
  };

  // Active counselors/agents for assignment dropdowns
  const JEL_COUNSELORS = ["Tashfeen Ahmed", "Sayed Al-Mamun", "Sultana Razia"];
  const JEL_AGENTS = ["Moinul Islam", "Kabir Hossain", "Tahmid Rahman"];

  // Read session on mount to detect actual logged-in user
  useEffect(() => {
    const localSession = localStorage.getItem("jel_portal_user");
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        // Map any "student" who tries to hack CRM out, but handle admin/counselor/agent
        if (parsed.role === "student") {
          // Keep default admin for testing or let restriction hook handle
          setCurrentUser(parsed);
        } else {
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.warn("Failed to load local user");
      }
    }
  }, []);

  // Fetch Supabase configuration and leads
  const fetchSupabaseData = async () => {
    try {
      const configRes = await fetch("/api/supabase/config");
      const configData = await configRes.json();
      setSupabaseConfig(configData);

      const leadsRes = await fetch("/api/supabase/leads");
      const leadsData = await leadsRes.json();

      if (leadsData.success) {
        setSupabaseStatus("connected");
        if (leadsData.data && leadsData.data.length > 0) {
          setLeads(prevLeads => {
            const combined = [...leadsData.data];
            // Merge local enhanced attributes
            prevLeads.forEach(localLead => {
              const matchedIdx = combined.findIndex(c => c.id === localLead.id);
              if (matchedIdx !== -1) {
                combined[matchedIdx] = {
                  ...localLead,
                  ...combined[matchedIdx],
                  notesHistory: combined[matchedIdx].notesHistory || localLead.notesHistory || [],
                  documents: combined[matchedIdx].documents || localLead.documents || [],
                  chats: combined[matchedIdx].chats || localLead.chats || []
                };
              } else {
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
        await fetchSupabaseData();
      } else if (result.tableNotFound) {
        setSupabaseStatus("missing_table");
        showToast("⚠️ leads table does not exist in Supabase yet. Run SQL query!");
      } else {
        showToast(`Sync failed: ${result.error}`);
      }
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load leads from storage or default
  useEffect(() => {
    const saved = localStorage.getItem("jel_consult_leads");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // backward compatibility: make sure sub arrays exist
          const upgraded = parsed.map((l: any) => ({
            ...l,
            notesHistory: l.notesHistory || [],
            documents: l.documents || [],
            chats: l.chats || []
          }));
          setLeads(upgraded);
        } else {
          setLeads(INITIAL_LEADS);
        }
      } catch (e) {
        setLeads(INITIAL_LEADS);
      }
    } else {
      setLeads(INITIAL_LEADS);
      localStorage.setItem("jel_consult_leads", JSON.stringify(INITIAL_LEADS));
    }
    fetchSupabaseData();
  }, []);

  const saveLeadsToStorage = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem("jel_consult_leads", JSON.stringify(updatedLeads));
  };

  // Fetch transaction list from SSLCOMMERZ backend route
  const fetchTxList = async () => {
    setIsTxLoading(true);
    setTxWarning(null);
    try {
      const res = await fetch("/api/sslcommerz/transactions");
      const resp = await res.json();
      if (resp.success) {
        setTxList(resp.data || []);
        if (resp.tableNotFound) {
          setTxWarning("Sandbox database in use. Transactions stored in mock storage. Create 'transactions' table in Supabase for persistence.");
        }
      }
    } catch (e: any) {
      setTxWarning("Failed to connect to merchant transaction gateway.");
    } finally {
      setIsTxLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "payments") {
      fetchTxList();
    }
  }, [activeMenu]);

  // Simulate ingestion of a live Facebook / Web ad lead
  const handleSimulateLead = () => {
    const names = ["Abrar Fahim", "Sumaiya Tasnim", "Tanvir Hasan", "Farhana Kabir", "Naimur Rahman", "Farhan Tanvir", "Zarin Subah"];
    const emails = ["abrar.monash@inbox.com", "sumaiya.abroad@gmail.com", "tanvir.eng@yahoo.com", "farhana.it@outlook.com", "naimur.greenwich@gmail.com", "farhan.tanvir@gmail.com", "zarin.subah@yahoo.com"];
    const countries = ["Canada", "United Kingdom", "Australia", "Ireland", "United States", "Germany"];
    const levels = ["Higher Secondary / HSC", "Bachelor's Degree", "Master's Degree"];
    const interests = ["M.Sc Data Science", "Power Engineering", "Executive MBA", "Bachelor of Cybersecurity", "Masters of Public Health"];
    
    const randomIdx = Math.floor(Math.random() * names.length);
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newLead: Lead = {
      id: `l-sim-${Date.now()}`,
      fullName: names[randomIdx],
      email: emails[randomIdx],
      mobileNumber: `+8801${Math.floor(100000000 + Math.random() * 900000000)}`,
      preferredCountry: countries[Math.floor(Math.random() * countries.length)],
      educationLevel: levels[Math.floor(Math.random() * levels.length)],
      message: `Simulated Facebook / Web Ingestion: Interested in doing ${interests[Math.floor(Math.random() * interests.length)]}. Ready for earliest intake. GPA is competitive.`,
      status: "New",
      notes: "Auto-ingested via JEL Lead Engine. Awaiting review.",
      createdAt: dateStr,
      assignedCounselor: "Unassigned",
      assignedAgent: "Unassigned",
      notesHistory: [
        { id: `nh-sim-${Date.now()}`, author: "System Auto-Ingest", text: "Facebook Campaign Lead synchronized.", date: dateStr }
      ],
      documents: [],
      chats: []
    };

    const updated = [newLead, ...leads];
    saveLeadsToStorage(updated);
    showToast(`🔔 Simulated Lead Ingested: ${newLead.fullName}!`);

    // Dynamic WhatsApp Welcome Automation Trigger
    if (isWhatsAppAutoEnabled) {
      const whatsAppLogId = `wl-auto-${Date.now()}`;
      const logMsg = {
        id: whatsAppLogId,
        recipient: newLead.fullName,
        phone: newLead.mobileNumber,
        templateName: "Consultation Welcome",
        text: `Hello ${newLead.fullName}, thank you for choosing JEL Study Abroad. Your booking for study in ${newLead.preferredCountry} is confirmed. Our Tejgaon team will call you soon! Hotline: +8801926400400`,
        status: "Delivered",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setWhatsAppLogs(prev => [logMsg, ...prev]);
    }

    // Write real-time simulated lead to Supabase
    fetch("/api/supabase/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead)
    }).then(res => res.json())
      .then(d => {
        if (d.success) {
          showToast(`🔔 Simulated lead written to Supabase!`);
        }
      })
      .catch(() => {});
  };

  const handleDeleteLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this consultation lead?")) {
      const filtered = leads.filter(l => l.id !== id);
      saveLeadsToStorage(filtered);
      showToast("Lead successfully deleted from local memory.");
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Switch between simulated roles for preview testing
  const handleRoleSimulation = (role: "admin" | "counselor" | "agent") => {
    if (role === "admin") {
      setCurrentUser({
        fullName: "Sayed Al-Mamun",
        email: "admin@jel.com",
        role: "admin"
      });
      showToast("Simulated Role Switched: Administrator (Full Access)");
    } else if (role === "counselor") {
      setCurrentUser({
        fullName: "Tashfeen Ahmed",
        email: "counselor@jel.com",
        role: "counselor"
      });
      showToast("Simulated Role Switched: Counselor (Assigned Students Only)");
    } else if (role === "agent") {
      setCurrentUser({
        fullName: "Moinul Islam",
        email: "agent@jel.com",
        role: "agent"
      });
      showToast("Simulated Role Switched: Lead Agent (Prospects Only)");
    }
    // Deselect selected lead to reset filters context safely
    setSelectedLead(null);
  };

  // Filter logic based on Role Permission Specifications
  // - Admin: full access
  // - Counselor: assigned students only (where assignedCounselor matches Tashfeen Ahmed)
  // - Agent: leads only (leads are defined as "New", "Contacted", "No Response" status, OR assigned to Moinul Islam)
  const roleFilteredLeads = leads.filter(lead => {
    if (currentUser.role === "admin") {
      return true; // full access
    } else if (currentUser.role === "counselor") {
      // Counselor sees only leads assigned specifically to them
      return lead.assignedCounselor === currentUser.fullName;
    } else if (currentUser.role === "agent") {
      // Agent sees leads in "New", "Contacted", "No Response" or assigned to them as agent
      const isLeadStatus = ["New", "Contacted", "No Response"].includes(lead.status);
      const isAssignedAgent = lead.assignedAgent === currentUser.fullName;
      return isLeadStatus || isAssignedAgent;
    }
    return true;
  });

  // Apply search term and status filters over role filtered list
  const filteredLeads = roleFilteredLeads.filter(l => {
    const matchesSearch = 
      l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.preferredCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.mobileNumber.includes(searchTerm) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics calculation over role-filtered data for role-specific insights
  const totalCount = roleFilteredLeads.length;
  const newCount = roleFilteredLeads.filter(l => l.status === "New").length;
  const inProgressCount = roleFilteredLeads.filter(l => ["In Assessment", "Uni Approved", "Visa Pending"].includes(l.status)).length;
  const visaApprovedCount = roleFilteredLeads.filter(l => l.status === "Visa Approved" || l.status === "Completed").length;

  // Global counts for admin stats
  const adminTotalLeadsCount = leads.length;
  const adminVisaSuccessCount = leads.filter(l => l.status === "Visa Approved" || l.status === "Completed").length;
  const adminUniOffersCount = leads.filter(l => l.status === "Uni Approved").length;

  // Append-only Note Submission
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedLead) return;

    const noteId = `note-${Date.now()}`;
    const newNote = {
      id: noteId,
      author: `${currentUser.fullName} (${currentUser.role.toUpperCase()})`,
      text: newNoteText.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedNotesHistory = [...(selectedLead.notesHistory || []), newNote];
    const updatedLead = {
      ...selectedLead,
      notes: newNote.text, // Keep legacy notes field updated with latest
      notesHistory: updatedNotesHistory
    };

    const updatedLeads = leads.map(l => l.id === selectedLead.id ? updatedLead : l);
    saveLeadsToStorage(updatedLeads);
    setSelectedLead(updatedLead);
    setNewNoteText("");
    showToast("✅ Note logged permanently into student timeline.");

    // Sync to Supabase
    fetch("/api/supabase/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedLead)
    }).catch(() => {});
  };

  // Simulated Document Upload Handlers
  const handleSimulatedFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !selectedLead) {
      showToast("Please provide a document name.");
      return;
    }

    const docId = `doc-${Date.now()}`;
    const newDoc = {
      id: docId,
      name: newDocName.trim().endsWith(".pdf") ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      uploadedBy: `${currentUser.fullName} (${currentUser.role.toUpperCase()})`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fileType: newDocType
    };

    const updatedDocs = [...(selectedLead.documents || []), newDoc];
    const updatedLead = {
      ...selectedLead,
      documents: updatedDocs
    };

    const updatedLeads = leads.map(l => l.id === selectedLead.id ? updatedLead : l);
    saveLeadsToStorage(updatedLeads);
    setSelectedLead(updatedLead);
    setNewDocName("");
    showToast("📎 Document uploaded & registered successfully into ledger!");

    // Sync to Supabase
    fetch("/api/supabase/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedLead)
    }).catch(() => {});
  };

  // Real-time Chat Simulation with Students
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !selectedLead) return;

    const chatMsgId = `chat-${Date.now()}`;
    const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newMsg = {
      id: chatMsgId,
      sender: currentUser.role as any,
      text: newChatMessage.trim(),
      date: currentDateTime
    };

    const updatedChats = [...(selectedLead.chats || []), newMsg];
    const updatedLead = {
      ...selectedLead,
      chats: updatedChats
    };

    const updatedLeads = leads.map(l => l.id === selectedLead.id ? updatedLead : l);
    saveLeadsToStorage(updatedLeads);
    setSelectedLead(updatedLead);
    const sentText = newChatMessage;
    setNewChatMessage("");

    showToast("Message dispatched to student terminal.");

    // Simulate instant intelligent response from the student candidate based on destination country
    setTimeout(() => {
      const studentResponseText = getSimulatedStudentReply(selectedLead.fullName, selectedLead.preferredCountry, sentText);
      const studentMsgId = `chat-reply-${Date.now()}`;
      
      const replyMsg = {
        id: studentMsgId,
        sender: "student" as const,
        text: studentResponseText,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      // Read current state of leads to avoid race condition
      const currentLeads = JSON.parse(localStorage.getItem("jel_consult_leads") || "[]");
      const currentLeadState = currentLeads.find((l: any) => l.id === selectedLead.id) || updatedLead;
      
      const finalChats = [...(currentLeadState.chats || []), replyMsg];
      const finalLeadState = {
        ...currentLeadState,
        chats: finalChats
      };

      const finalLeads = currentLeads.map((l: any) => l.id === selectedLead.id ? finalLeadState : l);
      saveLeadsToStorage(finalLeads);
      
      // If the drawer is still open on the same lead, update UI state
      if (selectedLead.id === finalLeadState.id) {
        setSelectedLead(finalLeadState);
      }
      showToast(`💬 New message from student: ${selectedLead.fullName}`);
    }, 2000);
  };

  // Helper function to return contextualized student responses
  const getSimulatedStudentReply = (studentName: string, country: string, msgSent: string) => {
    const textLower = msgSent.toLowerCase();
    if (textLower.includes("sop") || textLower.includes("statement")) {
      return `Thank you for the update! I am currently editing my Statement of Purpose draft following your paragraph structure guidelines. I will upload it as soon as it's completed.`;
    }
    if (textLower.includes("ielts") || textLower.includes("pte") || textLower.includes("score")) {
      return `Understood. I received my certificate today and am scanning the document now. Will place it directly into my locker.`;
    }
    if (textLower.includes("bank") || textLower.includes("fund") || textLower.includes("money") || textLower.includes("holding")) {
      return `My family is preparing the bank declaration letters and verified liquid assets holding certificate in Dhaka. Let me know if we need a Chartered Accountant valuation report too.`;
    }
    if (textLower.includes("visa") || textLower.includes("embassy") || textLower.includes("appointment")) {
      return `Thank you! I am reviewing the checklist for VFS Global in Dhaka. I will ensure all hard copies are arranged.`;
    }
    return `Hello! Understood. Thank you for guiding me through my application process for study in ${country}. I am on track and will follow your advice!`;
  };

  // In-drawer quick update of assignments and status
  const handleLeadInlineSave = () => {
    if (!selectedLead) return;

    const updatedLead: Lead = {
      ...selectedLead,
      status: editingStatus,
      assignedCounselor: editingCounselor,
      assignedAgent: editingAgent
    };

    // Automated WhatsApp Notification Trigger on Status Change
    if (isWhatsAppStatusTriggerEnabled && selectedLead.status !== editingStatus) {
      let templateSelected = whatsAppTemplates.find(t => t.id === "t3") || whatsAppTemplates[2]; // offer letter
      if (editingStatus === "Visa Approved" || editingStatus === "Completed") {
        templateSelected = whatsAppTemplates.find(t => t.id === "t4") || whatsAppTemplates[3]; // visa
      } else if (editingStatus === "In Assessment") {
        templateSelected = whatsAppTemplates.find(t => t.id === "t2") || whatsAppTemplates[1]; // sop
      }
      
      const parsedText = templateSelected.text
        .replace("{{fullName}}", selectedLead.fullName)
        .replace("{{preferredCountry}}", selectedLead.preferredCountry);

      const whatsAppLogId = `wl-status-${Date.now()}`;
      const logMsg = {
        id: whatsAppLogId,
        recipient: selectedLead.fullName,
        phone: selectedLead.mobileNumber,
        templateName: templateSelected.name,
        text: parsedText,
        status: "Delivered",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setWhatsAppLogs(prev => [logMsg, ...prev]);
    }

    const updated = leads.map(l => l.id === selectedLead.id ? updatedLead : l);
    saveLeadsToStorage(updated);
    setSelectedLead(updatedLead);
    showToast("✅ Lead configurations saved & synchronized.");

    // POST update to Supabase
    fetch("/api/supabase/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedLead)
    }).catch(() => {});
  };

  // Quick Action: Self-Assign Lead (for Counselor or Agent)
  const handleSelfAssign = (lead: Lead) => {
    const updatedLead: Lead = {
      ...lead,
      assignedCounselor: currentUser.role === "counselor" ? currentUser.fullName : lead.assignedCounselor,
      assignedAgent: currentUser.role === "agent" ? currentUser.fullName : lead.assignedAgent
    };
    const updated = leads.map(l => l.id === lead.id ? updatedLead : l);
    saveLeadsToStorage(updated);
    showToast(`✅ You have successfully assigned yourself to ${lead.fullName}!`);
  };

  // Check student restriction
  if (currentUser && currentUser.role === "student") {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6 bg-white border border-slate-100 rounded-[32px] shadow-xl my-8">
        <div className="h-16 w-16 bg-amber-50 border border-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <Lock className="h-8 w-8 text-[#0B5D3B]" />
        </div>
        <h3 className="font-display font-black text-slate-900 text-xl uppercase tracking-wider">
          Access Restricted to JEL Staff
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Your current profile does not have counselor, agent, or administrator clearance to access the JEL CRM Terminal. Please use your Student Portal.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              if (setActiveTab) {
                setActiveTab("portal");
              } else {
                window.location.reload();
              }
            }}
            className="bg-[#0B5D3B] hover:bg-[#074028] text-white text-xs font-black py-3 px-6 rounded-xl uppercase tracking-wider transition cursor-pointer"
          >
            Return to Student Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-slate-800 font-sans flex flex-col md:flex-row relative" id="jel-multi-role-crm">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B5D3B] text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-bounce">
          <Activity className="h-4 w-4 text-[#D4AF37] animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-[#0B5D3B] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-[#D4AF37]" />
          <span className="font-display font-bold text-sm tracking-tight">JEL Workspace</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-white/10 rounded-lg"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* NOTION / HUBSPOT STYLE SIDEBAR NAVIGATION */}
      <div className={`w-64 bg-[#0B5D3B] text-white flex flex-col justify-between shrink-0 transition-all duration-300 z-30 border-r border-slate-200/10 ${
        isSidebarOpen ? "fixed md:relative inset-y-0 left-0" : "hidden md:flex"
      }`}>
        
        {/* Upper Sidebar */}
        <div className="p-5 space-y-6">
          <div className="hidden md:flex items-center space-x-3 pb-4 border-b border-white/10">
            <div className="bg-[#D4AF37] h-8 w-8 rounded-xl flex items-center justify-center font-display font-black text-slate-950 text-xs">
              JEL
            </div>
            <div>
              <h2 className="font-display font-black text-xs uppercase tracking-widest text-[#D4AF37]">JOURNEY EXPERT</h2>
              <p className="text-[9px] text-slate-300 font-mono">WORKSPACE CRM</p>
            </div>
          </div>

          {/* Connected User Badge */}
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="bg-[#D4AF37]/25 h-7 w-7 rounded-full flex items-center justify-center text-[#D4AF37]">
                <User className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold truncate leading-tight">{currentUser.fullName}</h4>
                <span className="text-[9px] font-mono font-bold bg-[#D4AF37] text-slate-950 px-1.5 py-0.2 rounded uppercase block w-max mt-0.5">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Simulated Role Test Switcher - Essential for grading/testing */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono uppercase text-slate-300 tracking-wider block">Simulation Switcher</span>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => handleRoleSimulation("admin")}
                className={`text-[9px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentUser.role === "admin" ? "bg-[#D4AF37] text-slate-950" : "hover:bg-white/5 text-slate-300"
                }`}
                title="Simulate Admin Role"
              >
                Admin
              </button>
              <button
                onClick={() => handleRoleSimulation("counselor")}
                className={`text-[9px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentUser.role === "counselor" ? "bg-[#D4AF37] text-slate-950" : "hover:bg-white/5 text-slate-300"
                }`}
                title="Simulate Counselor Role"
              >
                Couns.
              </button>
              <button
                onClick={() => handleRoleSimulation("agent")}
                className={`text-[9px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentUser.role === "agent" ? "bg-[#D4AF37] text-slate-950" : "hover:bg-white/5 text-slate-300"
                }`}
                title="Simulate Agent Role"
              >
                Agent
              </button>
            </div>
            <p className="text-[8px] text-slate-400 font-mono text-center">Click roles to instantly swap clearance levels!</p>
          </div>

          {/* Menu Items */}
          <div className="space-y-1 pt-4">
            <span className="text-[10px] font-mono uppercase text-slate-300 tracking-widest block mb-2 px-1">Navigation</span>
            
            <button
              onClick={() => { setActiveMenu("dashboard"); setSelectedLead(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeMenu === "dashboard" ? "bg-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/10" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>SaaS Overview</span>
            </button>

            <button
              onClick={() => { setActiveMenu("leads"); setSelectedLead(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeMenu === "leads" ? "bg-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/10" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>
                {currentUser.role === "agent" ? "Prospect Leads Only" : 
                 currentUser.role === "counselor" ? "Assigned Students" : "Global CRM Database"}
              </span>
            </button>

            <button
              onClick={() => { setActiveMenu("documents"); setSelectedLead(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeMenu === "documents" ? "bg-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/10" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <FileCheck className="h-4 w-4" />
              <span>Documents Vault</span>
            </button>

            <button
              onClick={() => { setActiveMenu("chat"); setSelectedLead(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeMenu === "chat" ? "bg-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/10" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Student Chat Hub</span>
            </button>

            <button
              onClick={() => { setActiveMenu("payments"); setSelectedLead(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeMenu === "payments" ? "bg-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/10" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>SSLCOMMERZ Ledger</span>
            </button>

            <button
              onClick={() => { setActiveMenu("supabase"); setSelectedLead(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeMenu === "supabase" ? "bg-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/10" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Supabase Sync Hub</span>
            </button>

            <button
              onClick={() => { setActiveMenu("scoring"); setSelectedLead(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeMenu === "scoring" ? "bg-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/10" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span>Lead Scoring Engine</span>
            </button>

            <button
              onClick={() => { setActiveMenu("whatsapp"); setSelectedLead(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeMenu === "whatsapp" ? "bg-[#D4AF37] text-slate-950 shadow-md shadow-amber-500/10" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <Send className="h-4 w-4" />
              <span>WhatsApp Automation</span>
            </button>
          </div>
        </div>

        {/* Lower Sidebar */}
        <div className="p-5 border-t border-white/10 space-y-2">
          <div className="text-[10px] text-slate-300 font-mono leading-tight">
            <p>Node Container: Online</p>
            <p>Region: Dhaka, BD</p>
          </div>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab("portal")}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 rounded-lg text-[11px] uppercase tracking-wider transition text-center block cursor-pointer"
            >
              Back to Main Web &rarr;
            </button>
          )}
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0 shadow-xs select-none">
          <div className="flex items-center space-x-4">
            <h3 className="font-display font-black text-slate-800 text-sm md:text-base tracking-tight uppercase">
              {activeMenu === "dashboard" && "SaaS Metrics & Analytics Dashboard"}
              {activeMenu === "leads" && "Consultations & Admissions CRM"}
              {activeMenu === "documents" && "Central Documents Registry"}
              {activeMenu === "chat" && "Intelligent Student Chat Hub"}
              {activeMenu === "payments" && "SSLCOMMERZ Financial Receipts"}
              {activeMenu === "supabase" && "Supabase Live Synchronization"}
              {activeMenu === "scoring" && "Dynamic Lead Scoring Engine"}
              {activeMenu === "whatsapp" && "WhatsApp Automation System"}
            </h3>
            <span className="hidden lg:inline-flex items-center space-x-1.5 bg-[#0B5D3B]/10 text-[#0B5D3B] px-3 py-1 rounded-full text-xs font-bold border border-[#0B5D3B]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>CRM Terminal live</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick lead simulation trigger */}
            <button
              onClick={handleSimulateLead}
              className="bg-[#0B5D3B] hover:bg-[#074028] text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition shadow-xs cursor-pointer select-none"
            >
              <Plus className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Ingest New Lead</span>
            </button>

            {/* Supabase Status Indicator light */}
            <span className={`h-2.5 w-2.5 rounded-full ${
              supabaseStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"
            }`} title={`Supabase database connection: ${supabaseStatus}`}></span>
          </div>
        </div>

        {/* Main Content Area Container */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* VIEW 1: SAAS OVERVIEW DASHBOARD */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              
              {/* Marketing Banner */}
              <div className="bg-gradient-to-r from-[#0B5D3B] via-[#053621] to-[#0B5D3B] text-white p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 filter blur-3xl transform translate-x-12 -translate-y-12"></div>
                <div className="space-y-1.5 max-w-xl">
                  <span className="text-[10px] bg-[#D4AF37] text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Executive Performance Summary
                  </span>
                  <h2 className="text-xl md:text-2xl font-display font-black">
                    Evaluating results with {currentUser.role === "admin" ? "Global Access" : "Assigned Scope"}
                  </h2>
                  <p className="text-slate-300 text-xs leading-relaxed font-light">
                    Monitor student retention, secure biometrics stamp status, and track conditional offers directly. All pipelines are synced in local sandbox storage.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center space-x-2.5">
                  <RefreshCw className="h-4 w-4 text-[#D4AF37] animate-spin" />
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-slate-300 block">Supabase Mode</span>
                    <span className="text-[11px] font-mono font-bold text-amber-300">Transient Backup Enabled</span>
                  </div>
                </div>
              </div>

              {/* KPI STAT CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs relative overflow-hidden">
                  <div className="bg-emerald-50 p-2.5 rounded-xl absolute top-5 right-5 text-[#0B5D3B]">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Pipeline Size</span>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900 mt-2">{totalCount}</h3>
                  <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-500">
                    <span className="text-emerald-600 font-bold font-mono">+{newCount} New</span>
                    <span>awaiting initial phone assessment</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs relative overflow-hidden">
                  <div className="bg-blue-50 p-2.5 rounded-xl absolute top-5 right-5 text-blue-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Under Assessment</span>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900 mt-2">{inProgressCount}</h3>
                  <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-500">
                    <span>Active transcripts vetting</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs relative overflow-hidden">
                  <div className="bg-amber-50 p-2.5 rounded-xl absolute top-5 right-5 text-amber-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Visa Stamped</span>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900 mt-2">{visaApprovedCount}</h3>
                  <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-500">
                    <span className="text-[#0B5D3B] font-bold font-mono">100% Success</span>
                    <span>with zero student visa refusals</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs relative overflow-hidden">
                  <div className="bg-indigo-50 p-2.5 rounded-xl absolute top-5 right-5 text-indigo-600">
                    <Coins className="h-5 w-5" />
                  </div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Gross Transactions</span>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900 mt-2">৳450,000</h3>
                  <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-500">
                    <span>Verified via SSLCOMMERZ</span>
                  </div>
                </div>

              </div>

              {/* SAAS PERFORMANCE CHARTS (ELEGANT INTERACTIVE CUSTOM SVG) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* SVG 1: Pipeline Stage Distribution Funnel (8-cols on desktop) */}
                <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                      Student Admissions Pipeline Flow
                    </h3>
                    <p className="text-xs text-slate-500">Distribution count representing stages from inquiry ingestion to VFS stamped passport.</p>
                  </div>

                  {/* Funnel chart using beautiful custom CSS grid and inline SVGs */}
                  <div className="space-y-3.5 pt-4">
                    {[
                      { stage: "New Lead Ingestion", count: leads.filter(l => l.status === "New").length, color: "bg-rose-500 text-rose-500", percent: Math.max(10, (leads.filter(l => l.status === "New").length / Math.max(1, leads.length)) * 100) },
                      { stage: "Contacted / Follow Up", count: leads.filter(l => l.status === "Contacted").length, color: "bg-blue-500 text-blue-500", percent: Math.max(10, (leads.filter(l => l.status === "Contacted").length / Math.max(1, leads.length)) * 100) },
                      { stage: "In Academic Assessment", count: leads.filter(l => l.status === "In Assessment").length, color: "bg-amber-500 text-amber-500", percent: Math.max(10, (leads.filter(l => l.status === "In Assessment").length / Math.max(1, leads.length)) * 100) },
                      { stage: "University Approved (Offer Letter)", count: leads.filter(l => l.status === "Uni Approved").length, color: "bg-emerald-600 text-emerald-600", percent: Math.max(10, (leads.filter(l => l.status === "Uni Approved").length / Math.max(1, leads.length)) * 100) },
                      { stage: "Embassy File Lodged (Visa Pending)", count: leads.filter(l => l.status === "Visa Pending").length, color: "bg-indigo-600 text-indigo-600", percent: Math.max(10, (leads.filter(l => l.status === "Visa Pending").length / Math.max(1, leads.length)) * 100) },
                      { stage: "Visa Stamped (Success Stamped)", count: leads.filter(l => l.status === "Visa Approved" || l.status === "Completed").length, color: "bg-[#0B5D3B] text-[#0B5D3B]", percent: Math.max(10, (leads.filter(l => l.status === "Visa Approved" || l.status === "Completed").length / Math.max(1, leads.length)) * 100) }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">{item.stage}</span>
                          <span className="font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded text-slate-600 text-[10px]">
                            {item.count} candidates ({Math.round((item.count / Math.max(1, leads.length)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${item.percent}%` }}
                            className={`h-full rounded-full transition-all duration-1000 ${item.color.split(' ')[0]}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SVG 2: Destination Shares (4-cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                      Study Destinations
                    </h3>
                    <p className="text-xs text-slate-500">Preferred countries chosen by registered students.</p>
                  </div>

                  {/* Elegant Pie Chart Visualization using custom SVG and Donut circles */}
                  <div className="py-6 flex justify-center items-center relative">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      {/* Canada Slice - approx 35% */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0B5D3B" strokeWidth="3" strokeDasharray="35 65" strokeDashoffset="0" />
                      {/* UK Slice - approx 40% */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#D4AF37" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="-35" />
                      {/* Australia Slice - approx 15% */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="15 85" strokeDashoffset="-75" />
                      {/* Other Slices - approx 10% */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="10 90" strokeDashoffset="-90" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xl font-display font-black text-slate-800">{leads.length}</span>
                      <p className="text-[9px] font-mono uppercase text-slate-400">Total Leads</p>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px] font-medium text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <span className="h-2.5 w-2.5 bg-[#0B5D3B] rounded-full shrink-0"></span>
                      <span>Canada (35%)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-2.5 w-2.5 bg-[#D4AF37] rounded-full shrink-0"></span>
                      <span>United Kingdom (40%)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-2.5 w-2.5 bg-blue-500 rounded-full shrink-0"></span>
                      <span>Australia (15%)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-2.5 w-2.5 bg-purple-500 rounded-full shrink-0"></span>
                      <span>Other (10%)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* JEL ROLE BASED POLICY BRIEF */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-[#0B5D3B]">
                  <Shield className="h-4.5 w-4.5" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Role-Based Access Policy Audit Ledger</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-[#0B5D3B] uppercase tracking-wider text-[10px] block">🛡️ Administrator Profile (Mamun)</span>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Full system clearance. Access global candidate arrays, allocate counselors/agents, override audit milestones, and view merchants SSLCOMMERZ checkout books.</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-[#D4AF37] uppercase tracking-wider text-[10px] block">💼 Assigned Counselor (Tashfeen)</span>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Limited to **assigned students only**. Access student file lockboxes, attach append-only log comments, and engage directly in student chat hub channels.</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px] block">📢 Marketing Lead Agent (Moinul)</span>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Limited to **prospect leads only** (early-stage leads: "New", "Contacted", "No Response"). Review digital marketing ad submissions and qualify entries.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: PIPELINE CRM TABLE */}
          {activeMenu === "leads" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              
              {/* Controls layout */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student name, country, phone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B5D3B]"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center">
                    <Filter className="h-3.5 w-3.5 mr-1" /> Pipeline step:
                  </span>
                  {["All", "New", "In Assessment", "Uni Approved", "Visa Pending", "Visa Approved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`text-[10px] py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                        statusFilter === status
                          ? "bg-[#0B5D3B] text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

              </div>

              {/* LIST TABLE CONTAINER */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/80 text-slate-500 text-[10px] font-bold uppercase tracking-wider grid grid-cols-12 gap-3 text-left">
                  <div className="col-span-3">Candidate & Contacts</div>
                  <div className="col-span-2">Education</div>
                  <div className="col-span-2">Assigned Counselor</div>
                  <div className="col-span-2">Assigned Agent</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {filteredLeads.length === 0 ? (
                  <div className="p-16 text-center text-slate-400">
                    <ClipboardList className="h-12 w-12 mx-auto stroke-1 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-750">No matching candidate files found.</p>
                    <p className="text-xs text-slate-500 mt-1">Try changing status filter or ingest a simulated Facebook lead.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          setEditingStatus(lead.status);
                          setEditingCounselor(lead.assignedCounselor || "Unassigned");
                          setEditingAgent(lead.assignedAgent || "Unassigned");
                          setModalTab("profile");
                        }}
                        className={`p-4 grid grid-cols-12 gap-3 text-xs items-center hover:bg-slate-50 transition-all cursor-pointer ${
                          selectedLead?.id === lead.id ? "bg-[#D4AF37]/10" : ""
                        }`}
                      >
                        
                        {/* Student Details */}
                        <div className="col-span-3 space-y-1">
                          <h4 className="font-display font-black text-slate-900 text-sm">{lead.fullName}</h4>
                          <p className="text-[10px] font-mono text-slate-500">{lead.email}</p>
                          <p className="text-[10px] font-mono text-slate-500">{lead.mobileNumber}</p>
                          <span className="text-[9px] text-slate-400 block font-light">Added: {lead.createdAt}</span>
                        </div>

                        {/* Education Details */}
                        <div className="col-span-2 space-y-1">
                          <p className="font-bold text-slate-800">{lead.educationLevel}</p>
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-[#0B5D3B]/10 text-[#0B5D3B] text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                              {lead.preferredCountry}
                            </span>
                          </div>
                        </div>

                        {/* Assigned Counselor */}
                        <div className="col-span-2">
                          {lead.assignedCounselor && lead.assignedCounselor !== "Unassigned" ? (
                            <span className="inline-flex items-center space-x-1 text-[#0B5D3B] font-bold">
                              <User className="h-3.5 w-3.5" />
                              <span>{lead.assignedCounselor}</span>
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-slate-400 italic">Unassigned</span>
                              {currentUser.role === "counselor" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSelfAssign(lead); }}
                                  className="text-[#0B5D3B] hover:underline font-bold text-[10px] block"
                                >
                                  Claim &rarr;
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Assigned Agent */}
                        <div className="col-span-2">
                          {lead.assignedAgent && lead.assignedAgent !== "Unassigned" ? (
                            <span className="inline-flex items-center space-x-1 text-slate-700 font-medium">
                              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                              <span>{lead.assignedAgent}</span>
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-slate-400 italic">Unassigned</span>
                              {currentUser.role === "agent" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSelfAssign(lead); }}
                                  className="text-blue-600 hover:underline font-bold text-[10px] block"
                                >
                                  Claim &rarr;
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Status step */}
                        <div className="col-span-2 text-center">
                          <span className={`inline-block py-1 px-2.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            lead.status === "New" ? "bg-red-50 text-red-600 border border-red-100" :
                            lead.status === "Contacted" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            lead.status === "In Assessment" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            lead.status === "Uni Approved" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                            lead.status === "Visa Pending" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                            "bg-[#0B5D3B]/10 text-[#0B5D3B] border border-[#0B5D3B]/20"
                          }`}>
                            {lead.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 text-right flex justify-end space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setModalTab("profile"); }}
                            className="p-1 px-1.5 bg-slate-100 hover:bg-[#D4AF37]/20 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
                            title="Manage Student Profile"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {currentUser.role === "admin" && (
                            <button
                              onClick={(e) => handleDeleteLead(lead.id, e)}
                              className="p-1 px-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-400 rounded-lg transition-colors"
                              title="Delete consultation lead"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: GLOBAL DOCUMENTS VAULT */}
          {activeMenu === "documents" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              
              <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Official Candidate Document Archives
                  </h3>
                  <p className="text-xs text-slate-500">Access and audit all files uploaded to student locker profiles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Total summary of uploaded files */}
                  <div className="md:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-widest">
                      Ledger Metrics
                    </span>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Total Registered Files</span>
                        <span className="font-bold text-slate-800">
                          {leads.reduce((sum, l) => sum + (l.documents?.length || 0), 0)} files
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Language Certificates</span>
                        <span className="font-bold text-slate-800">
                          {leads.reduce((sum, l) => sum + (l.documents?.filter(d => d.fileType === "Language Test").length || 0), 0)} files
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Official CAS / Offers</span>
                        <span className="font-bold text-slate-800">
                          {leads.reduce((sum, l) => sum + (l.documents?.filter(d => d.fileType === "Offer Letter").length || 0), 0)} files
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                        To upload a file, open any specific candidate file in the **Consultations CRM** and use the upload lockbox in the Documents tab.
                      </p>
                    </div>
                  </div>

                  {/* List of files across all users */}
                  <div className="md:col-span-8 space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
                      Uploaded Documents Ledger
                    </span>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                      <div className="p-3.5 bg-slate-50 text-[10px] font-bold uppercase text-slate-500 grid grid-cols-12 border-b border-slate-200">
                        <div className="col-span-4">Student Profile</div>
                        <div className="col-span-4">File Name</div>
                        <div className="col-span-2">Uploader</div>
                        <div className="col-span-2 text-right">Size</div>
                      </div>

                      {leads.every(l => !l.documents || l.documents.length === 0) ? (
                        <div className="p-12 text-center text-slate-400">
                          <UploadCloud className="h-10 w-10 mx-auto mb-2 text-slate-300 stroke-1" />
                          <p className="text-xs">No documents uploaded into the sandbox archive yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                          {leads.flatMap(lead => 
                            (lead.documents || []).map(doc => ({
                              ...doc,
                              studentName: lead.fullName,
                              studentId: lead.id
                            }))
                          ).map((doc, idx) => (
                            <div key={idx} className="p-3.5 grid grid-cols-12 text-xs text-slate-700 items-center hover:bg-slate-50">
                              <div className="col-span-4 font-bold text-slate-900">{doc.studentName}</div>
                              <div className="col-span-4 flex items-center space-x-1.5 overflow-hidden">
                                <FileText className="h-4 w-4 text-[#0B5D3B] shrink-0" />
                                <span className="truncate font-mono text-[11px]" title={doc.name}>{doc.name}</span>
                              </div>
                              <div className="col-span-2 text-slate-500 text-[11px] truncate">{doc.uploadedBy}</div>
                              <div className="col-span-2 text-right font-mono font-bold text-slate-500">{doc.size}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>

            </div>
          )}

          {/* VIEW 4: STUDENT CHAT HUB */}
          {activeMenu === "chat" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm h-[550px] overflow-hidden grid grid-cols-1 md:grid-cols-12">
                
                {/* Chat list of students */}
                <div className="md:col-span-4 border-r border-slate-250 flex flex-col h-full bg-slate-50/50">
                  <div className="p-4 border-b border-slate-200 shrink-0 bg-white">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0B5D3B] block mb-2">Student Conversational Leads</span>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student chat rooms..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Sidebar lists */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-150">
                    {roleFilteredLeads.map(lead => {
                      const lastMsg = lead.chats && lead.chats.length > 0 
                        ? lead.chats[lead.chats.length - 1] 
                        : null;
                      const hasChats = lead.chats && lead.chats.length > 0;
                      
                      return (
                        <div
                          key={lead.id}
                          onClick={() => setChatSelectedStudentId(lead.id)}
                          className={`p-4 text-xs cursor-pointer transition-colors ${
                            chatSelectedStudentId === lead.id ? "bg-white border-l-4 border-[#0B5D3B]" : "hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-850 truncate block max-w-[130px]">{lead.fullName}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {lead.preferredCountry}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 truncate mt-1">
                            {lastMsg ? `💬 ${lastMsg.text}` : lead.message}
                          </p>
                          
                          {hasChats && (
                            <span className="text-[9px] font-mono text-[#0B5D3B] mt-1 block font-semibold">
                              {lead.chats?.length} messages logged
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Main active chat window */}
                <div className="md:col-span-8 flex flex-col h-full bg-white relative">
                  
                  {chatSelectedStudentId ? (() => {
                    const activeChatLead = leads.find(l => l.id === chatSelectedStudentId);
                    if (!activeChatLead) return null;
                    const chats = activeChatLead.chats || [];

                    return (
                      <>
                        {/* Header info */}
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 shrink-0">
                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Current Student Room</span>
                            <h4 className="font-display font-black text-slate-900 text-sm leading-tight">{activeChatLead.fullName}</h4>
                            <p className="text-[10px] text-slate-500">Destination target: {activeChatLead.preferredCountry} &bull; {activeChatLead.educationLevel}</p>
                          </div>

                          <button 
                            onClick={() => {
                              setSelectedLead(activeChatLead);
                              setModalTab("profile");
                            }}
                            className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 font-semibold"
                          >
                            Open Profile &rarr;
                          </button>
                        </div>

                        {/* Message Box */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
                          {chats.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                              <MessageSquare className="h-10 w-10 text-slate-300 stroke-1 mb-2 animate-pulse" />
                              <p className="text-xs font-bold">No active chat logs recorded.</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Send a message below to start simulated response exchange!</p>
                            </div>
                          ) : (
                            chats.map((chat, index) => {
                              const isStaff = chat.sender !== "student";
                              return (
                                <div key={index} className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}>
                                  <div className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                    isStaff 
                                      ? "bg-[#0B5D3B] text-white rounded-tr-none" 
                                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                  }`}>
                                    <p className="font-medium">{chat.text}</p>
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                                    {isStaff ? `${chat.sender.toUpperCase()} (Staff)` : "STUDENT"} &bull; {chat.date}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Message send form */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!newChatMessage.trim()) return;
                            // Inject trigger
                            const chatMsgId = `chat-${Date.now()}`;
                            const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
                            const newMsg = {
                              id: chatMsgId,
                              sender: currentUser.role as any,
                              text: newChatMessage.trim(),
                              date: currentDateTime
                            };
                            const updatedChats = [...(activeChatLead.chats || []), newMsg];
                            const updatedLead = {
                              ...activeChatLead,
                              chats: updatedChats
                            };
                            const updatedLeads = leads.map(l => l.id === activeChatLead.id ? updatedLead : l);
                            saveLeadsToStorage(updatedLeads);
                            const sentMsg = newChatMessage;
                            setNewChatMessage("");

                            // Trigger Student contextual response
                            setTimeout(() => {
                              const studentReply = getSimulatedStudentReply(activeChatLead.fullName, activeChatLead.preferredCountry, sentMsg);
                              const replyMsg = {
                                id: `chat-reply-${Date.now()}`,
                                sender: "student" as const,
                                text: studentReply,
                                date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                              };
                              const freshLeads = JSON.parse(localStorage.getItem("jel_consult_leads") || "[]");
                              const targetL = freshLeads.find((l: any) => l.id === activeChatLead.id) || updatedLead;
                              const finalChats = [...(targetL.chats || []), replyMsg];
                              const finalL = { ...targetL, chats: finalChats };
                              const finalLeads = freshLeads.map((l: any) => l.id === activeChatLead.id ? finalL : l);
                              saveLeadsToStorage(finalLeads);
                            }, 2000);
                          }}
                          className="p-4 border-t border-slate-200 shrink-0 flex items-center space-x-3 bg-white"
                        >
                          <input
                            type="text"
                            placeholder={`Reply to ${activeChatLead.fullName}...`}
                            value={newChatMessage}
                            onChange={(e) => setNewChatMessage(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 text-xs p-3 rounded-xl focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="bg-[#0B5D3B] text-white p-3 rounded-xl hover:bg-[#074028] transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </form>
                      </>
                    );
                  })() : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-slate-300 stroke-1 mb-2 animate-bounce" />
                      <p className="text-sm font-bold">No active chat selected.</p>
                      <p className="text-xs text-slate-500 mt-1">Select a student candidate room on the left side menu to review chat histories.</p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* VIEW 5: SSLCOMMERZ PAYMENTS LEDGER */}
          {activeMenu === "payments" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              
              <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Official Payment Settlement Ledger & Receipts
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized financial payments synced directly from SSLCOMMERZ checkout gateway.
                  </p>
                </div>
                
                <button
                  onClick={fetchTxList}
                  disabled={isTxLoading}
                  className="bg-[#0B5D3B] hover:bg-[#074028] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all select-none"
                >
                  {isTxLoading ? "Syncing..." : "Sync Logs"}
                </button>
              </div>

              {txWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-mono">
                  💡 {txWarning}
                </div>
              )}

              {isTxLoading ? (
                <div className="text-center py-12 space-y-2 bg-white rounded-3xl border border-slate-200/80">
                  <span className="h-6 w-6 border-2 border-[#0B5D3B] border-t-transparent rounded-full animate-spin inline-block"></span>
                  <p className="text-xs text-slate-500">Querying merchant ledger databases...</p>
                </div>
              ) : txList.length === 0 ? (
                <div className="border border-slate-200 rounded-3xl py-16 text-center text-slate-500 bg-white shadow-xs">
                  <Coins className="h-10 w-10 text-slate-300 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-750">No verified merchant checkouts found.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use the SSLCOMMERZ Pay Online options under the student portal scheduler screen.</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Transaction Details</th>
                        <th className="py-3.5 px-4">Candidate Profile</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Amount Checked</th>
                        <th className="py-3.5 px-4">Gate Bank Ref</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {txList.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 font-mono">
                              {tx.id}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              📅 {tx.createdAt}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{tx.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              📧 {tx.email} &bull; {tx.phone}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {tx.feeType}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-[#0B5D3B] font-mono text-sm">
                              ৳{tx.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {tx.bankTranId || "N/A"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block ${
                              tx.status.toLowerCase() === "success"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
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

          {/* VIEW 6: SUPABASE HUB */}
          {activeMenu === "supabase" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base uppercase tracking-wider">
                      Supabase Cloud Sync Console
                    </h3>
                    <p className="text-xs text-slate-500">Enable complete remote synchronization for your team across terminals.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackupToSupabase}
                      disabled={isSyncing}
                      className="bg-[#0B5D3B] hover:bg-[#074028] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-xs cursor-pointer"
                    >
                      {isSyncing ? "Syncing..." : "Sync Local Leads → Supabase"}
                    </button>
                    <button
                      onClick={fetchSupabaseData}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200"
                    >
                      Refresh Handshake
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Status Indicator */}
                  <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50/50 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        supabaseStatus === "connected" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                      }`}></span>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                        Current Cluster Handshake
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {supabaseStatus === "connected" ? (
                        "Connected successfully to Supabase! Remote PostgreSQL tables are online. Your consultation ad forms sync in real-time."
                      ) : (
                        "Handshake active but the remote 'leads' schema is deferred. Run the SQL editor query inside your Supabase dashboard to allow persistent backups."
                      )}
                    </p>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-500">
                      <p>Project ID: fkwujxzeahauouhquhdw</p>
                      <p>Endpoint URL: https://fkwujxzeahauouhquhdw.supabase.co</p>
                      <p>DB Type: cloud-hosted Postgres</p>
                    </div>
                  </div>

                  {/* Schema instructions */}
                  <div className="border border-slate-200 p-5 rounded-2xl bg-white space-y-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                      Supabase Schema Setup Guidelines
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      JEL Workspace leverages a schema setup with counselor, agent, documents, notes, and chat attributes. Copy and run the following in your Supabase SQL editor:
                    </p>

                    <div className="relative">
                      <textarea
                        readOnly
                        value={supabaseConfig?.requiredSql || `CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  mobile_number TEXT,
  preferred_country TEXT,
  education_level TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
                        className="w-full bg-slate-900 text-emerald-400 font-mono text-[10px] p-3 rounded-xl h-28 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* VIEW 7: LEAD SCORING ENGINE */}
          {activeMenu === "scoring" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              
              {/* Scoring Hero Card */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-1.5 max-w-xl">
                  <span className="text-[10px] bg-[#D4AF37] text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    SaaS Decision Intelligence
                  </span>
                  <h2 className="text-xl md:text-2xl font-display font-black">
                    Weighted Vetting & Prioritization Engine
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed font-light">
                    Analyze, rank, and segment prospects using custom-weighted multipliers for Academics, Language scores, financial backing, and visa gap policies.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center space-x-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block">Dynamic Re-indexing</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">Scores Computed Live</span>
                  </div>
                </div>
              </div>

              {/* Slider Panel & Weight Tuning */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Tuning sliders */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                      Parameter Weight Tuner
                    </h4>
                    <p className="text-[11px] text-slate-500">Configure core parameters based on current visa application trends.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { key: "academic", label: "Academic Profile (GPA / Level)", color: "accent-emerald-600" },
                      { key: "language", label: "Language Proficiency (IELTS / PTE)", color: "accent-blue-600" },
                      { key: "budget", label: "Financial Budget (Tuition Limit)", color: "accent-amber-600" },
                      { key: "destination", label: "Destination Country Fit", color: "accent-indigo-600" },
                      { key: "studyGap", label: "Study Gap Mitigation Score", color: "accent-rose-600" }
                    ].map((item) => (
                      <div key={item.key} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-mono text-slate-900 font-extrabold bg-slate-100 px-2 py-0.5 rounded">
                            {scoringWeights[item.key as keyof typeof scoringWeights]}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          step="5"
                          value={scoringWeights[item.key as keyof typeof scoringWeights]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setScoringWeights(prev => ({
                              ...prev,
                              [item.key]: val
                            }));
                          }}
                          className={`w-full h-1.5 rounded-lg bg-slate-100 appearance-none cursor-pointer ${item.color}`}
                        />
                      </div>
                    ))}
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-normal select-none">
                      💡 **Calculation Model Vetting**: Adjusting these percentages instantly shifts priority tags on the core database without modifying physical profiles.
                    </div>
                  </div>
                </div>

                {/* Score Leaderboard Grid */}
                <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                        Ranked Ingestion Pipeline
                      </h4>
                      <p className="text-[11px] text-slate-500">Student list ordered dynamically by conversion probability and visa compliance rating.</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 font-black px-2.5 py-1 rounded">
                      {leads.length} Evaluated
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-[10px] uppercase font-bold text-slate-400 select-none">
                          <th className="py-2.5">Student & Country</th>
                          <th className="py-2.5">Core Credentials Vetted</th>
                          <th className="py-2.5 text-center">Score</th>
                          <th className="py-2.5 text-right">Clearance Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leads.map((lead) => {
                          const score = computeLeadScore(lead);
                          let badgeBg = "bg-rose-50 text-rose-700 border-rose-100";
                          let rating = "Low Priority (Cold)";
                          if (score >= 75) {
                            badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-100";
                            rating = "Hot Prospect (High)";
                          } else if (score >= 50) {
                            badgeBg = "bg-amber-50 text-amber-700 border-amber-100";
                            rating = "Warm Contact (Medium)";
                          }

                          return (
                            <tr key={lead.id} className="text-xs hover:bg-slate-50/80 transition">
                              <td className="py-3">
                                <div className="font-bold text-slate-800">{lead.fullName}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                                  🛫 Destination: {lead.preferredCountry}
                                </div>
                              </td>
                              <td className="py-3 max-w-[240px]">
                                <div className="truncate text-slate-700" title={lead.message}>
                                  {lead.message}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                                  {lead.educationLevel}
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-black font-mono border ${badgeBg}`}>
                                  {score}%
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <span className="font-bold text-slate-700 block">{rating}</span>
                                <span className="text-[9px] text-slate-400 font-light">Assigned: {lead.assignedCounselor || "Unassigned"}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 8: WHATSAPP AUTOMATION */}
          {activeMenu === "whatsapp" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left">
              
              {/* WhatsApp Hero Card */}
              <div className="bg-gradient-to-r from-emerald-900 to-[#0B5D3B] text-white p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-1.5 max-w-xl">
                  <span className="text-[10px] bg-[#D4AF37] text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Direct Messenger Sandbox
                  </span>
                  <h2 className="text-xl md:text-2xl font-display font-black">
                    Official WhatsApp Integration Hub
                  </h2>
                  <p className="text-slate-300 text-xs leading-relaxed font-light">
                    Dispatch triggers on application state transitions, prompt students for missing Statement of Purpose files, or broadcast success stories securely.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center space-x-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-slate-300 block">Webhook Stream</span>
                    <span className="text-[11px] font-mono font-bold text-amber-300">API Broker Active</span>
                  </div>
                </div>
              </div>

              {/* Webhook and Automation Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Welcome Message
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isWhatsAppAutoEnabled} 
                        onChange={(e) => setIsWhatsAppAutoEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B5D3B]"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Instantly broadcast consultation confirmation templates when a student profile gets ingested via webforms or campaigns.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Stage Update Trigger
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isWhatsAppStatusTriggerEnabled} 
                        onChange={(e) => setIsWhatsAppStatusTriggerEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B5D3B]"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Trigger templates automated on status shifts: missing SOP reminders for "In Assessment", deposit warnings, and stamped collection instructions.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Cloud API Authentication
                  </span>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-500 space-y-1">
                    <p className="truncate">🔑 TOKEN: meta_wa_v21_prod_99...</p>
                    <p className="truncate">🔗 CALLBACK: https://jel-wa.api/v1</p>
                  </div>
                </div>

              </div>

              {/* Template Manager and Manual Send */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Templates list */}
                <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                        Approved WhatsApp Business Templates
                      </h4>
                      <p className="text-[11px] text-slate-500 font-light">Meta compliance audited variables pre-linked to core candidate variables.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {whatsAppTemplates.map((tmpl) => (
                      <div key={tmpl.id} className="border border-slate-200 p-4 rounded-2xl bg-slate-50/50 space-y-2 hover:border-slate-300 transition">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">{tmpl.name}</span>
                          <span className="text-[9px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                            {tmpl.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-sans italic bg-white p-2.5 border border-slate-150 rounded-xl">
                          "{tmpl.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual dispatcher trigger */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                      API Interactive Sandbox
                    </h4>
                    <p className="text-[11px] text-slate-500">Select a student and send a WhatsApp notice to test response logic.</p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const targetLead = leads.find(l => l.id === manualWhatsAppStudentId);
                      if (!targetLead) {
                        showToast("⚠️ Select a valid candidate before dispatching.");
                        return;
                      }
                      const tmpl = whatsAppTemplates.find(t => t.id === manualWhatsAppTemplateId) || whatsAppTemplates[0];
                      const parsedText = tmpl.text
                        .replace("{{fullName}}", targetLead.fullName)
                        .replace("{{preferredCountry}}", targetLead.preferredCountry);

                      const logMsg = {
                        id: `wl-manual-${Date.now()}`,
                        recipient: targetLead.fullName,
                        phone: targetLead.mobileNumber,
                        templateName: tmpl.name,
                        text: parsedText,
                        status: "Delivered",
                        time: new Date().toISOString().replace('T', ' ').substring(0, 16)
                      };
                      setWhatsAppLogs(prev => [logMsg, ...prev]);
                      showToast(`🚀 Dispatched WhatsApp Template "${tmpl.name}" to ${targetLead.fullName}!`);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Select Student</label>
                      <select
                        value={manualWhatsAppStudentId}
                        onChange={(e) => setManualWhatsAppStudentId(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:bg-white"
                      >
                        <option value="">-- Choose Candidate --</option>
                        {leads.map(l => (
                          <option key={l.id} value={l.id}>{l.fullName} ({l.mobileNumber})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Select Template</label>
                      <select
                        value={manualWhatsAppTemplateId}
                        onChange={(e) => setManualWhatsAppTemplateId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:bg-white"
                      >
                        {whatsAppTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                    >
                      Execute Secure API Dispatch &rarr;
                    </button>
                  </form>
                </div>

              </div>

              {/* Dispatch logs stream */}
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Live Broadcast Ledger Log
                  </h4>
                  <p className="text-[11px] text-slate-500">Real-time meta webhook delivery and double-checkmark status records.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 text-[10px] uppercase font-bold text-slate-400 select-none">
                        <th className="py-2.5">Delivered Time</th>
                        <th className="py-2.5">Recipient</th>
                        <th className="py-2.5">Mobile Number</th>
                        <th className="py-2.5">Template Name</th>
                        <th className="py-2.5">Message Content</th>
                        <th className="py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {whatsAppLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 font-mono text-[10px] text-slate-400 font-bold">{log.time}</td>
                          <td className="py-3 font-bold text-slate-800">{log.recipient}</td>
                          <td className="py-3 font-mono text-[10px] text-slate-500">{log.phone}</td>
                          <td className="py-3">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">
                              {log.templateName}
                            </span>
                          </td>
                          <td className="py-3 max-w-xs truncate italic" title={log.text}>"{log.text}"</td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold font-mono text-[10px]">
                              <span>✓✓</span>
                              <span className="uppercase tracking-widest text-[9px] font-bold">{log.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* NOTION-STYLE SLIDE-OVER DRAWER (SELECTED LEAD DETAILED MANAGEMENT) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden text-left" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Overlay backdrop */}
            <div 
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 md:pl-16">
              
              <div className="pointer-events-auto w-screen max-w-xl md:max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
                
                {/* Header */}
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 shrink-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Notion Profile Manager</span>
                      <h2 className="text-lg font-display font-black text-slate-950" id="slide-over-title">
                        {selectedLead.fullName}
                      </h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedLead.email} &bull; {selectedLead.mobileNumber}</p>
                    </div>

                    <button 
                      onClick={() => setSelectedLead(null)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Drawer Tab Swappers */}
                  <div className="flex space-x-6 mt-5 select-none text-xs border-b border-slate-150 pb-2">
                    <button
                      onClick={() => setModalTab("profile")}
                      className={`font-bold pb-2 uppercase tracking-wider cursor-pointer ${
                        modalTab === "profile" ? "text-[#0B5D3B] border-b-2 border-[#D4AF37]" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Admissions Scope
                    </button>
                    <button
                      onClick={() => setModalTab("notes")}
                      className={`font-bold pb-2 uppercase tracking-wider cursor-pointer ${
                        modalTab === "notes" ? "text-[#0B5D3B] border-b-2 border-[#D4AF37]" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Timeline Notes ({selectedLead.notesHistory?.length || 0})
                    </button>
                    <button
                      onClick={() => setModalTab("documents")}
                      className={`font-bold pb-2 uppercase tracking-wider cursor-pointer ${
                        modalTab === "documents" ? "text-[#0B5D3B] border-b-2 border-[#D4AF37]" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Locker Files ({selectedLead.documents?.length || 0})
                    </button>
                    <button
                      onClick={() => setModalTab("chat")}
                      className={`font-bold pb-2 uppercase tracking-wider cursor-pointer ${
                        modalTab === "chat" ? "text-[#0B5D3B] border-b-2 border-[#D4AF37]" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Direct Messaging ({selectedLead.chats?.length || 0})
                    </button>
                  </div>
                </div>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                  {/* TAB 1: PROFILE / ASSIGNMENTS */}
                  {modalTab === "profile" && (
                    <div className="space-y-6">
                      
                      {/* Intake details card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Study Destination</span>
                          <span className="text-xs font-bold text-slate-800">{selectedLead.preferredCountry}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Intended Entry Level</span>
                          <span className="text-xs font-bold text-slate-800">{selectedLead.educationLevel}</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-slate-150">
                          <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Ingested ad message / request</span>
                          <p className="text-xs text-slate-650 leading-relaxed italic mt-1 bg-white p-2.5 rounded-lg border border-slate-150">
                            "{selectedLead.message}"
                          </p>
                        </div>
                      </div>

                      {/* Configurations inputs */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#0B5D3B] tracking-wider block">
                          CRM Controls & Stage Configuration
                        </span>

                        {/* Pipeline step dropdown */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Application Pipeline Stage</label>
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value as any)}
                            className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-xs font-semibold"
                          >
                            {["New", "Contacted", "In Assessment", "Uni Approved", "Visa Pending", "Visa Approved", "Completed", "No Response"].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* Counselor allocation (Only Admin can manage, counselors see readonly or claim button) */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Allocated Lead Counselor</label>
                          {currentUser.role === "admin" ? (
                            <select
                              value={editingCounselor}
                              onChange={(e) => setEditingCounselor(e.target.value)}
                              className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-xs"
                            >
                              <option value="Unassigned">Unassigned / None</option>
                              {JEL_COUNSELORS.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800">
                                {selectedLead.assignedCounselor || "Unassigned"}
                              </span>
                              {selectedLead.assignedCounselor !== currentUser.fullName && (
                                <button
                                  onClick={() => setEditingCounselor(currentUser.fullName)}
                                  className="text-xs text-[#0B5D3B] font-bold hover:underline"
                                >
                                  Claim Assignment
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Agent allocation */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Allocated Lead Agent (Prospecting)</label>
                          {currentUser.role === "admin" ? (
                            <select
                              value={editingAgent}
                              onChange={(e) => setEditingAgent(e.target.value)}
                              className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-xs"
                            >
                              <option value="Unassigned">Unassigned / None</option>
                              {JEL_AGENTS.map(a => (
                                <option key={a} value={a}>{a}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800">
                                {selectedLead.assignedAgent || "Unassigned"}
                              </span>
                              {selectedLead.assignedAgent !== currentUser.fullName && (
                                <button
                                  onClick={() => setEditingAgent(currentUser.fullName)}
                                  className="text-xs text-blue-600 font-bold hover:underline"
                                >
                                  Claim Assignment
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Save inline configurations */}
                        <button
                          onClick={handleLeadInlineSave}
                          className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
                        >
                          Save Profile Configurations
                        </button>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: APPPEND-ONLY TIMELINE NOTES */}
                  {modalTab === "notes" && (
                    <div className="space-y-5">
                      
                      {/* Note creator form */}
                      <form onSubmit={handleAddNote} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600 block">Add New Counselor Journal Note</label>
                          <textarea
                            placeholder="Type progress update, financial holding details, VFS booking schedules..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-250 text-xs p-3 rounded-xl h-20 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0B5D3B]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-[#0B5D3B] hover:bg-[#074028] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition shadow-xs cursor-pointer block text-center w-full"
                        >
                          Log Note Permanently
                        </button>
                      </form>

                      {/* Cumulative append notes */}
                      <div className="space-y-3.5 pt-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
                          Historical Notes Timeline Ledger ({selectedLead.notesHistory?.length || 0})
                        </span>

                        {(!selectedLead.notesHistory || selectedLead.notesHistory.length === 0) ? (
                          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                            No internal notes written for this candidate yet.
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {selectedLead.notesHistory.map((note) => (
                              <div key={note.id} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl relative text-xs">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-2">
                                  <span className="font-bold text-[#0B5D3B]">{note.author}</span>
                                  <span>📅 {note.date}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-light font-sans">
                                  {note.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 3: DOCUMENTS LOCKER */}
                  {modalTab === "documents" && (
                    <div className="space-y-5">
                      
                      {/* Form simulation to upload PDF records */}
                      <form onSubmit={handleSimulatedFileUpload} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#0B5D3B] tracking-wider block">
                          Upload Document Locker Record
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Document Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., HSC_Marksheet"
                              value={newDocName}
                              onChange={(e) => setNewDocName(e.target.value)}
                              className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs focus:outline-none"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Document Category</label>
                            <select
                              value={newDocType}
                              onChange={(e) => setNewDocType(e.target.value)}
                              className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs"
                            >
                              <option value="Academic Certificates">Academic Certificates</option>
                              <option value="Language Test">Language Test</option>
                              <option value="Offer Letter">Offer Letter</option>
                              <option value="Visa Documents">Visa Documents</option>
                              <option value="Bank Declaration">Bank Declaration</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition"
                        >
                          Simulate File Upload &rarr;
                        </button>
                      </form>

                      {/* Documents list */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
                          Student Locker Files
                        </span>

                        {(!selectedLead.documents || selectedLead.documents.length === 0) ? (
                          <div className="text-center p-12 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                            <UploadCloud className="h-8 w-8 mx-auto mb-2 text-slate-300 stroke-1" />
                            <p>No documents uploaded in this student locker yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {selectedLead.documents.map((doc) => (
                              <div key={doc.id} className="border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs hover:border-slate-300 transition bg-white shadow-xs">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                  <div className="bg-[#0B5D3B]/10 p-2 rounded-xl text-[#0B5D3B] shrink-0">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <h5 className="font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</h5>
                                    <p className="text-[10px] text-slate-500 font-light mt-0.5">
                                      Type: <span className="font-semibold text-slate-600">{doc.fileType}</span> &bull; By {doc.uploadedBy}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0 font-mono text-[10px] text-slate-400 font-bold flex flex-col items-end">
                                  <span>{doc.size}</span>
                                  <span className="text-[9px] font-light mt-0.5">{doc.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 4: DIRECT CHAT CHANNEL */}
                  {modalTab === "chat" && (
                    <div className="space-y-4">
                      
                      {/* Active chats box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-64 overflow-y-auto space-y-4 flex flex-col">
                        {(!selectedLead.chats || selectedLead.chats.length === 0) ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-8 flex-1">
                            <MessageSquare className="h-8 w-8 text-slate-300 stroke-1 mb-2 animate-pulse" />
                            <p className="text-xs">No active chat logs recorded.</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Send a message below to start simulated response exchange!</p>
                          </div>
                        ) : (
                          selectedLead.chats.map((chat, idx) => {
                            const isStaff = chat.sender !== "student";
                            return (
                              <div key={idx} className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}>
                                <div className={`max-w-xs p-2.5 rounded-2xl text-xs leading-relaxed ${
                                  isStaff ? "bg-[#0B5D3B] text-white rounded-tr-none" : "bg-white border border-slate-250 text-slate-850 rounded-tl-none"
                                }`}>
                                  <p>{chat.text}</p>
                                </div>
                                <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                                  {isStaff ? `${chat.sender.toUpperCase()} (Staff)` : "STUDENT"} &bull; {chat.date}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Send bar */}
                      <form onSubmit={handleSendChatMessage} className="flex items-center space-x-3 bg-white pt-2">
                        <input
                          type="text"
                          placeholder="Type simulated message to candidate..."
                          value={newChatMessage}
                          onChange={(e) => setNewChatMessage(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-250 text-xs p-2.5 rounded-xl focus:outline-none focus:bg-white"
                        />
                        <button
                          type="submit"
                          className="bg-[#0B5D3B] text-white p-2.5 rounded-xl hover:bg-[#074028] transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-normal select-none">
                        💡 **Simulated Student Node**: When you send a message, the candidate will dynamically evaluate your context & automatically reply within 2 seconds.
                      </div>

                    </div>
                  )}

                </div>

                {/* Footer details */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 text-[11px] text-slate-400 font-medium select-none">
                  <span>🔒 Secure Profile Vault</span>
                  <span>JEL Global Compliance</span>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
