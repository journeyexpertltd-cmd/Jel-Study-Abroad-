import React, { useState } from "react";
import { Compass, Shield, Award, Users, Search, GraduationCap, MapPin, CheckCircle, Mail, Phone, Clock, MessageSquare, ExternalLink, Calendar, Facebook, Send, Map } from "lucide-react";
import { COUNTRIES, SCHOLARSHIPS, BLOGS, UNIVERSITY_PARTNERS, TEAM_MEMBERS } from "../data";
import { BlogItem, PartnerUniversity } from "../types";

// ================= AboutView Component =================
export function AboutView() {
  return (
    <div className="space-y-12 animate-in fade-in duration-300" id="about-us-view">
      <div className="bg-[#0B5D3B] text-white p-8 md:p-12 rounded-3xl text-center space-y-3 relative overflow-hidden">
        <span className="text-xs bg-[#00AEEF] text-slate-900 font-bold px-3 py-1 rounded uppercase tracking-wider">Meet the Brand</span>
        <h2 className="text-3xl font-display font-black">A Brand of Journey Expert Ltd.</h2>
        <p className="text-slate-300 text-sm max-w-xl mx-autoLeading-relaxed">
          Establishing transparent guidance, professional mock interviewing, and high visa conversions for Bangladeshi students aiming at world heights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center" id="about-mission-vision">
        <div className="space-y-4 text-left">
          <h3 className="font-display font-bold text-[#0B5D3B] text-2xl">Our Mission & Strategic Vision</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            To empower South Asian student candidates with truthful profiling reviews and zero-plagiarism Statement of Purpose (SOP) guidance. JEL helps students find educational fits that respect budgets, scores, and settlement aspirations.
          </p>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <h4 className="font-display font-semibold text-[#0B5D3B] text-sm">Vision Statement</h4>
            <p className="text-slate-500 text-xs mt-1">To become the most reliable, client-first, ethical international educational consultant ecosystem in Bangladesh.</p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="about-values">
          {[
            { title: "Integrity Above All", desc: "We commit to zero forged documentation, ensuring student profiles reflect 100% truth." },
            { title: "Absolute Transparency", desc: "No hidden package charges. You hand-transfer your tuition fees directly to selected universities yourself." },
            { title: "Academic Excellence", desc: "We guide you through rigorous mock university and embassy question templates." },
            { title: "Student-First Legacy", desc: "We connect you to established alumni hosts in Toronto, London, and Melbourne." }
          ].map((val, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-lg">💎</span>
              <h4 className="font-display font-bold text-slate-950 text-sm">{val.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team section */}
      <section className="space-y-8" id="about-team">
        <div className="text-center space-y-1">
          <span className="text-xs text-[#00AEEF] font-bold uppercase tracking-wider block">Leadership & Experts</span>
          <h3 className="text-2xl font-display font-black text-[#0B5D3B]">JEL Board of Counselors</h3>
          <p className="text-slate-500 text-xs sm:text-sm">Driven by certified professionals with profound immigration insights.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[#0B5D3B] transition-all">
              <div className="relative h-48 bg-slate-100">
                <img 
                  src={m.img} 
                  alt={m.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";
                  }}
                />
              </div>
              <div className="p-4 space-y-2 text-left flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-sm leading-none">{m.name}</h4>
                  <p className="text-[#00AEEF] text-[11px] font-bold mt-1.5">{m.role}</p>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">{m.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


// ================= ServicesView Component =================
export function ServicesView() {
  return (
    <div className="space-y-12 animate-in fade-in duration-300 font-sans" id="services-view">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs text-[#00AEEF] font-bold uppercase tracking-wider block">What we do</span>
        <h2 className="text-3xl font-display font-black text-[#0B5D3B]">Our Comprehensive Services</h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          We handle everything from initial capability audits and admissions applications to visas filing and post-arrival accommodation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            title: "Admission Services & Shortlisting",
            items: [
              "Detailed academic profile vetting & gap year corrections",
              "Course searching according to budget limits",
              "SOP evaluation and review (plagiarism audit)",
              "Arranging reference logs and LOR verifications"
            ],
            desc: "We help you select safe, moderate, and dream universities across the UK, Australia, Canada, USA, and beyond, speeding up unconditional offers.",
            bg: "bg-blue-50/50"
          },
          {
            title: "Visa and GTE Compliance Services",
            items: [
              "Visa document checklisting & file collation",
              "Double auditing self-sponsored assets and properties",
              "Conducting rigorous mock visa interview training",
              "Booking biometrics and coordinating Delhi/Dhaka submissions"
            ],
            desc: "Expertly managing complex GTE questionnaires, financial holding timelines, and proving genuine student intentions to embassy officials.",
            bg: "bg-sky-50/50"
          },
          {
            title: "Scholarship & Grant Assistance",
            items: [
              "Scholarship search mapping customized to current GPAs",
              "Guidance on drafting application essays for Chancellor awards",
              "Negotiation on course academic fee discounts",
              "Assisting in government fully-funded nominations (Chevening, DAAD)"
            ],
            desc: "JEL has helped students secure up to 100% tuition coverage to lower overall overseas living and academic expenditures.",
            bg: "bg-amber-50/50"
          },
          {
            title: "Career Mapping & Transition Planning",
            items: [
              "Profiling for Post-Study Work right duration",
              "Advising on local wage rules and part-time jobs regulations",
              "Connecting with Dhaka-to-abroad regional alumni network",
              "Guidance on permanent settlement (PR) routes per destination"
            ],
            desc: "Helping students align their courses with in-demand national skill lists, preparing them for top careers immediately post-graduation.",
            bg: "bg-purple-50/50"
          }
        ].map((ser, index) => (
          <div key={index} className={`border border-slate-100 rounded-3xl p-6 md:p-8 space-y-4 text-left ${ser.bg}`}>
            <h3 className="font-display font-bold text-slate-900 text-lg sm:text-xl">{ser.title}</h3>
            <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">{ser.desc}</p>
            
            <div className="space-y-2 pt-3 border-t border-slate-205/30">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Key Processes Included:</span>
              <ul className="grid grid-cols-1 gap-2">
                {ser.items.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-center space-x-2">
                    <span className="text-indigo-600 font-bold font-mono">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ================= CountriesView Component =================
interface CountriesViewProps {
  selectedCountryName: string;
}

export function CountriesView({ selectedCountryName }: CountriesViewProps) {
  const [activeCountryId, setActiveCountryId] = useState(() => {
    const found = COUNTRIES.find(c => c.name.toLowerCase().includes(selectedCountryName.toLowerCase()));
    return found ? found.id : "uk";
  });

  const activeCountry = COUNTRIES.find(c => c.id === activeCountryId) || COUNTRIES[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans" id="countries-view">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs text-[#00AEEF] font-bold uppercase tracking-wider block">Global Study Destinations</span>
        <h2 className="text-3xl font-display font-black text-[#05452d]">Interactive Country Guides</h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          Discover localized academic brackets, Post-Study Work Stay back visas, and prestigious universities in our partner grid.
        </p>
      </div>

      {/* Country selectors */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-slate-100 pb-4">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCountryId(c.id)}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeCountryId === c.id
                ? "bg-[#0B5D3B] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{c.flag}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Active country details panel */}
      {activeCountry && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left animate-in fade-in duration-300">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{activeCountry.flag}</span>
              <div>
                <span className="text-[#00AEEF] text-xs font-bold uppercase tracking-widest block font-mono">Affiliated Partner Seat</span>
                <h3 className="font-display font-black text-slate-900 text-2xl">{activeCountry.name}</h3>
              </div>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{activeCountry.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">Approx Tuition Expenses</span>
                <span className="text-sm font-display font-bold text-[#0B5D3B] block mt-1">{activeCountry.tuitionRange}</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">Dependent on course, ranking tier, and regional location.</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">Stay-Back Work Permissions</span>
                <p className="text-xs font-medium text-slate-700 mt-1 leading-normal">{activeCountry.workOpportunities}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950 text-[#00AEEF] border border-slate-850 p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <GraduationCap className="h-5 w-5 text-amber-500 animate-pulse" />
              <span className="text-white text-xs uppercase font-mono tracking-widest font-bold">QS Top 100 Co-Host Universities</span>
            </div>
            
            <ul className="space-y-2 text-xs font-mono">
              {activeCountry.popularUniversities.map((uni, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-amber-500 select-none">🏫</span>
                  <span className="text-slate-300">{uni}</span>
                </li>
              ))}
            </ul>
            
            <div className="text-[11px] text-slate-400 leading-normal border-t border-slate-800 pt-3">
              We process applications directly matching this destination's scholarship lists. Consult JEL managers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ================= UniversitiesView Component =================
interface UniversitiesViewProps {
  onPreSelectCourse: (uniName: string, country: string) => void;
  initialSearchTerm?: string;
}

export function UniversitiesView({ onPreSelectCourse, initialSearchTerm = "" }: UniversitiesViewProps) {
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const filteredUnis = UNIVERSITY_PARTNERS.filter((uni) => {
    const matchesCountry = selectedCountry === "All" || uni.country.trim() === selectedCountry.trim();
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const uniqueCountries = ["All", "United Kingdom", "Australia", "Canada", "United States", "Ireland", "New Zealand", "Malaysia", "Europe (Germany)"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans" id="universities-view">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs text-[#00AEEF] font-bold uppercase tracking-wider block">Affiliations</span>
        <h2 className="text-3xl font-display font-black text-[#0B5D3B]">50+ Certified Partner Universities</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Filter, search, and review active courses with global scholarship options available right now.</p>
      </div>

      {/* Sorting components */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search university by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#05452d]"
            id="uni-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {uniqueCountries.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`text-[10px] sm:text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                selectedCountry === c
                  ? "bg-[#05452d] text-white shadow"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {c === "Europe (Germany)" ? "Germany" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnis.map((uni) => (
          <div
            key={uni.id}
            className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-[#0B5D3B] hover:shadow-lg transition-all duration-300 text-left flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full font-mono text-slate-500 font-bold uppercase tracking-wider">{uni.country}</span>
                <span className="text-xs font-mono font-bold text-amber-500">{uni.ranking}</span>
              </div>
              <h3 className="font-display font-bold text-[#0B5D3B] text-base leading-snug line-clamp-1">{uni.name}</h3>
              
              <div className="space-y-1 pt-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Popular Degree Transfer streams:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {uni.popularPrograms.map((p, i) => (
                    <span key={i} className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-100">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold tracking-wide">Scholarships matches:</span>
                <span className="text-xs text-green-600 font-bold">{uni.scholarshipAvailable}</span>
              </div>
              <button
                onClick={() => onPreSelectCourse(uni.name, uni.country)}
                className="bg-slate-50 hover:bg-[#0B5D3B] hover:text-white border border-slate-100 text-[#0B5D3B] text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center"
              >
                Inquire <ExternalLink className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ================= ScholarshipsView Component =================
interface ScholarshipsViewProps {
  initialSearchTerm?: string;
}

export function ScholarshipsView({ initialSearchTerm = "" }: ScholarshipsViewProps) {
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const filteredScholarships = SCHOLARSHIPS.filter((sch) => {
    const matchesCountry = selectedCountry === "All" || sch.country.trim().toLowerCase() === selectedCountry.trim().toLowerCase();
    const matchesSearch = 
      sch.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sch.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sch.country.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sch.eligibility.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const uniqueCountries = ["All", "United Kingdom", "Australia", "Canada", "United States", "Ireland"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans" id="scholarships-view">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs text-[#00AEEF] font-bold uppercase tracking-wider block font-mono">Financial waivers</span>
        <h2 className="text-3xl font-display font-black text-[#0B5D3B]">Active Scholarships: Intake 2026/2027</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Explore specialized bursaries, full government rewards and partial waivers. Let JEL draft matching credentials.</p>
      </div>

      {/* Scholarships Search and Filter bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search matching scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#05452d]"
            id="scholarship-internal-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {uniqueCountries.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`text-[10px] sm:text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                selectedCountry === c
                  ? "bg-[#05452d] text-white shadow"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filteredScholarships.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-2">
          <span className="text-2xl">🎓</span>
          <h4 className="font-display font-bold text-slate-800">No matching scholarships</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">Try checking your spelling or selecting an alternative country filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((sch) => (
            <div key={sch.id} className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:border-[#0B5D3B] transition duration-300 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-[11px] font-mono text-indigo-600 font-bold uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full">{sch.country}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Deadline: {sch.deadline}</span>
                </div>
                
                <h3 className="font-display font-bold text-[#0B5D3B] text-base leading-tight">{sch.title}</h3>
                <p className="text-amber-500 text-sm font-black font-display">{sch.coverage}</p>
                <p className="text-slate-500 text-xs leading-normal">{sch.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1.5">Direct eligibility mandate:</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg leading-relaxed font-sans border border-slate-100">
                  {sch.eligibility}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ================= BlogView Component =================
interface BlogViewProps {
  initialSearchTerm?: string;
  initialBlogId?: string | null;
  onClearInitialBlog?: () => void;
}

export function BlogView({ initialSearchTerm = "", initialBlogId = null, onClearInitialBlog }: BlogViewProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [expandedBlog, setExpandedBlog] = useState<BlogItem | null>(null);

  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  React.useEffect(() => {
    if (initialBlogId) {
      const found = BLOGS.find(b => b.id === initialBlogId);
      if (found) {
        setExpandedBlog(found);
      }
    }
  }, [initialBlogId]);

  const handleCloseBlog = () => {
    setExpandedBlog(null);
    if (onClearInitialBlog) {
      onClearInitialBlog();
    }
  };

  const filteredBlogs = BLOGS.filter((b) => {
    const matchesCategory = activeCategory === "All" || b.category === activeCategory;
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans" id="blog-view">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs text-[#00AEEF] font-bold uppercase tracking-wider block">Resource Hub</span>
        <h2 className="text-3xl font-display font-black text-[#0B5D3B]">Guides, Visa Updates & Blogs</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Read masterclasses compiled by JEL's senior registry directors and stay ahead of immigration index revisions.</p>
      </div>

      {/* Expanded Blog Modal */}
      {expandedBlog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-left">
            <button
              onClick={handleCloseBlog}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-full transition-colors text-xs font-bold"
            >
              ✕ Close
            </button>
            <div className="space-y-4">
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">{expandedBlog.category}</span>
              <h3 className="font-display font-black text-[#0B5D3B] text-xl md:text-2xl leading-snug">{expandedBlog.title}</h3>
              
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <span>By {expandedBlog.author}</span>
                <span>•</span>
                <span>{expandedBlog.date}</span>
                <span>•</span>
                <span>{expandedBlog.readTime}</span>
              </div>

              <div className="border-t border-slate-100 pt-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {expandedBlog.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blogs controls */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#05452d]"
            id="blog-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["All", "Guides", "Visa Updates", "Scholarship News", "Success Stories"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] sm:text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#05452d] text-white shadow"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBlogs.map((b) => (
          <div
            key={b.id}
            onClick={() => setExpandedBlog(b)}
            className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-[#0B5D3B] transitionduration-300 cursor-pointer text-left flex flex-col md:flex-row"
          >
            <div className="md:w-1/3 relative h-40 md:h-auto bg-slate-100">
              <img 
                src={b.imageUrl} 
                alt={b.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400";
                }}
              />
            </div>

            <div className="p-6 md:w-2/3 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] bg-[#00AEEF]/20 text-[#0B5D3B] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{b.category}</span>
                <h3 className="font-display font-bold text-slate-950 text-sm sm:text-base leading-tight hover:text-[#00AEEF] transition duration-200">{b.title}</h3>
                <p className="text-slate-500 text-xs leading-normal line-clamp-3">{b.excerpt}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{b.date} • {b.readTime}</span>
                <span className="text-[#0B5D3B] font-bold">Read Full Guide →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ================= ContactView Component =================
export function ContactView() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 2500);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300 font-sans" id="contact-us-view">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs text-[#00AEEF] font-bold uppercase tracking-wider block">Office & Map</span>
        <h2 className="text-3xl font-display font-black text-[#0B5D3B]">Get in Touch with JEL Office</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Walk into our premium consultancy space at Tejgaon or send a message directly to counselors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contacts details column */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
            <h3 className="font-display font-medium text-slate-900 border-b border-slate-200 pb-2.5">Office Hub</h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#00AEEF]" />
                <div>
                  <p className="font-bold text-slate-800">Physical Address:</p>
                  <p className="text-slate-500 mt-0.5 leading-normal">
                    189/A, Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka, Bangladesh.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#00AEEF]" />
                <div>
                  <p className="font-bold text-slate-800">Telephones / Hotline:</p>
                  <p className="text-slate-500 mt-0.5 leading-normal">+8802 9830404</p>
                  <p className="text-slate-500 leading-normal">+8801926400400 (WhatsApp)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#00AEEF]" />
                <div>
                  <p className="font-bold text-slate-800">Official Inboxes:</p>
                  <p className="text-slate-500 mt-0.5 leading-normal">journeyexpertbd@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-[#00AEEF]" />
                <div>
                  <p className="font-bold text-slate-800">Visiting Hours:</p>
                  <p className="text-slate-500 mt-0.5 leading-normal">Saturday - Thursday: 10:00 AM - 07:00 PM</p>
                  <p className="text-red-500 font-semibold leading-normal">Friday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-2">
            <p className="text-xs text-slate-500 font-bold">Inquire instantly on WhatsApp Messenger</p>
            <a
              href="https://wa.me/8801926400400"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-xl uppercase tracking-wider inline-flex justify-center items-center gap-1.5"
            >
              <span>Launch JEL WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Contact form column */}
        <div className="lg:col-span-8 bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
          <h3 className="font-display font-medium text-slate-900 border-b border-slate-100 pb-2.5 text-left">Send Counselor Message</h3>
          
          <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500 block">Candidate Full name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rakib Rahman"
                className="w-full bg-slate-50 border border-slate-200 text-xs py-2 px-3 rounded-lg"
                required
                id="contact-name"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500 block">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 text-xs py-2 px-3 rounded-lg"
                required
                id="contact-email"
              />
            </div>

            <div className="space-y-1 text-left sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 block">Mobile Number (WhatsApp Preferred)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+8801XXXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 text-xs py-2 px-3 rounded-lg"
                required
                id="contact-phone"
              />
            </div>

            <div className="space-y-1 text-left sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 block">Student Query / Intentions</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Detailed questions about UK Graduate route, spouse visa options, or block accounts..."
                className="w-full bg-slate-50 border border-slate-200 text-xs py-2.5 px-3 rounded-lg min-h-[100px]"
                required
                id="contact-msg"
              />
            </div>

            {submitted && (
              <p className="bg-green-50 text-green-700 text-xs p-3 rounded-lg sm:col-span-2 font-semibold">
                ✓ Message received successfully in JEL Dhaka office! We will follow up via WhatsApp in 1 business hour.
              </p>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#0B5D3B] hover:bg-[#03301f] text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow"
              >
                Submit message
              </button>
            </div>
          </form>

          {/* Styled Physical Vector Map (Interactive Concept) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 mt-6" id="styled-vector-map-element">
            <div className="flex items-center space-x-2 text-slate-400 uppercase font-mono text-[10px] pb-2">
              <Map className="h-3.5 w-3.5 text-[#00AEEF]" />
              <span>JEL Studio Maps Location (Tejgaon Mor)</span>
            </div>
            
            <div className="bg-gradient-to-br from-[#0B5D3B]/5 to-[#00AEEF]/5 rounded-xl border border-slate-200 h-28 flex flex-col justify-center items-center text-center p-4">
              <h4 className="text-xs font-bold text-[#0B5D3B]">JEL Study Abroad Hub (Nabisco Mor)</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                Next to Abdul Motin Complex, opposite to Nabisco mor bus station. Accessible by rickshaw and local bus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
