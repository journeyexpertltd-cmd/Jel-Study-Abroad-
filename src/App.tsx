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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-[#d61a1a] selection:text-white" id="jel-root-app">
      
      {/* 1. Header Banner Contacts */}
      <header className="bg-[#05452d] text-white text-[11px] py-2.5 px-8 flex justify-between items-center border-b border-white/10 relative z-40">
        <div className="flex items-center space-x-6">
          <span className="flex items-center gap-1.5 opacity-90">
            <MapPin className="h-3.5 w-3.5 text-[#c5a059]" /> 
            Tejgaon (Nabisco), Dhaka
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 opacity-90">
            <Mail className="h-3.5 w-3.5 text-[#c5a059]" /> 
            journeyexpertbd@gmail.com
          </span>
        </div>
        <div className="flex items-center space-x-6 font-semibold">
          <a href="tel:+8801926400400" className="hover:text-[#c5a059] transition-colors flex items-center gap-1">
            📞 Hotline: +8801926400400
          </a>
          <span className="hidden md:inline-block text-[#c5a059] font-black font-mono bg-white/10 px-2.5 py-0.5 rounded border border-white/5">
            98.2% Visa Conversion
          </span>
        </div>
      </header>

      {/* 2. Main Navigation Shell */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm" id="main-navigation-bar">
        <div className="max-w-7xl mx-auto px-8 h-20 lg:h-24 flex items-center justify-between">
          
          {/* Logo Brand Segment */}
          <div 
            onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex flex-col cursor-pointer group text-left select-none"
          >
            <div className="flex items-center justify-start">
              <img 
                src={jelLogo} 
                alt="JEL Study Abroad" 
                className="h-11 md:h-13 lg:h-15 w-auto object-contain transition-all duration-300 group-hover:scale-105 filter group-hover:drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[7px] md:text-[8px] tracking-[0.14em] uppercase text-[#05452d] font-extrabold mt-0.5 md:mt-1 text-left block group-hover:text-amber-600 transition-colors duration-300">
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
                className={`py-6 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 hover:text-[#05452d] ${
                  activeTab === item.id
                    ? "text-[#05452d] border-[#05452d]"
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
              className="p-2 py-2 rounded-full text-slate-500 hover:text-[#05452d] hover:bg-slate-100 transition duration-200 focus:outline-none focus:ring-1 focus:ring-[#05452d] flex items-center gap-1.5 group border border-slate-200 bg-slate-50/50 pr-3.5 pl-3 cursor-pointer"
              title="Search across the app (⌘K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#05452d] transition duration-200" />
              <span className="text-xs font-bold text-slate-500 group-hover:text-[#05452d] tracking-wider uppercase">Search...</span>
              <kbd className="hidden xl:inline-block bg-slate-255 border border-slate-200 text-slate-500 text-[9px] leading-none px-1.5 py-0.5 rounded font-mono font-bold tracking-normal">⌘K</kbd>
            </button>

            <button
              onClick={() => { setActiveTab("finder"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className={`text-xs font-bold px-4 py-2.5 rounded-full flex items-center space-x-1.5 border transition-all ${
                activeTab === "finder"
                  ? "bg-[#05452d] text-white border-transparent shadow shadow-[#05452d]/10"
                  : "bg-slate-50 text-[#05452d] border-slate-250 hover:bg-slate-100"
              }`}
            >
              <Brain className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>AI FINDER</span>
            </button>

            <button
              onClick={() => { setActiveTab("booking"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="bg-[#F5A623] hover:bg-[#e0951a] text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-[#F5A623]/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-wider animate-pulse hover:animate-none"
            >
              Book Consultation
            </button>
          </div>

          {/* Mobile Menu Actions Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-500 hover:text-[#05452d] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition shrink-0"
              title="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setActiveTab("booking"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="bg-[#05452d] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg"
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
              className="w-full bg-slate-50 border border-slate-200 hover:border-[#05452d] rounded-xl p-3.5 flex items-center space-x-2 text-slate-500 text-left hover:bg-slate-100 cursor-pointer text-xs font-bold transition-all"
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
                      ? "bg-slate-100 text-[#05452d]"
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
                        ? "bg-[#c5a059]/15 border-[#c5a059]/40 text-[#05452d]"
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <tool.icon className="h-4 w-4 text-[#05452d]" />
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
      <section className="bg-[#05452d] text-white py-5 px-6 md:px-12 rounded-3xl mx-2 md:mx-6 mt-6 mb-8 border border-white/10 shadow-lg shadow-[#05452d]/10 relative overflow-hidden" id="ai-quick-tools-bar">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#c5a059] opacity-15 blur-2xl"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-[#c5a059]/20 p-2.5 rounded-2xl">
              <Brain className="h-6 w-6 text-[#c5a059] animate-pulse" />
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
                    ? "bg-[#F5A623] hover:bg-[#e0951a] text-white shadow-lg shadow-[#F5A623]/25 scale-105"
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pb-20 relative z-10" id="main-content-canvas">
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

      {/* 5. Persistent Companion AI Chat widget */}
      <AIChatAssistant />

      {/* 6. Premium Humanized Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-900 px-6 mt-auto rounded-t-[40px]" id="jel-footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left mb-12">
          
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
              <span className="text-[8px] tracking-[0.14em] uppercase text-[#05452d] font-extrabold mt-3 block group-hover:text-amber-500 transition-colors duration-300">
                A BRAND OF JOURNEY EXPERT LTD.
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JEL Study Abroad is a premium division of Journey Expert Ltd (Govt Trade License: TRAD/DNCC/008823/2022). Authorised consultants helping students study in top world colleges.
            </p>
            <div className="flex items-center space-x-3 text-xs text-[#c5a059]">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-ping"></span>
              <span className="font-mono uppercase font-bold text-[10px]">Ministry Registered</span>
            </div>
          </div>

          {/* Destination Col */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-sm tracking-wider uppercase border-l-2 border-[#c5a059] pl-3">Study Destinations</h4>
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
            <h4 className="font-display font-semibold text-white text-sm tracking-wider uppercase border-l-2 border-[#c5a059] pl-3">Sitemap Links</h4>
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
            <h4 className="font-display font-semibold text-white text-sm tracking-wider uppercase border-l-2 border-[#c5a059] pl-3">Dhaka Physical Office</h4>
            <div className="text-xs text-slate-400 space-y-3">
              <p className="leading-relaxed">
                📍 Abdul Motin Complex, 189/A, Nabisco Mor, Tejgaon, Dhaka, Bangladesh.
              </p>
              <p className="font-mono">
                📞 Hotline: +8801926400400
              </p>
              <div className="pt-2">
                <span className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Follow updates on</span>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-xs text-[#c5a059] hover:underline flex items-center">
                  💻 JEL Official Facebook Page →
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Legal credits */}
        <div className="max-w-7xl mx-auto border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JEL Study Abroad. All Rights Reserved. A concern of Journey Expert Ltd.</p>
          <div className="flex items-center space-x-4 font-mono font-bold text-[#c5a059]">
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
