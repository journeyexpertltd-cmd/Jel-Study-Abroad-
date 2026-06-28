import React, { useState, useEffect } from "react";
import { 
  Users, TrendingUp, Coins, Award, DollarSign, CheckCircle, 
  Clock, PlusCircle, UserCheck, MapPin, Activity, FileText, Globe, Search, RefreshCw
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  office: string;
  assignedCountry: string;
  totalLeads: number;
  conversions: number;
  totalCommissionEarned: number;
  pendingPayout: number;
}

interface CommissionPayout {
  id: string;
  studentName: string;
  agentName: string;
  university: string;
  amount: number;
  status: "Pending Vetting" | "Processing" | "Paid";
  date: string;
}

interface FranchiseLead {
  id: string;
  fullName: string;
  preferredCountry: string;
  gpa: string;
  englishScore: string;
  status: "Evaluation" | "Applied" | "Offer Letter" | "Visa Stamped" | "Enrolled";
  agentId: string;
  createdAt: string;
}

export function MultiAgentFranchise() {
  const [agents, setAgents] = useState<Agent[]>([
    { id: "ag-1", name: "Moinul Islam", office: "Chittagong Franchise Office", assignedCountry: "United Kingdom", totalLeads: 42, conversions: 18, totalCommissionEarned: 12400, pendingPayout: 1800 },
    { id: "ag-2", name: "Kabir Hossain", office: "Sylhet Franchise Hub", assignedCountry: "Canada", totalLeads: 38, conversions: 15, totalCommissionEarned: 10500, pendingPayout: 2500 },
    { id: "ag-3", name: "Tahmid Rahman", office: "Dhaka Uttara Branch", assignedCountry: "Australia", totalLeads: 51, conversions: 22, totalCommissionEarned: 15400, pendingPayout: 1200 },
    { id: "ag-4", name: "Faria Sultana", office: "Rajshahi Learning desk", assignedCountry: "Germany", totalLeads: 19, conversions: 6, totalCommissionEarned: 4200, pendingPayout: 600 }
  ]);

  const [leads, setLeads] = useState<FranchiseLead[]>([
    { id: "fl-1", fullName: "Zahid Hasan", preferredCountry: "United Kingdom", gpa: "4.80", englishScore: "IELTS 6.5", status: "Offer Letter", agentId: "ag-1", createdAt: "2026-06-25" },
    { id: "fl-2", fullName: "Nabila Yasmin", preferredCountry: "Canada", gpa: "5.00", englishScore: "PTE 68", status: "Visa Stamped", agentId: "ag-2", createdAt: "2026-06-22" },
    { id: "fl-3", fullName: "Sabbir Rahman", preferredCountry: "Australia", gpa: "3.75", englishScore: "IELTS 7.0", status: "Applied", agentId: "ag-3", createdAt: "2026-06-26" },
    { id: "fl-4", fullName: "Tasnim Ara", preferredCountry: "Germany", gpa: "4.50", englishScore: "IELTS 6.0", status: "Evaluation", agentId: "ag-4", createdAt: "2026-06-27" }
  ]);

  const [payouts, setPayouts] = useState<CommissionPayout[]>([
    { id: "po-1", studentName: "Rashedul Amin", agentName: "Moinul Islam", university: "Coventry University", amount: 1500, status: "Paid", date: "2026-06-15" },
    { id: "po-2", studentName: "Sumiya Akter", agentName: "Kabir Hossain", university: "York St John University", amount: 1200, status: "Processing", date: "2026-06-24" },
    { id: "po-3", studentName: "Anisur Rahman", agentName: "Tahmid Rahman", university: "University of Hertfordshire", amount: 1800, status: "Pending Vetting", date: "2026-06-28" }
  ]);

  // Agent select for simulation
  const [activeAgentId, setActiveAgentId] = useState<string>("ag-1");
  
  // Lead submission form
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadCountry, setNewLeadCountry] = useState("United Kingdom");
  const [newLeadGpa, setNewLeadGpa] = useState("4.80");
  const [newLeadTest, setNewLeadTest] = useState("IELTS 6.5");

  // Status updates & commission calculation
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;

    const newLead: FranchiseLead = {
      id: "fl-" + Date.now(),
      fullName: newLeadName,
      preferredCountry: newLeadCountry,
      gpa: newLeadGpa,
      englishScore: newLeadTest,
      status: "Evaluation",
      agentId: activeAgentId,
      createdAt: new Date().toISOString().split("T")[0]
    };

    setLeads(prev => [newLead, ...prev]);
    
    // Update Agent's total lead count
    setAgents(prev => prev.map(ag => {
      if (ag.id === activeAgentId) {
        return { ...ag, totalLeads: ag.totalLeads + 1 };
      }
      return ag;
    }));

    setNewLeadName("");
    alert(`Lead "${newLeadName}" successfully ingested! Assigned to agent country: ${newLeadCountry}`);
  };

  const handleUpdateStatus = (leadId: string, newStatus: FranchiseLead["status"]) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        // If conversion occurs (Visa Stamped/Enrolled), compute and update agent metrics
        const oldStatus = lead.status;
        if (newStatus === "Visa Stamped" && oldStatus !== "Visa Stamped") {
          const matchedAgent = agents.find(ag => ag.id === lead.agentId);
          if (matchedAgent) {
            // Trigger commission payouts additions
            const comAmount = lead.preferredCountry === "United Kingdom" ? 1200 : 1500;
            const newPayout: CommissionPayout = {
              id: "po-" + Date.now(),
              studentName: lead.fullName,
              agentName: matchedAgent.name,
              university: lead.preferredCountry === "United Kingdom" ? "Coventry University" : "University of Canada West",
              amount: comAmount,
              status: "Pending Vetting",
              date: new Date().toISOString().split("T")[0]
            };
            setPayouts(prevPayouts => [newPayout, ...prevPayouts]);

            // Update agent metrics
            setAgents(prevAgents => prevAgents.map(ag => {
              if (ag.id === lead.agentId) {
                return {
                  ...ag,
                  conversions: ag.conversions + 1,
                  totalCommissionEarned: ag.totalCommissionEarned + comAmount,
                  pendingPayout: ag.pendingPayout + comAmount
                };
              }
              return ag;
            }));
          }
        }
        return { ...lead, status: newStatus };
      }
      return lead;
    }));
  };

  const handleProcessPayout = (payoutId: string) => {
    setPayouts(prev => prev.map(p => {
      if (p.id === payoutId) {
        const nextStatus = p.status === "Pending Vetting" ? "Processing" : "Paid";
        if (nextStatus === "Paid" && p.status !== "Paid") {
          // Subtract from agent pending payout
          setAgents(prevAg => prevAg.map(ag => {
            if (ag.name === p.agentName) {
              return { ...ag, pendingPayout: Math.max(0, ag.pendingPayout - p.amount) };
            }
            return ag;
          }));
        }
        return { ...p, status: nextStatus as any };
      }
      return p;
    }));
  };

  const activeAgent = agents.find(ag => ag.id === activeAgentId) || agents[0];

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300" id="franchise-system-root">
      
      {/* 1. Header Hero Panel */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#D4AF37] opacity-10 blur-3xl"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] bg-[#D4AF37] text-slate-950 font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
            B2B Franchise Network Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
            Franchise Agent Commission & Pipeline Hub
          </h2>
          <p className="text-xs text-slate-400 font-light max-w-2xl leading-relaxed">
            Manage study abroad agency coordinates, log external student profiles, monitor commission splits, and track authorized SSL payout transactions from the Tejgaon Nabisco head office.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center space-x-3 shrink-0 relative z-10">
          <Globe className="h-5 w-5 text-[#D4AF37] animate-spin" />
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-mono tracking-widest block">Active Country Nodes</span>
            <span className="text-xs font-bold text-white">UK, CA, AU, DE Live</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-[#0B5D3B]/10 rounded-xl text-[#0B5D3B]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wider font-bold block">Total Agents Active</span>
            <span className="text-xl font-bold text-slate-900">{agents.length} Nodes</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-[#D4AF37]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wider font-bold block">Conversion Pipeline</span>
            <span className="text-xl font-bold text-slate-900">
              {leads.filter(l => ["Visa Stamped", "Offer Letter"].includes(l.status)).length} Approved
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wider font-bold block">Paid Commissions</span>
            <span className="text-xl font-bold text-slate-900">
              ${payouts.filter(p => p.status === "Paid").reduce((acc, p) => acc + p.amount, 0).toLocaleString()} USD
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-mono tracking-wider font-bold block">Pending Invoicing</span>
            <span className="text-xl font-bold text-slate-900">
              ${payouts.filter(p => p.status !== "Paid").reduce((acc, p) => acc + p.amount, 0).toLocaleString()} USD
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Col: Franchise Simulation & Lead Dispatch */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Agent Role Selection */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                Select Franchise Office
              </h3>
              <p className="text-[11px] text-slate-500">Operate as a specific regional agent node to test simulation values.</p>
            </div>

            <div className="space-y-2">
              {agents.map(ag => (
                <button
                  key={ag.id}
                  onClick={() => {
                    setActiveAgentId(ag.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center cursor-pointer ${
                    activeAgentId === ag.id 
                      ? "bg-slate-50 border-[#D4AF37] ring-1 ring-[#D4AF37]/50" 
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-800 block">{ag.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium font-sans block">{ag.office}</span>
                  </div>
                  <span className="text-[10px] bg-[#0B5D3B]/10 text-[#0B5D3B] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {ag.assignedCountry}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lead Creation Form */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <PlusCircle className="h-4 w-4 text-[#0B5D3B]" />
              <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                Register New Student
              </h3>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="e.g. Mehedi Hasan"
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block">Target Country (Assigned)</label>
                <select
                  value={newLeadCountry}
                  onChange={(e) => setNewLeadCountry(e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block">Academic GPA</label>
                  <input
                    type="text"
                    required
                    value={newLeadGpa}
                    onChange={(e) => setNewLeadGpa(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block">English Score</label>
                  <input
                    type="text"
                    required
                    value={newLeadTest}
                    onChange={(e) => setNewLeadTest(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Log Lead into {activeAgent.name}'s Queue
              </button>
            </form>
          </div>

        </div>

        {/* Right Dynamic Col: Pipeline Table and Leaderboard */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Pipeline Board */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Franchise Leads & Application Statuses
                </h3>
                <p className="text-[11px] text-slate-500">Live student pipeline matching global node networks.</p>
              </div>
              <span className="text-[10px] bg-slate-100 font-mono font-bold text-slate-500 px-2 py-1 rounded">
                {leads.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5">Candidate Details</th>
                    <th className="py-2.5 text-center">Assigned Country</th>
                    <th className="py-2.5">Academic Credentials</th>
                    <th className="py-2.5 text-center">Current Phase</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {leads.map(lead => {
                    const lAgent = agents.find(ag => ag.id === lead.agentId) || agents[0];
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition">
                        <td className="py-3">
                          <div className="font-bold text-slate-800">{lead.fullName}</div>
                          <div className="text-[9px] text-slate-400 font-mono">Agent: {lAgent.name}</div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
                            {lead.preferredCountry}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 font-mono text-[10px]">
                          <div>GPA: {lead.gpa}</div>
                          <div>{lead.englishScore}</div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            lead.status === "Visa Stamped" 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                              : lead.status === "Offer Letter"
                              ? "bg-blue-50 text-blue-800 border-blue-100"
                              : "bg-slate-50 text-slate-500"
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                          >
                            <option value="Evaluation">Evaluation</option>
                            <option value="Applied">Applied</option>
                            <option value="Offer Letter">Offer Letter</option>
                            <option value="Visa Stamped">Visa Stamped (Convert)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leaderboard and Payout status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Franchise Performance Rankings */}
            <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4 text-left">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Award className="h-4.5 w-4.5 text-[#D4AF37]" />
                <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Agent Rankings
                </h3>
              </div>

              <div className="space-y-3">
                {agents.sort((a,b) => b.conversions - a.conversions).map((ag, index) => (
                  <div key={ag.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-2.5">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] font-black ${
                        index === 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{ag.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ag.office}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800 font-mono block">{ag.conversions} Wins</span>
                      <span className="text-[10px] text-emerald-600 font-bold font-mono">${ag.totalCommissionEarned.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission Payout Tracking Ledger */}
            <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4 text-left">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Commission Payout Ledger
                </h3>
              </div>

              <div className="space-y-3">
                {payouts.map(p => (
                  <div key={p.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0 text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{p.studentName}</div>
                      <div className="text-[9px] text-slate-400">{p.agentName} • {p.university}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-mono text-xs font-black text-slate-800 block">${p.amount}</span>
                      <button
                        onClick={() => handleProcessPayout(p.id)}
                        disabled={p.status === "Paid"}
                        className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono ${
                          p.status === "Paid" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : p.status === "Processing"
                            ? "bg-blue-50 text-blue-700 border border-blue-100 cursor-pointer"
                            : "bg-amber-50 text-amber-700 border border-amber-100 cursor-pointer animate-pulse"
                        }`}
                      >
                        {p.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
