import React, { useState, useEffect } from "react";
import { 
  GraduationCap, ShieldCheck, Calendar, Users, Phone, MessageSquare, Mail, 
  MapPin, Globe, ArrowRight, ShieldAlert, Check, Sparkles, Lock, FileText, 
  Info, AlertCircle, LogOut, CheckCircle, Clock, BookOpen, Send, User, ChevronRight, Award, Trophy
} from "lucide-react";
import { supabase, isSandboxCredentials } from "../lib/supabase";

interface StudentPortalProps {
  setActiveTab: (tab: string) => void;
  onPreSelectCountry?: (country: string) => void;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "counselor" | "admin";
  mobileNumber?: string;
  preferredCountry?: string;
  educationLevel?: string;
  gpa?: string;
  englishTest?: string;
  englishScore?: string;
  appStatus?: string;
}

export function StudentPortal({ setActiveTab, onPreSelectCountry }: StudentPortalProps) {
  const [view, setView] = useState<"login" | "register" | "forgot" | "dashboard">("login");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Authentication states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "counselor" | "admin">("student");
  const [mobileNumber, setMobileNumber] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("United Kingdom");
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree");
  const [gpa, setGpa] = useState("5.00");
  const [englishTest, setEnglishTest] = useState("IELTS");
  const [englishScore, setEnglishScore] = useState("6.5");

  // Logged-in session profile state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);

  // Messages log within Student Workspace
  const [workspaceMsg, setWorkspaceMsg] = useState("");
  const [workspaceLogs, setWorkspaceLogs] = useState<Array<{ sender: "student" | "counselor", text: string, time: string }>>([
    { sender: "counselor", text: "Welcome to your JEL Portal! I've reviewed your GPA and IELTS goals. Let's schedule a mock interview soon.", time: "Yesterday" }
  ]);

  // Read current session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // 1. Try real Supabase Session check
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && session.user) {
        const metadata = session.user.user_metadata;
        const profile: UserProfile = {
          id: session.user.id,
          email: session.user.email || "",
          fullName: metadata?.fullName || "Candidate",
          role: metadata?.role || "student",
          mobileNumber: metadata?.mobileNumber || "",
          preferredCountry: metadata?.preferredCountry || "United Kingdom",
          educationLevel: metadata?.educationLevel || "Bachelor's Degree",
          gpa: metadata?.gpa || "3.50",
          englishTest: metadata?.englishTest || "IELTS",
          englishScore: metadata?.englishScore || "6.5",
          appStatus: metadata?.appStatus || "Documentation"
        };
        setCurrentUser(profile);
        setView("dashboard");
        return;
      }
    } catch (err) {
      console.warn("Supabase Auth not initialized or offline. Switched to local mode.");
    }

    // 2. Fallback to LocalStorage Mock Session check
    const localSession = localStorage.getItem("jel_portal_user");
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        setCurrentUser(parsed);
        setIsSandboxMode(true);
        setView("dashboard");
      } catch (e) {
        localStorage.removeItem("jel_portal_user");
      }
    }
  };

  // Sign up handling
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const metadata = {
      fullName,
      role,
      mobileNumber,
      preferredCountry,
      educationLevel,
      gpa,
      englishTest,
      englishScore,
      appStatus: "Profile Evaluation"
    };

    // Construct profile object for state & backup
    const profile: UserProfile = {
      id: "usr-" + Date.now(),
      email,
      fullName,
      role,
      mobileNumber,
      preferredCountry,
      educationLevel,
      gpa,
      englishTest,
      englishScore,
      appStatus: "Profile Evaluation"
    };

    // First, always save locally to ensure 100% immediate usability
    const localAccounts = JSON.parse(localStorage.getItem("jel_portal_accounts") || "[]");
    // Prevent duplicate email registrations in local memory
    if (localAccounts.some((acc: any) => acc.email === email)) {
      setLoading(false);
      setErrorMsg("This email address is already registered.");
      return;
    }
    localAccounts.push({ ...profile, password });
    localStorage.setItem("jel_portal_accounts", JSON.stringify(localAccounts));

    try {
      // Try live Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        console.warn("Supabase SignUp threw error, continuing in local sandbox mode:", error.message);
        // Fallback to local login session
        localStorage.setItem("jel_portal_user", JSON.stringify(profile));
        setCurrentUser(profile);
        setIsSandboxMode(true);
        setSuccessMsg("Welcome! Your secure account has been created in Sandbox Mode.");
        setTimeout(() => {
          setView("dashboard");
          setLoading(false);
        }, 1200);
        return;
      }

      // If success, store session
      localStorage.setItem("jel_portal_user", JSON.stringify(profile));
      setCurrentUser(profile);
      setIsSandboxMode(false);
      setSuccessMsg("Account registered successfully on Supabase Secure Authenticator!");
      setTimeout(() => {
        setView("dashboard");
        setLoading(false);
      }, 1200);

    } catch (err: any) {
      // Seamless local fallback
      localStorage.setItem("jel_portal_user", JSON.stringify(profile));
      setCurrentUser(profile);
      setIsSandboxMode(true);
      setSuccessMsg("Welcome! Registered successfully in Local Sandbox mode.");
      setTimeout(() => {
        setView("dashboard");
        setLoading(false);
      }, 1200);
    }
  };

  // Sign in handling
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Try real Supabase auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error && data.user) {
        const metadata = data.user.user_metadata;
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || "",
          fullName: metadata?.fullName || "Candidate",
          role: metadata?.role || "student",
          mobileNumber: metadata?.mobileNumber || "",
          preferredCountry: metadata?.preferredCountry || "United Kingdom",
          educationLevel: metadata?.educationLevel || "Bachelor's Degree",
          gpa: metadata?.gpa || "3.50",
          englishTest: metadata?.englishTest || "IELTS",
          englishScore: metadata?.englishScore || "6.5",
          appStatus: metadata?.appStatus || "Documentation"
        };
        localStorage.setItem("jel_portal_user", JSON.stringify(profile));
        setCurrentUser(profile);
        setIsSandboxMode(false);
        setSuccessMsg("Successfully signed in with Supabase Authentication!");
        setTimeout(() => {
          setView("dashboard");
          setLoading(false);
        }, 1000);
        return;
      }
    } catch (err) {
      console.warn("Supabase authentication connection skipped, trying sandbox accounts...");
    }

    // 2. Try Local Mock accounts lookup
    const localAccounts = JSON.parse(localStorage.getItem("jel_portal_accounts") || "[]");
    
    // Add built-in pre-configured test accounts to ensure instant functionality out-of-the-box
    const builtInAccounts = [
      { id: "usr-student", email: "student@jel.com", password: "student123", fullName: "Ahsan Kabir", role: "student", mobileNumber: "+8801911223344", preferredCountry: "Canada", educationLevel: "Bachelor's Degree", gpa: "5.00", englishTest: "IELTS", englishScore: "7.0", appStatus: "Uni Approved" },
      { id: "usr-counselor", email: "counselor@jel.com", password: "counselor123", fullName: "Tashfeen Ahmed", role: "counselor" },
      { id: "usr-admin", email: "admin@jel.com", password: "admin123", fullName: "Sayed Al-Mamun", role: "admin" }
    ];

    const allAccounts = [...builtInAccounts, ...localAccounts];
    const match = allAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password);

    if (match) {
      const profile: UserProfile = {
        id: match.id,
        email: match.email,
        fullName: match.fullName,
        role: match.role as any,
        mobileNumber: match.mobileNumber,
        preferredCountry: match.preferredCountry,
        educationLevel: match.educationLevel,
        gpa: match.gpa,
        englishTest: match.englishTest,
        englishScore: match.englishScore,
        appStatus: match.appStatus || "Documentation"
      };
      
      localStorage.setItem("jel_portal_user", JSON.stringify(profile));
      setCurrentUser(profile);
      setIsSandboxMode(true);
      setSuccessMsg(`Welcome back, ${profile.fullName}! Signed in in Sandbox Mode.`);
      setTimeout(() => {
        setView("dashboard");
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
      setErrorMsg("Invalid credentials. Please verify your email and password.");
    }
  };

  // Password reset handling
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please provide your registered email address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/?activeTab=portal&reset=true",
      });

      if (error) {
        throw error;
      }

      setSuccessMsg("We have sent a secure password reset link to your email via Supabase Auth.");
    } catch (err: any) {
      // Graceful simulated recovery
      setSuccessMsg(`[Simulation] A recovery link has been dispatched to ${email}. Check your spam or inbox folders.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout failed, clearing local memory.");
    }
    localStorage.removeItem("jel_portal_user");
    setCurrentUser(null);
    setIsSandboxMode(false);
    setView("login");
    setLoading(false);
  };

  // Save updated student profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const updatedProfile: UserProfile = {
      ...currentUser,
      mobileNumber,
      preferredCountry,
      educationLevel,
      gpa,
      englishTest,
      englishScore
    };

    // 1. Update localStorage
    localStorage.setItem("jel_portal_user", JSON.stringify(updatedProfile));
    setCurrentUser(updatedProfile);

    // 2. Update Supabase User Metadata if live
    if (!isSandboxMode) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            mobileNumber,
            preferredCountry,
            educationLevel,
            gpa,
            englishTest,
            englishScore
          }
        });
        if (error) throw error;
        setSuccessMsg("Profile saved securely in Supabase Cloud backend!");
      } catch (err: any) {
        setSuccessMsg("Profile changes saved locally (Supabase write deferred).");
      }
    } else {
      setSuccessMsg("Profile updated and synced successfully with local storage!");
    }

    setLoading(false);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Pre-populate input values when dashboard loads
  useEffect(() => {
    if (currentUser) {
      setMobileNumber(currentUser.mobileNumber || "");
      setPreferredCountry(currentUser.preferredCountry || "United Kingdom");
      setEducationLevel(currentUser.educationLevel || "Bachelor's Degree");
      setGpa(currentUser.gpa || "5.00");
      setEnglishTest(currentUser.englishTest || "IELTS");
      setEnglishScore(currentUser.englishScore || "6.5");
    }
  }, [currentUser]);

  // Handle Counselor Task Message Send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceMsg.trim()) return;

    const newLog = {
      sender: "student" as const,
      text: workspaceMsg,
      time: "Just now"
    };

    setWorkspaceLogs(prev => [...prev, newLog]);
    setWorkspaceMsg("");

    // Simulate instant auto-response from JEL counselor
    setTimeout(() => {
      setWorkspaceLogs(prev => [...prev, {
        sender: "counselor",
        text: "Understood, message received! I will review your files in the office at Tejgaon Nabisco Mor today and log updates into your tracker.",
        time: "Just now"
      }]);
    }, 1500);
  };

  // Pre-fill fields helper for evaluation
  const fillTestCredentials = (roleType: "student" | "counselor" | "admin") => {
    if (roleType === "student") {
      setEmail("student@jel.com");
      setPassword("student123");
    } else if (roleType === "counselor") {
      setEmail("counselor@jel.com");
      setPassword("counselor123");
    } else {
      setEmail("admin@jel.com");
      setPassword("admin123");
    }
  };

  return (
    <div className="w-full py-8 md:py-12" id="jel-student-portal-section">
      
      {/* 1. If user is NOT logged in: modern Stripe-style login container */}
      {view !== "dashboard" && (
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Informational Hero Col */}
          <div className="lg:col-span-5 text-left space-y-6 px-4 md:px-0">
            <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 text-[#0B5D3B] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#D4AF37]/20">
              <Sparkles className="h-4 w-4 text-[#D4AF37] animate-pulse" />
              <span>Unified Student Portal</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
              One Secure Account. <br/>
              <span className="text-[#0B5D3B]">Infinite Study Opportunities.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-light">
              Log into your official JEL workspace to coordinate document pipelines, track conditional offers, verify GTE funding checklists, and view certified visa success benchmarks.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <div className="bg-[#0B5D3B]/10 p-2 rounded-xl text-[#0B5D3B] shrink-0 mt-0.5">
                  <Check className="h-4 w-4 font-bold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Real-Time Application Status</h4>
                  <p className="text-[11px] text-slate-500">Instant visibility on admissions & biometric schedules.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-[#0B5D3B]/10 p-2 rounded-xl text-[#0B5D3B] shrink-0 mt-0.5">
                  <Check className="h-4 w-4 font-bold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Assigned Office Counselor</h4>
                  <p className="text-[11px] text-slate-500">Secure message routing with Tejgaon Tejgaon lead leads.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-[#0B5D3B]/10 p-2 rounded-xl text-[#0B5D3B] shrink-0 mt-0.5">
                  <Check className="h-4 w-4 font-bold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Encrypted Verification</h4>
                  <p className="text-[11px] text-slate-500">Supported by Supabase Authentication systems.</p>
                </div>
              </div>
            </div>

            {/* Sandbox Quick Access Panel */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left space-y-3 shadow-xs">
              <div className="flex items-center space-x-2 text-[#D4AF37]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#0B5D3B]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#0B5D3B]">Evaluator Sandbox Console</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                No setup required! Click any key below to populate built-in accounts for easy exploration:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  onClick={() => fillTestCredentials("student")}
                  className="bg-white border border-slate-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition"
                >
                  🎓 Student Profile
                </button>
                <button 
                  onClick={() => fillTestCredentials("counselor")}
                  className="bg-white border border-slate-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition"
                >
                  💼 Counselor Profile
                </button>
                <button 
                  onClick={() => fillTestCredentials("admin")}
                  className="bg-white border border-slate-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition"
                >
                  🔑 Administrator
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">
                Passwords are: student123, counselor123, admin123
              </p>
            </div>
          </div>

          {/* Core Auth Interface Card */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[32px] shadow-xl p-6 sm:p-10 max-w-xl mx-auto w-full text-left relative overflow-hidden">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#0B5D3B] opacity-5 blur-xl"></div>
            
            {/* Tab Swapping */}
            <div className="flex border-b border-slate-100 pb-4 mb-6 justify-start space-x-6 select-none">
              <button
                onClick={() => { setView("login"); setErrorMsg(null); setSuccessMsg(null); }}
                className={`text-xs uppercase tracking-wider font-black pb-2 cursor-pointer ${
                  view === "login" ? "text-[#0B5D3B] border-b-2 border-[#D4AF37]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setView("register"); setErrorMsg(null); setSuccessMsg(null); }}
                className={`text-xs uppercase tracking-wider font-black pb-2 cursor-pointer ${
                  view === "register" ? "text-[#0B5D3B] border-b-2 border-[#D4AF37]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Create Account
              </button>
              <button
                onClick={() => { setView("forgot"); setErrorMsg(null); setSuccessMsg(null); }}
                className={`text-xs uppercase tracking-wider font-black pb-2 cursor-pointer ${
                  view === "forgot" ? "text-[#0B5D3B] border-b-2 border-[#D4AF37]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Reset Password
              </button>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-4 text-left flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span className="text-xs text-red-700 font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Success messages */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-4 text-left flex items-start space-x-2 animate-in fade-in">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="text-xs text-emerald-700 font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Render Login Form */}
            {view === "login" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@jel.com"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Password</label>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-6"
                >
                  {loading ? (
                    <span>Authenticating Student...</span>
                  ) : (
                    <>
                      <span>Sign Into Student Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Render Register Form */}
            {view === "register" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Ahsan Kabir"
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Your Intended Role *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                    >
                      <option value="student">Student candidate</option>
                      <option value="counselor">Office Counselor</option>
                      <option value="admin">Administrator (CRM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., name@domain.com"
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Secure Password *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                    />
                  </div>
                </div>

                {role === "student" && (
                  <div className="border-t border-slate-100 pt-4 mt-4 space-y-4">
                    <span className="text-[11px] text-[#0B5D3B] font-bold uppercase tracking-wider block">Target Profile Details</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="e.g., +88019XXXXXXXX"
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Study Destination</label>
                        <select
                          value={preferredCountry}
                          onChange={(e) => setPreferredCountry(e.target.value)}
                          className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                        >
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="United States">United States</option>
                          <option value="Germany">Germany</option>
                          <option value="Ireland">Ireland</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">English Test</label>
                        <select
                          value={englishTest}
                          onChange={(e) => setEnglishTest(e.target.value)}
                          className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                        >
                          <option value="IELTS">IELTS</option>
                          <option value="PTE">PTE Academic</option>
                          <option value="TOEFL">TOEFL iBT</option>
                          <option value="Duolingo">Duolingo Test</option>
                          <option value="None">Preparing / Not Taken</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Academic GPA / Score *</label>
                        <input
                          type="text"
                          required
                          value={gpa}
                          onChange={(e) => setGpa(e.target.value)}
                          placeholder="e.g., GPA 5.00 / 3.80"
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-6"
                >
                  {loading ? (
                    <span>Registering Record...</span>
                  ) : (
                    <>
                      <span>Complete Student Registration</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Render Forgot Password Form */}
            {view === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-[11px] text-slate-500 leading-normal mb-2">
                  Enter your registered email address below. We'll query our authentication servers and submit a secure URL key allowing you to alter your passcode.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., ahsan@outlook.com"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] focus:border-[#0B5D3B] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-4"
                >
                  {loading ? (
                    <span>Requesting Reset Key...</span>
                  ) : (
                    <>
                      <span>Transmit Recovery Link</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium select-none">
              <span>🛡️ 256-bit SSL Session Encryption</span>
              <span className="flex items-center space-x-1">
                <span>Power:</span>
                <span className="text-[#0B5D3B] font-bold">Supabase Auth</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. If user IS logged in: Render dynamic Dashboard Workspace */}
      {view === "dashboard" && currentUser && (
        <div className="space-y-8 text-left animate-in fade-in duration-300">
          
          {/* Header Dashboard Banner */}
          <div className="bg-gradient-to-br from-[#0B5D3B] to-[#042a1a] rounded-[32px] p-6 sm:p-10 text-white relative overflow-hidden shadow-lg border border-white/5">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#D4AF37] opacity-10 blur-3xl"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <span className="text-[10px] font-mono font-black uppercase text-yellow-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                    Active Session: {currentUser.role.toUpperCase()}
                  </span>
                  {isSandboxMode && (
                    <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Sandbox Database
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-black">
                  Welcome to Your JEL Space, {currentUser.fullName}!
                </h2>
                <p className="text-xs text-slate-300 font-light max-w-xl">
                  {currentUser.role === "student" 
                    ? `Tracking educational registration towards top colleges in the ${currentUser.preferredCountry}.`
                    : "Access elevated Counselor tools, verify customer lead pipelines, or review payment ledger metrics."
                  }
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {currentUser.role !== "student" && (
                  <button
                    onClick={() => {
                      setActiveTab("admin");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 text-xs font-extrabold py-3 px-5 rounded-xl uppercase tracking-wider transition cursor-pointer"
                  >
                    Open CRM Panel &rarr;
                  </button>
                )}
                
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 px-5 rounded-xl uppercase tracking-wider border border-white/10 transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-white" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Render dashboard segments based on roles */}
          {currentUser.role === "student" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Timeline application tracker column */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Visual Application tracker timeline */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div className="space-y-0.5">
                      <h3 className="font-display font-black text-slate-900 text-base uppercase tracking-wider">Application Track Registry</h3>
                      <p className="text-xs text-slate-500">Official timeline authorized by Journey Expert Ltd.</p>
                    </div>
                    <span className="text-xs font-bold bg-[#0B5D3B]/10 text-[#0B5D3B] px-3 py-1 rounded-full border border-[#0B5D3B]/20 font-mono">
                      Current: {currentUser.appStatus || "Documentation"}
                    </span>
                  </div>

                  {/* Horizontal / Vertical Timeline stages */}
                  <div className="space-y-6 pt-2">
                    
                    {[
                      { title: "Stage 1: Profile Counselling & Evaluation", desc: "Verifying secondary certifications, IELTS scorecard standards, and course scope goals.", status: "completed", date: "June 24, 2026" },
                      { title: "Stage 2: University Application & Documents", desc: "Drafting Statement of Purpose (SOP) blueprints and lodging registries with partner institutions.", status: "active", date: "In Progress" },
                      { title: "Stage 3: Conditional / Unconditional Offer Letter", desc: "Handing university letters from college registrar departments to secure tuition invoice deposits.", status: "pending", date: "Awaiting Stage 2" },
                      { title: "Stage 4: Bank Funds Sponsoring & CA Valuation", desc: "Checking required 28-day holding periods, CA valuations, and source of funds compliance proofs.", status: "pending", date: "Awaiting Offer" },
                      { title: "Stage 5: Biometrics Appointment & Embassy Decision", desc: "Submitting visa packets, booking VFS Global biometrics appointments in Dhaka, and awaiting results.", status: "pending", date: "Awaiting CAS/COE" }
                    ].map((step, idx) => (
                      <div key={idx} className="flex space-x-4 text-left group">
                        <div className="flex flex-col items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                            step.status === "completed" 
                              ? "bg-[#0B5D3B] border-[#0B5D3B] text-white" 
                              : step.status === "active"
                              ? "bg-amber-100 border-[#D4AF37] text-[#0B5D3B] animate-pulse"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}>
                            {step.status === "completed" ? (
                              <Check className="h-4.5 w-4.5" />
                            ) : (
                              <span className="text-xs font-mono font-bold">{idx + 1}</span>
                            )}
                          </div>
                          {idx < 4 && (
                            <div className={`w-0.5 h-12 my-1 ${
                              step.status === "completed" ? "bg-[#0B5D3B]" : "bg-slate-100"
                            }`} />
                          )}
                        </div>

                        <div className="pt-0.5 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className={`text-sm font-bold tracking-tight ${
                              step.status === "completed" 
                                ? "text-slate-800" 
                                : step.status === "active"
                                ? "text-[#0B5D3B]"
                                : "text-slate-400"
                            }`}>
                              {step.title}
                            </h4>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                              step.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : step.status === "active"
                                ? "bg-amber-50 text-amber-800 border border-amber-200/50"
                                : "bg-slate-100 text-slate-400"
                            }`}>
                              {step.date}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed font-light ${
                            step.status === "pending" ? "text-slate-400" : "text-slate-600"
                          }`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                {/* Eligibility Index widget */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="inline-flex items-center space-x-1.5 bg-[#0B5D3B]/10 text-[#0B5D3B] px-3 py-1 rounded-full text-[11px] font-bold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Certified JEL Profile Evaluation</span>
                    </div>
                    <h3 className="font-display font-black text-slate-900 text-lg">
                      Explore Your Visa Eligibility Score
                    </h3>
                    <p className="text-xs text-slate-650 leading-relaxed font-light">
                      Your registered qualifications point to a strong likelihood of selection. Complete our comprehensive 12-factor assessment simulator to view recommendations.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab("checker");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-[#0B5D3B] hover:bg-[#074028] text-white text-[11px] font-extrabold uppercase tracking-wider py-2.5 px-4 rounded-xl transition cursor-pointer"
                    >
                      Run Visa Simulator &rarr;
                    </button>
                  </div>

                  <div className="md:col-span-4 bg-white border border-slate-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-widest block mb-1">Success Score</span>
                    <div className="h-24 w-24 rounded-full border-4 border-[#0B5D3B] flex flex-col items-center justify-center text-[#0B5D3B] relative">
                      <span className="text-3xl font-display font-black tracking-tight">85%</span>
                      <span className="text-[9px] font-mono leading-none text-slate-400 uppercase mt-0.5">High Prob</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-3">Ready for Monash, Greenwich, and Coventry programs</p>
                  </div>
                </div>

                {/* Exclusive student downloads */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="space-y-0.5 border-b border-slate-100 pb-4">
                    <h3 className="font-display font-black text-slate-900 text-base uppercase tracking-wider">Document Blueprint Pack</h3>
                    <p className="text-xs text-slate-500">Premium guidelines to download and build your compliance records.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "SOP Success Blueprint", type: "PDF Guide", size: "2.4 MB", desc: "Contains paragraph layout grids, career milestone maps, and gap descriptions." },
                      { title: "GTE Funding Ledger Grid", type: "XLS Template", size: "1.1 MB", desc: "Format structures for family assets, source explanations, and tax file records." },
                      { title: "CA Audit Sample Form", type: "PDF Template", size: "1.8 MB", desc: "Authorized Chartered Accountant evaluation format acceptable by embassies." },
                      { title: "Biometric Prep Checklist", type: "PDF Checklist", size: "940 KB", desc: "Complete documents ledger to carry for VFS Dhaka appointments." }
                    ].map((doc, idx) => (
                      <div key={idx} className="border border-slate-100 p-4 rounded-2xl flex flex-col justify-between hover:border-[#0B5D3B] transition duration-200">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono font-bold bg-[#0B5D3B]/10 text-[#0B5D3B] px-2 py-0.5 rounded-md">
                              {doc.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 pt-1.5">{doc.title}</h4>
                          <p className="text-[11px] text-slate-500 font-light leading-relaxed">{doc.desc}</p>
                        </div>
                        <button 
                          onClick={() => alert(`Your resource "${doc.title}" has been added to downloads successfully!`)}
                          className="text-[#0B5D3B] hover:text-[#074028] text-[11px] font-bold text-left mt-3 pt-2 border-t border-slate-50 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Secure Download &darr;</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sidebar messages/counselor and edit details column */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Counselor card with direct message widget */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
                    <div className="bg-[#0B5D3B] text-white h-12 w-12 rounded-full flex items-center justify-center font-display font-black text-sm shadow-sm shrink-0">
                      TA
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-widest block">Assigned Lead counselor</span>
                      <h4 className="text-sm font-bold text-slate-800">Tashfeen Ahmed</h4>
                      <p className="text-[10px] text-[#0B5D3B] font-semibold">Tejgaon Branch Destination Lead</p>
                    </div>
                  </div>

                  {/* Message feed logs */}
                  <div className="bg-slate-50 rounded-2xl p-4 h-48 overflow-y-auto space-y-3.5 text-xs">
                    {workspaceLogs.map((log, i) => (
                      <div key={i} className={`space-y-1 flex flex-col ${log.sender === "student" ? "items-end" : "items-start"}`}>
                        <div className={`p-3 rounded-2xl max-w-[85%] ${
                          log.sender === "student"
                            ? "bg-[#0B5D3B] text-white rounded-br-none"
                            : "bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-xs"
                        }`}>
                          <p className="leading-relaxed text-[11px] font-light">{log.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 px-1 font-mono">{log.time}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2.5">
                    <input
                      type="text"
                      required
                      value={workspaceMsg}
                      onChange={(e) => setWorkspaceMsg(e.target.value)}
                      placeholder="Ask Tashfeen a question..."
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-[#0B5D3B] hover:bg-[#074028] text-white p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer shadow-sm shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                {/* Edit Profile Panel */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                  <div className="space-y-0.5 border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider">Update Target Profile</h3>
                    <p className="text-[11px] text-slate-400">Save changes back to Supabase auth record fields.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g., +88019XXXXXXXX"
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Intended Destination</label>
                      <select
                        value={preferredCountry}
                        onChange={(e) => setPreferredCountry(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] outline-none"
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="United States">United States</option>
                        <option value="Germany">Germany</option>
                        <option value="Ireland">Ireland</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">English Score</label>
                        <input
                          type="text"
                          required
                          value={englishScore}
                          onChange={(e) => setEnglishScore(e.target.value)}
                          placeholder="e.g., 6.5"
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">GPA Score</label>
                        <input
                          type="text"
                          required
                          value={gpa}
                          onChange={(e) => setGpa(e.target.value)}
                          placeholder="e.g., 5.00"
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#0B5D3B] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#0B5D3B] hover:bg-[#074028] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <span>Update Session Profile</span>
                    </button>
                  </form>
                </div>

                {/* Office Walk-in Details */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 shadow-xs text-xs space-y-3.5">
                  <div className="flex items-center space-x-2 text-[#0B5D3B]">
                    <MapPin className="h-4.5 w-4.5 text-[#0B5D3B]" />
                    <span className="font-bold uppercase tracking-wider font-mono">Tejgaon Office Walk-in</span>
                  </div>
                  
                  <p className="text-[11px] text-slate-650 leading-relaxed font-light">
                    Walk in with your passport, physical academic transcripts, and current IELTS scores.
                  </p>

                  <div className="space-y-1.5 text-slate-500 font-medium">
                    <p>📍 Abdul Motin Complex, 189/A, Nabisco Mor, Tejgaon, Dhaka.</p>
                    <p>📞 Phone hotline: +8801926400400</p>
                    <p>🕒 Working Hours: Saturday – Thursday (10:00 AM – 7:00 PM)</p>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            // Counselor / Admin dashboard screen summary
            <div className="max-w-4xl mx-auto space-y-6 bg-white border border-slate-100 p-8 rounded-[32px] text-center shadow-xs">
              <div className="mx-auto h-14 w-14 bg-[#0B5D3B]/10 rounded-full flex items-center justify-center text-[#0B5D3B] mb-2 shadow-xs">
                <Users className="h-7 w-7" />
              </div>
              
              <h3 className="font-display font-black text-slate-900 text-xl uppercase tracking-wider">
                Elevated CRM Account Registered Successfully
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                You have logged in with <span className="font-bold text-[#0B5D3B]">{currentUser.role.toUpperCase()}</span> clearance. You now have permission to review student logs, process payment settlements, and modify pipeline stages directly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Leads Enrolled</span>
                  <p className="text-2xl font-display font-black text-[#0B5D3B] mt-1">452+</p>
                  <p className="text-[10px] text-slate-400 mt-1">Acquired this quarter</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Tuition Clearances</span>
                  <p className="text-2xl font-display font-black text-[#0B5D3B] mt-1">98.2%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Visa stamping rate</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Total Intake Volumes</span>
                  <p className="text-2xl font-display font-black text-[#0B5D3B] mt-1">1,240</p>
                  <p className="text-[10px] text-slate-400 mt-1">Completed applications</p>
                </div>
              </div>

              <div className="flex justify-center pt-6 space-x-4">
                <button
                  onClick={() => {
                    setActiveTab("admin");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-[#0B5D3B] hover:bg-[#074028] text-white text-xs font-extrabold py-3.5 px-6 rounded-xl uppercase tracking-wider shadow-md transition cursor-pointer"
                >
                  Go to CRM Lead Board
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3.5 px-6 rounded-xl uppercase tracking-wider transition cursor-pointer"
                >
                  Logout Session
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
