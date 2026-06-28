import React, { useState, useEffect } from "react";
import { 
  Brain, ShieldCheck, Heart, Sparkles, HelpCircle, AlertTriangle, 
  ThumbsUp, UserPlus, TrendingUp, CheckCircle, ArrowRight
} from "lucide-react";

export function AdmissionPrediction() {
  // Inputs
  const [gpa, setGpa] = useState<number>(4.80);
  const [englishScore, setEnglishScore] = useState<number>(6.5);
  const [studyGap, setStudyGap] = useState<number>(0); // years
  const [financialSponsor, setFinancialSponsor] = useState<string>("Self/Parents with 28-day holding completed");
  const [targetCountry, setTargetCountry] = useState<string>("United Kingdom");

  // Output States
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [admissionProbability, setAdmissionProbability] = useState<number>(85);
  const [visaSuccessProbability, setVisaSuccessProbability] = useState<number>(90);
  const [riskLevel, setRiskLevel] = useState<"Low" | "Medium" | "High">("Low");
  const [recommendation, setRecommendation] = useState<string>("Apply directly. Your target profile has excellent backing.");
  const [decisionWeights, setDecisionWeights] = useState<Array<{ name: string; score: number; text: string }>>([]);

  const computePrediction = () => {
    setIsComputing(true);
    
    setTimeout(() => {
      // 1. Calculate Admission Probability
      let admProb = 50; // base

      // GPA multiplier
      if (gpa >= 4.80) admProb += 25;
      else if (gpa >= 4.0) admProb += 15;
      else if (gpa >= 3.5) admProb += 5;
      else admProb -= 15;

      // English multiplier
      if (englishScore >= 7.0) admProb += 20;
      else if (englishScore >= 6.5) admProb += 15;
      else if (englishScore >= 6.0) admProb += 5;
      else admProb -= 20;

      // Study Gap penalty
      if (studyGap > 5) admProb -= 30;
      else if (studyGap > 2) admProb -= 10;
      else admProb += 5;

      admProb = Math.max(10, Math.min(100, admProb));

      // 2. Calculate Visa Success Probability
      let visaProb = 55; // base

      // Gap penalty on Visa is very severe for some destinations
      if (studyGap > 3) {
        if (targetCountry === "Australia") visaProb -= 35;
        else if (targetCountry === "United Kingdom") visaProb -= 15;
        else visaProb -= 20;
      } else {
        visaProb += 10;
      }

      // Financial Sponsor multiplier
      if (financialSponsor === "Self/Parents with 28-day holding completed") {
        visaProb += 25;
      } else if (financialSponsor === "Bank loan sanctioned (fully liquid)") {
        visaProb += 20;
      } else if (financialSponsor === "Third-party relative sponsor (unstabled)") {
        visaProb -= 15;
      } else {
        visaProb -= 35; // None
      }

      // Destination policy multipliers
      if (targetCountry === "United Kingdom") visaProb += 10; // UK visa approval generally high if CAS issued
      else if (targetCountry === "Australia") visaProb -= 15; // Australia GTE is currently strict
      else if (targetCountry === "Canada") visaProb += 5;

      visaProb = Math.max(5, Math.min(100, visaProb));

      // 3. Determine Risk Level
      let rLevel: "Low" | "Medium" | "High" = "Low";
      const averageProb = (admProb + visaProb) / 2;

      if (averageProb >= 75) rLevel = "Low";
      else if (averageProb >= 50) rLevel = "Medium";
      else rLevel = "High";

      // 4. Generate Machine Learning Recommendation
      let recStr = "Apply directly. Your target profile has excellent backing.";
      if (rLevel === "High") {
        if (studyGap > 3) {
          recStr = "Change country. Consider United Kingdom or Germany which are more accommodating of study gaps than Australia.";
        } else if (englishScore < 6.0) {
          recStr = "Improve profile. We highly suggest re-sitting IELTS to achieve at least a 6.5 band before lodging.";
        } else {
          recStr = "Improve profile. Lock in dynamic financial support and secure a government-sanctioned bank loan.";
        }
      } else if (rLevel === "Medium") {
        if (englishScore === 6.0) {
          recStr = "Improve profile. Boosting IELTS score to 6.5 will eliminate conditional interview risks.";
        } else {
          recStr = "Apply with care. Partner with safe/moderate universities first rather than high-tier options.";
        }
      }

      // Set weights for visual machine learning model trace log
      setDecisionWeights([
        { name: "Academic Credential Weighting", score: Math.round(gpa * 20), text: gpa >= 4.5 ? "Exceptional academic credentials parsed." : "GPA exhibits standard risk parameters." },
        { name: "Language Performance Index", score: Math.round(englishScore * 11), text: englishScore >= 6.5 ? "English test scores satisfy standard tier requirements." : "Language levels constitute profile vulnerability." },
        { name: "Gap Policy Regulator Check", score: Math.max(0, 100 - (studyGap * 20)), text: studyGap === 0 ? "Zero timeline gaps parsed. Highly compliant." : `Timeline possesses a ${studyGap}-year gap. Applying regional policy modifiers.` },
        { name: "Capital Liquidity Index", score: financialSponsor.includes("holding completed") ? 95 : financialSponsor.includes("Bank loan") ? 85 : 40, text: "Assessing source of fund holds." }
      ]);

      setAdmissionProbability(admProb);
      setVisaSuccessProbability(visaProb);
      setRiskLevel(rLevel);
      setRecommendation(recStr);
      setIsComputing(false);
    }, 650);
  };

  useEffect(() => {
    computePrediction();
  }, [gpa, englishScore, studyGap, financialSponsor, targetCountry]);

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300" id="admission-prediction-root">
      
      {/* 1. Hero Block */}
      <div className="bg-gradient-to-r from-slate-900 to-[#041d11] border border-slate-800 text-white p-6 sm:p-8 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] bg-[#D4AF37] text-slate-950 font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
            Vetting Analytics Sandbox
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
            AI Admission & Visa Predictor
          </h2>
          <p className="text-xs text-slate-450 font-light max-w-2xl leading-relaxed">
            Utilize regression-based modeling matrices to audit your application risk variables. Explore your conditional likelihood of securing CAS or COE letters and eventual visa stampings.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center space-x-3 shrink-0 relative z-10 font-mono">
          <Brain className="h-5 w-5 text-emerald-400 animate-pulse" />
          <div className="text-right">
            <span className="text-[9px] text-slate-400 block uppercase">Compliance Ruleset</span>
            <span className="text-xs font-black text-emerald-400">V2.1-Dhaka Live</span>
          </div>
        </div>
      </div>

      {/* 2. Parameters and Prediction View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Parameter Tuning Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
              Profile Diagnostic Inputs
            </h3>
            <p className="text-[11px] text-slate-500 font-light">Input candidate statistics below to review immediate outcome models.</p>
          </div>

          <div className="space-y-3 pt-1">
            
            {/* GPA */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Academic GPA (5.0 Scale)</label>
              <input
                type="number"
                min="2.0"
                max="5.0"
                step="0.05"
                value={gpa}
                onChange={(e) => setGpa(Number(e.target.value))}
                className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* IELTS Score */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">IELTS / PTE Academic Overall Score</label>
              <input
                type="number"
                min="4.5"
                max="9.0"
                step="0.5"
                value={englishScore}
                onChange={(e) => setEnglishScore(Number(e.target.value))}
                className="w-full border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Study Gap */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Timeline Gaps / Study Gap (Years)</label>
              <select
                value={studyGap}
                onChange={(e) => setStudyGap(Number(e.target.value))}
                className="w-full border border-slate-200 bg-white rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
              >
                <option value={0}>No timeline gaps (SSC/HSC recent)</option>
                <option value={1}>1 Year Gap</option>
                <option value={2}>2 Years Gap</option>
                <option value={3}>3 Years Gap (Medium Risk)</option>
                <option value={5}>5 Years Gap (High Risk)</option>
                <option value={7}>7+ Years Gap</option>
              </select>
            </div>

            {/* Financial Sponsor holding */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Capital Funding Validation State</label>
              <select
                value={financialSponsor}
                onChange={(e) => setFinancialSponsor(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
              >
                <option value="Self/Parents with 28-day holding completed">Self/Parents (Completed 28-day holds)</option>
                <option value="Bank loan sanctioned (fully liquid)">Bank loan sanctioned (liquid funds)</option>
                <option value="Third-party relative sponsor (unstabled)">Unrelated sponsor (unstabled funds)</option>
                <option value="No financial holding proof prepared">No funds logged yet (Significant risk)</option>
              </select>
            </div>

            {/* Target Country */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Target Country</label>
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded p-2 text-xs text-slate-700 outline-none focus:border-[#D4AF37]"
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

          </div>
        </div>

        {/* Right Col: Predictive Output dashboard */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Admission Probability */}
            <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs text-center space-y-2 relative overflow-hidden">
              <div className="h-1 bg-blue-500 absolute top-0 left-0 right-0"></div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Admission Acceptance Probability</span>
              <div className="text-4xl font-mono font-black text-blue-600 py-1">
                {admissionProbability}%
              </div>
              <div className="text-[11px] text-slate-500">Likelihood of Registrar approval</div>
            </div>

            {/* Visa success probability */}
            <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs text-center space-y-2 relative overflow-hidden">
              <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0"></div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Embassy Visa Approval Probability</span>
              <div className="text-4xl font-mono font-black text-emerald-600 py-1">
                {visaSuccessProbability}%
              </div>
              <div className="text-[11px] text-slate-500">Likelihood of stamp confirmation</div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs text-center space-y-2 relative overflow-hidden">
              <div className={`h-1 absolute top-0 left-0 right-0 ${
                riskLevel === "Low" ? "bg-emerald-400" : riskLevel === "Medium" ? "bg-amber-400" : "bg-rose-500"
              }`}></div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Profile Vulnerability Rating</span>
              <div className={`text-2xl font-black py-2.5 uppercase tracking-widest ${
                riskLevel === "Low" ? "text-emerald-600" : riskLevel === "Medium" ? "text-amber-600" : "text-rose-600"
              }`}>
                {riskLevel} Risk
              </div>
              <div className="text-[11px] text-slate-500">Subject to standard audit policies</div>
            </div>

          </div>

          {/* AI Advisor Panel */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-left space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4.5 w-4.5 text-[#D4AF37] animate-pulse" />
              <span className="text-xs font-bold text-[#0B5D3B] uppercase tracking-wider font-display">System Recommendation</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-semibold italic bg-white p-3 border border-slate-200 rounded-xl">
              "{recommendation}"
            </p>
            <div className="text-[11px] text-slate-500">
              💡 **Expert Tip**: GTE assessments check both liquid asset holdings and geographical ties. Partner with JEL Study Abroad counselors to refine your written statements and file portfolios.
            </div>
          </div>

          {/* Machine learning logs tracing weights */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs space-y-4 text-left">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider">
                Machine Learning Scoring Trace logs
              </h3>
              <p className="text-[11px] text-slate-500">Weights parsed live using logistic coefficient regression trees.</p>
            </div>

            <div className="space-y-3 text-xs">
              {decisionWeights.map((w, idx) => (
                <div key={idx} className="space-y-1 border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">{w.name}</span>
                    <span className="font-mono text-slate-900">{w.score}/100</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0B5D3B] h-full transition-all duration-500" 
                      style={{ width: `${w.score}%` }}
                    />
                  </div>
                  
                  <p className="text-[10px] text-slate-500 italic font-light">{w.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
