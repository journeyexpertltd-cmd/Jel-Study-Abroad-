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
  Layers3,
  MessageCircle,
  MousePointer2,
  Orbit,
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
  { name: "United Kingdom", flag: "🇬🇧", caption: "Universities, pathways and postgraduate options" },
  { name: "Canada", flag: "🇨🇦", caption: "Academic programs and study planning" },
  { name: "Australia", flag: "🇦🇺", caption: "University and career-oriented study options" },
  { name: "United States", flag: "🇺🇸", caption: "Broad course choice and global exposure" },
  { name: "Ireland", flag: "🇮🇪", caption: "European study pathways and opportunities" },
  { name: "Germany", flag: "🇩🇪", caption: "Academic and career-focused study routes" },
];

const services = [
  { icon: Users, title: "Student Counselling", text: "One-to-one profile review and study planning." },
  { icon: Landmark, title: "University Application", text: "Application preparation, submission support and tracking." },
  { icon: Award, title: "Scholarship Guidance", text: "Identify relevant scholarship and funding opportunities." },
  { icon: ShieldCheck, title: "Visa Documentation", text: "Document preparation guidance and file review." },
  { icon: FileCheck2, title: "SOP & Profile Support", text: "Structured support for application materials and profile presentation." },
  { icon: Plane, title: "Pre-departure Support", text: "Travel readiness, arrival planning and practical guidance." },
];

const tools = [
  { icon: Search, title: "Course Finder", text: "Explore courses and university options.", tab: "finder" },
  { icon: ShieldCheck, title: "Eligibility Planner", text: "Review common academic and visa-preparation factors.", tab: "checker" },
  { icon: BookOpen, title: "ECTS Calculator", text: "Estimate academic credit conversion for study planning.", tab: "ects" },
];

const steps = [
  { n: "01", title: "Profile assessment", text: "Review academic background, goals, budget and destination preferences." },
  { n: "02", title: "University shortlist", text: "Build a practical shortlist of courses and institutions." },
  { n: "03", title: "Application support", text: "Prepare documents, submit applications and track progress." },
  { n: "04", title: "Visa preparation", text: "Organize supporting documents and prepare for the visa process." },
];

const partners = [
  "University of Sunderland",
  "Deakin University",
  "RMIT University",
  "University of Adelaide",
  "Charles Darwin University",
  "University of Calgary",
];

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
    <div className="overflow-hidden bg-[#031911] text-[#EAFBF3]">
      <style>{`
        @keyframes jelApprovedFloat {0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-12px,0)}}
        @keyframes jelApprovedGlow {0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
        @keyframes jelApprovedSweep {0%{transform:translateX(-130%) rotate(18deg)}100%{transform:translateX(260%) rotate(18deg)}}
        @keyframes jelOrbit {from{transform:rotate(0deg) translateX(132px) rotate(0deg)}to{transform:rotate(360deg) translateX(132px) rotate(-360deg)}}
        @keyframes jelOrbitReverse {from{transform:rotate(360deg) translateX(86px) rotate(-360deg)}to{transform:rotate(0deg) translateX(86px) rotate(0deg)}}
        .jel-approved-float{animation:jelApprovedFloat 6.5s ease-in-out infinite}.jel-approved-float-delay{animation:jelApprovedFloat 7.5s ease-in-out -2.2s infinite}.jel-approved-glow{animation:jelApprovedGlow 4.5s ease-in-out infinite}.jel-approved-sweep{animation:jelApprovedSweep 9s linear infinite}.jel-orbit{animation:jelOrbit 15s linear infinite}.jel-orbit-reverse{animation:jelOrbitReverse 11s linear infinite}
        @media (prefers-reduced-motion:reduce){.jel-approved-float,.jel-approved-float-delay,.jel-approved-glow,.jel-approved-sweep,.jel-orbit,.jel-orbit-reverse{animation:none!important}}
      `}</style>

      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_73%_22%,rgba(16,212,134,.17),transparent_30%),radial-gradient(circle_at_15%_68%,rgba(0,95,62,.22),transparent_34%),linear-gradient(135deg,#00150E_0%,#001D14_46%,#003425_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(142,255,205,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(142,255,205,.04)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="pointer-events-none absolute -right-24 top-20 h-[420px] w-[420px] rounded-full bg-[#10D486]/10 blur-3xl" />
        <div className="mx-auto grid min-h-[720px] max-w-[1480px] grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.03fr_.97fr] lg:px-10 lg:py-24 xl:px-14">
          <div className="relative z-10 max-w-[790px]">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#45FFA9]/20 bg-[#00613C]/20 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#C7EADB] sm:text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-[#11DD8A] shadow-[0_0_18px_rgba(17,221,138,.75)]" />
              Global admissions guidance
            </div>

            <h1 className="mt-9 max-w-[780px] text-[52px] font-black leading-[0.94] tracking-[-0.065em] text-[#F1FFF8] sm:text-[72px] lg:text-[88px] xl:text-[102px]">
              Your ambition.<br />A world of <span className="bg-[linear-gradient(90deg,#7EF3BE_10%,#9BEFA8_48%,#F6D143_92%)] bg-clip-text text-transparent">possibilities.</span>
            </h1>

            <p className="mt-7 max-w-[760px] text-base leading-8 text-[#B9D2C6] sm:text-xl sm:leading-9">
              From profile assessment and university selection to visa guidance and pre-departure support—move forward with a clear, expert-led plan.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => navigate("apply")} className="inline-flex items-center gap-3 rounded-xl bg-[linear-gradient(110deg,#8FF2C6,#F3D14E)] px-6 py-4 text-sm font-black text-[#053324] shadow-[0_16px_34px_rgba(0,0,0,.18)] transition hover:-translate-y-1 hover:brightness-105">
                Start application <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("booking")} className="inline-flex items-center gap-3 rounded-xl bg-[#ECFFF6] px-6 py-4 text-sm font-black text-[#053324] shadow-[0_16px_34px_rgba(0,0,0,.18)] transition hover:-translate-y-1 hover:bg-white">
                Book free counselling <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("portal")} className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.05] px-6 py-4 text-sm font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/10">
                Student portal <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid max-w-[760px] grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Users, title: "Profile-first guidance", text: "Plan around your goals" },
                { icon: Globe2, title: "Global opportunities", text: "Explore study destinations" },
                { icon: Headphones, title: "Human support", text: "Counsellor-led assistance" },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 backdrop-blur-md">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#7EF3BE]/20 bg-[#7EF3BE]/10 text-[#9AF3C8]"><Icon className="h-5 w-5" /></div>
                  <div><div className="text-xs font-black text-white">{title}</div><div className="mt-1 text-[10px] text-[#91B3A3]">{text}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[500px] lg:min-h-[590px] [perspective:1200px]">
            <div className="absolute inset-[5%_3%_5%_5%] overflow-hidden rounded-[44px] bg-[linear-gradient(145deg,#F8FBFA,#DFECE7)] shadow-[0_45px_120px_rgba(0,0,0,.38)] [transform:rotateY(-4deg)_rotateX(1deg)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(24,176,111,.17),transparent_34%),linear-gradient(140deg,transparent_0_58%,rgba(7,70,49,.08))]" />
              <div className="absolute inset-[18%_11%_15%] grid place-items-center overflow-hidden bg-white shadow-[0_20px_45px_rgba(15,55,42,.12)]">
                <div className="jel-approved-sweep pointer-events-none absolute -left-1/3 top-[-35%] h-[170%] w-28 bg-gradient-to-r from-transparent via-[#8FF2C6]/25 to-transparent blur-xl" />
                <img src="/assets/images/jel-study-abroad-official-v2.png" alt="JEL Study Abroad" className="jel-approved-float relative z-10 w-[76%] max-h-[300px] object-contain" />
              </div>
            </div>

            <div className="jel-approved-float absolute right-0 top-[11%] w-[205px] rounded-3xl border border-white/10 bg-[#05241A]/90 p-5 shadow-[0_25px_55px_rgba(0,0,0,.3)] backdrop-blur-xl sm:w-[220px]">
              <div className="jel-approved-glow mb-4 h-3 w-3 rounded-full bg-[#F1C331] shadow-[0_0_14px_rgba(241,195,49,.65)]" />
              <div className="text-lg font-black text-white">Study globally</div>
              <div className="mt-1.5 text-sm leading-6 text-[#9DBCAE]">Build your future with a guided admissions plan.</div>
            </div>

            <div className="jel-approved-float-delay absolute bottom-[4%] left-0 w-[225px] rounded-3xl border border-white/10 bg-[#05241A]/90 p-5 shadow-[0_25px_55px_rgba(0,0,0,.3)] backdrop-blur-xl sm:left-[-3%] sm:w-[240px]">
              <div className="mb-4 h-3 w-3 rounded-full bg-[#F1C331] shadow-[0_0_14px_rgba(241,195,49,.65)]" />
              <div className="flex items-center gap-2 text-lg font-black text-white"><Bot className="h-5 w-5 text-[#8FF2C6]" /> Human + AI support</div>
              <div className="mt-1.5 text-sm leading-6 text-[#9DBCAE]">Counsellor-led guidance supported by Angela AI.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-white/[0.025]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-3 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10 xl:px-14">
          {[
            ["Planning", "Profile-first guidance"],
            ["Applications", "Structured submission support"],
            ["Visa", "Documentation preparation"],
            ["Support", "Pre-departure & ongoing help"],
          ].map(([kicker, title]) => (
            <div key={title} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8FB6A5]">{kicker}</div>
              <div className="mt-2 text-lg font-black text-white">{title}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="destinations" className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24 xl:px-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="text-xs font-black uppercase tracking-[0.18em] text-[#7FE4B2]">Destinations</div><h2 className="mt-3 max-w-[760px] text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Explore the world with a clearer plan.</h2></div>
          <p className="max-w-[620px] text-sm leading-7 text-[#9FC0B1] sm:text-base">Explore study destinations while keeping your counselling, application and student-support journey connected to the same JEL platform.</p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {destinations.map((country) => (
            <button key={country.name} onClick={() => exploreCountry(country.name)} className="group rounded-[22px] border border-white/[0.09] bg-white/[0.035] p-5 text-left transition hover:-translate-y-1 hover:border-[#7EF3BE]/30 hover:bg-white/[0.065]">
              <div className="text-3xl">{country.flag}</div>
              <div className="mt-4 text-sm font-black text-white">{country.name}</div>
              <div className="mt-1.5 text-xs leading-5 text-[#94B7A7]">{country.caption}</div>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-black text-[#9AF3C8]">Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></div>
            </button>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#052218]">
        <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24 xl:px-14">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="text-xs font-black uppercase tracking-[0.18em] text-[#7FE4B2]">Support</div><h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">One connected student journey.</h2></div>
            <button onClick={() => navigate("services")} className="inline-flex w-fit items-center gap-2 text-sm font-black text-[#9AF3C8]">View all services <ArrowRight className="h-4 w-4" /></button>
          </div>
          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, title, text }) => (
              <button key={title} onClick={() => navigate("services")} className="group rounded-[26px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.025))] p-7 text-left transition hover:-translate-y-1 hover:border-[#7EF3BE]/30">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#7EF3BE]/20 bg-[#7EF3BE]/10 text-[#9AF3C8]"><Icon className="h-6 w-6" /></div>
                <h3 className="mt-6 text-xl font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#9FBCAD]">{text}</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-black text-[#9AF3C8]">Learn more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24 xl:px-14">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7FE4B2]">Smart tools</div>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">Plan smarter. Keep the human connection.</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {tools.map(({ icon: Icon, title, text, tab }) => (
                <button key={title} onClick={() => navigate(tab)} className="rounded-[24px] border border-white/[0.09] bg-white/[0.04] p-6 text-left transition hover:-translate-y-1 hover:border-[#7EF3BE]/30">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#10D486]/12 text-[#8FF2C6]"><Icon className="h-5 w-5" /></div>
                  <div className="mt-5 text-lg font-black text-white">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-[#97B6A7]">{text}</div>
                  <div className="mt-5 text-xs font-black text-[#9AF3C8]">Open tool →</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-[#53E4A5]/15 bg-[radial-gradient(circle_at_70%_20%,rgba(16,212,134,.2),transparent_30%),linear-gradient(145deg,#063526,#031E15)] p-7 sm:p-9">
            <div className="absolute right-[-80px] top-[-80px] h-60 w-60 rounded-full border border-[#7EF3BE]/10" />
            <div className="absolute right-[-20px] top-[-20px] h-40 w-40 rounded-full border border-[#7EF3BE]/10" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7EF3BE]/15 bg-[#7EF3BE]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#A6F4D0]"><Bot className="h-4 w-4" /> Angela AI</div>
              <h3 className="mt-7 text-3xl font-black text-white sm:text-4xl">AI-assisted guidance,<br />connected to your JEL experience.</h3>
              <p className="mt-5 max-w-[560px] text-sm leading-7 text-[#A7C7B7]">Angela remains available as the floating AI assistant for travel and education questions, with English, বাংলা and Banglish support. Existing Angela logic is not replaced by this design.</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Study Abroad", "Universities", "Scholarships", "Visa Guidance", "Travel Support"].map((label) => <span key={label} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-[#CDE8DA]">{label}</span>)}
              </div>
              <div className="mt-8 flex items-center gap-3 text-sm font-black text-[#9AF3C8]"><Headphones className="h-5 w-5" /> Use the Angela assistant on this page</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[radial-gradient(circle_at_15%_20%,rgba(16,212,134,.12),transparent_30%),#02160F]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-24 xl:px-14">
          <div className="relative mx-auto grid min-h-[420px] w-full max-w-[520px] place-items-center [perspective:1100px]">
            <div className="absolute h-[330px] w-[330px] rounded-full border border-[#8FF2C6]/15 shadow-[0_0_90px_rgba(16,212,134,.08)]" />
            <div className="absolute h-[220px] w-[220px] rounded-full border border-dashed border-[#F1C331]/25" />
            <div className="jel-approved-float relative z-10 grid h-44 w-44 place-items-center rounded-[42px] border border-white/10 bg-[linear-gradient(145deg,rgba(143,242,198,.18),rgba(255,255,255,.04))] shadow-[0_35px_85px_rgba(0,0,0,.4)] backdrop-blur-xl [transform:rotateX(8deg)_rotateY(-9deg)]">
              <div className="absolute inset-4 rounded-[30px] border border-white/10" />
              <GraduationCap className="h-16 w-16 text-[#9AF3C8]" />
              <span className="absolute bottom-5 text-[10px] font-black uppercase tracking-[.18em] text-white/70">JEL Intake</span>
            </div>
            <div className="jel-orbit absolute grid h-14 w-14 place-items-center rounded-2xl border border-[#8FF2C6]/25 bg-[#063526] text-[#9AF3C8] shadow-xl"><Search className="h-6 w-6" /></div>
            <div className="jel-orbit-reverse absolute grid h-12 w-12 place-items-center rounded-2xl border border-[#F1C331]/25 bg-[#163A2E] text-[#F1C331] shadow-xl"><FileCheck2 className="h-5 w-5" /></div>
            <div className="absolute bottom-3 left-4 rounded-2xl border border-white/10 bg-[#062B1F]/90 p-4 shadow-2xl backdrop-blur-xl"><div className="flex items-center gap-2 text-xs font-black text-white"><Orbit className="h-4 w-4 text-[#8FF2C6]" /> Explore</div><div className="mt-1 text-[10px] text-white/50">Courses & destinations</div></div>
            <div className="absolute right-1 top-8 rounded-2xl border border-white/10 bg-[#062B1F]/90 p-4 shadow-2xl backdrop-blur-xl"><div className="flex items-center gap-2 text-xs font-black text-white"><Layers3 className="h-4 w-4 text-[#F1C331]" /> Track</div><div className="mt-1 text-[10px] text-white/50">One connected journey</div></div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7FE4B2]">Live online intake</div>
            <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Explore. Apply. Track.<br /><span className="text-[#8FF2C6]">All in one flow.</span></h2>
            <p className="mt-5 max-w-[690px] text-sm leading-7 text-[#9FC0B1] sm:text-base">Students can now discover study options, submit a structured application enquiry and then use the secure portal for profile and application tracking. Public forms remain separated from private CRM records.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Search, title: "Find options", text: "Plan by country, level, subject and budget.", tab: "finder" },
                { icon: MousePointer2, title: "Apply online", text: "Send a structured profile to JEL’s CRM intake.", tab: "apply" },
                { icon: ShieldCheck, title: "Track securely", text: "Use authenticated portal and protected records.", tab: "portal" },
              ].map(({ icon: Icon, title, text, tab }) => (
                <button key={title} onClick={() => navigate(tab)} className="group rounded-[22px] border border-white/[0.09] bg-white/[0.04] p-5 text-left transition hover:-translate-y-1 hover:border-[#8FF2C6]/35 hover:bg-white/[0.07]">
                  <Icon className="h-6 w-6 text-[#9AF3C8]" />
                  <div className="mt-5 text-sm font-black text-white">{title}</div>
                  <div className="mt-2 text-xs leading-5 text-[#8EAE9F]">{text}</div>
                  <div className="mt-4 text-[11px] font-black text-[#9AF3C8]">Open <ArrowRight className="ml-1 inline h-3.5 w-3.5 transition group-hover:translate-x-1" /></div>
                </button>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3"><button onClick={() => navigate("apply")} className="rounded-xl bg-[#ECFFF6] px-6 py-4 text-sm font-black text-[#053324]">Start application</button><button onClick={() => navigate("finder")} className="rounded-xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-black text-white">Open course finder</button></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-white/[0.08] bg-[#052A1E]">
        <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24 xl:px-14">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7FE4B2]">How it works</div>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">A structured path from ambition to action.</h2>
          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="rounded-[24px] border border-white/[0.08] bg-[#062F22] p-6">
                <div className="text-xs font-black tracking-[0.16em] text-[#F5CA36]">{step.n}</div>
                <h3 className="mt-6 text-xl font-black text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#99B7A8]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24 xl:px-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="text-xs font-black uppercase tracking-[0.18em] text-[#7FE4B2]">Education network</div><h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">Explore partner information.</h2></div>
          <button onClick={() => navigate("universities")} className="inline-flex w-fit items-center gap-2 text-sm font-black text-[#9AF3C8]">View partners <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {partners.map((partner) => <button key={partner} onClick={() => navigate("universities")} className="min-h-[96px] rounded-2xl border border-white/[0.09] bg-white/[0.04] p-4 text-center text-xs font-black text-[#DCEFE6] transition hover:-translate-y-1 hover:border-[#7EF3BE]/30">{partner}</button>)}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24 xl:px-14">
        <div className="grid grid-cols-1 gap-5 rounded-[30px] border border-white/10 bg-[linear-gradient(120deg,rgba(16,212,134,.11),rgba(255,255,255,.02))] p-6 sm:p-9 lg:grid-cols-[1.15fr_.85fr] lg:p-10">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7FE4B2]">Connected platform</div>
            <h3 className="mt-3 text-3xl font-black text-white sm:text-4xl">New frontend. Same protected JEL platform underneath.</h3>
            <p className="mt-4 max-w-[760px] text-sm leading-7 text-[#A7C4B6]">The visual experience connects to the existing student portal, counselling flow, planning tools, CRM entry point and Angela assistant. Your established backend and data structures remain the operational foundation.</p>
            <div className="mt-6 flex flex-wrap gap-2">{["Student Portal", "Counselling", "Course Finder", "Eligibility Planner", "ECTS", "Angela AI"].map((chip) => <span key={chip} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[11px] font-bold text-[#CDE8DA]">{chip}</span>)}</div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Student Portal", "Secure student workspace", "portal"],
              ["Book Counselling", "Existing lead workflow", "booking"],
              ["Course Finder", "Study planning tool", "finder"],
              ["Counselor CRM", "Authorized staff only", "admin"],
            ].map(([title, desc, tab]) => <button key={title} onClick={() => navigate(tab)} className="rounded-2xl border border-white/[0.08] bg-white/[0.055] p-5 text-left transition hover:bg-white/[0.08]"><div className="font-black text-white">{title}</div><div className="mt-1 text-xs text-[#8EAE9F]">{desc}</div></button>)}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-[#00150E]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-7 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-14">
          <div><div className="text-xs font-black uppercase tracking-[0.18em] text-[#7FE4B2]">Ready for the next step?</div><h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Build your study plan with JEL Study Abroad.</h2><p className="mt-3 max-w-[720px] text-sm leading-7 text-[#9BBBAD]">Admissions, scholarships and visas remain subject to decisions by the relevant institutions and authorities.</p></div>
          <div className="flex flex-wrap gap-3"><button onClick={() => navigate("booking")} className="inline-flex items-center gap-2 rounded-xl bg-[#ECFFF6] px-6 py-4 text-sm font-black text-[#053324]">Book free counselling <ArrowRight className="h-4 w-4" /></button><button onClick={() => navigate("contact")} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-black text-white">Contact JEL</button></div>
        </div>
      </section>
    </div>
  );
}
