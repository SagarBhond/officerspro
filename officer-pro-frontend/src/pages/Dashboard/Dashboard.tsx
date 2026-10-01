import React, { useEffect, useState, useMemo } from 'react';
import CardDataStats from '../../components/CardDataStats';
import DefaultLayout from '../../layout/DefaultLayout';
import Icon from '../../components/Icon';
import request from '../../Service/axios_helper';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../common/DateUtils';
import Pagination from '../Pagination';

type DashboardProps = {
  handleLogout: () => void;
};

const Dashboard: React.FC<DashboardProps> = ({ handleLogout }) => {
  const [firCasesCount, setFirCasesCount] = useState<string>('');
  const [ncCasesCount, setNcCasesCount] = useState<string>('');
  const [closedCasesCount, setClosedCasesCount] = useState<string>('');
  const [transferredCasesCount, setTransferredCasesCount] = useState<string>('');
  const [cases, setCases] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5); // Show 5 cases per page
  const { t } = useTranslation();
  const cards = t('cards') as any;
  const table = t('table') as any;
  const dashboard = t('dashboard') as any;

  const { FirCases = 'FIR Cases', TotalNC = 'Total NC', ClosedCases = 'Closed Cases', TransferredCases = 'Transferred Cases' } = cards || {};
  const {
    index,
    victimname,
    offendername,
    firno,
    reportdate,
    viewcase = 'View Case',
    search,
    norecords,
    show = 'Show',
    entries = 'entries',
  } = table || {};
  const { recentfir } = dashboard || {};

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const normalizeText = (text: string) => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    return text ? text.normalize('NFC').toLowerCase() : '';
  };

  // Helper function to check if a date matches the search query
  const checkDateMatch = (dateString: string | null | undefined, query: string): boolean => {
    if (!dateString || !query) return false;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Format the date using formatDate utility (DD/MM/YYYY format)
    const formattedDate = formatDate(dateString);
    if (!formattedDate) return false;
    
    // Check if query matches the formatted date directly
    if (formattedDate.toLowerCase().includes(normalizedQuery)) return true;
    
    // Split formatted date into components (day, month, year)
    const dateComponents = formattedDate.split('/');
    if (dateComponents.some(component => component.includes(normalizedQuery))) return true;
    
    // Try to parse the original date for additional formats
    try {
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        // Check various date formats
        const day = dateObj.getDate().toString();
        const dayPadded = day.padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString();
        const monthPadded = month.padStart(2, '0');
        const year = dateObj.getFullYear().toString();
        const yearShort = year.slice(-2);
        
        // Month names
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                          'july', 'august', 'september', 'october', 'november', 'december'];
        const monthShortNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                                'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthName = monthNames[dateObj.getMonth()];
        const monthShortName = monthShortNames[dateObj.getMonth()];
        
        // Check if query matches any date component
        if (day === normalizedQuery || dayPadded === normalizedQuery) return true;
        if (month === normalizedQuery || monthPadded === normalizedQuery) return true;
        if (year === normalizedQuery || yearShort === normalizedQuery) return true;
        if (monthName.includes(normalizedQuery) || monthShortName.includes(normalizedQuery)) return true;
        
        // Check common date formats
        const formats = [
          `${dayPadded}/${monthPadded}/${year}`,
          `${dayPadded}-${monthPadded}-${year}`,
          `${day}/${month}/${year}`,
          `${monthPadded}/${dayPadded}/${year}`,
          `${year}-${monthPadded}-${dayPadded}`,
        ];
        if (formats.some(f => f.includes(normalizedQuery))) return true;
      }
    } catch {
      // Ignore parsing errors
    }
    
    return false;
  };

  const filteredCases = cases.filter((item) => {
    // If no search query, return all cases
    if (!searchQuery) return true;
    
    const normalizedQuery = normalizeText(searchQuery);
    
    // Check all possible date fields
    const dateMatches = 
      checkDateMatch(item?.firRegisteredDate, searchQuery) ||
      checkDateMatch(item?.created_on, searchQuery) ||
      checkDateMatch(item?.createdOn, searchQuery) ||
      checkDateMatch(item?.filedDate, searchQuery) ||
      checkDateMatch(item?.updatedOn, searchQuery);

    return (
      normalizeText(item?.victimName || '').includes(normalizedQuery) ||
      normalizeText(item?.offenderName || '').includes(normalizedQuery) ||
      normalizeText(item?.firNo || '').includes(normalizedQuery) ||
      normalizeText(item?.status || '').includes(normalizedQuery) ||
      dateMatches
    );
  });

  // Paginated data
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredCases.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredCases, pageSize]);

  // Reset to page 1 when page size changes or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, searchQuery]);

  // Ensure current page doesn't exceed total pages
  useEffect(() => {
    const totalPages = Math.ceil(filteredCases.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredCases.length, pageSize, currentPage]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        console.log('Starting dashboard data fetch...');

        // Fetch FIR Cases count
        try {
          const firResponse = await request('dashboard', 'GET', '/fir-cases', {});
          const firData = firResponse?.data ?? firResponse;
          // Check if response is an error object (has status, error, message fields)
          if (firData && typeof firData === 'object' && ('status' in firData || 'error' in firData)) {
            console.warn('❌ FIR cases returned error:', firData);
            setFirCasesCount('0');
          } else if (typeof firData === 'number' || typeof firData === 'string') {
            setFirCasesCount(String(firData));
            console.log('✅ FIR cases:', firData);
          } else {
            setFirCasesCount('0');
          }
        } catch (error: any) {
          console.error('❌ FIR cases API failed:', error);
          setFirCasesCount('0');
        }

        // Fetch NC Cases count
        try {
          const ncResponse = await request('dashboard', 'GET', '/nc-cases', {});
          const ncData = ncResponse?.data ?? ncResponse;
          // Check if response is an error object
          if (ncData && typeof ncData === 'object' && ('status' in ncData || 'error' in ncData)) {
            console.warn('❌ NC cases returned error:', ncData);
            setNcCasesCount('0');
          } else if (typeof ncData === 'number' || typeof ncData === 'string') {
            setNcCasesCount(String(ncData));
            console.log('✅ NC cases:', ncData);
          } else {
            setNcCasesCount('0');
          }
        } catch (error: any) {
          console.error('❌ NC cases API failed:', error);
          setNcCasesCount('0');
        }

        // Fetch Closed Cases count
        try {
          const closedResponse = await request('dashboard', 'GET', '/closed-cases', {});
          const closedData = closedResponse?.data ?? closedResponse;
          // Check if response is an error object
          if (closedData && typeof closedData === 'object' && ('status' in closedData || 'error' in closedData)) {
            console.warn('❌ Closed cases returned error:', closedData);
            setClosedCasesCount('0');
          } else if (typeof closedData === 'number' || typeof closedData === 'string') {
            setClosedCasesCount(String(closedData));
            console.log('✅ Closed cases:', closedData);
          } else {
            setClosedCasesCount('0');
          }
        } catch (error: any) {
          console.error('❌ Closed cases API failed:', error);
          setClosedCasesCount('0');
        }

        // Fetch Transferred Cases count
        try {
          const transferredResponse = await request('dashboard', 'GET', '/transferred-cases', {});
          const transferredData = transferredResponse?.data ?? transferredResponse;
          // Check if response is an error object
          if (transferredData && typeof transferredData === 'object' && ('status' in transferredData || 'error' in transferredData)) {
            console.warn('❌ Transferred cases returned error:', transferredData);
            setTransferredCasesCount('0');
          } else if (typeof transferredData === 'number' || typeof transferredData === 'string') {
            setTransferredCasesCount(String(transferredData));
            console.log('✅ Transferred cases:', transferredData);
          } else {
            setTransferredCasesCount('0');
          }
        } catch (error: any) {
          console.error('❌ Transferred cases API failed:', error);
          setTransferredCasesCount('0');
        }

        console.log('✅ Dashboard stats loaded successfully');
      } catch (error: any) {
        console.error('❌ Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchCases();
    
    // Ensure loading is cleared after 10 seconds max
    const timeout = setTimeout(() => {
      console.warn('⚠️ Dashboard loading timeout - forcing UI to show');
      setLoading(false);
    }, 10000);

    // Also fetch again after a short delay to catch any async backend operations
    const delayedFetch = setTimeout(() => {
      console.log('🔄 Dashboard delayed fetch to catch async updates...');
      fetchCases();
    }, 1500);

    // Add listener for page visibility change (when user returns from another page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📄 Dashboard regained focus, refreshing data...');
        fetchCases();
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(delayedFetch);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchCases = async () => {
    try {
      console.log('🚀 Fetching cases from API with recent updates first...');
      // Fetch from complaintandfir service with sort by updatedOn (most recent first)
      let response = await request('complaintandfir', 'GET', '/statements?page=0&size=1000&sort=updatedOn,desc', {});
      let responseData = response?.data ?? response;
      
      // Unwrap nested data if needed
      if (responseData && responseData.data && !Array.isArray(responseData)) {
        const inner = responseData.data;
        if (inner && !Array.isArray(inner)) {
          responseData = inner;
        }
      }
      
      console.log('📦 Cases response:', responseData);

      // If no data from statements, try the /all endpoint
      if (!responseData || !Array.isArray(responseData) || responseData.length === 0) {
        console.warn('⚠️ No data from /statements, trying /all endpoint...');
        try {
          response = await request('dashboard', 'GET', '/all', {});
          responseData = response?.data ?? response;
          
          if (responseData && responseData.data && !Array.isArray(responseData)) {
            const inner = responseData.data;
            if (inner && !Array.isArray(inner)) {
              responseData = inner;
            }
          }
          
          console.log('📦 Cases from /all endpoint:', responseData);
        } catch (fallbackError) {
          console.error('❌ Fallback /all endpoint also failed:', fallbackError);
          setCases([]);
          return;
        }
      }

      if (!responseData || !Array.isArray(responseData)) {
        console.warn('⚠️ Invalid response format, using empty array');
        setCases([]);
        return;
      }

      // Transform and filter cases
      const transformedCases = responseData
        .map((statement: any, index: number) => {
          try {
            // Extract victim name from various possible fields
            let victimName = 'Unknown';
            if (statement.victimNames && Array.isArray(statement.victimNames) && statement.victimNames.length > 0) {
              victimName = statement.victimNames[0];
            } else if (statement.complainants && Array.isArray(statement.complainants) && statement.complainants.length > 0) {
              victimName = statement.complainants[0];
            } else if (statement.victimName) {
              victimName = statement.victimName;
            } else if (statement.complainantName) {
              victimName = statement.complainantName;
            }

            // Extract offender name from various possible fields
            let offenderName = 'Unknown';
            if (statement.offenderNames && Array.isArray(statement.offenderNames) && statement.offenderNames.length > 0) {
              offenderName = statement.offenderNames[0];
            } else if (statement.offenders && Array.isArray(statement.offenders) && statement.offenders.length > 0) {
              offenderName = statement.offenders[0];
            } else if (statement.offenderName) {
              offenderName = statement.offenderName;
            }

            console.log(`📝 Case ${index}: victim="${victimName}", offender="${offenderName}"`);

            // Debug logging for dates with JSON stringify to see actual values
            console.log(`📅 Case ${index} (${statement.firNo}) dates:`, JSON.stringify({
              firRegisteredDate: statement.firRegisteredDate,
              registeredOn: statement.registeredOn,
              filedDate: statement.filedDate,
              createdOn: statement.createdOn,
              created_on: statement.created_on,
              updatedOn: statement.updatedOn,
              status: statement.status
            }, null, 2));

            return {
              complaintId: statement.complaintId || statement.id || Date.now() + index,
              victimName: victimName,
              offenderName: offenderName,
              firNo: statement.firNo || null,
              firRegisteredDate: statement.firRegisteredDate || statement.registeredOn || null,
              filedDate: statement.filedDate || null,
              createdOn: statement.createdOn || statement.created_on || null,
              updatedOn: statement.updatedOn || statement.updatedAt || statement.createdOn || null,
              status: statement.status || 'PENDING',
            };
          } catch (error) {
            console.error(`Error transforming case ${index}:`, error);
            return null;
          }
        })
        .filter((item: any) => item !== null);

      // Show all cases (not just registered) to display recent FIR cases
      console.log(`📊 Found ${transformedCases.length} total cases`);
      
      // Sort cases by most recent first (updatedOn or createdOn)
      const sortedCases = transformedCases.sort((a: any, b: any) => {
        const dateA = new Date(a.updatedOn || a.createdOn || a.firRegisteredDate || 0).getTime();
        const dateB = new Date(b.updatedOn || b.createdOn || b.firRegisteredDate || 0).getTime();
        return dateB - dateA; // Descending order (latest first)
      });
      
      // Set sorted cases (pagination will handle display)
      setCases(sortedCases);
      console.log(`✅ Loaded ${sortedCases.length} cases sorted by recent updates (latest first)`);
    } catch (err: any) {
      console.error('❌ Error fetching cases:', err);
      // Don't set error for cases - just log it and show empty table
      // This allows the dashboard to still display even if cases fail to load
      setCases([]);
      console.log('📋 Showing empty cases table');
    }
  };
  const navigate = useNavigate();

  const handleViewClick = (firId: string) => {
    console.log('Navigating to case details with FIR ID:', firId);
    navigate(`/viewcase/${firId}`);
  };

  if (loading) {
    return (
      <DefaultLayout handleLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout handleLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <button
              onClick={() => {
                setError('');
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 ">
        <CardDataStats
          title={FirCases}
          total={firCasesCount}
          color="bg-honolulublue"
          text="text-white"
          onClick={() => navigate('/registeredCases')}
        >
          <Icon name="document" size={30} className="fill-primary dark:fill-white" />
        </CardDataStats>
        <CardDataStats
          title={TotalNC}
          total={ncCasesCount}
          color="bg-pacificcyan"
          text="text-black"
          onClick={() => navigate('/allstatements')}
        >
          <Icon name="users" size={30} className="fill-primary dark:fill-white" />
        </CardDataStats>
        <CardDataStats
          title={ClosedCases}
          total={closedCasesCount}
          color="bg-nonphotoblue"
          text="text-black"
        >
          <Icon name="check" size={30} className="fill-primary dark:fill-white" />
        </CardDataStats>
        <CardDataStats
          title={TransferredCases}
          total={transferredCasesCount}
          color="bg-lightcyan"
          text="text-black"
        >
          <Icon name="evidence" size={30} className="fill-primary dark:fill-white" />
        </CardDataStats>
      </div>

      <div className="Searchbar pt-2 relative mx-auto text-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-6 ">
        <div className="flex flex-row items-center gap-3">
          <h4 className="flex text-xl font-semibold text-black dark:text-white items-center">
            {recentfir} :
          </h4>
        </div>
        <form className="form relative h-fit" onSubmit={(e) => e.preventDefault()}>
          <button type="button" className="absolute left-2 -translate-y-1/2 top-1/2 p-1">
            <svg
              width="17"
              height="16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-labelledby="search"
              className="w-5 h-5 text-gray-700"
            >
              <path
                d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                stroke="currentColor"
                strokeWidth="1.333"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
          <input
            className="input rounded-full px-8 py-3 border-2 border-transparent focus:outline-none focus:border-blue-500 shadow-md dark:bg-boxdark focus:duration-300"
            type="text"
            placeholder={search}
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 -translate-y-1/2 top-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}
        </form>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{show}</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing page size
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-boxdark text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entries}</span>
        </div>

        {/* Desktop Table View */}
        <div className="max-w-full overflow-x-auto hidden lg:block">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {index}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {victimname}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {offendername}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {firno}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {reportdate}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {viewcase}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.length > 0 ? (
                currentTableData.map((item, index) => (
                  <tr key={index}>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{(currentPage - 1) * pageSize + index + 1}</p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.victimName}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.offenderName}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.firNo}</p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {(() => {
                          const dateToShow = item.status === 'REGISTERED' && item.firRegisteredDate
                            ? item.firRegisteredDate
                            : (item.filedDate || item.createdOn);
                          
                          const formatted = dateToShow ? formatDate(dateToShow) : 'N/A';
                          console.log(`📅 Display ${item.firNo}: dateToShow="${dateToShow}", formatted="${formatted}", status="${item.status}"`);
                          return formatted;
                        })()}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        onClick={() => handleViewClick(item.firNo)}
                      >
                        {viewcase}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    {norecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="lg:hidden space-y-4">
          {currentTableData.length > 0 ? (
            currentTableData.map((item, index) => (
              <div
                key={index}
                className="border border-stroke dark:border-strokedark rounded-md p-4 dark:bg-boxdark"
              >
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}. {victimname}</p>
                  <p className="text-black dark:text-white font-semibold">{item.victimName}</p>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{offendername}</p>
                  <p className="text-black dark:text-white">{item.offenderName}</p>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{firno}</p>
                  <p className="text-black dark:text-white">{item.firNo}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{reportdate}</p>
                  <p className="text-black dark:text-white">
                    {(() => {
                      const dateToShow = item.status === 'REGISTERED' && item.firRegisteredDate
                        ? item.firRegisteredDate
                        : (item.filedDate || item.createdOn);
                      
                      return dateToShow ? formatDate(dateToShow) : 'N/A';
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => handleViewClick(item.firNo)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  {viewcase}
                </button>
              </div>
            ))
          ) : (
            <p className="text-center py-4">{norecords}</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        className="pagination-bar"
        currentPage={currentPage}
        totalCount={filteredCases.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </DefaultLayout>
  );
};

export default Dashboard;
