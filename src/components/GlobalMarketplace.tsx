import React, { useState } from "react";
import { 
  Globe, Search, Filter, Compass, Send, CheckCircle, Clock, 
  MessageSquare, User, Building, ExternalLink, ArrowRight, BookOpen, AlertCircle
} from "lucide-react";
import { useToast } from "../context/ToastContext";

interface Course {
  id: string;
  title: string;
  university: string;
  country: string;
  fee: string;
  ranking: number;
  intake: string;
}

interface ApplicationRecord {
  id: string;
  studentName: string;
  university: string;
  courseTitle: string;
  agentName: string;
  status: "Reviewing" | "Conditional Offer" | "Unconditional Offer" | "CAS Issued" | "Rejected";
  date: string;
}

interface ChatMessage {
  id: string;
  sender: "Student" | "Agent" | "JEL Registrar";
  text: string;
  time: string;
}

export function GlobalMarketplace() {
  const courses: Course[] = [
    { id: "c-1", title: "MSc in Data Science & Artificial Intelligence", university: "University of Leeds", country: "United Kingdom", fee: "£24,500/yr", ranking: 86, intake: "September 2026" },
    { id: "c-2", title: "MBA with Global Business Operations", university: "Coventry University", country: "United Kingdom", fee: "£17,000/yr", ranking: 550, intake: "September 2026, January 2027" },
    { id: "c-3", title: "BSc (Hons) in Cybersecurity & Networks", university: "York St John University", country: "United Kingdom", fee: "£13,500/yr", ranking: 1000, intake: "January 2027" },
    { id: "c-4", title: "Bachelor of Business Administration (BBA)", university: "University of Canada West", country: "Canada", fee: "$17,200 CAD/yr", ranking: 920, intake: "September 2026, April 2027" },
    { id: "c-5", title: "Master of Cyber Security (Professional)", university: "University of Sydney", country: "Australia", fee: "$46,000 AUD/yr", ranking: 18, intake: "February 2027" }
  ];

  const [applications, setApplications] = useState<ApplicationRecord[]>([
    { id: "app-1", studentName: "Sabbir Ahmed", university: "Coventry University", courseTitle: "MBA with Global Business Operations", agentName: "Moinul Islam", status: "Conditional Offer", date: "2026-06-24" },
    { id: "app-2", studentName: "Tahrima Kabir", university: "York St John University", courseTitle: "BSc in Cybersecurity", agentName: "Kabir Hossain", status: "Reviewing", date: "2026-06-26" }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "m-1", sender: "Student", text: "Hello! I have uploaded my IELTS certificate (Overall 6.5) and HSC transcript. Can you review?", time: "10:15 AM" },
    { id: "m-2", sender: "Agent", text: "Great job Sabbir! I am matching this with Coventry's MBA program right away. The 28-day holding looks perfect too.", time: "10:17 AM" },
    { id: "m-3", sender: "JEL Registrar", text: "Registrar desk here. Coventry team reviewed the GPA; we have queued the file for Conditional Offer generation.", time: "10:20 AM" }
  ]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");

  // Application Draft State
  const [draftName, setDraftName] = useState("");
  const [draftCourseId, setDraftCourseId] = useState("c-1");
  const [draftAgentName, setDraftAgentName] = useState("Tahmid Rahman");

  // Chat Input
  const [chatInput, setChatInput] = useState("");

  const toast = useToast();

  const handlePostApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;

    const matchedCourse = courses.find(c => c.id === draftCourseId);
    if (!matchedCourse) return;

    const newApp: ApplicationRecord = {
      id: "app-" + Date.now(),
      studentName: draftName,
      university: matchedCourse.university,
      courseTitle: matchedCourse.title,
      agentName: draftAgentName,
      status: "Reviewing",
      date: new Date().toISOString().split("T")[0]
    };

    setApplications(prev => [newApp, ...prev]);
    toast.success(
      "Application Dispatched",
      `Application for ${draftName} successfully dispatched to ${matchedCourse.university} admissions registrar!`
    );
    setDraftName("");
  };

  const handleUpdateStatus = (appId: string, nextStatus: ApplicationRecord["status"]) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return { ...app, status: nextStatus };
      }
      return app;
    }));
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: "m-" + Date.now(),
      sender: "Agent", // default simulation role
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput("");
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.university.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "All" || c.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300" id="global-marketplace-root">
      
      {/* 1. Hero Block */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0B5D3B] border border-slate-800 text-white p-6 sm:p-8 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#D4AF37] opacity-10 blur-3xl"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] bg-[#D4AF37] text-slate-950 font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
            Direct Student & Agent Marketplace
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
            Global Course Marketplace & Portal
          </h2>
          <p className="text-xs text-slate-350 font-light max-w-2xl leading-relaxed">
            The multi-sided workspace where Franchise agents match prospective candidates to partner courses, upload backing academic portfolios, and converse live with JEL Head Office registrars.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex items-center space-x-2 shrink-0 relative z-10 font-mono text-xs">
          <Compass className="h-4.5 w-4.5 text-[#D4AF37]" />
          <span className="text-white font-bold">5 Partner Nodes Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Course Explorer & Application Dispatcher */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Course Explorer */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
            
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Course Catalog Explorer
                </h3>
                <p className="text-[11px] text-slate-500 font-light">Explore active partner intakes and click to launch submissions.</p>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-600 focus:outline-none"
                >
                  <option value="All">All Countries</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subject or uni..."
                    className="bg-slate-50 border border-slate-200 p-1.5 pl-7 rounded text-xs outline-none focus:bg-white focus:border-[#D4AF37]"
                  />
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-2" />
                </div>
              </div>
            </div>

            {/* Courses grid list */}
            <div className="space-y-3">
              {filteredCourses.map(c => (
                <div key={c.id} className="border border-slate-150 p-4 rounded-xl hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left space-y-1 max-w-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] bg-slate-100 font-mono font-black text-slate-500 px-1.5 py-0.5 rounded">
                        Ranking #{c.ranking}
                      </span>
                      <span className="text-[9px] bg-[#0B5D3B]/10 font-bold text-[#0B5D3B] px-1.5 py-0.5 rounded uppercase">
                        {c.country}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-slate-800 text-sm leading-tight">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      🏛️ {c.university} • 📅 Intakes: <span className="font-bold text-slate-600">{c.intake}</span>
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-0 border-slate-100 pt-2 sm:pt-0">
                    <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded block">
                      {c.fee}
                    </span>
                    <button
                      onClick={() => {
                        setDraftCourseId(c.id);
                        const draftSec = document.getElementById("draft-section");
                        draftSec?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-[10px] text-[#0B5D3B] hover:text-[#D4AF37] font-black uppercase tracking-wider flex items-center space-x-1 mt-1 cursor-pointer"
                    >
                      <span>Draft Apply</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Section 2: Direct Submission Desk Form */}
          <div id="draft-section" className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <BookOpen className="h-4.5 w-4.5 text-[#0B5D3B]" />
              <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                Launch Official Candidate Application
              </h3>
            </div>

            <form onSubmit={handlePostApplication} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Student Candidate Name</label>
                <input
                  type="text"
                  required
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g. Rashed Alam"
                  className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Select Target Course</label>
                <select
                  value={draftCourseId}
                  onChange={(e) => setDraftCourseId(e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded p-2 text-xs text-slate-700 outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.university} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 space-y-1 flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-2.5 rounded text-xs font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Dispatch to JEL System
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Applications Status and Mock Admissions Desk */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                Admissions Board & Mock Registrar Queue
              </h3>
              <p className="text-[11px] text-slate-500 font-light">
                Monitor incoming franchise application packets and test updating their stages from the Registrar desk.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase font-mono">
                    <th className="py-2.5">Candidate & Agency</th>
                    <th className="py-2.5">Destination Choice</th>
                    <th className="py-2.5">Pipeline State</th>
                    <th className="py-2.5 text-right">Update (Mock Registrar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50 transition">
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{app.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Submitted by: {app.agentName}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-700">{app.university}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{app.courseTitle}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                          app.status === "CAS Issued"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                            : app.status === "Conditional Offer" || app.status === "Unconditional Offer"
                            ? "bg-blue-50 text-blue-800 border-blue-100"
                            : "bg-slate-50 text-slate-500"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[11px] outline-none"
                        >
                          <option value="Reviewing">Reviewing</option>
                          <option value="Conditional Offer">Conditional Offer</option>
                          <option value="Unconditional Offer">Unconditional Offer</option>
                          <option value="CAS Issued">CAS Issued</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Triple-Channel Collaborative Chat Stream */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs flex flex-col h-[580px] text-left relative overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[9px] bg-red-100 text-red-700 font-mono font-black px-2 py-0.5 rounded animate-pulse inline-block mb-1.5">
              Live Secure Channel
            </span>
            <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-[#0B5D3B]" />
              <span>Triple-Channel Chat Hub</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal">
              Direct collaborative stream connecting Student, Assigned Franchise Agent, and JEL Head Office Counselor.
            </p>
          </div>

          {/* Messages lists scroll body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
            {chatMessages.map(msg => {
              const isStudent = msg.sender === "Student";
              const isAgent = msg.sender === "Agent";
              const isReg = msg.sender === "JEL Registrar";

              let roleBg = "bg-slate-100 text-slate-700";
              if (isStudent) roleBg = "bg-blue-50 text-blue-700";
              if (isReg) roleBg = "bg-amber-50 text-amber-700 border border-amber-100";

              return (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${roleBg}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{msg.time}</span>
                  </div>

                  <p className="bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-100 leading-relaxed text-[11px]">
                    {msg.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Input Chat form */}
          <form onSubmit={handleSendChatMessage} className="border-t border-slate-100 pt-3 flex gap-2">
            <input
              type="text"
              required
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to JEL team..."
              className="flex-1 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none"
            />
            <button
              type="submit"
              className="bg-[#0B5D3B] hover:bg-[#074028] text-white p-2 rounded-lg transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
