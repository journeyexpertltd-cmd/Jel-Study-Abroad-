import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const site = "https://journeyexpertbd.com";
const dist = new URL("../dist/", import.meta.url);
const source = await readFile(new URL("index.html", dist), "utf8");

const pages = {
  "/": {
    title: "Journey Expert Limited | AI Travel, Visa, Study Abroad & Global Mobility",
    description: "Journey Expert Limited (JEL) is a Bangladesh-based AI-powered travel and global mobility ecosystem covering air ticketing, visa assistance, tours, hotels, Hajj & Umrah, Study Abroad, medical tourism, insurance and corporate travel.",
    details: [
      "Journey Expert Limited supports travelers, students, families and corporate clients through connected services including air ticketing and fare support, visa-document assistance, tours and hotels, Hajj and Umrah, halal tourism, medical tourism, travel insurance, corporate travel management, Meet & Greet, Study Abroad and compliance advisory support.",
      "JEL Study Abroad remains a dedicated education module within the wider Journey Expert Limited ecosystem, helping Bangladeshi students research destinations, universities, scholarships, applications and student-visa preparation. Angela AI and human specialists provide guidance while final airline, university, scholarship and immigration decisions remain with the relevant providers and authorities."
    ]
  },
  "/about/": {
    title: "About JEL Study Abroad | Dhaka Student Visa Consultants",
    description: "Learn about JEL Study Abroad, the education-consulting brand of Journey Expert Ltd., and its student counseling services from Dhaka.",
    details: [
      "JEL Study Abroad is the international education and student-counseling brand of Journey Expert Ltd. The team works with Bangladeshi applicants who need a structured plan for choosing a destination, identifying suitable institutions, preparing application documents and understanding the steps that normally follow an offer or admission decision.",
      "The counseling approach is designed around transparent case review and document readiness. Students are encouraged to verify institution-specific entry requirements, tuition, scholarship terms and visa rules from official sources because these can change by intake and by applicant profile. JEL can help organize the process and explain the information in practical language."
    ]
  },
  "/services/": {
    title: "Study Abroad Services | Admissions, Scholarships & Visas",
    description: "Explore JEL Study Abroad services for university applications, scholarship research, SOP review, English guidance and student visa preparation.",
    details: [
      "Study abroad planning usually involves several connected tasks: selecting a realistic course, checking academic and English requirements, preparing documents, submitting applications and responding to university requests. JEL Study Abroad helps students organize these stages and understand what evidence may be required for their chosen destination and institution.",
      "Support may include application planning, document checklist review, SOP or personal-statement feedback, scholarship research, interview preparation and student visa guidance. The service is advisory and preparation-focused; universities, scholarship bodies and immigration authorities make their own independent decisions and may request additional evidence at any stage."
    ]
  },
  "/destinations/": {
    title: "Study Destinations | UK, Canada & Australia | JEL",
    description: "Compare major study destinations for Bangladeshi students, including admissions, typical documentation and planning factors for each country.",
    details: [
      "Choosing a study destination should consider more than a university ranking. Students should compare academic entry criteria, English-language requirements, tuition and living costs, available intakes, course length, location, scholarship opportunities and the current visa process for the country they are considering.",
      "JEL Study Abroad provides destination-level guidance for popular markets including the UK, Canada, Australia, the USA, Germany and Ireland. Requirements and immigration policies can change, so country pages and counseling should be used as a planning aid alongside the latest information published by universities, embassies and official immigration authorities."
    ]
  },
  "/partners/": {
    title: "University Partners & Pathways | JEL Study Abroad",
    description: "Explore universities, education providers and admission pathways relevant to Bangladeshi students with application guidance from JEL Study Abroad.",
    details: [
      "Students can research institutions and admission pathways that may fit their academic background, preferred subject, budget and destination. JEL Study Abroad can help compare entry requirements, application documents, available intakes and the practical steps needed to prepare a complete university application.",
      "Institution availability, program entry criteria and agency or recruitment arrangements may change over time and by intake. Students should treat the current list as a research and application-support resource and confirm the latest program, fee, scholarship and representation details before making a financial or enrollment decision."
    ]
  },
  "/scholarships/": {
    title: "Study Abroad Scholarships 2026/2027 | JEL Study Abroad",
    description: "Research merit, need-based and institution-specific scholarships for Bangladeshi students planning international study in 2026 and 2027.",
    details: [
      "Scholarships can be offered by universities, governments, foundations and other education providers. Eligibility commonly depends on academic results, English proficiency, program choice, application timing and sometimes financial or extracurricular evidence. Award values and deadlines vary widely between institutions and intakes.",
      "JEL Study Abroad can help students identify relevant opportunities, organize supporting documents and understand application instructions. Scholarship availability is never guaranteed, and students should verify the latest award value, eligibility rules, deadline and conditions directly with the institution or scholarship provider before applying."
    ]
  },
  "/blogs/": {
    title: "Study Abroad Guides & Visa Updates | JEL Study Abroad",
    description: "Read practical study abroad guides, scholarship notes, English-test advice and student visa preparation information for Bangladeshi applicants.",
    details: [
      "The JEL Study Abroad guides are designed to turn complex study-abroad topics into practical checklists and explanations. Topics may include university applications, scholarship research, English-language tests, academic documents, statements of purpose, financial preparation and common visa-document questions.",
      "Education and immigration requirements change frequently. Articles should therefore be used as general guidance rather than a substitute for current instructions from a university, embassy or immigration authority. For a case-specific review, students can contact the JEL counseling team with their academic profile and intended destination."
    ]
  },
  "/contact/": {
    title: "Contact JEL Study Abroad | Student Visa Consultancy in Dhaka",
    description: "Contact JEL Study Abroad in Tejgaon, Dhaka for university application, scholarship and student visa counseling support.",
    details: [
      "Students and families can contact JEL Study Abroad to discuss destination selection, university applications, scholarship research, document preparation and student visa planning. A counseling conversation is most useful when the student can share their academic background, preferred subject, target country and intended intake.",
      "JEL Study Abroad operates from Tejgaon, Dhaka and can be reached by phone or email for appointment and service information. Do not send passwords, OTPs or unnecessary sensitive financial information through public chat. Case-specific document review should be handled through the appropriate secure channel advised by the counseling team."
    ]
  },
  "/booking/": {
    title: "Book Counseling Session | JEL Study Abroad Dhaka",
    description: "Book a study abroad counseling session with JEL Study Abroad in Dhaka to review your academic profile, destination and application plan.",
    details: [
      "A counseling session can help turn a broad study-abroad goal into a practical application plan. Students should be ready to discuss their academic history, English-language status, preferred course, budget, target destination and intended intake so that the counselor can identify the most important next steps.",
      "The session can cover university research, document readiness, scholarship questions and visa-planning considerations. Counseling does not guarantee admission, scholarships or visa approval; it is intended to improve preparation and help the student understand the requirements that apply to their profile."
    ]
  },
  "/study-abroad/apply/": {
    title: "Apply to Study Abroad | JEL Student Intake",
    description: "Submit your study-abroad profile securely for JEL counselor review, including destination, study level, subject, intake and academic background.",
    details: [
      "The JEL online student intake form collects the essential information a counselor needs for an initial study-abroad profile review: contact details, preferred destination, intended study level, subject, intake, academic result, English-test status and budget direction.",
      "Submitting an enquiry does not create an admission offer, scholarship entitlement or visa decision. A JEL counselor can review the profile, explain appropriate next steps and confirm which official institution requirements and documents need to be checked before an application proceeds."
    ]
  },
  "/finder/": {
    title: "AI Course Finder & University Search | JEL Study Abroad",
    description: "Use the JEL course finder to research study options by destination, subject, tuition and entry criteria before confirming details with an institution.",
    details: [
      "The course finder helps students narrow a large number of international study options into a more manageable shortlist. Search and matching tools can be useful for comparing subject areas, destinations, tuition ranges and common entry criteria before speaking with a counselor or preparing an application.",
      "AI-assisted matching is a planning aid, not an admission decision. Course availability, tuition, entry requirements and application deadlines can change, so students should confirm the latest details with the university or through a verified application channel before relying on a result."
    ]
  },
  "/checker/": {
    title: "Student Visa Eligibility Checker | JEL Study Abroad",
    description: "Review academic, English-language and financial preparation factors that may affect a student visa application for major study destinations.",
    details: [
      "The eligibility checker helps students identify common preparation areas that can influence a study-abroad or visa file, such as academic history, study gaps, English-language evidence and financial documentation. It is intended to highlight questions that may need further review before an application is submitted.",
      "An automated result is not a visa assessment or guarantee. Immigration authorities apply current law and case-specific criteria, and universities may have separate admission requirements. Students should use the checker as an initial planning tool and obtain current official guidance for their destination before making decisions."
    ]
  },
  "/ects-calculator/": {
    title: "ECTS Credit Calculator | JEL Study Abroad",
    description: "Estimate academic credits in ECTS and use the result as a planning reference for European study options and university credit discussions.",
    details: [
      "The ECTS calculator provides an estimate that can help students understand how their previous study load might compare with the European Credit Transfer and Accumulation System. It is useful for early research when reviewing European programs, credit expectations or possible progression routes.",
      "Credit conversion is not always a simple one-to-one calculation. Universities decide how previous modules, contact hours, learning outcomes and qualification levels are recognized. The calculator should therefore be treated as a planning estimate, with the final credit assessment confirmed by the receiving institution."
    ]
  },
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceAttr(html, pattern, value) {
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
}

function renderPage(path, meta) {
  const url = `${site}${path}`;
  let html = source;
  html = html.replace(/(<title>)[^<]*(<\/title>)/i, `$1${escapeHtml(meta.title)}$2`);
  html = replaceAttr(html, /(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/i, meta.description);
  html = replaceAttr(html, /(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/i, meta.title);
  html = replaceAttr(html, /(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/i, meta.description);
  html = replaceAttr(html, /(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/?>)/i, url);
  html = replaceAttr(html, /(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/?>)/i, meta.title);
  html = replaceAttr(html, /(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/?>)/i, meta.description);
  html = replaceAttr(html, /(<meta\s+name="twitter:url"\s+content=")[^"]*("\s*\/?>)/i, url);
  html = replaceAttr(html, /(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/i, url);
  html = replaceAttr(html, /(<link\s+rel="alternate"\s+hreflang="en-BD"\s+href=")[^"]*("\s*\/?>)/i, url);
  html = replaceAttr(html, /(<link\s+rel="alternate"\s+hreflang="x-default"\s+href=")[^"]*("\s*\/?>)/i, url);

  const webPage = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: meta.title,
    description: meta.description,
    isPartOf: { "@id": `${site}/#website` },
    inLanguage: "en-BD",
  });
  html = html.replace("</head>", `    <script type="application/ld+json">${webPage}</script>\n  </head>`);

  const navigation = Object.entries(pages)
    .map(([href, item]) => `<a href="${href}">${escapeHtml(item.title.split(" | ")[0])}</a>`)
    .join(" · ");
  const details = meta.details.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  const content = `<main data-prerendered-seo="true"><h1>${escapeHtml(meta.title.split(" | ")[0])}</h1><p>${escapeHtml(meta.description)}</p>${details}<nav aria-label="Journey Expert services">${navigation}</nav><p>Contact Journey Expert Limited: <a href="tel:+8801926400400">+880 1926-400400</a> · <a href="mailto:journeyexpertbd@gmail.com">journeyexpertbd@gmail.com</a></p></main>`;
  html = html.replace(/<div\s+id="root"\s*>\s*<\/div>/i, `<div id="root">${content}</div>`);
  return html;
}

for (const [path, meta] of Object.entries(pages)) {
  const slug = path === "/" ? "" : path.replace(/^\/|\/$/g, "");
  const output = path === "/" ? new URL("index.html", dist) : new URL(`${slug}/index.html`, dist);
  if (path !== "/") await mkdir(dirname(fileURLToPath(output)), { recursive: true });
  await writeFile(output, renderPage(path, meta));
}

console.log(`Prerendered ${Object.keys(pages).length} canonical SEO route snapshots.`);
