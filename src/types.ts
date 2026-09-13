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
  assignedCounselor?: string; // name or email of assigned counselor
  assignedAgent?: string;      // name or email of assigned agent
  notesHistory?: Array<{ id: string; author: string; text: string; date: string }>;
  documents?: Array<{ id: string; name: string; size: string; uploadedBy: string; date: string; fileType?: string }>;
  chats?: Array<{ id: string; sender: "student" | "counselor" | "admin" | "agent"; text: string; date: string }>;
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
  imageUrl?: string;
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

export type ApplicationStage = 
  | "DRAFT"
  | "DOCS_VERIFIED"
  | "APPLICATION_SUBMITTED"
  | "OFFER_ISSUED"
  | "INSURANCE_PAID"
  | "VISA_LODGED"
  | "APPROVED";

export interface ApplicationTask {
  id: string;
  title: string;
  description: string;
  status: "COMPLETED" | "PENDING" | "IN_REVIEW";
  dueDate?: string;
  actionUrl?: string;
}

export interface StudentApplicationStatus {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  targetCountry: string;
  targetUniversity: string;
  targetCourse: string;
  currentStage: ApplicationStage;
  completedStages: ApplicationStage[];
  stageProgressPercent: number;
  estimatedTimeline: {
    stage: ApplicationStage;
    targetDate: string;
    completedDate?: string;
    status: "done" | "current" | "upcoming";
  }[];
  pendingTasks: ApplicationTask[];
  completedTasks: ApplicationTask[];
  assignedCounselor: {
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  };
  lastUpdated: string;
  timelineNotes?: string;
}
