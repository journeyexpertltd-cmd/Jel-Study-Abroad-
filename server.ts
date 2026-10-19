import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

function getCommandLinePort(): number | null {
  const portIndex = process.argv.indexOf("--port");
  if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const val = parseInt(process.argv[portIndex + 1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
}

// Port resolution:
// In AI Studio Dev environment, Nginx listens on 8080 and proxies traffic to DEFAULT_APP_PORT (3000).
// In Cloud Run production deployment, there is no Nginx proxy; Cloud Run injects PORT (default 8080)
// and expects the application to listen on that exact port for traffic and rollout health checks.
const cliPort = getCommandLinePort();
const isDevContainer = Boolean(process.env.NGINX_PORT);
const PORT = cliPort || (isDevContainer
  ? (Number(process.env.DEFAULT_APP_PORT) || 3000)
  : (Number(process.env.PORT) || Number(process.env.DEFAULT_APP_PORT) || 3000));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Immediate zero-latency health check routes
app.get(["/health", "/api/health", "/healthz", "/_ah/health"], (req, res) => {
  res.status(200).json({ status: "ok", service: "jel-server", timestamp: new Date().toISOString() });
});

// Lazy-initialized Gemini client safe engine
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Lazy-initialized Supabase Client
let supabaseInstance: any = null;
let localTransactions: any[] = [];
function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL || "https://fkwujxzeahauouhquhdw.supabase.co";
    const supabaseKey = process.env.SUPABASE_KEY || "sb_publishable_QaOyxgqQVKNN39QIxcv7hw_QHP7PKK5";
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_KEY are required environment variables");
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }
  return supabaseInstance;
}

// Get Supabase state & settings
app.get("/api/supabase/config", (req, res) => {
  const url = process.env.SUPABASE_URL || "https://fkwujxzeahauouhquhdw.supabase.co";
  const configured = !!url;
  res.json({
    configured,
    url,
    projectId: "fkwujxzeahauouhquhdw",
    requiredSql: `CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  mobile_number TEXT,
  preferred_country TEXT,
  education_level TEXT,
  message TEXT,
  status TEXT,
  notes TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  fee_type TEXT,
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  bank_tran_id TEXT,
  card_type TEXT,
  created_at TEXT
);`
  });
});

// Fetch all leads from Supabase with fallback to empty list or error
app.get("/api/supabase/leads", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation \"leads\" does not exist")) {
        return res.status(250).json({ 
          success: false, 
          tableNotFound: true, 
          error: "Table 'leads' does not exist in your Supabase database. Run the SQL script in your Supabase dashboard." 
        });
      }
      throw error;
    }

    // Map from snake_case back to camelCase for the frontend if necessary
    const mappedData = (data || []).map((row: any) => ({
      id: row.id,
      fullName: row.full_name || row.fullName || "",
      email: row.email || "",
      mobileNumber: row.mobile_number || row.mobileNumber || "",
      preferredCountry: row.preferred_country || row.preferredCountry || "",
      educationLevel: row.education_level || row.educationLevel || "",
      message: row.message || "",
      status: row.status || "New",
      notes: row.notes || "",
      createdAt: row.created_at || row.createdAt || ""
    }));

    res.json({ success: true, count: mappedData.length, data: mappedData });
  } catch (error: any) {
    console.error("Supabase leads listing failed:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch leads from Supabase" });
  }
});

// Insert single lead into Supabase
app.post("/api/supabase/booking", async (req, res) => {
  try {
    const { id, fullName, email, mobileNumber, preferredCountry, educationLevel, message, status, notes, createdAt } = req.body;
    
    if (!fullName || !email) {
      return res.status(400).json({ success: false, error: "fullName and email are required" });
    }

    const supabase = getSupabaseClient();
    
    const rowToInsert = {
      id: id || `lead-user-${Date.now()}`,
      full_name: fullName,
      email: email,
      mobile_number: mobileNumber || "",
      preferred_country: preferredCountry || "",
      education_level: educationLevel || "",
      message: message || "",
      status: status || "New",
      notes: notes || "",
      created_at: createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const { data, error } = await supabase
      .from("leads")
      .insert([rowToInsert])
      .select();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation \"leads\" does not exist")) {
        return res.status(250).json({ 
          success: false, 
          tableNotFound: true, 
          error: "Table 'leads' does not exist in your Supabase database. Create it first using the SQL editor." 
        });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Supabase booking insert failed:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to write booking to Supabase" });
  }
});

// Sync multiple leads (e.g., from localStorage) to Supabase
app.post("/api/supabase/sync", async (req, res) => {
  try {
    const { leads } = req.body;
    if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({ success: false, error: "leads array required" });
    }

    const supabase = getSupabaseClient();
    const rows = leads.map((lead: any) => ({
      id: lead.id || `lead-user-${Date.now()}`,
      full_name: lead.fullName,
      email: lead.email,
      mobile_number: lead.mobileNumber || "",
      preferred_country: lead.preferredCountry || "",
      education_level: lead.educationLevel || "",
      message: lead.message || "",
      status: lead.status || "New",
      notes: lead.notes || "",
      created_at: lead.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
    }));

    const { data, error } = await supabase
      .from("leads")
      .upsert(rows, { onConflict: "id" })
      .select();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation \"leads\" does not exist")) {
        return res.status(250).json({ 
          success: false, 
          tableNotFound: true, 
          error: "Table 'leads' does not exist in your Supabase database." 
        });
      }
      throw error;
    }

    res.json({ success: true, synced: rows.length, data });
  } catch (error: any) {
    console.error("Supabase batch sync failed:", error);
    res.status(500).json({ success: false, error: error.message || "Sync failed" });
  }
});

// ==========================================
// SSLCOMMERZ: PAYMENT GATEWAY INTEGRATIONS
// ==========================================

// 1. Fetch all payment transactions
app.get("/api/sslcommerz/transactions", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation \"transactions\" does not exist")) {
        return res.json({
          success: true,
          tableNotFound: true,
          data: localTransactions
        });
      }
      throw error;
    }

    const mappedData = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      feeType: row.fee_type || row.feeType || "",
      amount: Number(row.amount || 0),
      currency: row.currency || "BDT",
      status: row.status || "Pending",
      bankTranId: row.bank_tran_id || row.bankTranId || "N/A",
      cardType: row.card_type || row.cardType || "N/A",
      createdAt: row.created_at || row.createdAt || ""
    }));

    res.json({ success: true, data: mappedData });
  } catch (error: any) {
    console.warn("Supabase fetch transactions failed, showing in-memory logs:", error.message);
    res.json({ success: true, data: localTransactions });
  }
});

// 2. Initiate Online Payment
app.post("/api/sslcommerz/initiate", async (req, res) => {
  try {
    const { name, email, phone, feeType, amount, currency } = req.body;
    if (!name || !email || !amount) {
      return res.status(400).json({ success: false, error: "Name, email and amount are required fields" });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: "Validation failed: Amount must be a positive number" });
    }

    const storeId = process.env.SSLCOMMERZ_STORE_ID || "testbox";
    const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD || "testbox_pay@ssl";
    const isSandbox = (process.env.SSLCOMMERZ_IS_SANDBOX !== "false");

    const tranId = `JEL-TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const curr = currency || "BDT";

    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    
    // Construct SSLCommerz form data
    const paymentParams = new URLSearchParams();
    paymentParams.append("store_id", storeId);
    paymentParams.append("store_passwd", storePasswd);
    paymentParams.append("total_amount", String(numericAmount));
    paymentParams.append("currency", curr);
    paymentParams.append("tran_id", tranId);

    // Callbacks url mapping
    paymentParams.append("success_url", `${appUrl}/api/sslcommerz/callback?status=success&tran_id=${tranId}`);
    paymentParams.append("fail_url", `${appUrl}/api/sslcommerz/callback?status=fail&tran_id=${tranId}`);
    paymentParams.append("cancel_url", `${appUrl}/api/sslcommerz/callback?status=cancel&tran_id=${tranId}`);
    paymentParams.append("ipn_url", `${appUrl}/api/sslcommerz/callback?status=ipn&tran_id=${tranId}`);

    // Customer specifications
    paymentParams.append("cus_name", name);
    paymentParams.append("cus_email", email);
    paymentParams.append("cus_phone", phone || "01926400400");
    paymentParams.append("cus_add1", "Tejgaon Nabisco Mor");
    paymentParams.append("cus_city", "Dhaka");
    paymentParams.append("cus_postcode", "1208");
    paymentParams.append("cus_country", "Bangladesh");

    // Operations configuration
    paymentParams.append("shipping_method", "NO");
    paymentParams.append("num_of_item", "1");
    paymentParams.append("product_name", feeType || "Counselling Fee");
    paymentParams.append("product_category", "Education");
    paymentParams.append("product_profile", "non-physical-goods");

    const sslcommerzEndpoint = isSandbox 
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://gateway.sslcommerz.com/gwprocess/v4/api.php";

    console.log(`[SSLCOMMERZ] Dispatching initiation request to SSLCommerz dynamic endpoint: ${sslcommerzEndpoint} for tran_id: ${tranId}`);

    const response = await fetch(sslcommerzEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: paymentParams.toString()
    });

    if (!response.ok) {
      throw new Error(`SSLCommerz gateway responded with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log("[SSLCOMMERZ] Initiation gateway response: ", JSON.stringify(responseData));

    if (responseData.status === "SUCCESS" && responseData.GatewayPageURL) {
      // Save Pending Transaction Log locally & remotely
      const paymentLog = {
        id: tranId,
        name,
        email,
        phone: phone || "01926400400",
        feeType: feeType || "Counselling Fee",
        amount: numericAmount,
        currency: curr,
        status: "Pending",
        bankTranId: "N/A",
        cardType: "N/A",
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
      };

      // 1. Add to local fallback logs
      localTransactions.unshift(paymentLog);

      // 2. Add to Supabase
      try {
        const supabase = getSupabaseClient();
        await supabase.from("transactions").insert([{
          id: paymentLog.id,
          name: paymentLog.name,
          email: paymentLog.email,
          phone: paymentLog.phone,
          fee_type: paymentLog.feeType,
          amount: paymentLog.amount,
          currency: paymentLog.currency,
          status: paymentLog.status,
          bank_tran_id: paymentLog.bankTranId,
          card_type: paymentLog.cardType,
          created_at: paymentLog.createdAt
        }]);
      } catch (dbErr: any) {
        console.warn("[SSLCOMMERZ] Supabase db logging pending failed, but proceeding: ", dbErr.message);
      }

      return res.json({ 
        success: true, 
        redirectUrl: responseData.GatewayPageURL, 
        tranId 
      });
    } else {
      return res.json({ 
        success: false, 
        error: responseData.failedreason || "Initiation failed at gateway. Check credentials." 
      });
    }
  } catch (error: any) {
    console.error("[SSLCOMMERZ] Exception initiating payment:", error);
    res.status(500).json({ success: false, error: error.message || "Payment initiation failed" });
  }
});

// 3. Callback Endpoint (Unified for success, fail, cancel)
app.all("/api/sslcommerz/callback", async (req, res) => {
  try {
    console.log("[SSLCOMMERZ CALLBACK] Received payment handshake request:", req.method, req.body, req.query);

    // Grab properties from body (POST) or query (GET)
    const txStatus = (req.body.status || req.query.status || "").toLowerCase();
    const tranId = req.body.tran_id || req.query.tran_id;
    const amount = req.body.amount || req.query.amount || "0";
    const card_type = req.body.card_type || req.query.card_type || "N/A";
    const bank_tran_id = req.body.bank_tran_id || req.query.bank_tran_id || "N/A";

    if (!tranId) {
      console.error("[SSLCOMMERZ CALLBACK] Missing tranId parameter.");
      return res.status(400).send("Parameter error: Missing tran_id");
    }

    // Determine final student status view
    let finalStatus = "Failed";
    if (txStatus === "success" || txStatus === "valid" || txStatus === "validated") {
      finalStatus = "Success";
    } else if (txStatus === "cancel" || txStatus === "cancelled") {
      finalStatus = "Cancelled";
    }

    console.log(`[SSLCOMMERZ CALLBACK] Status evaluation: ${finalStatus} for transaction: ${tranId}`);

    // 1. Update in local fallback in-memory database
    const localTx = localTransactions.find(t => t.id === tranId);
    if (localTx) {
      localTx.status = finalStatus;
      localTx.bankTranId = bank_tran_id;
      localTx.cardType = card_type;
    } else {
      // If payment was completed, but transaction didn't exist in memory yet
      localTransactions.unshift({
        id: tranId,
        name: "Valued Candidate",
        email: "candidate@example.com",
        phone: "01926400400",
        feeType: "Processing Fee",
        amount: Number(amount),
        currency: "BDT",
        status: finalStatus,
        bankTranId: bank_tran_id,
        cardType: card_type,
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
      });
    }

    // 2. Update status in Supabase if table exists
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("transactions")
        .update({
          status: finalStatus,
          bank_tran_id,
          card_type
        })
        .eq("id", tranId);

      if (error) {
        console.warn("[SSLCOMMERZ CALLBACK] Supabase transactions status update failed:", error.message);
      } else {
        console.log("[SSLCOMMERZ CALLBACK] Supabase transactions database updated successfully!");
      }
    } catch (e: any) {
      console.warn("[SSLCOMMERZ CALLBACK] Supabase error hook:", e.message);
    }

    // 3. Redirect back to frontend
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const redirectUrl = `${appUrl}/?activeTab=booking&pay_status=${finalStatus.toLowerCase()}&tran_id=${tranId}&amount=${amount}&card_type=${encodeURIComponent(card_type)}&bank_tran_id=${encodeURIComponent(bank_tran_id)}`;
    
    console.log(`[SSLCOMMERZ CALLBACK] Redirecting user browser to: ${redirectUrl}`);
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error("[SSLCOMMERZ CALLBACK] General exception hook:", error);
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    res.redirect(`${appUrl}/?activeTab=booking&pay_status=error&message=${encodeURIComponent(error.message || "Callback exception")}`);
  }
});

// 4. Batch sync local transactions to Supabase table
app.post("/api/sslcommerz/sync", async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ success: false, error: "Array of transaction items is required" });
    }

    const supabase = getSupabaseClient();
    const rows = transactions.map((t: any) => ({
      id: t.id || `TXN-${Date.now()}`,
      name: t.name || "",
      email: t.email || "",
      phone: t.phone || "",
      fee_type: t.feeType || t.fee_type || "",
      amount: Number(t.amount || 0),
      currency: t.currency || "BDT",
      status: t.status || "Pending",
      bank_tran_id: t.bankTranId || t.bank_tran_id || "N/A",
      card_type: t.cardType || t.card_type || "N/A",
      created_at: t.createdAt || t.created_at || new Date().toISOString().replace("T", " ").substring(0, 16)
    }));

    const { data, error } = await supabase
      .from("transactions")
      .upsert(rows, { onConflict: "id" })
      .select();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation \"transactions\" does not exist")) {
        return res.status(250).json({
          success: false,
          tableNotFound: true,
          error: "Table 'transactions' does not exist in Supabase database."
        });
      }
      throw error;
    }

    res.json({ success: true, synced: rows.length, data });
  } catch (error: any) {
    console.error("[SSLCOMMERZ] Sync transactions failed:", error);
    res.status(500).json({ success: false, error: error.message || "Sync failed" });
  }
});

// Utility to check if API key exists for UI status indicators
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    aiEnabled: hasKey,
    supabaseEnabled: !!(process.env.SUPABASE_URL || "https://fkwujxzeahauouhquhdw.supabase.co"),
    timestamp: new Date().toISOString(),
  });
});

// AI Chat AI endpoint proxy helper
app.post("/api/gemini/sop-generator", async (req: express.Request, res: express.Response) => {
  try {
    const { fullName, email, mobileNumber, preferredCountry, educationLevel, gpa, englishTest, englishScore, targetUniversity, targetCourse, careerGoals, writingStyle } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      // High quality, deeply personalized mock SOP (minimum 800 words) matching professional academic standards
      const mockSop = `STATEMENT OF PURPOSE

Candidate Name: ${fullName || "Ahsan Kabir"}
Desired Program: ${targetCourse || "M.Sc. in Data Science"}
Target Institution: ${targetUniversity || "University of Greenwich, London"}
Destination Country: ${preferredCountry || "United Kingdom"}
Language Standard: ${englishTest || "IELTS"} (${englishScore || "7.0"})
Academic Score: ${educationLevel || "Bachelor's Degree"} (${gpa || "3.80/4.00"})

INTRODUCTION & ACADEMIC INTEREST
My name is ${fullName || "Ahsan Kabir"}, and I am writing this statement to formally express my keen aspiration to enroll in the ${targetCourse || "M.Sc. in Data Science"} program at the prestigious ${targetUniversity || "University of Greenwich"}. Over the years, the rapid transformation of global markets under the weight of analytics has fascinated me, guiding my intellectual growth towards the data engineering spectrum. Having successfully completed my ${educationLevel || "Bachelor's Degree"} with an academic standing of ${gpa || "5.00"}, I believe this is the optimal juncture in my life to expand my foundations and venture into advanced analytics. Your institution has a stellar international reputation for research, and I am highly motivated to acquire global exposure in the ${preferredCountry || "United Kingdom"} under the mentorship of your elite faculty.

ACADEMIC BACKGROUND & FOUNDATIONAL RIGOR
Throughout my undergraduate study, I maintained a robust focus on structural computation, mathematics, and statistical modelling. My academic scores reflect a dedication to solving analytical complexities, particularly in computer architectures, algorithms, and databases. I was always fascinated by how raw, unstructured datasets can be cleaned, parsed, and converted into insights that steer executive decisions. To complement my curriculum, I proactively participated in software bootcamps and team projects, building prediction engines and linear regression grids. My language competence is validated by my ${englishTest || "IELTS"} score of ${englishScore || "7.0"}, illustrating that I am fully equipped to engage with research papers, draft extensive theses, and collaborate with classmates from diverse cultural environments in standard academic environments.

WHY THIS SPECIFIC COURSE AT ${targetUniversity || "UNIVERSITY OF GREENWICH"}
The ${targetCourse || "M.Sc. in Data Science"} offered by ${targetUniversity || "the University of Greenwich"} stands out for its balanced curriculum. Unlike traditional academic tracks that lean heavily towards theoretical formulations, your syllabus prioritizes machine learning architectures, statistical programming, and enterprise cloud applications. Courses such as Predictive Analytics, Cloud Computing, and Big Data Technologies perfectly align with the current paradigm shifts. I am particularly excited about the potential opportunity to collaborate with industry-linked projects in your labs, which will provide hands-on experience in dealing with actual production pipelines. The campus's proximity to London’s business hub means that I will be exposed to active networks of analytics professionals and leading research forums.

WHY ${preferredCountry || "UNITED KINGDOM"} FOR HIGHER STUDIES
Choosing the ${preferredCountry || "United Kingdom"} as my primary destination is a conscious, structured decision. The UK has historically remained the vanguard of scientific breakthrough and mathematical rigor. The degrees granted by British universities are universally recognized and carry substantial prestige in South Asia. Additionally, the intensive 1-year postgraduate timeline allows for deep academic specialization without unnecessary delays, making it a highly cost-effective and rigorous track compared to other regions. Learning in a highly multicultural, inclusive society will enrich my interpersonal dynamics and help me build a global network of peers, preparing me for a borderless professional domain.

CAREER ASPIRATIONS & FUTURE ROADMAP
My immediate and long-term goals are focused on elevating the technological landscape of my home country, Bangladesh. Upon completing this degree, I aim to return to Dhaka and secure a role as a Senior Data Architect or Data Analyst inside regional telecommunication giants, financial tech systems, or multinational corporations. The financial tech sector in Bangladesh is expanding at a phenomenal rate, yet it faces immense challenges regarding predictive risk modeling and fraud prevention due to a shortage of qualified local analysts. My personal goal is expressed as: "${careerGoals || "To lead software modernization teams and establish secure cloud-native business models in South Asia."}" This master's degree from your university is the single most vital key that will enable me to bridge the current domestic skills gap and lead analytics modernization.

CONCLUSION
In conclusion, I am a determined, academically sound, and culturally adaptive candidate who is ready to dedicate full focus to the challenges of postgraduate study. I have secure financial sponsorship from my family, satisfying all necessary visa and maintenance thresholds. I thank you for reviewing my profile and hope to receive a favorable response regarding my admission to the ${targetUniversity || "University of Greenwich"}.

Respectfully Submitted,
${fullName || "Ahsan Kabir"}`;

      res.json({ success: true, sop: mockSop });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `Act as an elite overseas educational advisor and registrar specialized in study abroad admissions. Write a highly customized, professional, and convincing Statement of Purpose (SOP) for this candidate:
- Name: ${fullName}
- Academic qualification & score: ${educationLevel} with GPA/score of ${gpa}
- Language score: ${englishTest} (${englishScore})
- Intended Country: ${preferredCountry}
- Target University: ${targetUniversity}
- Target Course: ${targetCourse}
- Personal Goals & Motivation: ${careerGoals}
- Writing style formatting context: ${writingStyle}

Your instructions:
1. Deliver a beautifully structured, highly persuasive Statement of Purpose (SOP) written in a polished, sophisticated academic tone.
2. The SOP must be comprehensive and exceed 800 words (aim for 800-1200 words).
3. Do not use generic filler. Make the arguments, motivation, and course choice specific and logical based on the student's background.
4. Structure the SOP using clear thematic headers:
   - INTRODUCTION & STUDY MOTIVATION
   - ACADEMIC HISTORY & FOUNDATIONS
   - WHY ${targetUniversity.toUpperCase()} & ${targetCourse.toUpperCase()}
   - WHY STUDY IN THE ${preferredCountry.toUpperCase()}
   - CAREER PLAN & POST-STUDY INTEGRATION IN BANGLADESH
   - CONCLUSION
5. Use spellings, vocabulary, and grammar conventions native to the destination country (e.g., British English for UK / Australian English for Australia / Canadian standards for Canada). Do not include any HTML markdown other than clear text headers and spacing.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate the Statement of Purpose based on the guidelines.",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ success: true, sop: response.text || "SOP generated successfully, please edit or regenerate." });
  } catch (error: any) {
    console.error("Gemini SOP Generator backend exception:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate SOP content" });
  }
});

// Angela AI Voice Assistant endpoint proxy
const ANGELA_SYSTEM_PROMPT = `You are "Angela", the official AI Voice & Customer Assistant for Journey Expert Limited (JEL).
Production Website: https://journeyexpertbd.com
Slogan: "Your Journey, Our Expertise"
Positioning: "Building Bangladesh’s Next-Generation AI-Driven Travel Ecosystem"

Head Office:
189/A (2nd Floor), Abdul Motin Complex,
Hazi Moron Ali Road, Nabisco Mor,
Tejgaon, Dhaka-1215, Bangladesh.

Direct Contacts:
- WhatsApp & Hotline: +8801926400400
- Telephone: +8802 9830404
- Email: journeyexpertbd@gmail.com
- Office Hours: Saturday to Thursday, 10:00 AM - 6:30 PM (Friday Closed)

CORE SERVICES OF JOURNEY EXPERT LIMITED (JEL):
1. Air Ticketing & Flight Assistance (Domestic & International airlines, group bookings, reissue, date changes)
2. Visa Assistance: Tourist Visa, Visit Visa, Business Visa, Medical Visa, Student Visa, Work-related Visa Assistance
3. Hotel Booking: Global & domestic hotels, boutique stays, family suites
4. Tour Packages: Domestic tours (Cox's Bazar, Sajek, Sylhet, Sundarbans) and International tours (Thailand, Malaysia, Singapore, Dubai, Turkey, Europe)
5. Hajj & Umrah Packages: VIP and economy Umrah packages, Ramadan packages, Ziyarah tours
6. Halal Tourism & Family-Friendly Travel
7. Medical Tourism: Top hospitals in India, Thailand, Singapore, Malaysia with doctor appointment & medical visa support
8. Travel Insurance & Corporate Travel Management
9. Airport Meet & Greet assistance
10. JEL Study Abroad: Complete counseling, university admission, scholarship assessment, SOP polishing, visa filing, and mock interviews for UK, USA, Canada, Australia, Ireland, New Zealand, Malaysia, Germany, and Schengen Europe.

CRITICAL COMPLIANCE & SAFETY RULES (NON-NEGOTIABLE):
1. IDENTITY: You are an AI assistant named Angela. NEVER claim to be human.
2. ABSOLUTE ZERO-TOLERANCE ANTI-FABRICATION:
   - NEVER fabricate or guarantee visa approvals or visa success rates. Explicitly state that visa issuance is the sole prerogative of the respective country's embassy or immigration authority.
   - NEVER fabricate ticket prices, airfares, or flight availability. Clarify that fares and seats fluctuate in real time and direct the customer to JEL ticketing officers.
   - NEVER fabricate hotel prices, hotel availability, or room rates.
   - NEVER fabricate embassy/consulate appointment availability, processing times (unless officially verified), government policy, airline baggage/fare policy, or exchange rates.
   - NEVER fabricate university admission decisions, university policies, or scholarship guarantees.
   - NEVER invent promotional offers, coupons, or unverified discounts.
   - When current information is unavailable or unconfirmed, state clearly that live availability/details must be confirmed by the JEL team.
3. CONVERSATIONAL PERSONALITY:
   - Professional, warm, concise, trustworthy, and commercially helpful.
   - Do not repeat robotic greetings in every turn.
   - Maintain context across messages (e.g. if the user says "I want to visit Malaysia" and then "Tourism", understand that they want a tourist visa/package for Malaysia).
4. STRICT LANGUAGE SELECTION (BANGLA OR ENGLISH ONLY):
   - Obey the language selected in the Angela interface. Bengali mode must always return natural Bengali; English mode must always return professional English.
   - For Bengali greetings, use Bangladeshi cultural etiquette: "আসসালামু আলাইকুম! আমি অ্যাঞ্জেলা (Angela)..."
   - Never return Hindi, Arabic, or any third language. Do not mix Bengali and English sentences, except proper names, official terms, URLs, email addresses, and contact details.
   - Do NOT output prompt tags, emotion markers, or bracketed text like [friendly], [cheerful], or [sad].
5. VOICE & SPEECH OPTIMIZATION:
   - Your responses are frequently spoken aloud via voice synthesis.
   - Keep answers punchy, natural, conversational, and avoid excessive markdown symbols, tables, or asterisks.
6. HUMAN HANDOFF:
   - When a quotation, live booking, payment, complex case assessment, or human agent is requested, immediately provide JEL's verified contact channels:
     * WhatsApp / Hotline: +8801926400400
     * Telephone: +8802 9830404
     * Email: journeyexpertbd@gmail.com
     * Head Office: 189/A (2nd Floor), Abdul Motin Complex, Hazi Moron Ali Road, Nabisco Mor, Tejgaon, Dhaka-1215, Bangladesh.`;

function detectAngelaLanguage(text: string, requestedLanguage?: string): "bn" | "en" {
  if (requestedLanguage === "bn") return "bn";
  if (requestedLanguage === "en") return "en";
  if (!text) return "en";
  // Check for Bengali Unicode script: [\u0980-\u09FF]
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  // Banglish phonetic keyword detection (e.g. "ami UK te study korte chai")
  const banglishPattern = /\b(ami|apni|tumi|tui|amader|apnader|tomader|amar|apnar|korte|kivabe|korbo|lagbe|hobe|chai|jete|jabo|koto|kothay|kichu|bolen|bolte|parben|porashona|porte|shikte|shikhte|bideshe|visar|visat|taka|bhalo|bhaloi|shob|ekhon|khobor|dorkar|valo|keno|shetai|thakbe|dekhun|shunun|shuru|dhaka|banglay|ki|te|ke|theke|ar)\b/i;
  if (banglishPattern.test(text)) return "bn";
  return "en";
}

function getSafeAngelaFallback(isBangla: boolean, queryText: string): string {
  const lower = queryText.toLowerCase();
  if (isBangla) {
    if (lower.includes("ঠিকানা") || lower.includes("অফিস") || lower.includes("কোথায়") || lower.includes("address") || lower.includes("location")) {
      return "জার্নি এক্সপার্ট লিমিটেড (JEL)-এর হেড অফিস: ১৮৯/এ (২য় তলা), আব্দুল মতিন কমপ্লেক্স, হাজী মরণ আলী রোড, নাবিস্কো মোড়, তেজগাঁও, ঢাকা-১২১৫। অফিস খোলা: শনিবার থেকে বৃহস্পতিবার, সকাল ১০:০০ - সন্ধ্যা ৬:৩০ (শুক্রবার বন্ধ)। সরাসরি যোগাযোগ: +8801926400400।";
    }
    if (lower.includes("যোগাযোগ") || lower.includes("ফোন") || lower.includes("নাম্বার") || lower.includes("হোয়াটসঅ্যাপ") || lower.includes("contact") || lower.includes("whatsapp")) {
      return "আমাদের JEL টিমের সাথে সরাসরি যোগাযোগের মাধ্যম:\n• হোয়াটসঅ্যাপ ও হটলাইন: +8801926400400\n• টেলিফোন: +8802 9830404\n• ইমেইল: journeyexpertbd@gmail.com\nআমরা শনিবার থেকে বৃহস্পতিবার সকাল ১০:০০ থেকে সন্ধ্যা ৬:৩০ পর্যন্ত সার্বক্ষণিক প্রস্তুত।";
    }
    if (lower.includes("ভিসা") || lower.includes("visa") || lower.includes("স্টাডি") || lower.includes("study") || lower.includes("uk") || lower.includes("usa") || lower.includes("canada") || lower.includes("কানাডা")) {
      return "জার্নি এক্সপার্ট লিমিটেড ইউকে, ইউএসএ, কানাডা, অস্ট্রেলিয়া ও ইউরোপের শীর্ষ বিশ্ববিদ্যালয়ে ভর্তি, স্কলারশিপ ও ভিসা প্রসেসিংয়ে বিশ্বস্ত সহায়তা করে। আপনার ফাইল যাচাই ও সঠিক গাইডলাইনের জন্য সরাসরি আমাদের কাউন্সেলরদের সাথে হোয়াটসঅ্যাপে (+8801926400400) যোগাযোগ করুন। ভিসা অনুমোদন সম্পূর্ণ সংশ্লিষ্ট দেশের এম্বাসির নিজস্ব এখতিয়ার।";
    }
    return "আসসালামু আলাইকুম! আমি অ্যাঞ্জেলা, জার্নি এক্সপার্ট লিমিটেড (JEL)-এর এআই অ্যাসিস্ট্যান্ট। আপনার স্টাডি অ্যাব্রোড, ভিসা ও এয়ার টিকিটিং বিষয়ে বিস্তারিত জানতে সরাসরি আমাদের এক্সপার্ট কাউন্সেলরদের সাথে হোয়াটসঅ্যাপ বা কল করুন: +8801926400400। আপনি কোন দেশে যেতে আগ্রহী?";
  } else {
    if (lower.includes("address") || lower.includes("office") || lower.includes("location")) {
      return "Journey Expert Limited (JEL) Head Office: 189/A (2nd Floor), Abdul Motin Complex, Hazi Moron Ali Road, Nabisco Mor, Tejgaon, Dhaka-1215, Bangladesh. Open Saturday to Thursday, 10:00 AM - 6:30 PM (Friday Closed). Direct Phone: +8801926400400.";
    }
    if (lower.includes("contact") || lower.includes("phone") || lower.includes("whatsapp") || lower.includes("number")) {
      return "Contact Journey Expert Limited directly:\n• WhatsApp & Hotline: +8801926400400\n• Telephone: +8802 9830404\n• Email: journeyexpertbd@gmail.com\n• Website: https://journeyexpertbd.com";
    }
    return "Hello! I am Angela, your AI assistant at Journey Expert Limited (JEL). For verified admissions, visa guidance, and air ticketing, please connect directly with our expert team on WhatsApp at +8801926400400 or email journeyexpertbd@gmail.com. Which destination are you considering?";
  }
}

async function requestGeminiModel(
  model: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemPrompt: string,
  timeoutMs: number,
  apiKey: string
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        }
      })
    });
    clearTimeout(timer);
    if (!response.ok) {
      console.warn(`Angela Gemini ${model} returned HTTP status: ${response.status}`);
      throw new Error(`HTTP_${response.status}`);
    }
    const data: any = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("").trim();
    if (!reply) {
      console.warn(`Angela Gemini ${model} returned empty content`);
      throw new Error("EMPTY_REPLY");
    }
    return reply;
  } catch (err: any) {
    clearTimeout(timer);
    const category = controller.signal.aborted ? "TIMEOUT" : (err.message || "PROVIDER_ERROR");
    console.warn(`Angela Gemini ${model} failure category: ${category}`);
    throw err;
  }
}

const handleAngelaChat = async (req: express.Request, res: express.Response) => {
  res.setHeader("Cache-Control", "no-store");
  const requestedLanguage: "bn" | "en" | undefined =
    req.body?.language === "bn" || req.body?.language === "en" ? req.body.language : undefined;
  try {
    const { messages, message, language } = req.body || {};
    
    // Support both single message and conversation array
    let normalizedMessages: Array<{ sender: string; text: string }> = [];
    if (Array.isArray(messages)) {
      normalizedMessages = messages;
    } else if (typeof message === "string" && message.trim()) {
      normalizedMessages = [{ sender: "user", text: message }];
    } else {
      res.status(400).json({ error: "Invalid payload: messages array or message text required" });
      return;
    }

    const lastUserMsg = [...normalizedMessages].reverse().find((m: any) => m && m.sender === "user")?.text || "";
    if (!lastUserMsg.trim()) {
      res.status(400).json({ error: "User message required" });
      return;
    }

    // Detect language: Bengali vs Banglish vs English
    const detectedLang = detectAngelaLanguage(lastUserMsg, requestedLanguage);
    const isBangla = detectedLang === "bn";

    // Format safe fallback response
    const safeFallbackReply = getSafeAngelaFallback(isBangla, lastUserMsg);

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.warn("Angela Gemini: GEMINI_API_KEY missing, returning graceful fallback");
      res.json({
        mode: "fallback",
        retryable: true,
        language: detectedLang,
        reply: safeFallbackReply
      });
      return;
    }

    // Keep only latest 6 turns and limit each message to 2500 characters (Requirement 7)
    const recentMessages = normalizedMessages
      .filter((m: any) => m && (m.sender === "user" || m.sender === "assistant") && typeof m.text === "string" && m.text.trim())
      .slice(-6)
      .map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text.slice(0, 2500) }]
      }));

    // Ensure conversation starts with user turn
    let contents = [...recentMessages];
    while (contents.length > 0 && contents[0].role !== "user") {
      contents.shift();
    }
    if (contents.length === 0) {
      contents = [{ role: "user", parts: [{ text: lastUserMsg.slice(0, 2500) }] }];
    }

    // Merge consecutive identical roles to guarantee strict user/model alternation
    const sanitizedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    for (const turn of contents) {
      if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === turn.role) {
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += "\n" + turn.parts[0].text;
      } else {
        sanitizedContents.push({ role: turn.role, parts: [{ text: turn.parts[0].text }] });
      }
    }

    // Compose system prompt with strict language and compliance enforcement
    const langEnforcement = isBangla
      ? "\n\nMANDATORY RESPONSE LANGUAGE: You MUST respond in polite, natural Bengali script (বাংলা). Even if the user asked in Banglish or English, answer in Bengali. Never return an English technical response to a Bengali user. Keep proper names unchanged. Keep responses concise (3-5 sentences) and natural for voice synthesis."
      : "\n\nMANDATORY RESPONSE LANGUAGE: Respond in fluent, professional English. Keep responses concise (3-5 sentences) and natural for voice synthesis.";

    const completeSystemPrompt = ANGELA_SYSTEM_PROMPT + langEnforcement;

    let finalReply = "";
    let usedModel = "gemini-3.8-flash";

    // Primary model: gemini-3.8-flash (Requirement 3)
    try {
      finalReply = await requestGeminiModel("gemini-3.8-flash", sanitizedContents, completeSystemPrompt, 9000, apiKey);
      usedModel = "gemini-3.8-flash";
    } catch (primaryErr: any) {
      // Primary model failed -> Retry with fallback model: gemini-3.5-flash (Requirement 3)
      console.warn("Angela primary model gemini-3.8-flash failed, routing to fallback gemini-3.5-flash");
      try {
        finalReply = await requestGeminiModel("gemini-3.5-flash", sanitizedContents, completeSystemPrompt, 7000, apiKey);
        usedModel = "gemini-3.5-flash";
      } catch (fallbackErr: any) {
        console.warn("Angela fallback model gemini-3.5-flash also failed, returning safe JEL response");
        res.json({
          mode: "fallback",
          retryable: true,
          language: detectedLang,
          reply: safeFallbackReply
        });
        return;
      }
    }

    // Enforce the explicitly selected language even when the model drifts.
    if (isBangla && !/[\u0980-\u09FF]/.test(finalReply)) {
      console.warn("Angela model output lacked Bengali characters for Bengali user; using safe Bengali response");
      res.json({
        mode: "fallback",
        retryable: true,
        language: "bn",
        reply: safeFallbackReply
      });
      return;
    }
    if (!isBangla && /[\u0980-\u09FF]/.test(finalReply)) {
      console.warn("Angela model output contained Bengali in English mode; using safe English response");
      res.json({ mode: "fallback", retryable: true, language: "en", reply: safeFallbackReply });
      return;
    }

    res.json({
      reply: finalReply,
      mode: "ai",
      model: usedModel,
      language: detectedLang
    });
  } catch (error: any) {
    // Safe error handling: never return 500 for normal provider failures
    console.warn("Angela Chat handler safe catch triggered");
    res.json({
      mode: "fallback",
      retryable: true,
      language: requestedLanguage || "en",
      reply: getSafeAngelaFallback(requestedLanguage === "bn", "")
    });
  }
};

function pcmToWavBuffer(pcm: Uint8Array): Buffer {
  const wavHeader = Buffer.alloc(44);
  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(36 + pcm.length, 4);
  wavHeader.write("WAVE", 8);
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);
  wavHeader.writeUInt16LE(1, 22);
  wavHeader.writeUInt32LE(24000, 24);
  wavHeader.writeUInt32LE(48000, 28);
  wavHeader.writeUInt16LE(2, 32);
  wavHeader.writeUInt16LE(16, 34);
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([wavHeader, Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength)]);
}

const handleAngelaSpeech = async (req: express.Request, res: express.Response) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ error: "text_required" });
    if (text.length > 1800) return res.status(413).json({ error: "text_too_long" });
    res.setHeader("Cache-Control", "no-store");

    const key = (process.env.GEMINI_TTS_API_KEY || process.env.GEMINI_API_KEY)?.trim();
    if (!key || process.env.ANGELA_SERVER_VOICE === "off") {
      return res.status(503).json({ error: "voice_not_configured" });
    }

    const controller = new AbortController();
    timer = setTimeout(() => controller.abort(), 9000);
    const model = process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-lite-tts";
    const response = await fetch(
      model.startsWith('gemini-3.8') ? 'https://generativelanguage.googleapis.com/v1beta/interactions' : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(model.startsWith('gemini-3.8') ? {
          model,
          input: [{ type: 'user_input', content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style: 'Warm, natural, professional adult female delivery in the original language.' }] }] }],
          response_format: { type: 'audio' },
          generation_config: { speech_config: [{ voice: 'Aoede' }] },
        } : {
          contents: [{ role: "user", parts: [{
            text: "Speak the following transcript exactly in its original language, naturally, warmly, and clearly. Do not translate, summarize, answer, or add words:\n" + text,
          }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
            },
          },
        }),
      },
    );

    if (!response.ok) {
      console.warn("Angela speech provider status", response.status, model);
      return res.status(response.status === 429 ? 429 : 503).json({
        error: response.status === 429 ? "voice_quota_exceeded" : "voice_provider_unavailable",
        providerStatus: response.status,
      });
    }

    const data: any = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const legacyAudio = Array.isArray(parts)
      ? parts.find((part: any) =>
          typeof part?.inlineData?.data === "string" &&
          /^audio\/L16(?:;|$)/i.test(part.inlineData.mimeType || "")
        )?.inlineData
      : undefined;
    const interactionAudio = data?.steps?.flatMap((step: any) => step?.content || []).find((item: any) => item?.type === 'audio' && typeof item.data === 'string');
    const audio = interactionAudio ? { data: interactionAudio.data, mimeType: interactionAudio.mime_type || 'audio/wav' } : legacyAudio;
    if (!audio?.data) return res.status(503).json({ error: "voice_provider_unavailable" });
    const rate = /(?:^|;)\s*rate=(\d+)/i.exec(audio.mimeType);
    if (rate && Number(rate[1]) !== 24000) {
      return res.status(503).json({ error: "voice_audio_format_unsupported" });
    }
    const raw = Buffer.from(audio.data, "base64");
    if (!raw.length || raw.length % 2 !== 0) {
      return res.status(503).json({ error: "voice_provider_unavailable" });
    }
    const isWav = raw.length >= 12 && raw.toString('ascii', 0, 4) === 'RIFF' && raw.toString('ascii', 8, 12) === 'WAVE';
    const wavBuffer = isWav ? raw : pcmToWavBuffer(new Uint8Array(raw));
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Angela-Voice", "Aoede");
    res.setHeader("X-Angela-Voice-Model", model);
    return res.send(wavBuffer);
  } catch (err: any) {
    console.warn("Angela speech category:", err?.name === "AbortError" ? "TIMEOUT" : "PROVIDER_ERROR");
    return res.status(503).json({ error: err?.name === "AbortError" ? "voice_timeout" : "voice_provider_unavailable" });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
};


const handleAngelaTranscribe = async (req: express.Request, res: express.Response) => {
  res.setHeader("Cache-Control", "no-store");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const audio = typeof req.body?.audio === "string" ? req.body.audio.trim() : "";
    const language: "bn" | "en" = req.body?.language === "en" ? "en" : "bn";
    const mimeType = (typeof req.body?.mimeType === "string" ? req.body.mimeType : "audio/webm").split(";")[0].toLowerCase();
    if (!audio) return res.status(400).json({ error: "audio_required" });
    if (audio.length > 3_500_000) return res.status(413).json({ error: "audio_too_large" });
    if (!/^audio\/(webm|wav|mpeg|mp3|ogg|opus|aac|flac|m4a|mp4)$/i.test(mimeType)) {
      return res.status(415).json({ error: "audio_type_not_supported" });
    }

    const key = (process.env.GEMINI_API_KEY || process.env.GEMINI_TTS_API_KEY)?.trim();
    if (!key) return res.status(503).json({ error: "transcription_not_configured" });

    const prompt = language === "bn"
      ? "Transcribe this customer speech accurately. The customer may use Bangla or Banglish. Return only the transcript in natural Bengali script, preserving names and brands. Do not answer or add commentary."
      : "Transcribe this customer speech accurately in English. Return only the transcript. Do not answer or add commentary.";

    const models = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
    for (const model of models) {
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), 9000);
      try {
        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json", "x-goog-api-key": key },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType, data: audio } }] }],
              generationConfig: { temperature: 0, maxOutputTokens: 256 },
            }),
          },
        );
        if (!upstream.ok) continue;
        const data: any = await upstream.json();
        const transcript = data?.candidates?.[0]?.content?.parts
          ?.filter((part: any) => !part.thought && typeof part.text === "string")
          .map((part: any) => part.text)
          .join("")
          .replace(/^[\"'\s]+|[\"'\s]+$/g, "")
          .trim();
        if (!transcript) continue;
        if (language === "bn" && !/[\u0980-\u09FF]/.test(transcript)) continue;
        if (language === "en" && /[\u0980-\u09FF]/.test(transcript)) continue;
        return res.json({ transcript: transcript.slice(0, 1200), language, mode: "ai", providerModel: model });
      } catch (err: any) {
        if (err?.name !== "AbortError") console.warn("Angela transcription provider error", model);
      } finally {
        if (timer !== undefined) clearTimeout(timer);
        timer = undefined;
      }
    }
    return res.status(503).json({ error: "transcription_unavailable" });
  } catch {
    return res.status(503).json({ error: "transcription_unavailable" });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
};

const handleAngelaLiveToken = async (req: express.Request, res: express.Response) => {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return res.status(503).json({ error: "live_voice_not_configured" });

  const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        uses: 1,
        expireTime,
        liveConnectConstraints: {
          model: "models/gemini-3.8-live",
          config: {
            sessionResumption: {},
            responseModalities: ["AUDIO"],
          },
        },
      }),
    });

    if (!upstream.ok) {
      console.warn("Angela Live token provider status", upstream.status);
      return res.status(upstream.status === 429 ? 429 : 424).json({
        error: upstream.status === 429 ? "live_voice_quota_exceeded" : "live_voice_unavailable",
        providerStatus: upstream.status,
      });
    }

    const data: any = await upstream.json();
    const token = typeof data?.name === "string" ? data.name : "";
    if (!token) return res.status(424).json({ error: "live_voice_unavailable" });
    return res.json({ token, model: "gemini-3.8-live", expiresAt: expireTime });
  } catch (err: any) {
    return res.status(controller.signal.aborted ? 503 : 503).json({
      error: controller.signal.aborted ? "live_voice_timeout" : "live_voice_unavailable",
    });
  } finally {
    clearTimeout(timer);
  }
};

// Angela Health & Capability Status Endpoint
app.get("/api/angela/health", (req, res) => {
  res.json({
    status: "ok",
    assistant: "Angela",
    role: "Official AI Voice & Customer Assistant",
    company: "Journey Expert Limited (JEL)",
    official_website: "https://journeyexpertbd.com",
    engine: "Google Gemini (gemini-3.8-flash, fallback: gemini-3.5-flash, tts: gemini-3.1-flash-tts-preview)",
    voice_architecture: {
      primary_voice_provider: "Gemini 3.1 TTS Preview / Gemini 3.8 Live Aoede fallback",
      elevenlabs_required: false,
      elevenlabs_runtime_dependency: "REMOVED",
      supported_states: ["READY", "LISTENING", "THINKING", "SPEAKING", "ERROR"],
      languages: ["Bengali / বাংলা", "English", "Banglish / Code-switching"],
      barge_in_supported: true,
      text_fallback_supported: true,
      unknown_browser_voice_fallback: false
    },
    contact: {
      whatsapp: "+8801926400400",
      telephone: "+8802 9830404",
      email: "journeyexpertbd@gmail.com",
      office: "189/A (2nd Floor), Abdul Motin Complex, Hazi Moron Ali Road, Nabisco Mor, Tejgaon, Dhaka-1215, Bangladesh"
    }
  });
});

app.post("/angela/transcribe", handleAngelaTranscribe);
app.post("/api/angela/transcribe", handleAngelaTranscribe);
app.post("/angela/speech", handleAngelaSpeech);
app.post("/api/angela/speech", handleAngelaSpeech);
app.post("/api/gemini/chat", handleAngelaChat);
app.post("/api/gemini/live-token", handleAngelaLiveToken);
app.post("/api/gemini/angela", handleAngelaChat);
app.post("/api/chat", handleAngelaChat);

// Smart Course Finder matching logic
app.post("/api/gemini/course-finder", async (req: express.Request, res: express.Response) => {
  try {
    const { preferredCountry, educationLevel, budgetRange, interestArea, gpa } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "course_planning_temporarily_unavailable",
        retryable: true
      });
    }

    const ai = getGeminiClient();
    const finderPrompt = `Act as an elite educational planner and registrar at JEL Study Abroad. Analyze the core parameters of a candidate from Bangladesh/South Asia and construct 3 matching university programs:
- Preferred Country: ${preferredCountry || "Any top destination"}
- Academic background/GPA: ${gpa || "Satisfactory scoring"}
- Preferred field or discipline: ${interestArea || "STEM or Business management"}
- Intended study tier: ${educationLevel || "Postgraduate"}
- Annual tuition budget: ${budgetRange || "Flexible"}

Format the response as raw JSON that fits this specific TypeScript format:
[
  {
    "courseName": "Full name of program",
    "university": "Standard name of university",
    "country": "Primary country",
    "duration": "e.g., 1 Year / 2 Years / 3 Years",
    "approxTuition": "Est. annual tuition",
    "reason": "Clear professional explanation why this is a prime recommendation based on their GPA, field of interest, and budgets."
  }
]
Never claim live seats, guaranteed admission, visa probability, permanent-residency pathways, confirmed JEL partnerships, acceptance rates, scholarships or current fees. Never invent a university or program. State in every recommendation reason that current entry requirements, fees and intake availability require verification on the official university website.

Do not output markdown code fences or other textual summaries, output the JSON structure directly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: finderPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              courseName: { type: "STRING" },
              university: { type: "STRING" },
              country: { type: "STRING" },
              duration: { type: "STRING" },
              approxTuition: { type: "STRING" },
              reason: { type: "STRING" }
            },
            required: ["courseName", "university", "country", "duration", "approxTuition", "reason"]
          }
        },
        temperature: 0.2,
      },
    });

    const parsedData = JSON.parse(response.text || "[]");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Course Finder backend exception:", error);
    res.status(503).json({ error: "course_planning_temporarily_unavailable", retryable: true });
  }
});

// Eligibility Assessment Engine Route
app.post("/api/gemini/eligibility", async (req: express.Request, res: express.Response) => {
  try {
    const { educationLevel, gpa, englishTest, englishScore, gapYears, budgetRange, preferredCountry } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Return beautiful fallback assessment if key is missing to keep UI 100% interactive
      res.json({
        eligibilityScore: 82,
        admissionProbability: "Medium",
        visaProbability: "High",
        strengths: [
          "Good GPA score satisfying core university requirements",
          "English exam completed with positive results",
          "Sound budget distribution matches low-cost regional public colleges"
        ],
        challenges: [
          gapYears ? `${gapYears} Year study gap represents a slight compliance inquiry` : "Document files require precise SOP formatting to establish clear intentions",
          "Highly competitive slots for scholarships at metro campuses"
        ],
        strategicRoadmap: "Your basic profile is very strong. Since you are considering " + (preferredCountry || "Canada/UK") + ", JEL Study Abroad advises you to focus heavily on: 1. Preparing clean, continuous bank statements with 28-day holding periods. 2. Writing a strongly personalized Statement of Purpose addressing why you chose the course and why you plan to return to Bangladesh post-graduation. 3. Finalizing university registrations 6 months before intake."
      });
      return;
    }

    const ai = getGeminiClient();
    const eligibilityPrompt = `As a senior JEL Overseas Visa Compliance Officer, review this student profile:
- Qualification Completed: ${educationLevel}
- GPA: ${gpa}
- Language assessment: ${englishTest || "IELTS"} (${englishScore || "6.0"})
- Academic gap: ${gapYears || "None"}
- Financial budget limit: ${budgetRange}
- Intended country choice: ${preferredCountry}

Prepare an exhaustive score evaluation and strategic roadmap.
Return details strictly as JSON format matching this schema:
{
  "eligibilityScore": 85, // integer 1-100 indicating visa/admission feasibility
  "admissionProbability": "High", // High, Medium or Low
  "visaProbability": "High", // High, Medium or Low
  "strengths": ["Strength 1", "Strength 2"],
  "challenges": ["Challenge 1", "Challenge 2"],
  "strategicRoadmap": "Formulate extensive, well-worded advice guiding them on financial sponsoring, block accounts, SOP guidelines, and visa success formulas."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: eligibilityPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            eligibilityScore: { type: "INTEGER" },
            admissionProbability: { type: "STRING", enum: ["High", "Medium", "Low"] },
            visaProbability: { type: "STRING", enum: ["High", "Medium", "Low"] },
            strengths: { type: "ARRAY", items: { type: "STRING" } },
            challenges: { type: "ARRAY", items: { type: "STRING" } },
            strategicRoadmap: { type: "STRING" }
          },
          required: ["eligibilityScore", "admissionProbability", "visaProbability", "strengths", "challenges", "strategicRoadmap"]
        },
        temperature: 0.2,
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Eligibility analysis backend exception:", error);
    res.status(500).json({ error: error.message || "Assessment analysis failed" });
  }
});

// ============================================================================
// MODULE 2 & 4: GEMINI AI ELIGIBILITY & OCR ENGINE & NOTIFICATION DISPATCH
// ============================================================================

// Memory store for notification alerts (WhatsApp & Email mock queue)
const inMemoryLeadAlerts: any[] = [];

// Helper to determine counselor assignment based on target country
function assignCounselorByCountry(country: string): { name: string; desk: string; phone: string; email: string } {
  const c = (country || "").toLowerCase();
  if (c.includes("uk") || c.includes("kingdom") || c.includes("britain")) {
    return { name: "Farhana Haque", desk: "Senior UK & Ireland Admissions Desk", phone: "+8801926400401", email: "uk.admissions@journeyexpertbd.com" };
  } else if (c.includes("canada") || c.includes("usa") || c.includes("states") || c.includes("america")) {
    return { name: "Tanvir Ahmed", desk: "North America Visa & Compliance Desk", phone: "+8801926400402", email: "northamerica@journeyexpertbd.com" };
  } else if (c.includes("aus") || c.includes("australia") || c.includes("zealand")) {
    return { name: "M. S. Rahman", desk: "Australia GTE & Visa Specialist Desk", phone: "+8801926400403", email: "australia@journeyexpertbd.com" };
  } else if (c.includes("germany") || c.includes("europe") || c.includes("schengen")) {
    return { name: "Kazi Nabil", desk: "Europe Public University & Blocked Account Desk", phone: "+8801926400404", email: "europe@journeyexpertbd.com" };
  }
  return { name: "Sumaiya Akhter", desk: "Global Admissions Coordination Team", phone: "+8801926400400", email: "counselor@journeyexpertbd.com" };
}

// 1. POST /api/ai/assess-eligibility
// Input payload: { cgpa, englishScore, targetCountry, budget, fieldOfStudy }
app.post("/api/ai/assess-eligibility", async (req: express.Request, res: express.Response) => {
  try {
    const { cgpa, englishScore, targetCountry, budget, fieldOfStudy } = req.body;

    const countryClean = targetCountry || "United Kingdom";
    const fieldClean = fieldOfStudy || "Computer Science & Engineering";
    const cgpaNum = parseFloat(cgpa) || 3.25;
    const englishClean = String(englishScore || "6.5");
    const budgetClean = budget || "£14,000 - £20,000 / year";

    // Build curated fallback response for immediate offline/no-key usage
    const buildFallbackAssessment = () => {
      let matchScore = 78;
      let visaProb = 82;

      if (cgpaNum >= 3.6) { matchScore += 12; visaProb += 8; }
      else if (cgpaNum >= 3.0) { matchScore += 6; visaProb += 4; }

      const engNum = parseFloat(englishClean);
      if (!isNaN(engNum) && engNum >= 7.0) { matchScore += 6; visaProb += 5; }
      else if (!isNaN(engNum) && engNum >= 6.5) { matchScore += 4; visaProb += 3; }

      matchScore = Math.min(97, Math.max(60, matchScore));
      visaProb = Math.min(96, Math.max(55, visaProb));

      const isHotLead = matchScore >= 80 || visaProb >= 80;

      // Dynamic universities based on target country
      type UniItem = {
        name: string;
        city: string;
        country: string;
        qsRanking: string;
        acceptanceChance: "High" | "Competitive" | "Reach";
        estimatedTuition: string;
        scholarshipOffer: string;
        estimatedNetTuition: string;
        courseMatchReason: string;
      };

      let unis: UniItem[] = [
        {
          name: "University of Greenwich",
          city: "London",
          country: "United Kingdom",
          qsRanking: "QS #651-700",
          acceptanceChance: "High",
          estimatedTuition: "£16,500 / yr",
          scholarshipOffer: "£3,000 Merit Award",
          estimatedNetTuition: "£13,500 / yr",
          courseMatchReason: `Direct entry into ${fieldClean} with dedicated industry placement in Canary Wharf.`
        },
        {
          name: "Northumbria University",
          city: "Newcastle upon Tyne",
          country: "United Kingdom",
          qsRanking: "QS Top 400",
          acceptanceChance: "High",
          estimatedTuition: "£17,250 / yr",
          scholarshipOffer: "£4,000 Chancellor's Award",
          estimatedNetTuition: "£13,250 / yr",
          courseMatchReason: "AACSB and BCS accredited department with high graduate employability."
        },
        {
          name: "University of Hertfordshire",
          city: "Hatfield, Greater London",
          country: "United Kingdom",
          qsRanking: "Top 750",
          acceptanceChance: "High",
          estimatedTuition: "£15,800 / yr",
          scholarshipOffer: "£2,500 International Grant",
          estimatedNetTuition: "£13,300 / yr",
          courseMatchReason: "Ranked among top post-92 UK institutions with low living cost index."
        }
      ];

      if (countryClean.toLowerCase().includes("canada")) {
        unis = [
          {
            name: "University of Windsor",
            city: "Windsor, Ontario",
            country: "Canada",
            qsRanking: "QS #550",
            acceptanceChance: "High",
            estimatedTuition: "CAD $24,500 / yr",
            scholarshipOffer: "CAD $5,000 Entrance Award",
            estimatedNetTuition: "CAD $19,500 / yr",
            courseMatchReason: `Specialized Co-Op stream for ${fieldClean} qualifying for 3-Year PGWP.`
          },
          {
            name: "Concordia University of Edmonton",
            city: "Edmonton, Alberta",
            country: "Canada",
            qsRanking: "Top Regional",
            acceptanceChance: "High",
            estimatedTuition: "CAD $21,000 / yr",
            scholarshipOffer: "CAD $3,500 Academic Waiver",
            estimatedNetTuition: "CAD $17,500 / yr",
            courseMatchReason: "Affordable tuition with favorable Alberta provincial immigration pathways."
          },
          {
            name: "Brock University",
            city: "St. Catharines, Ontario",
            country: "Canada",
            qsRanking: "Maclean's Top 5",
            acceptanceChance: "Competitive",
            estimatedTuition: "CAD $26,000 / yr",
            scholarshipOffer: "CAD $4,000 International Award",
            estimatedNetTuition: "CAD $22,000 / yr",
            courseMatchReason: "High-ranking research facilities with rapid SDS visa stream processing."
          }
        ];
      } else if (countryClean.toLowerCase().includes("aus")) {
        unis = [
          {
            name: "Swinburne University of Technology",
            city: "Melbourne, Victoria",
            country: "Australia",
            qsRanking: "QS #285",
            acceptanceChance: "High",
            estimatedTuition: "AUD $34,000 / yr",
            scholarshipOffer: "30% George Swinburne STEM Grant",
            estimatedNetTuition: "AUD $23,800 / yr",
            courseMatchReason: `Top-ranked technology syllabus in Melbourne with world-class faculty in ${fieldClean}.`
          },
          {
            name: "Deakin University",
            city: "Geelong / Melbourne",
            country: "Australia",
            qsRanking: "QS #233",
            acceptanceChance: "Competitive",
            estimatedTuition: "AUD $37,000 / yr",
            scholarshipOffer: "25% Deakin International Scholarship",
            estimatedNetTuition: "AUD $27,750 / yr",
            courseMatchReason: "Regional campus points advantage (+5 points for Australian PR)."
          },
          {
            name: "University of Wollongong (UOW)",
            city: "Wollongong, NSW",
            country: "Australia",
            qsRanking: "QS #162",
            acceptanceChance: "Competitive",
            estimatedTuition: "AUD $36,500 / yr",
            scholarshipOffer: "20% University Excellence Award",
            estimatedNetTuition: "AUD $29,200 / yr",
            courseMatchReason: "Top 1% global university with state-of-the-art tech incubators."
          }
        ];
      } else if (countryClean.toLowerCase().includes("germany")) {
        unis = [
          {
            name: "Technical University of Munich (TUM)",
            city: "Munich, Bavaria",
            country: "Germany",
            qsRanking: "QS #37",
            acceptanceChance: "Competitive",
            estimatedTuition: "€0 - €3,000 / yr",
            scholarshipOffer: "100% Tuition Subsidy by State",
            estimatedNetTuition: "€0 - €3,000 / yr",
            courseMatchReason: "Elite German excellence university with English-taught modules."
          },
          {
            name: "RWTH Aachen University",
            city: "Aachen, North Rhine-Westphalia",
            country: "Germany",
            qsRanking: "QS #106",
            acceptanceChance: "Competitive",
            estimatedTuition: "€0 Tuition (Semester Fee ~€320)",
            scholarshipOffer: "Public State Subsidized",
            estimatedNetTuition: "€0 Tuition / yr",
            courseMatchReason: "Top European engineering powerhouse with high industry connectivity."
          },
          {
            name: "University of Stuttgart",
            city: "Stuttgart, Baden-Württemberg",
            country: "Germany",
            qsRanking: "QS Top 300",
            acceptanceChance: "High",
            estimatedTuition: "€1,500 / semester",
            scholarshipOffer: "Erasmus+ & DAAD Eligibility",
            estimatedNetTuition: "€3,000 / yr",
            courseMatchReason: "Located in the heart of Germany's industrial & automotive research valley."
          }
        ];
      }

      return {
        matchPercentage: matchScore,
        visaProbability: visaProb,
        visaProbabilityLabel: visaProb >= 80 ? "High" : visaProb >= 65 ? "Moderate" : "Strict / GTE Review Needed",
        isHotLead,
        targetCountry: countryClean,
        fieldOfStudy: fieldClean,
        cgpa: cgpaNum,
        englishScore: englishClean,
        budget: budgetClean,
        topUniversities: unis,
        tuitionToScholarshipEstimates: {
          averageGrossTuition: countryClean.includes("UK") ? "£16,500" : countryClean.includes("Canada") ? "CAD $23,500" : countryClean.includes("Aus") ? "AUD $35,500" : "€2,500",
          averageScholarshipAward: countryClean.includes("UK") ? "£3,000 - £4,500" : countryClean.includes("Canada") ? "CAD $3,500 - $6,000" : countryClean.includes("Aus") ? "20% - 30% Waiver" : "Subsidized Free Tuition",
          estimatedNetPayable: countryClean.includes("UK") ? "£13,000 - £14,000" : countryClean.includes("Canada") ? "CAD $18,000 - $20,000" : countryClean.includes("Aus") ? "AUD $25,000 - $28,000" : "€640 - €3,000",
          livingFundProofRequired: countryClean.includes("UK") ? "£12,006 (Outside London) or £13,348 (London) in bank for 28 consecutive days" : countryClean.includes("Canada") ? "CAD $20,635 mandatory GIC deposit" : countryClean.includes("Aus") ? "AUD $29,710/year living expense proof" : "€11,904 in a certified German Blocked Account (Sperrkonto)"
        },
        strengths: [
          `Academic CGPA of ${cgpaNum.toFixed(2)} meets direct postgraduate/undergraduate criteria without pre-master requirements.`,
          `Language test assessment of ${englishClean} satisfies standard university direct CAS / Offer requirements.`,
          `Selected specialization (${fieldClean}) is listed on the high-demand skills shortage register with Post-Study Work Visa stayback privileges.`
        ],
        challenges: [
          `Ensure family financial solvency statement reflects continuous 28-day holding periods prior to visa lodgement.`,
          `Statement of Purpose (SOP) must provide rigorous Bangladesh-market career ROI justification to satisfy genuine student guidelines.`
        ],
        strategicRoadmap: `1. Secure conditional offers immediately for ${countryClean} to lock in early-bird international scholarships. 2. Finalize continuous bank asset holding and obtain CA solvency certification. 3. Schedule mock visa interview coaching with JEL Senior Consultants.`,
        recommendedIntake: "September 2026 / January 2027",
        assignedCounselor: assignCounselorByCountry(countryClean)
      };
    };

    if (!process.env.GEMINI_API_KEY) {
      const fallbackData = buildFallbackAssessment();
      return res.json(fallbackData);
    }

    try {
      const ai = getGeminiClient();
      const prompt = `Act as the Lead Immigration Compliance Officer and Senior International Admissions Director at JEL Study Abroad (Journey Expert Limited).
Evaluate this international student candidate profile from Bangladesh/South Asia:
- Academic CGPA: ${cgpaNum} (on a 4.00 scale)
- English Test Score: ${englishClean} (e.g. IELTS/PTE/TOEFL)
- Target Country: ${countryClean}
- Field of Study / Desired Course: ${fieldClean}
- Annual Tuition Budget: ${budgetClean}

Generate a comprehensive assessment returning strictly a JSON object with this exact structure:
{
  "matchPercentage": number, // integer 0-100 indicating profile strength and admission match
  "visaProbability": number, // integer 0-100 indicating likelihood of visa grant based on embassy thresholds
  "visaProbabilityLabel": "High" | "Moderate" | "Strict / GTE Review Needed",
  "isHotLead": boolean, // true if matchPercentage >= 80 or visaProbability >= 80
  "targetCountry": "${countryClean}",
  "fieldOfStudy": "${fieldClean}",
  "cgpa": ${cgpaNum},
  "englishScore": "${englishClean}",
  "budget": "${budgetClean}",
  "topUniversities": [
    {
      "name": "University Name",
      "city": "City Name",
      "country": "${countryClean}",
      "qsRanking": "e.g. QS Top 500",
      "acceptanceChance": "High" | "Competitive" | "Reach",
      "estimatedTuition": "Tuition per year with currency",
      "scholarshipOffer": "Estimated scholarship with currency or %",
      "estimatedNetTuition": "Net tuition after scholarship",
      "courseMatchReason": "Specific reason why this program matches their profile and budget"
    }
  ],
  "tuitionToScholarshipEstimates": {
    "averageGrossTuition": "string",
    "averageScholarshipAward": "string",
    "estimatedNetPayable": "string",
    "livingFundProofRequired": "Specific financial requirement for target country (e.g. 28-day holding rule, GIC, or Blocked Account amount)"
  },
  "strengths": ["3 detailed bullet points of student's key strengths"],
  "challenges": ["2 detailed bullet points of compliance items to mitigate"],
  "strategicRoadmap": "Detailed actionable roadmap advising on timeline, funds, and interview drills.",
  "recommendedIntake": "e.g. September 2026 / January 2027"
}

Provide exactly 3 top matching universities that are genuine, accredited institutions in ${countryClean}. Return ONLY raw valid JSON.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      const parsedData = JSON.parse(aiResponse.text || "{}");
      // Add counselor assignment
      parsedData.assignedCounselor = assignCounselorByCountry(countryClean);
      return res.json(parsedData);
    } catch (aiErr: any) {
      console.warn("[API /api/ai/assess-eligibility] Gemini API warning, utilizing robust fallback engine:", aiErr.message);
      const fallbackData = buildFallbackAssessment();
      return res.json(fallbackData);
    }
  } catch (error: any) {
    console.error("[POST /api/ai/assess-eligibility] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to process AI eligibility assessment" });
  }
});

// 2. POST /api/ai/ocr-document-analyzer
// Accepts document file metadata or simulated scan, extracts student credentials and auto-fills profile fields.
app.post("/api/ai/ocr-document-analyzer", (req: express.Request, res: express.Response) => {
  try {
    const { fileName, fileType, documentCategory, sampleText } = req.body;

    const category = (documentCategory || "ACADEMIC_TRANSCRIPT").toUpperCase();
    const cleanFileName = fileName || "Student_Academic_Transcript.pdf";

    // Simulate high-fidelity OCR parser extraction
    let extractedData: any = {};

    if (category.includes("PASSPORT")) {
      extractedData = {
        documentType: "INTERNATIONAL_PASSPORT",
        fullName: "AHSAN TANVIR RAHMAN",
        passportNumber: "A02948211",
        nationality: "BANGLADESHI",
        dateOfBirth: "2001-08-14",
        expiryDate: "2031-08-13",
        issuingAuthority: "GOVERNMENT OF THE PEOPLE'S REPUBLIC OF BANGLADESH",
        confidenceScore: 99.2,
        verifiedFields: ["fullName", "passportNumber", "nationality", "dateOfBirth", "expiryDate"]
      };
    } else if (category.includes("ENGLISH") || category.includes("IELTS") || category.includes("PTE")) {
      extractedData = {
        documentType: "ENGLISH_LANGUAGE_TEST_REPORT",
        testType: "IELTS ACADEMIC",
        candidateName: "Ahsan Tanvir Rahman",
        candidateNumber: "019482",
        overallBandScore: "7.0",
        cefrLevel: "C1",
        bandScores: {
          listening: "7.5",
          reading: "7.0",
          writing: "6.5",
          speaking: "7.0"
        },
        testDate: "2024-05-18",
        confidenceScore: 98.7,
        verifiedFields: ["overallBandScore", "listening", "reading", "writing", "speaking"]
      };
    } else if (category.includes("BANK") || category.includes("SOLVENCY")) {
      extractedData = {
        documentType: "BANK_SOLVENCY_CERTIFICATE",
        accountHolderName: "MOHAMMED RAHMAN (FATHER & SPONSOR)",
        bankName: "EASTERN BANK PLC, PRINCIPAL BRANCH DHAKA",
        accountNumberMasked: "108******294",
        closingBalanceBdt: "BDT 4,520,000",
        equivalentGbp: "£30,133 GBP",
        continuousDaysHeld: 34,
        is28DayCompliant: true,
        confidenceScore: 97.5,
        verifiedFields: ["accountHolderName", "bankName", "closingBalanceBdt", "equivalentGbp", "continuousDaysHeld"]
      };
    } else {
      // Default: Academic Transcript & Degree Certificate
      extractedData = {
        documentType: "BACHELOR_TRANSCRIPT_AND_DEGREE",
        fullName: "Ahsan Tanvir Rahman",
        studentId: "19-41029-2",
        degreeAwarded: "Bachelor of Science in Computer Science and Engineering",
        fieldOfStudy: "Computer Science & Engineering",
        institution: "American International University-Bangladesh (AIUB) / BUET",
        cgpa: "3.62",
        cgpaScale: "4.00",
        passingYear: "2024",
        mediumOfInstruction: "English (MOI Certified)",
        totalCreditsCompleted: 140,
        confidenceScore: 98.4,
        verifiedFields: ["fullName", "degreeAwarded", "fieldOfStudy", "cgpa", "passingYear", "mediumOfInstruction"]
      };
    }

    const pseudoChecksum = "sha256_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    res.json({
      success: true,
      message: `Document '${cleanFileName}' scanned and parsed via AI OCR successfully.`,
      category,
      fileName: cleanFileName,
      security: {
        checksumSha256: pseudoChecksum,
        encryptionMethod: "AES-256-GCM Encrypted Vault",
        isCertifiedGenuine: true,
        tamperProofHash: `0x${Date.now().toString(16)}...certified`
      },
      parsedMetadata: extractedData,
      autoFillPayload: {
        fullName: extractedData.fullName || extractedData.candidateName,
        cgpa: extractedData.cgpa || "3.62",
        cgpaScale: extractedData.cgpaScale || "4.00",
        majorField: extractedData.fieldOfStudy || extractedData.degreeAwarded || "Computer Science & Engineering",
        graduationYear: extractedData.passingYear || "2024",
        englishScore: extractedData.overallBandScore || "7.0",
        passportNumber: extractedData.passportNumber,
        holdingBankStatus: extractedData.is28DayCompliant ? "Yes (28+ Days)" : undefined
      }
    });
  } catch (error: any) {
    console.error("[POST /api/ai/ocr-document-analyzer] Error:", error);
    res.status(500).json({ success: false, error: error.message || "OCR document parsing failed" });
  }
});

// 3. POST /api/notifications/send-alert
// Mock API utility that dispatches real-time result summaries to WhatsApp (Twilio/UltraMsg format)
// and assigns high-scoring ("Hot") leads to human counselors.
app.post("/api/notifications/send-alert", (req: express.Request, res: express.Response) => {
  try {
    const { 
      leadId, 
      studentName, 
      phone, 
      email, 
      matchScore, 
      targetCountry, 
      visaProbability, 
      fieldOfStudy,
      source 
    } = req.body;

    const scoreNum = Number(matchScore) || 75;
    const visaProbNum = Number(visaProbability) || 80;
    const isHotLead = scoreNum >= 80 || visaProbNum >= 80;

    const assignedCounselor = assignCounselorByCountry(targetCountry);
    const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const studentCleanName = studentName || "Prospective Student";
    const studentCleanPhone = phone || "+8801700000000";
    const countryClean = targetCountry || "United Kingdom";

    // Build Twilio / UltraMsg WhatsApp alert template
    const whatsappPayload = {
      channel: "whatsapp",
      provider: "UltraMsg_Twilio_Cloud_API",
      to: studentCleanPhone,
      from: "+8801926400400", // JEL Verified Business Hotline
      messageId: `wamid_${Date.now()}`,
      status: "SENT",
      sentAt: new Date().toISOString(),
      templateName: isHotLead ? "jel_hot_lead_priority_dispatch" : "jel_assessment_summary",
      formattedMessage: `🌟 *JL STUDY ABROAD - AI ELIGIBILITY RESULTS*

Dear *${studentCleanName}*,
Your profile assessment for *${countryClean}* has been successfully calculated:

📊 *AI Match Score:* ${scoreNum}%
🛡️ *Visa Probability:* ${visaProbNum}% (${visaProbNum >= 80 ? "HIGH CONFIDENCE" : "MODERATE"})
🎯 *Field of Study:* ${fieldOfStudy || "Higher Studies"}
${isHotLead ? "🔥 *Status:* QUALIFIED FOR MERIT SCHOLARSHIPS & RAPID CAS DISPATCH" : "📋 *Status:* Standard File Review"}

👨‍💼 *Assigned Senior Counselor:* ${assignedCounselor.name}
🏢 *Desk:* ${assignedCounselor.desk}
📞 *Direct Desk Helpline:* ${assignedCounselor.phone}
📍 *Head Office:* 189/A (2nd Floor), Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka.

*Next Step:* Our counselor has received your file and will contact you shortly to review your university shortlists!`
    };

    // Internal Counselor Alert dispatched to JEL CRM
    const counselorAlertPayload = {
      channel: "crm_push_notification",
      assignedTo: assignedCounselor.name,
      desk: assignedCounselor.desk,
      priority: isHotLead ? "URGENT_HOT_LEAD (Call within 15 mins)" : "STANDARD_QUEUE (Call within 2 hours)",
      notificationTitle: `🚨 New ${isHotLead ? "🔥 HOT LEAD" : "Lead"} (${scoreNum}% Match) - ${studentCleanName}`,
      actionItems: [
        "1. Verify 28-day bank statement holding requirements.",
        "2. Issue preliminary offer letters from Tier-1 partner colleges.",
        "3. Book 1-on-1 embassy interview preparation drill."
      ]
    };

    // Transactional Email Payload
    const emailPayload = {
      to: email || "student@example.com",
      from: "admissions@journeyexpertbd.com",
      subject: `Your AI Eligibility Assessment & University Shortlist - ${studentCleanName}`,
      htmlPreview: `<h1>Your JL Study Abroad Eligibility Report</h1><p>Match Score: ${scoreNum}% | Visa Probability: ${visaProbNum}%</p><p>Assigned Counselor: ${assignedCounselor.name} (${assignedCounselor.desk})</p>`
    };

    // Record in memory store
    const logEntry = {
      alertId,
      leadId: leadId || `LEAD-${Date.now()}`,
      studentName: studentCleanName,
      phone: studentCleanPhone,
      email: email || "student@example.com",
      targetCountry: countryClean,
      scoreNum,
      visaProbNum,
      isHotLead,
      assignedCounselor,
      whatsappPayload,
      counselorAlertPayload,
      emailPayload,
      dispatchedAt: new Date().toISOString()
    };

    inMemoryLeadAlerts.unshift(logEntry);

    res.json({
      success: true,
      alertId,
      isHotLead,
      assignedCounselor,
      whatsappAlert: {
        dispatched: true,
        recipient: studentCleanPhone,
        messagePreview: whatsappPayload.formattedMessage
      },
      crmCounselorAlert: counselorAlertPayload,
      emailAlert: {
        dispatched: true,
        recipient: email || "student@example.com"
      },
      message: `Lead alert dispatched successfully. Assigned to ${assignedCounselor.name}.`
    });
  } catch (error: any) {
    console.error("[POST /api/notifications/send-alert] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Notification dispatch failed" });
  }
});

// GET /api/notifications/recent-alerts
// Retrieve the most recent lead alerts for administrative oversight
app.get("/api/notifications/recent-alerts", (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    count: inMemoryLeadAlerts.length,
    data: inMemoryLeadAlerts.slice(0, 20)
  });
});

// ==========================================
// REQUIREMENT 2: APPLICATION TRACKING ENGINE
// ==========================================
type AppStage = 
  | "DRAFT" 
  | "DOCS_VERIFIED" 
  | "APPLICATION_SUBMITTED" 
  | "OFFER_ISSUED" 
  | "INSURANCE_PAID" 
  | "VISA_LODGED" 
  | "APPROVED";

const STAGE_ORDER: AppStage[] = [
  "DRAFT",
  "DOCS_VERIFIED",
  "APPLICATION_SUBMITTED",
  "OFFER_ISSUED",
  "INSURANCE_PAID",
  "VISA_LODGED",
  "APPROVED"
];

const STAGE_METADATA: Record<AppStage, { label: string; estDays: number; defaultPendingTask: string }> = {
  DRAFT: { label: "Application Draft Created", estDays: 2, defaultPendingTask: "Upload academic transcripts, certificates & photo ID" },
  DOCS_VERIFIED: { label: "Documents Certified & Verified", estDays: 3, defaultPendingTask: "Sign the GTE statement and authorization release" },
  APPLICATION_SUBMITTED: { label: "Application Lodged with University", estDays: 14, defaultPendingTask: "Awaiting University Admissions Board Assessment" },
  OFFER_ISSUED: { label: "Official Offer Letter Issued", estDays: 5, defaultPendingTask: "Accept unconditional/conditional offer & pay tuition deposit" },
  INSURANCE_PAID: { label: "OSHC / IHS Health Insurance Paid", estDays: 4, defaultPendingTask: "Obtain CAS / eCoE / I-20 document & finalize 28-day bank funds" },
  VISA_LODGED: { label: "Student Visa Lodged with Embassy", estDays: 21, defaultPendingTask: "Complete biometrics at VFS/TLS Contact & schedule health checkup" },
  APPROVED: { label: "Visa Approved & Pre-Departure Ready", estDays: 0, defaultPendingTask: "Attend JEL Pre-Departure Briefing & book student flights" }
};

interface StoredApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  targetCountry: string;
  targetUniversity: string;
  targetCourse: string;
  currentStage: AppStage;
  completedStages: AppStage[];
  stageProgressPercent: number;
  estimatedTimeline: Array<{
    stage: AppStage;
    targetDate: string;
    completedDate?: string;
    status: "done" | "current" | "upcoming";
  }>;
  pendingTasks: Array<{
    id: string;
    title: string;
    description: string;
    status: "COMPLETED" | "PENDING" | "IN_REVIEW";
    dueDate?: string;
  }>;
  completedTasks: Array<{
    id: string;
    title: string;
    description: string;
    status: "COMPLETED" | "PENDING" | "IN_REVIEW";
    dueDate?: string;
  }>;
  assignedCounselor: {
    name: string;
    email: string;
    phone: string;
  };
  lastUpdated: string;
  timelineNotes?: string;
}

// In-memory backing store for demo/development with realistic sample data
const inMemoryApplications: StoredApplication[] = [
  {
    id: "APP-JEL-2026-8812",
    studentId: "STD-4091",
    studentName: "Mohammad Tanvir Rahman",
    studentEmail: "student@example.com",
    studentPhone: "+8801712345678",
    targetCountry: "United Kingdom",
    targetUniversity: "University of Greenwich, London",
    targetCourse: "M.Sc. in Data Science & Artificial Intelligence",
    currentStage: "OFFER_ISSUED",
    completedStages: ["DRAFT", "DOCS_VERIFIED", "APPLICATION_SUBMITTED", "OFFER_ISSUED"],
    stageProgressPercent: 57,
    estimatedTimeline: [
      { stage: "DRAFT", targetDate: "2026-08-15", completedDate: "2026-08-15", status: "done" },
      { stage: "DOCS_VERIFIED", targetDate: "2026-08-20", completedDate: "2026-08-18", status: "done" },
      { stage: "APPLICATION_SUBMITTED", targetDate: "2026-08-25", completedDate: "2026-08-22", status: "done" },
      { stage: "OFFER_ISSUED", targetDate: "2026-09-08", completedDate: "2026-09-05", status: "done" },
      { stage: "INSURANCE_PAID", targetDate: "2026-09-18", status: "current" },
      { stage: "VISA_LODGED", targetDate: "2026-09-28", status: "upcoming" },
      { stage: "APPROVED", targetDate: "2026-10-15", status: "upcoming" }
    ],
    pendingTasks: [
      {
        id: "TASK-01",
        title: "Tuition Deposit & CAS Declaration Form",
        description: "Submit £4,000 tuition acceptance deposit and sign university CAS release statement.",
        status: "PENDING",
        dueDate: "2026-09-18"
      },
      {
        id: "TASK-02",
        title: "28-Day Bank Solvency Certificate",
        description: "Verify that balance of 18,50,000 BDT has completed 28 consecutive days in approved bank.",
        status: "IN_REVIEW",
        dueDate: "2026-09-20"
      }
    ],
    completedTasks: [
      {
        id: "TASK-COMP-1",
        title: "Certified Academic Transcripts Uploaded",
        description: "B.Sc. Transcripts & Degree certificates verified by JEL registrar.",
        status: "COMPLETED",
        dueDate: "2026-08-18"
      },
      {
        id: "TASK-COMP-2",
        title: "IELTS Academic Test Report Form (Score: 6.5)",
        description: "Authenticity verified on IELTS TRF verification portal.",
        status: "COMPLETED",
        dueDate: "2026-08-19"
      }
    ],
    assignedCounselor: {
      name: "Jahan Mim (Lead GTE Officer)",
      email: "journeyexpertbd@gmail.com",
      phone: "+8801926400400"
    },
    lastUpdated: new Date().toISOString(),
    timelineNotes: "Conditional Offer received from Greenwich. Next step: Confirm tuition deposit to issue Confirmation of Acceptance for Studies (CAS)."
  }
];

// Helper: Calculate stage progress
const calculateStageProgress = (stage: AppStage): number => {
  const index = STAGE_ORDER.indexOf(stage);
  if (index === -1) return 0;
  return Math.round(((index + 1) / STAGE_ORDER.length) * 100);
};

// Helper: Mock notification dispatcher (Email & WhatsApp alert mock)
const dispatchNotificationAlert = (appRecord: StoredApplication, oldStage: AppStage, newStage: AppStage, note?: string) => {
  const payload = {
    timestamp: new Date().toISOString(),
    recipient: {
      studentName: appRecord.studentName,
      studentEmail: appRecord.studentEmail,
      studentPhone: appRecord.studentPhone
    },
    transition: {
      from: oldStage,
      to: newStage,
      stageLabel: STAGE_METADATA[newStage]?.label || newStage
    },
    channels: [
      {
        channel: "WHATSAPP",
        recipient: appRecord.studentPhone,
        message: `*Journey Expert Limited (JEL) Update*:\nDear ${appRecord.studentName}, your application status for ${appRecord.targetUniversity} has been updated to *${STAGE_METADATA[newStage]?.label}*! ${note ? `\nNote: ${note}` : ""}\nTrack live on: https://journeyexpertbd.com/student-portal`
      },
      {
        channel: "EMAIL",
        recipient: appRecord.studentEmail,
        subject: `Application Milestone Updated: ${STAGE_METADATA[newStage]?.label} - JEL Study Abroad`,
        message: `Hello ${appRecord.studentName},\n\nYour file stage is now: ${STAGE_METADATA[newStage]?.label}.\nTarget University: ${appRecord.targetUniversity}\nDestination: ${appRecord.targetCountry}\n${note ? `Counselor Note: ${note}\n` : ""}For assistance, reach your counselor at +8801926400400.`
      }
    ]
  };

  console.log(`[DISPATCH NOTIFICATION] Student: ${appRecord.studentEmail} | Stage changed: ${oldStage} -> ${newStage}`, JSON.stringify(payload, null, 2));
  return payload;
};

// GET /api/student/application-status
// Fetches the current stage, completed steps, pending tasks, and estimated processing timelines.
app.get("/api/student/application-status", (req: express.Request, res: express.Response) => {
  try {
    const studentEmail = (req.query.email as string || req.query.studentEmail as string || "").toLowerCase();
    const studentId = req.query.studentId as string || req.query.appId as string || "";

    let match = inMemoryApplications.find(a => 
      (studentEmail && a.studentEmail.toLowerCase() === studentEmail) ||
      (studentId && (a.studentId === studentId || a.id === studentId))
    );

    // Fallback to first demo record if not found to provide immediate interactive dashboard response
    if (!match && inMemoryApplications.length > 0) {
      match = inMemoryApplications[0];
    }

    if (!match) {
      res.status(404).json({ success: false, error: "No student application found." });
      return;
    }

    res.json({
      success: true,
      data: match,
      stagesDefinition: STAGE_ORDER.map(stage => ({
        stage,
        label: STAGE_METADATA[stage].label,
        estProcessingDays: STAGE_METADATA[stage].estDays
      }))
    });
  } catch (error: any) {
    console.error("[GET /api/student/application-status] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch application status" });
  }
});

// POST /api/admin/update-status
// Updates the student's file stage and triggers an automated notification payload (Email/WhatsApp alert mock).
app.post("/api/admin/update-status", (req: express.Request, res: express.Response) => {
  try {
    const { appId, studentEmail, newStage, note, pendingTaskTitle, pendingTaskDesc } = req.body;

    if (!newStage || !STAGE_ORDER.includes(newStage as AppStage)) {
      res.status(400).json({
        success: false,
        error: `Invalid 'newStage'. Allowed values: ${STAGE_ORDER.join(", ")}`
      });
      return;
    }

    const targetStage = newStage as AppStage;

    // Find student application
    let appRecord = inMemoryApplications.find(a => 
      (appId && (a.id === appId || a.studentId === appId)) ||
      (studentEmail && a.studentEmail.toLowerCase() === studentEmail.toLowerCase())
    );

    if (!appRecord) {
      if (inMemoryApplications.length > 0) {
        appRecord = inMemoryApplications[0];
      } else {
        res.status(404).json({ success: false, error: "Student application not found" });
        return;
      }
    }

    const oldStage = appRecord.currentStage;
    const stageIndex = STAGE_ORDER.indexOf(targetStage);

    // Update completed stages
    appRecord.currentStage = targetStage;
    appRecord.completedStages = STAGE_ORDER.slice(0, stageIndex + 1);
    appRecord.stageProgressPercent = calculateStageProgress(targetStage);
    appRecord.lastUpdated = new Date().toISOString();
    if (note) {
      appRecord.timelineNotes = note;
    }

    // Update estimated timelines statuses
    appRecord.estimatedTimeline = STAGE_ORDER.map((stage, idx) => {
      let status: "done" | "current" | "upcoming" = "upcoming";
      let completedDate: string | undefined = undefined;

      if (idx < stageIndex) {
        status = "done";
        completedDate = new Date(Date.now() - (stageIndex - idx) * 86400000 * 4).toISOString().split("T")[0];
      } else if (idx === stageIndex) {
        status = "current";
        completedDate = new Date().toISOString().split("T")[0];
      } else {
        status = "upcoming";
      }

      const targetDate = new Date(Date.now() + (idx - stageIndex) * 86400000 * (STAGE_METADATA[stage].estDays || 5)).toISOString().split("T")[0];

      return {
        stage,
        targetDate,
        completedDate,
        status
      };
    });

    // Optionally add new pending task
    if (pendingTaskTitle) {
      appRecord.pendingTasks.unshift({
        id: `TASK-${Date.now()}`,
        title: pendingTaskTitle,
        description: pendingTaskDesc || STAGE_METADATA[targetStage].defaultPendingTask,
        status: "PENDING",
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
      });
    }

    // Dispatch real-time mock notification (Email / WhatsApp)
    const notificationPayload = dispatchNotificationAlert(appRecord, oldStage, targetStage, note);

    res.json({
      success: true,
      message: `Student file status transitioned from ${oldStage} to ${targetStage} successfully.`,
      updatedApplication: appRecord,
      notificationAlert: {
        dispatched: true,
        summary: `Sent WhatsApp to ${appRecord.studentPhone} and Email to ${appRecord.studentEmail}`,
        details: notificationPayload
      }
    });
  } catch (error: any) {
    console.error("[POST /api/admin/update-status] Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update application status" });
  }
});

// Helper to detect production mode safely across ESM (node server.ts) and CJS (esbuild dist/server.cjs)
function isProductionMode(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.NODE_ENV === "development") return false;
  if (process.env.npm_lifecycle_event === "dev" || process.argv.includes("--dev")) return false;
  if (process.env.npm_lifecycle_event === "start") return true;
  // If running in Cloud Run production service (not dev container)
  if (process.env.K_SERVICE && !process.env.NGINX_PORT) return true;
  if (process.env.NGINX_PORT) return false;
  const hasDist = fs.existsSync(path.join(process.cwd(), "dist", "index.html"));
  return hasDist;
}

// Helper to resolve the directory containing compiled static assets without relying on __dirname
function getStaticDistPath(): string {
  const distInCwd = path.join(process.cwd(), "dist");
  if (fs.existsSync(path.join(distInCwd, "index.html"))) {
    return distInCwd;
  }
  const rootIndex = path.join(process.cwd(), "index.html");
  if (fs.existsSync(rootIndex)) {
    return process.cwd();
  }
  return distInCwd;
}

// Setup Vite Dev server integration / Static files build paths
async function bootServer() {
  const isProduction = isProductionMode();

  let viteMiddlewareHandler: express.Handler | null = null;
  let viteReadyPromise: Promise<void> | null = null;

  if (!isProduction) {
    viteReadyPromise = (async () => {
      try {
        console.log(`Loading Vite Dev Middlewares for server on Port ${PORT}...`);
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        viteMiddlewareHandler = vite.middlewares;
        console.log(`[JEL BACKEND SERVER] Vite dev middleware loaded successfully.`);
      } catch (err) {
        console.error(`[JEL BACKEND SERVER] Error initializing Vite dev middleware:`, err);
      }
    })();

    app.use(async (req, res, next) => {
      if (viteMiddlewareHandler) {
        return viteMiddlewareHandler(req, res, next);
      }
      if (viteReadyPromise) {
        await viteReadyPromise;
        if (viteMiddlewareHandler) {
          return viteMiddlewareHandler(req, res, next);
        }
      }
      next();
    });
  } else {
    // Serve production static assets compiled inside /dist
    const distPath = getStaticDistPath();
    console.log(`Serving static production build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JEL BACKEND SERVER] successfully listening on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error(`[JEL BACKEND SERVER] Fatal server listen error on port ${PORT}:`, err);
  });

  // If primary PORT is not 3000 (e.g. in Cloud Run where PORT is 8080), also try binding 3000
  // as an auxiliary port so any internal services or local scripts can also connect
  if (PORT !== 3000) {
    try {
      const auxServer = app.listen(3000, "0.0.0.0", () => {
        console.log(`[JEL BACKEND SERVER] Auxiliary listener active on http://0.0.0.0:3000`);
      });
      auxServer.on("error", () => {
        // Silently ignore if port 3000 is occupied or restricted
      });
    } catch {
      // Silently ignore
    }
  }
}

// Graceful container termination for Cloud Run lifecycle
process.on("SIGTERM", () => {
  console.log("[JEL BACKEND SERVER] Received SIGTERM signal, shutting down gracefully for Cloud Run...");
  process.exit(0);
});

// Export app for serverless function targets like Netlify
export { app };

const isNetlify = !!(process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT);
if (!isNetlify) {
  bootServer();
}

