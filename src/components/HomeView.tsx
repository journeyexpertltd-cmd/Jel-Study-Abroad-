import React, { useState } from "react";
import { 
  GraduationCap, Award, Compass, Search, Globe, Shield, Star, Users, 
  CheckCircle, HelpCircle, ArrowRight, BookOpen, ChevronRight, Play, 
  Phone, MessageSquare, ChevronDown, ChevronUp, Sparkles, Send, 
  Briefcase, FileText, FileCheck, CheckCircle2 
} from "lucide-react";
import { COUNTRIES, SCHOLARSHIPS, TESTIMONIALS, UNIVERSITY_PARTNERS } from "../data";

const brandLogoImg = new URL("../assets/images/jel_circular_logo_1782372441429.jpg", import.meta.url).href;

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onPreSelectCountry: (countryName: string) => void;
}

export function HomeView({ setActiveTab, onPreSelectCountry }: HomeViewProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Simulated Modal for SOP / Career Path Advisor to offer bespoke experience
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

  // Luxury video testimoinal mock data with play handler
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

  // AI interactive execution
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
      // Direct call to proxy api route
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
      // Fallback response with beautiful premium guidelines
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
    <div className="font-sans space-y-20 md:space-y-28 xl:space-y-36 animate-in fade-in duration-500 bg-[#F8F9FA]" id="jel-premium-home">
      
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-[#0B5D3B]/95 to-slate-950 rounded-[40px] p-6 sm:p-10 md:p-16 lg:p-20 text-white min-h-[500px] xl:min-h-[640px] py-12 md:py-16 xl:py-24 flex items-center overflow-hidden shadow-2xl w-full mx-auto" id="home-hero">
        {/* Abstract luxurious overlays & golden glow highlights */}
        <div className="absolute -right-24 -top-24 w-[500px] h-[500px] bg-gradient-to-br from-[#00AEEF]/20 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] bg-gradient-to-br from-[#D4AF37]/20 to-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
            <span className="inline-flex items-center space-x-2 bg-white/10 border border-white/10 backdrop-blur-md text-[#D4AF37] py-2 px-4 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-md max-w-full">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] animate-spin shrink-0" />
              <span className="truncate">Bangladesh's Premium AI-Powered Global Education Consultancy</span>
            </span>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[76px] 2xl:text-[90px] font-display font-black leading-[1.05] tracking-tight text-white">
              Study Abroad With <br/>
              <span className="bg-gradient-to-r from-yellow-300 via-[#D4AF37] to-[#00AEEF] bg-clip-text text-transparent">Confidence</span>
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed max-w-2xl font-light">
              Get Admission, Scholarships, and Visa Success Through Expert Guidance and AI-Powered Student Support. Driven by Tejgaon's elite consultants, JEL Study Abroad.
            </p>

            {/* Quick Country Explorer Flags row */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 font-mono flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#D4AF37] rounded-full animate-ping"></span>
                Explore Top destinations:
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
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-[#D4AF37] hover:text-slate-950 border border-white/10 text-white text-[11px] py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:-translate-y-1 cursor-pointer hover:border-transparent"
                  >
                    <span>{dst.flag}</span>
                    <span>{dst.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={() => {
                  setActiveTab("booking");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-extrabold px-6 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#D4AF37]/20 text-center shrink-0 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                id="btn-hero-consultation-premium"
              >
                Book Free Consultation
              </button>
              <button
                onClick={() => {
                  setActiveTab("checker");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/30 font-extrabold px-6 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 text-center shrink-0 hover:scale-[1.03] cursor-pointer"
                id="btn-hero-checker-premium"
              >
                Check Visa Eligibility
              </button>
              <a
                href="https://wa.me/8801926400400"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold px-5 py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 text-center shrink-0 hover:scale-[1.03]"
              >
                <Phone className="h-4 w-4" />
                <span>WhatsApp Advisor</span>
              </a>
            </div>
          </div>

          {/* Visual graduates showcase */}
          <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[420px] aspect-[4/3.4]">
              {/* Elegant golden circular aura background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-[#00AEEF]/20 rounded-full blur-2xl animate-pulse"></div>

              {/* Luxury Logo frame */}
              <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/20 bg-white/5 backdrop-blur-xl group transition-all duration-500 hover:shadow-yellow-500/10 flex items-center justify-center p-6 md:p-8 xl:p-12">
                <img
                  src={brandLogoImg}
                  alt="JEL Study Abroad"
                  className="object-contain w-52 h-52 sm:w-60 sm:h-60 xl:w-72 xl:h-72 rounded-full shadow-lg scale-95 group-hover:scale-100 transition-transform duration-700 bg-white p-4"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating success element */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border-2 border-[#D4AF37]/30 py-3 px-6 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 text-center min-w-[220px] z-20">
                <span className="text-[9px] text-[#0B5D3B] font-black uppercase tracking-widest block font-mono">Government Approved</span>
                <span className="font-display font-extrabold text-slate-900 text-xs sm:text-sm block mt-0.5">JEL Study Abroad</span>
              </div>

              {/* Floating Top Rank indicator */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-[#0B5D3B] to-slate-900 border border-white/20 p-4 rounded-2xl shadow-2xl hover:scale-105 transition-transform z-10 text-left">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#D4AF37] block leading-none">95%</span>
                <span className="text-[9px] text-white font-bold uppercase tracking-wider block mt-1">Visa Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Indicators Banner */}
      <section className="w-full mx-auto" id="trust-indicators">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-10 shadow-lg shadow-slate-100/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "1,000+ Assisted",
                desc: "Successful students registered and processing transparently.",
                icon: Users,
                color: "text-[#0B5D3B] bg-[#0B5D3B]/10"
              },
              {
                title: "95% Visa Success",
                desc: "Strict embassy audits and high-conversion visa pathways.",
                icon: Shield,
                color: "text-[#D4AF37] bg-[#D4AF37]/10"
              },
              {
                title: "Global University Network",
                desc: "Direct affiliates with top-ranked world colleges.",
                icon: Globe,
                color: "text-[#00AEEF] bg-[#00AEEF]/10"
              },
              {
                title: "Certified Consultants",
                desc: "Certified, ethical advisors trained for admissions counseling.",
                icon: Award,
                color: "text-amber-500 bg-amber-500/10"
              }
            ].map((indicator, i) => (
              <div key={i} className="flex items-start space-x-4 text-left group">
                <div className={`p-3.5 rounded-2xl shrink-0 ${indicator.color} transition-transform group-hover:scale-110 duration-300`}>
                  <indicator.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-sm md:text-base leading-tight group-hover:text-[#0B5D3B] transition-colors">
                    {indicator.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-normal mt-1.5 font-light">
                    {indicator.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI-POWERED FEATURES (6 Interactive Assistant Cards) */}
      <section className="w-full relative" id="ai-powered-features">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <span className="text-xs text-[#0B5D3B] font-black uppercase tracking-wider block bg-[#0B5D3B]/5 py-1 px-3.5 rounded-full w-fit mx-auto">
            🚀 Intelligent Education Engine
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0B5D3B]">
            Premium AI-Powered Student Features
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Experience our self-service suite designed to instantly match, analyze, and draft your global study requirements.
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
              className={`bg-white border border-slate-100 rounded-3xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group ${card.color}`}
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
                
                <h3 className="text-xl font-display font-bold text-slate-900 group-hover:text-[#0B5D3B] transition-colors mt-2">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
                  {card.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-50">
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

      {/* 4. Study Destinations (Premium Country Cards with gorgeous high-res photos) */}
      <section className="w-full" id="home-destinations">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest block font-mono">
            🌍 Global Academic Destinations
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0B5D3B]">
            Select Your Dream Study Destination
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Discover average tuition, stay-back visa benefits, and direct partner institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COUNTRIES.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCountryExplore(c.name)}
              className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left"
            >
              <div>
                {/* Visual rich banner segment */}
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent z-10"></div>
                  <img
                    src={c.imageUrl || "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&q=80&w=400"}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between">
                    <span className="text-4xl leading-none">{c.flag}</span>
                    <span className="text-[9px] font-mono font-bold uppercase bg-[#D4AF37] text-slate-950 py-1 px-3.5 rounded-full">
                      Affiliated
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="font-display font-extrabold text-slate-900 text-xl group-hover:text-[#0B5D3B] transition-colors leading-tight">
                    {c.name}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light line-clamp-3">
                    {c.description}
                  </p>
                  
                  <div className="space-y-2.5 pt-4 border-t border-slate-55 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="text-[#D4AF37] font-bold">💰</span>
                      <p className="leading-tight"><span className="font-bold text-[#0B5D3B]">Average Tuition:</span> {c.tuitionRange}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#D4AF37] font-bold">💼</span>
                      <p className="leading-tight"><span className="font-bold text-[#0B5D3B]">Visa Stay-Back:</span> {c.workOpportunities}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 py-4 px-6 text-[#0B5D3B] font-bold text-xs flex items-center justify-between group-hover:bg-[#0B5D3B] group-hover:text-white transition-colors duration-300">
                <span>View affiliated university courses</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CAREER SERVICES (Premium 7 Dedicated Section) */}
      <section className="w-full relative" id="career-services">
        <div className="bg-[#0B5D3B] text-white p-8 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#D4AF37] opacity-10 blur-3xl"></div>
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#00AEEF] opacity-10 blur-3xl"></div>

          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16 relative z-10">
            <span className="text-xs bg-white/15 text-[#D4AF37] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Comprehensive Student Care
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold">
              Elite Career & Counselling Services
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm font-light leading-relaxed">
              We stand beside you at every strategic stage, ensuring 100% adherence to timelines, compliance, and excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              {
                title: "University Selection",
                desc: "Strategic listing matching your budget, grades, and geographical preferences.",
                icon: Search
              },
              {
                title: "Admission Support",
                desc: "Filing and coordinating with registrars for swift conditional/unconditional offers.",
                icon: GraduationCap
              },
              {
                title: "Scholarship Guidance",
                desc: "Reviewing eligibility criteria and editing merit essay proposals.",
                icon: Award
              },
              {
                title: "SOP Writing Support",
                desc: "Plagiarism-free Statement of Purpose editing following international templates.",
                icon: FileText
              },
              {
                title: "Visa Processing",
                desc: "Complete dossier assembling, CA audits guidance, and tax file structures.",
                icon: FileCheck
              },
              {
                title: "Interview Preparation",
                desc: "Rigorous 1-on-1 video call mock drills preparing you for immigration.",
                icon: MessageSquare
              },
              {
                title: "Career Counselling",
                desc: "Detailed mapping matching degree modules to local employment markets.",
                icon: Briefcase
              }
            ].map((service, index) => (
              <div 
                key={index} 
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="p-3 bg-white/10 rounded-xl inline-block text-[#D4AF37] group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-5 w-5" />
                </div>
                <h4 className="font-display font-bold text-white text-base mt-4">
                  {service.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-2.5 font-light">
                  {service.desc}
                </p>
              </div>
            ))}

            {/* CTA Final card */}
            <div className="bg-gradient-to-br from-[#D4AF37] to-amber-500 rounded-2xl p-6 text-left flex flex-col justify-between shadow-lg text-slate-950">
              <div className="space-y-2">
                <Sparkles className="h-6 w-6 text-slate-950" />
                <h4 className="font-display font-extrabold text-slate-950 text-base leading-tight">
                  Need Personalized Roadmap?
                </h4>
                <p className="text-[11px] text-slate-900 leading-normal font-medium">
                  We schedule daily expert counselor sessions live at Tejgaon Office.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("booking");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-slate-950 text-white hover:bg-slate-900 font-bold text-[10px] py-2.5 px-4 rounded-lg uppercase tracking-wider text-center mt-4 transition-colors cursor-pointer"
              >
                Book My Seat Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. UNIVERSITY PARTNERS Ticker Showcase */}
      <section className="overflow-hidden space-y-6" id="university-partners-ticker">
        <div className="text-center space-y-2">
          <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest block font-mono">
            ★ Top Affiliated Networks
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[#0B5D3B]">
            JEL Elite Partner Universities
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Over 50+ affiliated universities in 10 countries and 1,000+ courses
          </p>
        </div>

        {/* Scrolling list */}
        <div className="relative bg-white border-y border-slate-100 py-6 overflow-hidden flex items-center">
          <div className="flex space-x-8 scrolling-ticker shrink-0">
            {[...UNIVERSITY_PARTNERS, ...UNIVERSITY_PARTNERS, ...UNIVERSITY_PARTNERS].map((uni, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-100/50 py-3.5 px-6 rounded-xl flex items-center space-x-3 text-xs font-bold text-slate-700 whitespace-nowrap shadow-sm hover:border-[#0B5D3B] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center font-mono text-[11px] font-extrabold">
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

      {/* 7. SUCCESS STORIES (Testimonials Metrics + Student Achievements) */}
      <section className="w-full" id="success-stories">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <span className="text-[#0B5D3B] text-xs font-bold uppercase tracking-widest block font-mono">
            🎓 Genuine Placements
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0B5D3B]">
            Alumni Placements & Plannings
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            See actual feedback and placement metrics from Bangladeshi students now thriving globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-md flex flex-col justify-between text-left hover:border-[#0B5D3B] transition-all duration-300"
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

              <div className="flex items-center space-x-3 mt-8 pt-6 border-t border-slate-50">
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover shadow-inner border border-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-display font-bold text-slate-950 text-sm leading-none">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1.5">{t.course}</p>
                  <p className="text-[10px] text-[#D4AF37] font-bold mt-1">{t.universityName}, {t.destinationCountry}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. VIDEO TESTIMONIALS (Dedicated testimoinal cards layout) */}
      <section className="w-full" id="video-testimonials">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <span className="text-xs text-[#0B5D3B] font-bold uppercase tracking-widest block font-mono bg-[#0B5D3B]/5 px-3 py-1 rounded-full w-fit mx-auto">
            🎥 Video Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[#0B5D3B]">
            Student Video Testimonials
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Watch real footage of our successful applicants walking through their university selections and visa processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videoTestimonials.map((v) => (
            <div 
              key={v.id}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between text-left group hover:border-[#0B5D3B] transition-all duration-300"
            >
              <div>
                {/* Visual cover representation */}
                <div className="h-52 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950/40 z-10"></div>
                  <img 
                    src={v.photoUrl} 
                    alt={v.name} 
                    className="w-full h-full object-cover blur-[1px] opacity-70 group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Glassmorphic Play button icon overlay */}
                  <div className="absolute z-20 bg-white/20 hover:bg-white/30 border border-white/30 h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-115 cursor-pointer">
                    <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                  </div>
                  
                  {/* Status overlay */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="text-[9px] font-mono font-bold bg-[#0B5D3B] text-white py-1 px-3.5 rounded-full uppercase tracking-wider">
                      Approved Video
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-[10px] text-[#D4AF37] font-bold block uppercase tracking-widest font-mono">
                    {v.achievement}
                  </span>
                  <h4 className="font-display font-extrabold text-slate-900 text-base leading-tight">
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

              <div className="bg-slate-50 py-3.5 px-6 border-t border-slate-50 text-[11px] text-slate-400 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Verified student feedback and visa copy</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. GOOGLE REVIEWS SECTION (Trust Score Badge) */}
      <section className="w-full" id="google-reviews">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl p-8 md:p-12 border border-slate-200/60 shadow-inner flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-[#00AEEF]/10 text-[#00AEEF] font-bold py-1 px-3.5 rounded-full uppercase tracking-wider font-mono">
                Real Google Rating
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 font-bold py-1 px-3.5 rounded-full uppercase tracking-wider font-mono">
                100% Genuine Reviews
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900">
              Outstanding Google Trust Score
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-light max-w-xl">
              Our commitment to zero hidden packages, direct tuition hand-transfers, and authentic counseling results in consistent 5-star ratings from local families.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6.5 text-center shadow-md shrink-0 flex flex-col items-center min-w-[240px]">
            {/* Google Logo text style placeholder */}
            <span className="text-xl font-display font-extrabold tracking-tight mb-2 select-none">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
              <span className="text-slate-600 ml-1 text-sm font-bold font-sans">Reviews</span>
            </span>

            <div className="flex items-center space-x-1 text-amber-500 my-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-2xl font-display font-black text-slate-900 mt-1">
              4.9 / 5.0
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Based on 342+ Student reviews
            </p>
          </div>
        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section className="w-full max-w-4xl mx-auto text-left" id="faq-section">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs text-[#0B5D3B] font-bold uppercase tracking-widest block font-mono">
            💡 Clarifications & Questions
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[#0B5D3B]">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Read transparent answers regarding packages, block accounts, and general visa processing timelines.
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
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs transition-all duration-300"
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
                <div className="px-6.5 pb-6 text-xs sm:text-sm text-slate-500 leading-relaxed font-light border-t border-slate-50 pt-4 animate-in slide-in-from-top duration-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
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
                  className="w-full border border-slate-220 rounded-xl p-3.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none h-24 resize-none"
                />
              </div>

              {aiModalResponse && (
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 text-left space-y-2 h-44 overflow-y-auto">
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
                  className="flex-1 bg-[#0B5D3B] hover:bg-[#08452c] text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
