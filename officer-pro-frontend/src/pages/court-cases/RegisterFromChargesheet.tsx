import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layout/DefaultLayout';
import Loader from '../../common/Loader';
import {
  ccmsApi,
  FirChargesheet,
  ChargesheetSummary,
  CourtCase,
  ChargesheetDocument,
} from '../../api/ccms';

type RegisterFromChargesheetPageProps = {
  handleLogout: () => void;
};

type RegisterFromChargesheetPanelProps = {
  showHeader?: boolean;
  onShowRegisteredCases?: () => void;
  onCaseRegistered?: () => void;
};

const chargesheetMockBase = import.meta.env.VITE_CHARGESHEET_MOCK_API || 'http://localhost:4001';
const documentServiceBase =
  import.meta.env.VITE_DOCUMENT_API || 'http://localhost:8087/api/documents';

const compareChargesheets = (a: ChargesheetSummary, b: ChargesheetSummary) => {
  const getTimestamp = (value?: string) => {
    if (!value) return 0;
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  // Sort by submittedAt (most recent first)
  const submittedDiff = getTimestamp(b.submittedAt) - getTimestamp(a.submittedAt);
  if (submittedDiff !== 0) return submittedDiff;

  // Then by version number
  const versionDiff = (b.versionNumber ?? 0) - (a.versionNumber ?? 0);
  if (versionDiff !== 0) return versionDiff;

  return (b.chargesheetId || '').localeCompare(a.chargesheetId || '');
};

const RegisterFromChargesheetPanel: React.FC<RegisterFromChargesheetPanelProps> = ({
  showHeader = true,
  onShowRegisteredCases,
  onCaseRegistered,
}) => {
  const navigate = useNavigate();

  const [firChargesheets, setFirChargesheets] = useState<FirChargesheet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedChargesheet, setSelectedChargesheet] = useState<ChargesheetSummary | null>(null);
  const [registeredCases, setRegisteredCases] = useState<CourtCase[]>([]);
  const [registeredFirLookup, setRegisteredFirLookup] = useState<Record<string, CourtCase>>({});
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formData, setFormData] = useState<{
    caseNumber: string;
    courtName: string;
    courtTrackingId: string;
  }>({
    caseNumber: '',
    courtName: '',
    courtTrackingId: '',
  });

  const availableFirCount = useMemo(() => {
    return firChargesheets.filter((fir) => !registeredFirLookup[fir.firId]).length;
  }, [firChargesheets, registeredFirLookup]);

  useEffect(() => {
    fetchFirChargesheets();
    loadRegisteredFirLookup();
  }, []);

  const fetchFirChargesheets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ccmsApi.listFirChargesheets();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('API returned non-array data:', data);
        setFirChargesheets([]);
        setError('Invalid data format received from server');
        return;
      }
      
      // Filter client-side to ensure only submitted chargesheets
      const filteredData = data.map((fir) => ({
        ...fir,
        chargesheets: (fir.chargesheets || [])
          .filter((cs) => cs.isSubmitted === true)
          .sort(compareChargesheets),
      }));
      setFirChargesheets(filteredData);
    } catch (err: any) {
      console.error('Failed to load FIR/Chargesheets', err);
      const message =
        err?.message || 'Failed to load FIR and chargesheet data. Please ensure chargesheet service is running.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadRegisteredFirLookup = async () => {
    try {
      const response = await ccmsApi.listCases({
        page: 0,
        size: 1000,
        sortBy: 'createdOn',
        sortDir: 'desc',
      });
      const lookup: Record<string, CourtCase> = {};
      response.content?.forEach((caseItem) => {
        if (caseItem.firId) {
          lookup[caseItem.firId] = caseItem;
        }
      });
      setRegisteredFirLookup(lookup);
    } catch (err) {
      console.error('Failed to load registered FIR lookup', err);
    }
  };

  const handleChargesheetSelect = async (chargesheet: ChargesheetSummary) => {
    setSelectedChargesheet(chargesheet);
    setShowRegisterForm(false);
    setFormError('');
    // Fetch registered cases for this chargesheet
    await fetchRegisteredCases(chargesheet.chargesheetId, chargesheet.firId);
  };

  const fetchRegisteredCases = async (chargesheetId: string, firId: string) => {
    try {
      const response = await ccmsApi.listCases({
        page: 0,
        size: 100,
      });
      // Filter cases by chargesheetId or firId
      const filtered = response.content.filter(
        (c) => c.chargesheetId === chargesheetId || c.firId === firId,
      );
      setRegisteredCases(filtered);
    } catch (err: any) {
      console.error('Failed to fetch registered cases', err);
    }
  };

  const handleRegisterCase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChargesheet) return;
    if (submitLoading) return;

    if (!formData.caseNumber.trim() || !formData.courtName.trim()) {
      setFormError('Case number and court name are required.');
      return;
    }

    try {
      setSubmitLoading(true);
      setFormError('');

      const payload = {
        caseNumber: formData.caseNumber.trim(),
        courtName: formData.courtName.trim(),
        chargesheetId: selectedChargesheet.chargesheetId,
        firId: selectedChargesheet.firId,
        courtTrackingId: formData.courtTrackingId.trim() || undefined,
      };

      const newCase = await ccmsApi.createCase(payload);

      // Auto-sync single document from chargesheet if available
      if (selectedChargesheet.documentId) {
        try {
          await ccmsApi.syncChargesheetDocuments(newCase.caseId, selectedChargesheet.chargesheetId, {
            replaceAll: false,
            documents: [
              {
                documentId: selectedChargesheet.documentId,
                documentType: 'CHARGESHEET',
              },
            ],
          });
        } catch (syncErr) {
          console.warn('Document sync failed, but case was created', syncErr);
        }
      }

      // Reset form and refresh
      setFormData({ caseNumber: '', courtName: '', courtTrackingId: '' });
      setShowRegisterForm(false);
      await fetchRegisteredCases(selectedChargesheet.chargesheetId, selectedChargesheet.firId);
      await loadRegisteredFirLookup();
      if (onCaseRegistered) {
        onCaseRegistered();
      }
    } catch (err: any) {
      console.error('Failed to register court case', err);
      const message =
        err.response?.data?.message || err.response?.data || err.message || 'Failed to register case.';
      setFormError(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleShowAllCases = () => {
    if (onShowRegisteredCases) {
      onShowRegisteredCases();
    } else {
      navigate('/court-cases');
    }
  };

  return (
    <>
      {showHeader && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Register Court Case from Chargesheet
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Select a FIR and chargesheet to register a new court case.
          </p>
        </div>
        <button
          onClick={handleShowAllCases}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-honolulublue hover:text-honolulublue dark:border-strokedark dark:text-white"
        >
          View All Cases
        </button>
        </div>
      )}

      <div className="space-y-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader fullScreen={false} />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={fetchFirChargesheets}
            className="rounded-md bg-honolulublue px-4 py-2 text-sm font-medium text-white hover:bg-honolulublue/90"
          >
            Retry
          </button>
        </div>
      ) : firChargesheets.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            No FIR or chargesheet data found. Please ensure the chargesheet service is running.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {availableFirCount === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-strokedark dark:bg-boxdark dark:text-slate-300">
              All available FIRs have already been registered as court cases. You can still review
              the FIR and chargesheet history below.
            </div>
          )}
          {/* FIR and Chargesheets List */}
          {firChargesheets.map((fir) => {
            const chargesheets = fir.chargesheets || [];
            const latestId = chargesheets[0]?.chargesheetId;
            const registeredCase = registeredFirLookup[fir.firId];
            const isFirRegistered = Boolean(registeredCase);
            const registeredCaseId = registeredCase?.caseId;
            const registeredCaseLabel = registeredCase?.caseNumber || registeredCaseId || 'Case';
            
            return (
              <div
                key={fir.firId}
                className={`rounded-lg border shadow-default ${
                  isFirRegistered
                    ? 'border-green-500 bg-green-50/50 dark:border-green-400 dark:bg-green-950/30'
                    : 'border-stroke bg-white dark:border-strokedark dark:bg-boxdark'
                }`}
              >
                <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                  <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            FIR: {fir.firId}
                          </h3>
                          {isFirRegistered && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-300">
                              Registered
                            </span>
                          )}
                        </div>
                      </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                        {chargesheets.length} Chargesheet{chargesheets.length !== 1 ? 's' : ''}
                      </span>
                      {isFirRegistered && registeredCaseId && (
                        <button
                          onClick={() => navigate(`/court-cases/${registeredCaseId}`)}
                          className="rounded-md border border-green-500 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-500/10 dark:border-green-400 dark:text-green-400"
                        >
                          View Court Case
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {isFirRegistered ? (
                    <div className="rounded-md border border-green-200 bg-green-50/50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
                      <p className="font-medium">
                        This FIR has already been registered as a court case.
                      </p>
                      <p className="mt-1 text-xs">
                        All chargesheets for this FIR are linked to the existing case. You can view
                        the case and manage chargesheets from there.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chargesheets.map((chargesheet) => {
                        const isLatest = chargesheet.chargesheetId === latestId;
                        return (
                          <div
                            key={chargesheet.chargesheetId}
                            className={`rounded-md border p-4 transition ${
                              selectedChargesheet?.chargesheetId === chargesheet.chargesheetId
                                ? 'border-honolulublue bg-honolulublue/5'
                                : 'border-stroke hover:border-honolulublue/50 dark:border-strokedark'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">
                                    {chargesheet.chargesheetId}
                                  </h4>
                                  {isLatest && (
                                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                                      Latest
                                    </span>
                                  )}
                                  {chargesheet.versionNumber && (
                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                      v{chargesheet.versionNumber}
                                    </span>
                                  )}
                                  {chargesheet.isSubmitted && (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-300">
                                      Submitted
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                                  {chargesheet.submittedAt && (
                                    <span>
                                      Submitted: {new Date(chargesheet.submittedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                  {chargesheet.courtName && (
                                    <span>Court: {chargesheet.courtName}</span>
                                  )}
                                  {chargesheet.documentId && (
                                    <span>Document #{chargesheet.documentId}</span>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <button
                                  onClick={() => handleChargesheetSelect(chargesheet)}
                                  className="rounded-md bg-honolulublue px-4 py-2 text-sm font-semibold text-white transition hover:bg-honolulublue/90"
                                >
                                  Register Court Case
                                </button>
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
          })}

          {/* Selected Chargesheet Details and Registration Form */}
          {selectedChargesheet && (
            <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Selected Chargesheet: {selectedChargesheet.chargesheetId}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      FIR: {selectedChargesheet.firId}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedChargesheet(null);
                      setShowRegisterForm(false);
                      setRegisteredCases([]);
                    }}
                    className="rounded-md px-3 py-1 text-sm font-medium text-slate-500 hover:text-honolulublue"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium text-slate-900 dark:text-white">
                      Chargesheet Details
                    </h4>
                    <div className="rounded-md bg-slate-50 p-4 text-sm dark:bg-slate-800">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedChargesheet.versionNumber && (
                          <div>
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              Version:
                            </span>{' '}
                            <span className="text-slate-900 dark:text-white">
                              {selectedChargesheet.versionNumber}
                            </span>
                          </div>
                        )}
                        {selectedChargesheet.submittedAt && (
                          <div>
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              Submitted At:
                            </span>{' '}
                            <span className="text-slate-900 dark:text-white">
                              {new Date(selectedChargesheet.submittedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {selectedChargesheet.courtName && (
                          <div>
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              Court:
                            </span>{' '}
                            <span className="text-slate-900 dark:text-white">
                              {selectedChargesheet.courtName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedChargesheet.documentId && (
                    <div>
                      <h4 className="mb-2 font-medium text-slate-900 dark:text-white">
                        Merged Chargesheet Document
                      </h4>
                      <div className="rounded-md border border-stroke dark:border-strokedark p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            Document ID: {selectedChargesheet.documentId}
                          </span>
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                            CHARGESHEET
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRegisterForm(true)}
                      className="rounded-md bg-honolulublue px-4 py-2 text-sm font-semibold text-white transition hover:bg-honolulublue/90"
                    >
                      Register New Court Case
                    </button>
                  </div>
                </div>

                {/* Registered Cases for this Chargesheet */}
                {registeredCases.length > 0 && (
                  <div className="mt-6">
                    <h4 className="mb-3 font-medium text-slate-900 dark:text-white">
                      Registered Court Cases ({registeredCases.length})
                    </h4>
                    <div className="rounded-md border border-stroke dark:border-strokedark">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                              <th className="px-4 py-2 text-left">Case Number</th>
                              <th className="px-4 py-2 text-left">Court</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Created On</th>
                              <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {registeredCases.map((courtCase) => (
                              <tr
                                key={courtCase.caseId}
                                className="border-b border-stroke dark:border-strokedark"
                              >
                                <td className="px-4 py-2 font-medium">{courtCase.caseNumber}</td>
                                <td className="px-4 py-2">{courtCase.courtName || '-'}</td>
                                <td className="px-4 py-2">
                                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                    {courtCase.status || 'UNKNOWN'}
                                  </span>
                                </td>
                                <td className="px-4 py-2">
                                  {courtCase.createdOn
                                    ? new Date(courtCase.createdOn).toLocaleString()
                                    : '—'}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() => navigate(`/court-cases/${courtCase.caseId}`)}
                                    className="rounded-md px-3 py-1 text-sm font-medium text-honolulublue hover:bg-honolulublue/10"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showRegisterForm && selectedChargesheet && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-stroke bg-white shadow-xl dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Register Court Case
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  FIR {selectedChargesheet.firId} · Chargesheet {selectedChargesheet.chargesheetId}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRegisterForm(false);
                  setFormError('');
                }}
                className="rounded-md px-3 py-1 text-sm font-medium text-slate-500 hover:text-honolulublue"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleRegisterCase} className="space-y-4 px-6 py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-200">
                    Case Number *
                  </label>
                  <input
                    type="text"
                    value={formData.caseNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, caseNumber: e.target.value }))
                    }
                    placeholder="Enter case number"
                    required
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-200">
                    Court Name *
                  </label>
                  <input
                    type="text"
                    value={formData.courtName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, courtName: e.target.value }))
                    }
                    placeholder="Enter court name"
                    required
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-200">
                    Court Tracking ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.courtTrackingId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, courtTrackingId: e.target.value }))
                    }
                    placeholder="Enter court tracking ID"
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                <p>
                  <strong>FIR ID:</strong> {selectedChargesheet.firId}
                </p>
                <p>
                  <strong>Chargesheet ID:</strong> {selectedChargesheet.chargesheetId}
                </p>
                {selectedChargesheet.documentId && (
                  <p className="mt-1">
                    <strong>Document:</strong> ID #{selectedChargesheet.documentId} will be automatically synced.
                  </p>
                )}
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setFormError('');
                  }}
                  className="rounded-md px-4 py-2 text-sm font-medium text-slate-500 hover:text-honolulublue dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="rounded-md bg-honolulublue px-4 py-2 text-sm font-semibold text-white transition hover:bg-honolulublue/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitLoading ? 'Registering...' : 'Register Court Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};


const RegisterFromChargesheet: React.FC<RegisterFromChargesheetPageProps> = ({ handleLogout }) => {
  const navigate = useNavigate();

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <RegisterFromChargesheetPanel
        onShowRegisteredCases={() => navigate('/court-cases')}
        onCaseRegistered={() => navigate('/court-cases')}
      />
    </DefaultLayout>
  );
};

export { RegisterFromChargesheetPanel };
export default RegisterFromChargesheet;