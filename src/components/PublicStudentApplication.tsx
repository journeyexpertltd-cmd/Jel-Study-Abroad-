import React, { useState } from "react";
import { CheckCircle, FileText, Send, ShieldCheck } from "lucide-react";

interface ApplicationState {
  fullName: string;
  email: string;
  mobileNumber: string;
  preferredCountry: string;
  educationLevel: string;
  gpa: string;
  englishTest: string;
  englishScore: string;
  studyLevel: string;
  budget: string;
  message: string;
}

const initialState: ApplicationState = {
  fullName: "",
  email: "",
  mobileNumber: "",
  preferredCountry: "United Kingdom",
  educationLevel: "Bachelor's Degree",
  gpa: "",
  englishTest: "IELTS",
  englishScore: "",
  studyLevel: "Master's",
  budget: "",
  message: ""
};

export function PublicStudentApplication() {
  const [form, setForm] = useState<ApplicationState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const update = (field: keyof ApplicationState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setConfirmation(null);
    setSubmitting(true);

    try {
      const endpoint = import.meta.env.VITE_JEL_INTAKE_FUNCTION_URL;
      if (!endpoint) throw new Error("The application service is not configured yet.");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "public-study-abroad-application",
          consent: true
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "We could not submit the application.");

      setConfirmation(payload.applicationId || "JEL application received");
      setForm(initialState);
    } catch (submissionError: any) {
      setError(submissionError?.message || "Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="application-title">
      <div className="mb-8 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B5D3B]">
          <FileText className="h-4 w-4" /> Student Application
        </div>
        <h1 id="application-title" className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Start your study-abroad application</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Share your academic profile and preferred destination. A JEL counselor will review your information and contact you with the next safe step.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submit} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Full name *<input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]" /></label>
            <label className="text-sm font-semibold text-slate-700">Email address *<input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]" /></label>
            <label className="text-sm font-semibold text-slate-700">Mobile number *<input required value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]" /></label>
            <label className="text-sm font-semibold text-slate-700">Preferred country<select value={form.preferredCountry} onChange={(e) => update("preferredCountry", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]"><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>United States</option><option>Germany</option><option>Ireland</option></select></label>
            <label className="text-sm font-semibold text-slate-700">Highest education<select value={form.educationLevel} onChange={(e) => update("educationLevel", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]"><option>Higher Secondary</option><option>Bachelor's Degree</option><option>Master's Degree</option><option>PhD</option></select></label>
            <label className="text-sm font-semibold text-slate-700">Target study level<select value={form.studyLevel} onChange={(e) => update("studyLevel", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]"><option>Foundation</option><option>Bachelor's</option><option>Master's</option><option>PhD</option></select></label>
            <label className="text-sm font-semibold text-slate-700">GPA / CGPA<input value={form.gpa} onChange={(e) => update("gpa", e.target.value)} placeholder="e.g. 4.50 / 5.00" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold text-slate-700">English test<select value={form.englishTest} onChange={(e) => update("englishTest", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-[#0B5D3B]"><option>IELTS</option><option>PTE</option><option>TOEFL</option><option>Duolingo</option><option>Not taken</option></select></label><label className="text-sm font-semibold text-slate-700">Score<input value={form.englishScore} onChange={(e) => update("englishScore", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-[#0B5D3B]" /></label></div>
          </div>
          <label className="mt-5 block text-sm font-semibold text-slate-700">Estimated budget <input value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="e.g. BDT 20 lakh" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]" /></label>
          <label className="mt-5 block text-sm font-semibold text-slate-700">Tell us about your goal<textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0B5D3B]" /></label>
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {confirmation && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle className="h-5 w-5" /> Application received. Reference: {confirmation}</p>}
          <button disabled={submitting} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B5D3B] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#08452d] disabled:cursor-wait disabled:opacity-60">{submitting ? "Submitting…" : "Submit application"}<Send className="h-4 w-4" /></button>
        </form>

        <aside className="h-fit rounded-3xl bg-[#0B5D3B] p-6 text-white shadow-xl sm:p-8">
          <ShieldCheck className="h-8 w-8 text-[#D4AF37]" />
          <h2 className="mt-5 text-xl font-black">Your information stays protected</h2>
          <p className="mt-3 text-sm leading-6 text-emerald-50">Your submission is sent through the secure JEL intake service. JEL counselors use it only to evaluate your study-abroad options and contact you about your application.</p>
          <div className="mt-6 border-t border-white/15 pt-5 text-xs leading-5 text-emerald-100">By submitting, you consent to JEL contacting you about your application. Do not upload passports or financial documents on this public form; a counselor will provide the secure document-upload step.</div>
        </aside>
      </div>
    </section>
  );
}
