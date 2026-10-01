import { useEffect, useState, useMemo } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Pagination from '../pages/Pagination';
import request from '../Service/axios_helper';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Firpopup from '../pages/Firpopup';
import { useNotification } from '../common/NotificationContext';
import SuccessPopup from '../common/SuccessPopup';
import FirSuccessPopup from '../common/FirSuccessPopup';
import { formatDate } from '../common/DateUtils';
import DescriptionModal from '../common/DescriptionModal';
import React from 'react';

// PageSize is now dynamic - controlled by component state

interface CaseData {
  complaintId?: number;
  victimName?: string | React.ReactElement;
  offenderName?: string | React.ReactElement;
  firNo?: string | null;
  firRegisteredDate?: string | null;
  sectionId?: string;
  shortDescription?: string;
  created_on?: string;
  victimId?: string | null;
  subject?: string;
  description?: string;
  status?: string;
  filedDate?: string;
  createdOn?: string;
  updatedOn?: string;
  participants?: any[];
  complainants?: string[];
  offenders?: string[];
  crimeAddress?: string;
  policeStationName?: string;
  officerName?: string;
  officerDesignation?: string;
  hasFIR?: boolean;
}

type AllstatementsProps = {
  handleLogout: () => void;
};

const Allstatements: React.FC<AllstatementsProps> = ({ handleLogout }) => {
  // Component state and logic
  const [cases, setCases] = useState<CaseData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [successDetails, setSuccessDetails] = useState({ title: '', message: '', details: [], type: 'success' as const });
  const [isOpen, setIsOpen] = useState<{ [key: number]: boolean }>({});
  const [pageSize, setPageSize] = useState<number>(7); // Dynamic page size with default 7
  const [isFirSuccessPopupOpen, setIsFirSuccessPopupOpen] = useState(false);
  const [firSuccessData, setFirSuccessData] = useState({ firId: '', complaintId: '' });
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const nav = useNavigate();

  // Translation
  const { t } = useTranslation();
  const search = t('table.search');
  const edit = t('table.edit');
  const nc = t('table.nc');
  const registercase = t('table.registercase');
  const norecords = t('table.norecords');
  const allstatements = t('breadcrumb.allstatements');
  const offendername = t('table.offendername');
  const section = t('table.section');
  const index = t('table.index');
  const complaintname = t('table.complaintname');
  const reportdate = t('table.reportdate');
  const actions = t('table.actions');
  const firstatus = t('table.firstatus');

  // Loading and notification hooks
  const { showLoading, closeLoading } = useNotification();
  const { showSuccess, showError } = useNotification();

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
        <p className="text-sm font-medium text-black dark:text-white">
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

  // Normalize text for search
  const normalizeText = (text: string | number | null | undefined) => {
    if (text === null || text === undefined) return '';
    return String(text).toLowerCase().trim();
  };



  const filteredCases = cases.filter((item) => {
    // If no search query, return all cases
    if (!searchQuery) return true;
    
    const normalizedQuery = normalizeText(searchQuery);

    // Handle victimName which might be JSX or string
    let victimNameText = '';
    if (typeof item?.victimName === 'string') {
      victimNameText = item.victimName;
    } else if (React.isValidElement(item?.victimName)) {
      // Extract text content from JSX elements for searching
      const extractTextFromJSX = (element: React.ReactElement): string => {
        if (typeof element.props.children === 'string') {
          return element.props.children;
        }
        if (Array.isArray(element.props.children)) {
          return element.props.children.map(child =>
            React.isValidElement(child) ? extractTextFromJSX(child) : String(child)
          ).join(' ');
        }
        return '';
      };
      victimNameText = extractTextFromJSX(item.victimName);
    }

    // Handle offenderName which might be JSX or string
    let offenderNameText = '';
    if (typeof item?.offenderName === 'string') {
      offenderNameText = item.offenderName;
    } else if (React.isValidElement(item?.offenderName)) {
      // Extract text content from JSX elements for searching
      const extractTextFromJSX = (element: React.ReactElement): string => {
        if (typeof element.props.children === 'string') {
          return element.props.children;
        }
        if (Array.isArray(element.props.children)) {
          return element.props.children.map(child =>
            React.isValidElement(child) ? extractTextFromJSX(child) : String(child)
          ).join(' ');
        }
        return '';
      };
      offenderNameText = extractTextFromJSX(item.offenderName);
    }

    // Helper function to check if a date matches the search query
    const checkDateMatch = (dateString: string | null | undefined): boolean => {
      if (!dateString || !searchQuery) return false;
      
      const query = searchQuery.toLowerCase().trim();
      
      // Format the date using formatDate utility (DD/MM/YYYY format)
      const formattedDate = formatDate(dateString);
      if (!formattedDate) return false;
      
      // Check if query matches the formatted date directly
      if (formattedDate.toLowerCase().includes(query)) return true;
      
      // Split formatted date into components (day, month, year)
      const dateComponents = formattedDate.split('/');
      if (dateComponents.some(component => component.includes(query))) return true;
      
      // Try to parse the original date for additional formats
      try {
        const dateObj = new Date(dateString);
        if (!isNaN(dateObj.getTime())) {
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
          if (day === query || dayPadded === query) return true;
          if (month === query || monthPadded === query) return true;
          if (year === query || yearShort === query) return true;
          if (monthName.includes(query) || monthShortName.includes(query)) return true;
          
          // Check common date formats
          const formats = [
            `${dayPadded}/${monthPadded}/${year}`,
            `${dayPadded}-${monthPadded}-${year}`,
            `${day}/${month}/${year}`,
            `${monthPadded}/${dayPadded}/${year}`,
            `${year}-${monthPadded}-${dayPadded}`,
          ];
          if (formats.some(f => f.includes(query))) return true;
        }
      } catch {
        // Ignore parsing errors
      }
      
      return false;
    };

    return (
      normalizeText(victimNameText).includes(normalizedQuery) ||
      normalizeText(offenderNameText).includes(normalizedQuery) ||
      normalizeText(item?.firNo || '').includes(normalizedQuery) ||
      normalizeText(item?.shortDescription || '').includes(normalizedQuery) ||
      normalizeText(item?.description || '').includes(normalizedQuery) ||
      normalizeText(item?.status || '').includes(normalizedQuery) ||
      normalizeText(String(item?.complaintId || '')).includes(normalizedQuery) ||
      normalizeText(item?.subject || '').includes(normalizedQuery) ||
      normalizeText(item?.sectionId || '').includes(normalizedQuery) ||
      checkDateMatch(item?.filedDate) ||
      checkDateMatch(item?.createdOn) ||
      checkDateMatch(item?.updatedOn) ||
      checkDateMatch(item?.firRegisteredDate) ||
      item.participants?.some((participant: any) =>
        normalizeText(participant.name || '').includes(normalizedQuery)
      ) ||
      item.complainants?.some((name: string) =>
        normalizeText(name).includes(normalizedQuery)
      ) ||
      item.offenders?.some((name: string) =>
        normalizeText(name).includes(normalizedQuery)
      )
    );
  });

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredCases.slice(firstPageIndex, lastPageIndex); // Use filteredCases here
  }, [currentPage, filteredCases, pageSize]);

  // Comprehensive debugging function to track data flow
  const debugDataFlow = () => {
    console.log('🔍 COMPREHENSIVE DEBUG: All Statements Data Flow');
    console.log('📊 Database should have 12+ records');
    console.log('📋 Current cases state:', cases.length, 'records');
    console.log('🔍 Filtered cases:', filteredCases.length, 'records');
    console.log('📄 Current page:', currentPage);
    console.log('📏 Page size:', pageSize);
    console.log('📋 Current table data:', currentTableData.length, 'records');
    console.log('🔍 Search query:', searchQuery);

    if (cases.length > 0) {
      console.log('📋 Sample cases data:');
      cases.slice(0, 5).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.complaintId} - ${item.victimName} (${item.status})`);
      });
    }

    if (filteredCases.length !== cases.length) {
      console.log('⚠️ SEARCH FILTERING ACTIVE!');
      console.log('🔍 Search is filtering out', cases.length - filteredCases.length, 'records');
    }

    console.log('💾 Expected total pages:', Math.ceil(cases.length / pageSize));
    console.log('📊 Actual displayed records:', currentTableData.length);
  };

  // Auto-refresh mechanism - enhanced with better error handling
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    console.log('Refresh trigger activated:', refreshTrigger);

    // Check if we need to refresh (triggered by successful statement registration)
    const refreshTimestamp = localStorage.getItem('statementsRefresh');
    if (refreshTimestamp) {
      const currentTime = Date.now();
      const timeDiff = currentTime - parseInt(refreshTimestamp);

      // Only refresh if the timestamp is recent (within last 60 seconds)
      if (timeDiff < 60000) {
        console.log('Detected recent statement registration, refreshing data...');
        setRefreshTrigger(prev => prev + 1);
        localStorage.removeItem('statementsRefresh'); // Clear the trigger
      }
    }

    // Always fetch data on component mount and refresh trigger
    fetchCases();
    
    // Also fetch again after a short delay to catch any async backend operations
    const delayedFetch = setTimeout(() => {
      console.log('🔄 Delayed fetch to catch async updates...');
      fetchCases();
    }, 1500);

    // Add listener for page visibility change (when user returns from another page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📄 Page regained focus, refreshing data...');
        fetchCases();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(delayedFetch);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshTrigger]);

  const bringEditedToTop = (editedId: number | string) => {
    setCases(prev => {
      const idx = prev.findIndex(c => (c as any).complaintId === editedId);
      if (idx === -1) return prev;
      const edited = prev[idx];
      const rest = prev.filter(c => (c as any).complaintId !== editedId);
      const reordered = [edited, ...rest];
      return reordered;
    });
    setCurrentPage(1);
  };

  // Listen for custom refresh events
  useEffect(() => {
  const handleStatementsRefresh = () => {
    console.log('Received statementsRefresh event, refreshing data...');
    setRefreshTrigger(prev => prev + 1);
    // Also force a direct fetch as backup
    setTimeout(() => {
      console.log('Backup fetch triggered after refresh event');
      fetchCases();
    }, 100);
  };

  // ✅ Add event listener outside the callback
  window.addEventListener('statementsRefresh', handleStatementsRefresh);

  return () => {
    window.removeEventListener('statementsRefresh', handleStatementsRefresh);
  };
}, []); // ✅ Don't forget dependency array


  // Enhanced checkAllFIRStatuses function with timeout
  const checkAllFIRStatuses = async () => {
    if (cases.length === 0) return;

    console.log('🔍 Checking FIR status for', cases.length, 'cases');

    // Only check cases that don't already have FIR status confirmed
    const casesToCheck = cases.filter(c => c.status !== 'REGISTERED' && !c.hasFIR);
    
    if (casesToCheck.length === 0) {
      console.log('✅ All cases already have confirmed status, skipping FIR check');
      return;
    }

    console.log(`🔍 Need to check ${casesToCheck.length} cases (${cases.length - casesToCheck.length} already confirmed)`);

    const statusPromises = casesToCheck.map(async (caseItem) => {
      try {
        if (!caseItem.complaintId) return { complaintId: caseItem.complaintId, hasFIR: false };

        console.log('🔍 Checking FIR status for complaint:', caseItem.complaintId);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FIR check timeout')), 5000)
        );
        
        const hasFIR = await Promise.race([
          checkFIRStatus(caseItem.complaintId),
          timeoutPromise
        ]);
        console.log('Complaint', caseItem.complaintId, 'FIR status:', hasFIR);

        return { complaintId: caseItem.complaintId, hasFIR };
      } catch (error) {
        console.error('❌ Error checking FIR status for complaint', caseItem.complaintId, ':', error);
        // If check fails, assume status from backend is correct
        return { complaintId: caseItem.complaintId, hasFIR: caseItem.status === 'REGISTERED' };
      }
    });

    const results = await Promise.all(statusPromises);
    console.log('✅ FIR status check complete for', results.length, 'cases');

    // Log summary
    const registeredCount = results.filter(r => r.hasFIR).length;
    const pendingCount = results.filter(r => !r.hasFIR).length;
    console.log(`📊 FIR Status Summary: ${registeredCount} Registered, ${pendingCount} Pending`);

    // Update the status field in cases data to match FIR status - do this once after all checks
    setCases(prevCases =>
      prevCases.map(prevCaseItem => {
        const result = results.find(r => r.complaintId === prevCaseItem.complaintId);
        if (result) {
          return result.hasFIR
            ? { ...prevCaseItem, status: 'REGISTERED', hasFIR: true }
            : { ...prevCaseItem, status: 'PENDING', hasFIR: false };
        }
        return prevCaseItem;
      })
    );
  };
  // Force refresh FIR statuses when needed
  const refreshFIRStatuses = () => {
    console.log('Manually refreshing FIR statuses...');
    checkAllFIRStatuses();
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page when clearing search
  };

  // Helper function to determine FIR status from backend data
  const determineFIRStatus = (statement: any): string => {
    // Check multiple indicators of FIR registration
    if (statement.firNo) return 'REGISTERED';
    if (statement.status === 'REGISTERED') return 'REGISTERED';
    if (statement.hasFIR === true) return 'REGISTERED';
    if (statement.firRegisteredDate) return 'REGISTERED';
    if (statement.registered === true) return 'REGISTERED';
    if (statement.firStatus === 'REGISTERED') return 'REGISTERED';
    
    // Default to backend status or PENDING
    return statement.status || 'PENDING';
  };

  const fetchCases = async () => {
    try {
      console.log('🚀 Starting data fetch - requesting ALL statements without pagination...');

      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      
      // Try to get ALL statements by setting a large page size (1000+)
      // Sort by updatedOn (most recent updates first), fallback to createdOn
      const response = await request('complaintandfir', 'GET', `/statements?page=0&size=1000&sort=updatedOn,desc&_=${cacheBuster}`, {});

      console.log('📦 Raw API Response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', response ? Object.keys(response) : 'null');
      console.log('📦 Full response data:', JSON.stringify(response, null, 2));

      // IMPORTANT: axios_helper now returns full Axios response, so extract data first
      const responseData = response?.data || response;
      console.log('📦 Extracted response data:', responseData);

      // Debug the actual response format
      if (responseData && typeof responseData === 'object' && responseData.content) {
        console.log('📋 Response format: Paginated');
        console.log('📋 First record sample:', responseData.content[0]);
        if (responseData.content[0]) {
          console.log('🔍 First record keys:', Object.keys(responseData.content[0]));
          console.log('🔍 First record victimNames:', responseData.content[0].victimNames);
          console.log('🔍 First record offenderNames:', responseData.content[0].offenderNames);
        }
      } else if (Array.isArray(responseData)) {
        console.log('📋 Response format: Direct array');
        console.log('📋 First record sample:', responseData[0]);
        if (responseData[0]) {
          console.log('🔍 First record keys:', Object.keys(responseData[0]));
          console.log('🔍 First record victimNames:', responseData[0].victimNames);
          console.log('🔍 First record offenderNames:', responseData[0].offenderNames);
        }
      }

      // Handle different response formats more robustly
      let statements: any[] = [];

      if (Array.isArray(responseData)) {
        statements = responseData;
        console.log('✅ Response is direct array with', statements.length, 'records');
      } else if (responseData && typeof responseData === 'object') {
        // Handle paginated response or other object formats
        if (responseData.content && Array.isArray(responseData.content)) {
          statements = responseData.content;
          console.log('✅ Response has content array with', statements.length, 'records');
        } else if (responseData.data && Array.isArray(responseData.data)) {
          statements = responseData.data;
          console.log('✅ Response has data array with', statements.length, 'records');
        } else if (responseData.statements && Array.isArray(responseData.statements)) {
          statements = responseData.statements;
          console.log('✅ Response has statements array with', statements.length, 'records');
        } else {
          console.warn('⚠️ Response is object but no recognizable array found:', Object.keys(responseData));
          // Try to find any array in the response
          for (const key in responseData) {
            if (Array.isArray(responseData[key])) {
              statements = responseData[key];
              console.log('✅ Found array in response key:', key, 'with', statements.length, 'records');
              break;
            }
          }
        }
      } else {
        console.error('❌ Unexpected response format:', responseData);
        setCases([]);
        return;
      }

      console.log('📋 Final statements array length:', statements.length);

      if (statements.length === 0) {
        console.warn('⚠️ No statements found in any format');
        setCases([]);
        return;
      }

      // Sort statements by updated date (most recently updated first)
      const sortedStatements = statements.sort((a, b) => {
        const dateA = new Date(a.updatedOn || a.createdOn || a.createdAt || a.filedDate || 0);
        const dateB = new Date(b.updatedOn || b.createdOn || b.createdAt || b.filedDate || 0);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('📋 Sorted statements array length:', sortedStatements.length);

      console.log('📋 Individual statement details:');
      sortedStatements.forEach((statement, index) => {
        console.log(`  ${index + 1}. ID: ${statement.complaintId || statement.id}`);
        console.log(`     Status: ${statement.status} (type: ${typeof statement.status})`);
        console.log(`     Status raw value:`, statement.status);
        console.log(`     Has FIR field: ${statement.hasFIR} (type: ${typeof statement.hasFIR})`);
        if (statement.status === 'REGISTERED') {
          console.log(`     ✅ Complaint ${statement.complaintId || statement.id} already has REGISTERED status from backend`);
        }
      });
      // Transform backend data to match frontend expectations
      const transformedStatements = sortedStatements.map((statement: any, index: number) => {
        console.log(`🔄 [${index + 1}/${sortedStatements.length}] Transforming statement:`, statement.complaintId || statement.id);

        try {
          // Check if backend provides victimNames and offenderNames arrays (new format)
          if (statement.victimNames && statement.offenderNames) {
            console.log('  ✅ Backend provided victimNames and offenderNames arrays');
            console.log('  📋 victimNames:', statement.victimNames);
            console.log('  📋 offenderNames:', statement.offenderNames);
            
            // Create participant objects from names for backward compatibility
            const participantsFromNames: any[] = [];
            
            // Create complainant participants from victimNames
            statement.victimNames.forEach((name: string, index: number) => {
              participantsFromNames.push({
                role: 'COMPLAINANT',
                citizen: {
                  name: name,
                  // Other fields will be empty since backend doesn't provide detailed info
                },
                name: name
              });
            });
            
            // Create offender participants from offenderNames
            statement.offenderNames.forEach((name: string, index: number) => {
              participantsFromNames.push({
                role: 'OFFENDER',
                citizen: {
                  name: name,
                  // Other fields will be empty since backend doesn't provide detailed info
                },
                name: name
              });
            });
            
            // Determine status using helper function
            const finalStatus = determineFIRStatus(statement);
            console.log(`  📊 Status determination: firNo=${statement.firNo}, backendStatus=${statement.status}, finalStatus=${finalStatus}`);

            return {
              complaintId: statement.complaintId || statement.id || Date.now() + index,
              subject: statement.subject || 'No Subject',
              description: statement.description || 'No Description',
              status: finalStatus,
              filedDate: statement.filedDate || statement.createdAt || new Date().toISOString(),
              createdOn: statement.createdOn || statement.createdAt || new Date().toISOString(),
              updatedOn: statement.updatedOn || statement.updatedAt || statement.createdOn || statement.createdAt || new Date().toISOString(),
              participants: participantsFromNames, // Use constructed participants
              complainants: statement.victimNames || [], // Keep for backward compatibility
              offenders: statement.offenderNames || [],  // Keep for backward compatibility
              victimName: statement.victimNames?.[0] || 'No complaint name',
              offenderName: statement.offenderNames?.[0] || 'No offender name',
              sectionId: statement.sectionId || 'N/A',
              firNo: statement.firNo || null,
              firRegisteredDate: statement.firRegisteredDate || null,
              victimId: statement.victimId || null,
              crimeAddress: statement.crimeAddress || statement.crimeLocation || statement.address || null,
              policeStationName: statement.policeStationName || statement.stationName || null,
              officerName: statement.officerName || statement.filedByOfficer || null,
              officerDesignation: statement.officerDesignation || statement.officerRank || 'Inspector',
            };
          }

          // Check if backend already provides complainants and offenders arrays
          if (statement.complainants && statement.offenders) {
            console.log('  ✅ Backend provided grouped data');
            console.log('  📋 complainants:', statement.complainants);
            console.log('  📋 offenders:', statement.offenders);

            // Determine status using helper function
            const finalStatus = determineFIRStatus(statement);

            return {
              complaintId: statement.complaintId || statement.id || Date.now() + index,
              subject: statement.subject || 'No Subject',
              description: statement.description || 'No Description',
              status: finalStatus,
              filedDate: statement.filedDate || statement.createdAt || new Date().toISOString(),
              createdOn: statement.createdOn || statement.createdAt || new Date().toISOString(),
              updatedOn: statement.updatedOn || statement.updatedAt || statement.createdOn || statement.createdAt || new Date().toISOString(),
              participants: statement.participants || [],
              complainants: statement.complainants || [],
              offenders: statement.offenders || [],
              victimName: statement.complainants?.[0] || 'No complaint name',
              offenderName: statement.offenders?.[0] || 'No offender name',
              sectionId: statement.sectionId || 'N/A',
              firNo: statement.firNo || null,
              firRegisteredDate: statement.firRegisteredDate || null,
              victimId: statement.victimId || null,
              crimeAddress: statement.crimeAddress || statement.crimeLocation || statement.address || null,
              policeStationName: statement.policeStationName || statement.stationName || null,
              officerName: statement.officerName || statement.filedByOfficer || null,
              officerDesignation: statement.officerDesignation || statement.officerRank || 'Inspector',
            };
          }

          // Fallback: Extract participants and group them
          const participants = statement.participants || [];

          // Try to get complainants and offenders arrays first
          let complainants = [];
          let offenders = [];

          if (Array.isArray(participants) && participants.length > 0) {
            complainants = participants
              .filter((p: any) => p.role === 'COMPLAINANT')
              .map((p: any) => p.citizen?.name || p.name || 'Unknown')
              .filter((name: string) => name && name !== 'Unknown');

            offenders = participants
              .filter((p: any) => p.role === 'OFFENDER')
              .map((p: any) => p.citizen?.name || p.name || 'Unknown')
              .filter((name: string) => name && name !== 'Unknown');
          }

          // Get single names for backward compatibility
          const victimParticipant = participants.find((p: any) => p.role === 'COMPLAINANT');
          const offenderParticipant = participants.find((p: any) => p.role === 'OFFENDER');

          // Create fallback names from statement level
          const victimName = victimParticipant?.citizen?.name ||
                            victimParticipant?.name ||
                            statement.victimName ||
                            statement.complainantName ||
                            statement.victim_name ||
                            (complainants.length > 0 ? complainants[0] : 'No complaint name');

          const offenderName = offenderParticipant?.citizen?.name ||
                             offenderParticipant?.name ||
                             statement.offenderName ||
                             statement.offender_name ||
                             (offenders.length > 0 ? offenders[0] : 'No offender name');

          // Ensure arrays have at least the single names if no array data
          if (complainants.length === 0 && victimName && victimName !== 'No complaint name') {
            complainants = [victimName];
          }
          if (offenders.length === 0 && offenderName && offenderName !== 'No offender name') {
            offenders = [offenderName];
          }

          // Determine status using helper function
          const finalStatus = determineFIRStatus(statement);
          console.log(`  📊 Status determination: firNo=${statement.firNo}, backendStatus=${statement.status}, finalStatus=${finalStatus}`);

          const transformed = {
            complaintId: statement.complaintId || statement.id || Date.now() + index,
            subject: statement.subject || 'No Subject',
            description: statement.description || 'No Description',
            status: finalStatus,
            filedDate: statement.filedDate || statement.createdAt || new Date().toISOString(),
            createdOn: statement.createdOn || statement.createdAt || new Date().toISOString(),
            updatedOn: statement.updatedOn || statement.updatedAt || statement.createdOn || statement.createdAt || new Date().toISOString(),
            participants: participants,
            complainants: complainants,
            offenders: offenders,
            victimName: victimName,
            offenderName: offenderName,
            sectionId: statement.sectionId || 'N/A',
            firNo: statement.firNo || null,
            firRegisteredDate: statement.firRegisteredDate || null,
            victimId: victimParticipant?.citizen?.citizenId || victimParticipant?.id || statement.victimId || null,
            crimeAddress: statement.crimeAddress || statement.crimeLocation || statement.address || null,
            policeStationName: statement.policeStationName || statement.stationName || null,
            officerName: statement.officerName || statement.filedByOfficer || null,
            officerDesignation: statement.officerDesignation || statement.officerRank || 'Inspector',
          };

          console.log(`  ✅ Transformed: ${transformed.complaintId} - ${transformed.victimName} - Complainants:`, transformed.complainants);
          console.log(`  🔍 Offender data: offenders=${transformed.offenders}, offenderName=${transformed.offenderName}`);
          return transformed;
        } catch (error) {
          console.error(`  ❌ Error transforming statement ${index + 1}:`, error);
          // Return a safe fallback instead of crashing
          return {
            complaintId: statement.complaintId || statement.id || Date.now() + index,
            subject: 'Error Loading Statement',
            description: 'There was an error loading this statement',
            status: 'ERROR',
            filedDate: new Date().toISOString(),
            createdOn: new Date().toISOString(),
            participants: [],
            complainants: ['Error'],
            offenders: ['Error'],
            victimName: 'Error Loading',
            offenderName: 'Error Loading',
            sectionId: 'N/A',
            firNo: null,
            firRegisteredDate: null,
            victimId: null,
          };
        }
      });

      // Final sort by the displayed date field: prioritize updatedOn (most recent changes first)
      let finalSorted = [...transformedStatements].sort((a: any, b: any) => {
        // Use updatedOn if available, otherwise use createdOn (most recent first)
        // This ensures newly created statements appear at the top
        const aDate = new Date(a.updatedOn || a.createdOn || a.filedDate || 0).getTime();
        const bDate = new Date(b.updatedOn || b.createdOn || b.filedDate || 0).getTime();
        return bDate - aDate;
      });

      try {
        const stored = localStorage.getItem('lastEditedStatement');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.ts && Date.now() - parsed.ts < 60000 && parsed?.id) {
            const idx = finalSorted.findIndex((c: any) => c.complaintId === parsed.id);
            if (idx !== -1) {
              const edited = finalSorted[idx];
              finalSorted = [edited, ...finalSorted.filter((c: any) => c.complaintId !== parsed.id)];
            }
          }
        }
      } catch {}

      console.log('🎉 Transformation complete. Final count:', finalSorted.length);
      console.log('📋 First few transformed records:');
      transformedStatements.slice(0, 3).forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.complaintId} - ${record.victimName} - Status: ${record.status}`);
      });

      // Log status distribution
      const statusCounts = transformedStatements.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 Status distribution from backend:', statusCounts);

      setCases(transformedStatements);

      // Force refresh FIR statuses after cases are loaded
      if (transformedStatements.length > 0) {
        // Run FIR status check once after data is loaded
        console.log('🔍 Checking FIR statuses for', transformedStatements.length, 'records');
        await checkAllFIRStatuses();
      }
    } catch (error) {
      console.error('❌ Critical error in fetchCases:', error);
      // Show error state instead of empty table
      setCases([{
        complaintId: 0,
        subject: 'Connection Error',
        description: 'Unable to load statements. Please check your connection and try again.',
        status: 'ERROR',
        createdOn: new Date().toISOString(),
        complainants: ['Connection Error'],
        offenders: ['Please Retry'],
        victimName: 'Connection Error',
        offenderName: 'Please Retry',
        sectionId: 'N/A',
        firNo: null,
        firRegisteredDate: null,
        victimId: null,
      }]);
    }
  };


  const handleNcRegister = (caseInfo: any) => {
    console.log('NC Case Info:', caseInfo);
    nav('/Ncpage', { state: { caseInfo: caseInfo } });
  };

  const openPopup = (caseItem: any) => {
    console.log('🔍 openPopup called with case:', caseItem);
    console.log('🔍 Setting isPopupOpen to true');
    setSelectedCase(caseItem);
    setIsPopupOpen(true);
    console.log('✅ Popup state updated');
  };

  const closePopup = () => {
    console.log('🔍 closePopup called');
    console.log('🔍 Setting isPopupOpen to false');
    setIsPopupOpen(false);
    setSelectedCase(null);
  };

  const handleSave = async (firData: any) => {
    console.log('🚀 handleSave called with firData:', firData);
    console.log('🚀 Selected case:', selectedCase);
    
    try {
      if (!selectedCase?.complaintId) {
        console.error('❌ No case selected!');
        alert('Please select a case first');
        throw new Error('No case selected');
      }

      console.log('📝 Starting FIR registration for complaint:', selectedCase.complaintId);
      await showLoading('Registering FIR...');

      const formData = new FormData();
      
      // Build the FIR DTO structure expected by backend
      const firDto = {
        description: firData.description || '',
        officerId: 1921, // This should be the logged-in officer's ID
        sections: Array.isArray(firData.section) 
          ? firData.section.join(',')
          : (firData.section || '')
      };

      console.log('🔍 FIR DTO to send:', firDto);

      // Add FIR data as JSON string
      formData.append('firData', JSON.stringify(firDto));
      console.log('✅ Added firData to FormData');

      
      if (!firData.file) {
    showError('FIR Document Required', 'Please attach the FIR document before registering.');
    return;
    }

      // Using path variable - IDs now use underscores instead of slashes
      const apiUrl = `/statements/${selectedCase.complaintId}/register-fir`;
      console.log('🌐 Making API call to:', apiUrl);
      
      // Make the API call
      try {
        const response = await request(
          'complaintandfir',
          'POST',
          apiUrl,
          formData,
          { skipAuth: false }
        );

        console.log('✅ FIR Registration Response:', response);
        console.log('✅ Response type:', typeof response);
        console.log('✅ Response keys:', Object.keys(response || {}));
        
        // If we get here, the request was successful
        if (response) {
          // Use backend-generated FIR ID
          const generatedFirId = response.firId;

          // Update local state with the response data
          setCases(prevCases =>
            prevCases.map(caseItem =>
              caseItem.complaintId === selectedCase.complaintId
                ? {
                    ...caseItem,
                    status: 'REGISTERED', // This should match the ComplaintStatus enum in the backend
                    hasFIR: true,
                    firNo: generatedFirId, // Use backend-generated FIR ID
                    firRegisteredDate: response.registeredOn || response.registeredDate || response.createdOn || response.createdAt || new Date().toISOString(), // Add registered date
                    sectionId: response.sections || firDto.sections
                  }
                : caseItem
            )
          );

          // Force immediate data refresh to get latest status from backend
          console.log('🔄 Forcing immediate data refresh after FIR registration...');
          await fetchCases();

          // Also trigger a refresh event for other components that might be listening
          window.dispatchEvent(new CustomEvent('statementsRefresh'));

          // Close loading first
          closeLoading();

          // Show FIR success popup with backend-generated FIR ID after a small delay
          setTimeout(() => {
            console.log('🎉 Showing FIR success popup with firId:', generatedFirId);
            setFirSuccessData({
              firId: generatedFirId,
              complaintId: String(selectedCase.complaintId)
            });
            setIsFirSuccessPopupOpen(true);
          }, 100);

          // Close the FIR registration popup
          closePopup();
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error: any) {
        // Handle API errors
        console.error('❌ API Call Error:', error);
        console.error('❌ Error type:', typeof error);
        console.error('❌ Error message:', error?.message);
        console.error('❌ Error response:', error?.response);
        
        if (error.response) {
          console.error('❌ Server responded with error status:', error.response.status);
          console.error('❌ Error response data:', error.response.data);
          
          let errorMessage = 'Failed to register FIR. ';
          if (error.response.status === 400) {
            errorMessage += 'Bad Request. Please check your input.';
            if (error.response.data) {
              errorMessage += ' Details: ' + JSON.stringify(error.response.data);
            }
          } else if (error.response.status === 500) {
            errorMessage += 'Server error. Please try again later.';
          }
          
          throw new Error(errorMessage);
        } else if (error.request) {
          console.error('❌ No response received:', error.request);
          throw new Error('No response from server. Please check your connection.');
        } else {
          console.error('❌ Request setup error:', error.message);
          throw error;
        }
      }
      
    } catch (error: any) {
      console.error('FIR Registration Error:', error);
      
      let errorMessage = 'Failed to register FIR. ';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 400) {
          errorMessage += 'Bad Request. ';
          if (error.response.data) {
            // Try to extract a more specific error message from the response
            const responseData = error.response.data;
            if (typeof responseData === 'string' && responseData.includes('Data truncated for column')) {
              errorMessage += 'Invalid data format. Please check your input and try again.';
            } else if (responseData.message) {
              errorMessage += responseData.message;
            } else {
              errorMessage += JSON.stringify(responseData);
            }
          }
        } else if (error.response.status === 500) {
          errorMessage += 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        errorMessage += error.message || 'An unknown error occurred.';
      }
      
      showError('Registration Failed', errorMessage);
      closeLoading();
    }
  };


  const checkFIRStatus = async (complaintId: any) => {
    try {
      console.log('🔍 Making API call to check FIR status for complaint:', complaintId);
      // Using path variable - IDs now use underscores instead of slashes
      const response = await request('complaintandfir', 'GET', `/statements/${complaintId}/has-fir`, null);
      console.log('FIR status response for complaint', complaintId, ':', response);
      console.log('Response type:', typeof response);
      console.log('Response value:', response);

      // Handle different response formats more robustly
      if (typeof response === 'boolean') {
        return response;
      } else if (response && typeof response === 'object') {
        // If response has a 'hasFIR' or 'hasFir' property
        const hasFIR = Boolean(response.hasFIR || response.hasFir || response.registered || response.status === 'REGISTERED');
        console.log('Extracted hasFIR value:', hasFIR);
        return hasFIR;
      } else if (typeof response === 'string') {
        // If response is a string like "true" or "false"
        const hasFIR = response.toLowerCase() === 'true';
        console.log('String response parsed as:', hasFIR);
        return hasFIR;
      } else if (typeof response === 'number') {
        // If response is a number (1 for true, 0 for false)
        const hasFIR = response === 1;
        console.log('Number response parsed as:', hasFIR);
        return hasFIR;
      }

      console.warn('Unexpected FIR status response format:', response);
      return false;
    } catch (error) {
      console.error('Error checking FIR status for complaint', complaintId, ':', error);
      // Return false on error - don't assume pending means no FIR
      return false;
    }
  };

  function handleEditClick(caseItem: any): void {
    console.log('📝 Edit clicked for case:', caseItem);
    
    // Validate that we have a valid complaintId
    if (!caseItem || !caseItem.complaintId) {
      console.error('❌ Invalid case item or missing complaintId:', caseItem);
      showError('Edit Error', '');
      return;
    }
    
    console.log('✅ Valid complaintId found:', caseItem.complaintId);
    nav(`/register-statement/${caseItem.complaintId}`, {
      state: {
        from: 'allstatements',
        isEdit: true,
        editMode: true,
        caseData: caseItem,
      },
    });
  }
  const toggleDetails = (index: number) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={allstatements} />
  <div className="Searchbar pt-2 relative text-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-6 w-full ">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Show Count Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('table.show')}</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-boxdark text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('table.statements')}</span>
          </div>
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
              onClick={clearSearch}
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
        <div className="w-full overflow-x-auto hidden lg:block">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-lightcyan text-left dark:bg-meta-4">
                <th className="min-w-[80px] py-3 px-4 font-semibold text-black dark:text-white">
                  {index}
                </th>
                <th className="min-w-[200px] py-3 px-4 font-semibold text-black dark:text-white">
                  {complaintname}
                </th>
                <th className="min-w-[200px] py-3 px-4 font-semibold text-black dark:text-white">
                  {offendername}
                </th>
                <th className="min-w-[200px] py-3 px-4 font-semibold text-black dark:text-white">
                  {reportdate}
                </th>
                <th className="min-w-[250px] py-3 px-4 font-semibold text-black dark:text-white">
                  Short Description
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white min-w-[200px]">
                  {actions}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {firstatus}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.length > 0 ? (
                currentTableData.map((item, index) => (
                  <tr key={`${item.complaintId}-${index}`}>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {(currentPage - 1) * pageSize + index + 1}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <div>
                        {item.complainants && item.complainants.length > 0 ? (
                          item.complainants.map((complainant: string, idx: number) => (
                            <p key={`complainant-${item.complaintId}-${idx}`} className="mb-1">{complainant}</p>
                          ))
                        ) : (
                          <p className="mb-1">{item.victimName || 'No complaint data'}</p>
                        )}
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <div>
                        {item.offenders && item.offenders.length > 0 ? (
                          item.offenders.map((offender: string, idx: number) => (
                            <p key={`offender-${item.complaintId}-${idx}`} className="mb-1">{offender}</p>
                          ))
                        ) : (
                          <p className="mb-1">{item.offenderName || 'No offender data'}</p>
                        )}
                      </div>
                    </td>

                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.status === 'REGISTERED' && item.firRegisteredDate
                          ? formatDate(item.firRegisteredDate)
                          : formatDate(item.filedDate || item.createdOn)}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      {renderDescription(
                        item.description || item.subject || 'N/A',
                        100
                      )}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 rounded"
                        onClick={() => handleEditClick(item)}
                        title="Edit Statement"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 rounded"
                        onClick={() => handleNcRegister(item)}
                        title="Download NC"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>NC</span>
                      </button>
                      {item.status !== 'REGISTERED' && (
                        <button
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 rounded"
                          onClick={(e) => {
                            console.log('🔘 Register FIR button clicked!');
                            console.log('🔘 Event:', e);
                            console.log('🔘 Item:', item);
                            e.stopPropagation();
                            openPopup(item);
                          }}
                          title="Register FIR"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Register FIR</span>
                        </button>
                      )}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-center">
                      {item.status === 'REGISTERED' ? (
                        <span className="text-sm font-medium text-gray-700">Registered</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-700">Pending</span>
                      )}
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
                  Complaint's Name
                  {' :'} 
                  <div>
                    {item.complainants && item.complainants.length > 0 ? (
                      item.complainants.map((complainant: string, index: number) => (
                        <span key={index} className="block">{complainant}</span>
                      ))
                    ) : (
                      <span>{item.victimName || 'No complaint data'}</span>
                    )}
                  </div>
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
                    {offendername} : 
                    <div>
                      {item.offenders && item.offenders.length > 0 ? (
                        item.offenders.map((offender: string, index: number) => (
                          <span key={index} className="block">{offender}</span>
                        ))
                      ) : (
                        <span>{item.offenderName || 'No offender data'}</span>
                      )}
                    </div>
                  </p>

                  <p className="text-black dark:text-white">
                    Registered Date :{' '}
                    {item.status === 'REGISTERED' && item.firRegisteredDate
                      ? formatDate(item.firRegisteredDate)
                      : formatDate(item.filedDate || item.createdOn)}
                  </p>
                  <p className="text-black dark:text-white">
                    {firstatus} :{' '}
                    {item.status === 'REGISTERED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded border border-green-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Registered</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-700">Pending</span>
                    )}
                  </p>
                  <p className="text-black dark:text-white">
                    {section} : {item.sectionId}
                  </p>

                  <button
                    style={{
                      boxShadow:
                        'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                    }}
                    onClick={() => handleEditClick(item)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 bg-slate-50 p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                  >
                    {edit}
                  </button>
                  <button
                    style={{
                      boxShadow:
                        'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                    }}
                    onClick={() => handleNcRegister(item)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 bg-slate-50 p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                  >
                    {nc}
                  </button>
                  {item.status !== 'REGISTERED' && (
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => openPopup(item)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 bg-slate-50 p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {registercase}
                    </button>
                  )}
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
        totalCount={cases.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
      <Firpopup isOpen={isPopupOpen} onClose={closePopup} onSave={handleSave} />

      {/* FIR Success Popup */}
      {isFirSuccessPopupOpen && (
        <FirSuccessPopup
          isOpen={isFirSuccessPopupOpen}
          firId={firSuccessData.firId}
          complaintId={firSuccessData.complaintId}
        />
      )}

      {/* Success Popup */}
      <SuccessPopup
        isOpen={isSuccessPopupOpen}
        onClose={() => {
          setIsSuccessPopupOpen(false);
          // Navigate to registered FIR page
          nav('/registeredCases');
        }}
        title={successDetails.title}
        message={successDetails.message}
        type={successDetails.type}
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

export default Allstatements;
