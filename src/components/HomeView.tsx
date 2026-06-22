import React from "react";
import { GraduationCap, Award, Compass, Search, Globe, Shield, Star, Users, CheckCircle, HelpCircle, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { COUNTRIES, SCHOLARSHIPS, TESTIMONIALS, UNIVERSITY_PARTNERS } from "../data";

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onPreSelectCountry: (countryName: string) => void;
}

export function HomeView({ setActiveTab, onPreSelectCountry }: HomeViewProps) {
  const handleCountryExplore = (countryName: string) => {
    onPreSelectCountry(countryName);
    setActiveTab("countries");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="font-sans space-y-20 animate-in fade-in duration-300" id="jel-home-view">
      
      {/* 1. Hero Section */}
      <section className="relative bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-12 border border-slate-150/80 shadow-md text-slate-800 min-h-[500px] flex items-center overflow-hidden mx-2 md:mx-6" id="home-hero">
        {/* Abstract design nodes */}
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-[#00AEEF]/5 rounded-full"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#F5A623]/5 rounded-full"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center space-x-2 bg-[#00AEEF]/10 text-[#003366] py-1.5 px-3.5 rounded-full text-xs font-bold uppercase tracking-wider">
              🎓 Premium Student Consultancy Bangladesh
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-[#003366] leading-tight tracking-tight">
              Your Global Education <br/>
              <span className="text-[#00AEEF]">Journey Starts Here</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
              Study at the world's highest-ranking universities with objective, transparent visa processing, scholarship matches, and pre-departure briefings. Driven by Bangladesh's lead consultants, JEL Study Abroad.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setActiveTab("booking");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#003366] hover:bg-[#002244] text-white font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#003366]/20 text-center shrink-0"
                id="btn-hero-consultation"
              >
                Book Free Consultation
              </button>
              <button
                onClick={() => {
                  setActiveTab("universities");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 text-center shrink-0"
                id="btn-hero-explore-unis"
              >
                Explore Universities
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="flex items-center space-x-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <div className="flex items-center space-x-2">
                <span className="text-amber-500 font-bold">★ 4.9/5</span>
                <span>Facebook Rating</span>
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <span className="text-[#00AEEF] font-bold">100%</span>
                <span>Ethical Auditing</span>
              </div>
            </div>
          </div>

          {/* Visual graduates showcase */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto w-[340px] h-[340px]">
              {/* Circular Avatar */}
              <div className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-slate-100 bg-slate-100 group transition-all duration-300 hover:shadow-[#00AEEF]/20">
                <img
                  src="/src/assets/images/chief_consultant_1782115849762.jpg"
                  alt="Mahbub Murshed - JEL Co-Founder"
                  className="object-cover w-full h-full scale-100 group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Elegant floating caption card below/overlapping slightly at the bottom */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-100 py-2.5 px-6 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300 text-center min-w-[240px] z-20">
                <span className="text-[10px] text-[#00AEEF] font-black uppercase tracking-widest block">Co-Founder</span>
                <span className="font-display font-extrabold text-[#003366] text-sm block mt-0.5">Mahbub Murshed</span>
              </div>
            </div>

            {/* Float badge */}
            <div className="absolute -top-2 -left-2 bg-[#003366] border border-white/10 p-3.5 rounded-2xl shadow-xl hover:scale-105 transition-transform z-10">
              <span className="text-2xl font-display font-black text-[#00AEEF] block">50+</span>
              <span className="text-[9px] text-white font-bold uppercase tracking-wider">Uni Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why Choose JEL Study Abroad (6 Cards) */}
      <section className="max-w-7xl mx-auto px-6" id="why-choose-us">
        <div className="text-center space-y-2 max-w-2xl mx-auto mb-12">
          <span className="text-xs text-[#00AEEF] font-black uppercase tracking-wider block">Core Expertise</span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-[#003366]">Why Choose JEL Study Abroad?</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-normal">
            We reject generalities. Every student profile receives complete personalized files auditing, financial counseling, and genuine mock tutoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Admission Guidance",
              desc: "Get fast conditional and unconditional offer letter processing from Tier-1 and Group of 8 world colleges.",
              icon: GraduationCap,
              color: "text-blue-600 bg-blue-50"
            },
            {
              title: "Global Scholarships Matching",
              desc: "Save up to 50% tuition fees. Our draftsmen structure compelling statement essays that maximize your funding.",
              icon: Award,
              color: "text-amber-600 bg-amber-50"
            },
            {
              title: "Embassy Visa File Preparation",
              desc: "Navigate strict visa compliance indices. We double-audit financial files and tax declarations meticulously.",
              icon: Compass,
              color: "text-[#00AEEF] bg-sky-50"
            },
            {
              title: "Language Test Preparations",
              desc: "Specialized diagnostics guides and resources for IELTS, PTE Academic, OIETC, and language transfers.",
              icon: BookOpen,
              color: "text-purple-600 bg-purple-50"
            },
            {
              title: "Pre & Post Arrival Handholding",
              desc: "Orientation briefs, affordable student accommodation connections, airport pick-up grids, and peer guides.",
              icon: Globe,
              color: "text-emerald-600 bg-emerald-50"
            },
            {
              title: "Professional Career Auditing",
              desc: "Strategic mapping matching post-study work routes, global jobs, and settlement pathways.",
              icon: Shield,
              color: "text-rose-600 bg-rose-50"
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#003366] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-xl inline-block ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-medium text-slate-900 group-hover:text-[#003366] transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[#003366] font-bold text-xs flex items-center space-x-1 hover:text-[#00AEEF]">
                <span>Discover process</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Success Statistics (Animated counters layout) */}
      <section className="bg-slate-50 py-12 px-6 rounded-3xl mx-2 md:mx-6 border border-slate-100" id="success-stats">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "5000+", label: "Successful Consultations", desc: "Since 2018" },
            { value: "1000+", label: "Visa Successes", desc: "98% Success Ratio" },
            { value: "50+", label: "University Partners", desc: "Top Ranked globally" },
            { value: "10+", label: "Destination Countries", desc: "Global outreach" }
          ].map((stat, i) => (
            <div key={i} className="space-y-1 select-none">
              <span className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-[#003366] block">
                {stat.value}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide leading-tight">
                {stat.label}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Partner Universities Ticker Showcase */}
      <section className="overflow-hidden space-y-6" id="university-partners-ticker">
        <div className="text-center space-y-1">
          <span className="text-xs text-[#00AEEF] font-bold uppercase tracking-wider block">Global Network</span>
          <h2 className="text-xl md:text-2xl font-display font-black text-[#003366]">JEL Elite Partner Universities</h2>
          <p className="text-xs text-slate-500">Over 50+ affiliated universities in 10 countries and 1,000+ courses</p>
        </div>

        {/* Scrolling list */}
        <div className="relative bg-white border-y border-slate-100 py-6 overflow-hidden flex items-center">
          <div className="flex space-x-8 scrolling-ticker shrink-0">
            {/* Output partner universities twice for infinite horizontal scroll */}
            {[...UNIVERSITY_PARTNERS, ...UNIVERSITY_PARTNERS, ...UNIVERSITY_PARTNERS].map((uni, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-100/50 py-3 px-6 rounded-xl flex items-center space-x-3 text-xs font-bold text-slate-700 whitespace-nowrap shadow-sm hover:border-[#003366] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center font-mono text-[10px]">
                  {uni.logoLetter}
                </div>
                <div>
                  <p className="text-slate-800 text-[11px] font-bold leading-none">{uni.name}</p>
                  <p className="text-[9px] text-[#00AEEF] font-mono leading-none mt-1">{uni.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Study Destinations (Interactive Country Cards) */}
      <section className="max-w-7xl mx-auto px-6" id="home-destinations">
        <div className="text-center space-y-2 max-w-2xl mx-auto mb-12">
          <span className="text-[#00AEEF] text-xs font-bold uppercase tracking-wider block">Where to study</span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-[#003366]">Select Your Dream Study Destination</h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Discover tailored tuition brackets, stay-back work visas, and postgraduate slots for each elite nation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COUNTRIES.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCountryExplore(c.name)}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#003366] transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl leading-none">{c.flag}</span>
                    <h3 className="font-display font-bold text-slate-900 text-lg sm:text-xl leading-tight">{c.name}</h3>
                  </div>
                  <span className="text-[10px] bg-[#00AEEF]/20 text-[#003366] px-2 py-0.5 rounded font-mono font-medium">QS Friendly</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">{c.description}</p>
                
                <div className="space-y-1.5 pt-3 border-t border-slate-50 text-xs text-slate-700">
                  <p>💰 <span className="font-bold text-[#003366]">Est. Tuition:</span> {c.tuitionRange}</p>
                  <p>💼 <span className="font-bold text-[#003366]">Stay-Back Visa:</span> {c.workOpportunities}</p>
                </div>
              </div>
              <div className="bg-slate-50 py-3 px-6 text-[#003366] font-bold text-xs flex items-center justify-between">
                <span>View affiliated courses</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Scholar opportunities highlights */}
      <section className="bg-[#003366] text-white py-16 px-6 md:px-12 rounded-3xl mx-2 md:mx-6 relative overflow-hidden" id="scholarships-highlight">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#00AEEF] opacity-10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs bg-yellow-400 text-slate-900 font-bold px-3 py-1 rounded uppercase tracking-wider">Scholarships</span>
            <h2 className="text-2xl md:text-3xl font-display font-black leading-tight text-white">Full & Partial Funding Matches</h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Why pay maximum fees? There are thousands of regional and university fellowships available to South Asian students. Explore deadlines and apply through JEL admissions office.
            </p>
            <button
              onClick={() => {
                setActiveTab("scholarships");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-white text-[#003366] font-bold text-xs py-3 px-6 rounded-lg uppercase tracking-wider hover:bg-[#00AEEF] hover:text-white transition-all inline-block shadow-md"
            >
              Browse Active Scholarships
            </button>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCHOLARSHIPS.slice(0, 2).map((sch) => (
              <div key={sch.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-white/20 transition-all text-left">
                <span className="text-[10px] font-mono text-yellow-400 font-bold tracking-widest block uppercase">{sch.country}</span>
                <h3 className="font-display font-semibold text-white text-sm sm:text-base leading-tight">{sch.title}</h3>
                <p className="text-[#00AEEF] text-xs font-bold">{sch.coverage}</p>
                <div className="text-[11px] text-slate-300 leading-normal line-clamp-3">
                  <span className="font-semibold text-white">Eligibility:</span> {sch.eligibility}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Student Success Stories (Testimonials Grid) */}
      <section className="max-w-7xl mx-auto px-6" id="testimonials">
        <div className="text-center space-y-2 max-w-2xl mx-auto mb-12">
          <span className="text-[#00AEEF] text-xs font-bold uppercase tracking-wider block">Alumni Success</span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-[#003366]">Student Success Stories</h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Read real feedback from students from Dhaka under counselor guidelines, now flourishing in global research and corporate fields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">"{t.review}"</p>
              </div>

              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-50">
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover shadow-inner"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <h4 className="font-display font-bold text-slate-900 text-xs leading-none">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{t.course}</p>
                  <p className="text-[10px] text-[#00AEEF] font-bold mt-0.5">{t.universityName}, {t.destinationCountry}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
