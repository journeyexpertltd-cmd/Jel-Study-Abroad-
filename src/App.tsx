import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Brain,
  Calculator,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Search,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";
import { AIChatAssistant } from "./components/AIChatAssistant";
import { SearchModal } from "./components/SearchModal";

const SmartCourseFinder = lazy(() => import("./components/SmartCourseFinder").then((m) => ({ default: m.SmartCourseFinder })));
const EligibilityChecker = lazy(() => import("./components/EligibilityChecker").then((m) => ({ default: m.EligibilityChecker })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const ConsultationBooking = lazy(() => import("./components/ConsultationBooking").then((m) => ({ default: m.ConsultationBooking })));
const HomeView = lazy(() => import("./components/HomeView").then((m) => ({ default: m.HomeView })));
const AboutView = lazy(() => import("./components/InfoViews").then((m) => ({ default: m.AboutView })));
const ServicesView = lazy(() => import("./components/InfoViews").then((m) => ({ default: m.ServicesView })));
const CountriesView = lazy(() => import("./components/InfoViews").then((m) => ({ default: m.CountriesView })));
const UniversitiesView = lazy(() => import("./components/InfoViews").then((m) => ({ default: m.UniversitiesView })));
const ScholarshipsView = lazy(() => import("./components/InfoViews").then((m) => ({ default: m.ScholarshipsView })));
const BlogView = lazy(() => import("./components/InfoViews").then((m) => ({ default: m.BlogView })));
const ContactView = lazy(() => import("./components/InfoViews").then((m) => ({ default: m.ContactView })));
const StudentPortal = lazy(() => import("./components/StudentPortal").then((m) => ({ default: m.StudentPortal })));
const MultiAgentFranchise = lazy(() => import("./components/MultiAgentFranchise").then((m) => ({ default: m.MultiAgentFranchise })));
const UniversityIntegration = lazy(() => import("./components/UniversityIntegration").then((m) => ({ default: m.UniversityIntegration })));
const ScholarshipMatching = lazy(() => import("./components/ScholarshipMatching").then((m) => ({ default: m.ScholarshipMatching })));
const AdmissionPrediction = lazy(() => import("./components/AdmissionPrediction").then((m) => ({ default: m.AdmissionPrediction })));
const GlobalMarketplace = lazy(() => import("./components/GlobalMarketplace").then((m) => ({ default: m.GlobalMarketplace })));
const EctsCalculator = lazy(() => import("./components/EctsCalculator").then((m) => ({ default: m.EctsCalculator })));

const jelLogo = "/assets/images/jel-study-abroad-official-v2.png";

const verifiedSocialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/journeyexpertltd" },
  { label: "Instagram", href: "https://www.instagram.com/journeyexpertltd/" },
  { label: "WhatsApp", href: "https://wa.me/8801926400400" },
];

const tabToPath: Record<string, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  countries: "/destinations",
  universities: "/partners",
  scholarships: "/scholarships",
  blog: "/blogs",
  portal: "/student-portal",
  contact: "/contact",
  finder: "/finder",
  checker: "/checker",
  booking: "/booking",
  admin: "/admin",
  franchise: "/franchise",
  partnerSync: "/partnersync",
  scholarshipMatcher: "/scholarshipmatcher",
  admissionPredictor: "/admissionpredictor",
  globalMarketplace: "/globalmarketplace",
  ects: "/ects-calculator",
};

const pathToTab: Record<string, string> = {
  "": "home",
  home: "home",
  about: "about",
  services: "services",
  countries: "countries",
  destinations: "countries",
  universities: "universities",
  partners: "universities",
  scholarships: "scholarships",
  blog: "blog",
  blogs: "blog",
  portal: "portal",
  "student-portal": "portal",
  contact: "contact",
  finder: "finder",
  checker: "checker",
  booking: "booking",
  admin: "admin",
  franchise: "franchise",
  partnersync: "partnerSync",
  scholarshipmatcher: "scholarshipMatcher",
  admissionpredictor: "admissionPredictor",
  globalmarketplace: "globalMarketplace",
  ects: "ects",
  "ects-calculator": "ects",
  ectscalculator: "ects",
};

const getTabFromLocation = () => {
  const path = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("activeTab") || params.get("tab");
  if (requested && pathToTab[requested.toLowerCase()]) return pathToTab[requested.toLowerCase()];
  return pathToTab[path] || "home";
};

export default function App() {
  const [activeTab, setActiveTab] = useState(getTabFromLocation);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState("");
  const [scholarshipSearch, setScholarshipSearch] = useState("");
  const [blogSearch, setBlogSearch] = useState("");
  const [initialBlogId, setInitialBlogId] = useState<string | null>(null);
  const [bookingUniversity, setBookingUniversity] = useState("");
  const [bookingCountry, setBookingCountry] = useState("");
  const [exploreCountry, setExploreCountry] = useState("United Kingdom");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("jel_theme") === "dark" || (!localStorage.getItem("jel_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("jel_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const target = tabToPath[activeTab] || "/";
    if (window.location.pathname !== target) window.history.pushState(null, "", target);
  }, [activeTab]);

  useEffect(() => {
    const onPop = () => setActiveTab(getTabFromLocation());
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const metadata = useMemo<Record<string, { title: string; desc: string }>>(() => ({
    home: { title: "Study Abroad Consultancy in Bangladesh | JEL Study Abroad", desc: "JEL Study Abroad helps Bangladeshi students with university admissions, scholarships, student visa preparation and study-abroad planning." },
    about: { title: "About JEL Study Abroad | Journey Expert Ltd.", desc: "Learn about JEL Study Abroad, a brand of Journey Expert Ltd., and its student counseling and international education services in Dhaka." },
    services: { title: "Study Abroad Services | JEL Study Abroad", desc: "Explore university application, scholarship guidance, SOP support, English test guidance and student visa preparation services." },
    countries: { title: "Study Destinations | JEL Study Abroad", desc: "Explore study options for the UK, Canada, Australia, USA, Ireland, Germany and other destinations." },
    universities: { title: "University & Education Partners | JEL Study Abroad", desc: "Explore university and education partner information and study pathways available through JEL Study Abroad." },
    scholarships: { title: "Study Abroad Scholarships 2026/2027 | JEL Study Abroad", desc: "Explore available full and partial scholarship opportunities and eligibility guidance for international study." },
    blog: { title: "Study Abroad Guides & Updates | JEL Study Abroad", desc: "Read study-abroad, admissions, scholarship and student visa guidance for Bangladeshi applicants." },
    contact: { title: "Contact JEL Study Abroad | Tejgaon, Dhaka", desc: "Contact JEL Study Abroad in Tejgaon, Dhaka for admissions, scholarships and student visa counseling." },
    booking: { title: "Book a Study Abroad Consultation | JEL Study Abroad", desc: "Submit a consultation request for a JEL counselor to review your study-abroad profile." },
    finder: { title: "AI Course Finder | JEL Study Abroad", desc: "Use JEL study-planning tools to explore courses and university options by destination and profile." },
    checker: { title: "Student Visa Eligibility Planning Tool | JEL Study Abroad", desc: "Review common academic, language and financial factors used in student visa preparation." },
    portal: { title: "Student Portal | JEL Study Abroad", desc: "Secure JEL student authentication, profile, application tracking and private document workspace." },
    admin: { title: "Counselor CRM | Journey Expert Ltd.", desc: "Internal authenticated CRM workspace for authorized Journey Expert Ltd. staff." },
    franchise: { title: "Franchise & Partner Network | Journey Expert Ltd.", desc: "Information about Journey Expert Ltd. business and education partnership opportunities." },
    ects: { title: "ECTS Calculator | JEL Study Abroad", desc: "Estimate academic credit conversion to ECTS for study planning in Europe and other destinations." },
  }), []);

  useEffect(() => {
    const current = metadata[activeTab] || metadata.home;
    const canonical = `https://journeyexpertbd.com${tabToPath[activeTab] || "/"}`;
    document.title = current.title;
    const setMeta = (selector: string, attr: string, value: string) => document.querySelector(selector)?.setAttribute(attr, value);
    setMeta('meta[name="description"]', "content", current.desc);
    setMeta('meta[property="og:title"]', "content", current.title);
    setMeta('meta[property="og:description"]', "content", current.desc);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[name="twitter:title"]', "content", current.title);
    setMeta('meta[name="twitter:description"]', "content", current.desc);
    setMeta('meta[name="twitter:url"]', "content", canonical);
    setMeta('link[rel="canonical"]', "href", canonical);
    setMeta('link[rel="alternate"][hreflang="en-BD"]', "href", canonical);
    setMeta('link[rel="alternate"][hreflang="x-default"]', "href", canonical);
  }, [activeTab, metadata]);

  useEffect(() => {
    const schema = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Journey Expert Ltd.",
        url: "https://journeyexpertbd.com",
        logo: "https://journeyexpertbd.com/assets/images/jel-study-abroad-official-v2.png",
        sameAs: [
          "https://www.facebook.com/journeyexpertltd",
          "https://www.instagram.com/journeyexpertltd/",
        ],
        contactPoint: { "@type": "ContactPoint", telephone: "+8801926400400", contactType: "customer service", areaServed: "BD", availableLanguage: ["en", "bn"] },
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "JEL Study Abroad (Journey Expert Ltd.)",
        url: "https://journeyexpertbd.com",
        telephone: "+8801926400400",
        email: "journeyexpertbd@gmail.com",
        address: { "@type": "PostalAddress", streetAddress: "189/A, Abdul Motin Complex, Nabisco Mor, Tejgaon", addressLocality: "Dhaka", addressCountry: "BD" },
      },
    ];
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  const navigate = (tab: string) => {
    setActiveTab(tab);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const menuItems = [
    ["home", "Home"], ["about", "About Us"], ["services", "Services"], ["countries", "Destinations"], ["universities", "Partners"], ["scholarships", "Scholarships"], ["blog", "Guides & Blogs"], ["portal", "Student Portal"], ["contact", "Contact Us"],
  ];
  const tools = [
    { id: "finder", label: "Course Finder", icon: Brain },
    { id: "ects", label: "ECTS Calculator", icon: Calculator },
    { id: "checker", label: "Eligibility Planner", icon: ShieldCheck },
    { id: "booking", label: "Book Consultation", icon: Calendar },
    { id: "admin", label: "Counselor CRM", icon: Users },
  ];

  const renderMain = () => (
    <Suspense fallback={<div className="min-h-[45vh] flex items-center justify-center text-sm font-bold text-[#0B5D3B]">Loading JEL Study Abroad…</div>}>
      {activeTab === "home" && <HomeView setActiveTab={setActiveTab} onPreSelectCountry={(country) => { setExploreCountry(country); }} />}
      {activeTab === "about" && <AboutView />}
      {activeTab === "services" && <ServicesView />}
      {activeTab === "countries" && <CountriesView selectedCountryName={exploreCountry} />}
      {activeTab === "universities" && <UniversitiesView initialSearchTerm={uniSearch} onPreSelectCourse={(university, country) => { setBookingUniversity(university); setBookingCountry(country); navigate("booking"); }} />}
      {activeTab === "scholarships" && <ScholarshipsView initialSearchTerm={scholarshipSearch} />}
      {activeTab === "blog" && <BlogView initialSearchTerm={blogSearch} initialBlogId={initialBlogId} onClearInitialBlog={() => { setInitialBlogId(null); setBlogSearch(""); }} />}
      {activeTab === "contact" && <ContactView />}
      {activeTab === "finder" && <SmartCourseFinder onPreSelectCourse={(university, country) => { setBookingUniversity(university); setBookingCountry(country); navigate("booking"); }} />}
      {activeTab === "checker" && <EligibilityChecker />}
      {activeTab === "booking" && <ConsultationBooking preSelectedUniversity={bookingUniversity} preSelectedCountry={bookingCountry} onClearPreSelected={() => { setBookingUniversity(""); setBookingCountry(""); }} setActiveTab={setActiveTab} />}
      {activeTab === "portal" && <StudentPortal setActiveTab={setActiveTab} onPreSelectCountry={setExploreCountry} />}
      {activeTab === "admin" && <AdminDashboard setActiveTab={setActiveTab} />}
      {activeTab === "franchise" && <MultiAgentFranchise />}
      {activeTab === "partnerSync" && <UniversityIntegration />}
      {activeTab === "scholarshipMatcher" && <ScholarshipMatching />}
      {activeTab === "admissionPredictor" && <AdmissionPrediction />}
      {activeTab === "globalMarketplace" && <GlobalMarketplace />}
      {activeTab === "ects" && <EctsCalculator setActiveTab={setActiveTab} onPreSelectCountry={setExploreCountry} />}
    </Suspense>
  );

  return (
    <div className={`min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col ${darkMode ? "dark" : ""}`}>
      <header className="bg-[#0B5D3B] text-white text-[11px] py-2 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap justify-center gap-4"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#D4AF37]" /> Nabisco Mor, Tejgaon, Dhaka</span><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#D4AF37]" /> journeyexpertbd@gmail.com</span></div>
          <div className="flex flex-wrap justify-center gap-4"><a href="tel:+8801926400400" className="hover:text-[#D4AF37]">Call +8801926400400</a><a href="https://wa.me/8801926400400" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37]">WhatsApp</a><span className="text-[#D4AF37] font-bold">Admissions & visa guidance · No outcome guarantees</span></div>
        </div>
      </header>

      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-5">
          <button onClick={() => navigate("home")} className="flex items-center gap-3 text-left shrink-0"><img src={jelLogo} alt="JEL Study Abroad" className="h-10 md:h-12 w-auto object-contain" /><div className="hidden sm:block"><div className="font-black text-[#0B5D3B] dark:text-emerald-400">JEL Study Abroad</div><div className="text-[10px] uppercase tracking-wider text-slate-500">A Brand of Journey Expert Ltd.</div></div></button>
          <div className="hidden xl:flex items-center gap-5">{menuItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)} className={`text-xs font-black uppercase tracking-wide ${activeTab === id ? "text-[#0B5D3B] border-b-2 border-[#D4AF37] pb-1" : "text-slate-600 dark:text-slate-300 hover:text-[#0B5D3B]"}`}>{label}</button>)}</div>
          <div className="flex items-center gap-2"><button onClick={() => setSearchOpen(true)} aria-label="Search" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"><Search className="h-4 w-4" /></button><button onClick={() => setDarkMode((value) => !value)} aria-label="Toggle theme" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><button onClick={() => setMobileMenu((value) => !value)} aria-label="Menu" className="xl:hidden p-2.5">{mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
        </div>
        {mobileMenu && <div className="xl:hidden px-5 pb-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"><div className="grid grid-cols-2 gap-2 pt-4">{menuItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-left text-xs font-bold">{label}</button>)}</div></div>}
      </nav>

      <section className="max-w-[1600px] w-[calc(100%-2rem)] mx-auto mt-4 bg-[#0B5D3B] text-white rounded-2xl px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><div className="text-sm font-black">AI-assisted study planning and secure JEL services</div><div className="text-xs text-white/70 mt-1">Use planning tools as guidance; final admissions and visa decisions are made by the relevant institutions and authorities.</div></div>
        <div className="flex flex-wrap gap-2">{tools.map((tool) => { const Icon = tool.icon; return <button key={tool.id} onClick={() => navigate(tool.id)} className={`rounded-xl px-3 py-2 text-xs font-black flex items-center gap-2 ${activeTab === tool.id ? "bg-[#D4AF37] text-slate-950" : "bg-white/10 hover:bg-white/20"}`}><Icon className="h-4 w-4" />{tool.label}</button>; })}</div>
      </section>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">{renderMain()}</main>
      <AIChatAssistant />

      <a href="https://wa.me/8801926400400" target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center" aria-label="WhatsApp JEL"><Phone className="h-5 w-5" /></a>
      {activeTab !== "booking" && <button onClick={() => navigate("booking")} className="fixed bottom-6 left-6 z-30 rounded-xl bg-[#D4AF37] text-slate-950 shadow-xl px-5 py-3 text-xs font-black flex items-center gap-2"><Calendar className="h-4 w-4" /> Book Consultation</button>}

      <footer className="bg-slate-950 text-white rounded-t-[32px] px-5 py-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          <div><img src={jelLogo} alt="JEL Study Abroad" className="h-12 w-auto bg-white rounded-xl p-2" /><p className="text-xs text-slate-400 mt-4 leading-relaxed">JEL Study Abroad is a brand of Journey Expert Ltd., providing study-abroad counseling, admissions support and related travel services from Dhaka, Bangladesh.</p></div>
          <div><h4 className="font-black text-sm">Study destinations</h4><div className="mt-3 space-y-2 text-xs text-slate-400">{["United Kingdom", "Canada", "Australia", "United States", "Ireland", "Germany"].map((country) => <button key={country} onClick={() => { setExploreCountry(country); navigate("countries"); }} className="block hover:text-white">Study in {country}</button>)}</div></div>
          <div><h4 className="font-black text-sm">Quick links</h4><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">{menuItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)} className="text-left hover:text-white">{label}</button>)}</div></div>
          <div><h4 className="font-black text-sm">Contact & social</h4><div className="mt-3 space-y-2 text-xs text-slate-400"><div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />189/A, Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka, Bangladesh</div><div className="flex gap-2"><Phone className="h-4 w-4" />+8801926400400</div><div className="flex gap-2"><Globe className="h-4 w-4" />journeyexpertbd.com</div></div><div className="mt-4 flex flex-wrap gap-2">{verifiedSocialLinks.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-700 px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-white hover:border-slate-500" aria-label={`Journey Expert Ltd. ${social.label}`}>{social.label}</a>)}</div></div>
        </div>
        <div className="max-w-[1600px] mx-auto mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col md:flex-row justify-between gap-2"><span>© {new Date().getFullYear()} Journey Expert Ltd. / JEL Study Abroad.</span><span>Information is guidance only; admissions, scholarships and visas are subject to third-party decisions.</span></div>
      </footer>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} setActiveTab={setActiveTab} setUniversitySearch={setUniSearch} setScholarshipSearch={setScholarshipSearch} setBlogSearch={setBlogSearch} setInitialBlogId={setInitialBlogId} />
    </div>
  );
}