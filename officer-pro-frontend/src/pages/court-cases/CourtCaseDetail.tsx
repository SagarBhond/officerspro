import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/DefaultLayout';
import Loader from '../../common/Loader';
import ccmsApi, {
  CourtCase,
  Hearing,
  Judgment,
  DocumentItem,
  ChargesheetSummary,
  HearingParticipant,
} from '../../api/ccms';
import { getSignedUrlString } from '../../services/documentService';

type CourtCaseDetailProps = {
  handleLogout: () => void;
};

type TabKey = 'overview' | 'hearings' | 'judgments' | 'documents';

const tabConfig: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'hearings', label: 'Hearings' },
  { key: 'judgments', label: 'Judgments' },
  { key: 'documents', label: 'Documents' },
];

const hearingStatuses = ['UPCOMING', 'COMPLETED'];

const participantRoles = ['JUDGE', 'LAWYER', 'OFFICER', 'WITNESS', 'ACCUSED'];

const compareChargesheets = (a?: ChargesheetSummary, b?: ChargesheetSummary) => {
  const filedA = a?.filedOn ? Date.parse(a.filedOn) : 0;
  const filedB = b?.filedOn ? Date.parse(b.filedOn) : 0;
  if (filedB !== filedA) {
    return filedB - filedA;
  }
  const versionA = a?.version ?? 0;
  const versionB = b?.version ?? 0;
  if (versionB !== versionA) {
    return versionB - versionA;
  }
  return (b?.chargesheetId || '').localeCompare(a?.chargesheetId || '');
};

const CourtCaseDetail: React.FC<CourtCaseDetailProps> = ({ handleLogout }) => {
  const { caseId: caseIdParam } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const caseId = caseIdParam ? Number(caseIdParam) : NaN;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [caseData, setCaseData] = useState<CourtCase | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [chargesheetHistory, setChargesheetHistory] = useState<ChargesheetSummary[]>([]);
  const [chargesheetHistoryLoading, setChargesheetHistoryLoading] = useState<boolean>(false);
  const [chargesheetHistoryError, setChargesheetHistoryError] = useState<string>('');

  useEffect(() => {
    if (!caseId || Number.isNaN(caseId)) {
      setError('Invalid case identifier.');
      setLoading(false);
      return;
    }

    const fetchCase = async () => {
      try {
        setLoading(true);
        setError('');
        const details = await ccmsApi.getCase(caseId);
        setCaseData(details);
      } catch (err: any) {
        console.error('Failed to fetch court case details', err);
        const message =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Unable to load court case.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [caseId]);

  useEffect(() => {
    if (!caseData?.firId) {
      setChargesheetHistory([]);
      setChargesheetHistoryError('');
      setChargesheetHistoryLoading(false);
      return;
    }
    let cancelled = false;
    const loadHistory = async () => {
      try {
        setChargesheetHistoryLoading(true);
        setChargesheetHistoryError('');
        const firList = await ccmsApi.listFirChargesheets(caseData.firId!);
        const matched = firList.find((fir) => fir.firId === caseData.firId);
        const ordered = (matched?.chargesheets || []).slice().sort(compareChargesheets);
        if (!cancelled) {
          setChargesheetHistory(ordered);
        }
      } catch (err: any) {
        if (!cancelled) {
          const message =
            err.response?.data?.message ||
            err.response?.data ||
            err.message ||
            'Unable to fetch chargesheet history.';
          setChargesheetHistoryError(message);
        }
      } finally {
        if (!cancelled) {
          setChargesheetHistoryLoading(false);
        }
      }
    };
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [caseData?.firId]);

  const chargesheetId = useMemo(() => caseData?.currentChargesheetId || caseData?.chargesheetId, [caseData]);

  const refreshCaseDetails = async () => {
    if (!caseId || Number.isNaN(caseId)) return;
    try {
      const updated = await ccmsApi.getCase(caseId);
      setCaseData(updated);
    } catch (err) {
      console.error('Failed to refresh case metadata', err);
    }
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/court-cases')}
            className="mb-2 text-sm font-medium text-honolulublue hover:underline"
          >
            ← Back to cases
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Case #{caseData?.caseNumber || caseIdParam}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Manage the entire lifecycle of this court case from a single workspace.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-honolulublue text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader fullScreen={false} />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-6 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : !caseData ? (
        <div className="rounded-lg border border-stroke bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-default dark:border-strokedark dark:bg-boxdark dark:text-slate-300">
          Nothing to display for this case.
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <OverviewSection
              caseId={caseId}
              caseData={caseData}
              refreshCase={refreshCaseDetails}
              chargesheetHistory={chargesheetHistory}
              chargesheetHistoryLoading={chargesheetHistoryLoading}
              chargesheetHistoryError={chargesheetHistoryError}
            />
          )}
          {activeTab === 'hearings' && (
            <HearingsSection caseId={caseId} refreshCase={refreshCaseDetails} />
          )}
          {activeTab === 'judgments' && <JudgmentsSection caseId={caseId} />}
          {activeTab === 'documents' && (
            <DocumentsSection
              caseId={caseId}
              chargesheetId={chargesheetId || ''}
              courtTrackingId={caseData.courtTrackingId || ''}
              refreshCase={refreshCaseDetails}
              chargesheetHistory={chargesheetHistory}
            />
          )}
        </>
      )}
    </DefaultLayout>
  );
};

const OverviewSection: React.FC<{
  caseId: number;
  caseData: CourtCase;
  refreshCase: () => Promise<void> | void;
  chargesheetHistory: ChargesheetSummary[];
  chargesheetHistoryLoading: boolean;
  chargesheetHistoryError: string;
}> = ({
  caseId,
  caseData,
  refreshCase,
  chargesheetHistory,
  chargesheetHistoryLoading,
  chargesheetHistoryError,
}) => {
  const currentChargesheetId = caseData.currentChargesheetId || caseData.chargesheetId;
  const [syncingTracking, setSyncingTracking] = useState(false);
  const [syncingHearings, setSyncingHearings] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [syncSuccess, setSyncSuccess] = useState('');

  const handleSyncTracking = async () => {
    try {
      setSyncingTracking(true);
      setSyncError('');
      setSyncSuccess('');
      await ccmsApi.syncCourtTracking(caseId);
      setSyncSuccess('Court tracking synced successfully!');
      await refreshCase();
    } catch (err: any) {
      console.error('Failed to sync court tracking', err);
      setSyncError(err.response?.data?.message || err.message || 'Failed to sync court tracking');
    } finally {
      setSyncingTracking(false);
    }
  };

  const handleSyncHearings = async () => {
    try {
      setSyncingHearings(true);
      setSyncError('');
      setSyncSuccess('');
      await ccmsApi.syncHearings(caseId);
      setSyncSuccess('Hearings synced successfully!');
    } catch (err: any) {
      console.error('Failed to sync hearings', err);
      setSyncError(err.response?.data?.message || err.message || 'Failed to sync hearings');
    } finally {
      setSyncingHearings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Case Summary</h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
            <InfoRow label="Case Number" value={caseData.caseNumber || '—'} />
            <InfoRow label="Court Name" value={caseData.courtName || '—'} />
            <InfoRow label="Status" value={caseData.status || '—'} badge />
            <InfoRow
              label="Registered On"
              value={caseData.createdOn ? new Date(caseData.createdOn).toLocaleString() : '—'}
            />
            <InfoRow label="Chargesheet ID" value={caseData.chargesheetId || '—'} />
            <InfoRow label="Current Chargesheet" value={caseData.currentChargesheetId || '—'} />
            <InfoRow label="FIR ID" value={caseData.firId || '—'} />
            <InfoRow label="Court Tracking ID" value={caseData.courtTrackingId || '—'} />
          </div>
          {syncError && (
            <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-200">
              {syncError}
            </div>
          )}
          {syncSuccess && (
            <div className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-200">
              {syncSuccess}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={handleSyncTracking}
              disabled={syncingTracking}
              className="rounded-md bg-honolulublue px-3 py-1.5 text-sm font-medium text-white transition hover:bg-honolulublue/90 disabled:opacity-50"
            >
              {syncingTracking ? 'Syncing...' : 'Sync Court Tracking'}
            </button>
            <button
              onClick={handleSyncHearings}
              disabled={syncingHearings}
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {syncingHearings ? 'Syncing...' : 'Sync Hearings'}
            </button>
            <button
              onClick={refreshCase}
               className="text-sm font-medium text-honolulublue hover:underline"
            >
              Refresh summary
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-white">
            Workflow checkpoints
          </h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>Use the Hearings tab to schedule and update all hearing events.</li>
            <li>Sync hearings from the court API to get latest updates.</li>
            <li>Record judgments for completed hearings only.</li>
            <li>Case status can be manually updated when the entire case is closed.</li>
            <li>
              Documents tab syncs chargesheet documents and allows manual linking of supporting files.
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Chargesheet history
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-300">
              FIR: {caseData.firId || '—'}
            </span>
          </div>
        </div>
        {chargesheetHistoryLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader fullScreen={false} />
          </div>
        ) : chargesheetHistoryError ? (
          <div className="px-6 py-6 text-sm text-red-500">{chargesheetHistoryError}</div>
        ) : chargesheetHistory.length === 0 ? (
          <div className="px-6 py-6 text-sm text-slate-500 dark:text-slate-300">
            No chargesheet versions found for this FIR. Ensure the chargesheet service mock is running.
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {chargesheetHistory.map((item, index) => {
              const isLatest = index === 0;
              const isCurrent = item.chargesheetId === currentChargesheetId;
              return (
                <div key={item.chargesheetId} className="px-6 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                          {item.chargesheetId}
                        </p>
                        {item.version && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                            v{item.version}
                          </span>
                        )}
                        {item.status && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                            {item.status}
                          </span>
                        )}
                        {isLatest && (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                            Latest on record
                          </span>
                        )}
                        {isCurrent && (
                          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                            Linked to this case
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Filed on:{' '}
                        {item.filedOn ? new Date(item.filedOn).toLocaleString() : 'Not recorded'}
                      </div>
                      {item.investigatingOfficer && (
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Officer: {item.investigatingOfficer}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {item.documentCount ?? 0} document{(item.documentCount ?? 0) === 1 ? '' : 's'}
                      </div>
                      {!isCurrent && (
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                `Switch to chargesheet ${item.chargesheetId}? This will update the current chargesheet for this case.`,
                              )
                            ) {
                              try {
                                await ccmsApi.updateCurrentChargesheet(caseId, item.chargesheetId);
                                await refreshCase();
                                // Sync documents from the new chargesheet (only add new ones)
                                try {
                                  const chargesheetDetails = await ccmsApi.getChargesheetDetails(
                                    item.chargesheetId,
                                  );
                                  if (chargesheetDetails && chargesheetDetails.documents && chargesheetDetails.documents.length > 0) {
                                    await ccmsApi.syncChargesheetDocuments(caseId, item.chargesheetId, {
                                      replaceAll: false, // Only add new documents, don't delete existing ones
                                      documents: chargesheetDetails.documents.map((doc) => ({
                                        documentId: doc.documentId,
                                        documentType: doc.linkedTo || 'CHARGESHEET',
                                      })),
                                    });
                                  }
                                } catch (docErr: any) {
                                  console.warn('Failed to sync documents for chargesheet:', docErr);
                                  // Continue even if document sync fails
                                }
                                await refreshCase();
                              } catch (err: any) {
                                alert(
                                  err.response?.data?.message ||
                                    err.message ||
                                    'Failed to switch chargesheet',
                                );
                              }
                            }
                          }}
                          className="rounded-md border border-honolulublue px-3 py-1 text-xs font-semibold text-honolulublue transition hover:bg-honolulublue/10"
                        >
                          Switch to this
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const HearingCard: React.FC<{
  caseId: number;
  hearing: Hearing;
  onStatusUpdate: (hearingId: number, status: string) => void;
}> = ({ caseId, hearing, onStatusUpdate }) => {
  const [participants, setParticipants] = useState<HearingParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<boolean>(false);
  const [showParticipantForm, setShowParticipantForm] = useState<boolean>(false);
  const [participantForm, setParticipantForm] = useState<{ name: string; role: string }>({
    name: '',
    role: 'WITNESS',
  });
  const [addingParticipant, setAddingParticipant] = useState<boolean>(false);

  const fetchParticipants = async () => {
    try {
      setLoadingParticipants(true);
      const list = await ccmsApi.listParticipants(caseId, hearing.hearingId);
      setParticipants(list || []);
    } catch (err: any) {
      console.error('Failed to load participants', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [caseId, hearing.hearingId]);

  const handleAddParticipant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!participantForm.name.trim() || !participantForm.role) return;
    try {
      setAddingParticipant(true);
      await ccmsApi.addParticipant(caseId, hearing.hearingId, {
        name: participantForm.name.trim(),
        role: participantForm.role,
      });
      setParticipantForm({ name: '', role: 'WITNESS' });
      setShowParticipantForm(false);
      await fetchParticipants();
    } catch (err: any) {
      console.error('Failed to add participant', err);
      alert(err.response?.data?.message || err.message || 'Failed to add participant');
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleDeleteParticipant = async (participantId: number) => {
    if (!confirm('Are you sure you want to remove this participant?')) return;
    try {
      await ccmsApi.deleteParticipant(caseId, hearing.hearingId, participantId);
      await fetchParticipants();
    } catch (err: any) {
      console.error('Failed to delete participant', err);
      alert(err.response?.data?.message || err.message || 'Failed to remove participant');
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Hearing #{hearing.hearingId}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Scheduled at{' '}
              <span className="font-medium">
                {hearing.scheduledAt ? new Date(hearing.scheduledAt).toLocaleString() : '—'}
              </span>
              {hearing.venue && <span className="ml-2">• {hearing.venue}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
              {hearing.status}
            </span>
            <select
              defaultValue=""
              onChange={(event) => {
                if (!event.target.value) return;
                onStatusUpdate(hearing.hearingId, event.target.value);
              }}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              <option value="">Update status</option>
              {hearingStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Participants Section */}
        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-strokedark dark:bg-slate-800/50">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Participants</h4>
            <button
              type="button"
              onClick={() => setShowParticipantForm(!showParticipantForm)}
              className="text-xs font-medium text-honolulublue hover:underline"
            >
              {showParticipantForm ? 'Cancel' : '+ Add Participant'}
            </button>
          </div>

          {showParticipantForm && (
            <form onSubmit={handleAddParticipant} className="mb-3 rounded-md bg-white p-3 dark:bg-boxdark">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-200">Name *</label>
                  <input
                    type="text"
                    value={participantForm.name}
                    onChange={(event) =>
                      setParticipantForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    required
                    placeholder="Enter participant name"
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-200">Role *</label>
                  <select
                    value={participantForm.role}
                    onChange={(event) =>
                      setParticipantForm((prev) => ({ ...prev, role: event.target.value }))
                    }
                    required
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
                  >
                    {participantRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={addingParticipant}
                    className="flex-1 rounded-md bg-honolulublue px-3 py-1 text-xs font-semibold text-white transition hover:bg-honolulublue/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {addingParticipant ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {loadingParticipants ? (
            <div className="py-2 text-center text-xs text-slate-500">
              <Loader fullScreen={false} />
            </div>
          ) : participants.length === 0 ? (
            <p className="py-2 text-xs text-slate-500 dark:text-slate-400">
              No participants added yet. Click "Add Participant" to add one.
            </p>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-boxdark"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {participant.name}
                    </span>
                    <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {participant.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteParticipant(participant.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HearingsSection: React.FC<{ caseId: number; refreshCase: () => Promise<void> | void }> = ({
  caseId,
  refreshCase,
}) => {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [syncSuccess, setSyncSuccess] = useState<string>('');

  const fetchHearings = async () => {
    try {
      setLoading(true);
      setError('');
      const list = await ccmsApi.listHearings(caseId);
      setHearings(list || []);
    } catch (err: any) {
      console.error('Failed to load hearings', err);
      const message =
        err.response?.data?.message || err.response?.data || err.message || 'Failed to load hearings.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, [caseId]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError('');
      setSyncSuccess('');
      await ccmsApi.syncHearings(caseId);
      setSyncSuccess('Hearings synced successfully from court API!');
      await fetchHearings();
      await refreshCase();
    } catch (err: any) {
      console.error('Failed to sync hearings', err);
      setError(err.response?.data?.message || err.message || 'Failed to sync hearings');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Court Hearings</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              Synced automatically from court tracking system
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Hearings'}
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}
        {syncSuccess && (
          <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-200">
            {syncSuccess}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hearing Schedule</h3>
        </div>
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader fullScreen={false} />
          </div>
        ) : hearings.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-300">
            No hearings found. Click "Sync Hearings" to fetch from court API.
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {hearings.map((hearing) => (
              <div key={hearing.hearingId} className="px-6 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      Hearing #{hearing.hearingId}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Scheduled: {hearing.scheduledAt ? new Date(hearing.scheduledAt).toLocaleString() : '—'}
                      {hearing.venue && <span className="ml-2">• {hearing.venue}</span>}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      hearing.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                    }`}
                  >
                    {hearing.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const JudgmentsSection: React.FC<{ caseId: number }> = ({ caseId }) => {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [syncSuccess, setSyncSuccess] = useState<string>('');

  const fetchHearingsAndJudgments = async () => {
    try {
      setLoading(true);
      setError('');
      // Get all hearings
      const hearingList = await ccmsApi.listHearings(caseId);
      setHearings(hearingList || []);
      
      // Get judgments for ALL hearings
      const allJudgments: Judgment[] = [];
      for (const hearing of (hearingList || [])) {
        try {
          const judgmentList = await ccmsApi.listJudgments(caseId, hearing.hearingId);
          if (judgmentList && judgmentList.length > 0) {
            allJudgments.push(...judgmentList);
          }
        } catch (err) {
          console.warn(`Failed to fetch judgments for hearing ${hearing.hearingId}`, err);
        }
      }
      setJudgments(allJudgments);
    } catch (err: any) {
      console.error('Failed to fetch hearings/judgments', err);
      setError(err.response?.data?.message || err.message || 'Failed to load judgments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearingsAndJudgments();
  }, [caseId]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError('');
      setSyncSuccess('');
      await ccmsApi.syncJudgments(caseId);
      setSyncSuccess('Judgments synced successfully from court API!');
      await fetchHearingsAndJudgments();
    } catch (err: any) {
      console.error('Failed to sync judgments', err);
      setError(err.response?.data?.message || err.message || 'Failed to sync judgments');
    } finally {
      setSyncing(false);
    }
  };

  // Group judgments by hearing for display
  const judgmentsByHearing = useMemo(() => {
    const grouped = new Map<number, { hearing: Hearing; judgments: Judgment[] }>();
    
    hearings.forEach(hearing => {
      // Only include COMPLETED hearings
      if (hearing.status === 'COMPLETED') {
        const hearingJudgments = judgments.filter(j => j.hearingId === hearing.hearingId);
        if (hearingJudgments.length > 0) {
          grouped.set(hearing.hearingId, { hearing, judgments: hearingJudgments });
        }
      }
    });
    
    return Array.from(grouped.values());
  }, [hearings, judgments]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Court Judgments</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              Synced automatically from court API • Only completed hearings
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Judgments'}
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}
        {syncSuccess && (
          <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-200">
            {syncSuccess}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Judgment History</h3>
        </div>
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader fullScreen={false} />
          </div>
        ) : judgmentsByHearing.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-300">
            No judgments found for completed hearings. Click "Sync Judgments" to fetch from court API.
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {judgmentsByHearing.map(({ hearing, judgments: hearingJudgments }) => (
              <div key={hearing.hearingId} className="px-6 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Hearing #{hearing.hearingId}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {hearing.scheduledAt ? new Date(hearing.scheduledAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                    {hearing.status}
                  </span>
                </div>
                {hearingJudgments.map((judgment) => (
                  <div
                    key={judgment.judgmentId}
                    className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-strokedark dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                          Judgment #{judgment.judgmentId}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          Outcome:{' '}
                          <span className="font-semibold text-honolulublue">{judgment.outcome || '—'}</span>
                        </p>
                        {judgment.judgmentDate && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Date: {new Date(judgment.judgmentDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-200">
                      {judgment.summary || 'No summary provided.'}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentsSection: React.FC<{
  caseId: number;
  chargesheetId: string;
  courtTrackingId: string;
  refreshCase: () => Promise<void> | void;
  chargesheetHistory: ChargesheetSummary[];
}> = ({ caseId, chargesheetId, courtTrackingId, refreshCase, chargesheetHistory }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedChargesheetFilter, setSelectedChargesheetFilter] = useState<string>('ALL');

  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncChargesheetId, setSyncChargesheetId] = useState<string>(chargesheetId || '');
  
  // Filter documents by selected chargesheet
  const filteredDocuments = useMemo(() => {
    if (selectedChargesheetFilter === 'ALL') {
      return documents;
    }
    return documents.filter((doc) => doc.sourceId === selectedChargesheetFilter);
  }, [documents, selectedChargesheetFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const list = await ccmsApi.listDocuments(caseId);
      setDocuments(list || []);
    } catch (err: any) {
      console.error('Failed to load documents', err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Failed to load documents.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const handleSync = async () => {
    if (!syncChargesheetId) {
      setError('Provide a chargesheet ID to sync documents.');
      return;
    }
    try {
      setSyncing(true);
      setError('');
      
      // First, fetch chargesheet details to get the documentId
      const chargesheetDetails = await ccmsApi.getChargesheetDetails(syncChargesheetId);
      
      if (!chargesheetDetails) {
        setError('Chargesheet not found. Please check the chargesheet ID.');
        setSyncing(false);
        return;
      }
      
      // Check if chargesheet has a documentId (the merged PDF)
      if (!chargesheetDetails.documentId) {
        setError('No document found in the chargesheet. The chargesheet may not have a merged PDF yet.');
        setSyncing(false);
        return;
      }
      
      // Sync the chargesheet's merged document
      await ccmsApi.syncChargesheetDocuments(caseId, syncChargesheetId, {
        replaceAll: false, // Only add new documents, don't delete existing ones
        courtTrackingId: courtTrackingId || undefined,
        documents: [{
          documentId: chargesheetDetails.documentId,
          documentType: 'CHARGESHEET',
        }],
      });
      await fetchDocuments();
      await refreshCase();
      setError(''); // Clear any previous errors on success
    } catch (err: any) {
      console.error('Failed to sync chargesheet documents', err);
      const errorMessage = err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Failed to sync chargesheet documents.';
      setError(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  const handleRemoveMapping = async (mappingId: number) => {
    try {
      setLoading(true);
      await ccmsApi.removeDocumentMapping(caseId, mappingId);
      await fetchDocuments();
    } catch (err: any) {
      console.error('Failed to delete document mapping', err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Failed to delete mapping.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sync Documents from Chargesheet</h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
          Documents are synced from the chargesheet and displayed here for viewing only.
        </p>

        <div className="mt-4">
          <div className="rounded-md border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Sync from chargesheet
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <input
                type="text"
                value={syncChargesheetId}
                onChange={(event) => setSyncChargesheetId(event.target.value)}
                placeholder="Chargesheet ID"
                className="rounded-md border border-slate-200 px-3 py-2 focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
              />
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {syncing ? 'Syncing...' : 'Sync from Document Service'}
              </button>
              {chargesheetId && (
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Current chargesheet: <span className="font-semibold">{chargesheetId}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Mapped Documents ({filteredDocuments.length} of {documents.length})
            </h3>
            {chargesheetHistory.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-200">
                  Filter by Chargesheet:
                </label>
                <select
                  value={selectedChargesheetFilter}
                  onChange={(event) => setSelectedChargesheetFilter(event.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
                >
                  <option value="ALL">All Chargesheets</option>
                  {chargesheetHistory.map((cs) => (
                    <option key={cs.chargesheetId} value={cs.chargesheetId}>
                      {cs.chargesheetId}
                      {cs.chargesheetId === chargesheetId ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader fullScreen={false} />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-300">
            {selectedChargesheetFilter === 'ALL'
              ? 'No documents mapped yet.'
              : `No documents found for the selected chargesheet.`}
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {filteredDocuments.map((document) => (
              <div
                key={document.mappingId}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {document.documentType || 'Document'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Source: <span className="font-semibold">{document.source} {document.sourceId ? `• ${document.sourceId}` : ''}</span>
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const url = await getSignedUrlString(document.documentId);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } catch (err) {
                      console.error('Failed to open document', err);
                    }
                  }}
                  className="rounded-md bg-honolulublue px-4 py-2 text-sm font-semibold text-white hover:bg-honolulublue/90"
                >
                  Preview
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string; badge?: boolean }> = ({
  label,
  value,
  badge,
}) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </span>
    {badge ? (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
        {value}
      </span>
    ) : (
      <span className="text-sm font-medium text-slate-700 dark:text-slate-100">{value}</span>
    )}
  </div>
);

export default CourtCaseDetail;

