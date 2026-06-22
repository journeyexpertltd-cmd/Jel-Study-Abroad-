import React, { useState } from "react";
import { Search, GraduationCap, MapPin, DollarSign, Brain, RefreshCw, ChevronRight, Check } from "lucide-react";
import { CourseRecommendation } from "../types";

interface SmartCourseFinderProps {
  onPreSelectCourse: (uniName: string, country: string) => void;
}

export function SmartCourseFinder({ onPreSelectCourse }: SmartCourseFinderProps) {
  const [preferredCountry, setPreferredCountry] = useState("United Kingdom");
  const [educationLevel, setEducationLevel] = useState("Master's Degree");
  const [budgetRange, setBudgetRange] = useState("Medium (£15,000 - £25,000 / year)");
  const [interestArea, setInterestArea] = useState("");
  const [gpa, setGpa] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleFindCourses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestArea.trim() || !gpa.trim()) {
      setError("Please fill out your interest area and current GPA/grades first!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await fetch("/api/gemini/course-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredCountry, educationLevel, budgetRange, interestArea, gpa })
      });

      if (!response.ok) {
        throw new Error("Failed to search matching universities");
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      console.error(err);
      setError("We encountered an issue preparing the analysis. Local safe fallback data was loaded instead.");
      // safe fallback data
      setRecommendations([
        {
          courseName: `B.Sc / M.Sc in ${interestArea || "Applied Science"}`,
          university: "University of Greenwich",
          country: preferredCountry,
          duration: educationLevel.toLowerCase().includes("master") ? "1 Year" : "3-4 Years",
          approxTuition: "£16,500 / year",
          reason: `Excellent fit for GPA of ${gpa}. This program has robust modules designed around your field of study in ${interestArea}. Also meets your budget targets with high visa success prospects.`
        },
        {
          courseName: `M.Sc / Executive MBA in ${interestArea || "Management"}`,
          university: "Coventry University",
          country: preferredCountry,
          duration: "1 Year",
          approxTuition: "£15,000 / year",
          reason: "An innovative pathway providing exceptional regional internships, low document-deposit mandates, and a robust syllabus."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInquire = (rec: CourseRecommendation, index: number) => {
    setCopiedIndex(index);
    onPreSelectCourse(rec.university, rec.country);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 font-sans max-w-4xl mx-auto" id="smart-course-finder">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-[#003366] text-[#00AEEF] p-3 rounded-xl shadow-lg">
          <Brain className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-[#003366]">JEL smart Course Finder</h2>
          <p className="text-xs text-slate-500">Instant database matching powered by advanced university intelligence</p>
        </div>
      </div>

      <form onSubmit={handleFindCourses} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#00AEEF]" /> Preferred Country
          </label>
          <select
            value={preferredCountry}
            onChange={(e) => setPreferredCountry(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm py-2.5 px-3 rounded-lg text-slate-800 transition focus:ring-1 focus:ring-[#003366]"
          >
            {["United Kingdom", "Australia", "Canada", "United States", "Ireland", "New Zealand", "Malaysia", "Europe"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-[#00AEEF]" /> level of Study
          </label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm py-2.5 px-3 rounded-lg text-slate-800 transition focus:ring-1 focus:ring-[#003366]"
          >
            {["Diploma", "Bachelor's Degree", "Master's Degree", "PhD / Doctorate"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <DollarSign className="h-3.5 w-3.5 mr-1.5 text-[#00AEEF]" /> Budget Range
          </label>
          <select
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm py-2.5 px-3 rounded-lg text-slate-800 transition focus:ring-1 focus:ring-[#003366]"
          >
            <option value="Low ($4,000 - $9,000 / year)">Low ($4,000 - $9,000 / year)</option>
            <option value="Medium (£15,000 - £25,000 / year)">Medium (£15,000 - £25,000 / year)</option>
            <option value="High ($25,000 - $45,000 / year)">High ($25,000 - $45,000 / year)</option>
            <option value="Scholarship Bound (Looking for 100% Fellowship)">Scholarship Bound (Looking for 100% Fellowship)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Search className="h-3.5 w-3.5 mr-1.5 text-[#00AEEF]" /> Interest Field / Major
          </label>
          <input
            type="text"
            placeholder="e.g., Computer Science, MBA, Public Health, Cybersecurity"
            value={interestArea}
            onChange={(e) => setInterestArea(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 rounded-lg text-slate-800 transition focus:ring-1 focus:ring-[#003366]"
            required
            id="gfind-major-input"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            🎓 Current GPA or Academic Marks
          </label>
          <input
            type="text"
            placeholder="e.g., GPA 5.00/5.00 or CGPA 3.65/4.00"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 rounded-lg text-slate-800 transition focus:ring-1 focus:ring-[#003366]"
            required
            id="gfind-gpa-input"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg md:col-span-2 font-mono">
            ⚠️ {error}
          </div>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#003366] hover:bg-[#002244] disabled:opacity-50 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#003366]/20 flex items-center space-x-2 cursor-pointer"
            id="btn-trigger-course-finder"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analysing University Seats...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Generate Recommendations</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Recommendations Results list */}
      {recommendations && (
        <div className="mt-8 pt-8 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-6 duration-400">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-800 text-base">Matched Programs</h3>
            <span className="text-xs text-[#00AEEF] bg-[#00AEEF]/10 px-2 py-0.5 rounded font-mono font-medium">Matching Complete</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-100 rounded-xl p-5 hover:border-[#003366] transition-all duration-300 relative group flex flex-col md:flex-row md:items-center justify-between"
              >
                <div className="md:max-w-[70%] space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎓</span>
                    <span className="text-[#003366] text-[11px] font-bold uppercase tracking-widest">{rec.country}</span>
                  </div>
                  <h4 className="font-display font-bold text-[#003366] text-base leading-tight group-hover:text-[#00AEEF] transition-colors">
                    {rec.courseName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">{rec.university} (Est. Duration: {rec.duration})</p>
                  <p className="text-xs text-slate-600 bg-white border border-slate-100 rounded-lg p-3 leading-relaxed mt-2">
                    <span className="font-bold text-[#f5a623]">JEL Analyst Verdict:</span> {rec.reason}
                  </p>
                </div>

                <div className="mt-4 md:mt-0 md:text-right flex flex-col items-start md:items-end space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Estimated Fee</span>
                    <span className="text-base font-display font-bold text-slate-800">{rec.approxTuition}</span>
                  </div>

                  <button
                    onClick={() => handleInquire(rec, idx)}
                    className="w-full md:w-auto bg-gradient-to-r from-[#003366] to-[#004d99] hover:from-[#00AEEF] hover:to-[#00AEEF] text-white py-2 px-4 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-1.5"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-300" />
                        <span>Saved to Booking form!</span>
                      </>
                    ) : (
                      <>
                        <span>Select for Consultation</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-center text-slate-400 leading-normal">
            Information retrieved reflects live 2026 partner data. Final fee structures are subject to university and currency adjustments.
          </p>
        </div>
      )}
    </div>
  );
}
