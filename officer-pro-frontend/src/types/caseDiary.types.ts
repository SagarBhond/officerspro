// Case Diary Type Definitions
// Mapped to Investigation and Case Diary Service Entities

export enum InvestigationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION'
}

export enum EvidenceType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  DOCUMENTARY = 'DOCUMENTARY',
  CHEMICAL = 'CHEMICAL',
  FORENSIC = 'FORENSIC',
  BIOLOGICAL = 'BIOLOGICAL',
  OTHER = 'OTHER'
}

// Investigation Entity - matches backend Investigation.java
export interface Investigation {
  investigationId: string; // Format: INV_MH_PNE_2025_000001
  firId: string; // Format: FIR_MH_PNE_2025_000001
  officerId: number;
  assignedOn: string; // ISO DateTime
  status: InvestigationStatus;
  description: string;
  createdBy: number;
  createdOn: string; // ISO DateTime
  updatedBy?: number;
  updatedOn?: string; // ISO DateTime
}

// CaseDiary Entity - matches backend CaseDiary.java
export interface CaseDiary {
  diaryId: number;
  investigationId: string; // Format: INV_MH_PNE_2025_000001
  entryDate: string; // ISO DateTime
  entryText: string; // TEXT field - can be long
  createdBy: number;
  createdOn: string; // ISO DateTime
  updatedBy?: number;
  updatedOn?: string; // ISO DateTime
}

// Evidence Entity - matches backend Evidence.java
export interface Evidence {
  evidenceId: number;
  investigationId: string; // Format: INV_MH_PNE_2025_000001
  investigationInternalId?: number; // Unique integer per investigation entry
  evidenceName: string;
  description?: string;
  evidenceType: string;
  locationFound?: string;
  collectedBy: string;
  fileType?: string;
  filePath?: string;
  fileSize?: number;
  createdBy: number;
  createdOn: string;
  updatedBy?: number;
  updatedOn?: string;
}

// Witness Entity - matches backend Witness.java
export interface Witness {
  witnessId: number;
  investigationId: string; // Format: INV_MH_PNE_2025_000001
  witnessName: string;
  witnessEmail?: string;
  witnessProfession?: string;
  witnessGender?: string;
  witnessAddress?: string;
  witnessAge?: number;
  witnessAadharNo?: string;
  witnessMobileNo: string;
  witnessStatement: string; // TEXT field
  witnessType?: string;
  aadharFilePath?: string;
  panFilePath?: string;
  passportFilePath?: string;
  createdBy: number;
  createdOn: string;
  updatedBy?: number;
  updatedOn?: string;
}

// Request DTOs
export interface CaseDiaryRequestDTO {
  investigationId: string; // Format: INV_MH_PNE_2025_000001
  entryDate: string; // ISO DateTime
  entryText: string;
}

export interface InvestigationRequestDTO {
  firId: string; // Format: FIR_MH_PNE_2025_000001
  officerId: number;
  assignedOn: string;
  status: InvestigationStatus;
  description: string;
}

export interface EvidenceRequestDTO {
  investigationId?: string; // Format: INV_MH_PNE_2025_000001
  investigationInternalId?: number; // Unique integer per investigation entry
  evidenceName?: string; // Made optional - backend will use original filename if null
  description?: string;
  evidenceType: string;
  locationFound?: string;
  collectedBy?: string;
  collectedOn?: string;
  fileType?: string;
}

export interface WitnessRequestDTO {
  investigationId: string; // Format: INV_MH_PNE_2025_000001
  witnessName: string;
  witnessEmail?: string;
  witnessProfession?: string;
  witnessGender?: string;
  witnessAddress?: string;
  witnessAge?: number;
  witnessAadharNo?: string;
  witnessMobileNo: string;
  witnessStatement: string;
  witnessType?: string;
  createdBy: number;
}

// Response DTOs - matches backend CaseDiaryResponseDTO.java
export interface CaseDiaryResponseDTO {
  investigationDetailsList: InvestigationDTO[];
  victimList: VictimInfoDTO[];
  officerName?: string;
  officerPost?: string;
  officerStation?: string;
  policeStation?: string;
  sectionId?: string;
  victimDetails?: string;
  crimeDateTime?: string;
  filingDateTime?: string;
  offenderDetails?: string;
  arrestStatus?: string;
  firNumber?: string;
  complaintId?: number;
}

export interface InvestigationDTO {
  internalId: number; // Unique database ID (primary key)
  investigationId: string; // Format: INV/MH/PNE/2025/000001
  firId: string; // Format: FIR_MH_PNE_2025_000001
  officerId: number;
  assignedOn: string;
  status: InvestigationStatus;
  description: string;
  createdBy: number;
  createdOn: string;
  updatedBy?: number;
  updatedOn?: string;
}

export interface VictimInfoDTO {
  caseStatus?: string;
  offenderList?: OffenderInfoDTO[];
  firId?: number;
  victimName?: string;
  victimId?: number;
}

export interface OffenderInfoDTO {
  offenderId: number;
  offenderName: string;
  arrestedStatus?: string;
}

// UI-specific interfaces for enhanced display
export interface CaseDiaryIndexItem {
  diaryId: number;
  investigationId: string; // Format: INV_MH_PNE_2025_000001
  victimName: string;
  offenderName: string;
  firNumber: string;
  registeredDate: string;
  sections: string[];
  shortDescription: string;
  status: InvestigationStatus;
  lastUpdated: string;
  diaryEntryCount: number;
}

export interface DiaryEntryWithDetails extends CaseDiary {
  officerName?: string;
  officerPost?: string;
  attachments?: Document[];
}

// Filters for case diary search
export interface CaseDiaryFilters {
  searchQuery?: string;
  investigationId?: string; // Format: INV_MH_PNE_2025_000001
  startDate?: string;
  endDate?: string;
  status?: InvestigationStatus;
  firNumber?: string;
  victimName?: string;
  offenderName?: string;
  section?: string;
  page?: number;
  size?: number;
}

// Pagination response
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page
  first: boolean;
  last: boolean;
}

// Update DTO for investigation
export interface InvestigationUpdateDTO {
  firId: string; // Format: FIR_MH_PNE_2025_000001
  caseStatus: string;
  offenders: {
    offenderId: number;
    arrestedStatus: string;
  }[];
}
