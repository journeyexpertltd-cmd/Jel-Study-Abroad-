import React, { useEffect, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, Globe, Mail, Phone, ShieldCheck, Sparkles, User } from "lucide-react";
import { trackMetaLead } from "../lib/metaPixel";

interface ConsultationBookingProps {
  preSelectedUniversity: string;
  preSelectedCountry: string;
  onClearPreSelected: () => void;
  setActiveTab: (tab: string) => void;
}

type BookingReceipt = {
  id?: number | string | null;
  name: string;
  email: string;
  phone: string;
  country: string;
};

export function ConsultationBooking({
  preSelectedUniversity,
  preSelectedCountry,
  onClearPreSelected,
}: ConsultationBookingProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("United Kingdom");
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);

  useEffect(() => {
    if (preSelectedCountry) setPreferredCountry(preSelectedCountry);
    if (preSelectedUniversity) {
      setMessage(`I am interested in applying to ${preSelectedUniversity} in ${preSelectedCountry || preferredCountry}. Please advise me on entry requirements, tuition, intakes and the application process.`);
    }
  // preferredCountry is only a fallback when the transfer does not provide a country.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedCountry, preSelectedUniversity]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setReceipt(null);
    if (!fullName.trim() || !email.trim() || !mobileNumber.trim()) {
      setError("Name, email and mobile number are required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/supabase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          mobileNumber: mobileNumber.trim(),
          preferredCountry,
          educationLevel,
          message: message.trim() || "Free consultation request from journeyexpertbd.com.",
          source: "consultation",
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok || body?.success !== true) {
        throw new Error("The CRM could not save your request right now. Please use WhatsApp or call the JEL hotline and try again later.");
      }

      setReceipt({
        id: body.id ?? null,
        name: fullName.trim(),
        email: email.trim(),
        phone: mobileNumber.trim(),
        country: preferredCountry,
      });
      trackMetaLead("consultation");
      setFullName("");
      setEmail("");
      setMobileNumber("");
      setMessage("");
      onClearPreSelected();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The CRM could not save your request right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <section className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm p-7 md:p-10 text-center">
        <div className="h-14 w-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="h-7 w-7 text-[#0B5D3B]" /></div>
        <h1 className="text-2xl font-black text-slate-900 mt-5">Consultation request received</h1>
        <p className="text-sm text-slate-500 mt-2">Your request was saved to the JEL CRM. A counselor can now follow up using the contact details you provided.</p>
        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-left text-sm space-y-2">
          <div><span className="font-bold text-slate-500">Name:</span> {receipt.name}</div>
          <div><span className="font-bold text-slate-500">Mobile:</span> {receipt.phone}</div>
          <div><span className="font-bold text-slate-500">Country:</span> {receipt.country}</div>
          {receipt.id ? <div><span className="font-bold text-slate-500">CRM reference:</span> {String(receipt.id)}</div> : null}
        </div>
        <button type="button" onClick={() => setReceipt(null)} className="mt-6 rounded-xl bg-[#0B5D3B] text-white px-6 py-3 text-xs font-black">Book another consultation</button>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left" id="consultation-booking-tool">
      <div className="bg-[#0B5D3B] text-white p-6 md:p-8">
        <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.18em]"><Calendar className="h-4 w-4" /> JEL Study Abroad</div>
        <h1 className="text-2xl md:text-3xl font-black mt-3">Book a consultation</h1>
        <p className="text-sm text-white/75 mt-2 max-w-2xl">Submit your profile for a counselor review. Your request is only confirmed after it is successfully stored in the production CRM.</p>
      </div>

      <div className="p-6 md:p-8">
        {preSelectedUniversity && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
            <div><div className="font-black">Course finder selection</div><div className="text-xs mt-1">{preSelectedUniversity}{preSelectedCountry ? ` · ${preSelectedCountry}` : ""}</div><button type="button" onClick={onClearPreSelected} className="text-xs font-bold underline mt-2">Clear selection</button></div>
          </div>
        )}

        {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-black text-slate-700">Full name *</span><div className="mt-1.5 relative"><User className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" /><input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm" placeholder="Your full name" /></div></label>
            <label className="block"><span className="text-xs font-black text-slate-700">Mobile / WhatsApp *</span><div className="mt-1.5 relative"><Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" /><input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm" placeholder="+8801XXXXXXXXX" /></div></label>
          </div>

          <label className="block"><span className="text-xs font-black text-slate-700">Email *</span><div className="mt-1.5 relative"><Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm" placeholder="you@example.com" /></div></label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-black text-slate-700">Preferred country</span><div className="mt-1.5 relative"><Globe className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" /><select value={preferredCountry} onChange={(e) => setPreferredCountry(e.target.value)} className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm bg-white">{["United Kingdom", "Canada", "Australia", "United States", "Ireland", "Germany", "New Zealand", "Malaysia"].map((country) => <option key={country}>{country}</option>)}</select></div></label>
            <label className="block"><span className="text-xs font-black text-slate-700">Current education level</span><select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white">{["Secondary / SSC", "Higher Secondary / HSC / A Levels", "Diploma Degree", "Bachelor's Degree", "Master's Degree"].map((level) => <option key={level}>{level}</option>)}</select></label>
          </div>

          <label className="block"><span className="text-xs font-black text-slate-700">What would you like help with?</span><textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm resize-y" placeholder="University, course, intake, scholarship, visa or budget questions…" /></label>

          <button disabled={submitting} className="w-full rounded-xl bg-[#0B5D3B] text-white py-4 text-sm font-black disabled:opacity-60">{submitting ? "Saving securely…" : "Submit consultation request"}</button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-[#0B5D3B] shrink-0" />Online payment is not presented as production-ready until the merchant gateway is independently verified. JEL will not show a successful payment receipt based only on a browser redirect.</div>
      </div>
    </section>
  );
}
