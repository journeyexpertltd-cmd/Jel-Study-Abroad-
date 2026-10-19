import React, { useEffect, useMemo, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  CreditCard,
  GraduationCap,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
  Compass,
  Clock,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { SOPGenerator } from "./SOPGenerator";
import { VisaChecklist } from "./VisaChecklist";
import { StudentInvoices } from "./StudentInvoices";
import { StudentApplicationTracker } from "./StudentApplicationTracker";
import { useToast } from "../context/ToastContext";

interface StudentPortalProps {
  setActiveTab: (tab: string) => void;
  onPreSelectCountry?: (country: string) => void;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "student";
  mobileNumber?: string;
  preferredCountry?: string;
  educationLevel?: string;
  gpa?: string;
  englishTest?: string;
  englishScore?: string;
  appStatus?: string;
}

type View = "login" | "register" | "forgot" | "dashboard";
type StudentTab = "overview" | "tracker" | "sop" | "visa" | "billing";

const profileFromUser = (user: SupabaseUser): UserProfile => {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    fullName: typeof metadata.fullName === "string" && metadata.fullName.trim() ? metadata.fullName.trim() : "Student",
    role: "student",
    mobileNumber: typeof metadata.mobileNumber === "string" ? metadata.mobileNumber : "",
    preferredCountry: typeof metadata.preferredCountry === "string" ? metadata.preferredCountry : "United Kingdom",
    educationLevel: typeof metadata.educationLevel === "string" ? metadata.educationLevel : "Bachelor's Degree",
    gpa: typeof metadata.gpa === "string" ? metadata.gpa : "",
    englishTest: typeof metadata.englishTest === "string" ? metadata.englishTest : "IELTS",
    englishScore: typeof metadata.englishScore === "string" ? metadata.englishScore : "",
    appStatus: typeof metadata.appStatus === "string" ? metadata.appStatus : "Profile Evaluation",
  };
};

export function StudentPortal({ setActiveTab }: StudentPortalProps) {
  const toast = useToast();
  const [view, setView] = useState<View>("login");
  const [subTab, setSubTab] = useState<StudentTab>("tracker");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("United Kingdom");
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree");
  const [gpa, setGpa] = useState("");
  const [englishTest, setEnglishTest] = useState("IELTS");
  const [englishScore, setEnglishScore] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return hash.get("type") === "recovery" && window.location.pathname.includes("student-portal");
  });

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const loadUser = (user: SupabaseUser | null) => {
    if (!user) {
      setCurrentUser(null);
      if (!recoveryMode) setView("login");
      return;
    }
    const profile = profileFromUser(user);
    setCurrentUser(profile);
    setMobileNumber(profile.mobileNumber || "");
    setPreferredCountry(profile.preferredCountry || "United Kingdom");
    setEducationLevel(profile.educationLevel || "Bachelor's Degree");
    setGpa(profile.gpa || "");
    setEnglishTest(profile.englishTest || "IELTS");
    setEnglishScore(profile.englishScore || "");
    if (!recoveryMode) setView("dashboard");
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      loadUser(data.session?.user || null);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setErrorMsg("Authentication service is temporarily unavailable.");
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        setLoading(false);
        return;
      }
      loadUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  // recoveryMode is intentionally read from the URL/auth event, not used as an effect dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPassword("");
    if (error || !data.user) {
      setErrorMsg("Sign-in failed. Check your email and password, or use Reset Password.");
      setLoading(false);
      return;
    }
    loadUser(data.user);
    setSuccessMsg("Signed in securely with Supabase Authentication.");
    toast.success("Welcome Back", "Signed in securely to your JEL student portal.");
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (password.length < 8) {
      setErrorMsg("Use a password with at least 8 characters.");
      return;
    }
    if (!fullName.trim() || !mobileNumber.trim()) {
      setErrorMsg("Full name and mobile number are required.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/student-portal`,
        data: {
          fullName: fullName.trim(),
          role: "student",
          mobileNumber: mobileNumber.trim(),
          preferredCountry,
          educationLevel,
          gpa: gpa.trim(),
          englishTest,
          englishScore: englishScore.trim(),
          appStatus: "Profile Evaluation",
        },
      },
    });
    setPassword("");

    if (error) {
      const msg = error.message || "Account registration failed.";
      setErrorMsg(msg);
      toast.error("Registration Notice", msg);
      setLoading(false);
      return;
    }

    if (data.session?.user) {
      loadUser(data.session.user);
      setSuccessMsg("Student account created and authenticated securely.");
      toast.success("Account Created", "Your student account has been registered and signed in.");
    } else {
      setView("login");
      setSuccessMsg("Registration received. Check your email to confirm the account before signing in.");
      toast.info("Registration Received", "Please check your email to confirm your account before signing in.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!email.trim()) {
      setErrorMsg("Enter your registered email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/student-portal`,
    });
    if (error) console.warn("Student password recovery request failed", error.message);
    setSuccessMsg("If the email is registered, a secure password-reset link has been sent.");
    toast.info("Password Reset Sent", "If the email is registered, password-reset instructions were sent.");
    setLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (newPassword.length < 8) {
      setErrorMsg("Use a password with at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("The two passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setNewPassword("");
    setConfirmPassword("");
    if (error) {
      const msg = error.message || "Password update failed.";
      setErrorMsg(msg);
      toast.error("Password Update Notice", msg);
      setLoading(false);
      return;
    }
    window.history.replaceState(null, "", "/student-portal");
    setRecoveryMode(false);
    setSuccessMsg("Password updated successfully.");
    toast.success("Password Updated", "Your student password has been changed successfully.");
    const { data } = await supabase.auth.getUser();
    loadUser(data.user || null);
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!currentUser) return;
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: {
        mobileNumber: mobileNumber.trim(),
        preferredCountry,
        educationLevel,
        gpa: gpa.trim(),
        englishTest,
        englishScore: englishScore.trim(),
      },
    });
    if (error || !data.user) {
      const msg = error?.message || "Profile update failed.";
      setErrorMsg(msg);
      toast.error("Profile Notice", msg);
    } else {
      loadUser(data.user);
      setSuccessMsg("Profile updated securely.");
      toast.success("Profile Updated", "Your student study abroad details have been updated.");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView("login");
    setLoading(false);
  };

  const tabs = useMemo(() => [
    { id: "tracker" as const, label: "Application Tracker", icon: Clock },
    { id: "overview" as const, label: "Profile", icon: User },
    { id: "sop" as const, label: "SOP Assistant", icon: Sparkles },
    { id: "visa" as const, label: "Visa Checklist", icon: Compass },
    { id: "billing" as const, label: "Fees & Payments", icon: CreditCard },
  ], []);

  if (loading && !currentUser && !recoveryMode) {
    return <div className="min-h-[55vh] flex items-center justify-center text-sm font-bold text-[#0B5D3B]">Checking secure student session…</div>;
  }

  if (recoveryMode) {
    return (
      <section className="min-h-[65vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-7 md:p-9 text-left">
          <ShieldCheck className="h-8 w-8 text-[#0B5D3B] mb-4" />
          <h1 className="text-2xl font-black text-slate-900">Set New Student Password</h1>
          <p className="text-sm text-slate-500 mt-2">This reset session is handled by Supabase Auth.</p>
          <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
            <input type="password" minLength={8} required autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            <input type="password" minLength={8} required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            {errorMsg && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700">{errorMsg}</div>}
            <button disabled={loading} className="w-full rounded-xl bg-[#0B5D3B] text-white py-3.5 text-sm font-black disabled:opacity-60">{loading ? "Updating…" : "Update password"}</button>
          </form>
        </div>
      </section>
    );
  }

  if (view !== "dashboard" || !currentUser) {
    return (
      <section className="py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-7 items-start">
          <div className="bg-[#0B5D3B] text-white rounded-3xl p-7 md:p-9 text-left">
            <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-black uppercase tracking-wider"><GraduationCap className="h-4 w-4" /> JEL Student Portal</div>
            <h1 className="text-3xl font-black mt-4">Secure student workspace</h1>
            <p className="text-sm text-white/75 mt-3 leading-relaxed">Use your verified account to manage your study-abroad profile, application tracker, SOP workflow, visa checklist and billing records.</p>
            <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-xs leading-relaxed">Staff and counselor access is separated from student access. Authorized staff should use the Counselor CRM.</div>
            <button type="button" onClick={() => setActiveTab("admin")} className="mt-4 text-xs font-black text-[#D4AF37] hover:underline">Open Counselor CRM →</button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-7 md:p-9 text-left">
            <div className="flex gap-4 border-b border-slate-100 pb-4 mb-6">
              {(["login", "register", "forgot"] as View[]).map((item) => (
                <button key={item} type="button" onClick={() => { setView(item); resetMessages(); }} className={`text-xs font-black uppercase tracking-wider ${view === item ? "text-[#0B5D3B]" : "text-slate-400"}`}>
                  {item === "login" ? "Sign In" : item === "register" ? "Create Account" : "Reset Password"}
                </button>
              ))}
            </div>

            {errorMsg && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{errorMsg}</div>}
            {successMsg && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-700 flex gap-2"><CheckCircle className="h-4 w-4 shrink-0" />{successMsg}</div>}

            {view === "login" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Registered email" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                <button disabled={loading} className="w-full rounded-xl bg-[#0B5D3B] text-white py-3.5 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60">Sign in securely <ArrowRight className="h-4 w-4" /></button>
              </form>
            )}

            {view === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-500">Enter the email associated with your student account.</p>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Registered email" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                <button disabled={loading} className="w-full rounded-xl bg-[#0B5D3B] text-white py-3.5 text-sm font-black disabled:opacity-60">Send secure reset link</button>
              </form>
            )}

            {view === "register" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                  <input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Mobile / WhatsApp" className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                </div>
                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select value={preferredCountry} onChange={(e) => setPreferredCountry(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white">{["United Kingdom", "Canada", "Australia", "United States", "Ireland", "Germany", "New Zealand", "Malaysia"].map((c) => <option key={c}>{c}</option>)}</select>
                  <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white">{["Secondary / SSC", "Higher Secondary / HSC / A Levels", "Diploma Degree", "Bachelor's Degree", "Master's Degree"].map((e) => <option key={e}>{e}</option>)}</select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="GPA / score" className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                  <select value={englishTest} onChange={(e) => setEnglishTest(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white"><option>IELTS</option><option>PTE</option><option>TOEFL</option><option>Duolingo</option><option>None</option></select>
                  <input value={englishScore} onChange={(e) => setEnglishScore(e.target.value)} placeholder="English score" className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                </div>
                <button disabled={loading} className="w-full rounded-xl bg-[#0B5D3B] text-white py-3.5 text-sm font-black disabled:opacity-60">Create student account</button>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-7 text-left space-y-6">
      <div className="bg-[#0B5D3B] text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div><div className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">Authenticated Student Workspace</div><h1 className="text-2xl font-black mt-2">Welcome, {currentUser.fullName}</h1><p className="text-xs text-white/70 mt-1">{currentUser.email} · {currentUser.appStatus}</p></div>
        <button onClick={handleSignOut} className="rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-xs font-black flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>

      {errorMsg && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700">{errorMsg}</div>}
      {successMsg && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-700">{successMsg}</div>}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setSubTab(tab.id)} className={`rounded-xl px-4 py-2.5 text-xs font-black flex items-center gap-2 ${subTab === tab.id ? "bg-[#0B5D3B] text-white" : "bg-white border border-slate-200 text-slate-600"}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}
      </div>

      {subTab === "tracker" && <StudentApplicationTracker />}
      {subTab === "sop" && <SOPGenerator currentUser={currentUser} />}
      {subTab === "visa" && <VisaChecklist currentUser={currentUser} />}
      {subTab === "billing" && <StudentInvoices currentUser={currentUser} />}
      {subTab === "overview" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-3xl">
          <div className="flex items-center gap-2 text-[#0B5D3B]"><Lock className="h-5 w-5" /><h2 className="text-lg font-black">Student profile</h2></div>
          <p className="text-xs text-slate-500 mt-2">Profile changes are saved to your authenticated Supabase user metadata. Staff permissions cannot be created from this portal.</p>
          <form onSubmit={handleUpdateProfile} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Mobile" className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            <select value={preferredCountry} onChange={(e) => setPreferredCountry(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white">{["United Kingdom", "Canada", "Australia", "United States", "Ireland", "Germany", "New Zealand", "Malaysia"].map((c) => <option key={c}>{c}</option>)}</select>
            <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white">{["Secondary / SSC", "Higher Secondary / HSC / A Levels", "Diploma Degree", "Bachelor's Degree", "Master's Degree"].map((e) => <option key={e}>{e}</option>)}</select>
            <input value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="GPA / score" className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            <select value={englishTest} onChange={(e) => setEnglishTest(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white"><option>IELTS</option><option>PTE</option><option>TOEFL</option><option>Duolingo</option><option>None</option></select>
            <input value={englishScore} onChange={(e) => setEnglishScore(e.target.value)} placeholder="English score" className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            <button disabled={loading} className="sm:col-span-2 rounded-xl bg-[#0B5D3B] text-white py-3.5 text-sm font-black disabled:opacity-60">Save profile</button>
          </form>
        </div>
      )}
    </section>
  );
}
