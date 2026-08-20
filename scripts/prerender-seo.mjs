import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const site = "https://journeyexpertbd.com";
const dist = new URL("../dist/", import.meta.url);
const source = await readFile(new URL("index.html", dist), "utf8");

const pages = {
  "/": {
    title: "Study Abroad Consultancy in Bangladesh | JEL Study Abroad",
    description: "JEL Study Abroad is a Dhaka-based study abroad consultancy helping Bangladeshi students with UK, Canada, Australia, USA, Germany and Ireland university admissions, scholarships and student visa guidance.",
  },
  "/about": {
    title: "About JEL Study Abroad | Dhaka Student Visa Consultants",
    description: "Learn about JEL Study Abroad, our Dhaka counseling team, university partnerships and ethical student visa guidance for Bangladeshi applicants.",
  },
  "/services": {
    title: "Study Abroad Services | Admissions, Scholarships & Student Visas",
    description: "Explore JEL Study Abroad services for university applications, scholarships, SOP review, IELTS guidance and student visa preparation from Bangladesh.",
  },
  "/destinations/": {
    title: "Study Destinations for Bangladeshi Students | UK, Canada & Australia",
    description: "Compare study destinations including the UK, Canada, Australia, USA, Germany and Ireland with JEL Study Abroad admission and visa guidance.",
  },
  "/partners": {
    title: "Partner Universities for Bangladeshi Students | JEL Study Abroad",
    description: "Explore JEL Study Abroad partner universities and admission pathways for Bangladeshi students seeking trusted international education options.",
  },
  "/scholarships/": {
    title: "Study Abroad Scholarships 2026/2027 | JEL Study Abroad",
    description: "Explore full and partial merit scholarships for Bangladeshi students across UK, USA, Canada, Australia and European partner universities.",
  },
  "/blogs": {
    title: "Study Abroad Guides & Student Visa Updates | JEL Study Abroad",
    description: "Read practical study abroad guides, scholarship updates, IELTS advice and student visa information for Bangladeshi applicants.",
  },
  "/contact/": {
    title: "Contact JEL Study Abroad | Student Visa Consultancy in Dhaka",
    description: "Contact JEL Study Abroad at our Tejgaon, Dhaka office for university admissions, scholarships and student visa counseling.",
  },
  "/booking": {
    title: "Book Free Counseling Session | JEL Study Abroad Dhaka",
    description: "Book a one-to-one study abroad counseling session with JEL Study Abroad senior counselors in Tejgaon, Dhaka.",
  },
  "/finder": {
    title: "AI Course Finder & University Search | JEL Study Abroad",
    description: "Search study courses and international universities with smart tuition, eligibility and entry-criteria filters for Bangladeshi students.",
  },
  "/checker": {
    title: "Student Visa Eligibility Checker | JEL Study Abroad",
    description: "Review academic, English-language and financial preparation factors for UK, Canada, Australia and USA student visa applications.",
  },
  "/ects-calculator": {
    title: "ECTS Credit Calculator | JEL Study Abroad",
    description: "Estimate academic credits in ECTS and understand study-abroad options in Europe with the JEL Study Abroad calculator.",
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
  const url = `${site}${path === "/" ? "/" : path}`;
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
  return html;
}

for (const [path, meta] of Object.entries(pages)) {
  const output = path === "/" ? new URL("index.html", dist) : new URL(`${path.slice(1)}/index.html`, dist);
  if (path !== "/") await mkdir(dirname(output.pathname), { recursive: true });
  await writeFile(output, renderPage(path, meta));
}

console.log(`Prerendered ${Object.keys(pages).length} route metadata snapshots.`);
