import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  LockKeyhole,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  preferredCountry: string;
  educationLevel: string;
  subject: string;
  intake: string;
  academicResult: string;
  englishTest: string;
  englishScore: string;
  budget: string;
  message: string;
  consent: boolean;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  preferredCountry: "United Kingdom",
  educationLevel: "Bachelor's Degree",
  subject: "",
  intake: "January 2027",
  academicResult: "",
  englishTest: "IELTS",
  englishScore: "",
  budget: "",
  message: "",
  consent: false,
};

const countries = ["United Kingdom", "Canada", "Australia", "United States", "Ireland", "Germany", "New Zealand", "Malaysia", "Other"];
const levels = ["Foundation / Pathway", "Bachelor's Degree", "Master's Degree", "PhD / Doctorate", "Diploma / Certificate"];
const intakes = ["January 2027", "May 2027", "September 2027", "January 2028", "Not decided"];

interface StudentApplicationFormProps {
  setActiveTab: (tab: string) => void;
}

export function StudentApplicationForm({ setActiveTab }: StudentApplicationFormProps) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | number | null>(null);

  const completed = useMemo(() => {
    const values = [form.fullName, form.email, form.phone, form.subject, form.academicResult];
    return values.filter((value) => value.trim()).length;
  }, [form]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.consent) {
      setError("Please confirm that JEL may contact you about this application enquiry.");
      return;
    }

    setSubmitting(true);
    try {
      const applicationSummary = [
        `Student application intake`,
        `Subject: ${form.subject || "Not specified"}`,
        `Intake: ${form.intake}`,
        `Academic result: ${form.academicResult || "Not specified"}`,
        `English: ${form.englishTest}${form.englishScore ? ` ${form.englishScore}` : ""}`,
        `Budget: ${form.budget || "Not specified"}`,
        form.message ? `Student note: ${form.message}` : "",
      ].filter(Boolean).join(" | ");

      const response = await fetch("/api/supabase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          mobileNumber: form.phone,
          preferredCountry: form.preferredCountry,
          educationLevel: form.educationLevel,
          message: applicationSummary,
          source: "student_portal",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error("submission_failed");
      const refId = result.id ?? "received";
      setReference(refId);
      toast.success(
        "Application Enquiry Received",
        `Your application details for ${form.preferredCountry} have been saved to the admissions queue.`
      );
      setForm(initialForm);
    } catch {
      const errorMsg = "Your application enquiry could not be submitted right now. Please try again or contact JEL on WhatsApp at +880 1926-400400.";
      setError(errorMsg);
      toast.error("Application Notice", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <section className="mx-auto max-w-4xl py-8 sm:py-14">
        <div className="overflow-hidden rounded-[32px] border border-emerald-200 bg-white shadow-[0_28px_90px_rgba(5,51,36,.13)]">
          <div className="bg-[radial-gradient(circle_at_82%_18%,rgba(126,243,190,.25),transparent_32%),linear-gradient(135deg,#012A1D,#07583B)] p-8 text-white sm:p-12">
            <CheckCircle2 className="h-12 w-12 text-[#8FF2C6]" />
            <div className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#9AF3C8]">Application enquiry received</div>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl">Your JEL study journey has started.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">A counselor can now review the information you submitted and contact you about the next appropriate step. Admission, scholarship and visa decisions always remain with the relevant institutions and authorities.</p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">CRM reference</div><div className="mt-2 text-xl font-black text-[#0B5D3B]">{String(reference)}</div></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next step</div><div className="mt-2 text-sm font-bold text-slate-800">Create or open your secure student portal</div></div>
            <button onClick={() => setActiveTab("portal")} className="rounded-xl bg-[#0B5D3B] px-5 py-3.5 text-sm font-black text-white sm:col-span-2">Open student portal <ArrowRight className="ml-2 inline h-4 w-4" /></button>
          </div>
        </div>
      </section>
    );
  }

  const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-[#16A36D] focus:ring-4 focus:ring-[#16A36D]/10";
  const labelClass = "mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-slate-600";

  return (
    <section className="py-5 sm:py-10">
      <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(5,51,36,.12)]">
        <div className="grid lg:grid-cols-[.72fr_1.28fr]">
          <aside className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(126,243,190,.22),transparent_30%),linear-gradient(145deg,#001C13,#07583B)] p-7 text-white sm:p-10">
            <div className="absolute -right-20 top-28 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-4 top-44 h-36 w-36 rounded-full border border-white/10" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#A9F4D1]"><Sparkles className="h-4 w-4" /> Online student intake</div>
              <h1 className="mt-7 text-3xl font-black leading-tight sm:text-4xl">Start your study-abroad application.</h1>
              <p className="mt-4 text-sm leading-7 text-white/70">Share your profile once. The enquiry enters JEL’s controlled CRM intake so a counselor can review it without exposing private student records.</p>
              <div className="mt-8 space-y-3">
                {["Profile and destination preferences", "Academic and English-test snapshot", "Desired subject, intake and budget", "Consent-based counselor follow-up"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#8FF2C6]/15 text-xs font-black text-[#A9F4D1]">{index + 1}</span><span className="text-xs font-bold text-white/85">{item}</span></div>
                ))}
              </div>
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#F2CE55]/20 bg-[#F2CE55]/10 p-4 text-xs leading-6 text-[#F8E7A6]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />Submitting this form does not guarantee admission, scholarship or visa approval.</div>
            </div>
          </aside>

          <form onSubmit={submit} className="p-6 sm:p-9 lg:p-11">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div><div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#16A36D]">JEL application profile</div><h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Tell us where you want to go.</h2></div>
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-[11px] font-black text-[#0B5D3B]">{completed}/5 essentials ready</div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label><span className={labelClass}>Full name *</span><input className={fieldClass} required maxLength={120} autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" /></label>
              <label><span className={labelClass}>Mobile / WhatsApp *</span><input className={fieldClass} required maxLength={40} type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+880 1XXX-XXXXXX" /></label>
              <label className="sm:col-span-2"><span className={labelClass}>Email address *</span><input className={fieldClass} required maxLength={180} type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="student@example.com" /></label>
              <label><span className={labelClass}>Preferred destination *</span><select className={fieldClass} value={form.preferredCountry} onChange={(e) => update("preferredCountry", e.target.value)}>{countries.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span className={labelClass}>Study level *</span><select className={fieldClass} value={form.educationLevel} onChange={(e) => update("educationLevel", e.target.value)}>{levels.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span className={labelClass}>Subject / course interest *</span><input className={fieldClass} required maxLength={120} value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="e.g. Computer Science" /></label>
              <label><span className={labelClass}>Preferred intake *</span><select className={fieldClass} value={form.intake} onChange={(e) => update("intake", e.target.value)}>{intakes.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span className={labelClass}>Latest academic result *</span><input className={fieldClass} required maxLength={80} value={form.academicResult} onChange={(e) => update("academicResult", e.target.value)} placeholder="e.g. CGPA 3.45 / 4.00" /></label>
              <div className="grid grid-cols-[.9fr_1.1fr] gap-3"><label><span className={labelClass}>English test</span><select className={fieldClass} value={form.englishTest} onChange={(e) => update("englishTest", e.target.value)}>{["IELTS", "PTE", "TOEFL", "Duolingo", "Not taken"].map((item) => <option key={item}>{item}</option>)}</select></label><label><span className={labelClass}>Score</span><input className={fieldClass} maxLength={30} value={form.englishScore} onChange={(e) => update("englishScore", e.target.value)} placeholder="e.g. 6.5" /></label></div>
              <label className="sm:col-span-2"><span className={labelClass}>Annual budget</span><input className={fieldClass} maxLength={80} value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="Approximate amount and currency" /></label>
              <label className="sm:col-span-2"><span className={labelClass}>Anything else we should know?</span><textarea className={`${fieldClass} min-h-28 resize-y`} maxLength={600} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Study gap, preferred city, scholarship interest or other relevant details" /></label>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B5D3B]" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} /><span className="text-xs leading-6 text-slate-600">I confirm that the information is accurate and authorize Journey Expert Ltd. to contact me about study-abroad counselling. I understand that this is an enquiry, not an offer of admission or a visa decision.</span></label>
            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-500"><LockKeyhole className="h-4 w-4 text-[#0B5D3B]" />Controlled CRM intake · No document upload on this public form</div>
              <button disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B5D3B] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Submitting securely…" : "Submit application enquiry"}{submitting ? <GraduationCap className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
