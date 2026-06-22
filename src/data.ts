import { CountryData, Scholarship, Testimonial, BlogItem, PartnerUniversity } from "./types";

export const COUNTRIES: CountryData[] = [
  {
    id: "uk",
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    tuitionRange: "£14,000 - £26,000 / year",
    workOpportunities: "20 hours/week part-time. 2 years Post-Study Work (PSW) Visa (3 years for PhD).",
    popularUniversities: ["University College London (UCL)", "University of Greenwich", "Manchester Metropolitan University", "Coventry University"],
    description: "The UK is world-renowned for its heritage in education, highly intensive 1-year master's degrees, and exciting multi-cultural student hubs."
  },
  {
    id: "australia",
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    tuitionRange: "A$22,000 - A$45,000 / year",
    workOpportunities: "48 hours/fortnight part-time. 2 to 4 years post-study work rights depending on qualification.",
    popularUniversities: ["Monash University", "University of Sydney", "Macquarie University", "Deakin University"],
    description: "Australia offers superb educational rigor, great postgraduate wage structures, an active lifestyle, and clear temporary-to-permanent avenues."
  },
  {
    id: "canada",
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    tuitionRange: "C$18,000 - C$38,000 / year",
    workOpportunities: "Standard off-campus part-time work rights. Up to 3 years Post-Graduation Work Permit (PGWP).",
    popularUniversities: ["University of Toronto", "McGill University", "Seneca College", "York University"],
    description: "Widely regarded as the most progressive student destination, Canada represents unrivaled immigration friendliness, tech growth, and safety."
  },
  {
    id: "usa",
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    tuitionRange: "$20,000 - $48,000 / year",
    workOpportunities: "On-campus part-time (20 hrs/week). 1 year of standard OPT (up to 3 years total for STEM graduates).",
    popularUniversities: ["New York University (NYU)", "Northeastern University", "Arizona State University", "University of Texas at Dallas"],
    description: "Home to the world's highest density of Top 100 QS Ranked schools, state-of-the-art research funding, and unmatched venture startup environments."
  },
  {
    id: "ireland",
    name: "Ireland",
    code: "IE",
    flag: "🇮🇪",
    tuitionRange: "€12,000 - €24,000 / year",
    workOpportunities: "20 hours/week part-time (40 hrs during holidays). 2-year stay back visa for master's grads.",
    popularUniversities: ["Trinity College Dublin", "University College Dublin (UCD)", "Dublin City University", "Galway Mayo Institute of Tech"],
    description: "Rapidly scaling as the European tech headquarters, Ireland combines warm hospitality with deep global employment opportunities in coding and finance."
  },
  {
    id: "newzealand",
    name: "New Zealand",
    code: "NZ",
    flag: "🇳🇿",
    tuitionRange: "NZ$24,000 - NZ$35,000 / year",
    workOpportunities: "20 hours/week part-time. Up to 3 years post-study work visa depending on qualification levels.",
    popularUniversities: ["University of Auckland", "Auckland University of Technology", "Waikato University", "Lincoln University"],
    description: "Kiwi education champions hands-on discovery and research integrity, wrapped in standard post-study work rights and breathtaking, peaceful scenery."
  },
  {
    id: "malaysia",
    name: "Malaysia",
    code: "MY",
    flag: "🇲🇾",
    tuitionRange: "$4,000 - $9,000 / year",
    workOpportunities: "Restricted part-time permissions. High-quality standard degree transfer routes to Western institutions.",
    popularUniversities: ["Taylor's University", "Sunway University", "Asia Pacific University (APU)", "UCSI University"],
    description: "Malaysia has evolved into a powerhouse for low-tuition global degrees, hosting esteemed branch campuses of top UK and Australian universities."
  }
];

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch-1",
    title: "Vice-Chancellor's International Excellence Award",
    country: "Australia",
    coverage: "25% to 50% Tuition Fee Waiver",
    eligibility: "GPA 5.00/5.00 (HSC) or minimum 3.6/4.0 (Bachelor's CGPA). Strong SOP required.",
    deadline: "October 15, 2026",
    description: "Automatically reviewed upon application for eligible regional and metro public universities in Melbourne and Sydney."
  },
  {
    id: "sch-2",
    title: "Commonwealth Scholarship & Fellowship Plan",
    country: "United Kingdom",
    coverage: "100% Tuition Fee + Monthly Living Stipend + Return Airfare",
    eligibility: "First Class academic track in undergraduate degree. Designed for developing nations.",
    deadline: "December 01, 2026",
    description: "One of the most prestigious fully-funded scholarships globally, sponsored by the UK Foreign, Commonwealth & Development Office."
  },
  {
    id: "sch-3",
    title: "Ontario Graduate Scholarship (OGS)",
    country: "Canada",
    coverage: "CAD $15,000 per year",
    eligibility: "Master's or Doctoral applicants to participating Ontario public universities showing research merit.",
    deadline: "January 31, 2027",
    description: "Co-funded by the provincial government of Ontario and the university to retain elite research minds."
  },
  {
    id: "sch-4",
    title: "President's Merit Scholarship",
    country: "United States",
    coverage: "$10,000 - $25,000 / year (Renewable)",
    eligibility: "SAT score of 1350+ or ACT 29+, paired with minimum High School GPA of 3.8 out of 4.0.",
    deadline: "November 01, 2026",
    description: "Highly sought merit-based award that substantially offsets private and public state university tuition across various US campuses."
  },
  {
    id: "sch-5",
    title: "Government of Ireland Post-Graduate Scholarship",
    country: "Ireland",
    coverage: "100% Tuition + €19,000 annual living expense stipend",
    eligibility: "Applicants entering dynamic research, engineering, STEM or digital product programs with strong research proposals.",
    deadline: "October 21, 2026",
    description: "Highly competitive, funded by the Irish Research Council to build excellence within Ireland's knowledge economy."
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Tashfeen Ahmed",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    destinationCountry: "Canada",
    universityName: "University of Toronto",
    course: "M.Sc. in Computer Science",
    review: "Applying with JEL Study Abroad was easily the best career planning decision I've made. Their counselors structured my SOP step-by-step and navigated a complex Canada VISA processing path seamlessly. Now, I'm working as part-time researcher in Toronto!",
    rating: 5
  },
  {
    id: "t-2",
    name: "Nusrat Jahan Mim",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    destinationCountry: "United Kingdom",
    universityName: "University of Greenwich",
    course: "Master of Business Administration (MBA)",
    review: "I was extremely anxious about my 2-year study gap after my Bachelor's degree. JEL Study Abroad thoroughly analyzed my professional portfolio, matched suitable courses looking past my gap years, and secured a conditional 30% scholarship!",
    rating: 5
  },
  {
    id: "t-3",
    name: "Rashedul Islam Hasan",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    destinationCountry: "Australia",
    universityName: "Deakin University",
    course: "Bachelor of Cybersecurity",
    review: "The mock interviews conducted by their visa team were incredibly realistic. It gave me massive confidence when dealing with the Australian High Commission processes. Highly professional service with utmost transparency.",
    rating: 5
  },
  {
    id: "t-4",
    name: "Sajid Chowdury",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    destinationCountry: "United States",
    universityName: "Arizona State University",
    course: "M.S. in Data Science",
    review: "Unlike traditional agencies, JEL doesn't pressure you. They helped me search safe, moderate, and dream colleges. I secured admissions to all 3 of my shortlisted US universities with partial funding. Thank you JEL!",
    rating: 5
  },
  {
    id: "t-5",
    name: "Farah Tabassum",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    destinationCountry: "Ireland",
    universityName: "Dublin City University",
    course: "M.Sc. in Cloud Computing",
    review: "JEL's post-arrival support is what sets them apart. They even connected me with alumni students already settled in Dublin to find accommodation easily! Absolute peace of mind.",
    rating: 5
  },
  {
    id: "t-6",
    name: "Anas Bin Malik",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    destinationCountry: "Europe (Germany)",
    universityName: "Technical University of Munich",
    course: "M.Sc. in Automotive Systems",
    review: "Free education in Germany seemed complex, but JEL sorted out my block accounts, translated German document mandates, and secured my visa. No hidden fees, just true ethics.",
    rating: 5
  }
];

export const BLOGS: BlogItem[] = [
  {
    id: "b-1",
    title: "How to Write a Captivating SOP for Top Tier Universities",
    category: "Guides",
    excerpt: "Your Statement of Purpose represents your voice under a stack of transcripts. Learn the perfect structural blueprint designed to convince admissions committees.",
    content: "A Statement of Purpose (SOP) is one of the most vital subjective metrics of your university application. While GPAs show your history, your SOP explains your destiny.\n\n### The Recommended 5-Paragraph Structure\n\n1.  **The Hook / Introduction:** Explain *why* you are fascinated by this particular micro-discipline. Skip generic lines like 'Ever since my childhood...' Instead, talk about a specific academic model, project or revelation that motivated you.\n2.  **Academic Legacy:** Highlight your undergraduate research, papers, relevant programming or engineering achievements, and thesis highlights.\n3.  **Why This Course & University:** Refer to specific laboratory names, published journals of the professors, and localized course units. It shows research rather than copy-pasting.\n4.  **Professional Vision:** Where do you see yourself in 3, 5, and 10 years? Be specific. Name roles (e.g., Lead Systems Engineer at Google or Senior Counselor at IMF).\n5.  **Ethical Summary:** Reiterate why you are a perfect cultural and global student fit.\n\n### Pro Tip from JEL Counselors\nKeep plagiarism to exactly 0%, double check your passive voice uses, and have a professional editor (like JEL Senior Counselor) audit your final flow.",
    author: "JEL Senior Admissions Team",
    date: "June 12, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "b-2",
    title: "Post-Study Work Visa Extension Updates: UK & Australia",
    category: "Visa Updates",
    excerpt: "Stay up to date with critical policy changes in immigration, post-academic work streams (PSW), stay-back rules, and pathway requirements for 2026.",
    content: "If you are planning your study abroad intakes for late 22026 or 2027, the immigration updates regarding Post-Study Work Visa streams represent vital knowledge.\n\n### United Kingdom (The Graduate Route)\nCurrently, international students completing their Bachelor's or Master's degrees in the UK are eligible for a 2-year Graduate Route stay back visa. For doctoral graduates, it extends up to 3 years. The UK continues to welcome genuine international intellects looking to transform retail, health, AI, and banking sectors.\n\n### Australia (Temporary Graduate Visa sub-class 485)\nAustralia has streamlined the Post-Study Work right duration for high-skill disciplines. Under the prevailing rules, selected master's and PhD programs retain exceptional opportunities to build full-time careers locally, with extended visa years for those willing to live in regional cities (like Adelaide, Perth, and Gold Coast).\n\nConsult the JEL Visa team to construct a precise, clean roadmap that keeps you legally compliant.",
    author: "Mahmudul Hasan (Visa Expert)",
    date: "May 29, 2026",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "b-3",
    title: "10 Direct Fully-Funded Master's Scholarships for Asian Students",
    category: "Scholarship News",
    excerpt: "A comprehensive roundup of international government fellowships, private trust grants, and university-funded awards that cover 100% of study costs.",
    content: "Studying abroad can feel financially overwhelming, but prestigious global grants make it accessible. Here are three highly recommended fully-funded programs championed by JEL Study Abroad:\n\n### 1. UK Chevening Scholarships\nCovers full university tuition, standard living allowances, returns flights, and regional networking grants. Applications generally open in August and end in November every year.\n\n### 2. Australian Destination Australia\nSustains students enrolling in regional campuses. Provides up to A$15,000 annually to help cover living expenses and tuition.\n\n### 3. Germany DAAD Scholarship\nSpecifically targets postgraduate students and working professionals from developing nations with at least two years of work experience.\n\nReady to apply? Let the JEL Matching engine find the award you qualify for.",
    author: "Arif Abdullah (Scholarship Lead)",
    date: "June 05, 2026",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "b-4",
    title: "How Monash University Transformed Shanzid's Global Career Path",
    category: "Success Stories",
    excerpt: "From a small neighborhood in Dhaka to the elite tech-districts of Melbourne. Discover Shanzid's step-by-step admissions and scholarship journey.",
    content: "Meet Shanzid, an ambitious software developer who graduated with an HSC score of GPA 5 from Dhaka College. Under guidance from JEL Study Abroad, Shanzid applied for the Bachelor of Computer Science program at Monash University in Melbourne (a top Group of Eight institution).\n\nThrough rigorous JEL file preparation, Shanzid secured a 25% merit-based scholarship, lowering his annual investment remarkably. After completing his courses, he was picked by an enterprise consultancy during the campus placement drives.\n\n'My counselors at Tejgaon office were like my elder brothers,' Shanzid notes. 'They kept every financial receipt and document completely transparent.'",
    author: "JEL Chief Editor",
    date: "April 18, 2026",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400"
  }
];

export const UNIVERSITY_PARTNERS: PartnerUniversity[] = [
  { id: "u-1", name: "University of Toronto", country: "Canada", ranking: "QS #21", logoLetter: "T", popularPrograms: ["Computer Science", "Engineering", "Commerce"], scholarshipAvailable: "CAD $12,000" },
  { id: "u-2", name: "University of Greenwich", country: "United Kingdom", ranking: "QS #651-700", logoLetter: "G", popularPrograms: ["MBA", "M.Sc. Data Science", "Healthcare"], scholarshipAvailable: "up to £3,000" },
  { id: "u-3", name: "Monash University", country: "Australia", ranking: "QS #37", logoLetter: "M", popularPrograms: ["Information Tech", "Medicine", "Bachelor of Business"], scholarshipAvailable: "up to $10,000/year" },
  { id: "u-4", name: "Auckland University of Technology", country: "New Zealand", ranking: "QS #407", logoLetter: "A", popularPrograms: ["Software Engineering", "MBA"], scholarshipAvailable: "NZD $5,000" },
  { id: "u-5", name: "Taylor's University", country: "Malaysia", ranking: "QS #251", logoLetter: "T", popularPrograms: ["Hospitality Management", "Business"], scholarshipAvailable: "up to 50% waiver" },
  { id: "u-6", name: "Coventry University", country: "United Kingdom", ranking: "QS #551", logoLetter: "C", popularPrograms: ["Automotive Design", "Project Management"], scholarshipAvailable: "£2,500 Academic Discount" },
  { id: "u-7", name: "Macquarie University", country: "Australia", ranking: "QS #130", logoLetter: "M", popularPrograms: ["M.Sc Business Analytics", "Cyber Security"], scholarshipAvailable: "AUD $10,000/year" },
  { id: "u-8", name: "Northeastern University", country: "United States", ranking: "QS #375", logoLetter: "N", popularPrograms: ["M.S. in Computer Science", "Engineering Management"], scholarshipAvailable: "Based on GRE/GPA" },
  { id: "u-9", name: "Trinity College Dublin", country: "Ireland", ranking: "QS #81", logoLetter: "T", popularPrograms: ["Finance", "Digital Humanities"], scholarshipAvailable: "€5,000 Global Scholar" },
  { id: "u-10", name: "Technical University of Munich", country: "Europe (Germany)", ranking: "QS #28", logoLetter: "M", popularPrograms: ["Automotive Systems", "Web Development"], scholarshipAvailable: "Tuition Exempt (Public)" },
  { id: "u-11", name: "Deakin University", country: "Australia", ranking: "QS #233", logoLetter: "D", popularPrograms: ["Sports Science", "Cybersecurity"], scholarshipAvailable: "25% Fee Reduction" },
  { id: "u-12", name: "Arizona State University", country: "United States", ranking: "QS #200", logoLetter: "A", popularPrograms: ["Electrical Engineering", "MBA"], scholarshipAvailable: "up to $15,000/year" },
  { id: "u-13", name: "University of Greenwich (Medway)", country: "United Kingdom", ranking: "QS #651", logoLetter: "G", popularPrograms: ["Pharmaceutical Sciences"], scholarshipAvailable: "£3,000 Merit" },
  { id: "u-14", name: "Sunway University", country: "Malaysia", ranking: "QS #580", logoLetter: "S", popularPrograms: ["Accounting & Finance", "Computer Science"], scholarshipAvailable: "30% Waiver" },
  { id: "u-15", name: "Dublin City University", country: "Ireland", ranking: "QS #436", logoLetter: "D", popularPrograms: ["Masters in Cloud Computing"], scholarshipAvailable: "€3,000 Scholar" }
];

export const TEAM_MEMBERS = [
  {
    name: "Jahan Mim",
    role: "CEO & Managing Director",
    bio: "Over 12 years of core leadership in international university admissions, counseling, and high-level corporate visa advocacy for students.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Tashfeen Ahmed",
    role: "Senior Education Counselor",
    bio: "Specializes in complex candidate profiling, high-ranking Group of 8 registrations (Australia), and Ivy League recommendations.",
    img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Mahmudul Hasan",
    role: "Lead Visa processing Officer",
    bio: "Ex-embassy advisor with absolute mastery in financial documentation auditing, GTE compliance statements, and mock coaching.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Arif Abdullah",
    role: "Scholarships & SOP Coordinator",
    bio: "Expert academic draftsman dedicated to structuring plagiarism-free, high-impact SOPs, Cover Letters, and merit portfolios.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
  }
];

export const FAQS = [
  {
    q: "How do I start my student application process with JEL Study Abroad?",
    a: "The steps are straightforward: First, fill out our consultation page, or book an appointment to walk into our Tejgaon office with your passports and transcripts. Our counselors will evaluate your academic history, gap, language scores, and budget, recommending the safe, moderate, and dream universities matching your target."
  },
  {
    q: "Do you offer conditional offer letters if my IELTS/PTE is missing?",
    a: "Yes! Many of our partner universities across the UK, Australia, and Canada can issue a Conditional Offer Letter while you prepare your IELTS/PTE exam. Once you submit the satisfactory score, the offer letter is converted to Unconditional, making you eligible to pay the tuition deposit."
  },
  {
    q: "What is the processing time for visa applications?",
    a: "Visa processing times vary widely by destination: Australia takes 2-6 weeks, the United Kingdom takes 3-4 weeks (priority option is 5 days), Canada can take 4-12 weeks, and European nations range from 4 to 8 weeks. JEL assists in booking biometrics early to meet critical intakes."
  },
  {
    q: "What are the scholarship opportunities and how does JEL support?",
    a: "Scholarships generally depend on academic performance (GPA, bachelor's score), test scores (IELTS/PTE), and a compelling SOP. JEL is a direct representative of 50+ universities, enabling fast-tracked merit award screenings. We guide you carefully on essays, recommendation requests, and timelines."
  },
  {
    q: "Do you help students find part-time jobs and accommodation abroad?",
    a: "Yes! JEL provides pre-departure briefings detailing work regulations (e.g., 20 hours/week in Canada / 48 hours per fortnight in Australia). We connect arriving cohorts with our network of active alumni already living in target cities so students can secure affordable housing and peer-to-peer job leads."
  }
];
