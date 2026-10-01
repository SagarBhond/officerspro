import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layout/DefaultLayout';
import Loader from '../../common/Loader';
import { ccmsApi, CourtCase } from '../../api/ccms';

type CourtCasesListProps = {
  handleLogout: () => void;
};

const statusOptions: Array<{ label: string; value: string }> = [
  { label: 'All', value: '' },
  { label: 'Registered', value: 'REGISTERED' },
  { label: 'Closed', value: 'CLOSED' },
];

const pageSizeOptions = [10, 20, 50];

const CourtCasesList: React.FC<CourtCasesListProps> = ({ handleLogout }) => {
  const navigate = useNavigate();

  const [cases, setCases] = useState<CourtCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [searchCaseNumber, setSearchCaseNumber] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [refreshToken, setRefreshToken] = useState(0);

  const totalPages = useMemo(() => {
    if (!pageSize) return 0;
    return Math.ceil(totalElements / pageSize);
  }, [totalElements, pageSize]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await ccmsApi.listCases({
          status: statusFilter,
          caseNumber: searchCaseNumber,
          page,
          size: pageSize,
          sortBy: 'createdOn',
          sortDir: 'desc',
        });

        setCases(response.content || []);
        setTotalElements(response.totalElements || 0);
      } catch (err: any) {
        console.error('Failed to load court cases', err);
        const message =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Failed to load court cases.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [statusFilter, searchCaseNumber, page, pageSize, refreshToken]);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const handleNavigateToDetail = (caseId: number) => {
    navigate(`/court-cases/${caseId}`);
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Court Cases
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Auto-registered court cases from submitted chargesheets.
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-200">
                Case Number
              </label>
              <input
                type="text"
                value={searchCaseNumber}
                onChange={(event) => setSearchCaseNumber(event.target.value)}
                placeholder="Search by case number"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1 md:w-48">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-200">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-honolulublue hover:text-honolulublue dark:border-strokedark dark:text-white"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchCaseNumber('');
                setStatusFilter('');
                setPage(0);
              }}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-500 hover:text-honolulublue dark:text-slate-300"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200">
            <span>Total cases:</span>
            <span className="font-semibold">{totalElements}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded-md border border-slate-200 px-2 py-1 focus:border-honolulublue focus:outline-none focus:ring-1 focus:ring-honolulublue dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader fullScreen={false} />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => {
                setPage(0);
                setLoading(true);
                setRefreshToken((prev) => prev + 1);
              }}
              className="rounded-md bg-honolulublue px-4 py-2 text-sm font-medium text-white hover:bg-honolulublue/90"
            >
              Retry
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              No court cases found. Court cases are automatically created when
              chargesheets are submitted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-stroke bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-strokedark dark:bg-slate-800 dark:text-slate-300">
                  <th className="px-6 py-3">FIR ID</th>
                  <th className="px-6 py-3">Case Number</th>
                  <th className="px-6 py-3">Current Chargesheet</th>
                  <th className="px-6 py-3">Court</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created On</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((courtCase) => (
                  <tr
                    key={courtCase.caseId}
                    className="border-b border-stroke text-sm text-slate-700 hover:bg-slate-50 dark:border-strokedark dark:text-slate-200 dark:hover:bg-boxdark/70"
                  >
                    <td className="px-6 py-3 font-medium">
                      {courtCase.firId || '-'}
                    </td>
                    <td className="px-6 py-3">{courtCase.caseNumber}</td>
                    <td className="px-6 py-3">
                      {courtCase.currentChargesheetId ||
                        courtCase.chargesheetId ||
                        '-'}
                    </td>
                    <td className="px-6 py-3">{courtCase.courtName || '-'}</td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                        {courtCase.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {courtCase.createdOn
                        ? new Date(courtCase.createdOn).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleNavigateToDetail(courtCase.caseId)}
                        className="rounded-md px-3 py-1 text-sm font-medium text-honolulublue hover:bg-honolulublue/10"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              Page {page + 1} of {Math.max(totalPages, 1)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
                className={`rounded-md px-3 py-1 ${
                  page === 0
                    ? 'cursor-not-allowed text-slate-400'
                    : 'text-honolulublue hover:bg-honolulublue/10'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))
                }
                disabled={page + 1 >= totalPages}
                className={`rounded-md px-3 py-1 ${
                  page + 1 >= totalPages
                    ? 'cursor-not-allowed text-slate-400'
                    : 'text-honolulublue hover:bg-honolulublue/10'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default CourtCasesList;
