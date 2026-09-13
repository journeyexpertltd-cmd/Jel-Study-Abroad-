import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Send,
  Bell,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building,
  Award,
  Calendar,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  Filter
} from "lucide-react";
import { ApplicationStage, StudentApplicationStatus } from "../types";
import { SecureDocumentVault } from "./SecureDocumentVault";

export function StudentApplicationTracker() {
  const [appData, setAppData] = useState<StudentApplicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "tasks" | "vault" | "counselor" | "adminSimulator">("timeline");

  // Admin Simulator state for testing POST /api/admin/update-status
  const [adminStage, setAdminStage] = useState<ApplicationStage>("OFFER_ISSUED");
  const [adminNote, setAdminNote] = useState<string>("");
  const [adminTaskTitle, setAdminTaskTitle] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [updateFeedback, setUpdateFeedback] = useState<any | null>(null);

  const STAGES_LIST: { key: ApplicationStage; label: string; estDays: number }[] = [
    { key: "DRAFT", label: "Application Drafted", estDays: 2 },
    { key: "DOCS_VERIFIED", label: "Documents Certified", estDays: 3 },
    { key: "APPLICATION_SUBMITTED", label: "Submitted to University", estDays: 14 },
    { key: "OFFER_ISSUED", label: "Offer Letter Received", estDays: 5 },
    { key: "INSURANCE_PAID", label: "Insurance & Pre-CAS Paid", estDays: 4 },
    { key: "VISA_LODGED", label: "Visa Lodged with Embassy", estDays: 21 },
    { key: "APPROVED", label: "Visa Granted & Pre-Departure", estDays: 0 },
  ];

  const fetchApplicationStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/application-status");
      if (!res.ok) throw new Error("Failed to fetch application data");
      const json = await res.json();
      if (json.success && json.data) {
        setAppData(json.data);
        setAdminStage(json.data.currentStage);
      } else {
        throw new Error(json.error || "Application record not returned");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not load application status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const handleAdminUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appData) return;

    setIsUpdatingStatus(true);
    setUpdateFeedback(null);

    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: appData.id,
          studentEmail: appData.studentEmail,
          newStage: adminStage,
          note: adminNote,
          pendingTaskTitle: adminTaskTitle
        })
      });

      const data = await res.json();
      if (data.success) {
        setUpdateFeedback(data);
        setAppData(data.updatedApplication);
        setAdminNote("");
        setAdminTaskTitle("");
      } else {
        throw new Error(data.error || "Update status failed");
      }
    } catch (err: any) {
      alert("Status update error: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading && !appData) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm max-w-4xl mx-auto">
        <RefreshCw className="w-8 h-8 text-[#05452d] animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Connecting to JEL Application Tracking State Engine...</p>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-4xl mx-auto text-rose-800">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h4 className="font-bold text-sm">Failed to Load Application</h4>
        <p className="text-xs mt-1 text-rose-600">{error}</p>
        <button
          onClick={fetchApplicationStatus}
          className="mt-4 bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const currentStageIndex = STAGES_LIST.findIndex(s => s.key === appData.currentStage);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-sans" id="application-tracker-dashboard">
      {/* Tracker Banner */}
      <div className="bg-[#05452d] text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {appData.id}
              </span>
              <span className="text-xs text-emerald-200">
                • Last Synchronized: {new Date(appData.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Student Application Lifecycle Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              Candidate: <strong className="text-white">{appData.studentName}</strong> • {appData.targetUniversity} ({appData.targetCountry})
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Overall Progression</span>
            <span className="text-2xl font-black text-amber-400 font-display">
              {appData.stageProgressPercent}%
            </span>
          </div>
        </div>

        {/* Dynamic Multi-Step Progress Ribbon */}
        <div className="mt-8 pt-5 border-t border-emerald-700/50">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {STAGES_LIST.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs transition-all ${
                      isPast
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 scale-110 font-extrabold shadow-lg"
                        : "bg-emerald-950/80 text-emerald-400/50 border border-emerald-800/40"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-semibold mt-1.5 hidden md:block leading-tight ${
                    isCurrent ? "text-amber-300 font-bold" : isPast ? "text-emerald-200" : "text-emerald-400/40"
                  }`}>
                    {stage.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-emerald-950/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-700 rounded-full"
              style={{ width: `${appData.stageProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-6">
        {[
          { id: "timeline", label: "Estimated Timelines & Milestones", icon: Clock },
          { id: "tasks", label: `Pending Tasks (${appData.pendingTasks.length})`, icon: FileText },
          { id: "vault", label: "Secure Document Vault & OCR", icon: ShieldCheck },
          { id: "counselor", label: "Assigned Counselor", icon: UserCheck },
          { id: "adminSimulator", label: "Counselor Stage Simulator (API Demo)", icon: RefreshCw }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-[#05452d] text-[#05452d] bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8">
        {/* ========================================================== */}
        {/* TAB: SECURE DOCUMENT VAULT */}
        {/* ========================================================== */}
        {activeTab === "vault" && (
          <div className="animate-in fade-in duration-300">
            <SecureDocumentVault />
          </div>
        )}
        {/* ========================================================== */}
        {/* TAB 1: TIMELINE MILESTONES */}
        {/* ========================================================== */}
        {activeTab === "timeline" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Application Processing Trajectory
                </h3>
                <p className="text-xs text-slate-500">
                  Standard Home Office / High Commission estimated turnaround intervals.
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
                Active Stage: {STAGES_LIST.find(s => s.key === appData.currentStage)?.label}
              </span>
            </div>

            {/* Counselor Note Box */}
            {appData.timelineNotes && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <Bell className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700">
                  <strong className="text-emerald-900 font-semibold block mb-0.5">Latest Counselor Directive:</strong>
                  {appData.timelineNotes}
                </div>
              </div>
            )}

            {/* Timeline Steps Listing */}
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
              {appData.estimatedTimeline.map((item, index) => {
                const isDone = item.status === "done";
                const isCurrent = item.status === "current";
                const meta = STAGES_LIST.find(s => s.key === item.stage);

                return (
                  <div key={item.stage} className="relative pl-6">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 bg-white transition-all ${
                        isDone
                          ? "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-100"
                          : isCurrent
                          ? "border-amber-500 bg-amber-400 ring-4 ring-amber-100 animate-pulse"
                          : "border-slate-300 bg-white"
                      }`}
                    />

                    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm hover:border-slate-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {meta?.label || item.stage}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isDone
                              ? "bg-emerald-100 text-emerald-800"
                              : isCurrent
                              ? "bg-amber-100 text-amber-900"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {isDone && item.completedDate ? `Completed: ${item.completedDate}` : `Target: ${item.targetDate}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: PENDING & COMPLETED TASKS */}
        {/* ========================================================== */}
        {activeTab === "tasks" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Action Items & Document Requirements
              </h3>
              <p className="text-xs text-slate-500">
                Tasks required to unlock the next stage of your study permit processing.
              </p>
            </div>

            {/* Pending Tasks */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Required Action Items ({appData.pendingTasks.length})
              </span>
              {appData.pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        {t.status}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{t.description}</p>
                    {t.dueDate && (
                      <span className="text-[10px] text-amber-700 font-semibold block">
                        Due Date: {t.dueDate}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => alert(`Task '${t.title}' is being coordinated with your assigned counselor.`)}
                    className="shrink-0 bg-[#05452d] hover:bg-[#03301f] text-white text-xs font-bold py-2 px-4 rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Submit Document
                  </button>
                </div>
              ))}
            </div>

            {/* Completed Tasks */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Completed Checkpoints ({appData.completedTasks.length})
              </span>
              {appData.completedTasks.map((ct) => (
                <div
                  key={ct.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-slate-800">{ct.title}</strong>
                      <p className="text-[11px] text-slate-500">{ct.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 px-2 py-1 rounded">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: ASSIGNED COUNSELOR */}
        {/* ========================================================== */}
        {activeTab === "counselor" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-[#05452d] text-amber-400 font-bold text-xl flex items-center justify-center shrink-0 shadow">
                JM
              </div>
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Primary GTE Case Registrar
                </span>
                <h4 className="text-lg font-bold text-slate-900">{appData.assignedCounselor.name}</h4>
                <p className="text-xs text-slate-600">
                  Head Office: 189/A (2nd Floor), Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka-1215
                </p>

                <div className="flex flex-wrap gap-3 pt-3">
                  <a
                    href={`https://wa.me/8801926400400?text=Hello%20${encodeURIComponent(appData.assignedCounselor.name)},%20I%20have%20an%20inquiry%20regarding%20my%20file%20${appData.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Counselor</span>
                  </a>
                  <a
                    href="mailto:journeyexpertbd@gmail.com"
                    className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email Direct</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: COUNSELOR STAGE SIMULATOR (Demonstrating Backend API) */}
        {/* ========================================================== */}
        {activeTab === "adminSimulator" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
              <strong className="block font-bold mb-0.5">Counselor / Admin Status Transition Simulator</strong>
              This tool tests the backend API: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">POST /api/admin/update-status</code>. Selecting a stage triggers the lifecycle state engine and dispatches mock WhatsApp/Email notifications to the student.
            </div>

            <form onSubmit={handleAdminUpdateStatus} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Transition Student Stage To:</label>
                  <select
                    value={adminStage}
                    onChange={(e) => setAdminStage(e.target.value as ApplicationStage)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#05452d]"
                  >
                    {STAGES_LIST.map(s => (
                      <option key={s.key} value={s.key}>{s.key} - {s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Optional New Task Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule VFS Biometrics Appointment"
                    value={adminTaskTitle}
                    onChange={(e) => setAdminTaskTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Counselor Status Note:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. CAS issued! Proceeding to submit Tier 4 Student Visa on UKVI portal."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="bg-[#05452d] hover:bg-[#03301f] disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-xl uppercase tracking-wider transition-all shadow cursor-pointer"
                >
                  {isUpdatingStatus ? "Updating via Backend..." : "Submit Status Transition (POST API)"}
                </button>
              </div>
            </form>

            {/* Notification alert response viewer */}
            {updateFeedback && (
              <div className="bg-slate-900 text-emerald-400 p-5 rounded-xl text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-white font-bold border-b border-slate-800 pb-2">
                  <span>BACKEND NOTIFICATION PAYLOAD DISPATCHED</span>
                  <span className="text-emerald-400 text-[10px]">HTTP 200 OK</span>
                </div>
                <p className="text-slate-300">{updateFeedback.message}</p>
                <div className="text-amber-300">{updateFeedback.notificationAlert?.summary}</div>
                <pre className="bg-slate-950 p-3 rounded text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(updateFeedback.notificationAlert?.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
