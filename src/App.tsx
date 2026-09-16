import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
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
  { label: "FB", name: "Facebook", href: "https://www.facebook.com/journeyexpertltd" },
  { label: "IG", name: "Instagram", href: "https://www.instagram.com/journeyexpertltd/" },
  { label: "YT", name: "YouTube", href: "https://www.youtube.com/@JELSTUDYABROAD" },
  { label: "in", name: "LinkedIn", href: "https://www.linkedin.com/in/journey-expert-ltd-jel-13b6123b1" },
  { label: "WA", name: "WhatsApp", href: "https://wa.me/8801926400400" },
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
        sameAs: verifiedSocialLinks.filter((item) => item.name !== "WhatsApp").map((item) => item.href),
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
    ["home", "Home"],
    ["about", "About"],
    ["services", "Services"],
    ["countries", "Destinations"],
    ["universities", "Partners"],
    ["scholarships", "Scholarships"],
    ["blog", "Blogs"],
    ["contact", "Contact"],
  ];

  const renderMain = () => (
    <Suspense fallback={<div className="min-h-[45vh] flex items-center justify-center text-sm font-bold text-[#0B5D3B]">Loading JEL Study Abroad…</div>}>
      {activeTab === "home" && <HomeView setActiveTab={setActiveTab} onPreSelectCountry={(country) => setExploreCountry(country)} />}
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
    <div className="min-h-screen bg-[#F7F4EA] text-[#12372A] flex flex-col">
      <header className="border-b border-[#DDD6C5] bg-[#F5F1E5] text-[10px] text-slate-600">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-2 px-5 py-2 sm:px-8 lg:px-10 xl:px-14">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#0B5D3B]" />189/A, Abdul Motin Complex, Tejgaon, Dhaka</span>
            <span className="hidden items-center gap-1.5 md:inline-flex"><Clock3 className="h-3.5 w-3.5 text-[#0B5D3B]" />Sat–Thu, 10:00–19:00</span>
            <a href="mailto:journeyexpertbd@gmail.com" className="hidden items-center gap-1.5 lg:inline-flex"><Mail className="h-3.5 w-3.5 text-[#0B5D3B]" />journeyexpertbd@gmail.com</a>
          </div>
          <div className="flex items-center gap-2">
            <a href="tel:+8801926400400" className="hidden items-center gap-1.5 font-bold sm:inline-flex"><Phone className="h-3.5 w-3.5 text-[#0B5D3B]" />+880 1926-400400</a>
            <div className="hidden items-center gap-1 md:flex">{verifiedSocialLinks.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="grid h-6 min-w-6 place-items-center rounded-full bg-[#0B5D3B] px-1 text-[8px] font-black text-white transition hover:bg-[#D29D27]">{social.label}</a>)}</div>
            <span className="ml-1 rounded border border-[#CFC6B1] px-2 py-1 font-bold text-[#0B5D3B]">EN | বাংলা</span>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-50 border-b border-[#E0DAC9] bg-[#FBF9F2]/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-[1480px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 xl:px-14">
          <button onClick={() => navigate("home")} className="flex shrink-0 items-center gap-3 text-left"><img src={jelLogo} alt="JEL Study Abroad" className="h-14 w-auto object-contain" /></button>
          <div className="hidden items-center gap-1 xl:flex">{menuItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)} className={`rounded-lg px-3.5 py-2 text-xs font-black transition ${activeTab === id ? "bg-[#0B5D3B] text-white shadow-md" : "text-[#243E36] hover:bg-[#E9EFE8] hover:text-[#0B5D3B]"}`}>{label}</button>)}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-lg border border-[#D8D1BF] bg-white text-[#0B5D3B] transition hover:border-[#0B5D3B]"><Search className="h-4 w-4" /></button>
            <button onClick={() => navigate("portal")} className="hidden rounded-lg border border-[#0B5D3B] px-4 py-3 text-xs font-black text-[#0B5D3B] lg:block">Student Login</button>
            <button onClick={() => navigate("booking")} className="hidden items-center gap-2 rounded-lg bg-[#0B5D3B] px-5 py-3 text-xs font-black text-white shadow-[0_10px_25px_rgba(11,93,59,.2)] transition hover:-translate-y-0.5 hover:bg-[#084A30] sm:inline-flex"><Calendar className="h-4 w-4" />Book Free Counselling <ArrowIcon /></button>
            <button onClick={() => setMobileMenu((value) => !value)} aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-lg border border-[#D8D1BF] bg-white xl:hidden">{mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {mobileMenu && <div className="border-t border-[#E0DAC9] bg-[#FBF9F2] px-5 pb-5 xl:hidden"><div className="grid grid-cols-2 gap-2 pt-4">{menuItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)} className={`rounded-lg border p-3 text-left text-xs font-black ${activeTab === id ? "border-[#0B5D3B] bg-[#0B5D3B] text-white" : "border-[#D8D1BF] bg-white"}`}>{label}</button>)}<button onClick={() => navigate("portal")} className="rounded-lg border border-[#D8D1BF] bg-white p-3 text-left text-xs font-black">Student Portal</button><button onClick={() => navigate("booking")} className="rounded-lg bg-[#D6A534] p-3 text-left text-xs font-black text-[#12372A]">Book Free Counselling</button></div></div>}
      </nav>

      <main className={activeTab === "home" ? "flex-1 w-full" : "flex-1 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24"}>{renderMain()}</main>
      <AIChatAssistant />

      <a href="https://wa.me/8801926400400" target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:-translate-y-1" aria-label="WhatsApp JEL"><Phone className="h-5 w-5" /></a>

      <footer className="border-t border-[#DDD6C5] bg-[#F5F1E5]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-9 px-5 py-10 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.15fr_.7fr_1fr_1fr] lg:px-10 xl:px-14">
          <div><img src={jelLogo} alt="JEL Study Abroad" className="h-16 w-auto object-contain" /><p className="mt-4 max-w-sm text-xs leading-6 text-slate-600">Education. Guidance. A Brighter Tomorrow. JEL Study Abroad is a brand of Journey Expert Ltd., supporting international education planning from Dhaka, Bangladesh.</p></div>
          <div><h4 className="font-[Georgia,serif] text-sm font-black">Quick Links</h4><div className="mt-4 space-y-2">{menuItems.map(([id, label]) => <button key={id} onClick={() => navigate(id)} className="block text-left text-xs text-slate-600 transition hover:text-[#0B5D3B]">{label}</button>)}</div></div>
          <div><h4 className="font-[Georgia,serif] text-sm font-black">Contact Us</h4><div className="mt-4 space-y-3 text-xs text-slate-600"><div className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0B5D3B]" />189/A, Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka</div><a href="tel:+8801926400400" className="flex gap-2"><Phone className="h-4 w-4 text-[#0B5D3B]" />+880 1926-400400</a><a href="mailto:journeyexpertbd@gmail.com" className="flex gap-2"><Mail className="h-4 w-4 text-[#0B5D3B]" />journeyexpertbd@gmail.com</a><div className="flex gap-2"><Clock3 className="h-4 w-4 text-[#0B5D3B]" />Sat–Thu, 10:00–19:00</div></div></div>
          <div><h4 className="font-[Georgia,serif] text-sm font-black">Follow Us</h4><div className="mt-4 flex flex-wrap gap-2">{verifiedSocialLinks.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="grid h-9 min-w-9 place-items-center rounded-full bg-[#0B5D3B] px-2 text-[10px] font-black text-white transition hover:bg-[#D29D27]" aria-label={social.name}>{social.label}</a>)}</div><button onClick={() => navigate("portal")} className="mt-5 text-xs font-black text-[#0B5D3B]">JEL Student Portal →</button><div className="mt-5 flex items-center gap-2 text-[10px] text-slate-500"><Globe className="h-4 w-4" />journeyexpertbd.com</div></div>
        </div>
        <div className="bg-[#064A34] text-white/75"><div className="mx-auto flex max-w-[1480px] flex-col justify-between gap-3 px-5 py-4 text-[10px] sm:px-8 md:flex-row lg:px-10 xl:px-14"><span>© {new Date().getFullYear()} JEL Study Abroad, a brand of Journey Expert Ltd.</span><div className="flex flex-wrap gap-4"><span>Privacy Policy</span><span>Terms & Conditions</span><span>Cookie Policy</span><span>Your Journey, Our Expertise.</span></div></div></div>
      </footer>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} setActiveTab={setActiveTab} setUniversitySearch={setUniSearch} setScholarshipSearch={setScholarshipSearch} setBlogSearch={setBlogSearch} setInitialBlogId={setInitialBlogId} />
    </div>
  );
}

function ArrowIcon() {
  return <span aria-hidden="true" className="text-base leading-none">→</span>;
}
