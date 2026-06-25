import React, { useState, useEffect } from "react";
import { GraduationCap, Brain, ShieldCheck, Calendar, Users, Phone, MessageSquare, Star, Mail, MapPin, Globe, Menu, X, ArrowRight, Eye, ShieldAlert, Search } from "lucide-react";
import { AIChatAssistant } from "./components/AIChatAssistant";
import { SmartCourseFinder } from "./components/SmartCourseFinder";
import { EligibilityChecker } from "./components/EligibilityChecker";
import { AdminDashboard } from "./components/AdminDashboard";
import { ConsultationBooking } from "./components/ConsultationBooking";
import { HomeView } from "./components/HomeView";
import { AboutView, ServicesView, CountriesView, UniversitiesView, ScholarshipsView, BlogView, ContactView } from "./components/InfoViews";
import { SearchModal } from "./components/SearchModal";

const jelLogo = new URL("./assets/images/jel_circular_logo_1782372441429.jpg", import.meta.url).href;

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Search parameters targeting specific sub-screens
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [uniSearchTerm, setUniSearchTerm] = useState<string>("");
  const [schSearchTerm, setSchSearchTerm] = useState<string>("");
  const [blogSearchTerm, setBlogSearchTerm] = useState<string>("");
  const [initialBlogId, setInitialBlogId] = useState<string | null>(null);

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

  const menuItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "services", label: "Services" },
    { id: "countries", label: "Destinations" },
    { id: "universities", label: "Partners" },
    { id: "scholarships", label: "Scholarships" },
    { id: "blog", label: "Guides & Blogs" },
    { id: "contact", label: "Contact Us" }
  ];

  const aiToolsItems = [
    { id: "finder", label: "Smart Course Finder", icon: Brain, desc: "AI Matcher" },
    { id: "checker", label: "GTE Visa Eligibility", icon: ShieldCheck, desc: "Visa Simulator" },
    { id: "booking", label: "Book Consultation", icon: Calendar, desc: "Free seat" },
    { id: "admin", label: "Counselors CRM", icon: Users, desc: "Lead Board" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2937] flex flex-col font-sans selection:bg-[#0B5D3B] selection:text-white" id="jel-root-app">
      
      {/* 1. Header Premium Contact Bar */}
      <header className="bg-[#0B5D3B] text-white text-[11px] py-2 relative z-40 font-medium border-b border-white/10">
        <div className="max-w-[1800px] w-[94%] xl:w-[95%] mx-auto flex flex-col md:flex-row justify-between items-center gap-2 px-4">
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
              ★ 95% Visa Success Rate
            </span>
          </div>
        </div>
      </header>

      {/* 2. Sticky Luxury Navigation Menu */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm" id="main-navigation-bar">
        <div className="max-w-[1800px] w-[94%] xl:w-[95%] mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo Brand Segment */}
          <div 
            onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex flex-col cursor-pointer group text-left select-none"
          >
            <div className="flex items-center justify-start">
              <img 
                src={jelLogo} 
                alt="JEL Study Abroad" 
                className="h-11 md:h-13 lg:h-15 w-auto object-contain transition-all duration-300 group-hover:scale-105 filter group-hover:drop-shadow-sm bg-white rounded-full p-0.5 shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[7px] md:text-[8px] tracking-[0.14em] uppercase text-[#0B5D3B] font-extrabold mt-1 text-left block group-hover:text-[#D4AF37] transition-colors duration-300">
              A BRAND OF JOURNEY EXPERT LTD.
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-6 text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all border-b-2 hover:text-[#0B5D3B] ${
                  activeTab === item.id
                    ? "text-[#0B5D3B] border-[#0B5D3B]"
                    : "text-slate-500 border-transparent hover:border-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Call to actions */}
          <div className="hidden lg:flex items-center space-x-3 border-l border-slate-100 pl-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 py-2 rounded-full text-slate-500 hover:text-[#0B5D3B] hover:bg-slate-100 transition duration-200 focus:outline-none focus:ring-1 focus:ring-[#0B5D3B] flex items-center gap-1.5 group border border-slate-200 bg-slate-50/50 pr-3.5 pl-3 cursor-pointer"
              title="Search across the app (⌘K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0B5D3B] transition duration-200" />
              <span className="text-xs font-bold text-slate-500 group-hover:text-[#0B5D3B] tracking-wider uppercase">Search...</span>
              <kbd className="hidden xl:inline-block bg-slate-255 border border-slate-200 text-slate-500 text-[9px] leading-none px-1.5 py-0.5 rounded font-mono font-bold tracking-normal">⌘K</kbd>
            </button>

            <button
              onClick={() => { setActiveTab("finder"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className={`text-xs font-bold px-4 py-2.5 rounded-full flex items-center space-x-1.5 border transition-all ${
                activeTab === "finder"
                  ? "bg-[#0B5D3B] text-white border-transparent shadow shadow-[#0B5D3B]/10"
                  : "bg-slate-50 text-[#0B5D3B] border-slate-250 hover:bg-slate-100"
              }`}
            >
              <Brain className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>AI FINDER</span>
            </button>

            <button
              onClick={() => { setActiveTab("booking"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 px-6 py-2.5 rounded-full font-extrabold shadow-lg shadow-[#D4AF37]/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Book Consultation
            </button>
          </div>

          {/* Mobile Menu Actions Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-500 hover:text-[#0B5D3B] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition shrink-0"
              title="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setActiveTab("booking"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="bg-[#0B5D3B] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg"
            >
              Book Now
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition"
              id="btn-mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile menu panel dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 p-4 space-y-4 animate-in slide-in-from-top duration-300 relative z-25">
            {/* Interactive Search Tool */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full bg-slate-50 border border-slate-200 hover:border-[#0B5D3B] rounded-xl p-3.5 flex items-center space-x-2 text-slate-500 text-left hover:bg-slate-100 cursor-pointer text-xs font-bold transition-all"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span>Search universities, scholarships, visa guides...</span>
              <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 ml-auto font-mono">GO</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-left ${
                    activeTab === item.id
                      ? "bg-slate-100 text-[#0B5D3B]"
                      : "text-slate-600 hover:bg-slate-50"
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
                    className={`p-2 rounded-xl text-left border flex flex-col justify-between h-16 ${
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
      <section className="bg-[#0B5D3B] text-white py-4 px-6 md:px-10 rounded-3xl w-[94%] xl:w-[95%] max-w-[1800px] mx-auto mt-4 mb-6 border border-white/10 shadow-lg shadow-[#0B5D3B]/10 relative overflow-hidden" id="ai-quick-tools-bar">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#D4AF37] opacity-15 blur-2xl"></div>
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
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
      <main className="flex-1 w-full max-w-[1800px] w-[94%] xl:w-[95%] mx-auto px-4 pb-20 relative z-10" id="main-content-canvas">
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
        {activeTab === "admin" && <AdminDashboard />}
      </main>

      {/* 5. Persistent Companion AI Chat widget & Floating WhatsApp */}
      <AIChatAssistant />
      
      <a 
        href="https://wa.me/8801926400400" 
        target="_blank" 
        rel="noreferrer" 
        className="fixed bottom-24 right-6 bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
        title="Chat with WhatsApp Advisor"
        id="floating-whatsapp-trigger"
      >
        <Phone className="h-6 w-6 text-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out text-xs font-bold uppercase tracking-wider pl-0 group-hover:pl-2 whitespace-nowrap">
          WhatsApp Advisor
        </span>
      </a>

      {/* 6. Premium Humanized Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-900 px-6 mt-auto rounded-t-[40px]" id="jel-footer">
        <div className="max-w-[1800px] w-[94%] xl:w-[95%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left mb-12">
          
           {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex flex-col items-start group select-none">
              <div className="bg-white p-2 md:p-2.5 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 hover:scale-105">
                <img 
                  src={jelLogo} 
                  alt="JEL Study Abroad" 
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[8px] tracking-[0.14em] uppercase text-[#0B5D3B] font-extrabold mt-3 block group-hover:text-amber-500 transition-colors duration-300">
                A BRAND OF JOURNEY EXPERT LTD.
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JEL Study Abroad is a premium division of Journey Expert Ltd (Govt Trade License: TRAD/DNCC/008823/2022). Authorised consultants helping students study in top world colleges.
            </p>
            <div className="flex items-center space-x-3 text-xs text-[#D4AF37]">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-ping"></span>
              <span className="font-mono uppercase font-bold text-[10px]">Ministry Registered</span>
            </div>
          </div>

          {/* Destination Col */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-sm tracking-wider uppercase border-l-2 border-[#D4AF37] pl-3">Study Destinations</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              {["United Kingdom", "Canada", "Australia", "United States", "Ireland", "New Zealand", "Malaysia", "Europe"].map((c) => (
                <li key={c}>
                  <button 
                    onClick={() => { handlePreSelectCountry(c); setActiveTab("countries"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="hover:text-white transition"
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
                  className="hover:text-white transition text-left"
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => { setActiveTab("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="hover:text-amber-400 transition text-left font-bold"
              >
                Counselor CRM Workspace
              </button>
            </div>
          </div>

          {/* Physical Address Col */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-sm tracking-wider uppercase border-l-2 border-[#D4AF37] pl-3">Dhaka Physical Office</h4>
            <div className="text-xs text-slate-400 space-y-3">
              <p className="leading-relaxed">
                📍 Abdul Motin Complex, 189/A, Nabisco Mor, Tejgaon, Dhaka, Bangladesh.
              </p>
              <p className="font-mono">
                📞 Hotline: +8801926400400
              </p>
              <div className="pt-2">
                <span className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Follow updates on</span>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-xs text-[#D4AF37] hover:underline flex items-center">
                  💻 JEL Official Facebook Page →
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Legal credits */}
        <div className="max-w-[1800px] w-[94%] xl:w-[95%] mx-auto border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JEL Study Abroad. All Rights Reserved. A concern of Journey Expert Ltd.</p>
          <div className="flex items-center space-x-4 font-mono font-bold text-[#D4AF37]">
            <span>LIC: TRAD/DNCC/008823/2022</span>
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

    </div>
  );
}
