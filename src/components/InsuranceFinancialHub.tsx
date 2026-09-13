import React, { useState } from "react";
import { 
  ShieldCheck, Calculator, DollarSign, Globe, CheckCircle2, 
  ArrowRight, HeartPulse, Building2, AlertCircle, HelpCircle, FileCheck2, Phone
} from "lucide-react";

interface CountryFinancialMetric {
  country: string;
  flag: string;
  insuranceName: string;
  insuranceProvider: string;
  annualInsuranceCost: number;
  insuranceCurrency: string;
  financialProofName: string;
  financialProofType: "BLOCKED_ACCOUNT" | "GIC" | "BANK_STATEMENT";
  financialProofAmount: number;
  proofCurrency: string;
  bdtExchangeRate: number; // approximate conversion to BDT
  officialRequirementNote: string;
  partnerBadges: string[];
}

const FINANCIAL_DATA: Record<string, CountryFinancialMetric> = {
  UK: {
    country: "United Kingdom",
    flag: "🇬🇧",
    insuranceName: "NHS Immigration Health Surcharge (IHS)",
    insuranceProvider: "UK Visas and Immigration (UKVI)",
    annualInsuranceCost: 776,
    insuranceCurrency: "GBP (£)",
    financialProofName: "28-Consecutive-Day Bank Holding",
    financialProofType: "BANK_STATEMENT",
    financialProofAmount: 12006,
    proofCurrency: "GBP (£)",
    bdtExchangeRate: 154,
    officialRequirementNote: "Must maintain unbroken funds in a recognized Bangladesh schedule bank (EBL, City Bank, SCB) for 28 days prior to visa application date.",
    partnerBadges: ["UKVI Registered", "Direct IHS Portal Support"]
  },
  Australia: {
    country: "Australia",
    flag: "🇦🇺",
    insuranceName: "Overseas Student Health Cover (OSHC)",
    insuranceProvider: "Allianz Care / Bupa / Medibank",
    annualInsuranceCost: 650,
    insuranceCurrency: "AUD ($)",
    financialProofName: "Department of Home Affairs Living Cost",
    financialProofType: "BANK_STATEMENT",
    financialProofAmount: 29710,
    proofCurrency: "AUD ($)",
    bdtExchangeRate: 80,
    officialRequirementNote: "Mandatory OSHC policy covering the entire duration of student visa subclass 500 plus 2 months buffer.",
    partnerBadges: ["Allianz Care Partner", "Instant eCoE Verification"]
  },
  Canada: {
    country: "Canada",
    flag: "🇨🇦",
    insuranceName: "International Student Health Insurance (UHIP / Guard.me)",
    insuranceProvider: "Guard.me / Sun Life / Manulife",
    annualInsuranceCost: 950,
    insuranceCurrency: "CAD ($)",
    financialProofName: "Guaranteed Investment Certificate (GIC)",
    financialProofType: "GIC",
    financialProofAmount: 20635,
    proofCurrency: "CAD ($)",
    bdtExchangeRate: 88,
    officialRequirementNote: "Mandatory GIC through Scotiabank, CIBC, or ICICI Bank Canada for rapid SDS and Non-SDS study permit approvals.",
    partnerBadges: ["CIBC & Scotiabank Channel", "GIC Direct Transfer"]
  },
  Germany: {
    country: "Germany",
    flag: "🇩🇪",
    insuranceName: "German Statutory Health Insurance (Gesetzliche Krankenversicherung)",
    insuranceProvider: "Techniker Krankenkasse (TK) / Barmer",
    annualInsuranceCost: 1450,
    insuranceCurrency: "EUR (€)",
    financialProofName: "Sperrkonto (Certified Blocked Account)",
    financialProofType: "BLOCKED_ACCOUNT",
    financialProofAmount: 11904,
    proofCurrency: "EUR (€)",
    bdtExchangeRate: 132,
    officialRequirementNote: "Federal requirement of €992/month deposited in a German Federal Foreign Office approved blocked account (Expatrio / Fintiba).",
    partnerBadges: ["Expatrio Official Desk", "TK Health Insurance Authorized"]
  },
  USA: {
    country: "United States",
    flag: "🇺🇸",
    insuranceName: "Comprehensive International Student Health Insurance",
    insuranceProvider: "International Student Insurance (ISI) / ISO",
    annualInsuranceCost: 1650,
    insuranceCurrency: "USD ($)",
    financialProofName: "Form I-20 Cost of Attendance Solvency",
    financialProofType: "BANK_STATEMENT",
    financialProofAmount: 32000,
    proofCurrency: "USD ($)",
    bdtExchangeRate: 122,
    officialRequirementNote: "Demonstrate liquid tuition and living funds for the first academic year documented on Form I-20 / DS-2019.",
    partnerBadges: ["ACA Compliant Coverage", "SEVIS Form I-20 Compliance"]
  },
  Ireland: {
    country: "Ireland",
    flag: "🇮🇪",
    insuranceName: "Irish Student Private Medical Insurance",
    insuranceProvider: "Irish Life Health / Study & Protect",
    annualInsuranceCost: 550,
    insuranceCurrency: "EUR (€)",
    financialProofName: "INIS Proof of Financial Solvency",
    financialProofType: "BANK_STATEMENT",
    financialProofAmount: 10000,
    proofCurrency: "EUR (€)",
    bdtExchangeRate: 132,
    officialRequirementNote: "Required minimum maintenance funds of €10,000 for non-EEA students prior to visa lodgement.",
    partnerBadges: ["Irish Immigration Approved", "Instant Policy Issuance"]
  }
};

export function InsuranceFinancialHub() {
  const [selectedCountryKey, setSelectedCountryKey] = useState<string>("UK");
  const [durationYears, setDurationYears] = useState<number>(1);
  const [coverageType, setCoverageType] = useState<"SINGLE" | "COUPLE" | "FAMILY">("SINGLE");
  const [bookedStatus, setBookedStatus] = useState<string | null>(null);

  const current = FINANCIAL_DATA[selectedCountryKey] || FINANCIAL_DATA.UK;

  // Multiplier for couple/family
  const coverageMultiplier = coverageType === "SINGLE" ? 1 : coverageType === "COUPLE" ? 1.85 : 2.5;

  const totalInsuranceCost = Math.round(current.annualInsuranceCost * durationYears * coverageMultiplier);
  const totalInsuranceCostBdt = Math.round(totalInsuranceCost * current.bdtExchangeRate);

  const proofAmount = current.financialProofAmount;
  const proofAmountBdt = Math.round(proofAmount * current.bdtExchangeRate);

  const handleBookAssistance = () => {
    setBookedStatus(current.insuranceName);
    setTimeout(() => {
      setBookedStatus(null);
    }, 6000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden text-left" id="insurance-financial-hub">
      {/* Subtle Background Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#0B5D3B]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0B5D3B]/10 text-[#0B5D3B] text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-[#0B5D3B]" />
              Official Compliance Portal
            </span>
            <span className="bg-[#D4AF37]/15 text-[#8c6b12] text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Updated 2026 Regulations
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-slate-900 mt-2">
            Student Health Insurance & Financial Proof Hub
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Calculate exact compulsory health insurance (OSHC, IHS, TK) and mandatory blocked account/GIC solvency requirements for your target embassy.
          </p>
        </div>

        {/* Country Selector Pills */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-50 border border-slate-200/70 rounded-2xl shrink-0">
          {Object.entries(FINANCIAL_DATA).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setSelectedCountryKey(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCountryKey === key
                  ? "bg-[#0B5D3B] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <span>{data.flag}</span>
              <span>{key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
            Course Duration:
          </label>
          <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-1.5 border border-slate-200 rounded-xl">
            {[1, 2, 3, 4].map((years) => (
              <button
                key={years}
                onClick={() => setDurationYears(years)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  durationYears === years
                    ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {years} {years === 1 ? "Year" : "Years"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
            Coverage Beneficiaries:
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1.5 border border-slate-200 rounded-xl">
            {(["SINGLE", "COUPLE", "FAMILY"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setCoverageType(type)}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  coverageType === type
                    ? "bg-[#0B5D3B] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {type === "SINGLE" ? "Single Student" : type === "COUPLE" ? "Couple" : "Family"}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Real-Time FX Basis</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              1 {current.insuranceCurrency.split(" ")[0]} ≈ {current.bdtExchangeRate} BDT
            </p>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-1 rounded-md font-mono">
            Direct Bank Conversion
          </span>
        </div>
      </div>

      {/* 2-Column Comparison Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Card 1: Mandatory Health Insurance */}
        <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                Compulsory Student Health Cover
              </span>
              <span className="text-xl">{current.flag}</span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {current.insuranceName}
            </h4>
            <p className="text-xs text-slate-600">
              Provider Channel: <strong className="text-slate-800 font-semibold">{current.insuranceProvider}</strong>
            </p>

            {/* Price Calculations */}
            <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Estimated Premium ({durationYears} yr):</span>
                <span className="text-xl sm:text-2xl font-black text-[#0B5D3B] font-display">
                  {current.insuranceCurrency.split(" ")[0]} {totalInsuranceCost.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>Equivalent in Bangladeshi Taka:</span>
                <span className="font-bold text-slate-800 font-mono">
                  ≈ ৳ {totalInsuranceCostBdt.toLocaleString()} BDT
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {current.partnerBadges.map((badge, idx) => (
                <span key={idx} className="text-[10px] font-bold bg-white text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-md shadow-2xs">
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-emerald-200/60 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">Fast-track policy certificate within 24 hours.</span>
            <button
              onClick={handleBookAssistance}
              className="bg-[#0B5D3B] hover:bg-[#074028] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:scale-102 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Arrange Insurance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Living Costs & Blocked Account / GIC Solvency */}
        <div className="bg-gradient-to-br from-slate-50 to-amber-50/40 border border-amber-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-700" />
                {current.financialProofType === "BLOCKED_ACCOUNT" ? "Mandatory Blocked Account" : current.financialProofType === "GIC" ? "Mandatory GIC Solvency" : "Required Living Expense Proof"}
              </span>
              <span className="text-xl">{current.flag}</span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {current.financialProofName}
            </h4>
            <p className="text-xs text-slate-600">
              Regulatory Agency: <strong className="text-slate-800 font-semibold">{current.country} Immigration & High Commission</strong>
            </p>

            {/* Price Calculations */}
            <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Standard Proof Amount:</span>
                <span className="text-xl sm:text-2xl font-black text-amber-900 font-display">
                  {current.proofCurrency.split(" ")[0]} {proofAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>Equivalent in Bangladeshi Taka:</span>
                <span className="font-bold text-slate-800 font-mono">
                  ≈ ৳ {proofAmountBdt.toLocaleString()} BDT
                </span>
              </div>
            </div>

            {/* Requirement note */}
            <p className="text-[11px] text-slate-600 bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-lg leading-relaxed">
              <strong>Embassy Mandate:</strong> {current.officialRequirementNote}
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-amber-200/60 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">Assistance with Eastern Bank, SCB, Expatrio & CIBC.</span>
            <a
              href="https://wa.me/8801926400400"
              target="_blank"
              rel="noreferrer"
              className="bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:scale-102 flex items-center gap-1.5 shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Talk to Bank Advisor</span>
            </a>
          </div>
        </div>

      </div>

      {/* Confirmation Banner */}
      {bookedStatus && (
        <div className="mt-4 bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Request Registered:</strong> Your consultation for {bookedStatus} has been assigned to JEL's Finance Desk. We will call you within 30 minutes.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
            Hotline: +8801926400400
          </span>
        </div>
      )}
    </div>
  );
}
