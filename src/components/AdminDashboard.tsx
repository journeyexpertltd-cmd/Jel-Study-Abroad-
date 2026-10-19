import React, { useCallback, useEffect, useState } from "react";
import { Lock, LogOut, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

interface AdminDashboardProps {
  setActiveTab?: (tab: string) => void;
}

type StaffProfile = {
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
};

type LeadRow = {
  id: number;
  created_at: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string | null;
  preferred_country: string | null;
  education_level: string | null;
  message: string | null;
};

const CRM_ROLES = new Set(["super_admin", "admin", "counsellor", "counselor", "visa_officer"]);

export function AdminDashboard({ setActiveTab }: AdminDashboardProps = {}) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return hash.get("type") === "recovery";
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadAuthorizedWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setError("Unable to verify the CRM session.");
      setSessionReady(true);
      setLoading(false);
      return;
    }

    const user = sessionData.session?.user;
    if (!user) {
      setProfile(null);
      setLeads([]);
      setSessionReady(true);
      setLoading(false);
      return;
    }

    const { data: staff, error: staffError } = await supabase
      .from("staff_profiles")
      .select("email,full_name,role,is_active")
      .eq("id", user.id)
      .single();

    if (staffError || !staff || !staff.is_active || !CRM_ROLES.has(String(staff.role || "").toLowerCase())) {
      await supabase.auth.signOut();
      setProfile(null);
      setLeads([]);
      setError("This account is not authorized for the JEL CRM.");
      setSessionReady(true);
      setLoading(false);
      return;
    }

    setProfile(staff as StaffProfile);
    const { data: leadRows, error: leadError } = await supabase
      .from("leads")
      .select("id,created_at,name,email,phone,source,status,preferred_country,education_level,message")
      .order("created_at", { ascending: false });

    if (leadError) setError("CRM data could not be loaded. Check database policies and try Refresh.");
    setLeads((leadRows || []) as LeadRow[]);
    setSessionReady(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hash.get("type") === "recovery") setRecoveryMode(true);

    void loadAuthorizedWorkspace();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        setLoading(false);
        return;
      }
      void loadAuthorizedWorkspace();
    });
    return () => listener.subscription.unsubscribe();
  }, [loadAuthorizedWorkspace]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPassword("");
    if (signInError) {
      setError("Sign-in failed. Check the email/password or use Forgot password.");
      setSubmitting(false);
      return;
    }
    await loadAuthorizedWorkspace();
    setSubmitting(false);
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter the staff email address first.");
      return;
    }
    setSubmitting(true);
    setError("");
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    });
    if (recoveryError) console.warn("CRM recovery request failed", recoveryError.message);
    const noticeMsg = "If the email is registered, a secure password-recovery link has been sent.";
    setNotice(noticeMsg);
    toast.info("Password Recovery", noticeMsg);
    setShowForgot(false);
    setSubmitting(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (newPassword.length < 8) {
      const msg = "Use a password with at least 8 characters.";
      setError(msg);
      toast.error("Password Notice", msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "The two passwords do not match.";
      setError(msg);
      toast.error("Password Notice", msg);
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setNewPassword("");
    setConfirmPassword("");
    if (updateError) {
      const msg = updateError.message || "Password update failed.";
      setError(msg);
      toast.error("Update Failed", msg);
      setSubmitting(false);
      return;
    }
    window.history.replaceState(null, "", "/admin");
    setRecoveryMode(false);
    const successMsg = "Password updated successfully. Your secure CRM session is ready.";
    setNotice(successMsg);
    toast.success("Password Updated", successMsg);
    await loadAuthorizedWorkspace();
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setLeads([]);
    setNotice("");
  };

  if (recoveryMode) {
    return (
      <section className="min-h-[65vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-7 md:p-9 text-left">
          <div className="h-12 w-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center mb-5"><ShieldCheck className="h-6 w-6 text-[#0B5D3B]" /></div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Journey Expert Ltd.</p>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Set New CRM Password</h1>
          <p className="text-sm text-slate-500 mt-2">Choose a new password for your authenticated JEL staff account.</p>
          <form onSubmit={handlePasswordUpdate} className="mt-7 space-y-4">
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">New password</label><input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B5D3B]/30" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm new password</label><input type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B5D3B]/30" /></div>
            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
            <button disabled={submitting} className="w-full rounded-xl bg-[#0B5D3B] text-white py-3.5 text-sm font-black hover:bg-[#08472e] disabled:opacity-60">{submitting ? "Updating…" : "Update password"}</button>
          </form>
        </div>
      </section>
    );
  }

  if (loading && !sessionReady) {
    return <div className="min-h-[55vh] flex items-center justify-center text-sm font-bold text-[#0B5D3B]">Verifying secure CRM session…</div>;
  }

  if (!profile) {
    return (
      <section className="min-h-[65vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-7 md:p-9 text-left">
          <div className="h-12 w-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center mb-5"><Lock className="h-6 w-6 text-[#0B5D3B]" /></div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Journey Expert Ltd.</p>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Counselor CRM Login</h1>
          <p className="text-sm text-slate-500 mt-2">Authorized staff only. Authentication and access control are enforced through Supabase Auth and staff profiles.</p>
          {notice && <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-700">{notice}</div>}
          {showForgot ? (
            <form onSubmit={handleRecoveryRequest} className="mt-7 space-y-4">
              <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Staff email</label><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" placeholder="staff@example.com" /></div>
              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
              <button disabled={submitting} className="w-full rounded-xl bg-[#0B5D3B] text-white py-3.5 text-sm font-black disabled:opacity-60">{submitting ? "Sending…" : "Send recovery link"}</button>
              <button type="button" onClick={() => { setShowForgot(false); setError(""); }} className="w-full text-xs font-bold text-slate-500">Back to sign in</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label><input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B5D3B]/30" placeholder="staff@example.com" /></div>
              <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label><input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B5D3B]/30" placeholder="Your secure password" /></div>
              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
              <button disabled={submitting} className="w-full rounded-xl bg-[#0B5D3B] text-white py-3.5 text-sm font-black hover:bg-[#08472e] disabled:opacity-60">{submitting ? "Signing in…" : "Sign in to CRM"}</button>
              <button type="button" onClick={() => { setShowForgot(true); setError(""); setNotice(""); }} className="w-full text-xs font-bold text-[#0B5D3B] hover:underline">Forgot password?</button>
            </form>
          )}
          <button type="button" onClick={() => setActiveTab?.("home")} className="w-full mt-3 text-xs font-bold text-slate-500 hover:text-slate-800">Return to website</button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 text-left">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><div className="flex items-center gap-2 text-[#0B5D3B]"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-black uppercase tracking-wider">Authenticated CRM</span></div><h1 className="text-2xl font-black text-slate-900 mt-2">Lead Management</h1><p className="text-xs text-slate-500 mt-1">{profile.full_name || profile.email} · {profile.role}</p></div>
          <div className="flex gap-2"><button onClick={loadAuthorizedWorkspace} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button><button onClick={handleLogout} className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2"><LogOut className="h-4 w-4" /> Logout</button></div>
        </div>
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7"><div className="rounded-2xl bg-slate-50 border border-slate-100 p-5"><Users className="h-5 w-5 text-[#0B5D3B]" /><div className="text-3xl font-black mt-3">{leads.length}</div><div className="text-xs text-slate-500 font-bold">Total CRM Leads</div></div><div className="rounded-2xl bg-slate-50 border border-slate-100 p-5"><div className="text-3xl font-black">{leads.filter((l) => (l.status || "New") === "New").length}</div><div className="text-xs text-slate-500 font-bold mt-1">New Leads</div></div><div className="rounded-2xl bg-slate-50 border border-slate-100 p-5"><div className="text-sm font-black text-[#0B5D3B]">LIVE DATABASE</div><div className="text-xs text-slate-500 font-bold mt-2">Supabase · RLS protected</div></div></div>
          {notice && <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-700">{notice}</div>}
          {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600 text-xs uppercase"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Contact</th><th className="px-4 py-3 text-left">Country</th><th className="px-4 py-3 text-left">Source</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr key={lead.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-bold text-slate-900">{lead.name || "—"}</td><td className="px-4 py-3 text-xs"><div>{lead.phone || "—"}</div><div className="text-slate-400">{lead.email || "—"}</div></td><td className="px-4 py-3">{lead.preferred_country || "—"}</td><td className="px-4 py-3">{lead.source || "website"}</td><td className="px-4 py-3"><span className="rounded-full bg-[#0B5D3B]/10 text-[#0B5D3B] px-2.5 py-1 text-xs font-bold">{lead.status || "New"}</span></td><td className="px-4 py-3 text-xs text-slate-500">{lead.created_at ? new Date(lead.created_at).toLocaleString() : "—"}</td></tr>)}{!leads.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No CRM leads yet.</td></tr>}</tbody></table></div>
        </div>
      </div>
    </section>
  );
}
