// ============================================================================
// JL STUDY ABROAD - APPLICATION TRACKING ENGINE DATA ARCHITECTURE
// Brand: Journey Expert Limited (JEL)
// Specification: Real-time Student Application Lifecycle State Engine
// ============================================================================

/**
 * APPLICATION LIFECYCLE STATE ENGINE:
 * DRAFT -> DOCS_VERIFIED -> APPLICATION_SUBMITTED -> OFFER_ISSUED -> INSURANCE_PAID -> VISA_LODGED -> APPROVED
 */

// ============================================================================
// OPTION A: PRISMA ORM SCHEMA (PostgreSQL / MySQL)
// File recommendation: prisma/schema.prisma
// ============================================================================
export const PRISMA_SCHEMA = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ApplicationStage {
  DRAFT
  DOCS_VERIFIED
  APPLICATION_SUBMITTED
  OFFER_ISSUED
  INSURANCE_PAID
  VISA_LODGED
  APPROVED
}

enum TaskStatus {
  PENDING
  IN_REVIEW
  COMPLETED
  REJECTED
}

enum DocVerificationStatus {
  PENDING
  VERIFIED
  REJECTED
  RESUBMISSION_REQUESTED
}

model Student {
  id              String           @id @default(uuid())
  email           String           @unique
  fullName        String
  phone           String
  avatarUrl       String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  applications    Application[]
  documents       StudentDocument[]
  notifications   NotificationLog[]
}

model Counselor {
  id            String         @id @default(uuid())
  email         String         @unique
  fullName      String
  phone         String
  role          String         @default("Senior GTE Counselor")
  applications  Application[]
}

model Application {
  id                    String            @id @default(uuid())
  applicationNumber     String            @unique // e.g. APP-JEL-2026-8812
  studentId             String
  student               Student           @relation(fields: [studentId], references: [id], onDelete: Cascade)
  counselorId           String?
  counselor             Counselor?        @relation(fields: [counselorId], references: [id])
  
  // Destination Details
  targetCountry         String
  targetUniversity      String
  targetCourse          String
  intakeTerm            String            // e.g. "September 2026"
  
  // State Machine Engine
  currentStage          ApplicationStage  @default(DRAFT)
  completedStages       ApplicationStage[]
  stageProgressPercent  Int               @default(14)
  timelineNotes         String?
  
  // Relations
  timelineMilestones    TimelineMilestone[]
  tasks                 ApplicationTask[]
  documents             StudentDocument[]
  statusAudits          StatusAuditTrail[]

  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  @@index([studentId])
  @@index([currentStage])
}

model TimelineMilestone {
  id              String            @id @default(uuid())
  applicationId   String
  application     Application       @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  stage           ApplicationStage
  status          String            // "done", "current", "upcoming"
  targetDate      DateTime
  completedDate   DateTime?
  notes           String?

  @@index([applicationId, stage])
}

model ApplicationTask {
  id              String            @id @default(uuid())
  applicationId   String
  application     Application       @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  title           String
  description     String
  status          TaskStatus        @default(PENDING)
  dueDate         DateTime?
  actionUrl       String?
  completedAt     DateTime?
  createdAt       DateTime          @default(now())

  @@index([applicationId])
}

model StudentDocument {
  id              String                @id @default(uuid())
  studentId       String
  student         Student               @relation(fields: [studentId], references: [id], onDelete: Cascade)
  applicationId   String?
  application     Application?          @relation(fields: [applicationId], references: [id])
  docType         String                // "ACADEMIC_TRANSCRIPT", "PASSPORT", "IELTS_TRF", "BANK_SOLVENCY", "SOP"
  fileName        String
  fileSize        Int
  storagePath     String                // Encrypted S3/Cloud Storage object key
  checksumSha256  String                // File integrity verification
  status          DocVerificationStatus @default(PENDING)
  verifiedBy      String?
  verifiedAt      DateTime?
  rejectionReason String?
  createdAt       DateTime              @default(now())

  @@index([studentId])
}

model StatusAuditTrail {
  id              String            @id @default(uuid())
  applicationId   String
  application     Application       @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  fromStage       ApplicationStage
  toStage         ApplicationStage
  changedByUserId String
  changedByName   String
  reasonNote      String?
  ipAddress       String?
  createdAt       DateTime          @default(now())

  @@index([applicationId])
}

model NotificationLog {
  id              String            @id @default(uuid())
  studentId       String
  student         Student           @relation(fields: [studentId], references: [id], onDelete: Cascade)
  channel         String            // "WHATSAPP", "EMAIL", "SMS"
  recipient       String
  stageTrigger    ApplicationStage
  messageSnippet  String
  deliveryStatus  String            // "DELIVERED", "FAILED", "PENDING"
  providerTxId    String?
  createdAt       DateTime          @default(now())

  @@index([studentId])
}
`;

// ============================================================================
// OPTION B: RAW POSTGRESQL DDL MIGRATION SCRIPT
// ============================================================================
export const POSTGRESQL_DDL = `
-- PostgreSQL DDL for JL Study Abroad Application Tracking Engine
CREATE TYPE application_stage AS ENUM (
  'DRAFT',
  'DOCS_VERIFIED',
  'APPLICATION_SUBMITTED',
  'OFFER_ISSUED',
  'INSURANCE_PAID',
  'VISA_LODGED',
  'APPROVED'
);

CREATE TYPE task_status AS ENUM ('PENDING', 'IN_REVIEW', 'COMPLETED', 'REJECTED');
CREATE TYPE doc_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'RESUBMISSION_REQUESTED');

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number VARCHAR(100) UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  counselor_name VARCHAR(255) DEFAULT 'Jahan Mim (Lead GTE Officer)',
  counselor_phone VARCHAR(50) DEFAULT '+8801926400400',
  target_country VARCHAR(100) NOT NULL,
  target_university VARCHAR(255) NOT NULL,
  target_course VARCHAR(255) NOT NULL,
  current_stage application_stage DEFAULT 'DRAFT',
  stage_progress_percent INT DEFAULT 14,
  timeline_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE application_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status task_status DEFAULT 'PENDING',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  doc_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  status doc_status DEFAULT 'PENDING',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE application_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_stage application_stage NOT NULL,
  to_stage application_stage NOT NULL,
  changed_by VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

// ============================================================================
// OPTION C: MONGODB / MONGOOSE SCHEMA
// ============================================================================
export const MONGOOSE_SCHEMA_CODE = `
import mongoose, { Schema, Document } from 'mongoose';

export const STAGES = [
  'DRAFT',
  'DOCS_VERIFIED',
  'APPLICATION_SUBMITTED',
  'OFFER_ISSUED',
  'INSURANCE_PAID',
  'VISA_LODGED',
  'APPROVED'
] as const;

export interface IApplication extends Document {
  applicationNumber: string;
  student: {
    name: string;
    email: string;
    phone: string;
  };
  destination: {
    country: string;
    university: string;
    course: string;
  };
  lifecycle: {
    currentStage: typeof STAGES[number];
    completedStages: typeof STAGES[number][];
    progressPercent: number;
    timelineNotes?: string;
  };
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED';
    dueDate?: Date;
  }>;
  assignedCounselor: {
    name: string;
    email: string;
    phone: string;
  };
  auditTrail: Array<{
    fromStage: string;
    toStage: string;
    changedBy: string;
    timestamp: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  applicationNumber: { type: String, required: true, unique: true, index: true },
  student: {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true }
  },
  destination: {
    country: { type: String, required: true },
    university: { type: String, required: true },
    course: { type: String, required: true }
  },
  lifecycle: {
    currentStage: { type: String, enum: STAGES, default: 'DRAFT', index: true },
    completedStages: [{ type: String, enum: STAGES }],
    progressPercent: { type: Number, default: 14 },
    timelineNotes: { type: String }
  },
  tasks: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'IN_REVIEW', 'COMPLETED'], default: 'PENDING' },
    dueDate: { type: Date }
  }],
  assignedCounselor: {
    name: { type: String, default: 'Jahan Mim (Lead GTE Officer)' },
    email: { type: String, default: 'journeyexpertbd@gmail.com' },
    phone: { type: String, default: '+8801926400400' }
  },
  auditTrail: [{
    fromStage: { type: String, required: true },
    toStage: { type: String, required: true },
    changedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
  }]
}, { timestamps: true });

export const ApplicationModel = mongoose.model<IApplication>('Application', ApplicationSchema);
`;
