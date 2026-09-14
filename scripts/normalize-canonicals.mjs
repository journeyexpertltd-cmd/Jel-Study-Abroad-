import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = 'https://journeyexpertbd.com';
const routes = [
  '/about',
  '/services',
  '/destinations',
  '/partners',
  '/scholarships',
  '/blogs',
  '/contact',
  '/booking',
  '/finder',
  '/checker',
  '/ects-calculator',
];

for (const route of routes) {
  const slug = route.slice(1);
  const file = join('dist', slug, 'index.html');
  let html = await readFile(file, 'utf8');

  const slashUrl = `${site}${route}/`;
  const canonicalUrl = `${site}${route}`;
  html = html.replaceAll(slashUrl, canonicalUrl);
  html = html.replaceAll(`href="${route}/"`, `href="${route}"`);

  await writeFile(file, html);
}

console.log(`Normalized ${routes.length} canonical route snapshots to no-slash URLs.`);
