import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { CourseRecommendation } from "../types";

interface SmartCourseFinderProps {
  onPreSelectCourse: (uniName: string, country: string) => void;
}

const countries = ["United Kingdom", "Australia", "Canada", "United States", "Ireland", "New Zealand", "Malaysia", "Germany / Europe"];
const levels = ["Foundation / Pathway", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD / Doctorate"];
const budgets = ["Lower-cost options", "Mid-range options", "Premium options", "Scholarship-focused", "Not decided"];

const isRecommendation = (value: unknown): value is CourseRecommendation => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["courseName", "university", "country", "duration", "approxTuition", "reason"].every((key) => typeof item[key] === "string" && item[key].trim().length > 0);
};

export function SmartCourseFinder({ onPreSelectCourse }: SmartCourseFinderProps) {
  const [preferredCountry, setPreferredCountry] = useState("United Kingdom");
  const [educationLevel, setEducationLevel] = useState("Master's Degree");
  const [budgetRange, setBudgetRange] = useState("Mid-range options");
  const [interestArea, setInterestArea] = useState("");
  const [gpa, setGpa] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFindCourses = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!interestArea.trim() || !gpa.trim()) {
      setError("Add your subject interest and latest academic result to create a planning shortlist.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const response = await fetch("/api/gemini/course-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredCountry, educationLevel, budgetRange, interestArea: interestArea.trim(), gpa: gpa.trim() }),
      });
      if (!response.ok) throw new Error("service_unavailable");
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error("invalid_response");
      const verifiedShape = data.filter(isRecommendation).slice(0, 3);
      if (!verifiedShape.length) throw new Error("empty_response");
      setRecommendations(verifiedShape);
    } catch {
      setError("The planning engine is temporarily unavailable. Your information was not submitted or saved. You can retry, or book a counselor review for a verified shortlist.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="smart-course-finder" className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(5,51,36,.11)]">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_80%_12%,rgba(126,243,190,.22),transparent_30%),linear-gradient(135deg,#001C13,#07583B)] px-6 py-10 text-white sm:px-10 lg:px-12">
        <div className="absolute -right-16 top-8 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute right-10 top-20 h-28 w-28 rounded-full border border-white/10" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-[#A9F4D1]"><Sparkles className="h-4 w-4" /> AI-assisted planning</div>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-.04em] sm:text-5xl">Find a smarter starting point for your course search.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">Create a preliminary shortlist from your destination, academic level, subject and budget. A JEL counselor must verify entry requirements, fees, intake availability and application suitability.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{ icon: Search, label: "Explore" }, { icon: BrainCircuit, label: "Compare" }, { icon: ShieldCheck, label: "Verify" }].map(({ icon: Icon, label }) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-center backdrop-blur"><Icon className="mx-auto h-5 w-5 text-[#8FF2C6]" /><div className="mt-2 text-[10px] font-black uppercase tracking-wider">{label}</div></div>)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[.82fr_1.18fr]">
        <form onSubmit={handleFindCourses} className="border-b border-slate-200 bg-slate-50/70 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B5D3B] text-[#8FF2C6]"><GraduationCap className="h-5 w-5" /></div><div><h2 className="font-black text-slate-900">Your study profile</h2><p className="mt-1 text-[11px] text-slate-500">No data is saved by this finder.</p></div></div>
          <div className="mt-6 space-y-4">
            <Field label="Preferred country" icon={MapPin}><select value={preferredCountry} onChange={(e) => setPreferredCountry(e.target.value)} className="jel-finder-input">{countries.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Study level" icon={GraduationCap}><select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="jel-finder-input">{levels.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Budget direction" icon={CircleDollarSign}><select value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} className="jel-finder-input">{budgets.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Subject / major" icon={Search}><input required maxLength={100} value={interestArea} onChange={(e) => setInterestArea(e.target.value)} className="jel-finder-input" placeholder="Computer Science, MBA, Public Health…" /></Field>
            <Field label="Latest GPA / academic result" icon={CheckCircle2}><input required maxLength={60} value={gpa} onChange={(e) => setGpa(e.target.value)} className="jel-finder-input" placeholder="CGPA 3.50/4.00 or GPA 5.00" /></Field>
          </div>
          <button disabled={isLoading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B5D3B] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/15 transition hover:-translate-y-0.5 disabled:opacity-60">{isLoading ? <><RefreshCw className="h-4 w-4 animate-spin" />Creating planning shortlist…</> : <><Search className="h-4 w-4" />Generate suggestions</>}</button>
        </form>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.17em] text-[#16A36D]">Planning results</div><h2 className="mt-2 text-2xl font-black text-slate-900">Suggested options</h2></div><span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-800">Counselor verification required</span></div>

          {error && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><div className="font-black">Planning service notice</div><div className="mt-1 text-xs">{error}</div></div></div>}

          {!recommendations.length && !error && !isLoading && <div className="grid min-h-[330px] place-items-center text-center"><div><div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-emerald-50 text-[#0B5D3B]"><BrainCircuit className="h-9 w-9" /></div><h3 className="mt-5 text-lg font-black text-slate-900">Your shortlist will appear here</h3><p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">Complete the five planning fields. Suggestions are exploratory and do not represent live seats, confirmed fees, admission decisions or visa outcomes.</p></div></div>}

          {isLoading && <div className="grid min-h-[330px] place-items-center text-center"><div><RefreshCw className="mx-auto h-9 w-9 animate-spin text-[#0B5D3B]" /><div className="mt-4 text-sm font-black text-slate-800">Comparing profile factors…</div><div className="mt-2 text-xs text-slate-500">This may take a few seconds.</div></div></div>}

          {!!recommendations.length && <div className="mt-6 space-y-4">{recommendations.map((item, index) => (
            <article key={`${item.university}-${item.courseName}-${index}`} className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#fff,#f8fbf9)] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#0B5D3B]"><span className="rounded-full bg-emerald-50 px-2.5 py-1.5">Option {index + 1}</span><span>{item.country}</span></div><h3 className="mt-3 text-lg font-black text-slate-900">{item.courseName}</h3><div className="mt-1 text-sm font-bold text-slate-600">{item.university}</div><p className="mt-4 text-xs leading-6 text-slate-600">{item.reason}</p></div><button onClick={() => onPreSelectCourse(item.university, item.country)} className="shrink-0 rounded-xl bg-[#0B5D3B] px-4 py-3 text-xs font-black text-white">Discuss option <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button></div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-600"><Clock3 className="h-3.5 w-3.5" />{item.duration}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-600"><CircleDollarSign className="h-3.5 w-3.5" />{item.approxTuition}</span></div>
            </article>
          ))}<p className="rounded-xl bg-slate-50 p-4 text-[10px] leading-5 text-slate-500">AI-generated planning suggestions may be incomplete or outdated. JEL must verify the university’s official course page, current entry requirements, fees and intake availability before any application decision.</p></div>}
        </div>
      </div>
      <style>{`.jel-finder-input{width:100%;border:1px solid #dbe4df;border-radius:.8rem;background:#fff;padding:.78rem .9rem;font-size:.8rem;color:#1e293b;outline:none;transition:.2s}.jel-finder-input:focus{border-color:#16a36d;box-shadow:0 0 0 4px rgba(22,163,109,.1)}`}</style>
    </section>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-slate-600"><Icon className="h-3.5 w-3.5 text-[#16A36D]" />{label}</span>{children}</label>;
}
