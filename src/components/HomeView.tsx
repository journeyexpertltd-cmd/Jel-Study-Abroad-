import React, { useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Brain,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  Compass,
  FileCheck2,
  Globe2,
  GraduationCap,
  Headphones,
  Landmark,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  WandSparkles,
} from "lucide-react";

const brandLogoImg = new URL("../assets/images/jel-study-abroad-official.webp", import.meta.url).href;

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onPreSelectCountry: (countryName: string) => void;
}

const destinations = [
  { name: "United Kingdom", short: "UK", flag: "🇬🇧", note: "Multiple intakes · broad course choice", glow: "from-indigo-500/35 to-sky-400/10" },
  { name: "Canada", short: "Canada", flag: "🇨🇦", note: "College & university pathways", glow: "from-red-500/30 to-rose-300/10" },
  { name: "Australia", short: "Australia", flag: "🇦🇺", note: "Research & professional programs", glow: "from-blue-500/30 to-cyan-300/10" },
  { name: "United States", short: "USA", flag: "🇺🇸", note: "STEM, business & liberal arts", glow: "from-violet-500/30 to-blue-300/10" },
  { name: "Ireland", short: "Ireland", flag: "🇮🇪", note: "Technology & business programs", glow: "from-emerald-500/30 to-green-300/10" },
  { name: "Germany", short: "Germany", flag: "🇩🇪", note: "Public & private study options", glow: "from-amber-500/30 to-yellow-300/10" },
];

const services = [
  { icon: Compass, title: "Profile Assessment", text: "Academic background, budget, study gap and destination preferences reviewed before shortlisting." },
  { icon: Search, title: "Course & University Shortlisting", text: "Structured comparison of suitable programs, entry requirements and application timelines." },
  { icon: FileCheck2, title: "Application Support", text: "Document checklist, application preparation, submission tracking and university communication." },
  { icon: Award, title: "Scholarship Guidance", text: "Identify relevant university awards and prepare scholarship application materials where available." },
  { icon: BookOpen, title: "SOP & Documentation", text: "Guidance on SOP structure, CV, references and supporting documentation without fabricated claims." },
  { icon: ShieldCheck, title: "Visa Preparation", text: "Document preparation and process guidance; all visa decisions remain with the relevant authority." },
  { icon: Plane, title: "Pre-Departure Support", text: "Travel planning, accommodation guidance, insurance, airport support and departure briefings." },
  { icon: Headphones, title: "Ongoing Human Support", text: "Counsellor-led follow-up supported by Angela AI for common questions and website guidance." },
];

const journeySteps = [
  { n: "01", title: "Free Counselling", text: "Tell us your study goal, academic background and preferred destination." },
  { n: "02", title: "Profile Review", text: "We assess eligibility factors and create a realistic action plan." },
  { n: "03", title: "Shortlist & Apply", text: "Compare suitable institutions and prepare complete applications." },
  { n: "04", title: "Offer & Funding", text: "Track offers, conditions, deposits and available scholarship options." },
  { n: "05", title: "Visa Preparation", text: "Prepare documents, financial evidence and interview readiness where relevant." },
  { n: "06", title: "Departure & Arrival", text: "Complete pre-departure, travel and arrival planning with JEL support." },
];

const faqs = [
  {
    q: "Does JEL guarantee admission, scholarship or visa approval?",
    a: "No. JEL provides counselling, application and visa-preparation support. Final admission, scholarship and visa decisions are made by universities, scholarship bodies and government authorities.",
  },
  {
    q: "Can I start without IELTS or another English test?",
    a: "For some institutions you may be able to begin shortlisting or an application before a final language result is available. Requirements vary by university, program and country, so your counsellor should verify the exact condition for each option.",
  },
  {
    q: "What documents should I prepare for the first counselling session?",
    a: "Bring or upload your passport bio page if available, academic certificates/transcripts, CV or employment records, English-test results if available, and a rough budget range. Additional documents depend on your destination and study level.",
  },
  {
    q: "How does Angela AI work with a human counsellor?",
    a: "Angela handles common questions, website navigation and preliminary guidance. Case-specific admissions, financial and visa preparation should be reviewed by an authorized JEL counsellor before action is taken.",
  },
];

export function HomeView({ setActiveTab, onPreSelectCountry }: HomeViewProps) {
  const [heroSearchInput, setHeroSearchInput] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [leadForm, setLeadForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    preferredCountry: "United Kingdom",
    educationLevel: "Bachelor's Degree",
    message: "",
  });

  const navigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCountryExplore = (countryName: string) => {
    onPreSelectCountry(countryName);
    navigate("countries");
  };

  const handleHeroSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = heroSearchInput.trim().toLowerCase();
    if (!query) return;

    const matched = destinations.find((destination) =>
      query.includes(destination.name.toLowerCase()) || query === destination.short.toLowerCase()
    );

    if (matched) {
      handleCountryExplore(matched.name);
      return;
    }

    navigate("finder");
  };

  const handleLeadFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setLeadForm((current) => ({ ...current, [name]: value }));
  };

  const handleLeadFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!leadForm.fullName.trim() || !leadForm.mobileNumber.trim()) return;

    setFormSubmitting(true);
    setFormSubmitted(false);

    const newLead = {
      id: `lead-${Date.now()}`,
      fullName: leadForm.fullName.trim(),
      email: leadForm.email.trim() || "no-email@jel.com",
      mobileNumber: leadForm.mobileNumber.trim(),
      preferredCountry: leadForm.preferredCountry,
      educationLevel: leadForm.educationLevel,
      message: leadForm.message.trim() || "Consultation request from Home Page Lead Form.",
      status: "New",
      notes: "Auto-ingested via Home Page Lead capture form.",
      createdAt: `${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })} (Dhaka Time)`,
    };

    try {
      const stored = localStorage.getItem("jel_consult_leads");
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem("jel_consult_leads", JSON.stringify([newLead, ...(Array.isArray(existing) ? existing : [])]));
    } catch {
      localStorage.setItem("jel_consult_leads", JSON.stringify([newLead]));
    }

    try {
      await fetch("/api/supabase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
    } catch {
      // Local fallback above intentionally keeps the enquiry available on this device.
    } finally {
      setFormSubmitting(false);
      setFormSubmitted(true);
      setLeadForm({
        fullName: "",
        email: "",
        mobileNumber: "",
        preferredCountry: "United Kingdom",
        educationLevel: "Bachelor's Degree",
        message: "",
      });
    }
  };

  return (
    <div id="jel-premium-home" className="space-y-10 md:space-y-16 pb-4">
      <style>{`
        @keyframes jel-float-a { 0%,100% { transform: translate3d(0,0,0) rotate(-3deg); } 50% { transform: translate3d(0,-14px,0) rotate(2deg); } }
        @keyframes jel-float-b { 0%,100% { transform: translate3d(0,0,0) rotate(4deg); } 50% { transform: translate3d(10px,10px,0) rotate(-2deg); } }
        @keyframes jel-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes jel-orbit-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes jel-scan { 0% { transform: translateY(-110%); opacity: 0; } 25%,75% { opacity: .35; } 100% { transform: translateY(550%); opacity: 0; } }
        @keyframes jel-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .jel-float-a { animation: jel-float-a 6s ease-in-out infinite; }
        .jel-float-b { animation: jel-float-b 7.5s ease-in-out infinite; }
        .jel-orbit { animation: jel-orbit 18s linear infinite; }
        .jel-orbit-reverse { animation: jel-orbit-reverse 24s linear infinite; }
        .jel-holo-scan { animation: jel-scan 5.5s ease-in-out infinite; }
        .jel-shimmer { background-size: 200% 100%; animation: jel-shimmer 7s linear infinite; }
        .jel-card-3d { transform-style: preserve-3d; perspective: 900px; }
        .jel-card-3d > * { transform: translateZ(18px); }
        @media (prefers-reduced-motion: reduce) {
          .jel-float-a,.jel-float-b,.jel-orbit,.jel-orbit-reverse,.jel-holo-scan,.jel-shimmer { animation: none !important; }
        }
      `}</style>

      <section className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_32%),radial-gradient(circle_at_85%_30%,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#020617_0%,#073523_52%,#031f15_100%)] text-white shadow-[0_35px_90px_rgba(2,23,16,0.30)]">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="absolute -left-20 top-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -right-20 -top-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid min-h-[650px] grid-cols-1 items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12 lg:px-14 lg:py-16 xl:px-20">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-200 backdrop-blur-xl sm:text-xs">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>AI-assisted planning · Human counsellor review</span>
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.03] tracking-[-0.04em] sm:text-5xl md:text-6xl xl:text-[72px]">
              Build your global study plan with
              <span className="block bg-[linear-gradient(90deg,#fef3c7,#d4af37,#67e8f9,#bbf7d0)] bg-clip-text text-transparent jel-shimmer">clarity, technology & human expertise.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base md:text-lg">
              JEL Study Abroad supports students with profile assessment, university applications, scholarship guidance,
              visa preparation and pre-departure planning — from one connected digital journey.
            </p>

            <form onSubmit={handleHeroSearchSubmit} className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-2.5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 px-3">
                <Search className="h-5 w-5 shrink-0 text-amber-300" />
                <input
                  value={heroSearchInput}
                  onChange={(event) => setHeroSearchInput(event.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-300"
                  placeholder="Search a country, course or study goal"
                  aria-label="Search study options"
                />
              </div>
              <button type="submit" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300">
                Explore options
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {destinations.map((destination) => (
                <button
                  key={destination.name}
                  onClick={() => handleCountryExplore(destination.name)}
                  className="rounded-xl border border-white/10 bg-white/7 px-3 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/12"
                >
                  <span className="mr-1.5">{destination.flag}</span>{destination.short}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate("booking")} className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#0B5D3B] shadow-xl transition hover:-translate-y-1">
                Book free counselling <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button onClick={() => navigate("checker")} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-5 py-3.5 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-white/14">
                <Brain className="h-4 w-4 text-cyan-300" /> Eligibility planner
              </button>
              <a href="https://wa.me/8801926400400" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-black text-white shadow-xl transition hover:-translate-y-1">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Dhaka", "Physical office"],
                ["Private", "Student workspace"],
                ["24/7", "Angela web assistant"],
                ["Human", "Counsellor review"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-md">
                  <div className="text-lg font-black text-amber-200">{value}</div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-square w-full max-w-[500px] jel-card-3d">
              <div className="absolute inset-[8%] rounded-full border border-cyan-300/15 bg-cyan-300/[0.025] jel-orbit" />
              <div className="absolute inset-[18%] rounded-full border border-dashed border-amber-300/25 jel-orbit-reverse" />
              <div className="absolute inset-[30%] rounded-full border border-emerald-300/20 jel-orbit" />

              <div className="absolute inset-[19%] rounded-[34%] bg-[radial-gradient(circle_at_40%_30%,rgba(103,232,249,0.38),transparent_24%),linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.025))] shadow-[0_0_90px_rgba(34,211,238,0.18)] backdrop-blur-2xl border border-white/15 rotate-6" />
              <div className="absolute inset-[25%] -rotate-6 rounded-[32%] border border-amber-300/20 bg-[#062d20]/70 shadow-2xl backdrop-blur-xl" />

              <div className="absolute inset-[31%] z-10 flex flex-col items-center justify-center rounded-[28%] border border-white/15 bg-slate-950/65 p-5 text-center shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-white/15 bg-white p-2 shadow-2xl sm:h-24 sm:w-24">
                  <img src={brandLogoImg} alt="JEL Study Abroad" className="h-full w-full object-contain" />
                </div>
                <div className="mt-4 text-base font-black sm:text-xl">JEL Study Abroad</div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-200 sm:text-[10px]">Student Journey Command Center</div>
              </div>

              <div className="absolute left-[2%] top-[14%] w-[46%] rounded-2xl border border-white/15 bg-slate-950/75 p-4 shadow-2xl backdrop-blur-xl jel-float-a">
                <div className="flex items-center gap-2 text-cyan-200"><Bot className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-wider">Angela AI</span></div>
                <div className="mt-2 text-sm font-black text-white">Bilingual web guidance</div>
                <div className="mt-1 text-[10px] leading-4 text-slate-300">Quick answers + handoff to human counselling.</div>
              </div>

              <div className="absolute right-0 top-[9%] w-[38%] rounded-2xl border border-amber-300/20 bg-slate-950/75 p-4 shadow-2xl backdrop-blur-xl jel-float-b">
                <GraduationCap className="h-5 w-5 text-amber-300" />
                <div className="mt-2 text-sm font-black">Global study planning</div>
                <div className="mt-1 text-[10px] leading-4 text-slate-300">Country, course and intake comparison.</div>
              </div>

              <div className="absolute bottom-[8%] left-[6%] w-[42%] rounded-2xl border border-emerald-300/20 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-xl jel-float-b">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <div className="mt-2 text-sm font-black">Secure workspace</div>
                <div className="mt-1 text-[10px] leading-4 text-slate-300">Private student records and document workflow.</div>
              </div>

              <div className="absolute bottom-[3%] right-[3%] w-[40%] rounded-2xl border border-violet-300/20 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-xl jel-float-a">
                <Users className="h-5 w-5 text-violet-300" />
                <div className="mt-2 text-sm font-black">Human-in-the-loop</div>
                <div className="mt-1 text-[10px] leading-4 text-slate-300">Counsellor review before case decisions.</div>
              </div>

              <div className="pointer-events-none absolute inset-x-[19%] top-[24%] h-14 bg-gradient-to-b from-cyan-200/0 via-cyan-200/10 to-cyan-200/0 blur-sm jel-holo-scan" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="JEL service capabilities">
        {[
          { icon: Landmark, title: "Dhaka-based support", text: "Face-to-face counselling and document review from Tejgaon." },
          { icon: ShieldCheck, title: "Secure digital workflow", text: "Authenticated CRM, private student workspace and controlled document storage." },
          { icon: WandSparkles, title: "AI + human workflow", text: "Planning tools and Angela AI support counsellor-led decision making." },
          { icon: Globe2, title: "Multi-destination planning", text: "Compare study options across major international education destinations." },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-emerald-500/5 blur-2xl transition group-hover:bg-amber-300/10" />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B5D3B] text-white shadow-lg"><Icon className="h-5 w-5" /></div>
            <h2 className="mt-5 text-base font-black text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#0B5D3B] dark:text-emerald-300"><Sparkles className="h-4 w-4" /> Complete student support</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">Everything a study-abroad counselling homepage should make clear.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">From the first profile review to pre-departure planning, every service is presented as a connected step instead of isolated information blocks.</p>
          </div>
          <button onClick={() => navigate("services")} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">Explore all services <ArrowRight className="h-4 w-4" /></button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(145deg,#ffffff,#f8fafc)] p-5 transition duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:shadow-xl dark:border-slate-700 dark:bg-[linear-gradient(145deg,#0f172a,#111827)]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-300/10 to-cyan-300/10 blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B5D3B] text-white shadow-lg transition group-hover:rotate-3 group-hover:scale-105"><Icon className="h-5 w-5" /></div>
                <span className="text-[10px] font-black tracking-[0.18em] text-slate-300 dark:text-slate-600">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-base font-black text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#0B5D3B] dark:text-emerald-300">Destination explorer</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">Choose a destination. See the next step.</h2>
          </div>
          <button onClick={() => navigate("countries")} className="self-start text-sm font-black text-[#0B5D3B] dark:text-emerald-300">View all destinations →</button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {destinations.map((destination) => (
            <button key={destination.name} onClick={() => handleCountryExplore(destination.name)} className="group relative min-h-[185px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl dark:border-slate-800">
              <div className={`absolute inset-0 bg-gradient-to-br ${destination.glow}`} />
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_20%,white,transparent_14%),linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.12),transparent_60%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-4xl drop-shadow-xl">{destination.flag}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur-md transition group-hover:translate-x-1"><ArrowRight className="h-4 w-4" /></div>
                </div>
                <div className="mt-10">
                  <div className="text-xl font-black text-white">Study in {destination.name}</div>
                  <div className="mt-1 text-sm text-slate-300">{destination.note}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[32px] bg-[#0B5D3B] p-6 text-white shadow-2xl sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">Connected student journey</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Six clear stages from enquiry to departure.</h2>
            <p className="mt-3 text-sm leading-7 text-emerald-50/80 sm:text-base">The homepage now shows how each JEL service connects to the next, reducing empty space and making the conversion path easier to understand.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {journeySteps.map((step) => (
              <article key={step.n} className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur-xl">
                <div className="absolute right-4 top-3 text-4xl font-black text-white/5">{step.n}</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D4AF37] text-sm font-black text-slate-950">{step.n}</div>
                <h3 className="mt-4 text-base font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-emerald-50/75">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white lg:col-span-7 sm:p-8 dark:border-slate-800">
          <div className="absolute -right-20 top-0 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200"><Bot className="h-4 w-4" /> Digital ecosystem</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">AI tools outside. Secure human workflow inside.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Students can explore options using planning tools while staff work through authenticated CRM, private records and controlled document workflows.</p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: Bot, title: "Angela AI", text: "Website guidance in English and Bangla/Banglish contexts." },
                { icon: Brain, title: "Eligibility Planner", text: "A structured starting point before human review." },
                { icon: Compass, title: "Course Finder", text: "Explore programs by profile, destination and study goal." },
                { icon: ShieldCheck, title: "Counsellor CRM", text: "Authenticated workspace for authorized JEL staff." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
                  <Icon className="h-5 w-5 text-amber-300" />
                  <div className="mt-3 font-black">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-300">{text}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => navigate("finder")} className="rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-black text-slate-950">Open Course Finder</button>
              <button onClick={() => navigate("portal")} className="rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-black">Student Portal</button>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D3B] text-white"><BriefcaseBusiness className="h-6 w-6" /></div>
          <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Why the new homepage feels fuller.</h2>
          <div className="mt-5 space-y-3">
            {[
              "Clear visual hierarchy instead of large empty gaps",
              "Motion graphics created with lightweight CSS, not heavy video files",
              "Every major section has a defined conversion action",
              "Mobile, tablet and desktop layouts use responsive grids",
              "No unsupported visa-success or outcome-guarantee claims",
              "Existing CRM, Auth, Supabase and Angela endpoints remain untouched",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                <span className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-12 sm:p-8 lg:p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="lg:col-span-5">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#0B5D3B] dark:text-emerald-300">Start your case</div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">Book a profile review without leaving the homepage.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">Submit your basic profile. JEL can use the enquiry to follow up with the appropriate counselling team.</p>

          <div className="mt-6 space-y-3">
            {[
              { icon: Clock3, title: "Short form", text: "Only the essential details are required to start." },
              { icon: Users, title: "Human follow-up", text: "A counsellor can review the enquiry before case action." },
              { icon: ShieldCheck, title: "No approval promises", text: "Guidance is separated from third-party decisions." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#0B5D3B] dark:text-emerald-300" />
                <div><div className="font-black text-slate-900 dark:text-white">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</div></div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleLeadFormSubmit} className="grid grid-cols-1 gap-4 rounded-3xl bg-slate-50 p-5 lg:col-span-7 sm:grid-cols-2 sm:p-6 dark:bg-slate-800/60">
          <label className="text-xs font-black text-slate-700 dark:text-slate-200">
            Full name *
            <input name="fullName" value={leadForm.fullName} onChange={handleLeadFormChange} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="text-xs font-black text-slate-700 dark:text-slate-200">
            Mobile / WhatsApp *
            <input name="mobileNumber" value={leadForm.mobileNumber} onChange={handleLeadFormChange} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="text-xs font-black text-slate-700 dark:text-slate-200">
            Email
            <input type="email" name="email" value={leadForm.email} onChange={handleLeadFormChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="text-xs font-black text-slate-700 dark:text-slate-200">
            Preferred country
            <select name="preferredCountry" value={leadForm.preferredCountry} onChange={handleLeadFormChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900">
              {destinations.map((destination) => <option key={destination.name}>{destination.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-black text-slate-700 sm:col-span-2 dark:text-slate-200">
            Current education level
            <select name="educationLevel" value={leadForm.educationLevel} onChange={handleLeadFormChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900">
              <option>Higher Secondary / A-Level</option>
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>Diploma / Other</option>
            </select>
          </label>
          <label className="text-xs font-black text-slate-700 sm:col-span-2 dark:text-slate-200">
            Your study goal or question
            <textarea name="message" value={leadForm.message} onChange={handleLeadFormChange} rows={4} className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <button disabled={formSubmitting} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B5D3B] px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70">
              {formSubmitting ? "Submitting…" : "Request counselling"} <ArrowRight className="h-4 w-4" />
            </button>
            {formSubmitted && <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300"><Check className="h-4 w-4" /> Enquiry captured. JEL can follow up.</div>}
          </div>
        </form>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 lg:col-span-7 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#0B5D3B] dark:text-emerald-300">Common questions</div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Clear answers before you apply.</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq, index) => {
              const open = activeFaq === index;
              return (
                <button key={faq.q} onClick={() => setActiveFaq(open ? null : index)} className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm font-black leading-6 text-slate-900 dark:text-white">{faq.q}</span>
                    {open ? <ChevronUp className="mt-1 h-4 w-4 shrink-0" /> : <ChevronDown className="mt-1 h-4 w-4 shrink-0" />}
                  </div>
                  {open && <p className="mt-3 pr-6 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.a}</p>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#fff7ed,#ecfdf5)] p-6 lg:col-span-5 sm:p-8 dark:bg-[linear-gradient(145deg,#172033,#0f241d)]">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><Star className="h-5 w-5 text-amber-300" /></div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Stay connected with JEL.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Follow official Journey Expert channels for study-abroad updates, videos, events and service announcements.</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <a href="https://www.facebook.com/journeyexpertltd" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm font-black text-slate-900 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white">Facebook ↗</a>
              <a href="https://www.instagram.com/journeyexpertltd/" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm font-black text-slate-900 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white">Instagram ↗</a>
              <a href="https://www.youtube.com/@JELSTUDYABROAD" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm font-black text-slate-900 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white">YouTube ↗</a>
              <a href="https://www.linkedin.com/in/journey-expert-ltd-jel-13b6123b1" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm font-black text-slate-900 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white">LinkedIn ↗</a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-10 text-center text-white shadow-2xl sm:px-10 sm:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.18),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.13),transparent_28%)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8"><GraduationCap className="h-6 w-6 text-amber-300" /></div>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Your next step should be clear, not complicated.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Start with a profile review, explore suitable study options, then move into the secure JEL workflow with a human counsellor.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("booking")} className="rounded-xl bg-[#D4AF37] px-5 py-3.5 text-sm font-black text-slate-950 transition hover:-translate-y-1">Book counselling</button>
            <button onClick={() => navigate("finder")} className="rounded-xl border border-white/15 bg-white/8 px-5 py-3.5 text-sm font-black transition hover:-translate-y-1 hover:bg-white/12">Explore courses</button>
            <button onClick={() => navigate("about")} className="rounded-xl border border-white/15 px-5 py-3.5 text-sm font-black transition hover:-translate-y-1 hover:bg-white/8">About Journey Expert</button>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"><CircleDollarSign className="h-3.5 w-3.5" /> No admission, scholarship or visa outcome is guaranteed</div>
        </div>
      </section>
    </div>
  );
}
