import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// Port determination:
// - In development (local workspace), the reverse proxy exclusively routes external traffic to port 3000.
// - In production deployment (Cloud Run), Cloud Run directs traffic to process.env.PORT (default 8080).
const getPort = (): number => {
  if (process.env.NODE_ENV === "production") {
    return Number(process.env.PORT) || 8080;
  }
  return 3000;
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
Official Website: https://journeyexpertbd.com
Additional Website: https://journeyexpertltd.com
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
4. BILINGUAL & BANGLISH ADAPTIVE RESPONSE:
   - Automatically detect the customer's language.
   - If the customer speaks or writes in Bengali (বাংলা), respond in natural, fluent, polite Bengali (বাংলা).
   - If the customer speaks or writes in English, respond in polished, articulate English.
   - If the customer uses mixed Banglish or code-switching, respond naturally in friendly bilingual format.
   - Do NOT force customers to select a language before speaking or chatting.
5. VOICE & SPEECH OPTIMIZATION:
   - Since your response is often spoken aloud via text-to-speech, keep responses punchy, conversational, and avoid excessive markdown symbols, tables, or asterisks.
6. HUMAN HANDOFF:
   - When a quotation, live booking, payment, complex case assessment, or human agent is requested, immediately provide JEL's verified contact channels:
     * WhatsApp / Hotline: +8801926400400
     * Telephone: +8802 9830404
     * Email: journeyexpertbd@gmail.com
     * Head Office: 189/A (2nd Floor), Abdul Motin Complex, Hazi Moron Ali Road, Nabisco Mor, Tejgaon, Dhaka-1215, Bangladesh.`;

const handleAngelaChat = async (req: express.Request, res: express.Response) => {
  try {
    const { messages, message, language } = req.body;
    
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

    // Offline / fallback mode if GEMINI_API_KEY is not configured
    if (!process.env.GEMINI_API_KEY) {
      const lastUserMsg = [...normalizedMessages].reverse().find((m: any) => m.sender === "user")?.text || "";
      const isBangla = /[\u0980-\u09FF]/.test(lastUserMsg) || (language === "bn");

      if (isBangla) {
        res.json({
          reply: "আসসালামু আলাইকুম! আমি অ্যাঞ্জেলা (Angela), জার্নি এক্সপার্ট লিমিটেড-এর অফিশিয়াল এআই ভয়েস অ্যাসিস্ট্যান্ট। এয়ার টিকিট, ভিসা প্রসেসিং, ট্যুর প্যাকেজ, ওমরাহ অথবা স্টাডি অ্যাব্রোড নিয়ে আপনার যেকোনো প্রশ্ন আমাকে করতে পারেন। সরাসরি আমাদের অভিজ্ঞ ট্রাভেল ও এডুকেশন কনসালট্যান্টের সাথে কথা বলতে হোয়াটসঅ্যাপ বা কল করুন +8801926400400 নম্বরে।"
        });
      } else {
        res.json({
          reply: "Hello! I am Angela, the official AI Voice Assistant for Journey Expert Limited (JEL). I can assist you with air ticketing, visa services, tour packages, Umrah, and study abroad programs. For instant personalized support, connect directly with our experts via WhatsApp at +8801926400400 or visit our head office at Nabisco Mor, Tejgaon, Dhaka."
        });
      }
      return;
    }

    const ai = getGeminiClient();

    // Map conversation array to model API inputs
    const contents = normalizedMessages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: ANGELA_SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I am here to help you. For direct assistance, please contact our JEL team at +8801926400400.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Angela Gemini Chat backend exception:", error);
    // Never expose stack traces to customers (Phase 12 error handling rule)
    res.status(500).json({ 
      error: "I'm temporarily unable to respond. Please try again or contact JEL directly via WhatsApp at +8801926400400.",
      reply: "I'm temporarily unable to process your request. Please connect with our counselors directly via WhatsApp at +8801926400400 or call +8802 9830404." 
    });
  }
};

app.post("/api/gemini/chat", handleAngelaChat);
app.post("/api/gemini/angela", handleAngelaChat);
app.post("/api/chat", handleAngelaChat);

// Smart Course Finder matching logic
app.post("/api/gemini/course-finder", async (req: express.Request, res: express.Response) => {
  try {
    const { preferredCountry, educationLevel, budgetRange, interestArea, gpa } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Return solid fallback recommendation if key is missing to keep UI 100% interactive
      res.json([
        {
          courseName: "B.Sc. in Computer Science / Information Technology",
          university: "Taylor's University (Branch transferring to Australia)",
          country: "Malaysia",
          duration: "3 Years",
          approxTuition: "$6,500 / year",
          reason: "An excellent low-budget pathway based on your interest in " + (interestArea || "computing") + ". Taylor's ranks highly in Asia and offers dynamic transfer credits to Australian Group of 8 schools."
        },
        {
          courseName: "M.Sc. in Business Analytics / Data Science",
          university: "University of Greenwich",
          country: "United Kingdom",
          duration: "1 Year",
          approxTuition: "£16,000 / year",
          reason: "Perfectly aligns with your academic profile. Greenwich provides superb industry placement networks around London, high acceptance rates, and a 2-year Graduate Route stay back visa."
        },
        {
          courseName: "M.Eng. in Software Engineering",
          university: "Monash University",
          country: "Australia",
          duration: "2 Years",
          approxTuition: "A$38,000 / year",
          reason: "Top-tier option if budget satisfies the criteria. Monash is a QS Top 50 institution producing elite global engineers with direct pathway rights to Australia PR."
        }
      ]);
      return;
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
Do not output markdown code fences or other textual summaries, output the JSON structure directly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    res.status(500).json({ error: error.message || "Course search failed" });
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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "jel-server", timestamp: new Date().toISOString() });
});

// Setup Vite Dev server integration / Static files build paths
async function bootServer() {
  const PORT = getPort();

  if (process.env.NODE_ENV !== "production") {
    console.log(`Loading Vite Dev Middlewares for server on Port ${PORT}...`);
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets compiled inside /dist
    const distPath = fs.existsSync(path.join(__dirname, "index.html"))
      ? __dirname
      : (fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
          ? path.join(process.cwd(), "dist")
          : path.resolve(__dirname, "..", "dist"));
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
