import React, { useState, useEffect } from "react";
import { Sparkles, FileText, Download, RotateCcw, Save, Check, AlertCircle, Edit3, Loader2 } from "lucide-react";

interface SOPGeneratorProps {
  currentUser: {
    fullName: string;
    email: string;
    mobileNumber?: string;
    preferredCountry?: string;
    educationLevel?: string;
    gpa?: string;
    englishTest?: string;
    englishScore?: string;
  };
}

export function SOPGenerator({ currentUser }: SOPGeneratorProps) {
  const [targetUniversity, setTargetUniversity] = useState("");
  const [targetCourse, setTargetCourse] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [writingStyle, setWritingStyle] = useState("UK Style");
  
  const [sopContent, setSopContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill target details if already searched or stored
  useEffect(() => {
    const savedSop = localStorage.getItem(`jel_sop_${currentUser.email}`);
    if (savedSop) {
      setSopContent(savedSop);
    }
    
    // Attempt to pre-fill from course finder selections if any exist in local storage
    const lastFinderSelection = localStorage.getItem("jel_last_course_selection");
    if (lastFinderSelection) {
      try {
        const parsed = JSON.parse(lastFinderSelection);
        setTargetUniversity(parsed.university || "");
        setTargetCourse(parsed.courseName || "");
      } catch (e) {}
    }
  }, [currentUser.email]);

  const handleGenerateSOP = async () => {
    if (!targetUniversity || !targetCourse || !careerGoals) {
      setErrorMsg("Please provide your target university, course, and career goals.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/gemini/sop-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: currentUser.fullName,
          email: currentUser.email,
          mobileNumber: currentUser.mobileNumber,
          preferredCountry: currentUser.preferredCountry || "United Kingdom",
          educationLevel: currentUser.educationLevel || "Bachelor's Degree",
          gpa: currentUser.gpa || "5.00",
          englishTest: currentUser.englishTest || "IELTS",
          englishScore: currentUser.englishScore || "6.5",
          targetUniversity,
          targetCourse,
          careerGoals,
          writingStyle
        })
      });

      const data = await response.json();
      if (data.success) {
        setSopContent(data.sop);
        localStorage.setItem(`jel_sop_${currentUser.email}`, data.sop);
      } else {
        throw new Error(data.error || "Failed to generate SOP content.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during generation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSOP = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      localStorage.setItem(`jel_sop_${currentUser.email}`, sopContent);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 600);
  };

  const handleDownloadPDF = () => {
    // Elegant system print layout or download action
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Please allow popups to export your Statement of Purpose.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Statement of Purpose - ${currentUser.fullName}</title>
          <style>
            body {
              font-family: 'Times New Roman', Georgia, serif;
              line-height: 1.6;
              padding: 40px;
              color: #1a1a1a;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              text-align: center;
              font-size: 24px;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta-info {
              text-align: center;
              font-size: 14px;
              margin-bottom: 40px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              color: #555;
            }
            p {
              margin-bottom: 20px;
              text-align: justify;
              text-indent: 40px;
              font-size: 15px;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #ccc;
              padding-top: 20px;
              font-size: 12px;
              text-align: center;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Statement of Purpose</h1>
          <div class="meta-info">
            <strong>Candidate:</strong> ${currentUser.fullName} &nbsp;|&nbsp; 
            <strong>Email:</strong> ${currentUser.email} &nbsp;|&nbsp; 
            <strong>Target Program:</strong> ${targetCourse}
          </div>
          <div>
            ${sopContent.split("\n\n").map(paragraph => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`).join("")}
          </div>
          <div class="footer">
            Generated via JEL Study Abroad Intelligent Platform. Verified by Journey Expert Ltd.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6" id="ai-sop-generator-workspace">
      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-[#0B5D3B]">
            <Sparkles className="h-5 w-5 text-[#D4AF37] animate-pulse" />
            <h3 className="font-display font-black text-slate-900 text-lg uppercase tracking-wider">AI Statement of Purpose Generator</h3>
          </div>
          <p className="text-xs text-slate-500">Bespoke, professional UK/Canada/Australia academic style writing in minutes.</p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#0B5D3B] px-3 py-1 rounded-full border border-[#D4AF37]/30">
          Intelligent SOP v2.5
        </span>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left flex items-start space-x-2 animate-in fade-in">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-650" />
          <span className="text-xs text-red-700 font-medium">{errorMsg}</span>
        </div>
      )}

      {!sopContent ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="bg-[#0B5D3B]/5 border border-[#0B5D3B]/10 rounded-2xl p-5 text-left space-y-2">
            <h4 className="text-xs font-bold text-[#0B5D3B] uppercase tracking-wide">Academic Foundation Preloaded</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-light">
              We have prefilled your credentials: <strong>{currentUser.fullName}</strong>, pursuing studies after completing <strong>{currentUser.educationLevel}</strong> with score/GPA of <strong>{currentUser.gpa}</strong>. Language proficiency: <strong>{currentUser.englishTest} ({currentUser.englishScore})</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Target University *</label>
              <input
                type="text"
                required
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                placeholder="e.g., University of Greenwich"
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Target Course / Major *</label>
              <input
                type="text"
                required
                value={targetCourse}
                onChange={(e) => setTargetCourse(e.target.value)}
                placeholder="e.g., M.Sc. in Business Analytics"
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Writing Style & Tone</label>
              <select
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
              >
                <option value="UK Academic Spelling">United Kingdom (UK) Academic Style</option>
                <option value="Canada SPP compliance">Canada SPP Compliance Tone</option>
                <option value="Australia GTE standards">Australia GTE Compliance Standards</option>
                <option value="US Ivy/High-Tier Personal">USA Sophisticated Statement</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Your Personal Profile</label>
              <span className="text-xs text-slate-500 italic block pt-2">
                Target country is set as <strong>{currentUser.preferredCountry || "United Kingdom"}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Career Goals & Key Motivations *</label>
            <textarea
              required
              rows={4}
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              placeholder="e.g., I want to return to Bangladesh as a Senior Data Architect. I spent 2 years in software development, and want to learn advanced predictive models to help regional fintech platforms. This Greenwich course provides a 1-year pathway..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
            />
          </div>

          <button
            onClick={handleGenerateSOP}
            disabled={loading}
            className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                <span>Formulating 1000-Word Academic SOP...</span>
              </>
            ) : (
              <>
                <span>Generate Statement of Purpose</span>
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in zoom-in-95 duration-200 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
              <FileText className="h-4 w-4 text-[#0B5D3B]" />
              <span>SOP Draft Generated Successfully (Academic Level)</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white border border-slate-200 hover:border-[#0B5D3B] hover:bg-[#0B5D3B]/5 text-slate-700 text-[11px] font-bold py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditing ? "View Read Mode" : "Edit SOP Text"}</span>
              </button>

              <button
                onClick={handleSaveSOP}
                disabled={saveStatus === "saving"}
                className="bg-[#0B5D3B] hover:bg-[#074028] text-white text-[11px] font-bold py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                {saveStatus === "saving" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : saveStatus === "saved" ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save to Profile"}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 text-[11px] font-bold py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF / Print</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to re-configure and re-generate your Statement of Purpose?")) {
                    setSopContent("");
                  }
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                title="Re-generate option"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Re-generate</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-inner bg-slate-50 p-1">
            {isEditing ? (
              <textarea
                value={sopContent}
                onChange={(e) => setSopContent(e.target.value)}
                rows={20}
                className="w-full bg-white text-xs p-6 text-slate-700 leading-relaxed font-mono focus:outline-none focus:ring-1 focus:ring-[#0B5D3B] border-none rounded-2xl"
                style={{ minHeight: "450px" }}
              />
            ) : (
              <div 
                className="bg-white p-8 rounded-2xl text-slate-700 leading-relaxed text-xs overflow-y-auto max-h-[500px] border border-slate-100 whitespace-pre-wrap select-text font-serif text-justify"
                style={{ textIndent: "2rem" }}
              >
                {sopContent}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Estimated length: ~{sopContent.split(/\s+/).filter(Boolean).length} words</span>
            <span>Spelling target: {writingStyle} standards</span>
          </div>
        </div>
      )}
    </div>
  );
}
