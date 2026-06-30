import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

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

// AI Chat AI endpoint proxy helper
app.post("/api/gemini/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid payload: messages array required" });
      return;
    }

    // Guard evaluation
    if (!process.env.GEMINI_API_KEY) {
       res.json({ 
        reply: "Hi there! This is JEL Study Abroad Assistance. (Note: The Gemini API Key is currently not set up in Settings > Secrets, so I am running in Offline Companion Mode). How can I assist you with admissions, English tests, or visa processes today?" 
      });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are "JEL Study Abroad Assistant", a highly specialized premium AI student consultant for JEL Study Abroad (parent company: Journey Expert Ltd). JEL is based in Dhaka, Bangladesh: Office Address: 189/A, Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka, Bangladesh. Contacts: Phone (+88029830404), WhatsApp (+8801926400400), email (journeyexpertbd@gmail.com).

Your guidelines:
1. Provide polished, professional, encouraging, and detailed counseling on studying abroad in the UK, Australia, Canada, USA, Ireland, New Zealand, Malaysia, and Europe.
2. Formulate helpful answers regarding tuition structures, visa requirements, IELTS/PTE, SOP drafting, and the 2026/2027 intakes.
3. Sound ethical, transparent, and objective. Never make false promises about 100% visa guarantees.
4. Keep paragraphs readable, well-spaced, and properly organized. Provide helpful checklists where appropriate.`;

    // Map conversation array to model API inputs
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text || "I am processing your query. Please rephrase or contact our counselors." });
  } catch (error: any) {
    console.error("Gemini Chat backend exception:", error);
    res.status(500).json({ error: error.message || "Gemini conversation failed" });
  }
});

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

// Setup Vite Dev server integration / Static files build paths
async function bootServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite Dev Middlewares for server on Port 3000...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets compiled inside /dist
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Serving static production build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JEL BACKEND SERVER] successfully listening on http://localhost:${PORT}`);
  });
}

// Export app for serverless function targets like Netlify
export { app };

const isNetlify = !!(process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT);
if (!isNetlify) {
  bootServer();
}
