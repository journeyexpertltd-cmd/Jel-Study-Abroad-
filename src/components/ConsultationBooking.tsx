import React, { useState, useEffect } from "react";
import { Calendar, User, Phone, Mail, Globe, MapPin, Sparkles, Check } from "lucide-react";
import { Lead } from "../types";

interface ConsultationBookingProps {
  preSelectedUniversity: string;
  preSelectedCountry: string;
  onClearPreSelected: () => void;
  setActiveTab: (tab: string) => void;
}

export function ConsultationBooking({
  preSelectedUniversity,
  preSelectedCountry,
  onClearPreSelected,
  setActiveTab
}: ConsultationBookingProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("United Kingdom");
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree");
  const [message, setMessage] = useState("");
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [successLead, setSuccessLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);

  // Apply preselected parameters
  useEffect(() => {
    if (preSelectedCountry) {
      setPreferredCountry(preSelectedCountry);
    }
    if (preSelectedUniversity) {
      setMessage(`I am highly interested in applying to: ${preSelectedUniversity} located in ${preSelectedCountry}. Please guide me on required entry GTE indices, deposits, and intakes.`);
    }
  }, [preSelectedCountry, preSelectedUniversity]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobileNumber) {
      alert("Please fill out candidate contacts fully.");
      return;
    }

    setIsSubmitting(true);
    setSupabaseStatusMsg(null);
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newBooking: Lead = {
      id: `lead-user-${Date.now()}`,
      fullName,
      email,
      mobileNumber,
      preferredCountry,
      educationLevel,
      message: message || "Direct free consulting review request.",
      status: "New",
      notes: "Awaiting counselor allocation standard schedule checklist.",
      createdAt: dateStr
    };

    // 1. Grab current leads database from localstorage
    let existingLeads: Lead[] = [];
    const saved = localStorage.getItem("jel_consult_leads");
    if (saved) {
      try {
        existingLeads = JSON.parse(saved);
      } catch (err) {
        existingLeads = [];
      }
    }
    
    const updatedLeads = [newBooking, ...existingLeads];
    localStorage.setItem("jel_consult_leads", JSON.stringify(updatedLeads));

    // 2. Transmit to Supabase Server proxy
    try {
      const response = await fetch("/api/supabase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking)
      });
      const result = await response.json();
      if (result.success) {
        setSupabaseStatusMsg("Saved successfully to Supabase database Cloud storage!");
      } else if (result.tableNotFound) {
        setSupabaseStatusMsg("Warning: Stored locally. Supabase setup pending: leads table needs to be created.");
      } else {
        setSupabaseStatusMsg(`Stored locally. Supabase update skipped: ${result.error || "Connection configuration issue"}`);
      }
    } catch (err: any) {
      console.error("Supabase request error:", err);
      setSupabaseStatusMsg("Stored locally. Supabase offline or server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
    
    // Clear preselected
    onClearPreSelected();
    
    // Set success indicator
    setSuccessLead(newBooking);
    setIsSuccess(true);
    
    // Reset form inputs
    setFullName("");
    setEmail("");
    setMobileNumber("");
    setMessage("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 font-sans max-w-2xl mx-auto" id="consultation-booking-tool">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-[#003366] text-[#00AEEF] p-3 rounded-xl shadow-lg">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-[#003366]">Book Your Free Academic Consultation</h2>
          <p className="text-xs text-slate-500">Secure a private physical seat or WhatsApp consulting hour with senior directors.</p>
        </div>
      </div>

      {preSelectedUniversity && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-6 text-xs sm:text-sm text-left relative">
          <button
            onClick={onClearPreSelected}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
            title="Clear filter selection"
          >
            ✕
          </button>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse shrink-0" />
            <span className="font-bold">Course Match Transferred:</span>
          </div>
          <p className="font-medium mt-1">Pre-selected University: <span className="font-bold text-[#003366]">{preSelectedUniversity}</span> ({preSelectedCountry})</p>
          <p className="text-[11px] text-slate-505 text-amber-700/80 mt-1">Submit booking below &mdash; your information is already added to the notes!</p>
        </div>
      )}

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-4 animate-in fade-in duration-300">
          <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-inner">
            <Check className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-slate-900 text-lg">Booking Registered Successfully!</h3>
            <p className="text-slate-500 text-xs sm:text-sm">Assalamu Alaikum, {successLead?.fullName}. Your consulting seat has been queued in JEL CRM database.</p>
          </div>

          <div className="bg-white border border-emerald-100 p-4 rounded-xl max-w-sm mx-auto text-left text-xs font-mono">
            <p className="font-bold text-[#003366] uppercase tracking-wider mb-2 border-b pb-1.5 border-slate-100">Booking Summary</p>
            <p className="text-slate-600"><span className="font-semibold text-slate-900">ID:</span> {successLead?.id}</p>
            <p className="text-slate-600"><span className="font-semibold text-slate-900">E-mail:</span> {successLead?.email}</p>
            <p className="text-slate-600"><span className="font-semibold text-slate-900">Target:</span> {successLead?.preferredCountry}</p>
            <p className="text-slate-600"><span className="font-semibold text-slate-900">Verification:</span> Pending</p>
            {supabaseStatusMsg && (
              <p className="mt-2 text-[#05452d] font-bold text-[10px] bg-emerald-50 border border-emerald-100 p-2 rounded leading-relaxed">
                🌐 Supabase: {supabaseStatusMsg}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
               onClick={() => {
                 setActiveTab("admin");
                 window.scrollTo({ top: 0, behavior: "smooth" });
               }}
               className="bg-[#003366] hover:bg-[#004d99] text-white text-xs font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all"
            >
              Check JEL CRM Table
            </button>
            <button
               onClick={() => setIsSuccess(false)}
               className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all"
            >
              Book Another Candidate
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center">
              <User className="h-3.5 w-3.5 mr-1.5 text-[#00AEEF]" /> Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Rakibul Hasan"
              className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2 px-3 rounded-lg text-slate-800"
              id="booking-name-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1.5 text-[#00AEEF]" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., rakibul@gmail.com"
              className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2 px-3 rounded-lg text-slate-800"
              id="booking-email-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-[#00AEEF]" /> Mobile (WhatsApp Preferred)
            </label>
            <input
              type="text"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g., +8801712345678"
              className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2 px-3 rounded-lg text-slate-800"
              id="booking-mobile-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center">
              <Globe className="h-3.5 w-3.5 mr-1.5 text-[#00AEEF]" /> Preferred Country
            </label>
            <select
              value={preferredCountry}
              onChange={(e) => setPreferredCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2.5 px-3 rounded-lg text-slate-800"
            >
              {["United Kingdom", "Australia", "Canada", "United States", "Ireland", "New Zealand", "Malaysia", "Europe"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block">Last Completed Education</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2.5 px-3 rounded-lg text-slate-800"
            >
              {["Secondary / SSC", "Higher Secondary / HSC / A Levels", "Diploma Degree", "Bachelor's Degree", "Master's Degree"].map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block">Consultation Needs & Targets</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed questions about UK tuition, spouses, work visa duration..."
              className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2.5 px-3 rounded-lg min-h-[100px] text-slate-800"
              id="booking-msg-input"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#F5A623] hover:bg-[#e0951a] disabled:bg-slate-350 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#F5A623]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:pointer-events-none cursor-pointer flex items-center justify-center space-x-2"
              id="btn-submit-booking-form"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Writing to Supabase...</span>
                </>
              ) : (
                "Book My Consulting Seat"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
