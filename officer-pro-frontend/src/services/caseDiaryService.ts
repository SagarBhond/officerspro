// Case Diary API Service
// All API calls to Investigation and Case Diary Service

import request from '../Service/axios_helper';
import type {
  CaseDiary,
  CaseDiaryRequestDTO,
  CaseDiaryResponseDTO,
  Investigation,
  InvestigationDTO,
  InvestigationRequestDTO,
  InvestigationUpdateDTO,
  Evidence,
  EvidenceRequestDTO,
  Witness,
  WitnessRequestDTO,
  PageResponse,
  CaseDiaryFilters
} from '../types/caseDiary.types';

const MICROSERVICE_NAME = 'investigation'; // Investigation and Case Diary Service

// ============================================
// CASE DIARY APIs
// ============================================

/**
 * Get all case diaries with optional filters and pagination
 */
export const getAllCaseDiaries = async (filters: CaseDiaryFilters = {}): Promise<PageResponse<CaseDiary>> => {
  const params = new URLSearchParams();
  
  if (filters.investigationId) params.append('investigationId', filters.investigationId.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('page', (filters.page || 0).toString());
  params.append('size', (filters.size || 10).toString());

  // Backend endpoint is /api/casediary
  const response = await request(MICROSERVICE_NAME, 'GET', `/casediary?${params.toString()}`, {});
  return response;
};

/**
 * Get case diary by victim ID (FIR ID)
 * Returns complete case information including investigation details
 */
export const getCaseDiaryByVictim = async (victimId: string): Promise<CaseDiaryResponseDTO> => {
  console.log('🔍 Fetching case diary for FIR ID:', victimId);
  // Backend endpoint is /api/investigation/getCaseDiary/{firId}
  const response = await request(MICROSERVICE_NAME, 'GET', `/investigation/getCaseDiary/${victimId}`, {});
  const responseData = response?.data || response;
  return responseData;
};

/**
 * Get all diary entries for a specific investigation
 */
export const getDiariesByInvestigation = async (investigationId: string): Promise<CaseDiary[]> => {
  // Backend endpoint is /api/casediary/investigation/{investigationId}
  const response = await request(MICROSERVICE_NAME, 'GET', `/casediary/investigation/${investigationId}`, {});
  return response;
};

/**
 * Get single diary entry by ID
 */
export const getCaseDiaryById = async (diaryId: number): Promise<CaseDiary> => {
  // Backend endpoint is /api/casediary/{id}
  const response = await request(MICROSERVICE_NAME, 'GET', `/casediary/${diaryId}`, {});
  return response;
};

/**
 * Create new case diary entry
 */
export const createCaseDiary = async (data: CaseDiaryRequestDTO): Promise<CaseDiary> => {
  console.log('📝 Creating case diary entry:', data);
  // Backend endpoint is /api/casediary
  const response = await request(MICROSERVICE_NAME, 'POST', '/casediary', data);
  const responseData = response?.data || response;
  return responseData;
};

/**
 * Update existing case diary entry
 */
export const updateCaseDiary = async (diaryId: number, data: CaseDiaryRequestDTO): Promise<CaseDiary> => {
  console.log('✏️ Updating case diary:', diaryId, data);
  // Backend endpoint is /api/casediary/{id}
  const response = await request(MICROSERVICE_NAME, 'PUT', `/casediary/${diaryId}`, data);
  return response;
};

/**
 * Delete case diary entry
 */
export const deleteCaseDiary = async (diaryId: number): Promise<void> => {
  console.log('🗑️ Deleting case diary:', diaryId);
  // Backend endpoint is /api/casediary/{id}
  await request(MICROSERVICE_NAME, 'DELETE', `/casediary/${diaryId}`, {});
};

/**
 * Search case diaries by keyword
 */
export const searchCaseDiaries = async (keyword: string, page = 0, size = 10): Promise<PageResponse<CaseDiary>> => {
  const params = new URLSearchParams({
    keyword,
    page: page.toString(),
    size: size.toString()
  });
  // Backend endpoint is /api/casediary/search
  const response = await request(MICROSERVICE_NAME, 'GET', `/casediary/search?${params.toString()}`, {});
  return response;
};

/**
 * Count diary entries by investigation
 */
export const countDiariesByInvestigation = async (investigationId: string): Promise<number> => {
  // Backend endpoint is /api/casediary/count/investigation/{investigationId}
  const response = await request(MICROSERVICE_NAME, 'GET', `/casediary/count/investigation/${investigationId}`, {});
  return response;
};

// ============================================
// INVESTIGATION APIs
// ============================================

/**
 * Create new investigation
 */
export const createInvestigation = async (data: InvestigationRequestDTO): Promise<InvestigationDTO> => {
  console.log('🔍 Creating investigation:', data);
  // Backend endpoint is /api/investigation/new
  const response = await request(MICROSERVICE_NAME, 'POST', '/investigation/new', data);
  // axios_helper returns response.data directly, so no need to unwrap
  console.log('🔍 Investigation response:', response);
  return response;
};

/**
 * Update investigation (Frontend Integration)
 */
export const updateInvestigation = async (data: InvestigationUpdateDTO): Promise<string> => {
  console.log('🔄 Updating investigation:', data);
  // Backend endpoint is /api/investigation/updateInvestigation
  const response = await request(MICROSERVICE_NAME, 'POST', '/investigation/updateInvestigation', data);
  const responseData = response?.data || response;
  return responseData;
};

/**
 * Get investigation by ID
 */
export const getInvestigationById = async (investigationId: string): Promise<Investigation> => {
  // Backend endpoint is /api/investigation/{investigationId}
  const response = await request(MICROSERVICE_NAME, 'GET', `/investigation/${investigationId}`, {});
  const responseData = response?.data || response;
  return responseData;
};

// ============================================
// EVIDENCE APIs
// ============================================

/**
 * Get all evidence for an investigation
 */
export const getEvidenceByInvestigation = async (investigationId: string): Promise<Evidence[]> => {
  // Backend endpoint is /api/evidence/investigation/{investigationId}
  const response = await request(MICROSERVICE_NAME, 'GET', `/evidence/investigation/${investigationId}`, {});
  return response;
};

/**
 * Get all evidence for a specific investigation entry by internal ID
 * This returns evidence specific to one investigation entry, not shared across all entries
 */
export const getEvidenceByInternalId = async (internalId: number): Promise<Evidence[]> => {
  // Backend endpoint is /api/evidence/entry/{internalId}
  const response = await request(MICROSERVICE_NAME, 'GET', `/evidence/entry/${internalId}`, {});
  return response;
};

/**
 * Create new evidence
 */
export const createEvidence = async (data: EvidenceRequestDTO, file?: File): Promise<Evidence> => {
  console.log('📦 ===== CREATING EVIDENCE (Frontend) =====');
  console.log('📋 Evidence Data:', data);
  console.log('📁 File:', file ? file.name : 'No file');
  
  if (file) {
    // If file is provided, use FormData
    const formData = new FormData();
    const jsonString = JSON.stringify(data);
    console.log('📝 JSON String:', jsonString);
    
    formData.append('evidenceRequest', new Blob([jsonString], { type: 'application/json' }));
    formData.append('file', file);
    
    console.log('📤 Sending FormData with file to /evidence/create endpoint');
    console.log('📦 FormData contents:');
    formData.forEach((value, key) => {
      console.log(`  - ${key}:`, value);
    });
    
    // Backend endpoint is /api/evidence/create
    const response = await request(MICROSERVICE_NAME, 'POST', '/evidence/create', formData);
    console.log('✅ Evidence created response:', response);
    return response;
  } else {
    // No file, send JSON
    console.log('📤 Sending JSON (no file) to /evidence/create endpoint');
    // Backend endpoint is /api/evidence/create
    const response = await request(MICROSERVICE_NAME, 'POST', '/evidence/create', data);
    console.log('✅ Evidence created response:', response);
    return response;
  }
};

/**
 * Update evidence
 */
export const updateEvidence = async (evidenceId: number, data: EvidenceRequestDTO): Promise<Evidence> => {
  // Backend endpoint is /api/evidence/{evidenceId}
  const response = await request(MICROSERVICE_NAME, 'PUT', `/evidence/${evidenceId}`, data);
  return response;
};

/**
 * Delete evidence
 */
export const deleteEvidence = async (evidenceId: number): Promise<void> => {
  // Backend endpoint is /api/evidence/{evidenceId}
  await request(MICROSERVICE_NAME, 'DELETE', `/evidence/${evidenceId}`, {});
};

// ============================================
// WITNESS APIs
// ============================================

/**
 * Get all witnesses for an investigation
 */
export const getWitnessesByInvestigation = async (investigationId: string): Promise<Witness[]> => {
  // Backend endpoint is /api/witness/investigation/{investigationId}
  const response = await request(MICROSERVICE_NAME, 'GET', `/witness/investigation/${investigationId}`, {});
  return response;
};

/**
 * Create new witness
 */
export const createWitness = async (
  data: WitnessRequestDTO, 
  files?: { aadhar?: File; pan?: File; passport?: File }
): Promise<Witness> => {
  console.log('👤 Creating witness:', data);
  
  if (files && (files.aadhar || files.pan || files.passport)) {
    // If files are provided, use FormData
    const formData = new FormData();
    formData.append('witnessRequest', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    if (files.aadhar) formData.append('aadharFile', files.aadhar);
    if (files.pan) formData.append('panFile', files.pan);
    if (files.passport) formData.append('passportFile', files.passport);
    
    // Backend endpoint is /api/witness
    const response = await request(MICROSERVICE_NAME, 'POST', '/witness', formData);
    return response;
  } else {
    // No files, send JSON
    // Backend endpoint is /api/witness
    const response = await request(MICROSERVICE_NAME, 'POST', '/witness', data);
    return response;
  }
};

/**
 * Update witness
 */
export const updateWitness = async (witnessId: number, data: WitnessRequestDTO): Promise<Witness> => {
  // Backend endpoint is /api/witness/{witnessId}
  const response = await request(MICROSERVICE_NAME, 'PUT', `/witness/${witnessId}`, data);
  return response;
};

/**
 * Delete witness
 */
export const deleteWitness = async (witnessId: number): Promise<void> => {
  // Backend endpoint is /api/witness/{witnessId}
  await request(MICROSERVICE_NAME, 'DELETE', `/witness/${witnessId}`, {});
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for API (ISO format)
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};

/**
 * Parse date from API
 */
export const parseDateFromAPI = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Get current date/time in ISO format
 */
export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

// Export all as a single service object as well
export const caseDiaryService = {
  // Case Diary
  getAllCaseDiaries,
  getCaseDiaryByVictim,
  getDiariesByInvestigation,
  getCaseDiaryById,
  createCaseDiary,
  updateCaseDiary,
  deleteCaseDiary,
  searchCaseDiaries,
  countDiariesByInvestigation,
  
  // Investigation
  createInvestigation,
  updateInvestigation,
  getInvestigationById,
  
  // Evidence
  getEvidenceByInvestigation,
  getEvidenceByInternalId,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  
  // Witness
  getWitnessesByInvestigation,
  createWitness,
  updateWitness,
  deleteWitness,
  
  // Helpers
  formatDateForAPI,
  parseDateFromAPI,
  getCurrentDateTime
};

export default caseDiaryService;
