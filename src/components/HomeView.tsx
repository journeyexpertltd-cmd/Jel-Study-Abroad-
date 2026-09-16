import React from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
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
  Users,
} from "lucide-react";

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onPreSelectCountry: (countryName: string) => void;
}

const destinations = [
  { name: "United Kingdom", flag: "🇬🇧", caption: "Top-ranked universities", accent: "from-slate-900 via-indigo-800 to-sky-500" },
  { name: "Canada", flag: "🇨🇦", caption: "Quality education", accent: "from-rose-950 via-red-700 to-rose-400" },
  { name: "Australia", flag: "🇦🇺", caption: "World-class education", accent: "from-blue-950 via-blue-700 to-cyan-400" },
  { name: "United States", flag: "🇺🇸", caption: "Innovation & exposure", accent: "from-slate-900 via-blue-700 to-red-400" },
  { name: "Ireland", flag: "🇮🇪", caption: "Gateway to Europe", accent: "from-emerald-950 via-emerald-700 to-lime-400" },
  { name: "Germany", flag: "🇩🇪", caption: "Strong career pathways", accent: "from-slate-950 via-stone-700 to-amber-500" },
];

const services = [
  { icon: Users, title: "Student Counselling", text: "One-to-one profile guidance" },
  { icon: Landmark, title: "University Application", text: "Application support and tracking" },
  { icon: Award, title: "Scholarship Guidance", text: "Identify relevant opportunities" },
  { icon: ShieldCheck, title: "Visa Documentation", text: "Preparation and document review" },
  { icon: FileCheck2, title: "SOP & Profile Support", text: "Structured application materials" },
  { icon: Plane, title: "Pre-departure Support", text: "Travel and arrival preparation" },
];

const tools = [
  { icon: Search, title: "Course Finder", text: "Explore courses and universities", tab: "finder" },
  { icon: ShieldCheck, title: "Eligibility Checker", text: "Review common eligibility factors", tab: "checker" },
  { icon: BookOpen, title: "ECTS Calculator", text: "Estimate academic credit conversion", tab: "ects" },
];

const journeyCards = [
  { n: "01", title: "The Dream", icon: Sparkles, text: "Every journey begins with a dream." },
  { n: "02", title: "The World Opens", icon: Globe2, text: "Explore destinations and possibilities." },
  { n: "03", title: "Profile Review", icon: Compass, text: "Build a realistic plan around your profile." },
  { n: "04", title: "Smart Match", icon: GraduationCap, text: "Find suitable courses and institutions." },
  { n: "05", title: "Application", icon: FileCheck2, text: "Prepare, submit and track applications." },
  { n: "06", title: "Global Journey", icon: Plane, text: "Move forward with guided preparation." },
];

const partners = ["University of Sunderland", "Deakin University", "RMIT University", "University of Adelaide", "Charles Darwin University", "University of Calgary"];

export function HomeView({ setActiveTab, onPreSelectCountry }: HomeViewProps) {
  const navigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exploreCountry = (country: string) => {
    onPreSelectCountry(country);
    navigate("countries");
  };

  return (
    <div className="bg-[#F7F4EA] text-[#12372A]">
      <style>{`
        @keyframes jelFloat {0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-12px,0)}}
        @keyframes jelOrbit {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes jelPulse {0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        @keyframes jelPlane {0%,100%{transform:translate3d(0,0,0) rotate(-12deg)}50%{transform:translate3d(-20px,-10px,0) rotate(-8deg)}}
        .jel-float{animation:jelFloat 6s ease-in-out infinite}.jel-orbit{animation:jelOrbit 24s linear infinite}.jel-pulse{animation:jelPulse 4s ease-in-out infinite}.jel-plane{animation:jelPlane 8s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.jel-float,.jel-orbit,.jel-pulse,.jel-plane{animation:none!important}}
      `}</style>

      <section className="relative overflow-hidden border-b border-[#D7D0BC] bg-[radial-gradient(circle_at_80%_25%,rgba(255,255,255,.95),rgba(247,244,234,.75)_42%,rgba(239,235,219,.94)_72%),linear-gradient(120deg,#F8F5EA,#EEE7D4)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(11,93,59,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(11,93,59,.18)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="mx-auto grid min-h-[620px] max-w-[1480px] grid-cols-1 items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-16 xl:px-14">
          <div className="relative z-10 max-w-[700px]">
            <div className="mb-6 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#9B6E18]">
              <span>Education</span><span className="h-1.5 w-1.5 rounded-full bg-[#0B5D3B]" /><span>Opportunity</span><span className="h-1.5 w-1.5 rounded-full bg-[#0B5D3B]" /><span>A brighter tomorrow</span>
            </div>
            <h1 className="font-[Georgia,serif] text-[42px] font-black leading-[1.08] tracking-[-0.035em] text-[#0B5137] sm:text-[54px] lg:text-[64px]">
              একটি স্বপ্ন থেকেই শুরু হয়<br />প্রতিটি যাত্রা।
            </h1>
            <p className="mt-5 font-[Georgia,serif] text-2xl leading-snug text-[#203D36] sm:text-3xl">কেউ যেতে চায় নতুন দেশে,<br />কেউ খুঁজে পায় নিজের সম্ভাবনা।</p>
            <p className="mt-5 max-w-[630px] text-sm leading-7 text-slate-700 sm:text-base">We help you prepare, apply, and take the next step with confidence — admissions, scholarships, documentation and beyond.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate("booking")} className="inline-flex items-center gap-3 rounded-lg bg-[#0B5D3B] px-6 py-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(11,93,59,.22)] transition hover:-translate-y-1 hover:bg-[#084A30]">
                <MessageCircle className="h-4 w-4" /> Book Free Counselling <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("countries")} className="inline-flex items-center gap-3 rounded-lg border border-[#0B5D3B] bg-white/70 px-6 py-4 text-sm font-black text-[#0B5D3B] transition hover:-translate-y-1 hover:bg-white">
                Explore Destinations <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-8 grid max-w-[670px] grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                [Users, "Personalized Guidance", "From profile to visa"],
                [Globe2, "Global Opportunities", "Study destinations worldwide"],
                [Headphones, "Dedicated Support", "Human support at every step"],
              ].map(([Icon, title, text]) => {
                const IconComponent = Icon as React.ElementType;
                return <div key={String(title)} className="flex items-center gap-3 rounded-xl border border-[#D8D1BF] bg-white/60 p-3 backdrop-blur-sm"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#0B5D3B] bg-[#EEF4EC] text-[#0B5D3B]"><IconComponent className="h-5 w-5" /></div><div><div className="text-xs font-black">{String(title)}</div><div className="mt-1 text-[10px] text-slate-600">{String(text)}</div></div></div>;
              })}
            </div>
          </div>

          <div className="relative min-h-[500px] lg:min-h-[560px]">
            <div className="absolute inset-[8%_3%_2%_9%] rounded-[48%] bg-[radial-gradient(circle_at_42%_38%,#61C6D6_0%,#3B8CC7_24%,#246D8E_45%,#123F4B_70%,#0D2C2F_100%)] shadow-[0_35px_80px_rgba(11,93,59,.26)]">
              <div className="absolute inset-[9%] rounded-full border border-white/30" />
              <div className="jel-orbit absolute inset-[18%] rounded-full border border-dashed border-[#F4C64B]/70" />
              <div className="jel-pulse absolute left-[44%] top-[45%] h-5 w-5 rounded-full bg-[#F4B83A] shadow-[0_0_0_10px_rgba(244,184,58,.2),0_0_30px_rgba(244,184,58,.8)]" />
            </div>
            <div className="absolute left-[4%] top-[34%] rounded-xl bg-white/88 px-4 py-3 text-xs font-black text-[#0B5D3B] shadow-xl backdrop-blur">UK · Europe</div>
            <div className="absolute right-[3%] top-[27%] rounded-xl bg-white/88 px-4 py-3 text-xs font-black text-[#0B5D3B] shadow-xl backdrop-blur">Canada · USA</div>
            <div className="absolute right-[9%] bottom-[17%] rounded-xl bg-white/88 px-4 py-3 text-xs font-black text-[#0B5D3B] shadow-xl backdrop-blur">Australia · NZ</div>
            <Plane className="jel-plane absolute right-[14%] top-[10%] h-16 w-16 text-slate-700 drop-shadow-xl sm:h-20 sm:w-20" />
            <div className="jel-float absolute bottom-[4%] left-[18%] right-[15%] rounded-[28px] border border-white/50 bg-white/84 p-6 shadow-[0_25px_55px_rgba(15,61,45,.24)] backdrop-blur-xl sm:p-8">
              <div className="flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#0B5D3B] text-white"><GraduationCap className="h-8 w-8" /></div><div><div className="font-[Georgia,serif] text-2xl font-black text-[#0B5137]">Same Dreams.<br />A Brighter World.</div><p className="mt-2 text-xs leading-5 text-slate-600">Your global journey begins with a clear plan, relevant options and human guidance.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#064A34] text-white">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 lg:grid-cols-[repeat(4,1fr)_1.12fr]">
          {[
            ["20+", "Study Destinations"], ["1200+", "Global Universities"], ["1000+", "Students Guided"], ["Wide Range", "Scholarship Opportunities"],
          ].map(([value, label]) => <div key={label} className="flex items-center gap-3 border-b border-r border-white/10 px-5 py-5 lg:border-b-0"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#E2B646] text-[#E2B646]"><GraduationCap className="h-5 w-5" /></div><div><div className="text-lg font-black">{value}</div><div className="text-[10px] text-white/70">{label}</div></div></div>)}
          <div className="col-span-2 bg-[#E4B23E] px-6 py-5 text-[#17352D] lg:col-span-1"><div className="text-sm font-black uppercase">Real guidance<br />Real opportunities</div><div className="mt-1 text-[10px]">Your future, our commitment.</div></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10 xl:px-14">
        <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="font-[Georgia,serif] text-2xl font-black text-[#12372A]">The Journey, Visualized</h2><p className="mt-1 text-xs text-slate-500">A connected path from first dream to global study plan.</p></div></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {journeyCards.map(({ n, title, icon: Icon, text }, index) => <button key={n} onClick={() => navigate(index < 2 ? "countries" : index < 4 ? "finder" : "booking")} className="group relative min-h-[210px] overflow-hidden rounded-2xl border border-[#D7D0BC] bg-[linear-gradient(160deg,#173F36,#0B5D3B_48%,#D3A73D)] p-4 text-left text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_70%_15%,white,transparent_28%)]" /><div className="relative"><div className="text-xs font-black">{n}. {title}</div><div className="mt-8 grid h-14 w-14 place-items-center rounded-full border border-[#E4B23E]/70 bg-white/10"><Icon className="h-7 w-7 text-[#F1D16D]" /></div><p className="mt-5 text-[11px] leading-5 text-white/75">{text}</p></div></button>)}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 pb-10 sm:px-8 lg:px-10 xl:px-14">
        <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="font-[Georgia,serif] text-2xl font-black">Popular Study Destinations</h2><p className="mt-1 text-xs text-slate-500">Explore globally recognized education destinations.</p></div><button onClick={() => navigate("countries")} className="hidden items-center gap-2 text-xs font-black text-[#0B5D3B] sm:flex">View All Destinations <ArrowRight className="h-4 w-4" /></button></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {destinations.map((destination) => <button key={destination.name} onClick={() => exploreCountry(destination.name)} className="group overflow-hidden rounded-xl border border-[#D9D2BF] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className={`relative h-28 bg-gradient-to-br ${destination.accent}`}><div className="absolute right-3 top-3 text-3xl">{destination.flag}</div><div className="absolute bottom-3 left-3 text-4xl text-white/40"><Landmark className="h-10 w-10" /></div></div><div className="p-3"><div className="text-sm font-black">{destination.name}</div><div className="mt-1 text-[10px] text-slate-500">{destination.caption}</div><div className="mt-3 flex items-center justify-end text-[#C5901E]"><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div></div></button>)}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1480px] grid-cols-1 gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-[1.35fr_.85fr] lg:px-10 xl:px-14">
        <div>
          <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="font-[Georgia,serif] text-2xl font-black">Our Services</h2><p className="mt-1 text-xs text-slate-500">Comprehensive support for your study abroad journey.</p></div><button onClick={() => navigate("services")} className="text-xs font-black text-[#0B5D3B]">View All Services →</button></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{services.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-xl border border-[#DDD6C5] bg-white p-4 text-center shadow-sm"><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#EAF3ED] text-[#0B5D3B]"><Icon className="h-5 w-5" /></div><div className="mt-3 text-xs font-black">{title}</div><div className="mt-2 text-[10px] leading-4 text-slate-500">{text}</div></div>)}</div>
          <div className="mt-7"><div className="mb-4"><h2 className="font-[Georgia,serif] text-2xl font-black">Powerful Tools for Your Journey</h2><p className="mt-1 text-xs text-slate-500">Free planning tools to help you make better decisions.</p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{tools.map(({ icon: Icon, title, text, tab }) => <button key={title} onClick={() => navigate(tab)} className="rounded-xl border border-[#DDD6C5] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#0B8A53] text-white"><Icon className="h-5 w-5" /></div><div className="mt-3 text-sm font-black">{title}</div><div className="mt-1 text-[10px] text-slate-500">{text}</div><div className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#0B5D3B] px-3 py-1.5 text-[10px] font-black text-[#0B5D3B]">Try Now <ArrowRight className="h-3 w-3" /></div></button>)}</div></div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_75%_18%,rgba(77,205,168,.35),transparent_27%),linear-gradient(145deg,#06452F,#0B5D3B_55%,#083B2A)] p-6 text-white shadow-xl sm:p-7">
          <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full border border-[#D9B44A]/30" /><div className="absolute -right-3 top-14 h-36 w-36 rounded-full border border-[#D9B44A]/25" />
          <div className="relative"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#F3D47A]"><Bot className="h-4 w-4" /> Meet Angela</div><h2 className="font-[Georgia,serif] text-3xl font-black">Hi! I’m Angela.</h2><p className="mt-2 text-sm text-white/80">Your AI Study & Travel Assistant.</p><div className="my-7 grid h-32 w-32 place-items-center rounded-full border border-[#E3B94D] bg-white/10 text-[#F3D47A] shadow-[0_0_45px_rgba(222,184,74,.2)]"><Bot className="h-16 w-16" /></div><div className="space-y-2 text-xs text-white/75"><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#F3D47A]" /> Website guidance</div><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#F3D47A]" /> Study destination questions</div><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#F3D47A]" /> Bilingual support</div></div><button onClick={() => document.querySelector<HTMLButtonElement>('[aria-label*="Angela"], [aria-label*="assistant"], [title*="Angela"]')?.click()} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#E2B646] px-4 py-3 text-xs font-black text-[#12372A]">Chat with Angela <ArrowRight className="h-4 w-4" /></button></div>
        </div>
      </section>

      <section className="border-y border-[#DAD3C1] bg-white/70">
        <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-10 xl:px-14"><div className="mb-5 flex items-end justify-between"><div><h2 className="font-[Georgia,serif] text-xl font-black">Our University Partners</h2><p className="mt-1 text-xs text-slate-500">Collaborating with education institutions worldwide.</p></div><button onClick={() => navigate("universities")} className="hidden text-xs font-black text-[#0B5D3B] sm:block">View All Partners →</button></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{partners.map((partner) => <div key={partner} className="flex min-h-20 items-center justify-center rounded-xl border border-[#DDD6C5] bg-white px-4 text-center text-xs font-black text-slate-700 shadow-sm">{partner}</div>)}</div></div>
      </section>

      <section className="relative overflow-hidden bg-[#0B5137] text-white">
        <div className="absolute inset-y-0 right-0 w-[48%] bg-[radial-gradient(circle_at_40%_50%,rgba(255,255,255,.18),transparent_48%)]" />
        <div className="relative mx-auto flex max-w-[1480px] flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:px-10 xl:px-14"><div><h2 className="font-[Georgia,serif] text-3xl font-black sm:text-4xl">Start Your Global Journey Today</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Book a free counselling session with our team and take the first step toward a clearer international education plan.</p><div className="mt-5 flex flex-wrap gap-4 text-[11px] text-white/80"><span>● Online or In-Person</span><span>● Expert Guidance</span><span>● No Obligation</span></div></div><button onClick={() => navigate("booking")} className="inline-flex items-center gap-3 rounded-lg bg-[#E2B646] px-6 py-4 text-sm font-black text-[#12372A] shadow-lg">Book Free Counselling <ArrowRight className="h-4 w-4" /></button></div>
      </section>
    </div>
  );
}
