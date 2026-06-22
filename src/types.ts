export interface Lead {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  preferredCountry: string;
  educationLevel: string;
  message: string;
  status: "New" | "Contacted" | "In Assessment" | "Uni Approved" | "Visa Pending" | "Visa Approved" | "Completed" | "No Response";
  notes?: string;
  createdAt: string;
}

export interface Scholarship {
  id: string;
  title: string;
  country: string;
  coverage: string;
  eligibility: string;
  deadline: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  photoUrl: string;
  destinationCountry: string;
  universityName: string;
  course: string;
  review: string;
  rating: number;
}

export interface BlogItem {
  id: string;
  title: string;
  category: "Guides" | "Visa Updates" | "Scholarship News" | "Success Stories";
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
}

export interface CountryData {
  id: string;
  name: string;
  code: string;
  flag: string;
  tuitionRange: string;
  workOpportunities: string;
  popularUniversities: string[];
  description: string;
}

export interface PartnerUniversity {
  id: string;
  name: string;
  country: string;
  ranking: string;
  logoLetter: string;
  popularPrograms: string[];
  scholarshipAvailable: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface CourseRecommendation {
  courseName: string;
  university: string;
  country: string;
  duration: string;
  approxTuition: string;
  reason: string;
}
