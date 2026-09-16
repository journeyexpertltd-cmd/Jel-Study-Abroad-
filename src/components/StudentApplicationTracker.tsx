import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import { SecureDocumentVault } from "./SecureDocumentVault";

type ApplicationRow = {
  id: string;
  current_stage: string | null;
  status: string | null;
  target_country: string | null;
  target_university: string | null;
  target_course: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type StudentRow = {
  id: string;
  student_id: string | null;
  full_name: string | null;
};

const PIPELINE = [
  "New Lead",
  "Counselling",
  "Profile Assessment",
  "Documents Pending",
  "Documents Ready",
  "University Shortlist",
  "Application Submitted",
  "Offer Received",
  "Offer Accepted",
  "Tuition Deposit",
  "CAS/COE/I-20 Pending",
  "CAS/COE/I-20 Issued",
  "Visa Preparation",
  "Visa Lodged",
  "Visa Approved",
  "Visa Refused",
  "Pre-Departure",
  "Completed",
  "Withdrawn",
];

export function StudentApplicationTracker() {
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"applications" | "documents">("applications");

  const load = async () => {
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setError("Your authenticated student session could not be verified.");
      setStudent(null);
      setApplications([]);
      setLoading(false);
      return;
    }

    const studentResult = await supabase
      .from("students")
      .select("id,student_id,full_name")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    if (studentResult.error) {
      const missing = studentResult.error.code === "42P01" || studentResult.error.code === "PGRST205";
      setError(missing
        ? "Student application database setup is pending. Your login is secure, but application tracking is not yet enabled."
        : "Your student profile could not be loaded.");
      setStudent(null);
      setApplications([]);
      setLoading(false);
      return;
    }

    if (!studentResult.data) {
      setStudent(null);
      setApplications([]);
      setLoading(false);
      return;
    }

    setStudent(studentResult.data as StudentRow);
    const appResult = await supabase
      .from("applications")
      .select("id,current_stage,status,target_country,target_university,target_course,updated_at,created_at")
      .eq("student_id", studentResult.data.id)
      .order("created_at", { ascending: false });

    if (appResult.error) {
      setError("Application records could not be loaded.");
      setApplications([]);
    } else {
      setApplications((appResult.data || []) as ApplicationRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const activeStage = applications[0]?.current_stage || applications[0]?.status || "New Lead";
  const stageIndex = useMemo(() => {
    const index = PIPELINE.findIndex((stage) => stage.toLowerCase() === activeStage.toLowerCase());
    return index >= 0 ? index : 0;
  }, [activeStage]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm max-w-5xl mx-auto">
        <RefreshCw className="w-7 h-7 text-[#0B5D3B] animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading your secure application workspace…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">Authenticated student workspace</div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">Application Tracking</h2>
            <p className="text-xs text-slate-500 mt-1">
              {student?.student_id ? `Student ID: ${student.student_id}` : "Your records are protected by Supabase Row Level Security."}
            </p>
          </div>
          <button onClick={() => void load()} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black flex items-center gap-2 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          <button onClick={() => setTab("applications")} className={`rounded-xl px-4 py-2.5 text-xs font-black flex items-center gap-2 ${tab === "applications" ? "bg-[#0B5D3B] text-white" : "bg-slate-50 text-slate-600"}`}><Clock className="h-4 w-4" /> Applications</button>
          <button onClick={() => setTab("documents")} className={`rounded-xl px-4 py-2.5 text-xs font-black flex items-center gap-2 ${tab === "documents" ? "bg-[#0B5D3B] text-white" : "bg-slate-50 text-slate-600"}`}><ShieldCheck className="h-4 w-4" /> Documents</button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div><div className="font-black">Application data notice</div><div className="text-xs mt-1">{error}</div></div>
        </div>
      )}

      {tab === "documents" && <SecureDocumentVault />}

      {tab === "applications" && (
        <div className="space-y-5">
          {!applications.length ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
              <FileText className="h-9 w-9 text-slate-300 mx-auto" />
              <h3 className="font-black text-slate-900 mt-3">No active application record yet</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">Once a JEL counselor creates your university application in the CRM, its verified status will appear here. This portal no longer displays demo or simulated application data.</p>
            </div>
          ) : (
            <>
              <div className="bg-[#0B5D3B] text-white rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37]">Current application stage</div>
                    <h3 className="text-2xl font-black mt-1">{activeStage}</h3>
                    <p className="text-xs text-white/70 mt-2">{applications[0].target_university || "University to be confirmed"} · {applications[0].target_course || "Course to be confirmed"} · {applications[0].target_country || "Country to be confirmed"}</p>
                  </div>
                  <div className="text-xs text-white/60">Last updated: {applications[0].updated_at ? new Date(applications[0].updated_at).toLocaleString() : "—"}</div>
                </div>
                <div className="mt-6 grid grid-cols-19 gap-1" aria-label="Application pipeline progress">
                  {PIPELINE.map((stage, index) => <div key={stage} title={stage} className={`h-2 rounded-full ${index <= stageIndex ? "bg-[#D4AF37]" : "bg-white/15"}`} />)}
                </div>
              </div>

              <div className="grid gap-4">
                {applications.map((application) => (
                  <div key={application.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-[#0B5D3B]" /></div>
                      <div><div className="font-black text-slate-900">{application.target_university || "University application"}</div><div className="text-xs text-slate-500 mt-1">{application.target_course || "Course pending"} · {application.target_country || "Country pending"}</div></div>
                    </div>
                    <div className="text-left md:text-right"><div className="text-xs font-black text-[#0B5D3B]">{application.current_stage || application.status || "New Lead"}</div><div className="text-[11px] text-slate-400 mt-1">Record: {application.id}</div></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
