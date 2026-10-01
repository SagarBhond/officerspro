import React, { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom';
import request from '../Service/axios_helper';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../common/DateUtils';
import DescriptionModal from '../common/DescriptionModal';

// PageSize is now dynamic - controlled by component state

interface CaseData {
  complaintId?: number;
  victimName?: string | React.ReactElement;
  offenderName?: string | React.ReactElement;
  firNo?: string;
  sectionId?: string;
  shortDescription?: string;
  created_on?: string;
  victimId?: string;
  subject?: string;
  description?: string;
  status?: string;
  filedDate?: string;
  createdOn?: string;
  firRegisteredDate?: string | null;
  participants?: any[];
  complainants?: string[];
  offenders?: string[];
}

type RegisteredcasesProps = {
  handleLogout: () => void;
};

const Registeredcases: React.FC<RegisteredcasesProps> = ({ handleLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<CaseData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOpen] = useState<{[key: number]: boolean}>({});
  const [pageSize, setPageSize] = useState<number>(7); // Dynamic page size with default 7
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    reportdate,
    index: indexLabel,
    complaintname,
    offendername,
    firno,
    section,
    viewferrist,
  } = t('table') as any;
  // Use translation or fallback values
  const registeredcase = t('breadcrumb.registeredcase') || 'Registered Cases';

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

  const normalizeText = (text: string | number | null | undefined) => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    if (text === null || text === undefined) return '';
    return String(text).normalize('NFC').toLowerCase().trim();
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
      normalizeText(String(item?.complaintId || '')).includes(normalizedQuery) ||
      normalizeText(item?.subject || '').includes(normalizedQuery) ||
      normalizeText(item?.description || '').includes(normalizedQuery) ||
      normalizeText(item?.sectionId || '').includes(normalizedQuery) ||
      checkDateMatch(item?.filedDate) ||
      checkDateMatch(item?.createdOn) ||
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

  const extractSectionId = (firResponse: any, statement: any) => {
    console.log('🔍 extractSectionId called with:', { firResponse, statement });
    
    const collectFromUnknown = (obj: any): string => {
      try {
        const out: string[] = [];
        const keysToCheck = ['section', 'sections', 'ipcSection', 'sectionId', 'sec', 'sectionCode', 'acts'];
        const visit = (val: any) => {
          if (val == null) return;
          if (typeof val === 'string' || typeof val === 'number') {
            const s = String(val).trim();
            if (s) out.push(s);
            return;
          }
          if (Array.isArray(val)) {
            for (const item of val) visit(item);
            return;
          }
          if (typeof val === 'object') {
            const objKeys = Object.keys(val);
            for (const k of objKeys) {
              const v = (val as any)[k];
              if (keysToCheck.some(kk => k.toLowerCase().includes(kk))) visit(v);
            }
          }
        };
        visit(obj);
        return out.filter(Boolean).join(',') || 'N/A';
      } catch {
        return 'N/A';
      }
    };
    
    // First, try direct sections field (most common case from backend)
    if (firResponse?.sections && typeof firResponse.sections === 'string' && firResponse.sections.trim() !== '') {
      console.log('✅ Found sections as string:', firResponse.sections);
      return firResponse.sections;
    }
    
    const raw: any = (
      firResponse?.sections ??
      firResponse?.section ??
      firResponse?.acts ??
      firResponse?.firSections ??
      firResponse?.offenceSections ??
      firResponse?.sectionsList ??
      firResponse?.sectionList ??
      firResponse?.ipcSections ??
      statement?.sections ??
      statement?.section ??
      statement?.acts ??
      statement?.sectionId ??
      statement?.section_id ??
      null
    );
    
    console.log('🔍 Raw sections value:', { raw, type: typeof raw, isArray: Array.isArray(raw) });
    
    if (Array.isArray(raw)) {
      if (raw.length === 0) return 'N/A';
      const first = raw[0];
      if (typeof first === 'string' || typeof first === 'number') {
        return raw
          .map((s: any) => (s != null ? String(s).trim() : ''))
          .filter((s: string) => s !== '')
          .join(',');
      }
      if (typeof first === 'object') {
        const keys = ['sectionId', 'section', 'code', 'name', 'id', 'ipcSection', 'value', 'label'];
        const values = raw
          .map((obj: any) => {
            for (const k of keys) {
              const v = obj?.[k];
              if (v != null && String(v).trim() !== '') return String(v).trim();
            }
            // handle nested structures like { act: { section: '...' } }
            const nested = obj?.act || obj?.ipc || obj?.law;
            if (nested) {
              for (const k of keys) {
                const v = nested?.[k];
                if (v != null && String(v).trim() !== '') return String(v).trim();
              }
            }
            return '';
          })
          .filter((s: string) => s !== '');
        return values.length ? values.join(',') : 'N/A';
      }
      return 'N/A';
    }
    if (raw && typeof raw === 'object') {
      const keys = ['sectionId', 'section', 'code', 'name', 'id', 'ipcSection', 'value', 'label'];
      for (const k of keys) {
        const v = (raw as any)[k];
        if (v != null && String(v).trim() !== '') return String(v).trim();
      }
      const deep = collectFromUnknown(raw);
      if (deep && deep !== 'N/A') return deep;
    }
    if (raw != null && String(raw).trim() !== '') return String(raw).trim();
    const deep = collectFromUnknown(firResponse);
    if (deep && deep !== 'N/A') return deep;
    
    console.log('⚠️ No sections found, returning N/A');
    return 'N/A';
  };

  useEffect(() => {
    const handleFIRRegistered = () => {
      console.log(' FIR registered event received, refreshing Registered Cases data');
      fetchCases();
    };

    window.addEventListener('firRegistered', handleFIRRegistered);

    return () => {
      window.removeEventListener('firRegistered', handleFIRRegistered);
    };
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    console.log('🚀 Initial mount - fetching registered FIR cases...');
    fetchCases();
  }, []);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const fetchCases = async () => {
    try {
      console.log('🚀 Starting data fetch for REGISTERED CASES - requesting statements with FIRs...');
const token = localStorage.getItem('token');
console.log('🔑 Token in localStorage:', token ? 'EXISTS' : 'MISSING');
console.log('🔑 Token value:', token);
      let response = await request('complaintandfir', 'GET', '/statements?status=REGISTERED&page=0&size=1000&sort=updatedOn,desc', {});
      let registeredOnly = true;

      console.log('📦 Raw API Response for Registered Cases:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', response ? Object.keys(response) : 'null');

      // IMPORTANT: Extract data from axios response wrapper
      const responseData = response?.data || response;
      console.log('📦 Extracted response data:', responseData);

      // Handle different response formats more robustly (similar to AllStatements.tsx)
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
      if (!statements.length) {
        try {
          response = await request('complaintandfir', 'GET', '/statements?page=0&size=1000&sort=updatedOn,desc', {});
          registeredOnly = false;
          let fallbackData: any = (response as any)?.data ?? response;
          if (fallbackData && fallbackData.data && !Array.isArray(fallbackData)) {
            const inner = fallbackData.data;
            if (inner && !Array.isArray(inner)) {
              fallbackData = inner;
            }
          }
          if (Array.isArray(fallbackData)) {
            statements = fallbackData;
          } else if (fallbackData && typeof fallbackData === 'object') {
            if (fallbackData.content && Array.isArray(fallbackData.content)) {
              statements = fallbackData.content;
            } else if (fallbackData.data && Array.isArray(fallbackData.data)) {
              statements = fallbackData.data;
            } else if (fallbackData.data && fallbackData.data.content && Array.isArray(fallbackData.data.content)) {
              statements = fallbackData.data.content;
            } else if (fallbackData.statements && Array.isArray(fallbackData.statements)) {
              statements = fallbackData.statements;
            }
          }
          console.log('📦 Fallback statements array length:', statements.length);
        } catch (e) {
          console.warn('⚠️ Fallback fetch failed', e);
        }
      }

      if (statements.length === 0) {
        console.warn('⚠️ No statements found in any format');
        setCases([]);
        return;
      }

      // Log details about each statement to understand FIR status
      console.log('📋 Detailed statement analysis for FIR status:');
      statements.forEach((statement, index) => {
        console.log(`  ${index + 1}. ID: ${statement.complaintId || statement.id}`);
        console.log(`     Status: ${statement.status} (type: ${typeof statement.status})`);
        console.log(`     Has FIR field: ${statement.hasFIR} (type: ${typeof statement.hasFIR})`);
        console.log(`     FIR Number: ${statement.firNo} (type: ${typeof statement.firNo})`);
        if (statement.status === 'REGISTERED') {
          console.log(`     ✅ Complaint ${statement.complaintId || statement.id} already has REGISTERED status from backend`);
        }
      });

      // Filter statements that have FIRs and transform data
      const transformedStatements: CaseData[] = [];

      for (const statement of statements) {
        console.log('🔍 Processing statement for FIR cases:', {
          complaintId: statement.complaintId,
          hasFIR: statement.hasFIR,
          status: statement.status,
          firNo: statement.firNo,
          subject: statement.subject
        });

        // Check for FIR in multiple ways (simplified and more robust)
        const hasFIR = statement.hasFIR === true ||
                      statement.status === 'REGISTERED' ||
                      (statement.firNo && statement.firNo.trim() !== '' && statement.firNo !== 'null' && statement.firNo !== 'undefined') ||
                      statement.registered === true ||
                      statement.firRegistered === true;

        if (hasFIR) {
          console.log('🔍 Found FIR-registered statement:', statement.complaintId, statement.firNo);

          try {
            // Try to get FIR details, but don't fail if it doesn't work
            let firResponse = null;
            try {
              const firResponseRaw = await request('complaintandfir', 'GET', `/statements/${statement.complaintId}/fir-details`, null);
              firResponse = firResponseRaw?.data || firResponseRaw;
              console.log('🔍 FIR details response for', statement.complaintId, ':', firResponse);
            } catch (firError) {
              console.warn('⚠️ Could not fetch FIR details for', statement.complaintId, 'but continuing anyway');
            }

            // Show the case even if FIR details API fails, but log the error
            const sectionId = firResponse && firResponse.sections && firResponse.sections.trim()
              ? firResponse.sections.trim()
              : 'FIR Registered';

            console.log('🔍 Sections data:', {
              rawSections: firResponse?.sections,
              processedSectionId: sectionId,
              isArray: Array.isArray(firResponse?.sections),
              sectionsType: typeof firResponse?.sections,
              sectionsLength: firResponse?.sections?.length || 0,
              isTrimmedEmpty: firResponse?.sections?.trim() === ''
            });

            transformedStatements.push({
              complaintId: statement.complaintId,
              subject: statement.subject,
              description: statement.description,
              status: 'REGISTERED', // Always set to REGISTERED for FIR cases
              filedDate: statement.filedDate,
              createdOn: statement.createdOn,
              firRegisteredDate: firResponse?.registeredOn || firResponse?.registeredDate || firResponse?.createdOn || firResponse?.createdAt || null,
              participants: statement.participants || [],
              victimName: (() => {
                console.log('🔍 Statement complainants:', statement.complainants);
                console.log('🔍 Statement offenders:', statement.offenders);

                // Use the complainants array directly from backend
                if (statement.complainants && statement.complainants.length > 0) {
                  console.log('✅ Found complainants:', statement.complainants);
                  const filteredComplainants = statement.complainants.filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                  return (
                    <div className="space-y-1">
                      {filteredComplainants.map((complainant, idx) => (
                        <div key={idx} className="text-sm">
                          {complainant}
                        </div>
                      ))}
                    </div>
                  );
                }

                // Fallback to victimNames if provided in new format
                if (statement.victimNames && statement.victimNames.length > 0) {
                  const filteredVictims = statement.victimNames.filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                  if (filteredVictims.length > 0) {
                    return (
                      <div className="space-y-1">
                        {filteredVictims.map((name: string, idx: number) => (
                          <div key={idx} className="text-sm">
                            {name}
                          </div>
                        ))}
                      </div>
                    );
                  }
                }

                // Fallback to participants if complainants is not available
                if (statement.participants && statement.participants.length > 0) {
                  const victims = statement.participants.filter((p: any) => p.role === 'COMPLAINANT');
                  console.log('🔍 Found victims in participants:', victims);
                  if (victims.length > 0) {
                    const victimNames = victims.map((p: any) => p.citizen?.name).filter((name: string) => name && name !== 'Unknown');
                    return (
                      <div className="space-y-1">
                        {victimNames.map((name, idx) => (
                          <div key={idx} className="text-sm">
                            {name}
                          </div>
                        ))}
                      </div>
                    );
                  }
                }

                console.log('❌ No victims found');
                return <span className="text-gray-500">N/A</span>;
              })(),
              offenderName: (() => {
                // 1) Try new array from backend
                if (statement.offenderNames && statement.offenderNames.length > 0) {
                  console.log('✅ Found offenders in offenderNames array:', statement.offenderNames);
                  const filtered = statement.offenderNames.filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                  if (filtered.length > 0) {
                    return (
                      <div className="space-y-1">
                        {filtered.map((offender: string, idx: number) => (
                          <div key={idx} className="text-sm">
                            {offender}
                          </div>
                        ))}
                      </div>
                    );
                  }
                }

                // 2) Try old offenders array
                if (statement.offenders && statement.offenders.length > 0) {
                  console.log('✅ Found offenders in offenders array:', statement.offenders);
                  const filtered = statement.offenders.filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                  if (filtered.length > 0) {
                    return (
                      <div className="space-y-1">
                        {filtered.map((offender: string, idx: number) => (
                          <div key={idx} className="text-sm">
                            {offender}
                          </div>
                        ))}
                      </div>
                    );
                  }
                }

                // 3) Participants roles
                if (statement.participants && statement.participants.length > 0) {
                  const offenders = statement.participants.filter((p: any) => p.role === 'OFFENDER' || p.role === 'ACCUSED');
                  console.log('🔍 Found offenders in participants:', offenders);
                  if (offenders.length > 0) {
                    const offenderNames = offenders
                      .map((p: any) => p.citizen?.name || p.name || 'Unknown')
                      .filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                    if (offenderNames.length > 0) {
                      return (
                        <div className="space-y-1">
                          {offenderNames.map((name: string, idx: number) => (
                            <div key={idx} className="text-sm">
                              {name}
                            </div>
                          ))}
                        </div>
                      );
                    }
                  }
                }

                // 4) FIR details victimList[0].offenderList
                const offendersFromFir = (firResponse?.victimList?.[0]?.offenderList || [])
                  .map((o: any) => o?.offenderName || o?.name || o?.citizen?.name || 'Unknown')
                  .filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                if (offendersFromFir.length > 0) {
                  console.log('✅ Using offenders from FIR details:', offendersFromFir);
                  return (
                    <div className="space-y-1">
                      {offendersFromFir.map((name: string, idx: number) => (
                        <div key={idx} className="text-sm">
                          {name}
                        </div>
                      ))}
                    </div>
                  );
                }

                console.log('❌ No offenders found');
                return <span className="text-gray-500">N/A</span>;
              })(),
              sectionId: sectionId,
              firNo: statement.firNo || 'FIR-' + statement.complaintId, // Fallback FIR number
              shortDescription: statement.description?.substring(0, 100) + '...' || 'N/A',
            });

            console.log('✅ Added FIR case:', statement.complaintId, 'with sections:', sectionId);

          } catch (error) {
            console.error('❌ Error getting FIR details for statement:', statement.complaintId, error);

            // Still add the statement even if FIR details fail
            transformedStatements.push({
              complaintId: statement.complaintId,
              subject: statement.subject,
              description: statement.description,
              status: 'REGISTERED', // Always set to REGISTERED for FIR cases
              filedDate: statement.filedDate,
              createdOn: statement.createdOn,
              firRegisteredDate: null,
              participants: statement.participants || [],
              victimName: (() => {
                console.log('🔍 Statement complainants (error case):', statement.complainants);

                // Use the complainants array directly from backend
                if (statement.complainants && statement.complainants.length > 0) {
                  console.log('✅ Found complainants (error case):', statement.complainants);
                  const filteredComplainants = statement.complainants.filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                  return (
                    <div className="space-y-1">
                      {filteredComplainants.map((complainant, idx) => (
                        <div key={idx} className="text-sm">
                          {complainant}
                        </div>
                      ))}
                    </div>
                  );
                }

                // Fallback to participants if complainants is not available
                if (statement.participants && statement.participants.length > 0) {
                  const victims = statement.participants.filter((p: any) => p.role === 'COMPLAINANT');
                  console.log('🔍 Found victims in participants (error case):', victims);
                  if (victims.length > 0) {
                    const victimNames = victims.map((p: any) => p.citizen?.name).filter((name: string) => name && name !== 'Unknown');
                    return (
                      <div className="space-y-1">
                        {victimNames.map((name, idx) => (
                          <div key={idx} className="text-sm">
                            {name}
                          </div>
                        ))}
                      </div>
                    );
                  }
                }

                console.log('❌ No victims found (error case)');
                return <span className="text-gray-500">N/A</span>;
              })(),
              offenderName: (() => {
                // First try the offenders array directly from backend (error case)
                if (statement.offenders && statement.offenders.length > 0) {
                  console.log('✅ Found offenders (error case):', statement.offenders);
                  const filteredOffenders = statement.offenders.filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                  return (
                    <div className="space-y-1">
                      {filteredOffenders.map((offender, idx) => (
                        <div key={idx} className="text-sm">
                          {offender}
                        </div>
                      ))}
                    </div>
                  );
                }

                // Fallback to participants if offenders array is not available (like victims logic)
                if (statement.participants && statement.participants.length > 0) {
                  const offenders = statement.participants.filter((p: any) => p.role === 'OFFENDER');
                  console.log('🔍 Found offenders in participants (error case):', offenders);
                  if (offenders.length > 0) {
                    const offenderNames = offenders
                      .map((p: any) => p.citizen?.name || p.name || 'Unknown')
                      .filter((name: string) => name && name !== 'Unknown' && name !== 'N/A' && name !== 'Not Specified');
                    console.log('✅ Extracted offender names (error case):', offenderNames);
                    return (
                      <div className="space-y-1">
                        {offenderNames.map((name, idx) => (
                          <div key={idx} className="text-sm">
                            {name}
                          </div>
                        ))}
                      </div>
                    );
                  }
                }

                console.log('❌ No offenders found (error case)');
                return <span className="text-gray-500">N/A</span>;
              })(),
              sectionId: 'FIR Registered',
              firNo: statement.firNo || 'FIR-' + statement.complaintId, // Fallback FIR number
              shortDescription: statement.description?.substring(0, 100) + '...' || 'N/A',
            });

            console.log('✅ Added FIR case despite error:', statement.complaintId);
          }
        } else {
          console.log('⚠️ Skipping non-FIR statement:', statement.complaintId, 'Status:', statement.status);
        }
      }

      console.log('🎉 FIR cases transformation complete. Final count:', transformedStatements.length);
      console.log('📋 FIR cases found:');
      transformedStatements.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.complaintId} - ${record.victimName} - FIR: ${record.firNo} - Status: ${record.status}`);
      });

      // Sort latest updated on top (most recently updated cases appear first)
      let sorted = [...transformedStatements].sort((a, b) => {
        const aDate = new Date(a.updatedOn || a.firRegisteredDate || a.createdOn || a.filedDate || 0).getTime();
        const bDate = new Date(b.updatedOn || b.firRegisteredDate || b.createdOn || b.filedDate || 0).getTime();
        return bDate - aDate;
      });
      try {
        const stored = localStorage.getItem('lastEditedStatement');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.ts && Date.now() - parsed.ts < 60000 && parsed?.id) {
            const idx = sorted.findIndex((c: any) => c.complaintId === parsed.id);
            if (idx !== -1) {
              const edited = sorted[idx];
              sorted = [edited, ...sorted.filter((c: any) => c.complaintId !== parsed.id)];
            }
          }
        }
      } catch {}
      setCases(sorted);
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ Critical error in fetchCases for Registered Cases:', error);
      // Show error state instead of empty table
      setCases([{
        complaintId: 0,
        subject: 'Connection Error',
        description: 'Unable to load registered FIR cases. Please check your connection and try again.',
        status: 'ERROR',
        createdOn: new Date().toISOString(),
        complainants: ['Connection Error'],
        offenders: ['Please Retry'],
        victimName: 'Connection Error',
        offenderName: 'Please Retry',
        sectionId: 'N/A',
      }]);
    }
  };

  const handleEditClick = (victimId: string) => {
    navigate(`/register-statement/${victimId}`, {
      state: { from: 'registeredCases' },
    });
  };

  const handleFerristClick = (victimId: string) => {
    navigate(`/ferristtable/${victimId}`);
  };

  const handleNewInvestigationClick = (firNo: string) => {
    console.log('Navigating to new investigation with FIR No:', firNo);
    navigate(`/newinvestigation/${firNo}`);
  };
  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={registeredcase} />
      <div className="Searchbar pt-2 relative text-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-6 w-full ">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Show Count Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('table.show')}</span>
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('table.cases')}</span>
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
            placeholder="Search cases..."
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

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
        <div className="w-full overflow-x-auto hidden lg:block">
          {filteredCases.length > 0 ? (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-lightcyan text-left dark:bg-meta-4">
                  <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                    {indexLabel}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                    {complaintname}
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
                    Short Description
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    New Investigation
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCases
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item, index) => (
                  <tr key={index}>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-sm font-medium text-black">
                        {(currentPage - 1) * pageSize + index + 1}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-sm font-medium text-black">
                        {item.victimName}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-sm font-medium text-black">
                        {item.offenderName}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-sm font-medium text-black">{item.firNo}</p>
                    </td>

                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-sm font-medium text-black">
                        {item.firRegisteredDate ? formatDate(item.firRegisteredDate) : formatDate(item.createdOn)}
                      </p>
                    </td>

                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-sm font-medium text-black">
                        {item.sectionId}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      {renderDescription(
                        item.description || item.subject || 'N/A',
                        100
                      )}
                    </td>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      <div className="flex items-center justify-center">
                        {/* New Investigation Button with Fingerprint Icon */}
                        <button
                          className="hover:text-primary transition-colors"
                          onClick={() => handleNewInvestigationClick(item.firNo || '')}
                          title="New Investigation"
                        >
                          <svg
                            className="fill-current"
                            fill=""
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 491.494 491.494"
                            strokeWidth="0.0049149400000000005"
                          >
                            <g id="SVGRepo_iconCarrier">
                              <g>
                                <g>
                                  <path d="M39.302,138.132c3.291,0.714,6.346,0.662,15.728-6.54c4.168-3.204,10.325-8.59,16.01-16.117l2.491-3.301 C94.832,83.842,144.7,17.512,216.727,21.121c59.398,4.331,101.508,49.187,121.757,129.725c0.691,2.738,1.107,4.413,1.571,5.71 c3.097,13.167,8.288,29.575,15.771,34.98c1.848,1.34,3.999,1.98,6.127,1.98c3.246,0,6.461-1.505,8.509-4.347 c3.274-4.533,2.404-10.805-1.891-14.28c-2.069-2.68-5.959-13.888-8.276-23.913c-0.136-0.597-0.33-1.173-0.566-1.732 c-0.195-0.686-0.568-2.18-0.908-3.517c-3.209-12.77-11.735-46.678-32.417-78.567c-26.712-41.183-63.142-63.718-108.283-66.97 c-0.07-0.011-0.14-0.011-0.221-0.011C134.7-4.07,80.083,68.559,56.768,99.568l-2.451,3.257 c-6.383,8.44-13.925,13.694-16.524,15.215c-0.875,0.351-1.727,0.821-2.518,1.417c-3.263,2.472-4.857,6.689-3.979,10.685 C32.175,134.132,35.301,137.257,39.302,138.132z"></path>
                                  <path d="M43.97,245.815c34.618-9.417,66.601-28.597,68-29.437c45.162-27.656,86.126-71.235,86.469-71.646 c16.91-19.369,41.931-37.94,61.447-31.966c11.491,3.519,19.46,9.777,23.681,18.605c5.056,10.563,4.663,24.853-1.075,39.198 c-0.605,1.515-1.295,3.05-2.046,4.599c7.374,0.396,14.57,1.464,21.534,3.136c7.892-19.76,8.087-40.166,0.501-55.993 c-6.753-14.137-19.363-24.372-36.447-29.605c-25.08-7.675-55.478,6.251-83.33,38.163c-0.354,0.392-40,42.09-81.631,67.583 c-0.305,0.184-30.782,18.461-62.61,27.139c-5.589,1.515-8.885,7.286-7.364,12.866C32.613,244.047,38.377,247.349,43.97,245.815z"></path>
                                  <path d="M153.876,295.054c0-4.156,0.213-8.263,0.627-12.312c-29.438,17.887-67.814,39.939-97.787,52.746 c-5.327,2.28-7.796,8.434-5.522,13.768c1.705,3.986,5.576,6.369,9.65,6.369c1.377,0,2.777-0.275,4.122-0.842 c27.386-11.718,61.274-30.707,89.523-47.556C154.084,303.224,153.876,299.162,153.876,295.054z"></path>
                                  <path d="M454.778,451.717l-94.13-94.131c14.188-17.851,22.678-40.424,22.678-64.946c0-57.654-46.905-104.559-104.559-104.559 S174.208,234.986,174.208,292.64c0,57.653,46.905,104.558,104.559,104.558c18.336,0,35.58-4.75,50.578-13.074l96.514,96.514 c3.993,3.992,9.226,5.988,14.459,5.988c5.232,0,10.467-1.996,14.459-5.988C462.763,472.65,462.763,459.703,454.778,451.717z"></path>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-4 text-sm font-medium text-black">No records found</p>
          )}
        </div>
        {/* End Mobile Collapsible List View */}
      </div>
      {/* Pagination */}
      {filteredCases.length > 0 && (
        <Pagination
          className="pagination-bar"
          currentPage={currentPage}
          totalCount={filteredCases.length}
          pageSize={pageSize}
          onPageChange={(page: number) => setCurrentPage(page)}
        />
      )}

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

export default Registeredcases;
