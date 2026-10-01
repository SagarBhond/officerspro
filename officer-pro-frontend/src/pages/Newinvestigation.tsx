import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import EvidencePage from '../pages/Caseforms/EvidencePage';
import request from '../Service/axios_helper';
import Swal from 'sweetalert2';
// Loader removed - form renders immediately with initial data
import { useTranslation } from 'react-i18next';
import caseDiaryService from '../services/caseDiaryService';
import type { InvestigationStatus } from '../types/caseDiary.types';

type NewInvestigationProps = {
  handleLogout: () => void;
};

// The Investigation API DTOs use java.time.LocalDateTime, which expects a
// timestamp without a timezone suffix (unlike Date.toISOString(), which ends
// in "Z"). Keep the instant in the browser's local wall-clock format.
const toLocalDateTime = (date: Date = new Date()): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 19);
};

const NewInvestigation: React.FC<NewInvestigationProps> = ({
  handleLogout,
}) => {
  const { victimId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInvestigationId, setEditInvestigationId] = useState<string | null>(null); // internalId for update API
  const [editInvestigationStringId, setEditInvestigationStringId] = useState<string | null>(null); // investigationId for evidence API
  const [data, setData] = useState<{
    investigationDetailsList?: any[];
    victimList?: Array<{
      caseStatus?: string;
      offenderList?: Array<{
        offenderId?: number;
        offenderName?: string;
        arrestedStatus?: string;
      }>;
      firId?: number;
    }>;
  } | null>(null);
  const [investDay, setInvestDay] = useState(1);
  const [caseStatus, setCaseStatus] = useState('');
  const [offenders, setOffenders] = useState<Array<{
    offenderId?: number;
    offenderName?: string;
    arrestedStatus?: string;
  }>>([]);
  const [investigationDetails, setInvestigationDetails] = useState({
    investDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Track if data is still loading
  const [evidence, setEvidence] = useState<{ [key: number]: {
    evidenceName: string;
    description: string;
    evidenceType: string;
    fileType: string;
    location: string;
  } }>({
    0: {
      evidenceName: '',
      description: '',
      evidenceType: '',
      fileType: '',
      location: '',
    },
  });
  const [showEvidence, setShowEvidence] = useState(false);
  const [evidenceData, setEvidenceData] = useState<{ [key: number]: File[] }>(
    {},
  );
  const [existingEvidenceDocs, setExistingEvidenceDocs] = useState<{ [key: number]: any[] }>({});
  const [documentsToDelete, setDocumentsToDelete] = useState<number[]>([]);
  // Track which existing evidence items need to be updated (evidenceId -> form data)
  const [evidenceToUpdate, setEvidenceToUpdate] = useState<{ [evidenceId: number]: any }>({});
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const [isRecording, setIsRecording] = useState(false);
  const { t } = useTranslation();

  // Translation keys
  const newinvestigationBreadcrumb = t('breadcrumb.newinvestigation');
  const selectstatusText = t('profileedit.selectstatus');
  const arrestedText = t('profileedit.arrested');
  const notArrestedText = t('profileedit.not_arrested');
  const notAccessibleText = t('profileedit.not_accessible');
  const escapedText = t('profileedit.escaped');
  const investdayText = t('newinvestigation.investday');
  const completeText = t('newinvestigation.complete');
  const choosestatusText = t('newinvestigation.choosestatus');
  const inprogressText = t('newinvestigation.inprogress');
  const arreststatusText = t('newinvestigation.arreststatus');
  const dateText = t('newinvestigation.date');
  const investdescText = t('newinvestigation.investdesc');
  const casestatusText = t('newinvestigation.casestatus');
  const placeholderText = t('newinvestigation.placeholder');
  const submitText = t('newinvestigation.submit');

  // Handle edit mode - pre-fill form with existing investigation data
  useEffect(() => {
    const loadEditData = async () => {
      if (location.state?.editMode && location.state?.investigationData) {
        console.log('📝 Edit mode detected, pre-filling form with:', location.state.investigationData);
        console.log('📝 FIR ID from location.state:', location.state.firId);
        console.log('📝 FIR ID from investigationData:', location.state.investigationData.firId);
        console.log('📝 Internal ID:', location.state.investigationData.internalId);
        console.log('📝 Investigation ID:', location.state.investigationData.investigationId);
        setIsEditMode(true);
        // Use internalId (unique primary key) for update API
        setEditInvestigationId(location.state.investigationData.internalId?.toString() || location.state.investigationId);
        // Use investigationId (string format like INV/MH/PNE/2025/000001) for evidence API
        setEditInvestigationStringId(location.state.investigationData.investigationId || location.state.investigationId);
        
        const invData = location.state.investigationData;
        
        // Pre-fill investigation description
        if (invData.description) {
          setInvestigationDetails({
            investDescription: invData.description
          });
        }
        
        // Pre-fill investigation day
        if (invData.investigationDay) {
          setInvestDay(invData.investigationDay);
        }
        
        // IMPORTANT: Clear evidenceData to prevent uploading old files again
        setEvidenceData({});
        
        // Fetch and pre-fill evidence data using internalId (unique per investigation entry)
        const internalId = location.state.investigationData.internalId;
        const investigationStringId = location.state.investigationData.investigationId || location.state.investigationId;
        
        if (internalId) {
          try {
            console.log('📦 Fetching evidence for investigation internalId:', internalId);
            // Use the entry-specific endpoint to get only evidence for this specific investigation entry
            let evidenceResponse = await request('investigation', 'GET', `/evidence/entry/${internalId}`, {});
            let evidenceList = evidenceResponse?.data || evidenceResponse;
            
            // Ensure it's an array
            if (!Array.isArray(evidenceList)) {
              evidenceList = [];
            }
            
            console.log(`📊 Found ${evidenceList.length} evidence items for internalId ${internalId}`);
            
            // For legacy evidence (created before investigationInternalId was implemented),
            // we need to check if there's evidence with the old investigationId that doesn't have internalId set
            // Only show legacy evidence if NO evidence was found with the new internalId approach
            if (evidenceList.length === 0 && investigationStringId) {
              console.log('📦 No entry-specific evidence found, checking for legacy evidence with investigationId:', investigationStringId);
              const legacyResponse = await request('investigation', 'GET', `/evidence/investigation/${investigationStringId}`, {});
              const legacyList = legacyResponse?.data || legacyResponse;
              
              if (Array.isArray(legacyList) && legacyList.length > 0) {
                // Filter to only include evidence that doesn't have investigationInternalId set (legacy evidence)
                const legacyEvidence = legacyList.filter((ev: any) => !ev.investigationInternalId);
                console.log(`📊 Found ${legacyEvidence.length} legacy evidence items (without internalId)`);
                evidenceList = legacyEvidence;
              }
            }
            
            if (evidenceList.length > 0) {
              console.log('✅ Found evidence:', evidenceList);
              
              // Show evidence section
              setShowEvidence(true);
              
              // Pre-fill evidence form and store existing documents
              const evidenceMap: any = {};
              const existingDocsMap: any = {};
              
              evidenceList.forEach((ev: any, index: number) => {
                evidenceMap[index] = {
                  evidenceName: ev.evidenceName || '',
                  description: ev.description || '',
                  evidenceType: ev.evidenceType || '',
                  fileType: ev.fileType || '',
                  location: ev.locationFound || ev.location || '',
                };
                
                // Store existing document information - check for documentId or filePath
                if (ev.documentId || ev.filePath) {
                  existingDocsMap[index] = [{
                    documentName: ev.evidenceName || 'Evidence Document',
                    documentPath: ev.filePath || '',
                    documentId: ev.documentId,
                    evidenceId: ev.evidenceId || ev.id,
                    fileType: ev.fileType || '',
                  }];
                  console.log(`📄 Stored existing document for evidence ${index}:`, existingDocsMap[index]);
                }
              });
              
              setEvidence(evidenceMap);
              setExistingEvidenceDocs(existingDocsMap);
              console.log('✅ Evidence form pre-filled with existing documents');
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch evidence:', error);
          }
        }
        
        console.log('✅ Form pre-filled for editing');
      }
    };
    
    loadEditData();
  }, [location.state]);

  useEffect(() => {
    const fetchOfficerCaseDiary = async () => {
      try {
        console.log(
          '🔍 Attempting to fetch case diary for victimId:',
          victimId,
        );
        
        // Set initial data immediately to show form faster
        // This allows the form to render while we fetch additional data
        setData({
          investigationDetailsList: [],
          victimList: [{
            caseStatus: '',
            offenderList: []
          }]
        });
        
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const response = await request(
          'investigation',
          'GET',
          `/investigation/getCaseDiary/${victimId}?_t=${timestamp}`,
          {},
        );
        console.log('✅ Case diary response received:', response);
        console.log('📦 Response structure:', {
          hasInvestigationDetailsList: !!response.investigationDetailsList,
          investigationDetailsListLength: response.investigationDetailsList?.length,
          responseKeys: Object.keys(response || {}),
          fullResponse: response
        });

        if (response) {
          setData(response);
          
          // Calculate investigation entry number for TODAY
          const today = new Date();
          // Set to start of day for accurate comparison
          today.setHours(0, 0, 0, 0);
          
          console.log('📅 Today\'s date (start of day):', today.toISOString());
          console.log('📋 Total investigations:', response.investigationDetailsList?.length || 0);
          
          // Log each investigation for debugging
          if (response.investigationDetailsList && response.investigationDetailsList.length > 0) {
            console.log('📋 Investigation details:');
            response.investigationDetailsList.forEach((inv: any, idx: number) => {
              console.log(`  ${idx + 1}.`, {
                id: inv.investigationId,
                assignedOn: inv.assignedOn,
                createdOn: inv.createdOn,
                investigationDate: inv.investigationDate
              });
            });
          } else {
            console.warn('⚠️ No investigations found in response!');
          }
          
          // Count investigations created today
          const investigationsToday = (response.investigationDetailsList || []).filter((inv: any) => {
            try {
              // Check both assignedOn and createdOn fields
              const dateFields = ['assignedOn', 'createdOn', 'investigationDate'];
              
              for (const field of dateFields) {
                if (inv[field]) {
                  const invDate = new Date(inv[field]);
                  // Set to start of day for comparison
                  invDate.setHours(0, 0, 0, 0);
                  
                  console.log(`🔍 Checking investigation ${inv.investigationId}:`, {
                    field: field,
                    date: invDate.toISOString(),
                    isToday: invDate.getTime() === today.getTime()
                  });
                  
                  if (invDate.getTime() === today.getTime()) {
                    console.log(`✅ Investigation ${inv.investigationId} is from today!`);
                    return true;
                  }
                }
              }
              
              console.log(`❌ Investigation ${inv.investigationId} is NOT from today`);
            } catch (error) {
              console.warn('⚠️ Error parsing investigation date:', error);
            }
            return false;
          });
          
          // Check if investigation count was passed from previous page
          const passedCount = location.state?.investigationsToday;
          const entryNumber = passedCount !== undefined ? passedCount + 1 : investigationsToday.length + 1;
          
          console.log(`📊 Investigations created today (from API): ${investigationsToday.length}`);
          console.log(`📊 Investigations today (passed from previous page): ${passedCount}`);
          console.log(`📊 Next entry number: ${entryNumber}`);
          
          setInvestDay(entryNumber);
          setCaseStatus(response.victimList?.[0]?.caseStatus || '');
          setOffenders(response.victimList?.[0]?.offenderList || []);
        }
        setIsLoadingData(false);
      } catch (error) {
        console.error("❌ Error fetching victim's case diary:", error);

        // Set fallback data so the form can still be used
        console.log('📋 Setting fallback data due to API error');
        setData({
          investigationDetailsList: [],
          victimList: [{
            caseStatus: '',
            offenderList: []
          }]
        });
        setInvestDay(1);
        setCaseStatus('');
        setOffenders([]);
        setIsLoadingData(false);
      }
    };

    if (victimId) {
      fetchOfficerCaseDiary();
    } else {
      console.warn('⚠️ No victimId provided');
      // Set fallback data even without victimId
      setData({
        investigationDetailsList: [],
        victimList: [{
          caseStatus: '',
          offenderList: []
        }]
      });
      setIsLoadingData(false);
    }
  }, [victimId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvestigationDetails((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleArrestStatusChange = (index: number, value: string) => {
    setOffenders((prevOffenders) =>
      prevOffenders.map((offender, i) =>
        i === index ? { ...offender, arrestedStatus: value } : offender,
      ),
    );
  };

  const handleCaseStatusChange = (e) => {
    setCaseStatus(e.target.value);
  };

  const handleEvidenceChange = (e: any, index: number) => {
    const { name, value } = e.target;
    setEvidence((prevState: any) => ({
      ...prevState,
      [index]: {
        ...prevState[index],
        [name]: value,
      },
    }));
    
    // If this is an existing evidence (has evidenceId), mark it for update
    if (isEditMode && existingEvidenceDocs[index]?.length > 0) {
      const existingDoc = existingEvidenceDocs[index][0];
      if (existingDoc?.evidenceId) {
        setEvidenceToUpdate((prev: any) => ({
          ...prev,
          [existingDoc.evidenceId]: {
            ...prev[existingDoc.evidenceId],
            [name]: value,
            evidenceId: existingDoc.evidenceId,
          },
        }));
        console.log(`📝 Marked evidence ${existingDoc.evidenceId} for update - ${name}: ${value}`);
      }
    }
  };

  const handleEvidenceDataChange = (files: File[], evidenceIndex: number) => {
    setEvidenceData((prevData) => ({
      ...prevData,
      [evidenceIndex]: files,
    }));
  };

  const handleRemoveExistingDocument = (evidenceIndex: number, docIndex: number) => {
    console.log('🗑️ Removing existing document:', { evidenceIndex, docIndex });
    
    // Get the document to be removed
    const docToRemove = existingEvidenceDocs[evidenceIndex]?.[docIndex];
    if (docToRemove && docToRemove.evidenceId) {
      // Add to deletion list
      setDocumentsToDelete(prev => [...prev, docToRemove.evidenceId]);
      console.log('📝 Added to deletion list:', docToRemove.evidenceId);
    }
    
    // Remove from local state
    setExistingEvidenceDocs(prev => {
      const updated = { ...prev };
      if (updated[evidenceIndex]) {
        updated[evidenceIndex] = updated[evidenceIndex].filter((_, i) => i !== docIndex);
        if (updated[evidenceIndex].length === 0) {
          delete updated[evidenceIndex];
        }
      }
      return updated;
    });
  };

  // Handler for when an entire evidence entry is removed (including its existing documents)
  const handleRemoveEvidenceEntry = (evidenceIndex: number, existingDocs: any[]) => {
    console.log('🗑️ Removing evidence entry:', evidenceIndex, 'with existing docs:', existingDocs);
    
    // Mark all existing documents in this entry for deletion
    const evidenceIdsToDelete = existingDocs
      .filter((doc: any) => doc.evidenceId)
      .map((doc: any) => doc.evidenceId);
    
    if (evidenceIdsToDelete.length > 0) {
      setDocumentsToDelete(prev => [...prev, ...evidenceIdsToDelete]);
      console.log('📝 Added to deletion list:', evidenceIdsToDelete);
    }
    
    // Remove from existing evidence docs state
    setExistingEvidenceDocs(prev => {
      const updated = { ...prev };
      delete updated[evidenceIndex];
      return updated;
    });
  };

  // Form renders immediately with initial empty data
  // isLoadingData tracks if we're still fetching additional data from API

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    // Validation
    if (!investigationDetails.investDescription.trim()) {
      Swal.fire({
        title: 'Validation Error!',
        text: 'Please provide investigation description.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get officer ID from session/context
      const storedOfficer = sessionStorage.getItem('officer') || localStorage.getItem('officer');
      const officerData = storedOfficer ? JSON.parse(storedOfficer) : null;
      const officerId = officerData?.officerId || 1; // Fallback to 1 if not found

      console.log('👤 Officer ID:', officerId);
      
      // Check if we're in edit mode
      if (isEditMode && editInvestigationId) {
        console.log('📝 Updating investigation:', editInvestigationId);
        
        // Step 1: Delete marked documents
        if (documentsToDelete.length > 0) {
          console.log('🗑️ Deleting marked documents:', documentsToDelete);
          for (const evidenceId of documentsToDelete) {
            try {
              console.log(`🗑️ Attempting to delete evidence ID: ${evidenceId}`);
              const deleteResponse = await request('investigation', 'DELETE', `/evidence/${evidenceId}`, null);
              console.log('✅ Deleted evidence:', evidenceId, 'Response:', deleteResponse?.status || deleteResponse);
            } catch (error: any) {
              console.error('❌ Failed to delete evidence:', evidenceId);
              console.error('❌ Error details:', error?.response?.status, error?.response?.data || error?.message);
            }
          }
        }
        
        // Step 2: Update existing evidence that was modified
        if (Object.keys(evidenceToUpdate).length > 0) {
          console.log('📝 Updating modified evidence:', evidenceToUpdate);
          for (const [evidenceIdStr, updateData] of Object.entries(evidenceToUpdate)) {
            const evidenceId = parseInt(evidenceIdStr);
            // Skip if this evidence was marked for deletion
            if (documentsToDelete.includes(evidenceId)) {
              console.log(`ℹ️ Skipping update for deleted evidence ${evidenceId}`);
              continue;
            }
            
            try {
              // Get the full form data for this evidence index
              const evidenceIndex = Object.keys(existingEvidenceDocs).find(
                key => existingEvidenceDocs[parseInt(key)]?.[0]?.evidenceId === evidenceId
              );
              const fullFormData = evidenceIndex !== undefined ? evidence[parseInt(evidenceIndex)] : {};
              
              const updatePayload = {
                investigationId: editInvestigationStringId || editInvestigationId,
                evidenceName: (updateData as any).evidenceName || fullFormData?.evidenceName,
                description: (updateData as any).description || fullFormData?.description,
                evidenceType: (updateData as any).evidenceType || fullFormData?.evidenceType,
                locationFound: (updateData as any).location || fullFormData?.location,
              };
              
              console.log(`📤 Updating evidence ${evidenceId}:`, updatePayload);
              await request('investigation', 'PUT', `/evidence/${evidenceId}`, updatePayload);
              console.log(`✅ Updated evidence ${evidenceId}`);
            } catch (error) {
              console.error(`❌ Failed to update evidence ${evidenceId}:`, error);
            }
          }
        }
        
        // Step 3: Upload new evidence files (only if there are NEW files to upload)
        if (Object.keys(evidenceData).length > 0) {
          try {
            console.log('📦 Checking for new evidence files to upload...');
            console.log('📦 Evidence data keys:', Object.keys(evidenceData));
            console.log('📦 Evidence data:', evidenceData);
            console.log('📦 Evidence form data:', evidence);
            
            let uploadedCount = 0;
            
            for (const [evidenceIndex, files] of Object.entries(evidenceData)) {
              // Skip if no files in this evidence entry
              if (!files || (Array.isArray(files) && files.length === 0)) {
                console.log(`ℹ️ No files for evidence ${evidenceIndex}, skipping`);
                continue;
              }
              
              const evidenceFormData = evidence[parseInt(evidenceIndex)] || {};
              console.log(`📋 Evidence form data for index ${evidenceIndex}:`, evidenceFormData);
              
              // Use default evidence type if not provided
              const evidenceType = evidenceFormData.evidenceType || 'OTHER';
              
              const fileArray = Array.isArray(files) ? files : [files];
              console.log(`📤 Uploading ${fileArray.length} file(s) for evidence ${evidenceIndex}`);
              
              for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i];
                
                // Use both investigationId (string format) and investigationInternalId (unique integer)
                // investigationInternalId ensures evidence is linked to specific investigation entry
                const evidenceReq = {
                  investigationId: editInvestigationStringId || editInvestigationId, // String format for backward compatibility
                  investigationInternalId: parseInt(editInvestigationId!), // Unique integer per investigation entry
                  evidenceName: evidenceFormData.evidenceName || file.name,
                  description: evidenceFormData.description || 'Evidence collected',
                  evidenceType: evidenceType,
                  locationFound: evidenceFormData.location || 'Unknown',
                  collectedBy: 'Officer ' + officerId,
                  collectedOn: toLocalDateTime(),
                };
                
                console.log(`📦 Uploading evidence file ${i + 1}/${fileArray.length}:`, evidenceReq);
                console.log(`📦 Using investigationInternalId: ${evidenceReq.investigationInternalId}`);
                await caseDiaryService.createEvidence(evidenceReq, file);
                uploadedCount++;
                console.log(`✅ Evidence file ${i + 1} uploaded successfully`);
              }
            }
            
            if (uploadedCount > 0) {
              console.log(`✅ Successfully uploaded ${uploadedCount} new evidence file(s)`);
            } else {
              console.log('ℹ️ No new evidence files to upload');
            }
          } catch (err) {
            console.error('❌ Evidence upload failed:', err);
          }
        } else {
          console.log('ℹ️ No evidence data to upload (evidenceData is empty)');
        }
        
        // Step 3: Update investigation description
        const updatePayload = {
          internalId: parseInt(editInvestigationId!), // Use unique primary key
          description: investigationDetails.investDescription,
        };
        console.log('📝 Updating investigation with payload:', updatePayload);
        console.log('📝 Internal ID:', updatePayload.internalId);
        console.log('📝 Internal ID type:', typeof updatePayload.internalId);
        console.log('📝 Description length:', investigationDetails.investDescription?.length);
        
        const updateResponse = await request('investigation', 'PUT', '/investigation/updateInvestigationById', updatePayload);
        console.log('✅ Update response:', updateResponse);
        
        Swal.fire({
          title: 'Success!',
          text: 'Investigation updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          // Navigate with state to trigger refresh
          // Try multiple sources for FIR ID - FIXED: Check investigationData first since it's most reliable
          const firId = location.state?.investigationData?.firId || 
                       victimId || 
                       location.state?.firId;
          
          console.log('🔙 Navigating back to case diary with FIR ID:', firId);
          console.log('🔍 Available IDs - victimId:', victimId, 'location.state.firId:', location.state?.firId, 'investigationData.firId:', location.state?.investigationData?.firId);
          
          if (firId) {
            navigate(`/casediarypreview/${firId}`, { 
              state: { refresh: true, timestamp: Date.now() } 
            });
          } else {
            console.error('❌ No FIR ID available for navigation');
            // Fallback: navigate to dashboard
            navigate('/dashboard');
          }
        });
        
        setIsSubmitting(false);
        return;
      }
      
      console.log('🔍 Creating investigation for FIR/Victim ID:', victimId);

      // Step 1: Create Investigation using caseDiaryService
      const investigationData = {
        firId: victimId!, // FIR ID (string format: FIR_MH_PNE_2025_000001)
        officerId: officerId,
        assignedOn: toLocalDateTime(),
        status: 'IN_PROGRESS' as InvestigationStatus,
        description: investigationDetails.investDescription,
      };

      console.log('📝 Creating investigation:', investigationData);
      const investigationResponse = await caseDiaryService.createInvestigation(investigationData);
      console.log('✅ Investigation created:', investigationResponse);
      console.log('🆔 Investigation response keys:', Object.keys(investigationResponse || {}));
      
      // Extract investigationId and internalId from response - handle both response.data and direct response
      const responseData = investigationResponse.data || investigationResponse;
      const investigationId = responseData.investigationId;
      const investigationInternalId = responseData.internalId; // Unique database ID for linking evidence
      
      if (!investigationId) {
        console.error('❌ Investigation ID is missing from response!');
        console.error('❌ Available response fields:', Object.keys(investigationResponse || {}));
        console.error('❌ Response data fields:', Object.keys(responseData || {}));
        console.error('❌ Full response:', JSON.stringify(investigationResponse, null, 2));
        throw new Error('Failed to get investigation ID from response');
      }

      console.log('✅ Using Investigation ID:', investigationId);
      console.log('✅ Using Investigation Internal ID:', investigationInternalId);

      // Step 2: Update offender arrest status if needed
      if (offenders.length > 0 && offenders.some(o => o.arrestedStatus)) {
        const updateDto = {
          firId: victimId!, // FIR ID as string
          caseStatus: caseStatus || 'in progress',
          offenders: offenders.map((offender) => ({
            offenderId: offender.offenderId!,
            arrestedStatus: offender.arrestedStatus || 'Not Arrested',
          })),
        };

        try {
          await caseDiaryService.updateInvestigation(updateDto);
          console.log('✅ Investigation status updated');
        } catch (err) {
          console.warn('⚠️ Could not update investigation status:', err);
        }
      }

      let evidenceSuccess = true;

      // Step 3: Submit evidence if present
      if (showEvidence && Object.keys(evidenceData).length > 0) {
        try {
          console.log('📦 Submitting evidence...');
          console.log('📋 Evidence data:', evidence);
          console.log('📁 Evidence files:', evidenceData);

          // Submit each evidence entry with its files
          for (const [evidenceIndex, filesData] of Object.entries(evidenceData)) {
            const files = filesData as File[];
            const evidenceFormData = evidence[parseInt(evidenceIndex)] || {};

            console.log(`📤 Uploading evidence ${parseInt(evidenceIndex) + 1} with ${files.length} files:`, evidenceFormData);

            for (let i = 0; i < files.length; i++) {
              const file = files[i];

              const evidenceReq = {
                investigationId: investigationId,
                investigationInternalId: investigationInternalId, // Link evidence to specific investigation entry
                evidenceName: undefined, // Let backend use original filename
                description: evidenceFormData.description || 'Evidence collected',
                evidenceType: evidenceFormData.evidenceType || 'OTHER',
                locationFound: evidenceFormData.location || 'Unknown',
                collectedBy: 'Officer ' + officerId,
                collectedOn: toLocalDateTime(),
              };

              console.log('📦 Evidence request:', evidenceReq);
              console.log('📦 Using investigationInternalId:', investigationInternalId);
              const result = await caseDiaryService.createEvidence(evidenceReq, file);
              console.log('✅ Evidence created:', result);
            }
          }
          console.log('✅ All evidence submitted successfully');
        } catch (err) {
          console.error('❌ Evidence submission failed:', err);
          evidenceSuccess = false;
        }
      } else {
        console.log('ℹ️ No evidence to submit');
      }

      // Step 4: Create case diary entry after investigation + evidence are saved
      if (investigationId) {
        try {
          console.log('📝 Creating case diary entry for investigation:', investigationId);

          const caseDiaryData = {
            investigationId: investigationId,
            entryDate: toLocalDateTime(),
            entryText: investigationDetails.investDescription,
          };

          console.log('📦 Case diary data:', caseDiaryData);
          const caseDiaryResponse = await caseDiaryService.createCaseDiary(caseDiaryData);
          console.log('✅ Case diary entry created successfully:', caseDiaryResponse);
        } catch (caseDiaryError) {
          console.error('❌ Error creating case diary entry:', caseDiaryError);
          // Don't fail the whole process if case diary creation fails
        }
      } else {
        console.error('❌ No investigation ID available for case diary creation');
      }

      // Success handling
      setIsSubmitting(false);

      if (evidenceSuccess) {
        await Swal.fire({
          title: 'Success!',
          text: 'Investigation and evidence created successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        navigate(`/casediarypreview/${victimId}`);
      } else {
        await Swal.fire({
          title: 'Partial Success',
          text: 'Investigation created, but some evidence operations failed.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        navigate(`/casediarypreview/${victimId}`);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('❌ Error creating investigation:', error);
      const submitError = error as {
        message?: string;
        response?: { data?: { message?: string; error?: string } | string };
      };
      const responseBody = submitError.response?.data;
      const serverMessage = typeof responseBody === 'string'
        ? responseBody
        : responseBody?.message || responseBody?.error;
      const errorDetail = serverMessage || submitError.message;
      await Swal.fire({
        title: 'Error!',
        text: errorDetail
          ? `Failed to create investigation: ${errorDetail}`
          : 'Failed to create investigation. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'mr-IN';
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setIsRecording(true);
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInvestigationDetails((prevState) => ({
        ...prevState,
        investDescription:
          `${prevState.investDescription} ${transcript}`.trim(),
      }));
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error detected: ' + event.error);
      setIsRecording(false);
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);

    setTimeout(() => {
      stopRecording();
    }, 30000);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={newinvestigationBreadcrumb} />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mx-13 mb-4">
        <h3 className="flex items-center justify-between text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
          <div className="flex items-center gap-3">
            {/* Fingerprint Investigation Icon */}
            <svg
              className="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
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
            Investigation Entry
          </div>
          <span className="">
            {dateText} :{' '}
            {new Date().toLocaleString('mr-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              weekday: 'long',
            })}
          </span>
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 px-8 pb-2 pt-8">
            {offenders.map((offender, index) => (
              <div key={index}>
                <label
                  htmlFor={`arrestedStatus-${index}`}
                  className="mt-3 block text-black dark:text-white font-semibold"
                >
                  {arreststatusText} : {offender.offenderName}
                </label>
                <select
                  id={`arrestedStatus-${index}`}
                  name={`arrestedStatus-${index}`}
                  value={offender.arrestedStatus}
                  onChange={(e) =>
                    handleArrestStatusChange(index, e.target.value)
                  }
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">{selectstatusText}</option>
                  <option value="Arrested">{arrestedText}</option>
                  <option value="Not Reachable">{notArrestedText}</option>
                  <option value="Escaped">{escapedText}</option>
                  <option value="Not Reachable">{notAccessibleText}</option>
                </select>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 px-8 pb-2">
            <label
              htmlFor={caseStatus}
              className="mt-3 block text-black dark:text-white font-semibold"
            >
              {casestatusText} :
            </label>
            <div className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 py-2 px-5 text-black dark:border-form-strokedark dark:bg-meta-4 dark:text-white">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                In Progress
              </span>
            </div>
          </div>
          <div className="relative grid grid-cols-1 px-8 pb-8">
            <label
              htmlFor="investDescription"
              className="mt-3 block text-black dark:text-white font-semibold"
            >
              {investdescText} : <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={Math.max(
                investigationDetails.investDescription.split('\n').length,
                4,
              )}
              name="investDescription"
              value={investigationDetails.investDescription}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              style={{ minHeight: '4rem' }}
            ></textarea>
            <button
              type="button"
              id="crime-mic"
              onClick={handleRecording}
              className={`absolute bottom-8 right-8 ${
                isRecording ? 'text-red-500' : 'text-gray-500'
              } p-2 rounded-full  hover:text-red-500 focus:outline-none`}
            >
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 2a3 3 0 00-3 3v4a3 3 0 106 0V5a3 3 0 00-3-3z"></path>
                <path d="M5 8a5 5 0 0010 0H14a4 4 0 11-8 0H5z"></path>
                <path d="M10 18a6.978 6.978 0 01-4.6-1.7 1 1 0 011.4-1.4A4.978 4.978 0 0010 16a4.978 4.978 0 003.2-1.1 1 1 0 111.4 1.4A6.978 6.978 0 0110 18z"></path>
              </svg>
            </button>
          </div>

          {showEvidence && (
            <div>
              <EvidencePage
                evidence={evidence}
                setEvidence={setEvidence}
                evidenceData={evidenceData}
                setEvidenceData={setEvidenceData}
                handleEvidenceChange={handleEvidenceChange}
                handleEvidenceDataChange={handleEvidenceDataChange}
                existingEvidenceDocs={existingEvidenceDocs}
                onRemoveExistingDocument={handleRemoveExistingDocument}
                onRemoveEvidenceEntry={handleRemoveEvidenceEntry}
              />
            </div>
          )}

          <div className="flex justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (showEvidence) {
                    // When hiding evidence section, mark all existing evidence for deletion
                    const allExistingEvidenceIds: number[] = [];
                    Object.keys(existingEvidenceDocs).forEach((key) => {
                      const docs = existingEvidenceDocs[parseInt(key)] || [];
                      docs.forEach((doc: any) => {
                        if (doc.evidenceId) {
                          allExistingEvidenceIds.push(doc.evidenceId);
                        }
                      });
                    });
                    if (allExistingEvidenceIds.length > 0) {
                      setDocumentsToDelete(prev => [...prev, ...allExistingEvidenceIds]);
                      console.log('🗑️ Marked all existing evidence for deletion:', allExistingEvidenceIds);
                    }
                    // Clear existing evidence docs
                    setExistingEvidenceDocs({});
                    // Clear new evidence data
                    setEvidenceData({});
                    // Reset evidence form
                    setEvidence({
                      0: {
                        evidenceName: '',
                        description: '',
                        evidenceType: '',
                        fileType: '',
                        location: '',
                      },
                    });
                  }
                  setShowEvidence(!showEvidence);
                }}
                className="relative inline-flex items-center justify-center p-0.5 mb-2 ml-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 dark:bg-graydark">
                  {showEvidence ? <p>Remove Evidence</p> : <p>Add Evidence</p>}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'text-gray-900 bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800'
              } dark:text-white`}
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0 flex items-center gap-2">
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? (isEditMode ? 'Updating Investigation...' : 'Creating Investigation...') : (isEditMode ? 'Update Investigation' : submitText)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default NewInvestigation;
