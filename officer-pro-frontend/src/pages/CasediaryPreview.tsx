import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import request from '../Service/axios_helper';
import Loader from '../common/Loader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import DescriptionModal from '../common/DescriptionModal';

type CasediaryPreviewProps = {
  handleLogout: () => void;
};

// Evidence Preview Component
const EvidencePreview: React.FC<{ documentId: number }> = ({ documentId }) => {
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        setLoading(true);
        setError('');
        const { getSignedUrlString } = await import('../services/documentService');
        const url = await getSignedUrlString(documentId);
        setSignedUrl(url);
      } catch (err: any) {
        console.error('Error fetching signed URL:', err);
        setError(err.message || 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchSignedUrl();
    }
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center text-red-500">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">No preview available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center" style={{ maxHeight: '400px' }}>
      <img
        src={signedUrl}
        alt="Evidence preview"
        className="w-full h-full object-contain"
        style={{ maxHeight: '400px' }}
        onError={(e) => {
          console.error('Image failed to load');
          setError('Failed to load image');
        }}
      />
    </div>
  );
};

const CasediaryPreview: React.FC<CasediaryPreviewProps> = ({
  handleLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const imagekey =
    import.meta.env.VITE_IMAGE_API ||
    'http://localhost:8085/api/documents/download';
  const { victimId } = useParams();
  const [caseDiary, setCaseDiary] = useState<any>(null);
  const [isEditingCrime, setIsEditingCrime] = useState(false);
  const [isEditingInvestigation, setIsEditingInvestigation] = useState(-1);
  const [updatedCrimeDescription, setUpdatedCrimeDescription] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [updatedInvestigationDescription, setUpdatedInvestigationDescription] =
    useState('');
  const [evidenceMap, setEvidenceMap] = useState<{ [key: string]: any[] }>({});
  const [evidenceLoading, setEvidenceLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  // Use string constants for page titles to avoid TypeScript errors
  const casediarypreview = 'Case Diary Preview';
  const download = 'Download PDF';

  // Helper function to open description modal
  const openDescriptionModal = (text: string) => {
    setSelectedDescription(text);
    setIsDescriptionModalOpen(true);
  };

  // Helper function to render description with "See More" link
  const renderDescription = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    
    const needsSeeMore = text.length > maxLength;
    
    return (
      <div>
        <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text.substring(0, maxLength)}{needsSeeMore ? '...' : ''}
        </p>
        {needsSeeMore && (
          <button
            onClick={() => openDescriptionModal(text)}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2"
          >
            See More
          </button>
        )}
      </div>
    );
  };

  // Get officer details from localStorage/sessionStorage instead of API call
  const getOfficerFromStorage = () => {
    try {
      console.log('🔍 Getting officer details from storage');
      
      // First try to get the officer object from localStorage (stored by Keycloak)
      const storedOfficer = localStorage.getItem('officer');
      
      // Log available storage keys for debugging
      console.log('📡 Available localStorage keys:', Object.keys(localStorage));
      console.log('📡 localStorage.officer:', storedOfficer);
      
      // Check if we found any officer data
      if (!storedOfficer) {
        console.warn('⚠️ No officer data found in localStorage');
        return null;
      }
      
      // Parse officer data from JSON string
      const officerData = JSON.parse(storedOfficer);
      console.log('✅ Officer Details from storage:', officerData);
      
      // Format the name from Keycloak profile data
      const fullName = [
        officerData.firstName || '',
        officerData.lastName || ''
      ].filter(Boolean).join(' ') || officerData.username || 'Officer';
      
      // Since Keycloak doesn't store designation and station, add dummy values for now
      // In a real app, you would fetch these from a user profile API
      const officerResult = {
        name: fullName,
        designation: 'Police Officer', // Default values since Keycloak doesn't store these
        stationName: 'Headquarters'
      };
      
      console.log('💬 Formatted officer details:', officerResult);
      return officerResult;
    } catch (error) {
      console.error('❌ Error accessing officer details from storage:', error);
      return null;
    }
  };

  const fetchEvidenceForInvestigation = async (internalId: number, investigationId?: string) => {
    try {
      console.log('📦 Fetching evidence for investigation internalId:', internalId, 'investigationId:', investigationId);
      
      // First try the new endpoint with internalId (for new evidence with investigationInternalId set)
      let evidenceResponse = await request(
        'investigation',
        'GET',
        `/evidence/entry/${internalId}`,
        null,
      );
      console.log('✅ Evidence Response for internalId', internalId, ':', evidenceResponse);
      let data: any = evidenceResponse?.data || evidenceResponse;
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      if (data && data.content && Array.isArray(data.content))
        data = data.content;

      let arr: any[] = Array.isArray(data) ? data : [];
      
      // If no evidence found with internalId and we have investigationId, try the old endpoint
      // This handles legacy evidence that doesn't have investigationInternalId set
      if (arr.length === 0 && investigationId) {
        console.log('📦 No evidence found with internalId, trying investigationId:', investigationId);
        evidenceResponse = await request(
          'investigation',
          'GET',
          `/evidence/investigation/${investigationId}`,
          null,
        );
        console.log('✅ Evidence Response for investigationId', investigationId, ':', evidenceResponse);
        data = evidenceResponse?.data || evidenceResponse;
        if (data && data.data && Array.isArray(data.data)) data = data.data;
        if (data && data.content && Array.isArray(data.content))
          data = data.content;
        const allEvidence = Array.isArray(data) ? data : [];
        
        // IMPORTANT: Only include legacy evidence (without investigationInternalId) 
        // OR evidence that specifically belongs to THIS entry (matching internalId)
        // This prevents showing other entries' evidence when this entry has none
        arr = allEvidence.filter((ev: any) => {
          const evInternalId = ev.investigationInternalId;
          // Include if: no internalId set (legacy) OR matches this entry's internalId
          const include = !evInternalId || evInternalId === internalId;
          console.log(`📋 Evidence ${ev.evidenceId}: internalId=${evInternalId}, thisEntry=${internalId}, include=${include}`);
          return include;
        });
        console.log(`📊 Filtered legacy evidence: ${arr.length} of ${allEvidence.length} items`);
      }
      
      console.log(`📊 Evidence for internalId ${internalId}: Total=${arr.length}`);
      
      const normalized = await Promise.all(
        arr.map(async (ev: any) => {
          // Build download URL based on available data
          let downloadUrl = '';
          let fileType = ev?.fileType || '';
          let fileName = ev?.fileName || ev?.evidenceName || 'Evidence File';

          // Helper function to check if URL is S3 URL
          const isS3Url = (url: string) => {
            return url && (url.includes('s3') || url.includes('amazonaws') || url.startsWith('http'));
          };

          // Use signed URL only - no fallback logic
          console.log('🔍 Processing evidence:', { 
            evidenceId: ev.evidenceId, 
            documentId: ev.documentId,
            evidenceType: ev.evidenceType 
          });
          
          // Get signed URL using documentId
          if (ev.documentId) {
            const docId = Number(ev.documentId);
            console.log('📄 Attempting to get signed URL for documentId:', docId);
            
            if (docId && !isNaN(docId) && docId > 0) {
              try {
                const { getSignedUrlString } = await import('../services/documentService');
                downloadUrl = await getSignedUrlString(docId);
                console.log('✅ Signed URL obtained for evidence document:', ev.documentId);
              } catch (signedUrlError) {
                console.error('❌ Failed to get signed URL for documentId:', ev.documentId, signedUrlError);
              }
            } else {
              console.warn('⚠️ Invalid documentId for evidence:', ev.documentId);
            }
          } else {
            console.warn('⚠️ No documentId available for evidence:', ev.evidenceId);
          }

          const name = ev?.evidenceName || fileName || 'Evidence File';
          const type = fileType.toLowerCase();
          const isImage = type.includes('image') || /(\.png|\.jpg|\.jpeg|\.gif|\.bmp|\.webp)$/i.test(name);
          const isPdf = type.includes('pdf') || /\.pdf$/i.test(name);
          
          console.log('📋 Evidence processed:', { name, type, isImage, isPdf, downloadUrl });
          
          return {
            ...ev,
            downloadUrl,
            isImage,
            isPdf,
            displayName: name,
            fileType: type,
          };
        }),
      );

      return normalized;
    } catch (error: any) {
      console.error('❌ Error fetching evidence:', error);
      return [];
    }
  };

  const fetchComplaintDetails = async (complaintId: number) => {
    try {
      console.log('🔍 Fetching full complaint details for:', complaintId);
      
      // Fetch FIR details for sections
      const firResponse = await request('complaintandfir', 'GET', `/statements/${complaintId}/fir-details`, {});
      console.log('✅ FIR Details:', firResponse);
      
      // Fetch full statement/complaint for victim/offender data
      const statementResponse = await request('complaintandfir', 'GET', `/statements/${complaintId}`, {});
      console.log('✅ Statement Details:', statementResponse);
      
      return { fir: firResponse, statement: statementResponse };
    } catch (error) {
      console.error('❌ Error fetching complaint details:', error);
      return null;
    }
  };

  const fetchCaseDiary = async () => {
    // Get officer details from storage first, with fallback - MOVED OUTSIDE TRY BLOCK
    const officerDetails = getOfficerFromStorage() || fallbackOfficerData;
    const officerName = officerDetails?.name || fallbackOfficerData.name;
    const officerPost =
      officerDetails?.designation || fallbackOfficerData.designation;
    const officerStation =
      officerDetails?.stationName || fallbackOfficerData.stationName;
    
    try {

      // Debug info
      console.log('👍 Using officer data in case diary fetch:', { officerName, officerPost, officerStation });
      console.log('🔍 Fetching case diary for victimId:', victimId);
      console.log('🔄 Refresh triggered by location.state:', location.state);
      
      // Add timestamp to prevent caching - use navigation timestamp if available
      const timestamp = location.state?.timestamp || Date.now();
      console.log('📡 Making API call to:', `/investigation/getCaseDiary/${victimId}?_t=${timestamp}`);
      console.log('🔄 Using timestamp:', timestamp, 'from navigation:', !!location.state?.timestamp);
      
      const response = await request(
        'investigation',
        'GET',
        `/investigation/getCaseDiary/${victimId}?_t=${timestamp}`,
        {},
      );
      
      console.log('📥 API Response received:', response);

      // Improved response handling
      console.log('📦 Raw Case Diary Response:', response);
      
      // Check if response is in axios wrapper format or direct data
      const responseData = response.data ? response.data : response;
      console.log('📦 Extracted Case Diary Response Data:', responseData);
      console.log('📓 Investigation Details List:', responseData?.investigationDetailsList);
      console.log('📊 Investigation Count:', responseData?.investigationDetailsList?.length || 0);
      
      // Log investigation descriptions for debugging
      if (responseData?.investigationDetailsList?.length > 0) {
        console.log('📋 Investigation Descriptions:');
        responseData.investigationDetailsList.forEach((inv: any, idx: number) => {
          console.log(`  ${idx + 1}. ID: ${inv.investigationId}, Description: "${inv.description?.substring(0, 50)}..."`);
        });
      }

      // Check if we have investigation data
      if (responseData?.investigationDetailsList?.length > 0) {
        console.log('✅ Setting case diary with investigation data');

        // Fetch complaint details from complaint service if complaintId exists
        let complaintData: any = null;
        if (responseData?.complaintId) {
          complaintData = await fetchComplaintDetails(responseData.complaintId);
          console.log('🔍 Complete Complaint Data:', complaintData);
        }

        const firDetails = complaintData?.fir;
        const statement = complaintData?.statement;

        // Get officer details from storage instead of API call
        const officerDetails = getOfficerFromStorage();

        // Extract victim details from statement (complainants/victims)
        let victimNames = 'N/A';
        if (statement?.victimNames && Array.isArray(statement.victimNames) && statement.victimNames.length > 0) {
          victimNames = statement.victimNames.join(', ');
        } else if (statement?.participants && Array.isArray(statement.participants)) {
          const victims = statement.participants
            .filter((p: any) => p.role === 'COMPLAINANT' || p.role === 'VICTIM')
            .map((p: any) => {
              const name = p?.citizen?.name || 'Unknown';
              const contact = p?.citizen?.contactNo || p?.citizen?.mobileNo || '';
              return contact ? `${name} (${contact})` : name;
            })
            .filter((v: string) => v !== 'Unknown');
          victimNames = victims.length > 0 ? victims.join(', ') : 'N/A';
        }

        // Extract witness details from participants
        let witnessNames = 'N/A';
        let witnessContactAddress = 'N/A';
        
        if (statement?.participants && Array.isArray(statement.participants)) {
          const witnesses = statement.participants.filter((p: any) => p.role === 'WITNESS');
          
          // Extract names only
          const names = witnesses
            .map((p: any) => p?.citizen?.name || 'Unknown')
            .filter((name: string) => name !== 'Unknown');
          witnessNames = names.length > 0 ? names.join(', ') : 'N/A';
          
          // Extract contact and address together
          const contactAddressList = witnesses
            .map((p: any) => {
              const contact = p?.citizen?.contactNo || p?.citizen?.mobileNo || '';
              const address = p?.citizen?.address || '';
              if (contact && address) {
                return `${contact} - ${address}`;
              } else if (contact) {
                return contact;
              } else if (address) {
                return address;
              }
              return '';
            })
            .filter((info: string) => info !== '');
          witnessContactAddress = contactAddressList.length > 0 ? contactAddressList.join('; ') : 'N/A';
        }

        // Extract offender details from statement
        let offenderNames = 'N/A';
        let arrestStatuses = 'No arrests';
        
        if (statement?.offenderNames && Array.isArray(statement.offenderNames) && statement.offenderNames.length > 0) {
          offenderNames = statement.offenderNames.join(', ');
          // For arrest status, we need to check participants
          // if (statement?.participants) {
          //   const offenders = statement.participants.filter((p: any) => p.role === 'ACCUSED' || p.role === 'OFFENDER');
          //   if (offenders.length > 0) {
          //     const arrests = offenders.map((o: any) => 
          //       `${o?.citizen?.name || 'Unknown'}: Not Arrested`
          //     );
          //     arrestStatuses = arrests.join('; ');
          //   }
          // }
        } else if (statement?.participants && Array.isArray(statement.participants)) {
          const offenders = statement.participants
            .filter((p: any) => p.role === 'ACCUSED' || p.role === 'OFFENDER')
            .map((p: any) => p?.citizen?.name || 'Unknown')
            .filter((name: string) => name !== 'Unknown');
          offenderNames = offenders.length > 0 ? offenders.join(', ') : 'N/A';
          
          if (offenders.length > 0) {
            arrestStatuses = offenders.length > 0 
              ? statement.participants
                  .filter((p: any) => p.role === 'ACCUSED' || p.role === 'OFFENDER')
                  .map((o: any) => `${o?.citizen?.name || 'Unknown'}: Not Arrested`)
                  .join('; ')
              : 'No arrests';
          }
        }

        // Format dates
        const formatDate = (dateStr: string) => {
          if (!dateStr) return 'N/A';
          try {
            return new Date(dateStr).toLocaleString('en-IN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            return dateStr;
          }
        };

        // Enhanced case diary - Use responseData FIRST (from backend), fall back to complaint data if needed
        const enhancedCaseDiary = {
          ...responseData,
          victimList: responseData?.victimList || [],
          // FIXED: Always prefer local officer data over backend data
          policeStation: officerDetails?.stationName || responseData?.policeStation || 'Police Station',
          firNumber: responseData?.firNumber || firDetails?.firNumber || statement?.firNo || `FIR-${victimId}`,
          complaintId: responseData?.complaintId || 'N/A',
          // Use responseData directly from backend
          sectionId: responseData?.sectionId || firDetails?.sections || 'N/A',
          victimDetails: responseData?.victimDetails || victimNames,
          witnessDetails: responseData?.witnessDetails || witnessNames,
          witnessContactAddress: responseData?.witnessContactDetails || witnessContactAddress,
          crimeDateTime: responseData?.crimeDateTime || formatDate(statement?.crimeDateTime),
          filingDateTime: responseData?.filingDateTime || formatDate(statement?.filedDate || firDetails?.registeredOn),
          offenderDetails: responseData?.offenderDetails || offenderNames,
          arrestStatus: responseData?.arrestStatus || arrestStatuses,
          // FIXED: Always prefer local officer data over backend data
          officerName: officerDetails?.name || responseData?.officerName || 'Officer',
          officerPost: officerDetails?.designation || responseData?.officerPost || 'N/A',
          crimeDescription: responseData?.crimeDescription || statement?.description || firDetails?.description || 'No description available'
        };

        console.log('✅ Setting case diary with data:', enhancedCaseDiary);
        console.log('📊 Investigation count:', enhancedCaseDiary.investigationDetailsList?.length);
        setCaseDiary(enhancedCaseDiary);
        setUpdatedCrimeDescription(enhancedCaseDiary.crimeDescription);

        // Fetch evidence for all investigations - OPTIMIZED: Fetch in background
        console.log('🔍 Starting to fetch evidence for investigations...');
        console.log(
          '📓 Investigations:',
          responseData.investigationDetailsList,
        );

        // Clear existing evidence map to prevent duplicates
        setEvidenceMap({});
        
        // Set all investigations as loading (using internalId as key)
        const loadingState: { [key: string]: boolean } = {};
        responseData.investigationDetailsList.forEach((inv: any) => {
          loadingState[String(inv.internalId)] = true;
        });
        setEvidenceLoading(loadingState);

        // Fetch evidence in background (don't block page render)
        const fetchAllEvidence = async () => {
          const newEvidenceMap: { [key: string]: any[] } = {};
          
          // Fetch evidence for each investigation using internalId (unique per entry)
          for (const inv of responseData.investigationDetailsList) {
            // Use internalId as the key for evidence map (unique per investigation entry)
            const internalId = inv.internalId;
            const investigationId = inv.investigationId; // String format for fallback
            const mapKey = String(internalId);
            console.log(`🔍 Fetching evidence for investigation internalId: ${internalId}, investigationId: ${investigationId}`);
            
            try {
              // Pass both internalId and investigationId (for fallback to old endpoint)
              const evidence = await fetchEvidenceForInvestigation(internalId, investigationId);
              console.log(`✅ Evidence for internalId ${internalId}:`, evidence);
              
              // Add to map (empty array if no evidence)
              newEvidenceMap[mapKey] = evidence && evidence.length > 0 ? evidence : [];
              
              // Update map incrementally so user sees evidence as it loads
              setEvidenceMap(prev => ({
                ...prev,
                [mapKey]: newEvidenceMap[mapKey]
              }));
              
              // Mark this investigation as loaded
              setEvidenceLoading(prev => ({
                ...prev,
                [mapKey]: false
              }));
              
              console.log(
                `📌 Added to map - InternalId ${internalId}: ${newEvidenceMap[mapKey].length} evidence items`,
              );
            } catch (error) {
              console.error(`❌ Error fetching evidence for internalId ${internalId}:`, error);
              newEvidenceMap[mapKey] = [];
              
              // Update with empty array on error
              setEvidenceMap(prev => ({
                ...prev,
                [mapKey]: []
              }));
              
              // Mark as loaded (failed)
              setEvidenceLoading(prev => ({
                ...prev,
                [mapKey]: false
              }));
            }
          }

          console.log('✅ All evidence fetched');
          console.log('📊 Final Evidence Map:', newEvidenceMap);
          console.log('📊 Total evidence items:', Object.values(newEvidenceMap).flat().length);
        };

        // Start fetching in background
        fetchAllEvidence();
      } else if (responseData?.investigationDetailsList?.length === 0) {
        console.warn('⚠️ No investigation data found - investigationDetailsList is empty');
        console.warn('⚠️ Response data:', responseData);
        setCaseDiary({
          investigationDetailsList: [],
          victimList: responseData?.victimList || [],
          // FIXED: Always prioritize local data
          officerName: officerName || responseData?.officerName || 'Officer',
          officerPost: officerPost || responseData?.officerPost || '',
          officerStation: officerStation || responseData?.officerStation || '',
          policeStation: officerStation || responseData?.policeStation || 'N/A',
          firNumber: responseData?.firId || 'N/A',
          complaintId: responseData?.complaintId || 'N/A',
          sectionId: 'N/A',
          victimDetails: 'N/A',
          crimeDateTime: 'N/A',
          filingDateTime: 'N/A',
          offenderDetails: 'N/A',
          arrestStatus: 'N/A',
        });
      } else {
        console.warn(
          '⚠️ No case diary data found - responseData or investigationDetailsList missing',
        );
        console.warn('⚠️ Response data:', responseData);
        console.warn('⚠️ Has investigationDetailsList?', !!responseData?.investigationDetailsList);
        setCaseDiary({
          investigationDetailsList: [],
          victimList: responseData?.victimList || [],
          // FIXED: Always prioritize local data
          officerName: officerName || responseData?.officerName || '',
          officerPost: officerPost || responseData?.officerPost || '',
          officerStation: officerStation || responseData?.officerStation || '',
          // Add default values for missing fields
          policeStation: officerStation || responseData?.policeStation || 'N/A',
          firNumber: responseData?.firId || 'N/A',
          complaintId: responseData?.complaintId || 'N/A',
          sectionId: 'N/A',
          victimDetails: 'N/A',
          crimeDateTime: 'N/A',
          filingDateTime: 'N/A',
          offenderDetails: 'N/A',
          arrestStatus: 'N/A',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching case diary:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
      
      // Show error alert to user
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Case Diary',
        text: 'Unable to load case diary data. Please try again.',
        confirmButtonText: 'Go Back'
      }).then(() => {
        navigate(-1); // Go back to previous page
      });
      
      // Even in case of error, try to use officer details from storage
      setCaseDiary({
        investigationDetailsList: [],
        victimList: [],
        // FIXED: Always prioritize local data - even in error case
        officerName: officerName || fallbackOfficerData.name || '',
        officerPost: officerPost || fallbackOfficerData.designation || '',
        officerStation: officerStation || fallbackOfficerData.stationName || '',
        // Add default values for missing fields
        policeStation: officerStation || fallbackOfficerData.stationName || 'N/A',
        firNumber: 'N/A',
        complaintId: 'N/A',
        sectionId: 'N/A',
        victimDetails: 'N/A',
        crimeDateTime: 'N/A',
        filingDateTime: 'N/A',
        offenderDetails: 'N/A',
        arrestStatus: 'N/A',
      });
    }
  };

  // Removed debug state

  // Hard-coded fallback officer data to use if none is in storage
  const fallbackOfficerData = {
    name: "Inspector Singh",
    designation: "Station In-charge",
    stationName: "Central Police Station"
  };

  // Get initial officer details and case diary
  useEffect(() => {
    // Get officer details on mount or use fallback
    let officerDetails = getOfficerFromStorage();
    
    // If no officer details found in storage, use the fallback
    if (!officerDetails) {
      console.warn('⚠️ No officer found in storage, using fallback data');
      officerDetails = fallbackOfficerData;
      
      // Create a hardcoded entry in localStorage for future use
      try {
        localStorage.setItem('officer_fallback', JSON.stringify({
          firstName: fallbackOfficerData.name.split(' ')[0],
          lastName: fallbackOfficerData.name.split(' ')[1] || '',
          username: fallbackOfficerData.name.replace(' ', '').toLowerCase(),
          email: `${fallbackOfficerData.name.replace(' ', '.').toLowerCase()}@police.gov.in`
        }));
        console.log('📢 Created fallback officer data in localStorage');
      } catch (e) {
        console.error('❌ Failed to save fallback officer data:', e);
      }
    } else {
      console.log('👨‍� Officer found in storage:', officerDetails.name);
    }
    
    // Log officer details for debugging only
    console.log('👤 Officer details:', officerDetails);
    
    // Log storage state
    console.log('📡 Available localStorage keys:', Object.keys(localStorage));

    // Clear evidence map before fetching to prevent duplicates
    setEvidenceMap({});

    // Fetch case diary data
    fetchCaseDiary();
  }, [victimId, location.state?.timestamp, location.state?.refresh]); // Use timestamp and refresh to trigger reload when navigating back from edit

  const handleEditCrime = () => {
    setIsEditingCrime(true);
  };

  const handleSaveCrime = async () => {
    try {
      await request('complaintandfir', 'PUT', '/updateCrimeDetails', {
        crimeId: caseDiary.victimList[0].crimesDetails.crimeId,
        updatedCrimeDescription: updatedCrimeDescription,
      });
      setIsEditingCrime(false);
      fetchCaseDiary();
    } catch (error) {
      console.error('Error updating crime description:', error);
    }
  };

  const handleEditInvestigation = (index: number) => {
    setIsEditingInvestigation(index);
    setUpdatedInvestigationDescription(
      caseDiary.investigationDetailsList[index].investDescription,
    );
  };

  const handleSaveInvestigation = async (index: number) => {
    try {
      await request('investigation', 'PUT', '/investigation/updateInvestigationById', {
        investigationId: caseDiary.investigationDetailsList[index].investigationId,
        description: updatedInvestigationDescription,
      });
      setIsEditingInvestigation(-1);
      fetchCaseDiary();
    } catch (error) {
      console.error('Error updating investigation description:', error);
    }
  };

  const handleDownloadPDF = async () => {
    // Show loading alert
    Swal.fire({
      title: 'Generating PDF...',
      text: 'Please wait while we generate your PDF.',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    document.body.style.cursor = 'progress';
    const elementsToHide = document.querySelectorAll('.btn');
    elementsToHide.forEach((el) => {
      el.style.visibility = 'hidden';
    });

    const input = document.getElementById('pdf-content');
    const sections = input.querySelectorAll('.content');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 25; // Set margin to 25mm
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const usableWidth = pageWidth - 2 * margin; // Usable width after applying margins
    const usableHeight = pageHeight - 2 * margin; // Usable height after applying margins
    let yOffset = margin; // Start with top margin for the first item

    const renderSectionToPDF = async (section) => {
      const canvas = await html2canvas(section, { scale: 1.9 });
      const canvasAspectRatio = canvas.width / canvas.height;
      const imgWidth = usableWidth; // Width of the image in the PDF
      const imgHeight = imgWidth / canvasAspectRatio; // Adjust height to maintain aspect ratio

      let positionY = 0;

      while (positionY < canvas.height) {
        if (yOffset + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yOffset = margin; // Reset yOffset for the new page
        }

        // Create a new canvas to draw the portion of the original canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        const heightLeft = canvas.height - positionY;
        tempCanvas.height = Math.min(
          heightLeft,
          usableHeight * (canvas.width / imgWidth),
        );
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(
          canvas,
          0,
          positionY,
          canvas.width,
          tempCanvas.height,
          0,
          0,
          canvas.width,
          tempCanvas.height,
        );

        const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.8); // Adjust compression
        const tempImgHeight = tempCanvas.height * (imgWidth / canvas.width);

        pdf.addImage(
          tempImgData,
          'JPEG',
          margin,
          yOffset,
          imgWidth,
          tempImgHeight,
        );

        yOffset += tempImgHeight;
        positionY += tempCanvas.height;
      }
    };

    try {
      for (const section of sections) {
        await renderSectionToPDF(section);
      }
      // Generate a descriptive filename with multiple fallbacks
      const generateFilename = () => {
        // Get current date in YYYYMMDD format
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        
        // Function to sanitize text for filenames (remove special chars)
        const sanitize = (text) => text?.replace(/[^a-zA-Z0-9]/g, '') || '';

        // Try to get victim name from multiple sources
        let victimName = '';
        if (caseDiary.victimList && caseDiary.victimList.length > 0 && caseDiary.victimList[0]?.victimName) {
          victimName = caseDiary.victimList[0].victimName;
        } else if (caseDiary.victimDetails && caseDiary.victimDetails !== 'N/A') {
          // Extract first name if victimDetails has multiple names
          victimName = caseDiary.victimDetails.split(',')[0];
        }
        
        // Limit victim name to 15 chars max
        victimName = sanitize(victimName).slice(0, 15);
        
        // Try to get FIR number if available
        const firNumber = (caseDiary.firNumber && caseDiary.firNumber !== 'N/A') ? 
          `_FIR${sanitize(caseDiary.firNumber)}` : '';
          
        // Use complaint ID as fallback if no FIR number
        const complaintId = (!firNumber && caseDiary.complaintId && caseDiary.complaintId !== 'N/A') ? 
          `_C${sanitize(caseDiary.complaintId)}` : '';

        // Add police station (abbreviated, max 10 chars)
        const policeStation = caseDiary.policeStation && caseDiary.policeStation !== 'N/A' ? 
          `_${sanitize(caseDiary.policeStation).slice(0, 10)}` : '';

        // Build filename with available parts
        if (victimName) {
          return `${victimName}${firNumber}${policeStation}_CaseDiary_${dateStr}.pdf`;
        } else if (firNumber) {
          return `CaseDiary${firNumber}${policeStation}_${dateStr}.pdf`;
        } else if (complaintId) {
          return `CaseDiary${complaintId}${policeStation}_${dateStr}.pdf`;
        }
        
        // Ultimate fallback: use victim ID if available
        return `CaseDiary_V${victimId}_${dateStr}.pdf`;
      };
      
      // Save PDF with generated filename
      const filename = generateFilename();
      console.log('📄 Saving PDF with filename:', filename);
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        title: 'Error',
        text: 'There was an error generating your PDF.',
        icon: 'error',
      });
    } finally {
      Swal.close(); // Close the loading alert
      elementsToHide.forEach((el) => {
        el.style.visibility = ''; // Restore visibility
      });
      document.body.style.cursor = ''; // Reset cursor
    }
  };

  // Show loader while fetching data
  if (!caseDiary) {
    return (
      <DefaultLayout handleLogout={handleLogout}>
        <Breadcrumb pageName={casediarypreview} />
        <Loader />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={casediarypreview} />
      <div className="flex justify-end">
        <button
          className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          onClick={handleDownloadPDF}
        >
          {download}
        </button>
      </div>

      <div id="pdf-content" className="rounded-sm mx-13 mb-4 text-black p-6">
        {caseDiary?.investigationDetailsList?.length > 0 ? (
          (() => {
            // Group investigations by date (day)
            const groupedByDay = caseDiary.investigationDetailsList.reduce((acc, investigation) => {
              // Handle invalid or missing dates
              let date = 'Unknown Date';
              try {
                // Try both assignedOn and createdOn fields (camelCase as per API response)
                const dateFields = ['assignedOn', 'createdOn'];
                for (const field of dateFields) {
                  if (investigation[field]) {
                    const investigationDate = new Date(investigation[field]);
                    if (!isNaN(investigationDate.getTime())) {
                      date = investigationDate.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      });
                      break; // Use the first valid date found
                    }
                  }
                }
              } catch (error) {
                console.warn('Invalid date format for investigation:', investigation.investigationId, error);
              }

              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(investigation);
              return acc;
            }, {});

            // Sort dates chronologically
            const sortedDates = Object.keys(groupedByDay).sort((a, b) => {
              if (a === 'Unknown Date') return 1;
              if (b === 'Unknown Date') return -1;

              try {
                return new Date(a.split('/').reverse().join('-')).getTime() -
                       new Date(b.split('/').reverse().join('-')).getTime();
              } catch (error) {
                return 0;
              }
            });

            let dayCounter = 1;

            return (
              <>
                {/* Case Information - Show once at the top */}
                {sortedDates.length > 0 && (
                  <div className="content m-4">
                    <div className="text-xl p-2">Case Information :</div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400">
                        <tbody>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">Police Station :</strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              <span className="text-gray-800">{caseDiary.policeStation || 'N/A'}</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">Section ID :</strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              <span className="text-gray-800">{caseDiary.sectionId || 'N/A'}</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">FIR No :</strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              <span className="text-gray-800">{caseDiary.firNumber || 'N/A'}</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">Victim Details :</strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              {caseDiary.victimDetails &&
                              caseDiary.victimDetails !== 'N/A' ? (
                                <div className="space-y-1">
                                  {caseDiary.victimDetails
                                    .split('; ')
                                    .map((victim: string, idx: number) => {
                                      const parts = victim.split(', ');
                                      const name = parts
                                        .find((p: string) => !p.includes(':'))
                                        ?.trim();
                                      const age = parts
                                        .find((p: string) => p.includes('Age:'))
                                        ?.replace('Age:', '')
                                        .trim();
                                      const address = parts
                                        .find((p: string) => p.includes('Address:'))
                                        ?.replace('Address:', '')
                                        .trim();
                                      const mobile = parts
                                        .find((p: string) => p.includes('Mobile:'))
                                        ?.replace('Mobile:', '')
                                        .trim();

                                      return (
                                        <div key={idx} className="text-gray-800">
                                          <span className="font-medium">
                                            {name || 'Unknown'}
                                          </span>
                                          {' - '}
                                          <span
                                            onClick={() => {
                                              setSelectedPerson({
                                                type: 'Victim',
                                                name,
                                                age,
                                                address,
                                                mobile,
                                              });
                                              setShowPersonModal(true);
                                            }}
                                            className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                                          >
                                            click here to see info
                                          </span>
                                        </div>
                                      );
                                    })}
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">
                                  No victim information available
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">
                                Date and time of offense :
                              </strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              <span className="text-gray-800">
                                {caseDiary.crimeDateTime || 'N/A'}
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">
                                Time of filing case :
                              </strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              <span className="text-gray-800">
                                {caseDiary.filingDateTime || 'N/A'}
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">
                                Offender Details :
                              </strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              {caseDiary.offenderDetails &&
                              caseDiary.offenderDetails !== 'N/A' ? (
                                <div className="space-y-1">
                                  {caseDiary.offenderDetails
                                    .split('; ')
                                    .map((offender: string, idx: number) => {
                                      const parts = offender.split(', ');
                                      const name = parts
                                        .find((p: string) => !p.includes(':'))
                                        ?.trim();
                                      const age = parts
                                        .find((p: string) => p.includes('Age:'))
                                        ?.replace('Age:', '')
                                        .trim();
                                      const address = parts
                                        .find((p: string) => p.includes('Address:'))
                                        ?.replace('Address:', '')
                                        .trim();

                                      return (
                                        <div key={idx} className="text-gray-800">
                                          <span className="font-medium">
                                            {name || 'Unknown'}
                                          </span>
                                          {' - '}
                                          <span
                                            onClick={() => {
                                              setSelectedPerson({
                                                type: 'Offender',
                                                name,
                                                age,
                                                address,
                                              });
                                              setShowPersonModal(true);
                                            }}
                                            className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                                          >
                                            click here to see info
                                          </span>
                                        </div>
                                      );
                                    })}
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">
                                  No offender information available
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">
                                Witness Details :
                              </strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              {caseDiary.witnessDetails &&
                              caseDiary.witnessDetails !== 'N/A' ? (
                                <div className="space-y-1">
                                  {caseDiary.witnessDetails
                                    .split('; ')
                                    .map((witness: string, idx: number) => {
                                      const parts = witness.split(', ');
                                      const name = parts
                                        .find((p: string) => !p.includes(':'))
                                        ?.trim();
                                      const age = parts
                                        .find((p: string) => p.includes('Age:'))
                                        ?.replace('Age:', '')
                                        .trim();

                                      // Get contact from witnessContactAddress
                                      const contacts =
                                        caseDiary.witnessContactAddress?.split(
                                          '; ',
                                        ) || [];
                                      const contactInfo = contacts[idx] || '';
                                      const contactMatch =
                                        contactInfo.match(/Contact:\s*([^,]+)/);
                                      const addressMatch =
                                        contactInfo.match(/Address:\s*(.+)/);
                                      const contact = contactMatch
                                        ? contactMatch[1].trim()
                                        : '';
                                      const address = addressMatch
                                        ? addressMatch[1].trim()
                                        : '';

                                      return (
                                        <div key={idx} className="text-gray-800">
                                          <span className="font-medium">
                                            {name || 'Unknown'}
                                          </span>
                                          {' - '}
                                          <span
                                            onClick={() => {
                                              setSelectedPerson({
                                                type: 'Witness',
                                                name,
                                                age,
                                                address,
                                                contact,
                                              });
                                              setShowPersonModal(true);
                                            }}
                                            className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                                          >
                                            click here to see info
                                          </span>
                                        </div>
                                      );
                                    })}
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">
                                  No witness information available
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-6 py-3 bg-gray-100">
                              <strong className="text-gray-700">
                                Officer's Name :
                              </strong>
                            </td>
                            <td className="border border-gray-400 px-6 py-3">
                              <span className="text-gray-800 font-medium">
                                {caseDiary.officerName ||
                                  fallbackOfficerData.name ||
                                  'N/A'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                    
                {/* Crime Description - Show once */}
                <div className="m-4">
                  <div className="text-xl p-2 flex justify-between items-center">
                    <span>Crime Description :</span>
                    {isEditingCrime ? (
                      <button className="btn" onClick={handleSaveCrime} />
                    ) : (
                      <div
                        className="btn hover:text-primary cursor-pointer"
                        onClick={handleEditCrime}
                      />
                    )}
                  </div>
                  <div className="p-2">
                    {isEditingCrime ? (
                      <textarea
                        className="w-full p-2 border"
                        rows={Math.max(
                          (updatedCrimeDescription || '').split('\n').length,
                          4,
                        )}
                        value={updatedCrimeDescription}
                        onChange={(e) =>
                          setUpdatedCrimeDescription(e.target.value)
                        }
                      />
                    ) : (
                      <div>
                        {renderDescription(caseDiary.crimeDescription || 'No crime description available', 1000)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Investigation Days - Loop through each day */}
                {sortedDates.map((date, dateIndex) => (
                  <div key={dateIndex} className="content bg-white mb-6 p-4">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Investigation Day {dayCounter++}
                      </h3>
                      <p className="text-gray-600">Date: {date}</p>
                    </div>

                    {/* Show all investigations for this day */}
                    {groupedByDay[date].map((investigation, invIndex) => {
                  const globalIndex =
                    caseDiary.investigationDetailsList.indexOf(investigation);

                  // Debug: Check investigation data structure
                  if (invIndex === 0) {
                    console.log('=== INVESTIGATION DEBUG INFO ===');
                    console.log('Sample investigation object:', investigation);
                    console.log('Available fields:', Object.keys(investigation));
                    console.log('Description field exists:', 'description' in investigation);
                    console.log('Description value:', investigation.description);
                    console.log('Description type:', typeof investigation.description);
                    console.log('Description length:', investigation.description?.length);
                    console.log('InvestDescription value:', investigation.investDescription);
                    console.log('Full investigation object:', JSON.stringify(investigation, null, 2));
                    console.log('=== END DEBUG INFO ===');
                  }

                  // Get description with multiple fallback options
                  const getInvestigationDescription = (inv) => {
                    console.log(`Checking description for investigation ${invIndex + 1}:`, {
                      description: inv?.description,
                      investDescription: inv?.investDescription,
                      hasDescription: !!inv?.description,
                      descriptionLength: inv?.description?.length
                    });

                    if (inv?.description && inv.description.trim() !== '') {
                      console.log(`✅ Using description field: "${inv.description}"`);
                      return inv.description;
                    }
                    if (inv?.investDescription && inv.investDescription.trim() !== '') {
                      console.log(`✅ Using investDescription field: "${inv.investDescription}"`);
                      return inv.investDescription;
                    }
                    if (inv?.investDesc && inv.investDesc.trim() !== '') {
                      console.log(`✅ Using investDesc field: "${inv.investDesc}"`);
                      return inv.investDesc;
                    }
                    if (inv?.details && inv.details.trim() !== '') {
                      console.log(`✅ Using details field: "${inv.details}"`);
                      return inv.details;
                    }
                    console.log(`❌ No description found for investigation ${invIndex + 1}`);
                    return 'No description available';
                  };

                  const description = getInvestigationDescription(investigation);
                  console.log(`Final description for investigation ${invIndex + 1}: "${description}"`);

                  return (
                    <div key={invIndex} className="m-4 border-t pt-4">
                      <div className="text-xl p-2 flex justify-between items-center">
                        <h4 className="text-xl font-bold text-gray-800">
                          Investigation Entry {invIndex + 1} {/* This resets for each day */}
                        </h4>
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 rounded transition-colors"
                          onClick={() => {
                            console.log('🔍 Edit Investigation clicked:', {
                              internalId: investigation.internalId,
                              investigationId: investigation.investigationId,
                              firId: investigation.firId || victimId,
                              victimId: victimId,
                              investigationData: investigation
                            });
                            navigate(`/newinvestigation/${victimId}`, { 
                              state: { 
                                editMode: true, 
                                investigationId: investigation.investigationId, // Keep for backward compatibility
                                investigationData: {
                                  ...investigation,
                                  internalId: investigation.internalId, // Add unique ID
                                  firId: investigation.firId || victimId // Ensure firId is included
                                },
                                firId: investigation.firId || victimId // Pass firId separately as well
                              } 
                            });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                      <div className="p-2">
                        {isEditingInvestigation === globalIndex ? (
                          <textarea
                            rows={Math.max(
                              (updatedInvestigationDescription || '').split('\n')
                                .length,
                              4,
                            )}
                            className="w-full p-2 border"
                            value={updatedInvestigationDescription}
                            onChange={(e) =>
                              setUpdatedInvestigationDescription(e.target.value)
                            }
                          />
                        ) : (
                          <div>
                            {renderDescription(description, 1000)}
                          </div>
                        )}

                        {/* Evidence Section - Show loading state */}
                        <div className="mt-4">
                          <p className="font-semibold mb-2">Evidence:</p>
                          {(() => {
                            // Use internalId as the key (unique per investigation entry)
                            const internalId = String(investigation.internalId);
                            const isLoading = evidenceLoading[internalId];
                            const evidenceList = evidenceMap[internalId] || [];
                            
                            console.log('🔍 Evidence Render Check:');
                            console.log('  Internal ID:', internalId);
                            console.log('  Investigation Object:', investigation);
                            console.log('  Is Loading:', isLoading);
                            console.log('  Evidence List:', evidenceList);
                            console.log('  Evidence Count:', evidenceList.length);
                            console.log('  Evidence Map Keys:', Object.keys(evidenceMap));
                            
                            // Evidence is already filtered by internalId from the backend
                            const verifiedEvidence = evidenceList;
                            
                            console.log(`  ✅ Evidence Count: ${verifiedEvidence.length}`);
                            
                            if (false) {
                              console.error(`❌ Evidence mismatch! Expected ${evidenceList.length} but only ${verifiedEvidence.length} belong to investigation ${internalId}`);
                              console.error(`❌ Filtered out ${evidenceList.length - verifiedEvidence.length} evidence items that don't belong to this investigation`);
                            }
                            
                            // Show loading state
                            if (isLoading) {
                              return (
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Loading evidence...
                                </div>
                              );
                            }
                            
                            // Show no evidence message
                            if (!verifiedEvidence || verifiedEvidence.length === 0) {
                              return (
                                <p className="text-gray-500 italic text-sm">
                                  No evidence attached to this investigation
                                </p>
                              );
                            }
                            
                            // Show evidence (use verified evidence only) - Just names as clickable links
                            return (
                              <div className="flex flex-wrap gap-3">
                                {verifiedEvidence.map((evidence: any, evidenceIndex: number) => {
                                  console.log(`📄 Rendering evidence ${evidenceIndex + 1}:`, evidence);
                                  return (
                                    <button
                                      key={evidenceIndex}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-300 rounded-lg transition-colors"
                                      onClick={() => {
                                        setSelectedEvidence(evidence);
                                        setShowEvidenceModal(true);
                                      }}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      {evidence.displayName}
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                  </div>
                ))}
              </>
            );
          })()
        ) : (
          <div>
            <p>No investigation records found</p>
          </div>
        )}
      </div>

      {/* Evidence Modal */}
      {showEvidenceModal && selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEvidenceModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-6 py-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📄</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {selectedEvidence.evidenceName || 'Evidence'}
                  </h2>
                  <p className="text-gray-300 text-sm font-medium">Evidence Details</p>
                </div>
              </div>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white hover:bg-opacity-10 rounded-full transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Evidence Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <span className="text-white text-sm">🏷️</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Type</p>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">{selectedEvidence.evidenceType || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <span className="text-white text-sm">📁</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">File Type</p>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">{selectedEvidence.fileType?.toUpperCase() || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Size</p>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">{selectedEvidence.fileSize ? `${(selectedEvidence.fileSize / 1024).toFixed(2)} KB` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedEvidence.description && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <span className="text-white text-sm">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</p>
                      <p className="text-gray-900 dark:text-white leading-relaxed text-sm">{selectedEvidence.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {/* Evidence Preview */}
              {selectedEvidence.documentId && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 border border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Preview</p>
                  <EvidencePreview documentId={Number(selectedEvidence.documentId)} />
                </div>
              )}

              {/* Action Button */}
              <div className="pt-3">
                <button
                  onClick={async () => {
                    console.log('📄 View Evidence clicked');
                    console.log('📄 Selected Evidence:', selectedEvidence);
                    console.log('📄 Document ID:', selectedEvidence.documentId);
                    
                    if (!selectedEvidence.documentId) {
                      Swal.fire({
                        icon: 'error',
                        title: 'Document Not Available',
                        text: 'This evidence does not have an associated document file.'
                      });
                      return;
                    }
                    
                    try {
                      const docId = Number(selectedEvidence.documentId);
                      if (isNaN(docId) || docId <= 0) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Invalid Document ID',
                          text: `Document ID "${selectedEvidence.documentId}" is not valid.`
                        });
                        return;
                      }
                      
                      // Use signed URL service to open in new tab
                      const { openFileInNewTab } = await import('../services/documentService');
                      await openFileInNewTab(docId);
                    } catch (error: any) {
                      console.error('❌ Error viewing evidence:', error);
                      Swal.fire({
                        icon: 'error',
                        title: 'Failed to Load Evidence',
                        text: error.message || 'Unable to load the evidence file. Please try again.'
                      });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 hover:from-slate-900 hover:via-gray-900 hover:to-slate-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center space-x-3 border border-gray-200 dark:border-gray-700"
                >
                  <span className="text-xl">👁️</span>
                  <span className="text-base">Open in New Tab</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Person Details Modal */}
      {showPersonModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPersonModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedPerson.type} Details</h3>
                <button
                  onClick={() => setShowPersonModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedPerson.name || 'Unknown'}</p>
                </div>

                {selectedPerson.age && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-500 mb-1">Age</p>
                    <p className="text-base text-gray-800">{selectedPerson.age}</p>
                  </div>
                )}

                {selectedPerson.mobile && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                    <p className="text-base text-gray-800">{selectedPerson.mobile}</p>
                  </div>
                )}

                {selectedPerson.contact && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-500 mb-1">Contact</p>
                    <p className="text-base text-gray-800">{selectedPerson.contact}</p>
                  </div>
                )}

                {selectedPerson.address && (
                  <div className="pb-3">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-base text-gray-800">{selectedPerson.address}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPersonModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Modal */}
      <DescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        description={selectedDescription}
        title="Description"
      />
    </DefaultLayout>
  );
};

export default CasediaryPreview;
