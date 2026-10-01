import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import request from '../Service/axios_helper';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../common/DateUtils';
import DescriptionModal from '../common/DescriptionModal';

// PageSize is now dynamic - controlled by component state
type CasediaryProps = {
  handleLogout: () => void;
};
const Casediary: React.FC<CasediaryProps> = ({ handleLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5); // Dynamic page size with default 5
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<Record<number, boolean>>({});
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const { t } = useTranslation();
  const tableTranslations = t('table', { returnObjects: true }) as any;
  const breadcrumbTranslations = t('breadcrumb', { returnObjects: true }) as any;

  const {
    index,
    victimname,
    offendername,
    reportdate,
    section,
    firno,
    shortdesc,
    casediarypreview,
    norecords,
    search,
    show = 'Show',
    entries = 'entries',
  } = tableTranslations || {};

  const { casediary } = breadcrumbTranslations || {};

  // Helper function to open description modal
  const openDescriptionModal = (text: string) => {
    setSelectedDescription(text);
    setIsDescriptionModalOpen(true);
  };

  // Helper function to render description with "See More" link
  const renderDescription = (text: string, maxLength: number = 100) => {
    if (!text) return 'N/A';
    
    const needsSeeMore = text.length > maxLength;
    
    return (
      <div className="space-y-1">
        <p className="text-black dark:text-white">
          {text.substring(0, maxLength)}{needsSeeMore ? '...' : ''}
        </p>
        {needsSeeMore && (
          <button
            onClick={() => openDescriptionModal(text)}
            className="text-blue-500 hover:text-blue-700 text-xs font-medium"
          >
            See More
          </button>
        )}
      </div>
    );
  };

  const normalizeText = (text: string | number | null | undefined): string => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    if (text === null || text === undefined) return '';
    return String(text).normalize('NFC').toLowerCase().trim();
  };



  const filteredCases = cases.filter((item) => {
    // If no search query, return all cases
    if (!searchQuery) return true;
    
    const normalizedQuery = normalizeText(searchQuery);

    // For date searching, split the formatted date by separators to match whole components
    const formattedDate = formatDate(item?.created_on);
    const dateComponents = formattedDate.split(/[\/\-\s]/); // Split by /, -, or space
    const dateMatches = dateComponents.some(component => 
      normalizeText(component).includes(normalizedQuery)
    ) || normalizeText(formattedDate).includes(normalizedQuery);

    return (
      normalizeText(item?.victimName || '').includes(normalizedQuery) ||
      normalizeText(item?.offenderName || '').includes(normalizedQuery) ||
      normalizeText(item?.firNo || '').includes(normalizedQuery) ||
      normalizeText(item?.shortDescription || '').includes(normalizedQuery) ||
      normalizeText(String(item?.victimId || '')).includes(normalizedQuery) ||
      normalizeText(item?.sectionId || '').includes(normalizedQuery) ||
      dateMatches ||
      normalizeText(item?.caseStatus || '').includes(normalizedQuery) ||
      item.victimNames?.some((name: string) =>
        normalizeText(name).includes(normalizedQuery)
      ) ||
      item.offenderNames?.some((name: string) =>
        normalizeText(name).includes(normalizedQuery)
      )
    );
  });

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredCases.slice(firstPageIndex, lastPageIndex); // Use filteredCases here
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
    fetchCases();
  }, []);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const fetchCases = async () => {
    try {
      console.log('🚀 Fetching case diary data from Investigation Service...');
      
      // First get statements from Complaint service
      const response = await request('complaintandfir', 'GET', '/statements?page=0&size=1000&sort=updatedOn,desc', null);
      
      console.log('📦 Raw API Response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', response ? Object.keys(response) : 'null');
      
      // IMPORTANT: Extract data from axios response wrapper
      const responseData = response?.data || response;
      console.log('📦 Extracted response data:', responseData);
      console.log('📦 Response data type:', typeof responseData);
      console.log('📦 Response data keys:', responseData ? Object.keys(responseData) : 'null');
      
      // Handle different response formats
      let statements: any[] = [];
      
      if (Array.isArray(responseData)) {
        statements = responseData;
      } else if (responseData && typeof responseData === 'object') {
        if (responseData.content && Array.isArray(responseData.content)) {
          statements = responseData.content;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          statements = responseData.data;
        }
      }
      
      console.log('📋 Statements array length:', statements.length);
      console.log('📋 First statement sample:', statements[0]);
      
      // Filter only registered date cases (those with FIR numbers or registered date status)
      const registeredCases = statements.filter(
        (caseItem: any) => {
          const hasFirNo = !!caseItem.firNo;
          const hasRegisteredStatus = caseItem.status === 'REGISTERED_DATE';
          console.log(`Case ${caseItem.complaintId}: firNo=${caseItem.firNo}, status=${caseItem.status}, included=${hasFirNo || hasRegisteredStatus}`);
          return hasFirNo || hasRegisteredStatus;
        }
      );
      
      console.log('✅ Registered date cases found:', registeredCases.length);
      console.log('✅ Registered cases:', registeredCases);
      
      // Transform the data to match the expected format - with FIR details
      const transformedCases = await Promise.all(registeredCases.map(async (statement: any) => {
        // Get all victim names as array and filter placeholders
        const victimNamesRaw = statement.victimNames || statement.complainants || [];
        const victimNames = (victimNamesRaw || []).filter(
          (name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified'
        );

        // Build offender names from multiple possible sources and filter placeholders
        const offendersPrimary = statement.offenderNames || [];
        const offendersSecondary = statement.offenders || [];
        // Also check if backend embedded offender lists exist on statement
        const offendersFromStatementList = (statement?.victimList?.[0]?.offenderList || statement?.offenderList || [])
          .map((o: any) => o?.offenderName || o?.name || o?.citizen?.name || 'Unknown');
        const combinedOffenders: string[] = [...offendersPrimary, ...offendersSecondary, ...offendersFromStatementList].filter(
          (name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified'
        );

        let finalOffenderNames: string[] = combinedOffenders;

        // If still empty, try to extract from participants
        if (finalOffenderNames.length === 0 && Array.isArray(statement.participants) && statement.participants.length > 0) {
          const offendersFromParticipants = statement.participants
            .filter((p: any) => p.role === 'OFFENDER' || p.role === 'ACCUSED')
            .map((p: any) => p.citizen?.name || p.name || 'Unknown')
            .filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');

          if (offendersFromParticipants.length > 0) {
            finalOffenderNames = offendersFromParticipants;
          }
        }
        
        // Fetch FIR details to get sections (same as RegisteredCases.tsx)
        let sectionId = 'N/A';
        try {
          const firResponse = await request('complaintandfir', 'GET', `/statements/${statement.complaintId}/fir-details`, {});
          const firData = firResponse?.data || firResponse;
          console.log('🔍 FIR details for case', statement.complaintId, ':', firData);
          
          // Try multiple possible field names and sources for sections
          const possibleSections = 
            firData?.sections || 
            firData?.section ||
            firData?.acts ||
            statement?.sections ||
            statement?.section ||
            statement?.acts ||
            // Check if sections are stored as array
            (Array.isArray(firData?.sections) ? firData.sections.join(', ') : null) ||
            (Array.isArray(statement?.sections) ? statement.sections.join(', ') : null) ||
            // Check nested data
            statement?.fir?.sections ||
            statement?.crimeDetails?.sections;
          
          if (possibleSections && possibleSections.toString().trim()) {
            sectionId = possibleSections.toString().trim();
          }
          
          console.log('🔍 Sections search result for case', statement.complaintId, ':', {
            firDataSections: firData?.sections,
            statementSections: statement?.sections,
            finalSectionId: sectionId
          });

          // If offender names still empty, try FIR offender list
          if (finalOffenderNames.length === 0) {
            const offendersFromFir = (firResponse?.victimList?.[0]?.offenderList || [])
              .map((o: any) => o?.offenderName || o?.name || o?.citizen?.name || 'Unknown')
              .filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
            if (offendersFromFir.length > 0) {
              finalOffenderNames = offendersFromFir;
            }
          }

          // If still empty, fetch full statement details as a last resort
          if (finalOffenderNames.length === 0) {
            try {
              const details = await request('complaintandfir', 'GET', `/statements/${statement.complaintId}`, {});
              console.log('🔍 Full statement details for case', statement.complaintId, ':', details);
              const detailsOffendersFromList = (details?.victimList?.[0]?.offenderList || details?.offenderList || [])
                .map((o: any) => o?.offenderName || o?.name || o?.citizen?.name || 'Unknown')
                .filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
              const detailsOffendersFromParticipants = (details?.participants || [])
                .filter((p: any) => p.role === 'OFFENDER' || p.role === 'ACCUSED')
                .map((p: any) => p?.citizen?.name || p?.name || 'Unknown')
                .filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
              const merged = [...detailsOffendersFromList, ...detailsOffendersFromParticipants];
              if (merged.length > 0) {
                finalOffenderNames = merged;
              }
            } catch (detailsErr) {
              console.warn('⚠️ Could not fetch full statement details for', statement.complaintId);
            }
          }
        } catch (firError) {
          console.warn('⚠️ Could not fetch FIR details for', statement.complaintId);
        }
        
        console.log(`📋 Case ${statement.complaintId} - Final section:`, sectionId);
        
        return {
          victimId: statement.complaintId || statement.id,
          victimNames: victimNames.length > 0 ? victimNames : [],
          offenderNames: finalOffenderNames.length > 0 ? finalOffenderNames : [],
          firNo: statement.firNo || 'N/A',
          created_on: statement.createdOn || statement.createdAt || statement.firRegisteredDate || new Date().toISOString(),
          sectionId: sectionId,
          shortDescription: statement.description || 'N/A',
          caseStatus: statement.caseStatus || 'in progress',
        };
      }));
      
      // Latest first by created_on (most recently created at top)
      const sortedCases = [...transformedCases].sort((a, b) => {
        const aDate = new Date(a.created_on || 0).getTime();
        const bDate = new Date(b.created_on || 0).getTime();
        return bDate - aDate;
      });
      setCases(sortedCases);
      setCurrentPage(1);
      console.log('✅ Transformed cases:', transformedCases);
    } catch (err) {
      console.error('❌ Error fetching case diary:', err);
      setCases([]);
    }
  };

  const handleViewClick = (firId: any) => {
    console.log('Navigating to case diary preview with FIR ID:', firId);
    navigate(`/casediarypreview/${firId}`);
  };
  const toggleDetails = (index: number) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={casediary} />
      <div className="Searchbar pt-2 relative mx-auto text-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-6 ">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Show Count Dropdown */}
          <div className="flex items-center gap-2">
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
              <option value={25}>25</option>
            </select>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entries}</span>
          </div>
        </div>
        <form className="form relative h-fit ">
          <button className="absolute left-2 -translate-y-1/2 top-1/2 p-1">
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
                stroke-width="1.333"
                stroke-linecap="round"
                stroke-linejoin="round"
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
          <button
            type="reset"
            className="absolute right-3 -translate-y-1/2 top-1/2 p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </form>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
        <div className="max-w-full overflow-x-auto hidden lg:block">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-lightcyan text-left dark:bg-meta-4">
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {index}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {victimname}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {offendername}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {firno}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {reportdate}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {section}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {shortdesc}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white text-center">
                  {casediarypreview}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.length > 0 ? (
                currentTableData.map((item, index) => (
                  <tr key={index}>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {(currentPage - 1) * pageSize + index + 1}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <div className="space-y-1">
                        {Array.isArray(item.victimNames) && item.victimNames.length > 0 ? (
                          item.victimNames.map((name: string, idx: number) => (
                            <div key={idx} className="text-sm text-black dark:text-white">
                              {name}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <div className="space-y-1">
                        {Array.isArray(item.offenderNames) && item.offenderNames.length > 0 ? (
                          item.offenderNames.map((name: string, idx: number) => (
                            <div key={idx} className="text-sm text-black dark:text-white">
                              {name}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.firNo}</p>
                    </td>

                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {new Date(item.created_on).toLocaleDateString('en-GB')}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.sectionId}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      {renderDescription(item.shortDescription || '', 150)}
                    </td>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      <div className="flex items-center justify-center">
                        {/* Case Diary Preview Button with Document View Icon */}
                        <button
                          className="hover:text-primary transition-colors"
                          onClick={() => handleViewClick(item.firNo)}
                          title={casediarypreview}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="stroke-current"
                          >
                            {/* Document outline */}
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            {/* Eye icon inside document */}
                            <path d="M12 18c2.5 0 4-1.5 4-3s-1.5-3-4-3-4 1.5-4 3 1.5 3 4 3z"></path>
                            <circle cx="12" cy="15" r="1" fill="currentColor"></circle>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    {norecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile Collapsible List View */}
        <div className="lg:hidden space-y-4">
          {currentTableData.length > 0 ? (
            currentTableData.map((item, index) => (
              <div
                key={index}
                className="border-b border-stroke dark:border-strokedark pb-4"
              >
                <button
                  onClick={() => toggleDetails(index)}
                  className="w-full text-left py-2 font-medium text-black dark:text-white flex align-middle justify-between"
                >
                  {(currentPage - 1) * pageSize + index + 1}
                  {'. '}
                  {victimname}
                  {' :'} {Array.isArray(item.victimNames) && item.victimNames.length > 0 ? item.victimNames.join(', ') : 'N/A'}
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
                        clip-path="url(#a)"
                        transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
                      >
                        <path
                          d="M0 0c0-130.339 105.661-236 236-236S472-130.339 472 0 366.339 236 236 236 0 130.339 0 0Z"
                          transform="translate(20 256)"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="40"
                          stroke-linecap="butt"
                          stroke-linejoin="miter"
                          stroke-miterlimit="10"
                          stroke-dasharray="none"
                          stroke-opacity=""
                        ></path>
                        <path
                          d="m0 0-110-110L-220 0"
                          transform="translate(366 290)"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="40"
                          stroke-linecap="square"
                          stroke-linejoin="miter"
                          stroke-miterlimit="10"
                          stroke-dasharray="none"
                          stroke-opacity=""
                        ></path>
                      </g>
                    </g>
                  </svg>
                </button>
                {/* Collapsible details */}
                <div className={`pt-2 ${isOpen[index] ? 'block' : 'hidden'}`}>
                  <p className="text-black dark:text-white">
                    {offendername} : {Array.isArray(item.offenderNames) && item.offenderNames.length > 0 ? item.offenderNames.join(', ') : 'N/A'}
                  </p>
                  <p className="text-black dark:text-white">
                    {firno} : {item.firNo}
                  </p>
                  <p className="text-black dark:text-white">
                    {reportdate} :{' '}
                    {new Date(item.created_on).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-black dark:text-white">
                    {section} : {item.sectionId}
                  </p>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{shortdesc}</p>
                    {renderDescription(item.shortDescription || '', 150)}
                  </div>
                  <div className="flex gap-4 mt-2 justify-center">
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => handleViewClick(item.firNo)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {casediarypreview}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4">{norecords}</p>
          )}
        </div>
      </div>
      <Pagination
        className="pagination-bar"
        currentPage={currentPage}
        totalCount={filteredCases.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Description Modal */}
      <DescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        description={selectedDescription}
        title="Short Description"
      />
    </DefaultLayout>
  );
};

export default Casediary;
