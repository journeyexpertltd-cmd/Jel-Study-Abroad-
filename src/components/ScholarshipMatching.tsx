import React, { useState, useEffect } from "react";
import { 
  Award, Heart, Calendar, Percent, ShieldAlert, Sparkles, AlertCircle, 
  Search, ArrowRight, DollarSign, Check, HelpCircle
} from "lucide-react";

interface Scholarship {
  id: string;
  name: string;
  university: string;
  country: string;
  fundingAmount: string;
  deadline: string;
  minGPA: number;
  minIELTS: number;
  courseType: string;
  financialNeedRequired: boolean;
  successProbabilityBase: number; // Percent
}

export function ScholarshipMatching() {
  // Matching Engine Input States
  const [gpa, setGpa] = useState<number>(4.80);
  const [ielts, setIelts] = useState<number>(6.5);
  const [countryPref, setCountryPref] = useState<string>("United Kingdom");
  const [financialNeed, setFinancialNeed] = useState<boolean>(false);
  const [courseType, setCourseType] = useState<string>("Undergraduate");

  // Matched Outputs
  const [matches, setMatches] = useState<Array<Scholarship & { eligibilityScore: number; successProbability: number }>>([]);
  const [isMatching, setIsMatching] = useState<boolean>(false);

  const scholarshipDatabase: Scholarship[] = [
    { id: "sch-1", name: "Vice-Chancellor's Excellence Award", university: "University of Leeds", country: "United Kingdom", fundingAmount: "£5,000 Tuition Discount", deadline: "2026-08-30", minGPA: 4.5, minIELTS: 6.5, courseType: "Undergraduate", financialNeedRequired: false, successProbabilityBase: 80 },
    { id: "sch-2", name: "Great Bangladesh Scholars Award", university: "Coventry University", country: "United Kingdom", fundingAmount: "£10,000 Partial Funding", deadline: "2026-09-15", minGPA: 4.8, minIELTS: 7.0, courseType: "Postgraduate", financialNeedRequired: true, successProbabilityBase: 75 },
    { id: "sch-3", name: "International Merit Bursary", university: "York St John University", country: "United Kingdom", fundingAmount: "£2,500 Auto Discount", deadline: "2026-10-01", minGPA: 3.5, minIELTS: 6.0, courseType: "Undergraduate", financialNeedRequired: false, successProbabilityBase: 95 },
    { id: "sch-4", name: "Executive Dean's Scholarship", university: "University of Canada West", country: "Canada", fundingAmount: "$15,000 CAD Award", deadline: "2026-07-20", minGPA: 4.7, minIELTS: 6.5, courseType: "Undergraduate", financialNeedRequired: false, successProbabilityBase: 70 },
    { id: "sch-5", name: "Commonwealth Shared Scholarship Scheme", university: "Various Partner Colleges", country: "United Kingdom", fundingAmount: "100% Tuition + Living Stipend", deadline: "2026-07-15", minGPA: 5.0, minIELTS: 7.5, courseType: "Postgraduate", financialNeedRequired: true, successProbabilityBase: 35 },
    { id: "sch-6", name: "Sydney Scholars Award", university: "University of Sydney", country: "Australia", fundingAmount: "10,000 AUD Entrance Bursary", deadline: "2026-08-01", minGPA: 4.6, minIELTS: 6.5, courseType: "Undergraduate", financialNeedRequired: false, successProbabilityBase: 85 },
    { id: "sch-7", name: "Ontario Graduate Fellowship", university: "University of Toronto", country: "Canada", fundingAmount: "$8,500 CAD per semester", deadline: "2026-08-15", minGPA: 4.9, minIELTS: 7.0, courseType: "Postgraduate", financialNeedRequired: true, successProbabilityBase: 50 }
  ];

  const runMatchingEngine = () => {
    setIsMatching(true);
    
    setTimeout(() => {
      const calculated = scholarshipDatabase.map(sch => {
        // Calculate matching eligibility percentage based on inputs
        let score = 100;

        // GPA Delta Penalty
        if (gpa < sch.minGPA) {
          const delta = sch.minGPA - gpa;
          score -= Math.round(delta * 25); // Deduct for failing standard
        } else {
          score += 5; // Bonus for exceeding standard
        }

        // IELTS Delta Penalty
        if (ielts < sch.minIELTS) {
          const delta = sch.minIELTS - ielts;
          score -= Math.round(delta * 30);
        } else {
          score += 5;
        }

        // Country Match Modifier
        if (countryPref !== "All" && sch.country !== countryPref) {
          score -= 40; // High penalty for different country match
        }

        // Course Type Match Modifier
        if (sch.courseType !== courseType) {
          score -= 20;
        }

        // Financial Need Match Modifier
        if (sch.financialNeedRequired && !financialNeed) {
          score -= 15;
        } else if (sch.financialNeedRequired && financialNeed) {
          score += 10;
        }

        // Clamp scores between 0 and 100
        const finalEligibilityScore = Math.max(0, Math.min(100, score));

        // Calculate dynamic success probability
        const prob = Math.round(sch.successProbabilityBase * (finalEligibilityScore / 100));

        return {
          ...sch,
          eligibilityScore: finalEligibilityScore,
          successProbability: prob
        };
      })
      // Filter out total mismatches (below 35% eligibility) unless it is exact country
      .filter(sch => sch.eligibilityScore >= 30)
      // Rank by eligibility percentage (highest first) and success probability (highest first)
      .sort((a, b) => b.eligibilityScore - a.eligibilityScore || b.successProbability - a.successProbability);

      setMatches(calculated);
      setIsMatching(false);
    }, 600);
  };

  // Run initial match on component load
  useEffect(() => {
    runMatchingEngine();
  }, [gpa, ielts, countryPref, financialNeed, courseType]);

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300" id="scholarship-matching-root">
      
      {/* 1. Header Hero Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-[#1e293b] border border-slate-800 text-white p-6 sm:p-8 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#D4AF37] opacity-10 blur-3xl"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] bg-[#D4AF37] text-slate-950 font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
            Proprietary AI Matching Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
            AI Scholarship Matching Engine
          </h2>
          <p className="text-xs text-slate-350 font-light max-w-2xl leading-relaxed">
            Enter your exact test scores, academic standings, and target countries to immediately unlock direct institutional bursaries, entrance grants, and fully-funded state scholarships.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex items-center space-x-2 shrink-0 relative z-10">
          <Sparkles className="h-4.5 w-4.5 text-[#D4AF37] animate-pulse" />
          <span className="text-xs font-mono font-bold text-amber-300">Live Matching Active</span>
        </div>
      </div>

      {/* 2. Selection Inputs and Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-5 h-fit">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
              Profile Parameters
            </h3>
            <p className="text-[11px] text-slate-500 font-light">Fine-tune sliders to compute real-time probability changes.</p>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* GPA Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Student GPA (SSC / HSC)</span>
                <span className="text-slate-900 font-mono font-black bg-slate-100 px-2 py-0.5 rounded">
                  {gpa.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="3.0"
                max="5.0"
                step="0.1"
                value={gpa}
                onChange={(e) => setGpa(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0B5D3B]"
              />
            </div>

            {/* IELTS Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">English Competency (IELTS / PTE equivalent)</span>
                <span className="text-slate-900 font-mono font-black bg-slate-100 px-2 py-0.5 rounded">
                  Band {ielts.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="5.0"
                max="9.0"
                step="0.5"
                value={ielts}
                onChange={(e) => setIelts(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0B5D3B]"
              />
            </div>

            {/* Target country preference */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Study Destination Preference</label>
              <select
                value={countryPref}
                onChange={(e) => setCountryPref(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="All">All Countries (Browse All)</option>
              </select>
            </div>

            {/* Course Type */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Intended Level of Study</label>
              <div className="grid grid-cols-2 gap-2">
                {["Undergraduate", "Postgraduate"].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCourseType(lvl)}
                    className={`p-2 rounded-lg text-xs font-bold border transition ${
                      courseType === lvl 
                        ? "bg-[#0B5D3B]/10 border-[#0B5D3B] text-[#0B5D3B]" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Need toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-150">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Financial Need Check</span>
                <span className="text-[10px] text-slate-400 leading-none">Do you require fully-funded grants?</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={financialNeed} 
                  onChange={(e) => setFinancialNeed(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B5D3B]"></div>
              </label>
            </div>

          </div>
        </div>

        {/* Right Side: Matched Outputs List */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Section Summary */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                Matched Scholarship Portfolios
              </h3>
              <p className="text-[11px] text-slate-500 font-light">Showing options ranked dynamically with highest success probability matching your transcripts.</p>
            </div>
            
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 font-black px-2.5 py-1 rounded">
              {matches.length} matches discovered
            </span>
          </div>

          {/* Matches loop */}
          {isMatching ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <span className="animate-spin h-5 w-5 border-2 border-[#0B5D3B] rounded-full inline-block mr-2 align-middle"></span>
              <span>Evaluating scholarship portfolios...</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white border border-slate-150 p-8 rounded-2xl text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
              <h4 className="font-display font-bold text-slate-900 text-sm">No exact scholarship matches discovered</h4>
              <p className="text-xs text-slate-550 max-w-sm mx-auto leading-relaxed font-light">
                Try reducing your target country locks or increasing academic standings on the sidebar to find active programs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((sch, index) => {
                let badgeBg = "bg-rose-50 text-rose-700 border-rose-100";
                let probText = "Low Approval Odds";
                if (sch.successProbability >= 70) {
                  badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-100";
                  probText = "Exceptional Match";
                } else if (sch.successProbability >= 50) {
                  badgeBg = "bg-amber-50 text-amber-700 border-amber-100";
                  probText = "Favorable Match";
                }

                const isDeadlineSoon = new Date(sch.deadline).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;

                return (
                  <div 
                    key={sch.id} 
                    className={`border border-slate-200 bg-white p-5 rounded-2xl shadow-xs hover:border-slate-300 transition relative overflow-hidden ${
                      index === 0 ? "border-l-4 border-l-[#D4AF37]" : ""
                    }`}
                  >
                    {index === 0 && (
                      <span className="absolute top-0 right-0 bg-[#D4AF37] text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-bl uppercase tracking-wider">
                        Best Recommended Portfolio
                      </span>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      
                      {/* Left: Funding, Name, Uni */}
                      <div className="space-y-2 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            {sch.university}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold font-sans">
                            {sch.country}
                          </span>
                        </div>

                        <h4 className="font-display font-black text-slate-900 text-base">
                          {sch.name}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <div className="text-xs text-slate-600 font-bold bg-emerald-50 text-[#0B5D3B] px-2.5 py-1 rounded">
                            💰 Funding: <span className="font-black">{sch.fundingAmount}</span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-mono">
                            Min Req: GPA {sch.minGPA.toFixed(1)} • IELTS {sch.minIELTS.toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Scores & Probability */}
                      <div className="sm:text-right space-y-1.5 shrink-0 w-full sm:w-auto border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                        <div className="flex justify-between sm:justify-end items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">Eligibility Score</span>
                          <span className="font-mono font-black text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {sch.eligibilityScore}% Match
                          </span>
                        </div>

                        <div className="flex justify-between sm:justify-end items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">Visa/Admissions Prob</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeBg}`}>
                            {sch.successProbability}% ({probText})
                          </span>
                        </div>

                        {/* Deadline Alert */}
                        <div className="flex sm:justify-end items-center space-x-1 text-[10px]">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className={`${isDeadlineSoon ? "text-rose-500 font-bold animate-pulse" : "text-slate-500"}`}>
                            App Deadline: {sch.deadline} {isDeadlineSoon ? "(CLOSING SOON!)" : ""}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
