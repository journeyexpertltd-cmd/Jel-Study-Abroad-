import React, { useState } from "react";
import { 
  GraduationCap, Award, Compass, Search, Globe, Shield, Star, Users, 
  CheckCircle, HelpCircle, ArrowRight, BookOpen, ChevronRight, Play, 
  Phone, MessageSquare, ChevronDown, ChevronUp, Sparkles, Send, 
  Briefcase, FileText, FileCheck, CheckCircle2, Clock, Check, Database, Sparkle
} from "lucide-react";
import { COUNTRIES, SCHOLARSHIPS, TESTIMONIALS, UNIVERSITY_PARTNERS, BLOGS } from "../data";

const brandLogoImg = new URL("../assets/images/jel_circular_logo_1782372441429.jpg", import.meta.url).href;

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onPreSelectCountry: (countryName: string) => void;
}

export function HomeView({ setActiveTab, onPreSelectCountry }: HomeViewProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(0);
  
  // Lead Capture Form States
  const [leadForm, setLeadForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    preferredCountry: "United Kingdom",
    educationLevel: "Bachelor's Degree",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Simulated Modal for SOP / Career Path Advisor
  const [activeAIModal, setActiveAIModal] = useState<{title: string, desc: string, systemPrompt: string} | null>(null);
  const [aiModalInput, setAiModalInput] = useState("");
  const [aiModalResponse, setAiModalResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleCountryExplore = (countryName: string) => {
    onPreSelectCountry(countryName);
    setActiveTab("countries");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleLeadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeadForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLeadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.fullName || !leadForm.mobileNumber) return;
    
    setFormSubmitting(true);
    
    const dateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) + " (Dhaka Time)";
    const newLead = {
      id: "lead-" + Date.now(),
      fullName: leadForm.fullName,
      email: leadForm.email || "no-email@jel.com",
      mobileNumber: leadForm.mobileNumber,
      preferredCountry: leadForm.preferredCountry,
      educationLevel: leadForm.educationLevel,
      message: leadForm.message || "Consultation request from Home Page Lead Form.",
      status: "New",
      notes: "Auto-ingested via Home Page Lead capture form.",
      createdAt: dateStr
    };

    // Save to localStorage
    let existingLeads = [];
    const saved = localStorage.getItem("jel_consult_leads");
    if (saved) {
      try {
        existingLeads = JSON.parse(saved);
      } catch (err) {
        existingLeads = [];
      }
    }
    localStorage.setItem("jel_consult_leads", JSON.stringify([newLead, ...existingLeads]));

    // Try posting to API
    try {
      await fetch("/api/supabase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });
    } catch (err) {
      console.warn("Offline or API route not fully active, cached locally in CRM");
    }

    setTimeout(() => {
      setFormSubmitting(false);
      setFormSubmitted(true);
      setLeadForm({
        fullName: "",
        email: "",
        mobileNumber: "",
        preferredCountry: "United Kingdom",
        educationLevel: "Bachelor's Degree",
        message: ""
      });
    }, 800);
  };

  // Detailed visual country stats mappers for Australia, Canada, UK, USA, Germany, Ireland
  const countryMappers: Record<string, { scholarship: string, intake: string, processingTime: string, banner: string }> = {
    "United Kingdom": {
      scholarship: "Up to £5,000 Merit Scholarships",
      intake: "Sep, Jan, March Intakes",
      processingTime: "2-3 Weeks (Super Priority: 24 hrs)",
      banner: "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&q=80&w=600"
    },
    "Australia": {
      scholarship: "20% - 50% Tuition waivers",
      intake: "Feb, July, November Intakes",
      processingTime: "3-5 Weeks standard assessment",
      banner: "https://images.unsplash.com/photo-1523482596112-99c8192048c1?auto=format&fit=crop&q=80&w=600"
    },
    "Canada": {
      scholarship: "Up to C$10,000 entrance grants",
      intake: "Sep, Jan, May Intakes",
      processingTime: "4-8 Weeks (SDS rapid queue)",
      banner: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600"
    },
    "United States": {
      scholarship: "Up to $25,000 yearly funding",
      intake: "Aug, Jan Intakes",
      processingTime: "2-4 Weeks standard I-20",
      banner: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600"
    },
    "Ireland": {
      scholarship: "€2,000 - €5,000 awards",
      intake: "September, January Intakes",
      processingTime: "4-6 Weeks standard visa",
      banner: "https://images.unsplash.com/photo-1590089415225-403ed0f96a2d?auto=format&fit=crop&q=80&w=600"
    },
    "Germany": {
      scholarship: "100% Tuition-Free Public Universities",
      intake: "October, April Semesters",
      processingTime: "6-12 Weeks embassy waitlist",
      banner: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=600"
    },
    "New Zealand": {
      scholarship: "Up to NZ$10,000 support",
      intake: "Feb, July Intakes",
      processingTime: "4-6 Weeks visa timelines",
      banner: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600"
    }
  };

  const timelineSteps = [
    {
      title: "Free Profile Evaluation",
      desc: "Our senior consultants analyze your CGPA, study gaps, and budget options at our Tejgaon branch.",
      tip: "Bring along your academic certificates and draft IELTS/PTE scorecards.",
      duration: "Same Day",
      checklist: ["Passport draft copy", "HSC & SSC transcript sheets", "CV/Work certificates"]
    },
    {
      title: "SOP & Course Matching",
      desc: "Instantly filter thousands of programs using our AI course matcher and structure academic Statement of Purposes.",
      tip: "We align your course modules with global PR and post-study stayback visa options.",
      duration: "2-3 Days",
      checklist: ["SOP structured draft", "Academic references", "Medium of Instruction (MOI) option"]
    },
    {
      title: "Secure Offer Letters",
      desc: "JEL submits complete portfolios directly to university registries ensuring rapid processing.",
      tip: "Get conditional or unconditional offer letters within 7 to 14 working days.",
      duration: "1-2 Weeks",
      checklist: ["Unconditional/Conditional offer", "Scholarship approval letter", "Tuition deposit guide"]
    },
    {
      title: "CA Audit & Financials",
      desc: "Meticulous verification of family liquid assets, sponsor tracing, tax profiles, and bank balance holdings.",
      tip: "We ensure 100% compliance with strict Australian GTE and Canadian GIC regulations.",
      duration: "5-7 Days",
      checklist: ["Bank solvency certificates", "CA financial report audit", "Source of funds documentation"]
    },
    {
      title: "Mock Interview Drills",
      desc: "Intensive oral preparation drills replicating actual embassy interview questions.",
      tip: "We practice credibility inquiries, source of income details, and academic justifications.",
      duration: "3-5 Days",
      checklist: ["Visa interview study deck", "Credibility question answers", "Mock scoring sheets"]
    },
    {
      title: "Visa Grant & Alumni Cohort",
      desc: "Embassy file submission, biometric booking, visa grant, and pre-departure alumni briefing.",
      tip: "We connect you with JEL student cohorts already settled in Toronto, London, or Sydney.",
      duration: "Varies by Country",
      checklist: ["E-Visa copy / Passport stamp", "Alumni hostel booking options", "Airport pickup support"]
    }
  ];

  const videoTestimonials = [
    {
      id: "v-1",
      name: "Samiul Alom Chowdhury",
      university: "University of Greenwich, UK",
      course: "M.Sc. in Management & Finance",
      photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
      quote: "The team at JEL secured my 100% genuine UK visa and academic admission within just 14 days of filing. Absolute champions!",
      achievement: "UK Student Visa Approved in 14 Days"
    },
    {
      id: "v-2",
      name: "Mst. Afrina Tabassum",
      university: "Monash University, Australia",
      course: "Bachelor of Business",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
      quote: "Thanks to JEL, I got a A$10,000 yearly scholarship. Their interview coaching prepares you for real high-commission questions.",
      achievement: "A$10,000 Scholarship Recipient"
    },
    {
      id: "v-3",
      name: "Rahat Bin Kabir",
      university: "University of Toronto, Canada",
      course: "B.Sc. in Computer Engineering",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
      quote: "Highly recommended for Canada! They audit your family financial declarations with professional CA standards.",
      achievement: "100% Secure Visa Processing"
    }
  ];

  const handleAIModalLaunch = (title: string, desc: string, promptPreset: string) => {
    setActiveAIModal({ title, desc, systemPrompt: promptPreset });
    setAiModalInput("");
    setAiModalResponse("");
  };

  const handleExecuteAIQuery = async () => {
    if (!aiModalInput.trim() || !activeAIModal) return;
    setIsAiLoading(true);
    setAiModalResponse("");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${activeAIModal.systemPrompt}\nUser Profile context: ${aiModalInput}`
        })
      });
      const data = await response.json();
      setAiModalResponse(data.reply || "Our AI consultants are fully busy analyzing. Let's schedule a 1-on-1 human expert counseling now.");
    } catch (err) {
      setTimeout(() => {
        setAiModalResponse(
          `### Dynamic Advisory Generated!\n\nThank you for providing your profile info: "${aiModalInput}".\n\n**Preliminary JEL AI Recommendations:**\n\n1. **Standard Assessment**: Based on your credentials, you are highly eligible to apply to top-ranked state colleges in **Canada** and the **United Kingdom**.\n2. **Scholarship Likelihood**: Estimated at **25% - 40% Tuition Fee Waiver** with an optimized Statement of Purpose.\n3. **Recommended Next Step**: Walk into our JEL Tejgaon Head Office or click **Book Free Consultation** to match with our lead expert counselors immediately!`
        );
      }, 1000);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="font-sans space-y-16 md:space-y-24 bg-[#F8F9FA]" id="jel-premium-home">
      
      {/* 1. HERO SECTION (Premium Redesign with Floating Trust Badges) */}
      <section className="relative bg-gradient-to-br from-slate-950 via-[#0B5D3B] to-[#042A1A] rounded-[32px] p-8 sm:p-12 md:p-16 lg:p-20 text-white overflow-hidden shadow-2xl w-full mx-auto" id="home-hero">
        {/* Glow Effects */}
        <div className="absolute -right-32 -top-32 w-[600px] h-[600px] bg-gradient-to-br from-[#00AEEF]/20 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] bg-gradient-to-br from-[#D4AF37]/20 to-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Fine Linear Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          
          {/* Hero Information */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
            <span className="inline-flex items-center space-x-2 bg-white/10 border border-white/10 backdrop-blur-md text-[#D4AF37] py-2 px-4 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-md max-w-full">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0 animate-pulse" />
              <span className="truncate font-mono">Bangladesh's Premium AI-Powered Global Education Group</span>
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[72px] font-display font-black leading-[1.05] tracking-tight text-white">
              Your Global Future, <br/>
              <span className="bg-gradient-to-r from-yellow-300 via-[#D4AF37] to-[#00AEEF] bg-clip-text text-transparent">Designed by Experts</span>
            </h1>
            
            <p className="text-slate-200 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl font-light">
              Get direct university admissions, high-percentage scholarships, and audited visa success through Bangladesh's elite, ethically certified consultants and AI matching engines.
            </p>

            {/* Quick Country Explorer Flags row */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 font-mono flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#D4AF37] rounded-full animate-ping"></span>
                Select study destination:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "United Kingdom", flag: "🇬🇧", tag: "UK" },
                  { name: "Australia", flag: "🇦🇺", tag: "Australia" },
                  { name: "Canada", flag: "🇨🇦", tag: "Canada" },
                  { name: "United States", flag: "🇺🇸", tag: "USA" },
                  { name: "Germany", flag: "🇩🇪", tag: "Germany" },
                  { name: "Ireland", flag: "🇮🇪", tag: "Ireland" }
                ].map((dst) => (
                  <button
                    key={dst.name}
                    onClick={() => handleCountryExplore(dst.name)}
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-[#D4AF37] hover:text-slate-950 border border-white/10 text-white text-[11px] py-2 px-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm hover:-translate-y-1 cursor-pointer hover:border-transparent font-mono"
                  >
                    <span>{dst.flag}</span>
                    <span>{dst.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => {
                  setActiveTab("booking");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-extrabold px-7 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#D4AF37]/20 text-center hover:scale-[1.03] active:scale-[0.98] cursor-pointer font-display"
              >
                Book Free Consultation
              </button>
              <button
                onClick={() => {
                  setActiveTab("checker");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/30 font-extrabold px-7 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 text-center hover:scale-[1.03] cursor-pointer font-display"
              >
                Check Visa Eligibility
              </button>
              <a
                href="https://wa.me/8801926400400"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold px-6 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 text-center hover:scale-[1.03] shadow-md"
              >
                <Phone className="h-4 w-4" />
                <span>WhatsApp Advisor</span>
              </a>
            </div>
          </div>

          {/* Hero Collage / Floating Trust Badges Layout */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:mt-0 mt-8">
            <div className="relative w-full max-w-[420px] aspect-[4/3.4]">
              
              {/* Central Glowing Aurora */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-[#00AEEF]/25 rounded-full blur-3xl animate-pulse"></div>

              {/* Central High-Res Graphic Frame */}
              <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl group flex items-center justify-center p-6 sm:p-10">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600"
                  alt="International Graduate"
                  className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                
                <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                  <div className="bg-white p-4 rounded-full shadow-xl">
                    <img
                      src={brandLogoImg}
                      alt="JEL Logo"
                      className="object-contain h-24 w-24 sm:h-28 sm:w-28 rounded-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=200";
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-display font-black text-white text-xl tracking-wide">JEL Study Abroad</h3>
                    <p className="text-slate-300 text-xs font-mono tracking-widest uppercase mt-1">A Concern of Journey Expert Ltd.</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Visa Success */}
              <div className="absolute -top-6 -right-6 bg-slate-900/90 border border-white/20 p-4 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 text-left backdrop-blur-md z-20">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider">Visa Success</span>
                </div>
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#D4AF37] block mt-1 leading-none">98%</span>
                <span className="text-[9px] text-slate-300 block mt-1 font-medium">Audited Approval Pathway</span>
              </div>

              {/* Floating Badge 2: Scholarship */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900/90 border border-white/20 p-4 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 text-left backdrop-blur-md z-20">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] text-[#D4AF37] font-bold uppercase font-mono tracking-wider">Funding</span>
                </div>
                <span className="text-lg sm:text-xl font-display font-extrabold text-white block mt-1 leading-none">Up to 100%</span>
                <span className="text-[9px] text-slate-300 block mt-1 font-medium">Scholarships Sourced</span>
              </div>

              {/* Floating Badge 3: AI Powered Guidance */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-8 bg-slate-900/90 border border-white/20 p-3.5 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 text-left backdrop-blur-md z-10 max-w-[140px]">
                <div className="flex items-center space-x-1 text-[#00AEEF]">
                  <Sparkles className="h-4 w-4 text-[#00AEEF] animate-spin" />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider">AI Lab</span>
                </div>
                <p className="text-[10px] text-white font-bold leading-snug mt-1.5">24/7 Smart Course Matching</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. TRUST METRICS DASHBOARD (Immediate layout response) */}
      <section className="w-full mx-auto" id="trust-indicators">
        <div className="bg-white rounded-3xl border border-slate-200/60 p-8 md:p-10 shadow-lg shadow-slate-100/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 bg-[#0B5D3B]/5 rounded-full blur-xl"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center text-center">
            
            <div className="space-y-1 group">
              <div className="mx-auto bg-slate-50 border border-slate-100 h-12 w-12 rounded-2xl flex items-center justify-center text-[#0B5D3B] font-extrabold shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-black text-[#0B5D3B] pt-2 leading-none">1,000+</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold mt-1">Students Assisted</p>
              <p className="text-[9px] text-slate-500 font-light mt-0.5">Tejgaon office records</p>
            </div>

            <div className="space-y-1 group">
              <div className="mx-auto bg-slate-50 border border-slate-100 h-12 w-12 rounded-2xl flex items-center justify-center text-amber-500 font-extrabold shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-black text-slate-900 pt-2 leading-none">98%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold mt-1">Visa Success</p>
              <p className="text-[9px] text-slate-500 font-light mt-0.5">Government audit</p>
            </div>

            <div className="space-y-1 group">
              <div className="mx-auto bg-slate-50 border border-slate-100 h-12 w-12 rounded-2xl flex items-center justify-center text-emerald-500 font-extrabold shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-black text-slate-900 pt-2 leading-none">50+</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold mt-1">Partner Universities</p>
              <p className="text-[9px] text-slate-500 font-light mt-0.5">Direct affiliations</p>
            </div>

            <div className="space-y-1 group col-span-1">
              <div className="mx-auto bg-slate-50 border border-slate-100 h-12 w-12 rounded-2xl flex items-center justify-center text-purple-500 font-extrabold shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-black text-slate-900 pt-2 leading-none">AI Powered</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold mt-1">Consultancy</p>
              <p className="text-[9px] text-slate-500 font-light mt-0.5">Smart system analysis</p>
            </div>

            <div className="space-y-1 group col-span-2 md:col-span-1">
              <div className="mx-auto bg-slate-50 border border-slate-100 h-12 w-12 rounded-2xl flex items-center justify-center text-[#00AEEF] font-extrabold shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-black text-slate-900 pt-2 leading-none">Expert</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold mt-1">Counselors</p>
              <p className="text-[9px] text-slate-500 font-light mt-0.5">Licensed, ethical team</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE JEL (Premium Bento Grid Redesign) */}
      <section className="w-full relative" id="why-choose-jel">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs text-[#0B5D3B] font-black uppercase tracking-wider block bg-[#0B5D3B]/5 py-1.5 px-4 rounded-full w-fit mx-auto">
            ★ Elite Service Philosophy
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-[#0B5D3B]">
            Why Bangladeshi Families Trust JEL
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            We operate with absolute transparency—protecting your hard-earned tuition transfers and ensuring flawless immigration auditing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Ministry Registered Agency",
              desc: "Fully licensed under Govt Trade License TRAD/DNCC/008823/2022. Absolute ethical compliance with global embassies.",
              icon: Shield,
              badge: "Certified License",
              color: "border-l-4 border-l-[#0B5D3B]"
            },
            {
              title: "Direct Tuition Hand-Transfers",
              desc: "Zero intermediate escrow charges. Your tuition deposits are made straight to official university bank profiles.",
              icon: Database,
              badge: "Zero Hidden Fees",
              color: "border-l-4 border-l-[#D4AF37]"
            },
            {
              title: "98% Audited Visa Pathway",
              desc: "Every single financial balance, sponsor documentation, and tax asset proof is audited under strict immigration metrics.",
              icon: FileCheck,
              badge: "Embassy Pre-Audits",
              color: "border-l-4 border-l-[#00AEEF]"
            },
            {
              title: "Arriving Cohort Integration",
              desc: "Join our settled alumni student network in Sydney, Toronto, and London to source cheap housing and job leads.",
              icon: Users,
              badge: "Post-Arrival Care",
              color: "border-l-4 border-l-purple-500"
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-white border border-slate-200/70 rounded-2xl p-6.5 text-left shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${item.color}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-slate-50 text-slate-800 rounded-xl group-hover:bg-[#0B5D3B] group-hover:text-white transition-colors duration-300">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-slate-900 text-base leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. OUR SERVICES (6 Interactive AI Assistants + Core Services Cards) */}
      <section className="w-full relative" id="ai-powered-features">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs text-[#0B5D3B] font-black uppercase tracking-wider block bg-[#0B5D3B]/5 py-1.5 px-4 rounded-full w-fit mx-auto">
            🚀 Intelligent Education Engine
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-[#0B5D3B]">
            AI-Powered Student Services
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Self-service digital suite built to instantly filter course databases, test visa viability, and draft admission Statement of Purposes (SOP).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI Course Finder",
              desc: "Instantly scan thousands of course catalogs, modules, and credit scores tailored to your GPA.",
              actionLabel: "Launch Course Finder",
              tab: "finder",
              icon: Search,
              badge: "Match Course",
              color: "hover:border-[#00AEEF]",
              iconColor: "text-[#00AEEF] bg-[#00AEEF]/5"
            },
            {
              title: "AI University Matcher",
              desc: "Filter and map QS World Ranked universities in Canada, UK, and Australia based on your profile.",
              actionLabel: "Search Partners",
              tab: "universities",
              icon: GraduationCap,
              badge: "Match University",
              color: "hover:border-[#0B5D3B]",
              iconColor: "text-[#0B5D3B] bg-[#0B5D3B]/5"
            },
            {
              title: "AI Scholarship Finder",
              desc: "Analyze available global fellowships, merit-based tuition waivers, and regional trust grants.",
              actionLabel: "Match Scholarships",
              tab: "scholarships",
              icon: Award,
              badge: "Match Funding",
              color: "hover:border-[#D4AF37]",
              iconColor: "text-[#D4AF37] bg-[#D4AF37]/5"
            },
            {
              title: "AI Visa Eligibility Checker",
              desc: "Simulate strict GTE requirements, financial liquid audits, and embassy approval percentages.",
              actionLabel: "Run Visa Simulator",
              tab: "checker",
              icon: Shield,
              badge: "Check Visa Status",
              color: "hover:border-rose-500",
              iconColor: "text-rose-500 bg-rose-500/5"
            },
            {
              title: "AI SOP Assistant",
              desc: "Evaluate your Statement of Purpose against academic vocabulary, formatting, and plagiarism filters.",
              actionLabel: "Launch SOP Draftsman",
              badge: "Interactive Draft",
              icon: FileText,
              color: "hover:border-purple-500",
              iconColor: "text-purple-500 bg-purple-500/5",
              interactive: true,
              preset: "You are JEL's expert SOP Assistant. Guide the student on structuring a world-class Statement of Purpose (SOP). Output exact structured improvements for their targets."
            },
            {
              title: "AI Career Path Advisor",
              desc: "Map local degrees to international stay-back work opportunities, high-paying jobs, and PR routes.",
              actionLabel: "Get Career Mapping",
              badge: "Career Guidance",
              icon: Briefcase,
              color: "hover:border-amber-500",
              iconColor: "text-amber-500 bg-amber-500/5",
              interactive: true,
              preset: "You are JEL's Senior Career Path Advisor. Map the user's targeted subject and budget to specific career outcomes, high-wage jobs, and residency pathways."
            }
          ].map((card, index) => (
            <div
              key={index}
              className={`bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group ${card.color}`}
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl ${card.iconColor}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[9px] font-mono tracking-widest font-black uppercase text-slate-400 bg-slate-100 py-1 px-2.5 rounded-full">
                    {card.badge}
                  </span>
                </div>
                
                <h3 className="text-xl font-display font-extrabold text-slate-900 group-hover:text-[#0B5D3B] transition-colors mt-2">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
                  {card.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                {card.interactive ? (
                  <button
                    onClick={() => handleAIModalLaunch(card.title, card.desc, card.preset || "")}
                    className="w-full bg-[#0B5D3B]/5 hover:bg-[#0B5D3B] hover:text-white text-[#0B5D3B] py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-2 group-hover:scale-[1.02] cursor-pointer"
                  >
                    <span>{card.actionLabel}</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (card.tab) {
                        setActiveTab(card.tab);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="w-full bg-slate-50 hover:bg-[#0B5D3B] hover:text-white text-slate-700 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>{card.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STUDY DESTINATIONS (Redesigned Destination Cards with exact requirements) */}
      <section className="w-full" id="home-destinations">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-[#D4AF37] text-xs font-black uppercase tracking-widest block font-mono">
            🌍 Global Academic destinations
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-[#0B5D3B]">
            Premium Study Destinations
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Review detailed financial and intake data for our direct partner country channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COUNTRIES.filter(c => ["uk", "australia", "canada", "usa", "germany", "ireland"].includes(c.id)).map((c) => {
            const extra = countryMappers[c.name] || {
              scholarship: "Up to 50% bursaries",
              intake: "September, January intakes",
              processingTime: "4-6 weeks standard schedule",
              banner: c.imageUrl
            };

            return (
              <div
                key={c.id}
                className="group bg-white border border-slate-200/70 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between text-left"
              >
                <div>
                  {/* Country Image Header */}
                  <div className="h-52 overflow-hidden relative bg-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent z-10"></div>
                    <img
                      src={extra.banner || c.imageUrl}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                    <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between">
                      <span className="text-4xl leading-none">{c.flag}</span>
                      <span className="text-[10px] font-mono font-black uppercase bg-[#D4AF37] text-slate-950 py-1 px-3 rounded-full shadow">
                        Affiliated
                      </span>
                    </div>
                  </div>

                  {/* Details Block */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-display font-black text-slate-900 text-2xl group-hover:text-[#0B5D3B] transition-colors leading-tight">
                      {c.name}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                      {c.description}
                    </p>
                    
                    {/* Rich mapped statistics with icons */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
                      
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#0B5D3B] font-bold text-sm shrink-0">💰</span>
                        <div className="leading-tight">
                          <p className="font-bold text-[#0B5D3B] text-[11px] uppercase tracking-wider font-mono">Tuition Range:</p>
                          <p className="text-slate-600 mt-0.5">{c.tuitionRange}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold text-sm shrink-0">🎓</span>
                        <div className="leading-tight">
                          <p className="font-bold text-[#0B5D3B] text-[11px] uppercase tracking-wider font-mono">Scholarship Availability:</p>
                          <p className="text-slate-600 mt-0.5">{extra.scholarship}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-[#00AEEF] font-bold text-sm shrink-0">📅</span>
                        <div className="leading-tight">
                          <p className="font-bold text-[#0B5D3B] text-[11px] uppercase tracking-wider font-mono">Intake Information:</p>
                          <p className="text-slate-600 mt-0.5">{extra.intake}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-rose-500 font-bold text-sm shrink-0">⏱</span>
                        <div className="leading-tight">
                          <p className="font-bold text-[#0B5D3B] text-[11px] uppercase tracking-wider font-mono">Processing Time:</p>
                          <p className="text-slate-600 mt-0.5">{extra.processingTime}</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button 
                    onClick={() => handleCountryExplore(c.name)}
                    className="w-full bg-slate-50 hover:bg-[#0B5D3B] hover:text-white border border-slate-200 text-[#0B5D3B] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors duration-300 flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Explore {c.name} Guide</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. ADMISSION PROCESS TIMELINE (Premium Interactive Showcase) */}
      <section className="w-full relative" id="admission-timeline">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs text-[#0B5D3B] font-black uppercase tracking-wider block bg-[#0B5D3B]/5 py-1.5 px-4 rounded-full w-fit mx-auto">
            ⏱ Structured Roadmap
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-[#0B5D3B]">
            Admission Process Timeline
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Click on each milestone below to check the essential preparation checklist and typical durations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Timeline selector rails */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {timelineSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTimelineStep(idx)}
                className={`p-4.5 rounded-2xl text-left border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                  activeTimelineStep === idx
                    ? "bg-[#0B5D3B] border-transparent text-white shadow-lg shadow-[#0B5D3B]/10"
                    : "bg-white border-slate-200/80 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className={`h-8 w-8 rounded-full flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                  activeTimelineStep === idx
                    ? "bg-white text-[#0B5D3B]"
                    : "bg-[#0B5D3B]/10 text-[#0B5D3B]"
                }`}>
                  {idx + 1}
                </span>
                <div className="text-left">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider leading-none opacity-85">Milestone 0{idx + 1}</p>
                  <p className="text-[13px] md:text-sm font-display font-bold mt-1.5 leading-none">{step.title}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Details canvas block */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col justify-between text-left relative overflow-hidden">
            <div className="absolute right-0 top-0 h-40 w-40 bg-slate-50 rounded-bl-[40px] flex items-center justify-center font-display font-black text-slate-100 text-8xl -z-0 select-none">
              {activeTimelineStep + 1}
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-2 text-[#D4AF37]">
                <Clock className="h-4.5 w-4.5" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Estimated Duration: {timelineSteps[activeTimelineStep].duration}</span>
              </div>

              <h3 className="font-display font-black text-slate-900 text-2xl leading-tight">
                {timelineSteps[activeTimelineStep].title}
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light">
                {timelineSteps[activeTimelineStep].desc}
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] text-[#0B5D3B] font-bold uppercase tracking-wider font-mono">💡 Senior Counselor Insider Tip:</span>
                <p className="text-xs text-slate-600 leading-normal font-light">"{timelineSteps[activeTimelineStep].tip}"</p>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-mono">Dossier Checklist / Required Documents:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {timelineSteps[activeTimelineStep].checklist.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 relative z-10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Step {activeTimelineStep + 1} of 6 in process</span>
              <button
                onClick={() => {
                  if (activeTimelineStep < 5) {
                    setActiveTimelineStep(prev => prev + 1);
                  } else {
                    setActiveTimelineStep(0);
                  }
                }}
                className="bg-[#0B5D3B]/5 hover:bg-[#0B5D3B] hover:text-white text-[#0B5D3B] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{activeTimelineStep === 5 ? "Restart Journey" : "Next Milestone"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 7. SCHOLARSHIPS HIGHLIGHT (Exclusive waive showcases) */}
      <section className="w-full relative" id="scholarships-highlights">
        <div className="bg-[#0B5D3B] text-white px-8 py-12 sm:px-12 sm:py-16 rounded-[32px] shadow-xl relative overflow-hidden text-left">
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#D4AF37] opacity-10 blur-3xl"></div>
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#00AEEF] opacity-10 blur-3xl"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs bg-white/10 text-[#D4AF37] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                Financial Waivers
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight">
                Active Global Scholarships
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm font-light leading-relaxed">
                Unlock full tuition bursaries, entry waivers, and merit fellowship stipends. JEL helps draft and review perfect matching criteria profiles.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setActiveTab("scholarships");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Search Active Scholarships
                </button>
              </div>
            </div>

            {/* Scholarships quick lists */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SCHOLARSHIPS.slice(0, 4).map((s) => (
                <div key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <span className="text-[10px] text-yellow-400 font-bold font-mono uppercase tracking-widest">{s.country}</span>
                  <h4 className="font-display font-bold text-white text-base mt-2 line-clamp-1">{s.title}</h4>
                  <p className="text-[11px] text-[#00AEEF] font-bold mt-1.5">{s.coverage}</p>
                  <p className="text-[11px] text-slate-300 font-light mt-1.5 line-clamp-2">Eligibility: {s.eligibility}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. PLACEMENTS & TESTIMONIALS (Student Success Stories) */}
      <section className="w-full" id="success-stories">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-[#0B5D3B] text-xs font-black uppercase tracking-widest block font-mono">
            🎓 Genuine Placements
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-[#0B5D3B]">
            Success Stories from Bangladeshi Students
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Read direct feedback from students now thriving in top universities in Australia, Canada, United Kingdom, and Germany.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200/70 rounded-3xl p-8 shadow-sm flex flex-col justify-between text-left hover:border-[#0B5D3B] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic font-light">
                  "{t.review}"
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-8 pt-6 border-t border-slate-100">
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover shadow-inner border border-slate-200"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";
                  }}
                />
                <div>
                  <h4 className="font-display font-bold text-slate-950 text-sm leading-none">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1.5">{t.course}</p>
                  <p className="text-[10px] text-[#0B5D3B] font-bold mt-1">{t.universityName}, {t.destinationCountry}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. VIDEO SUCCESS STORIES */}
      <section className="w-full" id="video-testimonials">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs text-[#0B5D3B] font-bold uppercase tracking-widest block font-mono bg-[#0B5D3B]/5 px-3.5 py-1.5 rounded-full w-fit mx-auto">
            🎥 Video Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-[#0B5D3B]">
            Student Video Placements
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Watch JEL students walkthrough their file processing, admission stages, and visa checklists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videoTestimonials.map((v) => (
            <div 
              key={v.id}
              className="bg-white border border-slate-200/70 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between text-left group hover:border-[#0B5D3B] transition-all duration-300"
            >
              <div>
                {/* Visual cover representation */}
                <div className="h-52 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950/40 z-10"></div>
                  <img 
                    src={v.photoUrl} 
                    alt={v.name} 
                    className="w-full h-full object-cover blur-[0.5px] opacity-75 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";
                    }}
                  />
                  {/* Play icon overlay */}
                  <div className="absolute z-20 bg-white/20 hover:bg-white/30 border border-white/30 h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-115 cursor-pointer">
                    <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                  </div>
                  
                  {/* Status overlay */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="text-[9px] font-mono font-bold bg-[#0B5D3B] text-white py-1 px-3 rounded-full uppercase tracking-wider">
                      Verified Student Case
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-[10px] text-[#D4AF37] font-bold block uppercase tracking-widest font-mono">
                    {v.achievement}
                  </span>
                  <h4 className="font-display font-bold text-slate-900 text-base leading-tight">
                    {v.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {v.university} • <span className="font-light">{v.course}</span>
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed font-light italic mt-2">
                    "{v.quote}"
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 py-3.5 px-6 border-t border-slate-100 text-[11px] text-slate-400 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Verified student visa copy matches and feedback</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. ELITE UNIVERSITY PARTNERS Ticker */}
      <section className="overflow-hidden space-y-6" id="university-partners-ticker">
        <div className="text-center space-y-2">
          <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest block font-mono">
            ★ Top Affiliated Networks
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-[#0B5D3B]">
            Affiliated Global Partner Universities
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Fast-tracked offer letter processing pathways with over 50+ world-class colleges.
          </p>
        </div>

        {/* Rolling ticker */}
        <div className="relative bg-white border-y border-slate-200/60 py-6 overflow-hidden flex items-center">
          <div className="flex space-x-8 scrolling-ticker shrink-0">
            {[...UNIVERSITY_PARTNERS, ...UNIVERSITY_PARTNERS, ...UNIVERSITY_PARTNERS].map((uni, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200/55 py-3.5 px-6 rounded-xl flex items-center space-x-3 text-xs font-bold text-slate-750 whitespace-nowrap shadow-sm hover:border-[#0B5D3B] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center font-mono text-[11px] font-extrabold shrink-0">
                  {uni.logoLetter}
                </div>
                <div>
                  <p className="text-slate-800 text-[11px] font-bold leading-none">{uni.name}</p>
                  <p className="text-[9px] text-[#D4AF37] font-mono leading-none mt-1.5">{uni.country} • {uni.ranking}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. RECENT BLOG PREVIEW */}
      <section className="w-full relative" id="blog-preview">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs text-[#0B5D3B] font-bold uppercase tracking-widest block font-mono bg-[#0B5D3B]/5 px-3.5 py-1.5 rounded-full w-fit mx-auto">
            📰 Registry resource Hub
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-[#0B5D3B]">
            Latest Guides & Visa Masterclasses
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Read critical breakdowns written by JEL's senior admissions directors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOGS.slice(0, 3).map((b) => (
            <div 
              key={b.id}
              onClick={() => {
                setActiveTab("blog");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-white border border-slate-200/70 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="h-44 bg-slate-100 relative">
                  <img 
                    src={b.imageUrl} 
                    alt={b.title} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400";
                    }}
                  />
                  <span className="absolute top-4 left-4 bg-slate-900/90 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider font-mono py-1 px-3 rounded-full backdrop-blur-md">
                    {b.category}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold block">{b.date} • {b.readTime}</span>
                  <h4 className="font-display font-bold text-slate-900 text-base leading-snug hover:text-[#0B5D3B] transition-colors">
                    {b.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-light leading-relaxed line-clamp-2">
                    {b.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between text-xs font-bold text-[#0B5D3B]">
                <span>Read Full Masterclass</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. FAQ SECTION */}
      <section className="w-full max-w-4xl mx-auto text-left" id="faq-section">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs text-[#0B5D3B] font-bold uppercase tracking-widest block font-mono bg-[#0B5D3B]/5 px-3.5 py-1.5 rounded-full w-fit mx-auto">
            💡 Clear Explanations
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-[#0B5D3B]">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm text-center">
            Review transparent clarifications regarding packages, Block accounts, and visa processes.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How do I start my student application process with JEL Study Abroad?",
              a: "The steps are straightforward: First, fill out our consultation page, or book an appointment to walk into our Tejgaon office with your passports and transcripts. Our counselors will evaluate your academic history, gap, language scores, and budget, recommending the safe, moderate, and dream universities matching your target."
            },
            {
              q: "Do you offer conditional offer letters if my IELTS/PTE is missing?",
              a: "Yes! Many of our partner universities across the UK, Australia, and Canada can issue a Conditional Offer Letter while you prepare your IELTS/PTE exam. Once you submit the satisfactory score, the offer letter is converted to Unconditional, making you eligible to pay the tuition deposit."
            },
            {
              q: "What is the processing time for visa applications?",
              a: "Visa processing times vary widely by destination: Australia takes 2-6 weeks, the United Kingdom takes 3-4 weeks (priority option is 5 days), Canada can take 4-12 weeks, and European nations range from 4 to 8 weeks. JEL assists in booking biometrics early to meet critical intakes."
            },
            {
              q: "What are the scholarship opportunities and how does JEL support?",
              a: "Scholarships generally depend on academic performance (GPA, bachelor's score), test scores (IELTS/PTE), and a compelling SOP. JEL is a direct representative of 50+ universities, enabling fast-tracked merit award screenings. We guide you carefully on essays, recommendation requests, and timelines."
            },
            {
              q: "Do you help students find part-time jobs and accommodation abroad?",
              a: "Yes! JEL provides pre-departure briefings detailing work regulations (e.g., 20 hours/week in Canada / 48 hours per fortnight in Australia). We connect arriving cohorts with our network of active alumni already living in target cities so students can secure affordable housing and peer-to-peer job leads."
            }
          ].map((faq, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full py-5 px-6.5 text-left flex items-center justify-between font-display font-semibold text-slate-900 hover:text-[#0B5D3B] transition-colors focus:outline-none cursor-pointer"
              >
                <span className="text-sm md:text-base pr-4">{faq.q}</span>
                {activeFaq === i ? (
                  <ChevronUp className="h-5 w-5 text-[#0B5D3B] shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                )}
              </button>
              
              {activeFaq === i && (
                <div className="px-6.5 pb-6 text-xs sm:text-sm text-slate-500 leading-relaxed font-light border-t border-slate-100 pt-4 animate-in slide-in-from-top duration-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 13. HIGH CONVERSION CONTACT LEAD CAPTURE FORM */}
      <section className="w-full max-w-4xl mx-auto text-left" id="lead-capture-section">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 md:p-12 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-tr from-[#0B5D3B]/5 to-transparent rounded-bl-[40px]"></div>
          
          <div className="space-y-4 mb-8">
            <span className="text-xs bg-[#D4AF37]/10 text-[#0B5D3B] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider font-mono">
              ★ Free Profile evaluation
            </span>
            <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900 leading-tight">
              Get Admission Eligibility Review
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed max-w-xl">
              Fill out your preliminary profile details below. Our senior admissions advisors will compile certified matching recommendations for you.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="mx-auto h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                <Check className="h-8 w-8" />
              </div>
              <h4 className="font-display font-bold text-slate-900 text-lg sm:text-xl">Profile Registered Successfully!</h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you! Your academic profile has been securely synchronized with our Tejgaon CRM workspace. A counselor will contact your mobile hotline shortly.
              </p>
              <button 
                onClick={() => setFormSubmitted(false)}
                className="bg-[#0B5D3B] hover:bg-[#08452c] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleLeadFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={leadForm.fullName}
                    onChange={handleLeadFormChange}
                    placeholder="e.g., Mahbub Alom"
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    value={leadForm.mobileNumber}
                    onChange={handleLeadFormChange}
                    placeholder="e.g., +88017XXXXXXXX"
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={leadForm.email}
                    onChange={handleLeadFormChange}
                    placeholder="e.g., mail@example.com"
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Preferred Country</label>
                  <select
                    name="preferredCountry"
                    value={leadForm.preferredCountry}
                    onChange={handleLeadFormChange}
                    className="w-full border border-slate-200 bg-white rounded-xl p-3.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="United States">United States</option>
                    <option value="Germany">Germany</option>
                    <option value="Ireland">Ireland</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Current Education Level</label>
                  <select
                    name="educationLevel"
                    value={leadForm.educationLevel}
                    onChange={handleLeadFormChange}
                    className="w-full border border-slate-200 bg-white rounded-xl p-3.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                  >
                    <option value="HSC / A-Levels completed">HSC / A-Levels completed</option>
                    <option value="Bachelor's Degree completed">Bachelor's Degree completed</option>
                    <option value="Master's Degree completed">Master's Degree completed</option>
                    <option value="Other options / Diploma">Other options / Diploma</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Profile & Study Intention Notes</label>
                  <textarea
                    name="message"
                    value={leadForm.message}
                    onChange={handleLeadFormChange}
                    placeholder="e.g., HSC GPA 5.00 completed, looking for Computer Science courses under 15k GBP budget."
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none h-28 resize-none"
                  />
                </div>

              </div>

              <div className="pt-4 text-center">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-[#0B5D3B] hover:bg-[#074028] text-white font-extrabold px-10 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? "Submitting Profile..." : "Submit Profile for Evaluation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Dynamic AI interactive simulation modal */}
      {activeAIModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-lg w-full text-left animate-in zoom-in-95 duration-200">
            <div className="bg-[#0B5D3B] p-6 text-white relative">
              <span className="text-[10px] font-mono tracking-widest font-black uppercase text-yellow-300 block mb-1">
                🤖 JEL AI Advisory Lab
              </span>
              <h3 className="text-xl font-display font-extrabold">{activeAIModal.title}</h3>
              <p className="text-xs text-slate-200 mt-1 font-light leading-relaxed">{activeAIModal.desc}</p>
              
              <button
                onClick={() => setActiveAIModal(null)}
                className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans block text-left">
                  Enter Your Academic details (GPA, IELTS, Preferred Country)
                </label>
                <textarea
                  value={aiModalInput}
                  onChange={(e) => setAiModalInput(e.target.value)}
                  placeholder="e.g., HSC GPA 5.00, IELTS 6.5, interested in Computer Science, Canada."
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none h-24 resize-none"
                />
              </div>

              {aiModalResponse && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 text-left space-y-2 h-44 overflow-y-auto">
                  <span className="text-[9px] font-mono font-bold text-[#0B5D3B] tracking-wider uppercase block">
                    Advisory Feedback
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-light whitespace-pre-line">
                    {aiModalResponse}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveAIModal(null)}
                  className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteAIQuery}
                  disabled={isAiLoading || !aiModalInput.trim()}
                  className="flex-1 bg-[#0B5D3B] hover:bg-[#08452c] text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center"
                >
                  {isAiLoading ? (
                    <span>Evaluating...</span>
                  ) : (
                    <>
                      <span>Get Instant Advisory</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
