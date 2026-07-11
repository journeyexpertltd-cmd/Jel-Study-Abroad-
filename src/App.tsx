import React, { useState, useEffect } from "react";
import { 
  GraduationCap, Brain, ShieldCheck, Calendar, Users, Phone, MessageSquare, 
  Star, Mail, MapPin, Globe, Menu, X, ArrowRight, Eye, ShieldAlert, Search, 
  Check, Sparkles, Sun, Moon 
} from "lucide-react";
import { AIChatAssistant } from "./components/AIChatAssistant";
import { SmartCourseFinder } from "./components/SmartCourseFinder";
import { EligibilityChecker } from "./components/EligibilityChecker";
import { AdminDashboard } from "./components/AdminDashboard";
import { ConsultationBooking } from "./components/ConsultationBooking";
import { HomeView } from "./components/HomeView";
import { AboutView, ServicesView, CountriesView, UniversitiesView, ScholarshipsView, BlogView, ContactView } from "./components/InfoViews";
import { SearchModal } from "./components/SearchModal";
import { StudentPortal } from "./components/StudentPortal";
import { MultiAgentFranchise } from "./components/MultiAgentFranchise";
import { UniversityIntegration } from "./components/UniversityIntegration";
import { ScholarshipMatching } from "./components/ScholarshipMatching";
import { AdmissionPrediction } from "./components/AdmissionPrediction";
import { GlobalMarketplace } from "./components/GlobalMarketplace";

const jelLogo = new URL("./assets/images/jel_logo_transparent_1782275669330.jpg", import.meta.url).href;

export default function App() {
  // Helper to parse clean paths or activeTab query param
  const getInitialTab = (): string => {
    const path = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("activeTab") || params.get("tab");

    const validTabs: Record<string, string> = {
      "": "home",
      "home": "home",
      "about": "about",
      "services": "services",
      "countries": "countries",
      "destinations": "countries",
      "universities": "universities",
      "partners": "universities",
      "scholarships": "scholarships",
      "blog": "blog",
      "blogs": "blog",
      "portal": "portal",
      "student-portal": "portal",
      "contact": "contact",
      "finder": "finder",
      "checker": "checker",
      "booking": "booking",
      "admin": "admin",
      "franchise": "franchise",
      "partnersync": "partnerSync",
      "scholarshipmatcher": "scholarshipMatcher",
      "admissionpredictor": "admissionPredictor",
      "globalmarketplace": "globalMarketplace"
    };

    if (tabParam && validTabs[tabParam.toLowerCase()]) {
      return validTabs[tabParam.toLowerCase()];
    }
    if (path && validTabs[path]) {
      return validTabs[path];
    }
    return "home";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("jel_theme") === "dark" || 
      (!localStorage.getItem("jel_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Sync dark class with document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("jel_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("jel_theme", "light");
    }
  }, [darkMode]);
  
  // Sync activeTab to clean URL pathnames
  useEffect(() => {
    const pathMap: Record<string, string> = {
      "home": "/",
      "about": "/about",
      "services": "/services",
      "countries": "/destinations",
      "universities": "/partners",
      "scholarships": "/scholarships",
      "blog": "/blogs",
      "portal": "/student-portal",
      "contact": "/contact",
      "finder": "/finder",
      "checker": "/checker",
      "booking": "/booking",
      "admin": "/admin",
      "franchise": "/franchise",
      "partnerSync": "/partnersync",
      "scholarshipMatcher": "/scholarshipmatcher",
      "admissionPredictor": "/admissionpredictor",
      "globalMarketplace": "/globalmarketplace"
    };

    const currentPath = window.location.pathname;
    const targetPath = pathMap[activeTab] || "/";

    if (currentPath !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  }, [activeTab]);

  // Handle popstate for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  
  // Search parameters targeting specific sub-screens
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [uniSearchTerm, setUniSearchTerm] = useState<string>("");
  const [schSearchTerm, setSchSearchTerm] = useState<string>("");
  const [blogSearchTerm, setBlogSearchTerm] = useState<string>("");
  const [initialBlogId, setInitialBlogId] = useState<string | null>(null);

  // Conversion Features States
  const [showExitIntent, setShowExitIntent] = useState<boolean>(false);
  const [exitForm, setExitForm] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "United Kingdom"
  });
  const [exitSubmitted, setExitSubmitted] = useState<boolean>(false);
  const [exitSubmitting, setExitSubmitting] = useState<boolean>(false);

  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  const [newsletterJoined, setNewsletterJoined] = useState<boolean>(false);

  // Global Ctrl+K / Cmd+K listener to trigger search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // SEO Schema.org Ingestion
  useEffect(() => {
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "JEL Study Abroad",
        "url": "https://jelstudyabroad.com",
        "logo": "https://jelstudyabroad.com/assets/images/jel_circular_logo_1782372441429.jpg",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+8801926400400",
          "contactType": "customer service",
          "areaServed": "BD",
          "availableLanguage": ["en", "bn"]
        },
        "sameAs": [
          "https://facebook.com"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I start my student application process with JEL Study Abroad?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The steps are straightforward: First, fill out our consultation page, or book an appointment to walk into our Tejgaon office with your passports and transcripts. Our counselors will evaluate your academic history, gap, language scores, and budget, recommending the safe, moderate, and dream universities matching your target."
            }
          },
          {
            "@type": "Question",
            "name": "Do you offer conditional offer letters if my IELTS/PTE is missing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Many of our partner universities across the UK, Australia, and Canada can issue a Conditional Offer Letter while you prepare your IELTS/PTE exam. Once you submit the satisfactory score, the offer letter is converted to Unconditional, making you eligible to pay the tuition deposit."
            }
          }
        ]
      }
    ];

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(schemas);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Exit Intent Event Listener removed to avoid annoying popups on load. Handled strictly via Floating button click.
  
  // Transfers between AI finder, country explore, and booking forms
  const [courseFinderUni, setCourseFinderUni] = useState<string>("");
  const [courseFinderCountry, setCourseFinderCountry] = useState<string>("");
  const [exploreCountryName, setExploreCountryName] = useState<string>("United Kingdom");

  const handlePreSelectCourse = (uniName: string, country: string) => {
    setCourseFinderUni(uniName);
    setCourseFinderCountry(country);
    setActiveTab("booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreSelectCountry = (countryName: string) => {
    setExploreCountryName(countryName);
  };

  const handleClearPreSelected = () => {
    setCourseFinderUni("");
    setCourseFinderCountry("");
  };

  const handleExitFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitForm.name || !exitForm.phone) return;
    
    setExitSubmitting(true);
    
    const dateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) + " (Dhaka Time)";
    const newLead = {
      id: "lead-exit-" + Date.now(),
      fullName: exitForm.name,
      email: exitForm.email || "no-email@jel.com",
      mobileNumber: exitForm.phone,
      preferredCountry: exitForm.destination,
      educationLevel: "Bachelor's Degree",
      message: "Lead acquired via study success pack exit-intent popup.",
      status: "New",
      notes: "Acquired through study blueprint success exit capture.",
      createdAt: dateStr
    };

    // Save lead locally
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

    // Attempt sync
    try {
      await fetch("/api/supabase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });
    } catch (err) {
      console.warn("Cached locally, offline or backend not fully live.");
    }

    setTimeout(() => {
      setExitSubmitting(false);
      setExitSubmitted(true);
      setExitForm({ name: "", email: "", phone: "", destination: "United Kingdom" });
    }, 800);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterJoined(true);
    setNewsletterEmail("");
    setTimeout(() => {
      setNewsletterJoined(false);
    }, 4000);
  };

  const menuItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "services", label: "Services" },
    { id: "countries", label: "Destinations" },
    { id: "universities", label: "Partners" },
    { id: "scholarships", label: "Scholarships" },
    { id: "blog", label: "Guides & Blogs" },
    { id: "portal", label: "Student Portal" },
    { id: "contact", label: "Contact Us" }
  ];

  const aiToolsItems = [
    { id: "finder", label: "Smart Course Finder", icon: Brain, desc: "AI Matcher" },
    { id: "checker", label: "GTE Visa Eligibility", icon: ShieldCheck, desc: "Visa Simulator" },
    { id: "booking", label: "Book Consultation", icon: Calendar, desc: "Free seat" },
    { id: "admin", label: "Counselors CRM", icon: Users, desc: "Lead Board" },
    { id: "franchise", label: "Franchise Hub", icon: Users, desc: "Multi-Agent" },
    { id: "partnerSync", label: "Partner API Sync", icon: Globe, desc: "Uni Indexer" },
    { id: "scholarshipMatcher", label: "Scholarship Matcher", icon: Sparkles, desc: "Funding AI" },
    { id: "admissionPredictor", label: "Admission Predictor", icon: Brain, desc: "Visa Prob" },
    { id: "globalMarketplace", label: "Global Marketplace", icon: Globe, desc: "B2B Market" }
  ];

  return (
    <div className={`min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 flex flex-col font-sans selection:bg-[#0B5D3B] selection:text-white ${darkMode ? "dark" : ""}`} id="jel-root-app">
      
      {/* 1. Header Premium Contact Bar */}
      <header className="bg-[#0B5D3B] text-white text-[11px] py-2 relative z-40 font-medium border-b border-white/10">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-2 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
            <span className="flex items-center gap-1.5 opacity-90">
              <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" /> 
              <span>Nabisco Mor, Tejgaon, Dhaka</span>
            </span>
            <span className="flex items-center gap-1.5 opacity-90">
              <Mail className="h-3.5 w-3.5 text-[#D4AF37]" /> 
              <span>journeyexpertbd@gmail.com</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6">
            <a href="tel:+8801926400400" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 opacity-95">
              📞 Call: +8801926400400
            </a>
            <a href="https://wa.me/8801926400400" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-green-400 font-bold">
              🟢 WhatsApp: +8801926400400
            </a>
            <span className="text-[#D4AF37] font-bold bg-white/10 px-2.5 py-0.5 rounded border border-white/10">
              ★ 98% Visa Success Rate
            </span>
          </div>
        </div>
      </header>

      {/* 2. Sticky Luxury Navigation Menu */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm" id="main-navigation-bar">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo Brand Segment */}
          <div 
            onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center cursor-pointer group text-left select-none animate-fade-in"
          >
            <img 
              src={jelLogo} 
              alt="JEL Study Abroad" 
              className="h-10 md:h-12 lg:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          {/* Desktop Sitemap Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`text-xs uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                  activeTab === item.id 
                    ? "text-[#0B5D3B] border-b-2 border-[#D4AF37] pb-1" 
                    : "text-slate-600 hover:text-[#0B5D3B]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile menu trigger and container */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md py-4 px-6 space-y-4 shadow-inner text-left animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-xs uppercase tracking-wider font-bold py-2 border-b border-slate-50 text-left cursor-pointer ${
                    activeTab === item.id ? "text-[#0B5D3B] font-black" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">JEL Intelligent Tools</span>
              <div className="grid grid-cols-2 gap-2">
                {aiToolsItems.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTab(tool.id);
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`p-2 rounded-xl text-left border flex flex-col justify-between h-16 cursor-pointer ${
                      activeTab === tool.id
                        ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#0B5D3B]"
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <tool.icon className="h-4 w-4 text-[#0B5D3B]" />
                    <div>
                      <p className="text-[10px] font-mono leading-none text-slate-400">{tool.desc}</p>
                      <p className="text-[11px] font-bold mt-1 leading-none">{tool.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* 3. Global AI & CRM Floating Bar Actions */}
      <section className="bg-[#0B5D3B] text-white py-4 px-6 md:px-10 rounded-3xl w-full max-w-[1600px] mx-auto mt-4 mb-6 border border-white/10 shadow-lg shadow-[#0B5D3B]/10 relative overflow-hidden" id="ai-quick-tools-bar">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#D4AF37] opacity-15 blur-2xl"></div>
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-[#D4AF37]/20 p-2.5 rounded-2xl">
              <Brain className="h-6 w-6 text-[#D4AF37] animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-medium text-sm md:text-base tracking-wide text-white">Need immediate profile evaluation?</h3>
              <p className="text-xs text-slate-300">Run our certified GTE assessment engines below.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {aiToolsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === item.id
                    ? "bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 shadow-lg shadow-[#D4AF37]/25 scale-105"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0 text-white" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Main Page View Render */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10" id="main-content-canvas">
        {activeTab === "home" && (
          <HomeView 
            setActiveTab={setActiveTab} 
            onPreSelectCountry={handlePreSelectCountry} 
          />
        )}
        {activeTab === "about" && <AboutView />}
        {activeTab === "services" && <ServicesView />}
        {activeTab === "countries" && (
          <CountriesView selectedCountryName={exploreCountryName} />
        )}
        {activeTab === "universities" && (
          <UniversitiesView 
            onPreSelectCourse={handlePreSelectCourse} 
            initialSearchTerm={uniSearchTerm} 
          />
        )}
        {activeTab === "scholarships" && (
          <ScholarshipsView 
            initialSearchTerm={schSearchTerm} 
          />
        )}
        {activeTab === "blog" && (
          <BlogView 
            initialSearchTerm={blogSearchTerm}
            initialBlogId={initialBlogId}
            onClearInitialBlog={() => {
              setInitialBlogId(null);
              setBlogSearchTerm("");
            }}
          />
        )}
        {activeTab === "contact" && <ContactView />}
        
        {/* Core AI matched tools */}
        {activeTab === "finder" && (
          <SmartCourseFinder onPreSelectCourse={handlePreSelectCourse} />
        )}
        {activeTab === "checker" && <EligibilityChecker />}
        {activeTab === "booking" && (
          <ConsultationBooking
            preSelectedUniversity={courseFinderUni}
            preSelectedCountry={courseFinderCountry}
            onClearPreSelected={handleClearPreSelected}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "portal" && (
          <StudentPortal setActiveTab={setActiveTab} onPreSelectCountry={handlePreSelectCountry} />
        )}
        {activeTab === "admin" && <AdminDashboard setActiveTab={setActiveTab} />}
        {activeTab === "franchise" && <MultiAgentFranchise />}
        {activeTab === "partnerSync" && <UniversityIntegration />}
        {activeTab === "scholarshipMatcher" && <ScholarshipMatching />}
        {activeTab === "admissionPredictor" && <AdmissionPrediction />}
        {activeTab === "globalMarketplace" && <GlobalMarketplace />}
      </main>

      {/* 5. Persistent Companion AI Chat widget, Sticky Book Consultation & Floating WhatsApp */}
      <AIChatAssistant />
      
      {/* Sticky Book Consultation Trigger Left */}
      {activeTab !== "booking" && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => {
              setActiveTab("booking");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-yellow-400 cursor-pointer text-xs uppercase tracking-wider font-display"
          >
            <Calendar className="h-4.5 w-4.5 text-slate-950 shrink-0" />
            <span>Book Assessment</span>
          </button>
        </div>
      )}

      {/* Floating WhatsApp Right */}
      <a 
        href="https://wa.me/8801926400400" 
        target="_blank" 
        rel="noreferrer" 
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
        title="Chat with WhatsApp Advisor"
        id="floating-whatsapp-trigger"
      >
        <Phone className="h-6 w-6 text-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out text-xs font-bold uppercase tracking-wider pl-0 group-hover:pl-2 whitespace-nowrap">
          WhatsApp Advisor
        </span>
      </a>

      {/* 6. Premium Humanized Footer */}
      <footer className="bg-slate-950 text-white pt-12 pb-8 border-t border-slate-900 px-4 sm:px-6 lg:px-8 mt-auto rounded-t-[40px]" id="jel-footer">
        <div className="max-w-[1600px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left mb-8">
          
           {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex flex-col items-start group select-none">
              <div className="bg-white px-4 py-2.5 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 hover:scale-105">
                <img 
                  src={jelLogo} 
                  alt="JEL Study Abroad" 
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JEL Study Abroad is a premium division of <strong>Journey Expert Ltd.</strong> (Govt Trade License: TRAD/DNCC/008823/2022). Incorporated under the Companies Act (Reg: C-200004/2025). Registered Travel Agency (No: 0017180) under the Ministry of Civil Aviation and Tourism, Government of Bangladesh.
            </p>
            <div className="flex items-center space-x-3 text-xs text-[#D4AF37]">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-ping"></span>
              <span className="font-mono uppercase font-bold text-[10px]">Ministry Registered Group</span>
            </div>
          </div>

          {/* Destination Col */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-sm tracking-wider uppercase border-l-2 border-[#D4AF37] pl-3">Study Destinations</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              {["United Kingdom", "Canada", "Australia", "United States", "Ireland", "Germany"].map((c) => (
                <li key={c}>
                  <button 
                    onClick={() => { handlePreSelectCountry(c); setActiveTab("countries"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Study in {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sitemap Col */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-sm tracking-wider uppercase border-l-2 border-[#D4AF37] pl-3">Sitemap Links</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => { setActiveTab("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="hover:text-amber-400 transition text-left font-bold cursor-pointer"
              >
                Counselor CRM
              </button>
            </div>
          </div>

          {/* Newsletter Signup & physical Address Col */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-sm tracking-wider uppercase border-l-2 border-[#D4AF37] pl-3">Stay Updated</h4>
            <p className="text-xs text-slate-400 leading-normal">
              Subscribe to critical intake dates, visa threshold guidelines, and custom scholarship updates directly.
            </p>

            {newsletterJoined ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-left animate-in fade-in duration-300">
                <p className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 leading-none">
                  <Check className="h-3.5 w-3.5" />
                  <span>Joined Success Catalog!</span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-1">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="bg-white/5 border border-white/10 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#D4AF37] w-full"
                />
                <button 
                  type="submit" 
                  className="bg-[#D4AF37] text-slate-950 font-bold px-4 rounded-lg hover:bg-yellow-500 transition text-xs cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}

            <div className="text-xs text-slate-400 space-y-1.5 pt-1">
              <p className="leading-relaxed font-light">📍 Abdul Motin Complex, 189/A, Nabisco Mor, Tejgaon, Dhaka, Bangladesh.</p>
              <p className="font-mono text-[10px] text-slate-500">📞 Hotline: +8801926400400</p>
            </div>
          </div>

        </div>

        {/* Footer Legal credits */}
        <div className="max-w-[1600px] w-full mx-auto border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JEL Study Abroad. All Rights Reserved. A concern of Journey Expert Ltd.</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1 font-mono font-bold text-[#D4AF37]">
            <span>LIC: TRAD/DNCC/008823/2022</span>
            <span>•</span>
            <span>INC: C-200004/2025</span>
            <span>•</span>
            <span>TA REG: 0017180</span>
            <span>•</span>
            <span>SSL Secured Connection</span>
          </div>
        </div>
      </footer>

      {/* JEL Global Registry Search Panel */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveTab={setActiveTab}
        setUniversitySearch={setUniSearchTerm}
        setScholarshipSearch={setSchSearchTerm}
        setBlogSearch={setBlogSearchTerm}
        setInitialBlogId={setInitialBlogId}
      />

      {/* 7. Conversion Rate Exit Intent Popup Modal */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 max-w-lg w-full text-left relative animate-in zoom-in-95 duration-200">
            
            {/* Header banner background */}
            <div className="bg-gradient-to-br from-[#0B5D3B] to-[#042a1a] p-8 text-white relative">
              <span className="text-[9px] font-mono tracking-widest font-black uppercase text-yellow-300 block mb-1">
                ★ Exclusive Student Opportunity Pack
              </span>
              <h3 className="text-2xl font-display font-black leading-tight">Get JEL Study Abroad Blueprint Guide for Free</h3>
              <p className="text-xs text-slate-300 mt-2 font-light leading-relaxed">
                Before you go, secure our highly requested PDF roadmap containing CA fund structures, Statement of Purpose samples, and UK/Canada biometric visa checklists.
              </p>
              
              <button
                onClick={() => setShowExitIntent(false)}
                className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-4">
              {exitSubmitted ? (
                <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="mx-auto h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-lg">Your Success Guide Is Queued!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    We have successfully added your contact to our priority catalog. Our Tejgaon office team will dispatch your free resource pack and coordinates within 2 hours!
                  </p>
                  <button
                    onClick={() => setShowExitIntent(false)}
                    className="bg-[#0B5D3B] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Return to Page
                  </button>
                </div>
              ) : (
                <form onSubmit={handleExitFormSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={exitForm.name}
                      onChange={(e) => setExitForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Ahsan Kabir"
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={exitForm.phone}
                      onChange={(e) => setExitForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g., +88017XXXXXXXX"
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Preferred Study Destination</label>
                    <select
                      value={exitForm.destination}
                      onChange={(e) => setExitForm(prev => ({ ...prev, destination: e.target.value }))}
                      className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="United States">United States</option>
                      <option value="Germany">Germany</option>
                      <option value="Ireland">Ireland</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={exitSubmitting}
                    className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-4"
                  >
                    {exitSubmitting ? (
                      <span>Reserving...</span>
                    ) : (
                      <>
                        <span>Get My Success Pack Now</span>
                        <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 8. JEL Floating Premium Conversion Bar */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3.5 z-40" id="floating-conversion-widget">
        {/* Floating "Get Free Guide" Button */}
        <button
          onClick={() => setShowExitIntent(true)}
          className="bg-gradient-to-r from-[#0B5D3B] to-[#D4AF37] hover:from-[#074028] hover:to-yellow-500 text-white font-extrabold px-5 py-3 rounded-full text-[11px] uppercase tracking-wider transition-all duration-300 shadow-2xl flex items-center space-x-2 animate-bounce cursor-pointer border border-[#D4AF37]/30"
          title="Get Free Study Abroad Guide"
        >
          <Sparkles className="h-4 w-4 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Get Free Guide</span>
        </button>

        <div className="flex flex-row md:flex-col items-center gap-2.5 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-full shadow-2xl border border-slate-100 dark:border-slate-800">
          {/* WhatsApp Action */}
          <a
            href="https://wa.me/8801926400400"
            target="_blank"
            rel="noreferrer"
            title="Chat on WhatsApp"
            className="h-11 w-11 bg-[#25D366] hover:bg-[#1ebd53] text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md"
          >
            <Phone className="h-4.5 w-4.5" />
          </a>

          {/* Messenger Action */}
          <a
            href="https://m.me/JourneyExpert"
            target="_blank"
            rel="noreferrer"
            title="Chat on Messenger"
            className="h-11 w-11 bg-[#0084FF] hover:bg-[#0076e4] text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md"
          >
            <MessageSquare className="h-4.5 w-4.5 fill-white" />
          </a>

          {/* Hotline Action */}
          <a
            href="tel:+8801926400400"
            title="Call helpline"
            className="h-11 w-11 bg-[#0B5D3B] hover:bg-[#074028] text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md"
          >
            <Phone className="h-4.5 w-4.5 fill-white" />
          </a>

          {/* Back To Top Action */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Back to Top"
            className="h-11 w-11 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md cursor-pointer"
          >
            ▲
          </button>
        </div>
      </div>

    </div>
  );
}
