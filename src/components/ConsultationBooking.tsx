import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Sparkles, 
  Check, 
  CreditCard, 
  History, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Coins, 
  Download 
} from "lucide-react";
import { Lead } from "../types";

interface ConsultationBookingProps {
  preSelectedUniversity: string;
  preSelectedCountry: string;
  onClearPreSelected: () => void;
  setActiveTab: (tab: string) => void;
}

interface TransactionItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  feeType: string;
  amount: number;
  currency: string;
  status: string;
  bankTranId: string;
  cardType: string;
  createdAt: string;
}

export function ConsultationBooking({
  preSelectedUniversity,
  preSelectedCountry,
  onClearPreSelected,
  setActiveTab
}: ConsultationBookingProps) {
  // Navigation tabs of the panel
  const [activeSubTab, setActiveSubTab] = useState<"book" | "pay" | "history">("book");

  // --- FREE CONSULTATION FORM STATES ---
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

  // --- SSLCOMMERZ PAYMENTS STATES ---
  const [payName, setPayName] = useState("");
  const [payEmail, setPayEmail] = useState("");
  const [payPhone, setPayPhone] = useState("");
  const [payAmount, setPayAmount] = useState("500");
  const [payFeeType, setPayFeeType] = useState("Academic Counselling Fee");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [payCurrency, setPayCurrency] = useState("BDT");
  const [isPayInitiating, setIsPayInitiating] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // --- TRANSACTION LISTS LOG ---
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [supabaseTxStatusMsg, setSupabaseTxStatusMsg] = useState<string | null>(null);

  // --- HANDSHAKE / REDIRECT CALLBACK PARAMS ---
  const [callbackReceipt, setCallbackReceipt] = useState<{
    status: string;
    tranId: string;
    amount: string;
    cardType: string;
    bankTranId: string;
  } | null>(null);

  // Apply preselected parameters for Course Finder transfer
  useEffect(() => {
    if (preSelectedCountry) {
      setPreferredCountry(preSelectedCountry);
    }
    if (preSelectedUniversity) {
      setMessage(`I am highly interested in applying to: ${preSelectedUniversity} located in ${preSelectedCountry}. Please guide me on required entry GTE indices, deposits, and intakes.`);
    }
  }, [preSelectedCountry, preSelectedUniversity]);

  // Decode payment callback parameters received in address bar from SSLCOMMERZ redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payStatus = urlParams.get("pay_status");
    const tranId = urlParams.get("tran_id");
    const amount = urlParams.get("amount");
    const cardType = urlParams.get("card_type");
    const bankTranId = urlParams.get("bank_tran_id");

    if (payStatus && tranId) {
      setCallbackReceipt({
        status: payStatus,
        tranId: tranId,
        amount: amount || "0",
        cardType: cardType || "N/A",
        bankTranId: bankTranId || "N/A"
      });
      // Set active sub-tab to view status receipt
      setActiveSubTab("pay");
      
      // Clean query parameters from address bar to keep UX tidy
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl + "?activeTab=booking");
    }
  }, []);

  // Fetch transactions log on demand/loading
  const fetchTransactions = async () => {
    setIsTransactionsLoading(true);
    setSupabaseTxStatusMsg(null);
    try {
      const res = await fetch("/api/sslcommerz/transactions");
      const resp = await res.json();
      if (resp.success) {
        setTransactions(resp.data || []);
        if (resp.tableNotFound) {
          setSupabaseTxStatusMsg("Warning: Stored in temporary preview cache. Run the missing 'transactions' table SQL script shown in Counselor CRM board to persist safely.");
        }
      }
    } catch (e: any) {
      console.error("Transactions loading exception:", e);
      setSupabaseTxStatusMsg("Failed to communicate with transactions server.");
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "history") {
      fetchTransactions();
    }
  }, [activeSubTab]);

  // 1. Submit free counseling seat booking lead
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

    // Store to local fallback
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

    // Save Live to Supabase backend API route
    try {
      const response = await fetch("/api/supabase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking)
      });
      const result = await response.json();
      if (result.success) {
        setSupabaseStatusMsg("Saved successfully to Supabase Cloud storage!");
      }
    } catch (err: any) {
      console.error("Supabase request error:", err);
    } finally {
      setIsSubmitting(false);
    }
    
    onClearPreSelected();
    setSuccessLead(newBooking);
    setIsSuccess(true);
    
    // Reset Form Input fields
    setFullName("");
    setEmail("");
    setMobileNumber("");
    setMessage("");
  };

  // 2. Dispatch SSLCOMMERZ Payment gateway session initiation
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);
    
    if (!payName || !payEmail) {
      setPayError("Name and Email address are required fields.");
      return;
    }

    const numericVal = Number(payAmount);
    if (isNaN(numericVal) || numericVal <= 0) {
      setPayError("Invalid payment amount. Must be a positive number.");
      return;
    }

    setIsPayInitiating(true);
    try {
      console.log("[SSLCOMMERZ UI] Disabling forms, sending payload initialization request...");
      const payload = {
        name: payName,
        email: payEmail,
        phone: payPhone || "01926400400",
        feeType: payFeeType,
        amount: numericVal,
        currency: payCurrency
      };

      const response = await fetch("/api/sslcommerz/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success && result.redirectUrl) {
        console.log("[SSLCOMMERZ UI] Handshake complete! Redirecting user to browser gateway:", result.redirectUrl);
        // Redirect browser to SSLCommerz dynamic payment portal
        window.location.href = result.redirectUrl;
      } else {
        setPayError(result.error || "Establish payment session hook failed at merchant API container.");
      }
    } catch (err: any) {
      console.error("[SSLCOMMERZ UI] Dispatching exception error:", err);
      setPayError(err.message || "Gateway offline. Please make sure server is executing smoothly.");
    } finally {
      setIsPayInitiating(false);
    }
  };

  const handleSelectFeeType = (selectedType: string) => {
    setPayFeeType(selectedType);
    if (selectedType === "Academic Counselling Fee") {
      setPayAmount("500");
      setIsCustomAmount(false);
    } else if (selectedType === "University Admissions Fee") {
      setPayAmount("3500");
      setIsCustomAmount(false);
    } else if (selectedType === "GTE Documentation Assessment Fee") {
      setPayAmount("5000");
      setIsCustomAmount(false);
    } else {
      setIsCustomAmount(true);
      setPayAmount("");
    }
  };

  const downloadReceiptMetadata = () => {
    if (!callbackReceipt) return;
    const metaText = `
========================================
       JEL STUDY ABROAD RECEIPT
       A BRAND OF JOURNEY EXPERT LTD.
========================================
Receipt Generated: ${new Date().toLocaleString()}
Transaction ID: ${callbackReceipt.tranId}
Payment Status: ${callbackReceipt.status.toUpperCase()}
Paid Amount: ${callbackReceipt.amount} BDT
Card Brand: ${callbackReceipt.cardType}
Bank Trans Ref: ${callbackReceipt.bankTranId}
----------------------------------------
Dhaka Tejaon Nabisco Core Office
Ministry Auth Reg - 98.2% Visa Conversion
Thank you for executing smart payments.
========================================
`;
    const element = document.createElement("a");
    const file = new Blob([metaText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `JEL_Receipt_${callbackReceipt.tranId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 font-sans max-w-2xl mx-auto" id="consultation-booking-tool">
      
      {/* Dynamic Tab Selector on Top */}
      <div className="flex border-b border-slate-100 mb-6 pb-2 justify-between items-center flex-wrap gap-2">
        <div className="flex space-x-2">
          <button
            onClick={() => { setActiveSubTab("book"); setCallbackReceipt(null); }}
            className={`py-2 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-lg select-none ${
              activeSubTab === "book"
                ? "bg-[#05452d] text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            📋 Consultation Scheduling
          </button>
          
          <button
            onClick={() => { setActiveSubTab("pay"); }}
            className={`py-2 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-lg flex items-center gap-1.5 select-none ${
              activeSubTab === "pay"
                ? "bg-amber-500 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            💳 SSLCOMMERZ Pay Online
          </button>
        </div>

        <button
          onClick={() => setActiveSubTab("history")}
          className={`py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 border select-none ${
            activeSubTab === "history"
              ? "bg-slate-900 border-transparent text-white"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <History className="h-3.5 w-3.5 text-amber-500" />
          <span>Payment Log</span>
        </button>
      </div>

      {/* Mode 1: Scheduling Form view */}
      {activeSubTab === "book" && (
        <>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-[#05452d] text-[#00AEEF] p-3 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h2 className="font-display font-bold text-lg md:text-xl text-[#05452d]">Book Your Consult Session</h2>
              <p className="text-xs text-slate-500">Secure a private physical seat or WhatsApp admission consulting hour.</p>
            </div>
          </div>

          {preSelectedUniversity && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-6 text-xs sm:text-sm text-left relative">
              <button
                onClick={onClearPreSelected}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
                title="Clear selection"
              >
                ✕
              </button>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
                <span className="font-bold">Course Match Transferred:</span>
              </div>
              <p className="font-medium mt-1">Pre-selected University: <span className="font-bold text-[#05452d]">{preSelectedUniversity}</span> ({preSelectedCountry})</p>
              <p className="text-[11px] text-amber-700/80 mt-1">Submit booking below &mdash; your selection has been attached automatically!</p>
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
                <p className="font-bold text-[#05452d] uppercase tracking-wider mb-2 border-b pb-1.5 border-slate-100">Booking Summary</p>
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
                  className="bg-[#05452d] hover:bg-[#03301f] text-white text-xs font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Check JEL CRM Table
                </button>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Book Another Candidate
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center select-none">
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
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center select-none">
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
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center select-none">
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
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center select-none">
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
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block font-sans select-none">Last Completed Education</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2.5 px-3 rounded-lg text-slate-800 font-sans animate-none"
                >
                  {["Secondary / SSC", "Higher Secondary / HSC / A Levels", "Diploma Degree", "Bachelor's Degree", "Master's Degree"].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block font-sans select-none">Consultation Needs & Targets</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed questions about UK tuition, spouses, work visa duration..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2.5 px-3 rounded-lg min-h-[100px] text-slate-800 font-sans"
                  id="booking-msg-input"
                />
              </div>

              <div className="md:col-span-2 flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#F5A623] hover:bg-[#e0951a] disabled:bg-slate-300 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#F5A623]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-75 disabled:pointer-events-none cursor-pointer flex items-center justify-center space-x-2"
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
        </>
      )}

      {/* Mode 2: Pay Online / Form (or Showing Handshake outcome) */}
      {activeSubTab === "pay" && (
        <>
          {callbackReceipt ? (
            /* SHOW HANDSHAKE OUTCOME FROM GATEWAY */
            <div className={`p-6 border rounded-2xl text-left shadow-sm ${
              callbackReceipt.status === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                : callbackReceipt.status === "cancel"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-rose-50 border-rose-200 text-rose-950"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${
                  callbackReceipt.status === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                }`}>
                  {callbackReceipt.status === "success" ? <ShieldCheck className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                </div>
                
                <div className="space-y-2 flex-1">
                  <h3 className="font-display font-bold text-lg leading-snug">
                    {callbackReceipt.status === "success" && "Safe Payment Processed Successfully!"}
                    {callbackReceipt.status === "cancel" && "Transaction Cancelled by User"}
                    {callbackReceipt.status === "error" && "Internal Handshake Evaluation Failure"}
                    {callbackReceipt.status !== "success" && callbackReceipt.status !== "cancel" && "SSLCOMMERZ Payment Unsuccessful"}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {callbackReceipt.status === "success" && "Thank you for performing payments online. Your transaction registry has been broadcasted dynamically to both client logs and counselor CRM."}
                    {callbackReceipt.status === "cancel" && "The transaction checkout was cancelled. You have not been charged. Feel free to re-initiate if you wish to secure your admission fee."}
                    {callbackReceipt.status === "error" && "An exception trace took place during server-side callback verification."}
                  </p>

                  <div className="bg-white border rounded-xl p-4 mt-3 space-y-1.5 font-mono text-[11px] text-slate-700 shadow-xs border-slate-200">
                    <p className="text-xs uppercase tracking-wider font-extrabold text-[#05452d] border-b pb-1 mb-2">Invoice details</p>
                    <p><span className="font-bold text-slate-900">Transaction ID:</span> {callbackReceipt.tranId}</p>
                    <p><span className="font-bold text-slate-900">Amount Charged:</span> {callbackReceipt.amount} BDT</p>
                    <p><span className="font-bold text-slate-900">Payment Channel:</span> {callbackReceipt.cardType}</p>
                    <p><span className="font-bold text-slate-900">Gate Bank Ref:</span> {callbackReceipt.bankTranId}</p>
                    <p><span className="font-bold text-slate-900">Security Handshake:</span> Passed (SSLCOM V4)</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    {callbackReceipt.status === "success" && (
                      <button
                        onClick={downloadReceiptMetadata}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center space-x-1 transition shadow cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Receipt.txt</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => setCallbackReceipt(null)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold py-2 px-4 rounded-lg transition-all cursor-pointer"
                    >
                      New Online Payment
                    </button>
                    
                    <button
                      onClick={() => setActiveSubTab("history")}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-bold font-sans"
                    >
                      View Live Transactions &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PAY ONLINE INITIATION FORM */
            <>
              <div className="flex items-center space-x-3 mb-5">
                <div className="bg-amber-500 text-white p-3 rounded-xl shadow-lg">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h2 className="font-display font-bold text-lg md:text-xl text-slate-900 select-none font-sans">Secure Online Payment (SSLCOMMERZ)</h2>
                  <p className="text-xs text-slate-500 font-sans">Pay university files processing fees, booking deposits, or evaluation fees securely.</p>
                </div>
              </div>

              {payError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 text-xs p-3.5 rounded-xl mb-4 text-left flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{payError}</span>
                </div>
              )}

              <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl text-left text-xs mb-5 space-y-1">
                <p className="font-bold text-[#05452d] uppercase tracking-wider flex items-center gap-1 select-none">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Authorized Merchant Sandbox Engine
                </p>
                <p className="text-slate-650 leading-relaxed font-sans">
                  Payments are processed on <b>SSLCOMMERZ safe container networks</b>. You can use standard demo cards (Visa, MasterCard, bKash, Rocket, Nagad) inside sandbox redirect interface to verify flows safely.
                </p>
              </div>

              <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block font-sans select-none">Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    value={payName}
                    onChange={(e) => setPayName(e.target.value)}
                    placeholder="e.g., Yeasin Arafat"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2 px-3 rounded-lg text-slate-800 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block font-sans select-none">Email Address</label>
                  <input
                    type="email"
                    required
                    value={payEmail}
                    onChange={(e) => setPayEmail(e.target.value)}
                    placeholder="e.g., yeasin@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2 px-3 rounded-lg text-slate-800 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block font-sans select-none">Mobile Number (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    value={payPhone}
                    onChange={(e) => setPayPhone(e.target.value)}
                    placeholder="e.g., 01926400400"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2 px-3 rounded-lg text-slate-800 font-sans"
                  />
                </div>

                <div className="sm:col-span-2 gap-4 grid grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block font-sans select-none">Fee Category</label>
                    <select
                      value={payFeeType}
                      onChange={(e) => handleSelectFeeType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2.5 px-3 rounded-lg text-slate-800 font-sans"
                    >
                      <option value="Academic Counselling Fee">Counselling Consultation Fee (BDT 500)</option>
                      <option value="University Admissions Fee">University Admissions Process (BDT 3,500)</option>
                      <option value="GTE Documentation Assessment Fee">GTE Document Assessment (BDT 5,000)</option>
                      <option value="Custom Fee Payment">Custom Open Payment</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block font-sans select-none">
                      Pay Amount ({payCurrency})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">
                        {payCurrency === "BDT" ? "৳" : "$"}
                      </span>
                      <input
                        type="number"
                        required
                        disabled={!isCustomAmount}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="e.g., 500"
                        className={`w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2.5 pl-8 pr-3 rounded-lg text-slate-800 font-bold font-sans ${
                          !isCustomAmount ? "bg-slate-100 cursor-not-allowed opacity-80" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                  <div className="text-left font-sans">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans select-none">Estimated Settlement</p>
                    <p className="text-base font-extrabold text-[#05452d] font-sans">
                      {payCurrency === "BDT" ? "৳" : "$"} {Number(payAmount || 0).toLocaleString()} {payCurrency}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isPayInitiating}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white text-xs font-extrabold py-3.5 px-6 rounded-xl uppercase tracking-wider transition-all duration-300 shadow-md flex items-center space-x-1.5 active:scale-95 shrink-0 cursor-pointer font-sans"
                  >
                    {isPayInitiating ? (
                      <>
                        <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Securing Sandbox Handshake...</span>
                      </>
                    ) : (
                      <>
                        <span>Safe Pay via SSLCOMMERZ</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </>
      )}

      {/* Mode 3: Payment History List */}
      {activeSubTab === "history" && (
        <div className="text-left space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider select-none">
                Online Transaction History Logs
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Authorized financial settlement registry of candidates and students.
              </p>
            </div>
            
            <button
              onClick={fetchTransactions}
              disabled={isTransactionsLoading}
              className="bg-[#05452d] hover:bg-[#03301f] text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg shrink-0 cursor-pointer font-sans select-none"
            >
              Refresh Table
            </button>
          </div>

          {supabaseTxStatusMsg && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] sm:text-xs text-amber-900 leading-relaxed font-sans">
              💡 {supabaseTxStatusMsg}
            </div>
          )}

          {isTransactionsLoading ? (
            <div className="text-center py-10 space-y-2">
              <span className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="text-xs text-slate-500 font-sans">Querying transaction records directly from backend schema...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-500 bg-slate-50">
              <Coins className="h-8 w-8 text-slate-350 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-bold text-slate-700">No payment records located.</p>
              <p className="text-[11px] text-slate-450 mt-0.5">Initialize your very first transaction using SSLCOMMERZ Pay Online.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/60 rounded-xl bg-slate-50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold select-none font-sans">
                    <th className="py-2.5 px-3">Transaction ID / Purpose</th>
                    <th className="py-2.5 px-3">Candidate Info</th>
                    <th className="py-2.5 px-3">Amount Charged</th>
                    <th className="py-2.5 px-3">Status / Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-mono text-[11px]">
                          {tx.id}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium font-sans">
                          📅 {tx.createdAt} &bull; {tx.feeType}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-950 leading-tight">
                          {tx.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          📧 {tx.email}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900 text-xs font-mono">
                          {tx.currency === "BDT" ? "৳" : "$"} {tx.amount.toLocaleString()}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono uppercase font-black tracking-widest">
                          {tx.currency}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block ${
                            tx.status.toLowerCase() === "success"
                              ? "bg-emerald-100 text-emerald-800"
                              : tx.status.toLowerCase() === "pending"
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : tx.status.toLowerCase() === "cancelled"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {tx.status}
                          </span>
                          
                          <span className="text-[10px] text-slate-500 font-mono">
                            🎴 {tx.cardType || "N/A"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
