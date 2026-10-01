import request from '../Service/axios_helper';

export type CaseStatus = 'REGISTERED' | 'IN_PROGRESS' | 'CLOSED';

export interface CourtCase {
  caseId: number;
  caseNumber: string;
  courtName: string;
  status: CaseStatus | string;
  createdOn: string;
  currentChargesheetId?: string | null;
  courtTrackingId?: string | null;
  chargesheetId?: string | null;
  firId?: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Hearing {
  hearingId: number;
  caseId: number;
  scheduledAt: string;
  status: string;
  venue?: string;
}

export interface HearingParticipant {
  id: number;
  participantId?: number;
  name: string;
  role: string;
}

export interface Summons {
  summonsId: number;
  caseId: number;
  hearingId: number;
  status: string;
  recipientType?: string;
  recipientId?: number;
  recipientName?: string;
  appearanceDate?: string;
  issuedAt?: string;
}

export interface Judgment {
  judgmentId: number;
  caseId: number;
  hearingId: number;
  summary: string;
  outcome: string;
  judgmentDate?: string;
}

export interface DocumentItem {
  mappingId: number;
  documentId: number;
  documentType?: string;
  source: string;
  sourceId?: string;
}

export interface ChargesheetDocument {
  documentId: number;
  fileName?: string;
  fileUrl?: string;
  linkedTo?: string;
  linkId?: string;
}

export interface ChargesheetSummary {
  chargesheetId: string;
  ferristId?: string;
  firId: string;
  investigationId?: string;
  versionNumber?: number;
  isSubmitted?: boolean;
  courtName?: string;
  hearingDate?: string;
  remarks?: string;
  createdAt?: string;
  submittedAt?: string;
  documentId?: number;  // Single merged document ID
}

export interface FirChargesheet {
  firId: string;
  chargesheets: ChargesheetSummary[];
}

const buildQuery = (params: Record<string, string | number | boolean | undefined | null>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const ccmsApi = {
  listCases: async (params: {
    status?: string;
    caseNumber?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<PagedResponse<CourtCase>> => {
    const query = buildQuery(params);
    return request('ccms', 'GET', `/courtcases${query}`, null);
  },

  createCase: async (payload: {
    caseNumber: string;
    courtName: string;
    chargesheetId?: string;
    firId?: string;
    courtTrackingId?: string;
  }): Promise<CourtCase> => {
    return request('ccms', 'POST', '/courtcases', payload);
  },

  getCase: async (caseId: number | string): Promise<CourtCase> => {
    return request('ccms', 'GET', `/courtcases/${caseId}`, null);
  },

  deleteCase: async (caseId: number | string): Promise<void> => {
    await request('ccms', 'DELETE', `/courtcases/${caseId}`, null);
  },

  updateCase: async (caseId: number | string, payload: Partial<CourtCase>): Promise<CourtCase> => {
    return request('ccms', 'PUT', `/courtcases/${caseId}`, payload);
  },

  listHearings: async (caseId: number | string, status?: string): Promise<Hearing[]> => {
    const query = buildQuery({ status });
    return request('ccms', 'GET', `/courtcases/${caseId}/hearings${query}`, null);
  },

  createHearing: async (
    caseId: number | string,
    payload: { scheduledAt: string; venue?: string },
  ): Promise<Hearing> => {
    return request('ccms', 'POST', `/courtcases/${caseId}/hearings`, payload);
  },

  updateHearing: async (
    caseId: number | string,
    hearingId: number | string,
    payload: { scheduledAt: string; venue?: string },
  ): Promise<Hearing> => {
    return request('ccms', 'PUT', `/courtcases/${caseId}/hearings/${hearingId}`, payload);
  },

  updateHearingStatus: async (
    caseId: number | string,
    hearingId: number | string,
    status: string,
  ): Promise<Hearing> => {
    return request('ccms', 'PATCH', `/courtcases/${caseId}/hearings/${hearingId}/status`, {
      status,
    });
  },

  deleteHearing: async (caseId: number | string, hearingId: number | string): Promise<void> => {
    await request('ccms', 'DELETE', `/courtcases/${caseId}/hearings/${hearingId}`, null);
  },

  // Participant Management APIs
  listParticipants: async (
    caseId: number | string,
    hearingId: number | string,
  ): Promise<HearingParticipant[]> => {
    return request('ccms', 'GET', `/courtcases/${caseId}/hearings/${hearingId}/participants`, null);
  },

  addParticipant: async (
    caseId: number | string,
    hearingId: number | string,
    payload: { name: string; role: string },
  ): Promise<HearingParticipant> => {
    return request('ccms', 'POST', `/courtcases/${caseId}/hearings/${hearingId}/participants`, payload);
  },

  deleteParticipant: async (
    caseId: number | string,
    hearingId: number | string,
    participantId: number | string,
  ): Promise<void> => {
    await request(
      'ccms',
      'DELETE',
      `/courtcases/${caseId}/hearings/${hearingId}/participants/${participantId}`,
      null,
    );
  },

  // Get participants for summons (helper endpoint)
  getParticipantsForSummons: async (
    caseId: number | string,
    hearingId: number | string,
  ): Promise<HearingParticipant[]> => {
    return request('ccms', 'GET', `/summon/courtcases/${caseId}/hearings/${hearingId}/participants`, null);
  },

  listSummons: async (
    caseId: number | string,
    hearingId: number | string,
  ): Promise<Summons[]> => {
    return request(
      'ccms',
      'GET',
      `/summon/courtcases/${caseId}/hearings/${hearingId}/summons`,
      null,
    );
  },

  createSummons: async (
    caseId: number | string,
    hearingId: number | string,
    payload: { recipientId: number; recipientType: string; appearanceDate: string },
  ): Promise<Summons> => {
    return request(
      'ccms',
      'POST',
      `/summon/courtcases/${caseId}/hearings/${hearingId}/summons`,
      payload,
    );
  },

  updateSummons: async (
    caseId: number | string,
    hearingId: number | string,
    summonsId: number | string,
    payload: { recipientId?: number; recipientType?: string; appearanceDate?: string },
  ): Promise<Summons> => {
    return request(
      'ccms',
      'PUT',
      `/summon/courtcases/${caseId}/hearings/${hearingId}/summons/${summonsId}`,
      payload,
    );
  },

  updateSummonsStatus: async (
    caseId: number | string,
    hearingId: number | string,
    summonsId: number | string,
    status: string,
  ): Promise<Summons> => {
    return request(
      'ccms',
      'PATCH',
      `/summon/courtcases/${caseId}/hearings/${hearingId}/summons/${summonsId}/status`,
      { status },
    );
  },

  deleteSummons: async (
    caseId: number | string,
    hearingId: number | string,
    summonsId: number | string,
  ): Promise<void> => {
    await request(
      'ccms',
      'DELETE',
      `/summon/courtcases/${caseId}/hearings/${hearingId}/summons/${summonsId}`,
      null,
    );
  },

  listJudgments: async (
    caseId: number | string,
    hearingId: number | string,
  ): Promise<Judgment[]> => {
    return request(
      'ccms',
      'GET',
      `/judgement/courtcases/${caseId}/hearings/${hearingId}/judgments`,
      null,
    );
  },

  createJudgment: async (
    caseId: number | string,
    hearingId: number | string,
    payload: { summary: string; outcome: string; judgmentDate?: string },
  ): Promise<Judgment> => {
    return request(
      'ccms',
      'POST',
      `/judgement/courtcases/${caseId}/hearings/${hearingId}/judgments`,
      payload,
    );
  },

  updateJudgment: async (
    caseId: number | string,
    hearingId: number | string,
    judgmentId: number | string,
    payload: { summary?: string; outcome?: string; judgmentDate?: string },
  ): Promise<Judgment> => {
    return request(
      'ccms',
      'PUT',
      `/judgement/courtcases/${caseId}/hearings/${hearingId}/judgments/${judgmentId}`,
      payload,
    );
  },

  getJudgment: async (
    caseId: number | string,
    hearingId: number | string,
    judgmentId: number | string,
  ): Promise<Judgment> => {
    return request(
      'ccms',
      'GET',
      `/judgement/courtcases/${caseId}/hearings/${hearingId}/judgments/${judgmentId}`,
      null,
    );
  },

  listDocuments: async (caseId: number | string): Promise<DocumentItem[]> => {
    return request('ccms', 'GET', `/courtcases/${caseId}/documents`, null);
  },

  addDocumentMapping: async (
    caseId: number | string,
    payload: { documentId: number; documentType?: string },
  ): Promise<{ mappingId: number; documentId: number; caseId: number }> => {
    return request('ccms', 'POST', `/courtcases/${caseId}/documents`, payload);
  },

  removeDocumentMapping: async (
    caseId: number | string,
    mappingId: number | string,
  ): Promise<void> => {
    await request('ccms', 'DELETE', `/courtcases/${caseId}/documents/${mappingId}`, null);
  },

  syncChargesheetDocuments: async (
    caseId: number | string,
    chargesheetId: string,
    payload: {
      replaceAll?: boolean;
      courtTrackingId?: string;
      documents?: Array<{ documentId: number; documentType?: string }>;
    },
  ): Promise<DocumentItem[]> => {
    return request(
      'ccms',
      'POST',
      `/courtcases/${caseId}/documents/chargesheets/${chargesheetId}/sync-docs`,
      payload,
    );
  },

  fetchDocumentsByChargesheet: async (
    chargesheetId: string,
  ): Promise<Array<{ documentId: number; fileName?: string; documentType?: string }>> => {
    const query = buildQuery({ linked_to: 'CHARGESHEET', link_id: chargesheetId });
    const path = query || `?linked_to=CHARGESHEET&link_id=${encodeURIComponent(chargesheetId)}`;
    return request('documents', 'GET', path, null);
  },

  // FIR and Chargesheet Integration APIs
  listFirChargesheets: async (firId?: string): Promise<FirChargesheet[]> => {
    const query = firId ? `?firId=${encodeURIComponent(firId)}` : '';
    return request('ccms', 'GET', `/integration/chargesheets${query}`, null);
  },

  getChargesheetDetails: async (chargesheetId: string): Promise<ChargesheetSummary> => {
    return request('ccms', 'GET', `/integration/chargesheets/${chargesheetId}`, null);
  },

  updateCurrentChargesheet: async (
    caseId: number | string,
    chargesheetId: string,
  ): Promise<CourtCase> => {
    return request('ccms', 'PATCH', `/courtcases/${caseId}/current-chargesheet`, {
      chargesheetId,
    });
  },

  // Sync court tracking ID from mock court API
  syncCourtTracking: async (caseId: number | string): Promise<CourtCase> => {
    return request('ccms', 'POST', `/courtcases/${caseId}/sync-tracking`, null);
  },

  // Sync hearings from mock court API
  syncHearings: async (caseId: number | string): Promise<void> => {
    return request('ccms', 'POST', `/courtcases/${caseId}/sync-hearings`, null);
  },

  // Sync judgments from mock court API
  syncJudgments: async (caseId: number | string): Promise<void> => {
    return request('ccms', 'POST', `/courtcases/${caseId}/sync-judgments`, null);
  },
};

export default ccmsApi;

