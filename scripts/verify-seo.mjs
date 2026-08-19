import { readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "public/robots.txt",
  "public/sitemap.xml",
];

for (const file of requiredFiles) {
  try {
    await readFile(file, "utf8");
  } catch {
    throw new Error(`Missing required SEO file: ${file}`);
  }
}

const html = await readFile("index.html", "utf8");
const robots = await readFile("public/robots.txt", "utf8");
const sitemap = await readFile("public/sitemap.xml", "utf8");

const requiredHtml = [
  "<title>Study Abroad Consultancy in Bangladesh | JEL Study Abroad</title>",
  'content="index,follow,max-image-preview:large"',
  'rel="canonical" href="https://journeyexpertbd.com/"',
  'hreflang="en-BD"',
  'property="og:site_name" content="JEL Study Abroad"',
  "/assets/images/jel-study-abroad-official.png",
];
for (const value of requiredHtml) {
  if (!html.includes(value)) throw new Error(`Missing homepage SEO reference: ${value}`);
}

const forbiddenHosts = [
  "journeyexpertltd.com",
  "journeyexpertlimited.com",
];
for (const host of forbiddenHosts) {
  if (html.includes(host) || robots.includes(host) || sitemap.includes(host)) {
    throw new Error(`Cross-domain production reference found: ${host}`);
  }
}

if (!robots.includes("Sitemap: https://journeyexpertbd.com/sitemap.xml")) {
  throw new Error("robots.txt does not point to the Study Abroad sitemap");
}
if (!sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
  throw new Error("sitemap.xml has an invalid or missing XML namespace");
}

const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (urls.length < 1) throw new Error("sitemap.xml contains no URLs");
for (const url of urls) {
  if (!url.startsWith("https://journeyexpertbd.com/")) {
    throw new Error(`Sitemap URL is outside the Study Abroad domain: ${url}`);
  }
}

console.log(`SEO safety checks passed: ${urls.length} Study Abroad sitemap URL(s) validated.`);
