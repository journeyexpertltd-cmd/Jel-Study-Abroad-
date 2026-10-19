import React, { useState } from "react";
import { 
  GraduationCap, 
  Languages, 
  Compass, 
  Wallet, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  Award, 
  AlertCircle, 
  PhoneCall, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { useToast } from "../context/ToastContext";

export interface EligibilityFormData {
  // Step 1: Academic Info
  highestEducation: string;
  majorField: string;
  cgpa: string;
  cgpaScale: string;
  graduationYear: string;

  // Step 2: Language Proficiency
  englishTest: "IELTS" | "PTE" | "TOEFL" | "DUOLINGO" | "NOT_TAKEN";
  overallScore: string;
  bandScores: {
    listening: string;
    reading: string;
    writing: string;
    speaking: string;
  };

  // Step 3: Target Destination & Major
  targetCountry: "United Kingdom" | "United States" | "Canada" | "Australia" | "Germany" | "Ireland" | "Malaysia";
  targetDegreeLevel: "Bachelor's Degree" | "Master's Degree / M.Sc." | "Doctorate / Ph.D." | "Diploma / Foundation";
  preferredMajor: string;

  // Step 4: Budget & Sponsorship
  annualBudgetGbp: string;
  sponsorshipStatus: "Family Sponsored" | "Self Funded" | "Seeking 100% Scholarship" | "Bank Loan";
  hasHoldingBankStatement: "Yes (28+ Days)" | "In Progress" | "Not Yet Started";
}

export interface UniversityMatch {
  name: string;
  city: string;
  country: string;
  ranking: string;
  acceptanceChance: "High" | "Competitive" | "Reach";
  estimatedTuition: string;
  scholarshipOffer: string;
  postStudyWorkVisa: string;
}

export interface AssessmentResult {
  matchPercentage: number;
  country: string;
  visaProbability: number;
  visaProbabilityLabel: "High" | "Moderate" | "Strict / GTE Review Needed";
  eligibleUniversities: UniversityMatch[];
  strengths: string[];
  gteRiskFactors: string[];
  strategicAdvice: string;
  recommendedIntake: string;
  assignedCounselor?: {
    name: string;
    desk: string;
    phone: string;
    email: string;
  };
  tuitionToScholarshipEstimates?: {
    averageGrossTuition: string;
    averageScholarshipAward: string;
    estimatedNetPayable: string;
    livingFundProofRequired: string;
  };
}

const INITIAL_FORM: EligibilityFormData = {
  highestEducation: "Bachelor's Degree",
  majorField: "Computer Science & Engineering",
  cgpa: "3.40",
  cgpaScale: "4.00",
  graduationYear: "2024",
  englishTest: "IELTS",
  overallScore: "6.5",
  bandScores: {
    listening: "6.5",
    reading: "6.5",
    writing: "6.0",
    speaking: "6.5",
  },
  targetCountry: "United Kingdom",
  targetDegreeLevel: "Master's Degree / M.Sc.",
  preferredMajor: "Data Science & Artificial Intelligence",
  annualBudgetGbp: "£14,000 - £20,000",
  sponsorshipStatus: "Family Sponsored",
  hasHoldingBankStatement: "Yes (28+ Days)"
};

export function AIEligibilityChecker({ onBookCounselor }: { onBookCounselor?: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<EligibilityFormData>(INITIAL_FORM);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Quick form field update helper
  const updateField = <K extends keyof EligibilityFormData>(field: K, value: EligibilityFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      calculateEligibility();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const calculateEligibility = async () => {
    setIsCalculating(true);
    setResult(null);

    // Call server Gemini endpoint /api/ai/assess-eligibility
    try {
      const response = await fetch("/api/ai/assess-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cgpa: formData.cgpa,
          englishScore: formData.englishTest === "NOT_TAKEN" ? "Not Taken Yet" : formData.overallScore,
          targetCountry: formData.targetCountry,
          budget: formData.annualBudgetGbp,
          fieldOfStudy: formData.preferredMajor || formData.majorField
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const matchedUnis: UniversityMatch[] = (data.topUniversities || []).map((u: any) => ({
          name: u.name,
          city: u.city,
          country: u.country,
          ranking: u.qsRanking || "QS Top 500",
          acceptanceChance: (u.acceptanceChance as any) || "High",
          estimatedTuition: u.estimatedTuition || "£16,500 / yr",
          scholarshipOffer: u.scholarshipOffer || "Merit Bursary Available",
          postStudyWorkVisa: u.estimatedNetTuition ? `Net: ${u.estimatedNetTuition}` : "2-3 Years Post-Study Work Rights"
        }));
        
        setResult({
          matchPercentage: data.matchPercentage || 86,
          country: data.targetCountry || formData.targetCountry,
          visaProbability: data.visaProbability || 88,
          visaProbabilityLabel: data.visaProbabilityLabel || (data.visaProbability >= 80 ? "High" : "Moderate"),
          eligibleUniversities: matchedUnis.length > 0 ? matchedUnis : getUniversityMatches(formData.targetCountry, formData.preferredMajor),
          strengths: data.strengths || [
            "Strong academic CGPA meeting direct Tier-1 entry requirements",
            "English language proficiency satisfies Home Office CAS thresholds without Pre-sessional English",
            "Continuous financial sponsorship profile aligns with GTE criteria"
          ],
          gteRiskFactors: data.challenges || [
            "Need to ensure 28-day funds holding period is strictly unbroken before CAS issuance",
            "Statement of Purpose (SOP) must explain course relevance to Bangladesh market career options"
          ],
          strategicAdvice: data.strategicRoadmap || "Your profile qualifies for direct entry into reputable public universities. We recommend securing unconditional offers promptly and lodging the visa 3 months ahead of your intake term.",
          recommendedIntake: data.recommendedIntake || "September 2026 / January 2027",
          assignedCounselor: data.assignedCounselor,
          tuitionToScholarshipEstimates: data.tuitionToScholarshipEstimates
        });

        // Fire background counselor & WhatsApp alert notification
        try {
          fetch("/api/notifications/send-alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentName: "Verified Applicant",
              phone: "+8801926400400",
              email: "admissions.lead@jel-studyabroad.com",
              matchScore: data.matchPercentage || 86,
              targetCountry: formData.targetCountry,
              visaProbability: data.visaProbability || 88,
              fieldOfStudy: formData.preferredMajor || formData.majorField,
              source: "AI Eligibility Assessment Engine"
            })
          }).catch((err) => console.warn("Background notification dispatch:", err));
        } catch {
          // Non-blocking notification
        }
      } else {
        throw new Error("Server response non-200");
      }
    } catch (e) {
      // Local fallback calculation based on student inputs
      const cgpaNum = parseFloat(formData.cgpa) || 3.0;
      const engScoreNum = parseFloat(formData.overallScore) || 6.0;
      let calculatedScore = 75;
      
      if (cgpaNum >= 3.5) calculatedScore += 10;
      else if (cgpaNum >= 3.0) calculatedScore += 5;

      if (formData.englishTest !== "NOT_TAKEN" && engScoreNum >= 6.5) calculatedScore += 8;
      if (formData.hasHoldingBankStatement === "Yes (28+ Days)") calculatedScore += 5;

      const finalScore = Math.min(94, Math.max(62, calculatedScore));
      const visaProb = finalScore > 80 ? 88 : 74;

      setResult({
        matchPercentage: finalScore,
        country: formData.targetCountry,
        visaProbability: visaProb,
        visaProbabilityLabel: visaProb >= 85 ? "High" : "Moderate",
        eligibleUniversities: getUniversityMatches(formData.targetCountry, formData.preferredMajor),
        strengths: [
          `Solid academic pedigree in ${formData.majorField} (CGPA: ${formData.cgpa})`,
          formData.englishTest === "NOT_TAKEN" 
            ? "Opportunity for Medium of Instruction (MOI) waiver or in-house Oxford ELLT test"
            : `Proficiency certified via ${formData.englishTest} (Band ${formData.overallScore})`,
          "Family financial sponsorship readily aligns with embassy maintenance funds regulations"
        ],
        gteRiskFactors: [
          "Immigration case officer scrutinizes non-gap academic continuity",
          "Visa officer expects clear justification of return to Bangladesh post-graduation"
        ],
        strategicAdvice: `Based on your profile for ${formData.targetCountry}, you have a prime standing for standard admission and merit-based bursaries. JEL Study Abroad will fast-track your university application without service fees.`,
        recommendedIntake: "September 2026 / January 2027",
        assignedCounselor: {
          name: "Farhana Haque",
          desk: "Senior Admissions Desk",
          phone: "+8801926400401",
          email: "admissions@journeyexpertbd.com"
        }
      });
    } finally {
      setIsCalculating(false);
      setStep(5); // Show results screen
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getUniversityMatches = (country: string, major: string): UniversityMatch[] => {
    switch (country) {
      case "United Kingdom":
        return [
          {
            name: "University of Greenwich, London",
            city: "London",
            country: "UK",
            ranking: "Top 100 UK Modern Universities",
            acceptanceChance: "High",
            estimatedTuition: "£16,000 - £17,500 / year",
            scholarshipOffer: "£3,000 International Merit Award",
            postStudyWorkVisa: "2 Years Graduate Route"
          },
          {
            name: "University of Hertfordshire",
            city: "Hatfield (Greater London)",
            country: "UK",
            ranking: "Top UK TEF Gold Rated",
            acceptanceChance: "High",
            estimatedTuition: "£15,500 / year",
            scholarshipOffer: "Up to £2,500 Chancellor's Scholarship",
            postStudyWorkVisa: "2 Years Graduate Route"
          },
          {
            name: "Ulster University (London / Birmingham Campus)",
            city: "London / Birmingham",
            country: "UK",
            ranking: "QS Ranked Institution",
            acceptanceChance: "High",
            estimatedTuition: "£14,500 / year",
            scholarshipOffer: "£2,000 Early Bird Acceptance Grant",
            postStudyWorkVisa: "2 Years Graduate Route"
          }
        ];
      case "Canada":
        return [
          {
            name: "University of Windsor",
            city: "Windsor, Ontario",
            country: "Canada",
            ranking: "Top Public Canadian Research Uni",
            acceptanceChance: "Competitive",
            estimatedTuition: "CAD $26,000 / year",
            scholarshipOffer: "CAD $3,500 Entrance Bursary",
            postStudyWorkVisa: "Up to 3 Years PGWP"
          },
          {
            name: "Fanshawe College / Western Pathway",
            city: "London, Ontario",
            country: "Canada",
            ranking: "Designated Learning Institution (DLI)",
            acceptanceChance: "High",
            estimatedTuition: "CAD $17,000 / year",
            scholarshipOffer: "CAD $2,000 Global Student Award",
            postStudyWorkVisa: "3 Years Post-Grad Work Permit"
          }
        ];
      case "United States":
        return [
          {
            name: "University of North Texas",
            city: "Denton, Texas",
            country: "USA",
            ranking: "Tier One Research University",
            acceptanceChance: "High",
            estimatedTuition: "$18,500 / year (In-state waiver potential)",
            scholarshipOffer: "$1,000 Competitive Scholarship + In-State Tuition",
            postStudyWorkVisa: "3 Years STEM OPT"
          },
          {
            name: "Cleveland State University",
            city: "Cleveland, Ohio",
            country: "USA",
            ranking: "US News Ranked Top Public",
            acceptanceChance: "High",
            estimatedTuition: "$19,000 / year",
            scholarshipOffer: "Up to $5,000 Academic Excellence Waiver",
            postStudyWorkVisa: "3 Years STEM OPT"
          }
        ];
      case "Australia":
        return [
          {
            name: "Deakin University",
            city: "Melbourne, Victoria",
            country: "Australia",
            ranking: "Top 1% Worldwide (QS Top 250)",
            acceptanceChance: "Competitive",
            estimatedTuition: "AUD $34,000 / year",
            scholarshipOffer: "25% STEM & Global Scholarship",
            postStudyWorkVisa: "3-4 Years Regional / Metro 485 Visa"
          },
          {
            name: "Federation University Australia",
            city: "Ballarat / Brisbane",
            country: "Australia",
            ranking: "#1 in Australia for Employability",
            acceptanceChance: "High",
            estimatedTuition: "AUD $28,000 / year",
            scholarshipOffer: "16% Guaranteed Foundation Scholarship",
            postStudyWorkVisa: "4 Years Extended Regional Visa"
          }
        ];
      default:
        return [
          {
            name: "IU International University of Applied Sciences",
            city: "Berlin / Bad Honnef",
            country: "Germany",
            ranking: "Accredited German State-Recognized",
            acceptanceChance: "High",
            estimatedTuition: "€8,000 - €11,000 / year",
            scholarshipOffer: "Up to 50% Online/Blended Scholarship",
            postStudyWorkVisa: "18 Months Post-Study Job Seeker Visa"
          },
          {
            name: "Taylor's University (Transfer Pathway)",
            city: "Subang Jaya",
            country: "Malaysia",
            ranking: "#1 Private Uni in Southeast Asia",
            acceptanceChance: "High",
            estimatedTuition: "$6,500 - $8,500 / year",
            scholarshipOffer: "20% Merit Waiver",
            postStudyWorkVisa: "Direct Pathway to UK/Australia"
          }
        ];
    }
  };

  const downloadReport = () => {
    if (!result) return;
    setDownloadSuccess(true);

    const reportContent = `
======================================================================
JL STUDY ABROAD - OFFICIAL AI STUDENT ELIGIBILITY & SCHOLARSHIP REPORT
Brand of Journey Expert Limited (JEL)
Official Website: https://journeyexpertbd.com | Tel: +8801926400400
Office: 189/A (2nd Floor), Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka
======================================================================

CANDIDATE ASSESSMENT SUMMARY:
- Academic Standing: ${formData.highestEducation} in ${formData.majorField}
- CGPA / GPA: ${formData.cgpa} on ${formData.cgpaScale} Scale (Graduation: ${formData.graduationYear})
- English Proficiency: ${formData.englishTest} (Score: ${formData.overallScore})
- Target Destination: ${formData.targetCountry}
- Target Major: ${formData.preferredMajor}
- Degree Tier: ${formData.targetDegreeLevel}
- Annual Tuition Budget: ${formData.annualBudgetGbp}
- Financial Sponsorship: ${formData.sponsorshipStatus} (Holding: ${formData.hasHoldingBankStatement})

AI EVALUATION METRICS:
* Overall Match Score: ${result.matchPercentage}%
* Destination Fit: High alignment with ${result.country} educational policy
* Visa Success Probability: ${result.visaProbability}% (${result.visaProbabilityLabel})
* Optimal Intake: ${result.recommendedIntake}

KEY STRENGTHS:
${result.strengths.map(s => `[+] ${s}`).join("\n")}

CRITICAL GTE & COMPLIANCE CONSIDERATIONS:
${result.gteRiskFactors.map(r => `[!] ${r}`).join("\n")}

RECOMMENDED INSTITUTIONS & ESTIMATED SCHOLARSHIPS:
${result.eligibleUniversities.map((u, i) => `
${i + 1}. ${u.name} (${u.city}, ${u.country})
   - Ranking: ${u.ranking}
   - Acceptance Feasibility: ${u.acceptanceChance}
   - Approx Tuition: ${u.estimatedTuition}
   - Scholarship Opportunity: ${u.scholarshipOffer}
   - Post-Study Work Rights: ${u.postStudyWorkVisa}
`).join("")}

JEL VISA STRATEGIC ADVISORY:
${result.strategicAdvice}

----------------------------------------------------------------------
CONFIDENTIALITY & DISCLAIMER:
This evaluation is generated using the Journey Expert Limited (JEL) GTE 
assessment algorithm. Final admission and visa issuance are the sole 
discretion of the university and respective embassy.

To start your application with zero consultancy fees:
Book 1:1 Consultation with Senior Counselor: +8801926400400 (WhatsApp)
Head Office: 189/A, Abdul Motin Complex, Tejgaon, Dhaka-1215
======================================================================
`;

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `JEL-AI-Eligibility-Report-${formData.targetCountry.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      "Report Downloaded",
      `Your JEL GTE Eligibility Assessment for ${formData.targetCountry} has been downloaded.`
    );

    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const stepsList = [
    { num: 1, label: "Academic Info", icon: GraduationCap },
    { num: 2, label: "Language Test", icon: Languages },
    { num: 3, label: "Destination & Major", icon: Compass },
    { num: 4, label: "Budget & Funds", icon: Wallet }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-sans" id="ai-eligibility-checker">
      {/* Header Banner */}
      <div className="bg-[#05452d] px-6 py-7 sm:px-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold mb-2 backdrop-blur-sm border border-emerald-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JL Study Abroad AI Engine • Journey Expert Limited</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              AI Student Eligibility & Scholarship Checker
            </h2>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
              Get an instant, data-backed assessment of your university match score, estimated scholarships, and embassy visa success probability.
            </p>
          </div>
          <div className="shrink-0 flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-300">GTE Compliance</div>
              <div className="text-xs font-bold text-emerald-300">Real-time Verified</div>
            </div>
          </div>
        </div>

        {/* Multi-Stage Stepper Progress Bar (Hidden on Results page) */}
        {step <= 4 && (
          <div className="mt-7 pt-5 border-t border-emerald-600/40">
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {stepsList.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.num;
                const isCompleted = step > s.num;

                return (
                  <div key={s.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                        isActive
                          ? "bg-amber-400 text-slate-900 ring-4 ring-amber-400/30 shadow-lg scale-105"
                          : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-900/60 text-emerald-300/60 border border-emerald-700/50"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                      isActive ? "text-amber-300" : isCompleted ? "text-emerald-200" : "text-emerald-400/60"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-emerald-900/60 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8">
        {/* =================================================== */}
        {/* STEP 1: ACADEMIC INFO */}
        {/* =================================================== */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300" id="step-1-academic">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#05452d]" />
                Step 1: Academic Background
              </h3>
              <p className="text-xs text-slate-500">
                Provide your highest completed degree and grade details for credential evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Highest Education Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.highestEducation}
                  onChange={(e) => updateField("highestEducation", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05452d] focus:bg-white"
                >
                  <option value="Bachelor's Degree">Bachelor's Degree / B.Sc. / BBA / BA</option>
                  <option value="Master's Degree">Master's Degree / M.Sc. / MBA</option>
                  <option value="Higher Secondary / HSC / A Level">Higher Secondary / HSC / A-Levels / 12th Standard</option>
                  <option value="Diploma / PolyTechnic">4-Year Polytechnic / Technical Diploma</option>
                  <option value="Secondary School / SSC / O Level">Secondary School Certificate (SSC / O-Levels)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Major or Study Discipline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Business, EEE, Pharmacy"
                  value={formData.majorField}
                  onChange={(e) => updateField("majorField", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05452d] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cumulative CGPA / GPA <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="5.0"
                    placeholder="e.g. 3.45"
                    value={formData.cgpa}
                    onChange={(e) => updateField("cgpa", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05452d] focus:bg-white"
                  />
                  <select
                    value={formData.cgpaScale}
                    onChange={(e) => updateField("cgpaScale", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#05452d]"
                  >
                    <option value="4.00">Out of 4.00 Scale</option>
                    <option value="5.00">Out of 5.00 Scale</option>
                    <option value="100%">Percentage (e.g. 75%)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Year of Graduation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) => updateField("graduationYear", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05452d] focus:bg-white"
                >
                  {["2026 (Upcoming)", "2025", "2024", "2023", "2022", "2021", "2020", "2019 or earlier"].map(y => (
                    <option key={y} value={y.split(" ")[0]}>{y}</option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400">Study gaps over 2 years will be evaluated for professional work experience proof.</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* STEP 2: LANGUAGE PROFICIENCY */}
        {/* =================================================== */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300" id="step-2-language">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Languages className="w-5 h-5 text-[#05452d]" />
                Step 2: English Language Proficiency
              </h3>
              <p className="text-xs text-slate-500">
                Select your standardized English language test or indicate if you plan to sit for one soon.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: "IELTS", label: "IELTS Academic", badge: "Most Popular" },
                { id: "PTE", label: "PTE Academic", badge: "Fast Results" },
                { id: "TOEFL", label: "TOEFL iBT", badge: "US Standard" },
                { id: "DUOLINGO", label: "Duolingo DET", badge: "Online" },
                { id: "NOT_TAKEN", label: "Not Taken Yet", badge: "MOI / Waiver" }
              ].map((test) => (
                <button
                  key={test.id}
                  type="button"
                  onClick={() => updateField("englishTest", test.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                    formData.englishTest === test.id
                      ? "border-[#05452d] bg-[#05452d]/5 ring-2 ring-[#05452d]/20 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full inline-block mb-1">
                    {test.badge}
                  </span>
                  <span className={`text-xs font-bold ${formData.englishTest === test.id ? "text-[#05452d]" : "text-slate-700"}`}>
                    {test.label}
                  </span>
                </button>
              ))}
            </div>

            {formData.englishTest !== "NOT_TAKEN" ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Overall Score / Band <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {formData.englishTest === "IELTS" ? "e.g. 6.5 (Minimum 6.0 standard)" : "e.g. 58 (PTE) or 85 (TOEFL)"}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 6.5"
                    value={formData.overallScore}
                    onChange={(e) => updateField("overallScore", e.target.value)}
                    className="w-32 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-base font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-[#05452d]"
                  />
                </div>

                {formData.englishTest === "IELTS" && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Individual Band Scores (Optional):</span>
                    <div className="grid grid-cols-4 gap-2">
                      {["listening", "reading", "writing", "speaking"].map((band) => (
                        <div key={band} className="text-center">
                          <label className="text-[10px] uppercase font-bold text-slate-500 block capitalize">{band}</label>
                          <input
                            type="text"
                            placeholder="6.0"
                            value={(formData.bandScores as any)[band]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              bandScores: { ...prev.bandScores, [band]: e.target.value }
                            }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 text-xs text-center font-semibold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold mb-0.5">No Test Taken Yet?</strong>
                  JEL Study Abroad offers Medium of Instruction (MOI) waivers for select UK & Malaysian universities, as well as complimentary mock IELTS sessions at our Tejgaon office.
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================== */}
        {/* STEP 3: TARGET DESTINATION & MAJOR */}
        {/* =================================================== */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300" id="step-3-destination">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#05452d]" />
                Step 3: Target Country & Academic Discipline
              </h3>
              <p className="text-xs text-slate-500">
                Choose where you wish to pursue your higher studies and your desired specialization.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Preferred Destination Country <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "United Kingdom", flag: "🇬🇧", tag: "2-Yr PSW" },
                  { name: "United States", flag: "🇺🇸", tag: "3-Yr STEM OPT" },
                  { name: "Canada", flag: "🇨🇦", tag: "3-Yr PGWP" },
                  { name: "Australia", flag: "🇦🇺", tag: "High PR Pathway" },
                  { name: "Germany", flag: "🇩🇪", tag: "Zero/Low Tuition" },
                  { name: "Ireland", flag: "🇮🇪", tag: "Tech Hub Europe" },
                  { name: "Malaysia", flag: "🇲🇾", tag: "Budget Pathway" }
                ].map((country) => (
                  <button
                    key={country.name}
                    type="button"
                    onClick={() => updateField("targetCountry", country.name as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      formData.targetCountry === country.name
                        ? "border-[#05452d] bg-[#05452d]/5 ring-2 ring-[#05452d]/20 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{country.flag}</div>
                    <div className="text-xs font-bold text-slate-900">{country.name}</div>
                    <div className="text-[10px] text-emerald-700 font-medium">{country.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Degree Tier <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.targetDegreeLevel}
                  onChange={(e) => updateField("targetDegreeLevel", e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05452d]"
                >
                  <option value="Master's Degree / M.Sc.">Postgraduate (Master's / M.Sc. / MBA)</option>
                  <option value="Bachelor's Degree">Undergraduate (Bachelor's / B.Sc. / BBA)</option>
                  <option value="Doctorate / Ph.D.">Doctorate / Ph.D. Research</option>
                  <option value="Diploma / Foundation">Foundation / Pre-Master's / Diploma</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Preferred Subject or Major <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Science, International Business, Cyber Security"
                  value={formData.preferredMajor}
                  onChange={(e) => updateField("preferredMajor", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05452d] focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* STEP 4: BUDGET & SPONSORSHIP */}
        {/* =================================================== */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300" id="step-4-budget">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#05452d]" />
                Step 4: Financial Capacity & Sponsorship Status
              </h3>
              <p className="text-xs text-slate-500">
                Immigration authorities mandate proof of tuition and living expenses for visa clearance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Estimated Annual Tuition Budget <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.annualBudgetGbp}
                  onChange={(e) => updateField("annualBudgetGbp", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05452d]"
                >
                  <option value="Under £12,000 / year">Under £12,000 / year (Budget Friendly / Malaysia / Public EU)</option>
                  <option value="£12,000 - £16,000">£12,000 - £16,000 / year (Standard UK/Canada College)</option>
                  <option value="£16,000 - £22,000">£16,000 - £22,000 / year (Mid-Tier UK / Australian Universities)</option>
                  <option value="£22,000+ / year">£22,000+ / year (Top 100 Russell Group / Tier-1 US)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sponsorship Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.sponsorshipStatus}
                  onChange={(e) => updateField("sponsorshipStatus", e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05452d]"
                >
                  <option value="Family Sponsored">Family Sponsored (Parents / Blood Relative)</option>
                  <option value="Self Funded">Self Funded (Personal Savings / Business)</option>
                  <option value="Bank Loan">Approved Student Education Loan</option>
                  <option value="Seeking 100% Scholarship">Seeking 100% Full Scholarship</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  28-Day Bank Statement Holding Readiness <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: "Yes (28+ Days)", desc: "Funds already held in approved bank" },
                    { val: "In Progress", desc: "Currently aging funds in bank" },
                    { val: "Not Yet Started", desc: "Need guidance on holding rules" }
                  ].map((option) => (
                    <button
                      key={option.val}
                      type="button"
                      onClick={() => updateField("hasHoldingBankStatement", option.val as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.hasHoldingBankStatement === option.val
                          ? "border-[#05452d] bg-[#05452d]/5 ring-2 ring-[#05452d]/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{option.val}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* STEP 5: DYNAMIC RESULTS SCREEN UI */}
        {/* =================================================== */}
        {step === 5 && result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" id="step-5-results">
            {/* Top Score Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Match Score Gauge */}
              <div className="bg-emerald-950 text-white rounded-2xl p-6 text-center flex flex-col justify-between items-center relative overflow-hidden shadow-lg">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
                <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                  Overall Match Score
                </span>
                <div className="my-4 relative">
                  <div className="w-28 h-28 rounded-full border-4 border-emerald-800/80 flex items-center justify-center bg-emerald-900/60 shadow-inner">
                    <span className="text-3xl font-extrabold text-amber-400 font-display">
                      {result.matchPercentage}%
                    </span>
                  </div>
                  <div className="absolute -bottom-2 inset-x-0 mx-auto w-max bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Strong Candidate
                  </div>
                </div>
                <p className="text-xs text-emerald-200/90 font-medium">
                  High profile synergy for {result.country}
                </p>
              </div>

              {/* Visa Success Probability Meter */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between md:col-span-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Visa Success Probability Meter
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                      {result.visaProbabilityLabel} • {result.visaProbability}%
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    GTE & Genuine Student Assessment
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Calculated against latest 2026 Home Office & Embassy financial holding thresholds and academic progression checks.
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-3 rounded-full mt-4 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${result.visaProbability}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 mt-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Recommended Intake:</span>
                    <strong className="text-slate-800 font-semibold">{result.recommendedIntake}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Consultancy Service Charge:</span>
                    <strong className="text-emerald-700 font-semibold">100% Free at JEL</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* University Matches & Scholarship Opportunities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#05452d]" />
                  Recommended Partner Universities & Scholarship Estimates
                </h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  {result.eligibleUniversities.length} Institutions Matched
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.eligibleUniversities.map((uni, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-xl p-4.5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {uni.ranking}
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {uni.acceptanceChance} Chance
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 leading-snug">
                        {uni.name}
                      </h5>
                      <span className="text-xs text-slate-500">{uni.city}, {uni.country}</span>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tuition:</span>
                        <span className="font-semibold text-slate-800">{uni.estimatedTuition}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-700 font-bold">
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          Scholarship:
                        </span>
                        <span>{uni.scholarshipOffer}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                        <span>Work Rights:</span>
                        <span className="font-medium text-slate-700">{uni.postStudyWorkVisa}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Strengths & GTE Considerations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm uppercase tracking-wide">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Your Profile Strengths</span>
                </div>
                <ul className="space-y-2">
                  {result.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                      <span className="text-emerald-600 font-bold select-none">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm uppercase tracking-wide">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>GTE / Compliance Roadmap Tasks</span>
                </div>
                <ul className="space-y-2">
                  {result.gteRiskFactors.map((rf, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                      <span className="text-amber-600 font-bold select-none">!</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strategic Advice Card */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-3 shadow-inner">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2">
                <TrendingUp className="w-4 h-4" />
                <span>JEL Senior Counselor Strategy Directive</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {result.strategicAdvice}
              </p>
            </div>

            {/* Financial Estimates & Living Funds Rule */}
            {result.tuitionToScholarshipEstimates && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm uppercase tracking-wide">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    <span>Cost of Attendance & Solvency Benchmark ({result.country})</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    2026 Embassy Threshold
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Avg Gross Tuition</span>
                    <span className="text-sm font-bold text-slate-900">{result.tuitionToScholarshipEstimates.averageGrossTuition}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Scholarship Award</span>
                    <span className="text-sm font-bold text-emerald-700">{result.tuitionToScholarshipEstimates.averageScholarshipAward}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Estimated Net Payable</span>
                    <span className="text-sm font-bold text-slate-900">{result.tuitionToScholarshipEstimates.estimatedNetPayable}</span>
                  </div>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Mandatory Solvency / Living Fund Requirement:</strong>
                    <span>{result.tuitionToScholarshipEstimates.livingFundProofRequired}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Assigned Specialist Counselor Desk */}
            {result.assignedCounselor && (
              <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Assigned Visa & Admissions Specialist
                    </span>
                    <h5 className="text-base font-bold text-white">{result.assignedCounselor.name}</h5>
                    <p className="text-xs text-slate-300">{result.assignedCounselor.desk}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/${result.assignedCounselor.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(result.assignedCounselor.name)},%20I%20completed%20the%20AI%20Eligibility%20Check%20for%20${encodeURIComponent(result.country)}%20and%20was%20matched%20with%20your%20desk.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WhatsApp Desk</span>
                  </a>
                  <a
                    href={`mailto:${result.assignedCounselor.email}?subject=Study%20Abroad%20Profile%20Assessment%20-${encodeURIComponent(result.country)}`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
                  >
                    <span>Email Counselor</span>
                  </a>
                </div>
              </div>
            )}

            {/* ACTION CTAs */}
            <div className="bg-[#05452d]/5 border border-[#05452d]/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Ready to lock your university seat & scholarships?
                </h4>
                <p className="text-xs text-slate-600">
                  Direct counseling with CEO Jahan Mim and Senior Visa Registrars at Journey Expert Limited.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={downloadReport}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold py-3 px-5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                  id="btn-download-ai-report"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>{downloadSuccess ? "Report Downloaded!" : "Download AI Report (PDF/Text)"}</span>
                </button>

                <a
                  href="https://wa.me/8801926400400?text=Hello%20JEL%20Counselor,%20I%20just%20completed%20the%20AI%20Eligibility%20Check%20and%20want%20to%20book%20a%201:1%20session."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#05452d] hover:bg-[#03301f] text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#05452d]/25 cursor-pointer"
                  id="btn-book-counselor"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Book 1:1 Expert Counselor</span>
                </a>
              </div>
            </div>

            {/* Retake button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors cursor-pointer"
              >
                ← Test with another qualification or country
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* Navigation Buttons for Multi-Stage Form */}
        {/* =================================================== */}
        {step <= 4 && (
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            <button
              type="button"
              disabled={isCalculating}
              onClick={handleNext}
              className="inline-flex items-center space-x-2 bg-[#05452d] hover:bg-[#03301f] disabled:opacity-70 text-white font-bold text-xs py-3 px-7 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-[#05452d]/20 cursor-pointer"
              id="btn-checker-next"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Profile against 2026 Embassies...</span>
                </>
              ) : step === 4 ? (
                <>
                  <span>Calculate Match & Feasibility</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </>
              ) : (
                <>
                  <span>Continue to Step {step + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
