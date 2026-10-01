import React, { useEffect, useState, useMemo } from 'react';
import RaiseIssuePopup from './RaiseIssuePopup';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../Pagination';
import request from '../../Service/axios_helper';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { openFileInNewTab } from '../../services/documentService';

type HelpAndSupportPageProps = {
  handleLogout: () => void;
};

const HelpAndSupportPage: React.FC<HelpAndSupportPageProps> = ({
  handleLogout,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState({});
  const [officer, setOfficer] = useState<{officerId?: string; officerName?: string; email?: string; username?: string; officerPost?: string}>({});
  const [currentUuid, setCurrentUuid] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(7); // Dynamic page size with default 7

  const { t } = useTranslation();
  const { helpsupport } = t('breadcrumb');
  const {
    search,
    tickitid,
    name,
    issue,
    response,
    createdon,
    edit,
    dlt,
    raiseissue,
  } = t('helpsupport');

  useEffect(() => {
    fetchOfficerDetails();
  }, []);

  useEffect(() => {
    fetchListOfIssuesOfOfficer();
  }, [officer.officerId]);

  const fetchOfficerDetails = async () => {
    try {
      // Get officer data from localStorage (matching OfficerContext pattern)
      const officerStr = localStorage.getItem('officer');
      if (officerStr) {
        const officerData = JSON.parse(officerStr);
        console.log('Officer data from localStorage:', officerData);
        
        const mappedOfficer = {
          officerId: officerData.id,
          officerName: `${officerData.firstName || ''} ${officerData.lastName || ''}`.trim() || officerData.username || 'Officer',
          email: officerData.email,
          username: officerData.username || officerData.email,
          officerPost: officerData.designation || 'Officer',
        };
        setOfficer(mappedOfficer);
        console.log('Mapped officer data for HelpAndSupport:', mappedOfficer);
        return;
      }

      // Fallback: try to get individual fields from localStorage
      const officerId = localStorage.getItem('officerId');
      const officerName = localStorage.getItem('officerName');
      const officerEmail = localStorage.getItem('officerEmail');
      
      if (officerId && officerEmail) {
        const officerData = {
          officerId: officerId,
          officerName: officerName || 'Unknown Officer',
          email: officerEmail,
          username: officerEmail,
          officerPost: 'Officer',
        };
        setOfficer(officerData);
        return;
      }

      console.error('No officer data found in localStorage');
      // Set a default officer ID to prevent null errors
      setOfficer({ officerId: '1', officerName: 'Unknown Officer' });
    } catch (error) {
      console.error('Error retrieving officer details from localStorage:', error);
      // Set a default officer ID to prevent null errors
      setOfficer({ officerId: '1', officerName: 'Unknown Officer' });
    }
  };

  const fetchListOfIssuesOfOfficer = async () => {
    // Don't make API call if officer ID is not available
    if (!officer.officerId || officer.officerId === 'undefined') {
      console.log('Officer ID not available, skipping ticket fetch');
      return;
    }

    // Convert UUID to hash-based integer for help-support-service compatibility
    const hashUserId = (uuid: string): number => {
      let hash = 0;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    };

    const numericUserId = hashUserId(officer.officerId);
    console.log('Officer UUID:', officer.officerId, 'converted to numeric ID:', numericUserId);

    try {
      // Use request() function with JWT token instead of fetch()
      // request() returns data directly, not response object
      const data = await request('support', 'GET', `/tickets/user/${numericUserId}`, null);
      console.log('Tickets data:', data);
      
      // Check if response is a fallback message (circuit breaker triggered)
      if (typeof data === 'string' && data.includes('Service is down')) {
        console.warn('⚠️ Help-support service is down. Circuit breaker fallback triggered.');
        setIssuesList([]);
        return;
      }
      
      // request() returns data directly and throws on error
      console.log('Tickets data:', data);
      setIssuesList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setIssuesList([]);
    }
  };

  const normalizeText = (text: string | number | null | undefined): string => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    if (text === null || text === undefined) return '';
    return String(text).normalize('NFC').toLowerCase().trim();
  };



  // Helper function to check if a date matches the search query
  const checkDateMatch = (dateString: string | null | undefined): boolean => {
    if (!dateString || !searchQuery) return false;
    
    const query = searchQuery.toLowerCase().trim();
    
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return false;
      
      // Format date in multiple ways for matching
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
      
      // Weekday names
      const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const weekdayName = weekdayNames[dateObj.getDay()];
      
      // Check if query matches any date component
      if (day === query || dayPadded === query) return true;
      if (month === query || monthPadded === query) return true;
      if (year === query || yearShort === query) return true;
      if (monthName.includes(query) || monthShortName.includes(query)) return true;
      if (weekdayName.includes(query)) return true;
      
      // Check common date formats
      const formats = [
        `${dayPadded}/${monthPadded}/${year}`,
        `${dayPadded}-${monthPadded}-${year}`,
        `${day}/${month}/${year}`,
        `${monthPadded}/${dayPadded}/${year}`,
        `${year}-${monthPadded}-${dayPadded}`,
        `${monthName} ${day}, ${year}`,
        `${day} ${monthName} ${year}`,
      ];
      if (formats.some(f => f.toLowerCase().includes(query))) return true;
      
      // Also check the display format used in the table
      const displayFormat = dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      });
      if (displayFormat.toLowerCase().includes(query)) return true;
      
    } catch {
      // Ignore parsing errors
    }
    
    return false;
  };

  const filteredCases = Array.isArray(issuesList) ? issuesList.filter((item) => {
    // If no search query, return all cases
    if (!searchQuery) return true;
    
    const normalizedQuery = normalizeText(searchQuery);

    return (
      normalizeText(String(item?.ticketId || '')).includes(normalizedQuery) ||
      normalizeText(item?.subject || '').includes(normalizedQuery) ||
      normalizeText(item?.description || '').includes(normalizedQuery) ||
      normalizeText(item?.status || '').includes(normalizedQuery) ||
      checkDateMatch(item?.createdOn) ||
      item?.comments?.some((comment: any) =>
        normalizeText(comment?.message || '').includes(normalizedQuery)
      )
    );
  }) : [];

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

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleOpen = (): void => {
    setIsModalOpen(true);
  };

  const handleClose = (): void => {
    setIsModalOpen(false);
    setCurrentUuid('');
    fetchListOfIssuesOfOfficer();
  };

  const handleEditClick = (uuid): void => {
    setCurrentUuid(uuid);
    setIsModalOpen(true);
  };

  const handleDelete = async (ticketId) => {
    // Display SweetAlert confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this ticket!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      // If user confirms deletion
      if (result.isConfirmed) {
        try {
          // Use request() function with JWT token instead of fetch()
          // request() returns data directly and throws on error
          await request('support', 'DELETE', `/tickets/${ticketId}`, null);
          // If we reach here, the delete was successful
          Swal.fire('Deleted!', 'The ticket has been deleted.', 'success');
          fetchListOfIssuesOfOfficer();
        } catch (error) {
          console.error('Error deleting ticket:', error);
          Swal.fire(
            'Error!',
            'An error occurred while deleting the ticket.',
            'error',
          );
        }
      }
    });
  };
  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };
  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={helpsupport} />
      <div className="p-6 font-sans">
        <div className="Searchbar pt-2 relative mx-auto text-gray-600 flex flex-col md:flex-row justify-between items-center gap-4 my-6 ">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Show Count Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-boxdark text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">issues</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
          <button
            onClick={handleOpen}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            {raiseissue}
          </button>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
          <div className="max-w-full overflow-x-auto hidden lg:block">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-lightcyan text-left dark:bg-meta-4">
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {tickitid}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {name}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {issue}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {response}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    Attachment
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {createdon}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {edit}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {dlt}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTableData.map((entry, index) => (
                  <tr key={index}>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {entry.ticketId}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {entry.subject}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {entry.description}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {entry.comments && entry.comments.length > 0 ? entry.comments[entry.comments.length - 1].message : 'No Response'}
                    </td>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark text-black dark:text-white">
                      {entry.attachmentDocumentId ? (
                        <button
                          onClick={() => openFileInNewTab(entry.attachmentDocumentId)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-200 text-sm font-medium border border-blue-200 dark:border-blue-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No attachment</span>
                      )}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {new Date(entry.createdOn).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        weekday: 'long',
                      })}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        onClick={() => {
                          handleEditClick(entry.ticketId);
                        }}
                        className="hover:text-primary"
                      >
                        <svg
                          className="fill-current"
                          fill=""
                          width="30"
                          height="30"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M57.5,41a.5.5,0,0,0-.5.5V43H47V31h2v.5a.5.5,0,0,0,.5.5h5a.5.5,0,0,0,.5-.5V31h2v.5a.5.5,0,0,0,1,0v-1a.5.5,0,0,0-.5-.5H55v-.5A1.5,1.5,0,0,0,53.5,28h-3A1.5,1.5,0,0,0,49,29.5V30H46.5a.5.5,0,0,0-.5.5v13a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5v-2A.5.5,0,0,0,57.5,41ZM50,29.5a.5.5,0,0,1,.5-.5h3a.5.5,0,0,1,.5.5V31H50Zm11.854,4.646-2-2a.5.5,0,0,0-.708,0l-6,6A.5.5,0,0,0,53,38.5v2a.5.5,0,0,0,.5.5h2a.5.5,0,0,0,.354-.146l6-6A.5.5,0,0,0,61.854,34.146ZM54,40V38.707l5.5-5.5L60.793,34.5l-5.5,5.5Zm-2,.5a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1,0-1h2A.5.5,0,0,1,52,40.5Zm0-3a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1,0-1h2A.5.5,0,0,1,52,37.5ZM54.5,35h-5a.5.5,0,0,1,0-1h5a.5.5,0,0,1,0,1Z"
                            transform="translate(-46 -28)"
                            fill=""
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        onClick={() => {
                          handleDelete(entry.ticketId);
                        }}
                        className="hover:text-primary"
                      >
                        <svg
                          className="fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          fill=""
                          width="33"
                          height="33"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                            fill=""
                          ></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden space-y-4">
            {currentTableData.length > 0 ? (
              currentTableData.map((entry, index) => (
                <div
                  key={index}
                  className="border-b border-stroke dark:border-strokedark pb-4"
                >
                  <button
                    onClick={() => toggleDetails(index)}
                    className="w-full text-left py-2 font-medium text-black dark:text-white flex justify-between"
                  >
                    {index + 1}. {name}: {entry.subject}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      version="1.1"
                      width="30"
                      height="30"
                      x="0"
                      y="0"
                      viewBox="0 0 682.667 682.667"
                      className={` transition-transform duration-300 ${
                        isOpen[index] ? 'rotate-180' : ''
                      }`}
                    >
                      <g>
                        <g
                          clipPath="url(#a)"
                          transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
                        >
                          <path
                            d="M0 0c0-130.339 105.661-236 236-236S472-130.339 472 0 366.339 236 236 236 0 130.339 0 0Z"
                            transform="translate(20 256)"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="40"
                            strokeLinecap="butt"
                            strokeLinejoin="miter"
                            strokeMiterlimit="10"
                            strokeDasharray="none"
                            strokeOpacity=""
                          ></path>
                          <path
                            d="m0 0-110-110L-220 0"
                            transform="translate(366 290)"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="40"
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                            strokeMiterlimit="10"
                            strokeDasharray="none"
                            strokeOpacity=""
                          ></path>
                        </g>
                      </g>
                    </svg>
                  </button>
                  <div className={`pt-2 ${isOpen[index] ? 'block' : 'hidden'}`}>
                    <p className="text-black dark:text-white">
                      {tickitid}: {entry.ticketId}
                    </p>
                    <p className="text-black dark:text-white">
                      {issue}: {entry.description}
                    </p>
                    <p className="text-black dark:text-white">
                      {response}: {entry.comments && entry.comments.length > 0 ? entry.comments[entry.comments.length - 1].message : 'No Response'}
                    </p>
                    <p className="text-black dark:text-white">
                      Attachment:{' '}
                      {entry.attachmentDocumentId ? (
                        <button
                          onClick={() => openFileInNewTab(entry.attachmentDocumentId)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded transition-colors duration-200 text-sm font-medium ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 ml-1">None</span>
                      )}
                    </p>
                    <p className="text-black dark:text-white">
                      {createdon}:{' '}
                      {new Date(entry.createdOn).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        weekday: 'long',
                      })}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleEditClick(entry.ticketId)}
                        className="hover:text-primary p-2 rounded border border-slate-300"
                      >
                        {edit}
                      </button>
                      <button
                        onClick={() => handleDelete(entry.ticketId)}
                        className="hover:text-primary p-2 rounded border border-slate-300"
                      >
                        {dlt}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4">no records</p>
            )}
          </div>
        </div>
        {filteredCases.length > 0 && (
          <Pagination
            className="pagination-bar"
            currentPage={currentPage}
            totalCount={filteredCases.length}
            pageSize={pageSize}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        )}
        {isModalOpen && (
          <RaiseIssuePopup
            officerId={officer.officerId || ''}
            uuid={currentUuid}
            onClose={handleClose}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default HelpAndSupportPage;
