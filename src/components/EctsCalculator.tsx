import React, { useState, useMemo, useEffect } from "react";
import { 
  Calculator, BookOpen, CheckCircle2, Info, HelpCircle, ArrowRight, 
  Sparkles, Send, GraduationCap, ShieldCheck, Globe, Calendar, Clock, 
  Award, FileText, ChevronDown, ChevronUp, AlertCircle, RefreshCw, 
  Layers, Check, Phone, MessageSquare, ExternalLink, User, Mail
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export interface EctsCalculatorProps {
  setActiveTab: (tab: string) => void;
  onPreSelectCountry?: (country: string) => void;
}

export interface CreditSystemConfig {
  id: string;
  name: string;
  country: string;
  defaultRatioFor60Ects: number; // Institutional credits required to equal 60 ECTS (1 academic year)
  formulaDescription: string;
  explanation: string;
  standardWorkloadNote: string;
  allowCustomRatioOverride?: boolean;
}

// Modular Conversion Configuration Matrix
export const CREDIT_SYSTEM_CONFIGS: Record<string, CreditSystemConfig> = {
  ects: {
    id: "ects",
    name: "ECTS (European Credit Transfer and Accumulation System)",
    country: "Europe / EHEA",
    defaultRatioFor60Ects: 60,
    formulaDescription: "1 ECTS = 1 ECTS (Direct European equivalency)",
    explanation: "Standard European Credit Transfer and Accumulation System used across 48 EHEA member states.",
    standardWorkloadNote: "1 ECTS represents 25 to 30 hours of total student workload."
  },
  uk_cats: {
    id: "uk_cats",
    name: "UK Credits / CATS (Credit Accumulation & Transfer Scheme)",
    country: "United Kingdom",
    defaultRatioFor60Ects: 120,
    formulaDescription: "1 ECTS = 2 UK CATS Credits (ECTS = UK Credits × 0.5)",
    explanation: "In the UK Higher Education Credit Framework, 120 UK credits represent one full-time academic year (60 ECTS).",
    standardWorkloadNote: "1 UK credit represents 10 learning hours; 2 UK credits equal 1 ECTS."
  },
  us_semester: {
    id: "us_semester",
    name: "US Semester Credits",
    country: "United States",
    defaultRatioFor60Ects: 30,
    formulaDescription: "1 US Semester Credit ≈ 2.0 ECTS (ECTS = US Semester Credits × 2.0)",
    explanation: "Standard US full-time undergraduate workload is 30 semester credits per academic year (equivalent to 60 ECTS).",
    standardWorkloadNote: "1 US semester credit represents approximately 45–60 total workload hours (2 ECTS)."
  },
  us_quarter: {
    id: "us_quarter",
    name: "US Quarter Credits",
    country: "United States",
    defaultRatioFor60Ects: 45,
    formulaDescription: "1 US Quarter Credit ≈ 1.33 ECTS (ECTS = US Quarter Credits × 1.33)",
    explanation: "US quarter system universities require 45 quarter credits per academic year for full-time status.",
    standardWorkloadNote: "45 quarter credits equal 60 ECTS (approx. 1 quarter credit = 1.33 ECTS)."
  },
  au_credits: {
    id: "au_credits",
    name: "Australian Credit Points (EFTSL Standard)",
    country: "Australia",
    defaultRatioFor60Ects: 48,
    formulaDescription: "1 AU Credit ≈ 1.25 ECTS (48 AU Credits = 60 ECTS)",
    explanation: "Standard Australian universities (such as Go8) award 48 credit points per full-time academic year (1.0 EFTSL).",
    standardWorkloadNote: "48 Australian credit points equate to 60 ECTS (approx. 1 AU credit = 1.25 ECTS)."
  },
  ca_credits: {
    id: "ca_credits",
    name: "Canadian Credit Hours",
    country: "Canada",
    defaultRatioFor60Ects: 30,
    formulaDescription: "1 Canadian Credit ≈ 2.0 ECTS (30 Canadian Credits = 60 ECTS)",
    explanation: "Canadian full-time undergraduate degree programmes require 30 credit hours per academic year.",
    standardWorkloadNote: "30 Canadian credit hours represent 1 full academic year (60 ECTS)."
  },
  bd_ugc: {
    id: "bd_ugc",
    name: "Bangladesh UGC Credit Hours",
    country: "Bangladesh",
    defaultRatioFor60Ects: 36,
    formulaDescription: "1 BD Credit Hour ≈ 1.67 ECTS (36 BD Credits/Year = 60 ECTS)",
    explanation: "Under the Bangladesh University Grants Commission (UGC) system, a standard 4-year Bachelor's (120–140 credits) equates to 200–240 ECTS.",
    standardWorkloadNote: "36 Bangladesh credit hours per academic year convert to approximately 60 ECTS."
  },
  in_cbcs: {
    id: "in_cbcs",
    name: "Indian CBCS / UGC Credits",
    country: "India",
    defaultRatioFor60Ects: 36,
    formulaDescription: "1 Indian Credit ≈ 1.67 ECTS (36 Indian Credits/Year = 60 ECTS)",
    explanation: "Under the Indian Choice Based Credit System (CBCS), a 3-year Bachelor's (120 credits) equates to 180 ECTS.",
    standardWorkloadNote: "36 Indian credits per academic year correspond to 60 ECTS workload."
  },
  custom: {
    id: "custom",
    name: "Custom / Institution-Specific Credit System",
    country: "Other / Custom",
    defaultRatioFor60Ects: 60,
    formulaDescription: "Calculated based on your university's specific ECTS equivalency ratio",
    explanation: "Specify your university's institutional credit structure (e.g. how many credits equal 1 full academic year).",
    standardWorkloadNote: "Proportional calculation based on user-defined institutional baseline."
  }
};

export const EctsCalculator: React.FC<EctsCalculatorProps> = ({ 
  setActiveTab, 
  onPreSelectCountry 
}) => {
  // Input Form States
  const [selectedCountry, setSelectedCountry] = useState<string>("Bangladesh");
  const [selectedSystem, setSelectedSystem] = useState<string>("bd_ugc");
  const [inputCredits, setInputCredits] = useState<string>("90");
  const [useCustomRatio, setUseCustomRatio] = useState<boolean>(false);
  const [customCreditsFor60, setCustomCreditsFor60] = useState<string>("36");
  const [courseDuration, setCourseDuration] = useState<string>("3 years");
  const [degreeLevel, setDegreeLevel] = useState<string>("Bachelor's");

  // Error & Validation
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculated Result State
  const [calculatedResult, setCalculatedResult] = useState<{
    ects: number;
    originalCredits: number;
    systemName: string;
    conversionMethod: string;
    minHours: number;
    maxHours: number;
    bachelorPercentage: number;
    masterPercentage: number;
    calculatedAt: string;
  } | null>(null);

  // Lead Generation Assessment Form State
  const [leadForm, setLeadForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    destination: "United Kingdom",
    highestQualification: "Bachelor's Degree",
    studyLevel: "Master's / Postgraduate",
    message: "",
    agreedConsent: true
  });

  const [leadSubmitting, setLeadSubmitting] = useState<boolean>(false);
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // FAQ Accordion Toggle State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auto-switch credit system when country changes if appropriate
  useEffect(() => {
    switch (selectedCountry) {
      case "United Kingdom":
        setSelectedSystem("uk_cats");
        break;
      case "United States":
        setSelectedSystem("us_semester");
        break;
      case "Canada":
        setSelectedSystem("ca_credits");
        break;
      case "Australia":
        setSelectedSystem("au_credits");
        break;
      case "Bangladesh":
        setSelectedSystem("bd_ugc");
        break;
      case "India":
        setSelectedSystem("in_cbcs");
        break;
      case "Pakistan":
      case "Nepal":
      case "Sri Lanka":
        setSelectedSystem("bd_ugc");
        break;
      default:
        break;
    }
  }, [selectedCountry]);

  // Sync custom credits default when system changes
  useEffect(() => {
    const sys = CREDIT_SYSTEM_CONFIGS[selectedSystem];
    if (sys) {
      setCustomCreditsFor60(sys.defaultRatioFor60Ects.toString());
    }
  }, [selectedSystem]);

  // Handle Calculate Action
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const creditsNum = parseFloat(inputCredits);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      setValidationError("Please enter a valid positive credit number (e.g., 60 or 120).");
      return;
    }

    if (creditsNum > 1000) {
      setValidationError("Credit value appears unusually high. Please verify your transcript details.");
      return;
    }

    const currentSys = CREDIT_SYSTEM_CONFIGS[selectedSystem] || CREDIT_SYSTEM_CONFIGS.custom;
    let ratioFor60 = currentSys.defaultRatioFor60Ects;

    if (useCustomRatio || selectedSystem === "custom") {
      const customRatioNum = parseFloat(customCreditsFor60);
      if (isNaN(customRatioNum) || customRatioNum <= 0) {
        setValidationError("Please specify a valid institutional baseline ratio (e.g. credits for 60 ECTS).");
        return;
      }
      ratioFor60 = customRatioNum;
    }

    // Formula: (userCredits / ratioFor60) * 60
    const rawEcts = (creditsNum / ratioFor60) * 60;
    const roundedEcts = Math.round(rawEcts * 10) / 10;

    const minHours = Math.round(roundedEcts * 25);
    const maxHours = Math.round(roundedEcts * 30);

    const bachelorPercentage = Math.min(100, Math.round((roundedEcts / 180) * 100));
    const masterPercentage = Math.min(100, Math.round((roundedEcts / 60) * 100));

    let conversionMethodText = currentSys.formulaDescription;
    if (useCustomRatio || selectedSystem === "custom") {
      conversionMethodText = `Custom Ratio: ${creditsNum} credits / ${ratioFor60} baseline × 60 ECTS`;
    }

    setCalculatedResult({
      ects: roundedEcts,
      originalCredits: creditsNum,
      systemName: currentSys.name,
      conversionMethod: conversionMethodText,
      minHours,
      maxHours,
      bachelorPercentage,
      masterPercentage,
      calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Scroll smoothly to result card
    setTimeout(() => {
      const el = document.getElementById("ects-result-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Initial auto calculation on load
  useEffect(() => {
    handleCalculate();
  }, []);

  // Handle Assessment Lead Form Submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);

    if (!leadForm.fullName.trim() || !leadForm.phone.trim()) {
      setLeadError("Please provide your Full Name and WhatsApp / Phone number.");
      return;
    }

    if (!leadForm.agreedConsent) {
      setLeadError("Please check the consent box to proceed.");
      return;
    }

    setLeadSubmitting(true);

    const dateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) + " (Dhaka Time)";
    const ectsSummary = calculatedResult 
      ? `${calculatedResult.ects} ECTS (from ${calculatedResult.originalCredits} ${CREDIT_SYSTEM_CONFIGS[selectedSystem]?.name || 'credits'})` 
      : "Not calculated";

    const newLead = {
      id: "lead-ects-" + Date.now(),
      fullName: leadForm.fullName.trim(),
      email: leadForm.email.trim() || "no-email@jelstudyabroad.com",
      mobileNumber: leadForm.phone.trim(),
      preferredCountry: leadForm.destination,
      educationLevel: leadForm.highestQualification,
      message: `[ECTS Assessment Request] ECTS Result: ${ectsSummary}. Target Level: ${leadForm.studyLevel}. Degree: ${degreeLevel}, Duration: ${courseDuration}. Notes: ${leadForm.message}`,
      status: "New" as const,
      notes: `Captured via JEL ECTS Calculator tool. Estimated ECTS: ${ectsSummary}`,
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

    // Save lead to Firebase Firestore
    try {
      await setDoc(doc(db, "leads", newLead.id), newLead);
    } catch (fbErr) {
      console.warn("Firebase lead write notice:", fbErr);
      try {
        handleFirestoreError(fbErr, OperationType.WRITE, `leads/${newLead.id}`);
      } catch (err) {
        // Fallback
      }
    }

    // Attempt backend sync
    try {
      await fetch("/api/supabase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });
    } catch (err) {
      console.warn("Synced locally.");
    }

    setTimeout(() => {
      setLeadSubmitting(false);
      setLeadSubmitted(true);
    }, 600);
  };

  // FAQ Data List
  const faqList = [
    {
      q: "What is ECTS?",
      a: "ECTS stands for the European Credit Transfer and Accumulation System. It is a standardized credit system used by higher education institutions across the European Higher Education Area (EHEA) to compare study workloads, facilitate credit transfers, and enable international student mobility."
    },
    {
      q: "How many ECTS are equal to one academic year?",
      a: "In the ECTS system, 60 ECTS credits represent one full-time academic year of study (approximately 1,500 to 1,800 total workload hours). One semester is typically equal to 30 ECTS credits."
    },
    {
      q: "How do I convert my university credits to ECTS?",
      a: "Conversion depends on your country and institutional credit framework. For example, 2 UK CATS credits equal 1 ECTS (120 UK credits = 60 ECTS), while 1 US Semester Credit equals approximately 2 ECTS (30 US credits = 60 ECTS). For Asian and national systems, conversion is calculated proportionally based on annual credit workload."
    },
    {
      q: "Is the ECTS Calculator 100% accurate?",
      a: "The JEL ECTS Calculator provides a high-precision estimate based on standard EHEA credit formulas. However, official credit recognition and course waivers are subject to the receiving university's academic admissions board."
    },
    {
      q: "Will universities accept the ECTS result from this calculator?",
      a: "This result serves as an authoritative advisory estimate for guidance during your application process. Official academic evaluation is conducted when JEL Study Abroad submits your certified transcripts directly to partner university admissions offices."
    },
    {
      q: "Can I use this calculator for studying in Europe?",
      a: "Yes! The ECTS system is used extensively across Germany, France, Ireland, Sweden, Netherlands, Finland, Italy, Spain, Poland, and all 48 EHEA member states."
    },
    {
      q: "Can JEL Study Abroad assess my academic profile?",
      a: "Absolutely! Our senior study abroad counselors at Tejgaon, Dhaka offer free 1-on-1 profile evaluations, transcript reviews, and credit mapping to help you secure admission and scholarships."
    },
    {
      q: "How can I get help choosing a university?",
      a: "You can book a free consultation with JEL Study Abroad or submit your ECTS calculation directly through our assessment form to receive tailored university and course recommendations."
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in text-slate-800 dark:text-slate-100 max-w-7xl mx-auto py-4">
      
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#0B5D3B] to-[#0A4B30] text-white p-8 md:p-12 border border-white/10 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-[#D4AF37]">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Official European Credit Guidance Engine</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            ECTS Calculator
          </h1>

          <p className="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
            Estimate your academic credits in ECTS and get a clearer understanding of how your previous studies compare with the European Credit Transfer and Accumulation System for study in Europe, UK, Canada, Australia, and worldwide.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> EHEA Standard Matrix
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Globe className="w-4 h-4 text-[#D4AF37]" /> Global University Recognition
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Award className="w-4 h-4 text-yellow-400" /> Free Profile Mapping
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Calculator Form Controls */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0B5D3B]/10 dark:bg-[#0B5D3B]/30 rounded-2xl text-[#0B5D3B] dark:text-emerald-400">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Calculate Your ECTS</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter your transcript details below</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#0B5D3B] font-bold bg-[#0B5D3B]/10 px-2.5 py-1 rounded-full">
              v2.4 Engine
            </span>
          </div>

          <form onSubmit={handleCalculate} className="space-y-5">
            {/* Country Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Country / Academic System
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] transition"
              >
                <option value="Bangladesh">Bangladesh (UGC System)</option>
                <option value="India">India (CBCS / UGC System)</option>
                <option value="United Kingdom">United Kingdom (CATS Framework)</option>
                <option value="United States">United States (Semester / Quarter)</option>
                <option value="Canada">Canada (Credit Hour System)</option>
                <option value="Australia">Australia (EFTSL Credit Points)</option>
                <option value="Pakistan">Pakistan (HEC Credit System)</option>
                <option value="Nepal">Nepal (TU / KU Credit System)</option>
                <option value="Sri Lanka">Sri Lanka (SLQF Framework)</option>
                <option value="Other">Other / Custom International System</option>
              </select>
            </div>

            {/* Credit System Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Credit System
              </label>
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] transition"
              >
                {Object.values(CREDIT_SYSTEM_CONFIGS).map((sys) => (
                  <option key={sys.id} value={sys.id}>
                    {sys.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
                {CREDIT_SYSTEM_CONFIGS[selectedSystem]?.explanation}
              </p>
            </div>

            {/* Number of Credits Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Number of Earned Credits
                </label>
                <span className="text-[11px] text-slate-400">Decimal values allowed</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  value={inputCredits}
                  onChange={(e) => setInputCredits(e.target.value)}
                  placeholder="e.g. 90, 120, or 180"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] transition"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                  Credits
                </span>
              </div>
            </div>

            {/* Optional Custom Ratio Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={useCustomRatio || selectedSystem === "custom"}
                  onChange={(e) => setUseCustomRatio(e.target.checked)}
                  disabled={selectedSystem === "custom"}
                  className="w-4 h-4 rounded text-[#0B5D3B] focus:ring-[#0B5D3B]"
                />
                <span>Override institutional baseline ratio</span>
              </label>

              {(useCustomRatio || selectedSystem === "custom") && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2 animate-fade-in">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                    How many of your university's credits equal 60 ECTS (1 Academic Year)?
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={customCreditsFor60}
                    onChange={(e) => setCustomCreditsFor60(e.target.value)}
                    placeholder="e.g., 36 for BD UGC or 120 for UK"
                    className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    Proportional conversion formula: (Your Credits ÷ {customCreditsFor60 || "N"}) × 60 ECTS.
                  </p>
                </div>
              )}
            </div>

            {/* Optional Secondary Inputs: Duration & Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Study Duration (Optional)
                </label>
                <select
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                >
                  <option value="1 semester">1 Semester</option>
                  <option value="2 semesters / 1 year">2 Semesters / 1 Year</option>
                  <option value="2 years">2 Years</option>
                  <option value="3 years">3 Years</option>
                  <option value="4 years">4 Years</option>
                  <option value="Other">Other Duration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Degree Level (Optional)
                </label>
                <select
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                >
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="Diploma">Diploma / Advanced Diploma</option>
                  <option value="Foundation">Foundation / Pathway</option>
                  <option value="MBA">MBA / Post-Graduate</option>
                  <option value="PhD / Doctorate">PhD / Doctorate</option>
                  <option value="Other">Other Qualification</option>
                </select>
              </div>
            </div>

            {/* Validation Error Display */}
            {validationError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Calculate Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0B5D3B] hover:bg-[#094B30] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#0B5D3B]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate ECTS Equivalent</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center leading-normal">
            Fast, client-side calculation • Instant EHEA credit estimation
          </p>
        </div>

        {/* Right Column: Calculated Results Display & Guidance */}
        <div id="ects-result-section" className="lg:col-span-5 space-y-6">
          
          {calculatedResult ? (
            <div className="bg-gradient-to-b from-slate-900 to-[#0F172A] text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#0B5D3B]/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* Result Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest font-extrabold text-[#D4AF37]">
                  Calculation Summary
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Updated: {calculatedResult.calculatedAt}
                </span>
              </div>

              {/* Big ECTS Score Banner */}
              <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm space-y-1">
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">Your Estimated ECTS</p>
                <div className="text-4xl md:text-5xl font-black font-display text-white tracking-tight flex items-center justify-center gap-2">
                  <span className="text-[#D4AF37]">{calculatedResult.ects}</span>
                  <span className="text-2xl font-bold text-emerald-400">ECTS</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Approx. <strong className="text-white">{calculatedResult.minHours.toLocaleString()} – {calculatedResult.maxHours.toLocaleString()}</strong> workload hours
                </p>
              </div>

              {/* Key Details Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Original Credits:</span>
                  <span className="font-bold text-white">{calculatedResult.originalCredits} Credits</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Credit System:</span>
                  <span className="font-bold text-emerald-300 truncate max-w-[180px]">{selectedCountry} ({CREDIT_SYSTEM_CONFIGS[selectedSystem]?.country})</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Conversion Method:</span>
                  <span className="font-mono text-[11px] text-slate-200">{calculatedResult.conversionMethod}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Study Duration:</span>
                  <span className="font-bold text-white">{courseDuration}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Degree Level:</span>
                  <span className="font-bold text-white">{degreeLevel}</span>
                </div>
              </div>

              {/* Progress Benchmarks */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-semibold">Bachelor's Degree Progress (180 ECTS)</span>
                    <span className="text-[#D4AF37] font-bold">{calculatedResult.bachelorPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#D4AF37] transition-all duration-500"
                      style={{ width: `${calculatedResult.bachelorPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-semibold">1-Year Master's Requirement (60 ECTS)</span>
                    <span className="text-emerald-400 font-bold">{calculatedResult.masterPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${calculatedResult.masterPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Mandatory Prominent Disclaimer */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Important:</strong> This result is an estimate for guidance purposes only. Universities and credential-evaluation authorities may use different methodologies when assessing academic credits and qualifications.
                </p>
              </div>

              {/* Quick Contact CTA */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById("ects-lead-form-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Official Credit Assessment</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <Calculator className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Calculate Your Result</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Select your academic country, credit system, and earned credits to view your estimated ECTS conversion and workload hours.
              </p>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/50 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B5D3B] dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Why Use JEL Credit Mapping?</span>
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5D3B] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Eliminate application rejection caused by credit mismatch</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5D3B] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Map academic gap and credit transfers for Master's entry</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5D3B] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Direct university advocacy by JEL counselors in Tejgaon</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* 3. Call to Action Banner Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0B5D3B] dark:text-emerald-400 bg-[#0B5D3B]/10 px-3 py-1 rounded-full">
            Next Steps for Study Abroad
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 dark:text-white">
            Planning to Study Abroad?
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Your ECTS estimate is only the first step. Our experienced study-abroad consultants can help you assess your academic profile, explore suitable universities and courses, understand admission requirements, and guide you through the application and student visa process.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setActiveTab("booking");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="py-3 px-6 rounded-xl bg-[#0B5D3B] hover:bg-[#094B30] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Get Free Consultation</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("checker");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="py-3 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#0B5D3B]" />
            <span>Check Your Eligibility</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("countries");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="py-3 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Explore Study Destinations</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("contact");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="py-3 px-6 rounded-xl bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Contact JEL Study Abroad</span>
          </button>
        </div>
      </div>

      {/* 4. Lead Generation Assessment Form */}
      <div id="ects-lead-form-section" className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-3xl p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#0B5D3B]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#D4AF37] bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Personalised Credit Assessment
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-display text-white">
              Want a Personalised Study Abroad Assessment?
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
              Submit your academic details and estimated ECTS score directly to JEL senior counselors in Tejgaon, Dhaka for an official profile evaluation.
            </p>
          </div>

          {leadSubmitted ? (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Assessment Request Received!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{leadForm.fullName}</strong>. Our senior counselor team at Journey Expert Ltd. (Tejgaon, Dhaka) has received your ECTS assessment submission. We will contact you within 24 hours.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://wa.me/8801926400400"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp (+8801926400400)</span>
                </a>
                <button
                  onClick={() => setLeadSubmitted(false)}
                  className="py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Submit Another Assessment
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4 bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadForm.fullName}
                    onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                    placeholder="e.g., Tanvir Ahmed"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="e.g., 01712345678"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="e.g., student@example.com"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Preferred Study Destination
                  </label>
                  <select
                    value={leadForm.destination}
                    onChange={(e) => setLeadForm({ ...leadForm, destination: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="United States">United States</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Finland">Finland</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Highest Qualification
                  </label>
                  <select
                    value={leadForm.highestQualification}
                    onChange={(e) => setLeadForm({ ...leadForm, highestQualification: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="HSC / A-Levels">HSC / A-Levels</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Target Study Level
                  </label>
                  <select
                    value={leadForm.studyLevel}
                    onChange={(e) => setLeadForm({ ...leadForm, studyLevel: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                  >
                    <option value="Master's / Postgraduate">Master's / Postgraduate</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="PhD / Doctorate">PhD / Doctorate</option>
                    <option value="Diploma / Foundation">Diploma / Foundation</option>
                  </select>
                </div>
              </div>

              {/* Auto-Captured ECTS Score Badge */}
              <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Attached ECTS Result:</span>
                <span className="font-bold text-[#D4AF37]">
                  {calculatedResult ? `${calculatedResult.ects} ECTS (${calculatedResult.originalCredits} Credits)` : 'Please calculate ECTS above'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Message / Specific Universities of Interest
                </label>
                <textarea
                  rows={2}
                  value={leadForm.message}
                  onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                  placeholder="e.g. Interested in Master's in Computer Science in Germany or UK..."
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]"
                ></textarea>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={leadForm.agreedConsent}
                    onChange={(e) => setLeadForm({ ...leadForm, agreedConsent: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0B5D3B] focus:ring-[#0B5D3B] mt-0.5"
                  />
                  <span className="leading-normal">
                    I agree to be contacted by JEL Study Abroad (Journey Expert Ltd.) regarding my study-abroad enquiry.
                  </span>
                </label>
              </div>

              {leadError && (
                <p className="text-xs text-red-400 font-semibold">{leadError}</p>
              )}

              <button
                type="submit"
                disabled={leadSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0B5D3B] hover:bg-[#094B30] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#0B5D3B]/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {leadSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Request My Personalised Assessment</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 5. Additional Educational Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card 1: What is ECTS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">What is ECTS?</h3>
          </div>

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            ECTS stands for the European Credit Transfer and Accumulation System. It is used by higher education institutions across the European Higher Education Area (EHEA) to help compare study workloads, support academic mobility, and facilitate smooth credit transfers between universities.
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <p className="font-bold text-slate-900 dark:text-white">Standard ECTS Workload Principle:</p>
            <p className="text-slate-600 dark:text-slate-400">
              1 ECTS credit corresponds to <strong>25 to 30 hours</strong> of total student effort, including lectures, seminars, laboratory work, self-study, and examinations.
            </p>
          </div>
        </div>

        {/* Card 2: How many ECTS do I need? */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#0B5D3B] dark:text-emerald-400 rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">How Many ECTS Do I Need?</h3>
          </div>

          <ul className="text-xs md:text-sm text-slate-600 dark:text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>60 ECTS:</strong> Represents 1 full-time academic year (~1,500–1,800 workload hours).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>30 ECTS:</strong> Represents 1 full-time academic semester (~750–900 workload hours).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>180 ECTS:</strong> Standard 3-year European Bachelor's degree qualification.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>240 ECTS:</strong> Standard 4-year European Bachelor's degree qualification.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B5D3B] dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>60–120 ECTS:</strong> Standard Master's degree programme (1 to 2 years duration).</span>
            </li>
          </ul>
        </div>

      </div>

      {/* 6. FAQ Accordion Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B5D3B] dark:text-emerald-400 bg-[#0B5D3B]/10 px-3 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
            ECTS Credit Conversion FAQs
          </h2>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqList.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 md:p-5 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-4 font-bold text-xs md:text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#0B5D3B] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 md:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON-LD FAQ Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqList.map((item) => ({
              "@type": "Question",
              "name": item.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
              }
            }))
          })
        }}
      />

    </div>
  );
};
