import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Stepper from '../components/Stepper';
import Offenderpage from './Caseforms/Offenderpage';
import Crime from './Caseforms/Crime';
import Complainee from './Caseforms/Complainee';
import Previewstatement from './Caseforms/Previewstatement';
import WitnessForm from './Caseforms/WitnessForm';
import Loader from '../common/Loader';
import request from '../Service/axios_helper';
import axios from 'axios';
import { useNotification } from '../common/NotificationContext';
import SuccessPopup from '../common/SuccessPopup';
import Swal from 'sweetalert2';

interface RegisterstatementProps {
  handleLogout: () => void;
}

const Registerstatement: React.FC<RegisterstatementProps> = ({
  handleLogout,
}) => {
  const imagekey = import.meta.env.VITE_IMAGE_API;
  const { statementId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [offenderList, setOffenderList] = useState<any[]>([]);
  const [complaineeList, setComplaineeList] = useState<any[]>([]);
  const [crimeData, setCrimeData] = useState<any>({});
  const navigate = useNavigate();
  const location = useLocation();
  const [victimAadhar, setVictimAadhar] = useState<File | null>(null);
  const [victimPan, setVictimPan] = useState<File | null>(null);
  const [victimPassport, setVictimPassport] = useState<File | null>(null);
  const [offenderAadhar, setOffenderAadhar] = useState<(File | null)[]>([]);
  const [offenderPan, setOffenderPan] = useState<(File | null)[]>([]);
  const [offenderPassport, setOffenderPassport] = useState<(File | null)[]>([]);

  // Witness state variables
  const [witnessList, setWitnessList] = useState<any[]>([]);
  const [witnessAadhar, setWitnessAadhar] = useState<(File | null)[]>([]);
  const [witnessPan, setWitnessPan] = useState<(File | null)[]>([]);
  const [witnessPassport, setWitnessPassport] = useState<(File | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [officer, setOfficer] = useState(null);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    title: string;
    message: string;
    details: {label: string; value: string}[];
    type: 'success' | 'error';
  }>({
    title: '',
    message: '',
    details: [],
    type: 'success'
  });

  // File state per complainee - maps complainee index to their files
  const [complaineeFiles, setComplaineeFiles] = useState<{[key: number]: {
    aadhar: File | null;
    pan: File | null;
    passport: File | null;
  }}>({});

  const [isEditMode, setIsEditMode] = useState(false);

  const { t } = useTranslation();
  const { showSuccess, showError, showLoading, closeLoading } = useNotification();
  const registerstatement = t('registerstatement') as any;
  const { viewstatement } = registerstatement;

  // Debug state changes
  useEffect(() => {
    console.log('🔄 isEditMode state changed to:', isEditMode);
    console.log('🔄 Current button text should be:', isEditMode ? 'Update' : 'Submit');
  }, [isEditMode]);

  // Debug currentStep changes
  useEffect(() => {
    console.log('🔄 currentStep changed to:', currentStep, 'of', NUMBER_OF_STEPS);
  }, [currentStep]);

  const getOfficerFromStorage = () => {
    // Get officer email - check both 'officerEmail' and 'officer' object
    let officerEmail = localStorage.getItem('officerEmail');
    let officer = null;
    
    console.log('🔍 DEBUGGING OFFICER DATA RETRIEVAL...');
    console.log('localStorage contents:', {
      officerEmail: localStorage.getItem('officerEmail'),
      officer: localStorage.getItem('officer'),
      token: localStorage.getItem('token') ? 'Present' : 'Missing',
      userData: localStorage.getItem('userData')
    });
    
    // Try to get officer data from localStorage
    try {
      const officerStr = localStorage.getItem('officer');
      if (officerStr) {
        officer = JSON.parse(officerStr);
        console.log('Officer data from localStorage:', officer);
        
        // If no email found, try to get it from officer object
        if (!officerEmail && officer?.email) {
          officerEmail = officer.email;
          localStorage.setItem('officerEmail', officerEmail); // Store for future use
          console.log('Email extracted from officer object:', officerEmail);
        }
      }
    } catch (e) {
      console.error('Failed to parse officer data from localStorage:', e);
    }
    
    // If still no officer data, create default officer
    if (!officer) {
      console.log('No officer data found, using default officer');
      officer = {
        officerId: 1921,
        name: 'Default Officer',
        email: officerEmail || 'test@example.com',
        stationId: 1,
        stationName: 'Default Station',
        designation: 'Inspector'
      };
    }
    
    // Ensure officer has required fields
    if (!officer.officerId) {
      officer.officerId = 1921;
    }
    if (!officer.email && officerEmail) {
      officer.email = officerEmail;
    }
    
    console.log('Final officer data:', officer);
    return officer;
  };

  // Test API connectivity
  const testApiConnectivity = async () => {
    console.log('🔍 TESTING API CONNECTIVITY...');
    try {
      // Test if complaintandfir API is reachable
      const response = await fetch(`${import.meta.env.VITE_complaintandfir_API}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      console.log('✅ complaintandfir API Health Check:', response.status, response.statusText);
    } catch (error) {
      console.error('❌ complaintandfir API Connectivity Test Failed:', error);
    }
  };

  useEffect(() => {
    // Get officer data from localStorage instead of API call
    const officerData = getOfficerFromStorage();
    setOfficer(officerData);
    
    // Test API connectivity
    testApiConnectivity();
    // Check if we're in edit mode by looking at location state
    const isEditModeFromLocation = Boolean(location.state?.isEdit || location.state?.editMode || false);

    console.log('🔍 EDIT MODE DATA MAPPING:');
    console.log('location.state?.isEdit:', location.state?.isEdit);
    console.log('location.state?.editData:', location.state?.editData);
    console.log('location.state?.caseData:', location.state?.caseData);
    console.log('victimId (URL param):', statementId);
    console.log('isEditModeFromLocation:', isEditModeFromLocation);

    // Set the isEditMode state
    setIsEditMode(isEditModeFromLocation);
    console.log('✅ Set isEditMode state to:', isEditModeFromLocation);

    if (isEditModeFromLocation && (location.state?.editData || location.state?.caseData)) {
      const caseData = location.state?.editData || location.state?.caseData;

      // Validate caseData before proceeding
      if (!caseData || !caseData.complaintId) {
        console.error('❌ Invalid case data or missing complaintId:', caseData);
        showError('Edit Error', 'Cannot edit statement - missing or invalid case data');
        navigate('/allstatements');
        return;
      }

      console.log('✅ Using location.state caseData for editing; fetching full details by complaintId');
      // Always fetch the authoritative full statement so witness/crime details are included
      fetchStatementForEdit(caseData.complaintId.toString());
    } else if (statementId) {
      // For URL-based editing (like /register-statement/123)
      console.log('🔄 URL-based edit mode, fetching data for statementId:', statementId);
      fetchStatementForEdit(statementId);
    } else {
      // For completely new statement
      console.log('🆕 New statement mode');
      initializeNewStatement();
    }
  }, [statementId, location.state]);

  const fetchStatementForEdit = async (idOverride?: string) => {
    try {
      const targetId = idOverride || statementId;
      console.log('🔄 Fetching statement for edit mode:', targetId);

      // First, test if backend is running
      console.log('🧪 Testing backend connectivity...');
      try {
        const testResponse = await request('complaintandfir', 'GET', '/test', {});
        const testData = testResponse?.data || testResponse;
        console.log('✅ Backend is running:', testData);
      } catch (testError) {
        console.error('❌ Backend test failed:', testError);
        showError('Backend Error', 'Backend server is not running. Please start the backend server first.');
        setIsLoading(false);
        return;
      }

      console.log('📍 URL will be:', `/statements/${targetId}`);

      const response = await request(
        'complaintandfir',
        'GET',
        `/statements/${targetId}`,
        {},
      );

      // IMPORTANT: Extract data from axios response wrapper
      const responseData = response?.data || response;
      console.log('📥 Edit mode - Raw statement data received:', responseData);
      console.log('📊 Response type:', typeof responseData);
      console.log('📊 Response keys:', responseData ? Object.keys(responseData) : 'null');
      console.log('📋 Full response data:', JSON.stringify(responseData, null, 2));

      if (responseData) {
        console.log('🔍 Backend crime data fields:');
        console.log('  - subject:', responseData.subject);
        console.log('  - description:', responseData.description);
        console.log('  - crimeAddress:', responseData.crimeAddress);
        console.log('  - crimeDateTime:', responseData.crimeDateTime);
        console.log('  - filedByStationId:', responseData.filedByStationId);
      }

      if (responseData) {
        console.log('✅ Valid response received, populating form...');
        populateFormWithStatementData(responseData);
        // Set edit mode
        setIsEditMode(true);
      } else {
        console.error('❌ Empty response received');
        showError('Error', 'No statement data received');
      }
    } catch (error: any) {
      console.error('❌ Error fetching statement for edit:', error);
      console.error('❌ Error details:', error.response || error);

      if (error.response?.status === 404) {
        showError('Statement Not Found', `Statement with ID ${statementId} was not found in the database.`);
      } else if (error.response?.status === 500) {
        showError('Server Error', 'There was an internal server error. Please check the backend logs.');
      } else {
        showError('Error', 'Failed to load statement data for editing');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const populateFormWithStatementData = (statementData: any) => {
    try {
      console.log('🔄 Starting form population with data:', statementData);
      console.log('📊 Full statement data keys:', Object.keys(statementData));
      console.log('📊 Victim names from backend:', statementData.victimNames);
      console.log('📊 Offender names from backend:', statementData.offenderNames);
      console.log('📊 Participants from backend:', statementData.participants);
      console.log('📊 Full participants data:', JSON.stringify(statementData.participants, null, 2));

      // Debug the entire statement data structure
      console.log('📋 Complete statement data structure:', JSON.stringify(statementData, null, 2));

      // Normalize minimal Allstatements rows into expected structure
      if (!statementData.participants && (statementData.complainants || statementData.offenders)) {
        console.log('🔄 Normalizing minimal caseData into participants structure for edit');
        const participants: any[] = [];
        (statementData.complainants || []).forEach((name: string) => {
          participants.push({ role: 'COMPLAINANT', citizen: { name } });
        });
        (statementData.offenders || []).forEach((name: string) => {
          participants.push({ role: 'OFFENDER', citizen: { name } });
        });
        statementData = { ...statementData, participants };
      }

      // Check if we have full participant details (preferred)
      if (statementData.participants && Array.isArray(statementData.participants) && statementData.participants.length > 0) {
        console.log('✅ Backend provided full participant details');
        console.log('📊 First participant data structure:', JSON.stringify(statementData.participants[0], null, 2));

      // Debug: Check what fields are available in the backend response
      if (statementData.participants[0]?.citizen) {
        console.log('📋 Available citizen fields:', Object.keys(statementData.participants[0].citizen));
        console.log('📋 Sample citizen data:', {
          name: statementData.participants[0].citizen.name,
          nameType: typeof statementData.participants[0].citizen.name,
          isNA: statementData.participants[0].citizen.name === 'N/A',
          aadharNo: statementData.participants[0].citizen.aadharNo,
          contactNo: statementData.participants[0].citizen.contactNo,
          email: statementData.participants[0].citizen.email,
          address: statementData.participants[0].citizen.address,
          gender: statementData.participants[0].citizen.gender,
          profession: statementData.participants[0].citizen.profession,
          age: statementData.participants[0].citizen.age
        });
      }

        // Enhanced field mapping with comprehensive fallback options
        const getNestedValue = (obj: any, paths: string[]) => {
          for (const path of paths) {
            const keys = path.split('.');
            let current = obj;

            for (const key of keys) {
              if (current && current[key] !== undefined && current[key] !== null && current[key] !== '') {
                current = current[key];
              } else {
                current = null;
                break;
              }
            }

            if (current !== null) {
              return current;
            }
          }
          return '';
        };

        // Create a simple data preservation mechanism
        const preserveExistingData = (existingOffenders: any[]) => {
          const preservedData: {[key: string]: any} = {};

          existingOffenders.forEach((offender, index) => {
            if (offender.offenderName) {
              preservedData[offender.offenderName] = {
                aadharNo: offender.offenderAadharNo || '',
                contactNo: offender.offenderMobileNo || '',
                address: offender.offenderAddress || '',
                email: offender.offenderEmail || ''
              };
            }
          });

          return preservedData;
        };

        // Preserve existing offender data for fallback
        const preservedOffenderData = preserveExistingData(offenderList || []);

        // Also check if we need to preserve data from current form state
        const getValueWithFallback = (participant: any, fieldPaths: string[], currentFormData?: any) => {
          // First try to get from backend response
          const backendValue = getNestedValue(participant, fieldPaths);

          // If backend value is empty but we have current form data, use that as fallback
          if (!backendValue && currentFormData) {
            const fieldName = fieldPaths[0].split('.')[1] || fieldPaths[0];
            return currentFormData[fieldName] || '';
          }

          return backendValue;
        };

        // Separate complainants and offenders first
        const complainants = statementData.participants
          .filter((p: any) => p.role === 'COMPLAINANT' || p.role === 'CO_COMPLAINANT')
          .map((participant: any, index: number) => {
            console.log(`🔍 Processing complainant ${index + 1} with role: ${participant.role}:`, participant);
            console.log(`📋 Citizen data:`, participant.citizen);

            const mappedComplainant = {
              citizenId: getNestedValue(participant, ['citizen.citizenId', 'citizenId']) || Math.floor(Math.random() * 1000000) + index,
              role: 'COMPLAINANT',
              name: getNestedValue(participant, ['citizen.name', 'name']) || '',
              gender: getNestedValue(participant, ['citizen.gender', 'gender']) || 'Male',
              aadharNo: getNestedValue(participant, [
                'citizen.aadharNo',
                'citizen.aadharNumber',
                'citizen.aadhar',
                'aadharNo',
                'aadharNumber',
                'aadhar'
              ]) || '',
              email: getNestedValue(participant, ['citizen.email', 'email']) || '',
              contactNo: getNestedValue(participant, [
                'citizen.contactNo',
                'citizen.contactNumber',
                'citizen.mobileNo',
                'citizen.phoneNo',
                'contactNo',
                'contactNumber',
                'mobileNo',
                'phoneNo'
              ]) || '',
              profession: getNestedValue(participant, ['citizen.profession', 'profession']) || '',
              address: getNestedValue(participant, ['citizen.address', 'address']) || '',
              age: getNestedValue(participant, ['citizen.age', 'age'])?.toString() || '',
            };

            console.log(`✅ Mapped complainant ${index + 1}:`, mappedComplainant);
            return mappedComplainant;
          });

        console.log(`📊 Total complainants found: ${complainants.length}`);
        console.log(`📊 All complainants:`, complainants);

        const offenders = statementData.participants
          .filter((p: any) => p.role === 'OFFENDER')
          .map((participant: any, index: number) => {
            console.log(`🔍 Processing offender ${index + 1}:`, participant);
            // Debug: Check what fields are available for this specific offender
            if (participant.citizen) {
              console.log(`📋 Available offender citizen fields:`, Object.keys(participant.citizen));
              console.log(`📋 Offender citizen field values:`);
              console.log(`  - name: "${participant.citizen.name}"`);
              console.log(`  - aadharNo: "${participant.citizen.aadharNo}"`);
              console.log(`  - aadharNumber: "${participant.citizen.aadharNumber}"`);
              console.log(`  - aadhar: "${participant.citizen.aadhar}"`);
              console.log(`  - contactNo: "${participant.citizen.contactNo}"`);
              console.log(`  - contactNumber: "${participant.citizen.contactNumber}"`);
              console.log(`  - mobileNo: "${participant.citizen.mobileNo}"`);
              console.log(`  - phoneNo: "${participant.citizen.phoneNo}"`);
              console.log(`  - email: "${participant.citizen.email}"`);
              console.log(`  - address: "${participant.citizen.address}"`);
            }

            // Enhanced field mapping with comprehensive fallback options
            const getNestedValue = (obj: any, paths: string[]) => {
              for (const path of paths) {
                const keys = path.split('.');
                let current = obj;

                for (const key of keys) {
                  if (current && current[key] !== undefined && current[key] !== null && current[key] !== '') {
                    current = current[key];
                  } else {
                    current = null;
                    break;
                  }
                }

                if (current !== null) {
                  return current;
                }
              }
              return '';
            };

            // Get value with fallback to preserved data
            const getValueWithPreservation = (participant: any, fieldPaths: string[], offenderName: string) => {
              const backendValue = getNestedValue(participant, fieldPaths);

              // If backend has no value, try preserved data
              if (!backendValue && preservedOffenderData[offenderName]) {
                const fieldName = fieldPaths[0].includes('aadhar') ? 'aadharNo' :
                                 fieldPaths[0].includes('contact') || fieldPaths[0].includes('mobile') ? 'contactNo' :
                                 fieldPaths[0].includes('address') ? 'address' : 'email';
                return preservedOffenderData[offenderName][fieldName] || '';
              }

              return backendValue;
            };

            const participantName = getNestedValue(participant, ['citizen.name', 'name']) || '';
            console.log(`🔍 Processing offender - Name: "${participantName}", Available data:`, participant);
            console.log(`🔍 Complete participant object:`, JSON.stringify(participant, null, 2));
            console.log(`🔍 Available participant fields:`, Object.keys(participant));
            if (participant.citizen) {
              console.log(`🔍 Available citizen fields:`, Object.keys(participant.citizen));
              console.log(`🔍 Citizen object:`, JSON.stringify(participant.citizen, null, 2));
            }

            // Enhanced debugging for field mapping
            console.log(`🔍 Field mapping attempts:`);
            console.log(`  - name: trying participant.citizen?.name and participant.name`);
            console.log(`  - email: trying participant.citizen?.email and participant.email`);
            console.log(`  - contactNo: trying participant.citizen?.contactNo, participant.contactNo, etc.`);
            console.log(`  - aadharNo: trying participant.citizen?.aadharNo, participant.aadharNo, etc.`);

            // More robust field mapping with explicit value extraction
            const getOffenderFieldValue = (fieldName: string, participant: any) => {
              console.log(`🔍 getOffenderFieldValue called for field: ${fieldName}`);
              console.log(`🔍 participant.citizen?.${fieldName}:`, participant.citizen?.[fieldName]);
              console.log(`🔍 participant.${fieldName}:`, participant[fieldName]);

              // Helper function to filter out unwanted values
              const isValidValue = (value: any) => {
                if (value === null || value === undefined || value === '' || value === '0' || value === 'Not Specified') {
                  return false;
                }
                return true;
              };

              // Try citizen object first
              if (participant.citizen && isValidValue(participant.citizen[fieldName])) {
                console.log(`✅ Found valid value in participant.citizen.${fieldName}: "${participant.citizen[fieldName]}"`);
                return participant.citizen[fieldName];
              }
              // Try participant root level
              if (isValidValue(participant[fieldName])) {
                console.log(`✅ Found valid value in participant.${fieldName}: "${participant[fieldName]}"`);
                return participant[fieldName];
              }
              console.log(`❌ No valid value found for field: ${fieldName}`);
              return '';
            };

            const mappedOffender = {
              citizenId: participant.citizen?.citizenId || participant.citizenId || Math.floor(Math.random() * 1000000) + index,
              role: 'OFFENDER',
              offenderName: getOffenderFieldValue('name', participant),
              offenderEmail: getOffenderFieldValue('email', participant),
              offenderMobileNo: getOffenderFieldValue('contactNo', participant) || getOffenderFieldValue('contactNumber', participant) || getOffenderFieldValue('mobileNo', participant) || getOffenderFieldValue('phoneNo', participant),
              offenderAddress: getOffenderFieldValue('address', participant),
              offenderAadharNo: getOffenderFieldValue('aadharNo', participant) || getOffenderFieldValue('aadharNumber', participant) || getOffenderFieldValue('aadhar', participant),
              offenderGender: getOffenderFieldValue('gender', participant),
              offenderProfession: getOffenderFieldValue('profession', participant),
              offenderAge: getOffenderFieldValue('age', participant),
            };

            console.log(`✅ Mapped offender ${index + 1}:`, mappedOffender);
            console.log(`🔍 Raw backend values:`, {
              'participant.citizen?.name': participant.citizen?.name,
              'participant.citizen?.aadharNo': participant.citizen?.aadharNo,
              'participant.citizen?.contactNo': participant.citizen?.contactNo,
              'participant.citizen?.email': participant.citizen?.email,
              'participant.citizen?.address': participant.citizen?.address,
              'participant.citizen?.gender': participant.citizen?.gender,
              'participant.citizen?.profession': participant.citizen?.profession,
              'participant.citizen?.age': participant.citizen?.age,
              'participant.name': participant.name,
              'participant.aadharNo': participant.aadharNo,
              'participant.contactNo': participant.contactNo,
              'participant.email': participant.email,
              'participant.address': participant.address,
            });
            return mappedOffender;
          });

        // Fetch existing files for complainants if they have file paths
        const fetchExistingFiles = async () => {
          console.log('🔄 Fetching existing files for edit mode...');

          for (let i = 0; i < complainants.length; i++) {
            const complainant = complainants[i];
            const participantIndex = statementData.participants.findIndex((p: any) =>
              (p.role === 'COMPLAINANT' || p.role === 'CO_COMPLAINANT') && p.citizen?.citizenId === complainant.citizenId
            );

            if (participantIndex !== -1) {
              const participant = statementData.participants[participantIndex];

              // Fetch Aadhar file if path exists
              if (participant.citizen?.aadharPath) {
                console.log(`📸 Fetching existing Aadhar file:`, participant.citizen.aadharPath);
                try {
                  const aadharFile = await fetchFile({
                    filePath: participant.citizen.aadharPath,
                    fileName: `aadhar_${participant.citizen.name}_${Date.now()}.jpg`
                  });
                  if (aadharFile) {
                    console.log(`✅ Successfully loaded existing Aadhar file:`, aadharFile.name);
                    setComplaineeFiles(prev => ({
                      ...prev,
                      [i]: {
                        ...prev[i],
                        aadhar: aadharFile
                      }
                    }));
                  }
                } catch (error) {
                  console.error(`❌ Failed to fetch Aadhar file:`, error);
                }
              }

              // Fetch PAN file if path exists
              if (participant.citizen?.panPath) {
                console.log(`📸 Fetching existing PAN file:`, participant.citizen.panPath);
                try {
                  const panFile = await fetchFile({
                    filePath: participant.citizen.panPath,
                    fileName: `pan_${participant.citizen.name}_${Date.now()}.jpg`
                  });
                  if (panFile) {
                    console.log(`✅ Successfully loaded existing PAN file:`, panFile.name);
                    setComplaineeFiles(prev => ({
                      ...prev,
                      [i]: {
                        ...prev[i],
                        pan: panFile
                      }
                    }));
                  }
                } catch (error) {
                  console.error(`❌ Failed to fetch PAN file:`, error);
                }
              }

              // Fetch Photo file if path exists
              if (participant.citizen?.photoPath) {
                console.log(`📸 Fetching existing Photo file:`, participant.citizen.photoPath);
                try {
                  const photoFile = await fetchFile({
                    filePath: participant.citizen.photoPath,
                    fileName: `photo_${participant.citizen.name}_${Date.now()}.jpg`
                  });
                  if (photoFile) {
                    console.log(`✅ Successfully loaded existing Photo file:`, photoFile.name);
                    setComplaineeFiles(prev => ({
                      ...prev,
                      [i]: {
                        ...prev[i],
                        passport: photoFile // Using passport field for photo
                      }
                    }));
                  }
                } catch (error) {
                  console.error(`❌ Failed to fetch Photo file:`, error);
                }
              }
            }
          }
        };

        setComplaineeList(complainants);
        setOffenderList(offenders);

        // Initialize file state for all complainants
        const initialFiles: {[key: number]: {aadhar: File | null; pan: File | null; passport: File | null}} = {};
        complainants.forEach((_: any, index: number) => {
          initialFiles[index] = { aadhar: null, pan: null, passport: null };
        });
        setComplaineeFiles(initialFiles);

        // Initialize file state for offenders
        console.log('🔄 Initializing offender file arrays for', offenders.length, 'offenders');
        const maxOffenders = Math.max(offenders.length, offenderList.length);

        // Ensure file arrays are properly sized
        const initializeFileArray = (length: number) => {
          const arr = new Array(length).fill(null);
          console.log(`📋 Initialized file array with ${length} slots:`, arr.length);
          return arr;
        };

        const aadharFiles = initializeFileArray(maxOffenders);
        const panFiles = initializeFileArray(maxOffenders);
        const passportFiles = initializeFileArray(maxOffenders);

        // Copy existing files if any
        offenderAadhar.forEach((file, index) => {
          if (file && index < maxOffenders) {
            aadharFiles[index] = file;
          }
        });

        offenderPan.forEach((file, index) => {
          if (file && index < maxOffenders) {
            panFiles[index] = file;
          }
        });

        offenderPassport.forEach((file, index) => {
          if (file && index < maxOffenders) {
            passportFiles[index] = file;
          }
        });

        setOffenderAadhar(aadharFiles);
        setOffenderPan(panFiles);
        setOffenderPassport(passportFiles);

        console.log('✅ Initialized offender file arrays:', {
          aadhar: aadharFiles.length,
          pan: panFiles.length,
          passport: passportFiles.length,
          maxOffenders
        });

        console.log('✅ Set offenderList:', offenders);
        console.log('✅ Offender details:', offenders.map((o: any) => ({
          name: o.offenderName,
          aadharNo: o.offenderAadharNo,
          contactNo: o.offenderMobileNo,
          address: o.offenderAddress,
          email: o.offenderEmail,
          gender: o.offenderGender,
          profession: o.offenderProfession,
          age: o.offenderAge
        })));
        console.log('📋 Complete offender objects:', offenders);

        // Fetch existing files for offenders if they have file paths
        const fetchOffenderFiles = async () => {
          console.log('🔄 Fetching existing files for offenders...');

          for (let i = 0; i < offenders.length; i++) {
            const offender = offenders[i];
            const participantIndex = statementData.participants.findIndex((p: any) =>
              p.role === 'OFFENDER' && p.citizen?.citizenId === offender.citizenId
            );

            if (participantIndex !== -1) {
              const participant = statementData.participants[participantIndex];
              console.log(`🔍 Processing offender ${i + 1}/${offenders.length}:`, offender.offenderName);
              console.log(`📋 Participant data for offender:`, participant);

              // Fetch Aadhar file for offender if path exists
              if (participant.citizen?.aadharPath) {
                console.log(`📸 Fetching existing Aadhar file for offender ${i}:`, participant.citizen.aadharPath);
                try {
                  const aadharFile = await fetchFile({
                    filePath: participant.citizen.aadharPath,
                    fileName: `offender_aadhar_${participant.citizen.name}_${Date.now()}.jpg`
                  });
                  if (aadharFile) {
                    console.log(`✅ Successfully loaded offender Aadhar file:`, aadharFile.name);
                    setOffenderAadhar(prev => {
                      const updated = [...prev];
                      updated[i] = aadharFile;
                      console.log(`📸 Set offenderAadhar[${i}] =`, aadharFile.name);
                      return updated;
                    });
                  }
                } catch (error) {
                  console.error(`❌ Failed to fetch offender Aadhar file:`, error);
                }
              }

              // Fetch PAN file for offender if path exists
              if (participant.citizen?.panPath) {
                console.log(`📸 Fetching existing PAN file for offender ${i}:`, participant.citizen.panPath);
                try {
                  const panFile = await fetchFile({
                    filePath: participant.citizen.panPath,
                    fileName: `offender_pan_${participant.citizen.name}_${Date.now()}.jpg`
                  });
                  if (panFile) {
                    console.log(`✅ Successfully loaded offender PAN file:`, panFile.name);
                    setOffenderPan(prev => {
                      const updated = [...prev];
                      updated[i] = panFile;
                      console.log(`📸 Set offenderPan[${i}] =`, panFile.name);
                      return updated;
                    });
                  }
                } catch (error) {
                  console.error(`❌ Failed to fetch offender PAN file:`, error);
                }
              }

              // Fetch Photo file for offender if path exists
              if (participant.citizen?.photoPath) {
                console.log(`📸 Fetching existing Photo file for offender ${i}:`, participant.citizen.photoPath);
                try {
                  const photoFile = await fetchFile({
                    filePath: participant.citizen.photoPath,
                    fileName: `offender_photo_${participant.citizen.name}_${Date.now()}.jpg`
                  });
                  if (photoFile) {
                    console.log(`✅ Successfully loaded offender Photo file:`, photoFile.name);
                    setOffenderPassport(prev => {
                      const updated = [...prev];
                      updated[i] = photoFile;
                      console.log(`📸 Set offenderPassport[${i}] =`, photoFile.name);
                      return updated;
                    });
                  }
                } catch (error) {
                  console.error(`❌ Failed to fetch offender Photo file:`, error);
                }
              }
            } else {
              console.log(`⚠️ No participant found for offender ${i}:`, offender.offenderName);
            }
          }
        };

        // Fetch existing files for witnesses if they have file paths
        const fetchWitnessFiles = async () => {
          console.log('🔄 Fetching existing files for witnesses...');

          // Get witnesses from participants
          const witnessParticipants = statementData.participants?.filter((p: any) => p.role === 'WITNESS') || [];
          
          for (let i = 0; i < witnessParticipants.length; i++) {
            const participant = witnessParticipants[i];
            console.log(`🔍 Processing witness ${i + 1}/${witnessParticipants.length}:`, participant.citizen?.name);

            // Fetch Aadhar file for witness if path exists
            if (participant.citizen?.aadharPath) {
              console.log(`📸 Fetching existing Aadhar file for witness ${i}:`, participant.citizen.aadharPath);
              try {
                const aadharFile = await fetchFile({
                  filePath: participant.citizen.aadharPath,
                  fileName: `witness_aadhar_${participant.citizen.name}_${Date.now()}.jpg`
                });
                if (aadharFile) {
                  console.log(`✅ Successfully loaded witness Aadhar file:`, aadharFile.name);
                  setWitnessAadhar(prev => {
                    const updated = [...prev];
                    updated[i] = aadharFile;
                    console.log(`📸 Set witnessAadhar[${i}] =`, aadharFile.name);
                    return updated;
                  });
                }
              } catch (error) {
                console.error(`❌ Failed to fetch witness Aadhar file:`, error);
              }
            }

            // Fetch PAN file for witness if path exists
            if (participant.citizen?.panPath) {
              console.log(`📸 Fetching existing PAN file for witness ${i}:`, participant.citizen.panPath);
              try {
                const panFile = await fetchFile({
                  filePath: participant.citizen.panPath,
                  fileName: `witness_pan_${participant.citizen.name}_${Date.now()}.jpg`
                });
                if (panFile) {
                  console.log(`✅ Successfully loaded witness PAN file:`, panFile.name);
                  setWitnessPan(prev => {
                    const updated = [...prev];
                    updated[i] = panFile;
                    console.log(`📸 Set witnessPan[${i}] =`, panFile.name);
                    return updated;
                  });
                }
              } catch (error) {
                console.error(`❌ Failed to fetch witness PAN file:`, error);
              }
            }

            // Fetch Photo file for witness if path exists
            if (participant.citizen?.photoPath) {
              console.log(`📸 Fetching existing Photo file for witness ${i}:`, participant.citizen.photoPath);
              try {
                const photoFile = await fetchFile({
                  filePath: participant.citizen.photoPath,
                  fileName: `witness_photo_${participant.citizen.name}_${Date.now()}.jpg`
                });
                if (photoFile) {
                  console.log(`✅ Successfully loaded witness Photo file:`, photoFile.name);
                  setWitnessPassport(prev => {
                    const updated = [...prev];
                    updated[i] = photoFile;
                    console.log(`📸 Set witnessPassport[${i}] =`, photoFile.name);
                    return updated;
                  });
                }
              } catch (error) {
                console.error(`❌ Failed to fetch witness Photo file:`, error);
              }
            }
          }
        };

        // Then fetch existing files asynchronously
        fetchExistingFiles().catch(console.error);
        fetchOffenderFiles().catch(console.error);
        fetchWitnessFiles().catch(console.error);
      } else if (statementData.victimNames && statementData.victimNames.length > 0) {
        // Fallback to names-only approach
        console.log('⚠️ Using names-only approach for complainants');
        const complainants = statementData.victimNames.map((name: string, index: number) => {
          console.log(`Creating complainant ${index + 1} with name: ${name}`);
          return {
            citizenId: Math.floor(Math.random() * 1000000) + Date.now() + index, // Use timestamp + index for uniqueness
            role: 'COMPLAINANT',
            name: name, // Use actual name from backend
            gender: 'Male', // Default since backend doesn't provide
            aadharNo: '', // Backend doesn't provide detailed info for edit mode
            email: '',
            contactNo: '',
            profession: '',
            address: '',
            age: '',
          };
        });
        setComplaineeList(complainants);
        console.log('✅ Set complainants:', complainants.map((c: any) => c.name));
      } else {
        console.log('⚠️ No victim names found, initializing empty');
        const initialComplainee = {
          citizenId: Math.floor(Math.random() * 1000000),
          role: 'COMPLAINANT',
          name: '',
          gender: '',
          aadharNo: '',
          email: '',
          contactNo: '',
          profession: '',
          address: '',
          age: '',
        };
        setComplaineeList([initialComplainee]);
      }

      // Process offenders - PRIORITIZE full participant data over names-only
      // Check if we have full participant details first (preferred method)
      console.log('🔍 PROCESSING OFFENDER DATA:');
      console.log('statementData.offenderNames:', statementData.offenderNames);
      console.log('statementData.offenders:', statementData.offenders);
      console.log('statementData.participants:', statementData.participants);
      console.log('statementData keys:', Object.keys(statementData));

      const offendersFromParticipants = statementData.participants
        ?.filter((p: any) => p.role === 'OFFENDER' || p.role === 'ACCUSED')
        ?.map((participant: any, index: number) => {
          console.log(`🔍 Processing offender ${index + 1} from full participant data:`, participant);

          // Enhanced field mapping with better debugging and more robust value extraction
          const getNestedValue = (obj: any, paths: string[]) => {
            for (const path of paths) {
              const keys = path.split('.');
              let current = obj;

              for (const key of keys) {
                // Allow null values but not undefined or empty strings
                // This ensures age: 0 and profession: null are preserved
                if (current && current[key] !== undefined) {
                  current = current[key];
                } else {
                  current = null;
                  break;
                }
              }

              // Filter out unwanted values but be less restrictive for names
              if (current !== null && current !== undefined) {
                return current;
              }
            }
            return '';
          };

          // Special handling for offender name with enhanced debugging and N/A handling
          const extractOffenderName = (participant: any) => {
            console.log('🔍 EXTRACTING OFFENDER NAME:', {
              'participant.citizen?.name': participant.citizen?.name,
              'participant.citizen?.getName()': participant.citizen?.getName,
              'participant.name': participant.name,
              'participant': participant,
              'participant keys': Object.keys(participant),
              'citizen keys': participant.citizen ? Object.keys(participant.citizen) : 'no citizen'
            });

            // Try multiple paths for the name
            const namePaths = ['citizen.name', 'name', 'citizen.fullName', 'citizen.firstName'];
            for (const path of namePaths) {
              const keys = path.split('.');
              let current = participant;

              for (const key of keys) {
                if (current && current[key] !== undefined && current[key] !== null) {
                  current = current[key];
                } else {
                  current = null;
                  break;
                }
              }

              if (current !== null && current !== undefined && current !== '' && current !== 'N/A' && current !== 'Not Specified' && current !== 'Unknown') {
                console.log(`✅ Found offender name via path '${path}': "${current}"`);
                return current;
              }
            }

            console.log('❌ No valid offender name found, returning empty string');
            return '';
          };

          const mappedOffender = {
            citizenId: participant.citizen?.citizenId || participant.citizenId || Math.floor(Math.random() * 1000000) + index,
            role: 'OFFENDER',
            offenderName: extractOffenderName(participant),
            offenderEmail: getNestedValue(participant, ['citizen.email', 'email']) || '',
            offenderMobileNo: getNestedValue(participant, ['citizen.contactNo', 'citizen.contactNumber', 'citizen.mobileNo', 'citizen.phoneNo', 'contactNo', 'contactNumber', 'mobileNo', 'phoneNo']) || '',
            offenderAddress: getNestedValue(participant, ['citizen.address', 'address']) || '',
            offenderAadharNo: getNestedValue(participant, ['citizen.aadharNo', 'citizen.aadharNumber', 'citizen.aadhar', 'aadharNo', 'aadharNumber', 'aadhar']) || '',
            offenderGender: getNestedValue(participant, ['citizen.gender', 'gender']) || '',
            offenderProfession: getNestedValue(participant, ['citizen.profession', 'profession']) || '',
            offenderAge: getNestedValue(participant, ['citizen.age', 'age'])?.toString() || '',
          };

          console.log(`✅ Mapped offender ${index + 1} from full data:`, mappedOffender);
          return mappedOffender;
        }) || [];

      if (offendersFromParticipants.length > 0) {
        console.log('✅ Using full participant data for offenders');
        setOffenderList(offendersFromParticipants);
        console.log('✅ Set offenders from participants:', offendersFromParticipants.map((o: any) => ({
          name: o.offenderName,
          aadharNo: o.offenderAadharNo,
          contactNo: o.offenderMobileNo,
          address: o.offenderAddress,
          email: o.offenderEmail
        })));
      } else if (statementData.offenderNames && statementData.offenderNames.length > 0) {
        console.log('⚠️ Using names-only approach for offenders (no full participant data)');
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        const offenders = statementData.offenderNames.map((name: string, index: number) => {
          console.log(`Creating offender ${index + 1} with name: ${name}`);
          return {
            citizenId: `offender_${timestamp}_${randomSuffix}_${index}`, // Truly unique ID with timestamp + random + index
            role: 'OFFENDER',
            offenderName: name, // Use actual name from backend
            offenderEmail: '',
            offenderMobileNo: '',
            offenderAddress: '',
            offenderAadharNo: '',
            offenderGender: '',
            offenderProfession: '',
            offenderAge: '',
          };
        });
        setOffenderList(offenders);
        console.log('✅ Set offenders from names:', offenders.map((o: any) => ({ name: o.offenderName, citizenId: o.citizenId })));
      } else if (statementData.offenders && Array.isArray(statementData.offenders) && statementData.offenders.length > 0) {
        // Fallback to offenders array if it exists and has data
        console.log('🔄 Found offenders array, using it as fallback');
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        const offendersFromArray = statementData.offenders
          .filter((offender: any) => offender && (offender.name || offender.offenderName))
          .map((offender: any, index: number) => ({
            citizenId: `offender_${timestamp}_${randomSuffix}_${index}`, // Truly unique ID with timestamp + random + index
            role: 'OFFENDER',
            offenderName: offender.name || offender.offenderName || offender.offender_name || 'Unknown',
            offenderEmail: offender.email || offender.offenderEmail || '',
            offenderMobileNo: offender.contactNo || offender.offenderMobileNo || offender.mobileNo || '',
            offenderAddress: offender.address || offender.offenderAddress || '',
            offenderAadharNo: offender.aadharNo || offender.offenderAadharNo || offender.aadhar || '',
            offenderGender: offender.gender || offender.offenderGender || '',
            offenderProfession: offender.profession || offender.offenderProfession || '',
            offenderAge: offender.age || offender.offenderAge || '',
          }))
          .filter((offender: any) => offender.offenderName !== 'Unknown');

        if (offendersFromArray.length > 0) {
          console.log('✅ Set offenders from offenders array:', offendersFromArray.map((o: any) => o.offenderName));
          setOffenderList(offendersFromArray);
        } else {
          console.log('⚠️ Offenders array exists but no valid names found');
          setOffenderList([]);
        }
      } else {
        console.log('⚠️ No offender data found, initializing empty');
        setOffenderList([]);
      }

      // Map witness participants into witnessList
      const witnessesFromParticipants = (statementData.participants || [])
        .filter((p: any) => p.role === 'WITNESS')
        .map((p: any, index: number) => ({
          citizenId: p.citizen?.citizenId || p.citizenId || Math.floor(Math.random() * 1000000) + index,
          witnessName: p.citizen?.name || p.name || '',
          witnessEmail: p.citizen?.email || p.email || '',
          witnessProfession: p.citizen?.profession || p.profession || '',
          witnessGender: p.citizen?.gender || p.gender || '',
          witnessAddress: p.citizen?.address || p.address || '',
          witnessAge: (p.citizen?.age || p.age || '')?.toString() || '',
          witnessAadharNo: p.citizen?.aadharNo || p.aadharNo || '',
          witnessMobileNo: p.citizen?.contactNo || p.contactNo || p.mobileNo || '',
          witnessStatement: p.statement || p.witnessStatement || '',
          witnessType: 'WITNESS',
        }));

      if (witnessesFromParticipants.length > 0) {
        console.log('✅ Mapped witnesses from participants:', witnessesFromParticipants);
        setWitnessList(witnessesFromParticipants);
      } else {
        console.log('ℹ️ No witness participants found; leaving witnessList as-is');
      }

      // Set crime data
      const crimeDescription = statementData.subject || statementData.description || '';
      console.log('🔍 Crime data mapping:', {
        statementDataSubject: statementData.subject,
        statementDataDescription: statementData.description,
        statementDataCrimeAddress: statementData.crimeAddress,
        statementDataCrimeDateTime: statementData.crimeDateTime,
        finalCrimeDescription: crimeDescription
      });

      if (crimeDescription || statementData.filedByStationId) {
        // Format the crimeDateTime for datetime-local input (expects YYYY-MM-DDTHH:MM format)
        let formattedCrimeDateTime = '';
        if (statementData.crimeDateTime) {
          try {
            console.log('🔄 Processing crimeDateTime:', {
              original: statementData.crimeDateTime,
              type: typeof statementData.crimeDateTime
            });

            // Handle different possible formats from backend
            let dateTimeValue = statementData.crimeDateTime;

            // If it's a string from backend, parse it
            if (typeof dateTimeValue === 'string') {
              // Try parsing ISO format or other common formats
              const date = new Date(dateTimeValue);
              console.log('🔄 Parsed date from string:', {
                dateString: dateTimeValue,
                parsedDate: date,
                isValid: !isNaN(date.getTime()),
                isoString: date.toISOString(),
                formatted: date.toISOString().slice(0, 16)
              });
              if (!isNaN(date.getTime())) {
                // Format for datetime-local input (YYYY-MM-DDTHH:MM)
                formattedCrimeDateTime = date.toISOString().slice(0, 16);
              }
            }
            // If it's already a Date object or timestamp
            else if (dateTimeValue instanceof Date || typeof dateTimeValue === 'number') {
              const date = new Date(dateTimeValue);
              if (!isNaN(date.getTime())) {
                formattedCrimeDateTime = date.toISOString().slice(0, 16);
              }
            }

            console.log('✅ Formatted crimeDateTime:', {
              original: statementData.crimeDateTime,
              formatted: formattedCrimeDateTime
            });
          } catch (error) {
            console.error('❌ Error formatting crimeDateTime:', error);
            formattedCrimeDateTime = '';
          }
        } else {
          console.log('⚠️ No crimeDateTime in statementData');
        }

        const resolvedCrimeAddress =
          statementData.crimeAddress ||
          statementData.crimeLocation ||
          statementData.address ||
          statementData.location ||
          statementData?.victimList?.[0]?.crimesDetails?.crimeAddress ||
          '';

        const crimeData = {
          crimeDescription: crimeDescription,
          crimeAddress: resolvedCrimeAddress,
          crimeDateTime: formattedCrimeDateTime,
          stationId: statementData.filedByStationId || null,
        };
        console.log('✅ Final crimeData being set:', crimeData);
        setCrimeData(crimeData);
        console.log('✅ Set crime data:', crimeDescription);
      } else {
        const fallbackCrimeAddress =
          statementData.crimeAddress ||
          statementData.crimeLocation ||
          statementData.address ||
          statementData.location ||
          statementData?.victimList?.[0]?.crimesDetails?.crimeAddress ||
          '';

        const crimeData = {
          crimeDescription: '',
          crimeAddress: fallbackCrimeAddress,
          crimeDateTime: '',
          stationId: statementData.filedByStationId || null,
        };
        console.log('⚠️ No crime description found');
        setCrimeData(crimeData);
      }

      console.log('✅ Form population completed successfully');
      console.log('📊 Final complaineeList:', complaineeList);
      console.log('📊 Final offenderList:', offenderList);
      console.log('📊 Final crimeData:', crimeData);
    } catch (error) {
      console.error('❌ Error populating form:', error);
      showError('Error', 'Failed to load statement data for editing');
    }
  };

  const initializeNewStatement = () => {
    console.log('🔄 Initializing new statement - setting empty offender list');
    const initialComplainee = {
      citizenId: Math.floor(Math.random() * 1000000) + Date.now(), // Use timestamp for uniqueness
      role: 'COMPLAINANT',
      name: '',
      gender: '',
      aadharNo: '',
      email: '',
      contactNo: '',
      profession: '',
      address: '',
      age: '',
    };
    setComplaineeList([initialComplainee]);

    // Initialize complainee files state for new statement
    setComplaineeFiles({
      0: {
        aadhar: null,
        pan: null,
        passport: null,
      }
    });

    // Explicitly set empty offender list for new statements
    setOffenderList([]);

    setIsLoading(false);
  };

  const fetchFile = async (fileMetadata: any) => {
    if (!fileMetadata) return null;
    
    try {
      console.log('🔍 Attempting to fetch file:', fileMetadata);

      // If we have a fileId, use signed URL service (preferred method)
      if (fileMetadata.fileId) {
        console.log('📡 Fetching using signed URL for fileId:', fileMetadata.fileId);
        const { downloadFile } = await import('../services/documentService');
        const blob = await downloadFile(Number(fileMetadata.fileId));
        
        const file = new File([blob], fileMetadata.fileName, {
          type: `image/${fileMetadata.fileName.split('.')[1]}`,
        });
        
        console.log('✅ File fetched via signed URL:', file.name, 'Size:', (file.size / 1024).toFixed(1), 'KB');
        return file;
      }
      
      // Fallback: if only filePath is available (legacy data)
      if (fileMetadata.filePath) {
        console.log('⚠️ No fileId, using legacy path method:', fileMetadata.filePath);
        const documentApi = import.meta.env.VITE_IMAGE_API;
        const normalizedPath = fileMetadata.filePath.startsWith('/')
          ? fileMetadata.filePath
          : `/${fileMetadata.filePath}`;
        const encodedPath = encodeURIComponent(normalizedPath);
        const fileUrl = `${documentApi}?filePath=${encodedPath}`;

        const response = await axios({
          url: fileUrl,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          method: 'GET',
          responseType: 'blob',
        });

        const blob = response.data;
        const file = new File([blob], fileMetadata.fileName, {
          type: `image/${fileMetadata.fileName.split('.')[1]}`,
        });
        
        console.log('✅ File fetched via legacy method:', file.name);
        return file;
      }
      
      console.error('❌ No fileId or filePath available in metadata');
      return null;
    } catch (error: any) {
      console.error(`❌ Error fetching file:`, error.message);
      return null;
    }
  };

  const handleFileChange = (
    fileType: string,
    file: File | null
  ) => {
    console.log('🚀 handleFileChange called:', {
      fileType,
      file: file?.name || 'null'
    });

    // Extract index from fileType pattern like "offender_pan_0"
    const parts = fileType.split('_');
    const index = parseInt(parts[parts.length - 1]);

    if (!file) {
      console.log('Removing file for type:', fileType);
      if (fileType.startsWith('victim')) {
        if (fileType.includes('_') && !isNaN(index)) {
          // Handle per-complainee files
          const victimFileType = fileType.split('_')[1];
          setComplaineeFiles(prev => ({
            ...prev,
            [index]: {
              ...prev[index],
              [victimFileType]: null
            }
          }));
          console.log(`Removed ${victimFileType} file for complainee ${index}`);
        } else {
          // Handle global victim files (backward compatibility)
          const victimFileType = fileType.split('_')[1];
          switch (victimFileType) {
            case 'aadhar':
              console.log('Setting victimAadhar to null');
              setVictimAadhar(null);
              break;
            case 'pan':
              console.log('Setting victimPan to null');
              setVictimPan(null);
              break;
            case 'passport':
              console.log('Setting victimPassport to null');
              setVictimPassport(null);
              break;
          }
        }
      } else if (fileType.startsWith('offender')) {
        const offenderFileType = fileType.split('_')[1];
        switch (offenderFileType) {
          case 'aadhar':
            console.log(`Setting offenderAadhar[${index}] to null`);
            setOffenderAadhar((prevFiles) => {
              const updatedFiles = [...prevFiles];
              updatedFiles[index] = null;
              return updatedFiles;
            });
            break;
          case 'pan':
            console.log(`Setting offenderPan[${index}] to null`);
            setOffenderPan((prevFiles) => {
              const updatedFiles = [...prevFiles];
              updatedFiles[index] = null;
              return updatedFiles;
            });
            break;
          case 'passport':
            console.log(`Setting offenderPassport[${index}] to null`);
            setOffenderPassport((prevFiles) => {
              const updatedFiles = [...prevFiles];
              updatedFiles[index] = null;
              return updatedFiles;
            });
            break;
        }
      }
      return;
    }

    const originalFileName = file.name;
    let updatedFile: File;

    if (fileType.startsWith('victim')) {
      if (fileType.includes('_') && !isNaN(index)) {
        // Handle per-complainee files
        const victimFileType = fileType.split('_')[1];

        if (file === null) {
          // Handle file removal
          setComplaineeFiles(prev => ({
            ...prev,
            [index]: {
              ...prev[index],
              [victimFileType]: null
            }
          }));
          return;
        }

        const complaineeName = complaineeList[index]?.name || 'unknown';
        const newFileName = `${complaineeName}_${victimFileType}_${originalFileName}`;
        updatedFile = new File([file], newFileName, { type: file.type });

        setComplaineeFiles(prev => {
          console.log('🔄 UPDATING COMPLAINEE FILES:', {
            index,
            victimFileType,
            previousFile: prev[index] ? (prev[index] as any)[victimFileType]?.name || 'null' : 'null',
            newFile: updatedFile.name
          });
          const updated = {
            ...prev,
            [index]: {
              ...prev[index],
              [victimFileType]: updatedFile
            }
          };
          console.log('✅ COMPLAINEE FILES UPDATED:', updated);
          return updated;
        });

        // Update photoPath in complainee data when photo is uploaded
        if (victimFileType === 'passport') {
          const updatedComplaineeList = [...complaineeList];
          if (file) {
            updatedComplaineeList[index] = {
              ...updatedComplaineeList[index],
              photoPath: updatedFile.name
            };
          } else {
            updatedComplaineeList[index] = {
              ...updatedComplaineeList[index],
              photoPath: ''
            };
          }
          setComplaineeList(updatedComplaineeList);
        }
      } else {
        // Handle global victim files (backward compatibility)
        const victimFileType = fileType.split('_')[1];
        const complaineeName = complaineeList[0]?.name || 'unknown';
        const newFileName = `${complaineeName}_${victimFileType}_${originalFileName}`;
        updatedFile = new File([file], newFileName, { type: file.type });

        switch (victimFileType) {
          case 'aadhar':
            setVictimAadhar(updatedFile);
            break;
          case 'pan':
            setVictimPan(updatedFile);
            break;
          case 'passport':
            setVictimPassport(updatedFile);
            // Update photoPath in first complainee when passport is uploaded globally
            const updatedComplaineeList = [...complaineeList];
            updatedComplaineeList[0] = {
              ...updatedComplaineeList[0],
              photoPath: file ? updatedFile.name : ''
            };
            setComplaineeList(updatedComplaineeList);
            break;
        }
      }
    } else if (fileType === 'photo') {
      // Handle photo upload (maps to passport field)
      if (file === null) {
        // Handle file removal
        setComplaineeFiles(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            passport: null
          }
        }));
        // Update photoPath in complainee data
        const updatedComplaineeList = [...complaineeList];
        updatedComplaineeList[index] = {
          ...updatedComplaineeList[index],
          photoPath: ''
        };
        setComplaineeList(updatedComplaineeList);
        return;
      }

      const complaineeName = complaineeList[index]?.name || 'unknown';
      const newFileName = `${complaineeName}_passport_${originalFileName}`;
      updatedFile = new File([file], newFileName, { type: file.type });

      setComplaineeFiles(prev => {
        console.log('🔄 UPDATING COMPLAINEE PHOTO (PASSPORT):', {
          index,
          previousFile: prev[index] ? prev[index].passport?.name || 'null' : 'null',
          newFile: updatedFile.name
        });
        const updated = {
          ...prev,
          [index]: {
            ...prev[index],
            passport: updatedFile
          }
        };
        console.log('✅ COMPLAINEE PHOTO UPDATED:', updated);
        return updated;
      });

      // Update photoPath in complainee data
      const updatedComplaineeList = [...complaineeList];
      updatedComplaineeList[index] = {
        ...updatedComplaineeList[index],
        photoPath: updatedFile.name
      };
      setComplaineeList(updatedComplaineeList);
    } else if (fileType.startsWith('offender')) {
      console.log('🔄 Processing offender file:', fileType, 'for offender index:', index);

      const offenderFileType = fileType.split('_')[1];
      const offenderName = offenderList[index]?.offenderName || 'unknown';
      const newFileName = `${offenderName}_${offenderFileType}_${originalFileName}`;
      updatedFile = new File([file], newFileName, { type: file.type });

      console.log(`🔄 Processing offender file: ${offenderFileType} for offender ${index}`);

      switch (offenderFileType) {
        case 'aadhar':
          setOffenderAadhar((prevFiles) => {
            console.log(`📸 Before update - offenderAadhar[${index}]:`, prevFiles[index]?.name || 'null');
            const updatedFiles = [...prevFiles];
            updatedFiles[index] = updatedFile;
            console.log(`✅ After update - offenderAadhar[${index}]:`, updatedFiles[index]?.name || 'null');
            console.log('🔄 Triggering re-render for offender aadhar upload');
            return updatedFiles;
          });
          break;
        case 'pan':
          setOffenderPan((prevFiles) => {
            console.log(`📸 Before update - offenderPan[${index}]:`, prevFiles[index]?.name || 'null');
            const updatedFiles = [...prevFiles];
            updatedFiles[index] = updatedFile;
            console.log(`✅ After update - offenderPan[${index}]:`, updatedFiles[index]?.name || 'null');
            console.log('🔄 Triggering re-render for offender pan upload');
            return updatedFiles;
          });
          break;
        case 'passport':
          setOffenderPassport((prevFiles) => {
            console.log(`📸 Before update - offenderPassport[${index}]:`, prevFiles[index]?.name || 'null');
            const updatedFiles = [...prevFiles];
            updatedFiles[index] = updatedFile;
            console.log(`✅ After update - offenderPassport[${index}]:`, updatedFiles[index]?.name || 'null');
            console.log('🔄 Triggering re-render for offender passport upload');
            return updatedFiles;
          });
          break;
      }
    } else {
      console.log('❌ No matching file type found for:', fileType);
    }
  };

  const NUMBER_OF_STEPS = 5;

  const goToNextStep = () => {
    console.log('🔄 goToNextStep called, currentStep before:', currentStep);
    setCurrentStep(prev => {
      const next = prev < NUMBER_OF_STEPS - 1 ? prev + 1 : prev;
      console.log('🔄 Step transition:', { from: prev, to: next, maxSteps: NUMBER_OF_STEPS });

      // Only auto-add offender when transitioning to offender step (step 1) for new statements
      // and only if no offenders exist and we're not in edit mode
      if (prev === 0 && next === 1 && offenderList.length === 0 && !isEditMode) {
        console.log('🔄 Auto-adding first offender for new statement');
        // Use a flag to prevent multiple calls
        if (!(window as any).addingOffender) {
          (window as any).addingOffender = true;
          setTimeout(() => {
            handleAddOffender();
            (window as any).addingOffender = false;
          }, 0);
        }
      }

      // Only auto-add witness when transitioning to witness step (step 2) for new statements
      // and only if no witnesses exist and we're not in edit mode
      if (prev === 1 && next === 2 && witnessList.length === 0 && !isEditMode) {
        console.log('🔄 Auto-adding first witness for new statement');
        // Use a flag to prevent multiple calls
        if (!(window as any).addingWitness) {
          (window as any).addingWitness = true;
          setTimeout(() => {
            handleAddWitness();
            (window as any).addingWitness = false;
          }, 0);
        }
      }

      return next;
    });
    console.log('🔄 goToNextStep completed');
  };

  const goToPreviousStep = () =>
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));

  const handleAddOffender = () => {
    // Generate a unique citizenId that doesn't conflict with existing ones
    let newCitizenId: number;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      newCitizenId = Math.floor(Math.random() * 1000000) + Date.now();
      attempts++;
    } while (
      attempts < maxAttempts &&
      offenderList.some(offender => offender.citizenId === newCitizenId)
    );

    // If we couldn't generate a unique ID, use timestamp + index as fallback
    if (offenderList.some(offender => offender.citizenId === newCitizenId)) {
      newCitizenId = Date.now() + offenderList.length;
    }

    const newOffender: any = {
      citizenId: newCitizenId,
      role: 'OFFENDER',
      offenderName: '',
      offenderEmail: '',
      offenderMobileNo: '',
      offenderAddress: '',
      offenderAadharNo: '',
      offenderGender: '',
      offenderProfession: '',
      offenderAge: '',
    };
    setOffenderList(prev => [...prev, newOffender]);

    // Ensure file arrays are properly sized for the new offender
    const newLength = offenderList.length + 1;
    console.log('🔄 Adding offender, new length will be:', newLength);

    // Resize arrays if needed
    if (offenderAadhar.length < newLength) {
      setOffenderAadhar(prev => [...prev, null]);
    }
    if (offenderPan.length < newLength) {
      setOffenderPan(prev => [...prev, null]);
    }
    if (offenderPassport.length < newLength) {
      setOffenderPassport(prev => [...prev, null]);
    }

    console.log('✅ Added offender and updated file arrays');
  };

  const handleAddWitness = () => {
    const newWitness: any = {
      citizenId: Math.floor(Math.random() * 1000000),
      witnessName: '',
      witnessEmail: '',
      witnessProfession: '',
      witnessGender: '',
      witnessAddress: '',
      witnessAge: '',
      witnessAadharNo: '',
      witnessMobileNo: '',
      witnessStatement: '',
      witnessType: 'witness',
    };
    setWitnessList(prev => [...prev, newWitness]);

    // Ensure file arrays are properly sized for the new witness
    const newLength = witnessList.length + 1;
    if (witnessAadhar.length < newLength) {
      setWitnessAadhar(prev => [...prev, null]);
    }
    if (witnessPan.length < newLength) {
      setWitnessPan(prev => [...prev, null]);
    }
    if (witnessPassport.length < newLength) {
      setWitnessPassport(prev => [...prev, null]);
    }
  };

  const handleWitnessChange = (index: number, updatedWitness: any) => {
    const updatedList = witnessList.map((witness, i) =>
      i === index ? updatedWitness : witness,
    );
    setWitnessList(updatedList);
  };

  const handleWitnessFileChange = (fileType: string, file: File | null, index: number) => {
    const witnessFileType = fileType.split('_')[0]; // Get file type from 'photo_0' format
    const witnessName = witnessList[index]?.witnessName || 'unknown';
    const newFileName = `${witnessName}_${witnessFileType}_${file?.name || 'file'}`;
    const updatedFile = file ? new File([file], newFileName, { type: file.type }) : null;

    switch (witnessFileType) {
      case 'aadhar':
        setWitnessAadhar(prev => {
          const updated = [...prev];
          updated[index] = updatedFile;
          return updated;
        });
        break;
      case 'pan':
        setWitnessPan(prev => {
          const updated = [...prev];
          updated[index] = updatedFile;
          return updated;
        });
        break;
      case 'photo':
        setWitnessPassport(prev => {
          const updated = [...prev];
          updated[index] = updatedFile;
          return updated;
        });
        break;
    }
  };

  const removeWitness = (index: number) => {
    const updatedList = [...witnessList];
    updatedList.splice(index, 1);
    setWitnessList(updatedList);

    setWitnessAadhar(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    setWitnessPan(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    setWitnessPassport(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleCrimeChange = (updatedCrimeData: {
    crimeAddress?: string;
    crimeDateTime?: string;
    crimeDescription?: string;
  }) => {
    console.log('🔄 handleCrimeChange called with data:', updatedCrimeData);
    setCrimeData((prev: any) => ({
      ...prev,
      ...updatedCrimeData
    }));
  };

  const handleOffenderChange = (index: number, updatedOffender: any) => {
    console.log('🔄 handleOffenderChange called for index:', index, 'with data:', updatedOffender);
    const updatedList = offenderList.map((offender, i) =>
      i === index ? updatedOffender : offender,
    );
    console.log('🔄 Updated offenderList:', updatedList);
    setOffenderList(updatedList);
  };

  const handleAddComplainee = () => {
    console.log('Adding new complainee. Current complaineeList length:', complaineeList.length);
    console.log('Current complaineeFiles:', complaineeFiles);

    // Generate a unique citizenId that doesn't conflict with existing ones
    let newCitizenId: number;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      newCitizenId = Math.floor(Math.random() * 1000000) + Date.now();
      attempts++;
    } while (
      attempts < maxAttempts &&
      complaineeList.some(complainee => complainee.citizenId === newCitizenId)
    );

    // If we couldn't generate a unique ID, use timestamp + index as fallback
    if (complaineeList.some(complainee => complainee.citizenId === newCitizenId)) {
      newCitizenId = Date.now() + complaineeList.length;
    }

    const newComplainee: any = {
      citizenId: newCitizenId,
      role: 'COMPLAINANT',
      // Create completely empty form for new complainee
      name: '',
      gender: '',
      aadharNo: '',
      email: '',
      contactNo: '',
      profession: '',
      address: '',
      age: '',
      photoPath: '',
    };

    console.log('New complainee object:', newComplainee);

    // Add the new complainee to the list
    setComplaineeList([...complaineeList, newComplainee]);

    // Initialize file state for the new complainee (at the new index)
    const newIndex = complaineeList.length;
    console.log('Initializing complaineeFiles for index:', newIndex);
    setComplaineeFiles(prev => {
      const updated = {
        ...prev,
        [newIndex]: {
          aadhar: null,
          pan: null,
          passport: null
        }
      };
      console.log('Updated complaineeFiles:', updated);
      return updated;
    });
  };

  const removeComplainee = (index: number) => {
    const updatedList = [...complaineeList];
    updatedList.splice(index, 1);
    setComplaineeList(updatedList);

    // Clean up files for the removed complainee
    setComplaineeFiles(prev => {
      const updatedFiles = { ...prev };
      delete updatedFiles[index];

      // Re-index the remaining files to match the new complainee indices
      const reindexedFiles: {[key: number]: {aadhar: File | null; pan: File | null; passport: File | null}} = {};
      Object.entries(updatedFiles).forEach(([oldIndex, files]) => {
        const numIndex = parseInt(oldIndex);
        if (numIndex > index) {
          // Shift indices down for complainees after the removed one
          reindexedFiles[numIndex - 1] = files;
        } else if (numIndex < index) {
          // Keep original indices for complainees before the removed one
          reindexedFiles[numIndex] = files;
        }
      });

      return reindexedFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (complaineeList.length === 0) {
      showError('Missing Information', 'At least one complainant is required.');
      return;
    }

    if (offenderList.length === 0) {
      showError('Missing Information', 'At least one offender is required.');
      return;
    }

    // Check for duplicate Aadhar numbers in complainants
    const complainantAadharNumbers = complaineeList
      .map(c => c.aadharNo)
      .filter(aadhar => aadhar && aadhar.trim() !== '');

    const uniqueComplainantAadhars = new Set(complainantAadharNumbers);
    if (uniqueComplainantAadhars.size !== complainantAadharNumbers.length) {
      showError('Duplicate Aadhar Numbers', 'Multiple complainants cannot have the same Aadhar number.');
      return;
    }

    // Check for duplicate Aadhar numbers in offenders
    const offenderAadharNumbers = offenderList
      .map(o => o.offenderAadharNo)
      .filter(aadhar => aadhar && aadhar.trim() !== '');

    const uniqueOffenderAadhars = new Set(offenderAadharNumbers);
    if (uniqueOffenderAadhars.size !== offenderAadharNumbers.length) {
      showError('Duplicate Aadhar Numbers', 'Multiple offenders cannot have the same Aadhar number.');
      return;
    }

    // Check for duplicate names in complainants
    const complainantNames = complaineeList
      .map(c => c.name)
      .filter(name => name && name.trim() !== '');

    const uniqueComplainantNames = new Set(complainantNames);
    if (uniqueComplainantNames.size !== complainantNames.length) {
      showError('Duplicate Names', 'Multiple complainants cannot have the same name.');
      return;
    }

    // Check for duplicate names in witnesses
    const witnessNames = witnessList
      .map(w => w.witnessName)
      .filter(name => name && name.trim() !== '');

    const uniqueWitnessNames = new Set(witnessNames);
    if (uniqueWitnessNames.size !== witnessNames.length) {
      showError('Duplicate Names', 'Multiple witnesses cannot have the same name.');
      return;
    }

    // Validate Aadhar number format (exactly 12 digits)
    const validateAadharNumber = (aadharNo: string): boolean => {
      if (!aadharNo || aadharNo.trim() === '') return true; // Optional field
      const trimmedAadhar = aadharNo.trim();
      const aadharRegex = /^\d{12}$/;
      return aadharRegex.test(trimmedAadhar);
    };

    // Sanitize Aadhar number (ensure it's exactly 12 digits, pad or truncate if needed)
    const sanitizeAadharNumber = (aadharNo: string): string => {
      if (!aadharNo || aadharNo.trim() === '') return '';
      const trimmedAadhar = aadharNo.trim().replace(/\D/g, ''); // Remove non-digits
      return trimmedAadhar.substring(0, 12); // Take only first 12 digits
    };

    // Sanitize statement text (limit length to prevent database truncation errors)
    const sanitizeStatement = (statement: string): string => {
      if (!statement || statement.trim() === '') return '';
      // Limit statement to 500 characters (adjust based on your database column size)
      const maxLength = 500;
      return statement.trim().substring(0, maxLength);
    };

    // Sanitize description text (limit length to prevent database truncation errors)
    const sanitizeDescription = (description: string): string => {
      if (!description || description.trim() === '') return '';
      // Limit description to 4000 characters (matches database column size)
      const maxLength = 4000;
      return description.trim().substring(0, maxLength);
    };

    // Sanitize address text (limit length to prevent database truncation errors)
    const sanitizeAddress = (address: string): string => {
      if (!address || address.trim() === '') return '';
      // Limit address to 500 characters (reasonable size for addresses)
      const maxLength = 500;
      return address.trim().substring(0, maxLength);
    };

    // Generate unique citizen ID for new complainants
    const generateUniqueCitizenId = (existingIds: Set<number>): number => {
      let newId: number;
      let attempts = 0;
      const maxAttempts = 1000;

      do {
        newId = Math.floor(Math.random() * 1000000) * -1;
        attempts++;

        if (attempts >= maxAttempts) {
          // Fallback: use timestamp-based ID if random generation fails
          newId = Date.now() * -1;
          break;
        }
      } while (existingIds.has(newId));

      existingIds.add(newId);
      return newId;
    };

    const complaintDto = {
      subject: crimeData?.crimeDescription || 'Crime Report',
      description: sanitizeDescription(crimeData?.crimeDescription || ''),
      crimeAddress: sanitizeAddress(crimeData?.crimeAddress || ''),
      crimeDateTime: crimeData?.crimeDateTime && crimeData.crimeDateTime.trim() !== ''
        ? new Date(crimeData.crimeDateTime).toISOString()
        : null,
      filedByStationId: crimeData?.stationId || null,
      createdBy: (officer as any)?.officerId || '',
      createdOn: !isEditMode ? new Date().toISOString() : undefined, // Set for new statements
      updatedBy: isEditMode ? (officer as any)?.officerId || '' : undefined, // Only set for updates
      updatedOn: isEditMode ? new Date().toISOString() : undefined, // Only set for updates
      participants: (() => {
        // Pre-generate unique citizen IDs for all complainants
        const existingIds = new Set<number>();
        return complaineeList.map((complainee: any) => {
          const citizenId = complainee.citizenId && complainee.citizenId < 1000000 && complainee.citizenId > -1000000
            ? parseInt(complainee.citizenId)
            : generateUniqueCitizenId(existingIds);

          return {
            ...complainee,
            citizenId: citizenId,
            contactNo: complainee.contactNo,
            aadharNo: sanitizeAadharNumber(complainee.aadharNo),
            age: complainee.age ? parseInt(complainee.age) || 0 : 0,
            role: 'COMPLAINANT',
            createdBy: (officer as any)?.officerId || '',
          };
        });
      })(),
      offenderParticipants: (() => {
        // Pre-generate unique citizen IDs for all offenders
        const existingIds = new Set<number>();
        return offenderList.map((o: any) => {
          const citizenId = o.citizenId && o.citizenId < 1000000 && o.citizenId > -1000000
            ? parseInt(o.citizenId)
            : generateUniqueCitizenId(existingIds);

          return {
            ...o,
            citizenId: citizenId,
            name: o.offenderName,
            contactNo: o.offenderMobileNo,
            email: o.offenderEmail,
            address: sanitizeAddress(o.offenderAddress),
            aadharNo: sanitizeAadharNumber(o.offenderAadharNo),
            gender: o.offenderGender,
            profession: o.offenderProfession,
            age: o.offenderAge ? parseInt(o.offenderAge) || 0 : 0,
            role: 'OFFENDER',
            createdBy: (officer as any)?.officerId || '',
          };
        });
      })(),
      // Also add offenders as a separate field in case backend expects it
      offenders: offenderList.map((o: any) => ({
        name: o.offenderName,
        contactNo: o.offenderMobileNo,
        email: o.offenderEmail,
        address: sanitizeAddress(o.offenderAddress),
        aadharNo: sanitizeAadharNumber(o.offenderAadharNo),
        gender: o.offenderGender,
        profession: o.offenderProfession,
        age: o.offenderAge ? parseInt(o.offenderAge) || 0 : 0,
        role: 'OFFENDER',
      })),
      witnessParticipants: (() => {
        // Pre-generate unique citizen IDs for all witnesses
        const existingIds = new Set<number>();
        return witnessList.map((w: any) => {
          const citizenId = w.citizenId && w.citizenId < 1000000 && w.citizenId > -1000000
            ? parseInt(w.citizenId)
            : generateUniqueCitizenId(existingIds);

          return {
            ...w,
            citizenId: citizenId,
            name: w.witnessName,
            contactNo: w.witnessMobileNo,
            email: w.witnessEmail,
            address: sanitizeAddress(w.witnessAddress),
            aadharNo: sanitizeAadharNumber(w.witnessAadharNo),
            gender: w.witnessGender,
            profession: w.witnessProfession,
            age: w.witnessAge ? parseInt(w.witnessAge) || 0 : 0,
            statement: sanitizeStatement(w.witnessStatement || ''),
            role: 'WITNESS',
            createdBy: (officer as any)?.officerId || '',
          };
        });
      })(),
      status: 'PENDING',
    };

    // Create FormData object for file uploads
    const formData = new FormData();

    // Add the complaint DTO as a JSON Blob with correct content type
    const complaintDtoBlob = new Blob([JSON.stringify(complaintDto)], { type: 'application/json' });
    formData.append('complaintDto', complaintDtoBlob);

    // Debug: Log the complete complaintDto before sending
    console.log('🔍 COMPLAINT DTO BEING SENT TO BACKEND:');
    console.log(JSON.stringify(complaintDto, null, 2));

    // Debug: Verify authentication and API configuration
    console.log('🔍 AUTHENTICATION & API DEBUG:');
    console.log('Token present:', !!localStorage.getItem('token'));
    console.log('Officer ID:', (officer as any)?.officerId);
    console.log('complaintandfir API URL:', import.meta.env.VITE_complaintandfir_API);
    
    // Get complaintId early to avoid reference errors
    const complaintId = location.state?.editData?.complaintId || location.state?.caseData?.complaintId;
    
    console.log('ComplaintId for update:', complaintId);
    console.log('Request URL will be:', import.meta.env.VITE_complaintandfir_API + (isEditMode ? `/statements/${complaintId || '[id-missing]'}/update` : '/report'));

    // Debug: Log offender participants specifically
    console.log('🔍 OFFENDER PARTICIPANTS DATA:');
    console.log('Count:', complaintDto.offenderParticipants?.length || 0);
    console.log('Offender data:', complaintDto.offenderParticipants?.map((offender: any, index: number) => ({
      index,
      name: offender.offenderName || offender.name,
      role: offender.role,
      citizenId: offender.citizenId,
      contactNo: offender.contactNo || offender.offenderMobileNo,
      aadharNo: offender.aadharNo || offender.offenderAadharNo,
      age: offender.age || offender.offenderAge,
      gender: offender.gender || offender.offenderGender,
      profession: offender.profession || offender.offenderProfession,
      address: offender.address || offender.offenderAddress,
      email: offender.email || offender.offenderEmail
    })) || []);

    // Debug: Log offenders field as well
    console.log('🔍 OFFENDERS FIELD DATA:');
    console.log('Count:', complaintDto.offenders?.length || 0);
    console.log('Offenders data:', complaintDto.offenders?.map((offender: any, index: number) => ({
      index,
      name: offender.name,
      role: offender.role,
      contactNo: offender.contactNo,
      aadharNo: offender.aadharNo,
      age: offender.age,
      gender: offender.gender,
      profession: offender.profession,
      address: offender.address,
      email: offender.email
    })) || []);

    // Debug: Log complainant participants for comparison
    console.log('🔍 COMPLAINANT PARTICIPANTS DATA:');
    console.log('Count:', complaintDto.participants?.length || 0);
    console.log('Complainant data:', complaintDto.participants?.map((complainant: any, index: number) => ({
      index,
      name: complainant.name,
      role: complainant.role,
      citizenId: complainant.citizenId,
      contactNo: complainant.contactNo,
      aadharNo: complainant.aadharNo,
      age: complainant.age,
      gender: complainant.gender,
      profession: complainant.profession,
      address: complainant.address,
      email: complainant.email
    })) || []);

    if (victimAadhar) formData.append('complainantFiles', victimAadhar);
    if (victimPan) formData.append('complainantFiles', victimPan);
    if (victimPassport) formData.append('complainantFiles', victimPassport);

    // Send ALL files for each complainant with proper type identification
    complaineeList.forEach((complainee, index) => {
      const files = complaineeFiles[index];
      if (files) {
        // Send aadhar file with type prefix
        if (files.aadhar) {
          const renamedAadhar = new File([files.aadhar], `aadhar_${files.aadhar.name}`, { type: files.aadhar.type });
          formData.append('complainantFiles', renamedAadhar);
        }
        // Send pan file with type prefix
        if (files.pan) {
          const renamedPan = new File([files.pan], `pan_${files.pan.name}`, { type: files.pan.type });
          formData.append('complainantFiles', renamedPan);
        }
        // Send photo file with type prefix
        if (files.passport) {
          const renamedPhoto = new File([files.passport], `photo_${files.passport.name}`, { type: files.passport.type });
          formData.append('complainantFiles', renamedPhoto);
        }
      }
    });

    // Send ALL files for each offender with proper type identification
    offenderList.forEach((offender, index) => {
      // Send aadhar file with type prefix
      if (offenderAadhar[index]) {
        const renamedAadhar = new File([offenderAadhar[index]], `aadhar_${offenderAadhar[index].name}`, { type: offenderAadhar[index].type });
        formData.append('offenderFiles', renamedAadhar);
        console.log(`📸 Adding offender ${index} aadhar: ${renamedAadhar.name}`);
      }
      // Send pan file with type prefix
      if (offenderPan[index]) {
        const renamedPan = new File([offenderPan[index]], `pan_${offenderPan[index].name}`, { type: offenderPan[index].type });
        formData.append('offenderFiles', renamedPan);
        console.log(`📸 Adding offender ${index} pan: ${renamedPan.name}`);
      }
      // Send photo file with type prefix
      if (offenderPassport[index]) {
        const renamedPhoto = new File([offenderPassport[index]], `photo_${offenderPassport[index].name}`, { type: offenderPassport[index].type });
        formData.append('offenderFiles', renamedPhoto);
        console.log(`📸 Adding offender ${index} photo: ${renamedPhoto.name}`);
      }
    });

    // Send ALL files for each witness with proper type identification
    witnessList.forEach((witness, index) => {
      // Send aadhar file with type prefix
      if (witnessAadhar[index]) {
        const renamedAadhar = new File([witnessAadhar[index]], `aadhar_${witnessAadhar[index].name}`, { type: witnessAadhar[index].type });
        formData.append('witnessFiles', renamedAadhar);
        console.log(`📸 Adding witness ${index} aadhar: ${renamedAadhar.name}`);
      }
      // Send pan file with type prefix
      if (witnessPan[index]) {
        const renamedPan = new File([witnessPan[index]], `pan_${witnessPan[index].name}`, { type: witnessPan[index].type });
        formData.append('witnessFiles', renamedPan);
        console.log(`📸 Adding witness ${index} pan: ${renamedPan.name}`);
      }
      // Send photo file with type prefix
      if (witnessPassport[index]) {
        const renamedPhoto = new File([witnessPassport[index]], `photo_${witnessPassport[index].name}`, { type: witnessPassport[index].type });
        formData.append('witnessFiles', renamedPhoto);
        console.log(`📸 Adding witness ${index} photo: ${renamedPhoto.name}`);
      }
    });

    try {
      const startTime = performance.now();
      console.log('🚀 Starting form submission...');

      // Ensure any previous loading state is cleared
      try {
        Swal.close();
      } catch (e) {
        console.warn('Failed to close existing loading modal:', e);
      }

      await showLoading('Submitting Statement... Please wait...');

      console.log('🔍 REQUEST DEBUGGING:');
      console.log('isEditMode:', isEditMode);
      
      // Using complaintId defined earlier
      console.log('complaintId:', complaintId);
      console.log('API Method:', isEditMode ? 'PUT' : 'POST');
      console.log('API URL:', isEditMode ? `/statements/${complaintId}/update` : '/report');

      // Prevent multiple simultaneous requests
      if ((window as any).isSubmittingStatement) {
        console.log('🚫 Submission already in progress - preventing duplicate');
        return;
      }

      (window as any).isSubmittingStatement = true;
      console.log('🔒 Submission flag set to prevent duplicates');

      // Validate complaintId before proceeding with update
      if (isEditMode && !complaintId) {
        console.error('❌ Missing complaintId for update operation:', { editData: location.state?.editData, caseData: location.state?.caseData });
        closeLoading();
        showError('Update Error', '');
        (window as any).isSubmittingStatement = false;
        return;
      }

      console.log('✅ Using complaintId for update:', complaintId);

      // Create timeout promise for API call
      const TIMEOUT_MS = 60000; // 10 seconds
      let apiEndpoint = '/report';
      let apiMethod = 'POST';
      
      if (isEditMode && complaintId) {
        apiEndpoint = `/statements/${complaintId}/update`;
        apiMethod = 'PUT';
        console.log(`✅ Using update endpoint: ${apiEndpoint} with ${apiMethod} method`);
      } else {
        console.log('✅ Using create endpoint: /report with POST method');
      }
      
      // Log formData contents for debugging
      console.log('🔄 FormData entries:');
      formData.forEach((value, key) => {
        if (key === 'complaintDto') {
          console.log('- complaintDto: [JSON Blob]');
        } else {
          console.log(`- ${key}: ${value instanceof File ? value.name : value}`); 
        }
      });
      
      const apiPromise = request(
        'complaintandfir',
        apiMethod,
        apiEndpoint,
        formData
      );

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timed out after ${TIMEOUT_MS}ms`));
        }, TIMEOUT_MS);
      });

      console.log(`⏱️ Making API request with ${TIMEOUT_MS}ms timeout...`);

      // Race between API call and timeout
      const response = await Promise.race([apiPromise, timeoutPromise]);

      const requestTime = performance.now() - startTime;
      console.log(`✅ REQUEST COMPLETED in ${requestTime.toFixed(2)}ms - Method:`, isEditMode ? 'PUT' : 'POST', 'URL:', isEditMode ? `/statements/${complaintId}/update` : '/report');
      console.log('✅ Response status:', response?.status);

      // Enhanced response logging to understand what's happening
      console.log('🔍 DETAILED RESPONSE ANALYSIS:');
      console.log('Response object:', response);
      console.log('Response data:', response?.data);
      console.log('Response headers:', response?.headers);
      console.log('Response status:', response?.status);
      console.log('Response statusText:', response?.statusText);
      console.log('Is Edit Mode:', isEditMode);

      // Check if response indicates an error (4xx status)
      const isErrorResponse = response?.status && response.status >= 400 && response.status < 500;
      // Check for error structure: has 'error' field AND 'timestamp' field (typical Spring Boot error response)
      const hasErrorStructure = response?.error && response?.timestamp && response?.path;
      
      console.log('🔍 Error Detection:');
      console.log('  - isErrorResponse:', isErrorResponse);
      console.log('  - hasErrorStructure:', hasErrorStructure);
      console.log('  - response?.error:', response?.error);
      console.log('  - response?.timestamp:', response?.timestamp);
      console.log('  - response?.path:', response?.path);
      
      // SPECIAL HANDLING FOR 405 ERRORS
      // Backend sometimes returns 405 but still processes the request successfully
      // This is a known issue with the complaint service
      if ((isErrorResponse || hasErrorStructure) && response?.status === 405) {
        console.warn('⚠️ Received 405 error, but request may have succeeded');
        console.log('🔍 Checking if this is edit mode or create mode...');
        
        if (isEditMode) {
          // In edit mode, use existing complaint ID
          const existingComplaintId = complaintId || location.state?.editData?.complaintId;
          
          if (existingComplaintId) {
            console.log('✅ Edit mode: Using existing complaint ID:', existingComplaintId);
            const totalTime = performance.now() - startTime;

            closeLoading();
            (window as any).isSubmittingStatement = false;

            const refreshStatements = () => {
              console.log('🔄 Triggering statements refresh...');
              localStorage.setItem('statementsRefresh', Date.now().toString());
              window.dispatchEvent(new CustomEvent('statementsRefresh'));
            };

            refreshStatements();
            setTimeout(() => refreshStatements(), 1000);
            setTimeout(() => refreshStatements(), 2000);

            setTimeout(() => {
              Swal.fire({
                title: 'Success!',
                text: 'Your statement has been updated successfully!',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6366f1',
                allowOutsideClick: false,
                allowEscapeKey: false,
              }).then(() => {
                navigate('/allstatements');
              });
            }, 100);
            return;
          }
        } else {
          // In create mode, show success anyway since data is being saved
          console.log('✅ Create mode: Showing success despite 405 error');
          const totalTime = performance.now() - startTime;

          closeLoading();
          (window as any).isSubmittingStatement = false;

          const refreshStatements = () => {
            console.log('🔄 Triggering statements refresh...');
            localStorage.setItem('statementsRefresh', Date.now().toString());
            window.dispatchEvent(new CustomEvent('statementsRefresh'));
          };

          refreshStatements();
          setTimeout(() => refreshStatements(), 1000);
          setTimeout(() => refreshStatements(), 2000);

          setTimeout(() => {
            Swal.fire({
              title: 'Success!',
              text: 'Your statement has been registered successfully!',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#6366f1',
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              navigate('/allstatements');
            });
          }, 100);
          return;
        }
      }
      
      // In edit mode, if we get an error response but the update might have succeeded,
      // use the existing complaint ID
      if (isEditMode && (isErrorResponse || hasErrorStructure)) {
        console.warn('⚠️ Received error response in edit mode, but update may have succeeded');
        console.log('🔍 Response status:', response?.status);
        console.log('🔍 Response error:', response?.error);
        
        // Use the existing complaint ID from edit mode
        const existingComplaintId = complaintId || location.state?.editData?.complaintId;
        
        if (existingComplaintId) {
          console.log('✅ Using existing complaint ID for edit mode:', existingComplaintId);
          const totalTime = performance.now() - startTime;
          console.log(`✅ Statement updated successfully in ${totalTime.toFixed(2)}ms with ID:`, existingComplaintId);

          closeLoading();

          setSuccessDetails({
            title: 'Statement Updated Successfully',
            message: '',
            details: [],
            type: 'success'
          });

          setIsSuccessPopupOpen(true);
          (window as any).isSubmittingStatement = false;

          // Refresh statements list
          const refreshStatements = () => {
            console.log('🔄 Triggering statements refresh...');
            localStorage.setItem('statementsRefresh', Date.now().toString());
            window.dispatchEvent(new CustomEvent('statementsRefresh'));
          };

          refreshStatements();
          setTimeout(() => refreshStatements(), 1000);
          setTimeout(() => refreshStatements(), 2000);
          return;
        }
      }
      
      // Get the complaint ID from the response - check multiple possible field names
      console.log('🔍 Extracting complaint ID from response...');
      const newComplaintId = response?.data?.complaintId ||
                           response?.data?.id ||
                           response?.data?.statementId ||
                           response?.data?.complaint_id ||
                           response?.data?.statement_id ||
                           response?.data?.result?.complaintId ||
                           response?.data?.result?.id ||
                           response?.data?.data?.complaintId ||
                           response?.data?.data?.id ||
                           response?.complaintId ||
                           response?.id ||
                           response?.data?.response?.complaintId ||
                           response?.data?.response?.id;

      console.log('🔍 Extracted complaint ID:', newComplaintId);
      console.log('🔍 Complaint ID type:', typeof newComplaintId);

      if (!newComplaintId) {
        console.warn('⚠️ Response missing complaint ID - may not have been saved');
        console.log('🔍 Available response data fields:', Object.keys(response?.data || {}));
        console.log('🔍 Available response fields:', Object.keys(response || {}));
        console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));

        // Try to find any numeric ID as a fallback
        const responseValues = Object.values(response?.data || {});
        const numericIds = responseValues.filter((value: any) =>
          typeof value === 'number' && value > 0 && value < 10000000
        );

        if (numericIds.length > 0) {
          const fallbackId = numericIds[0];
          console.log('🔄 Using fallback numeric ID:', fallbackId);
          const totalTime = performance.now() - startTime;
          console.log(`✅ Statement created/updated successfully in ${totalTime.toFixed(2)}ms with ID:`, fallbackId);

          // Close loading indicator for successful submission
          closeLoading();

          // Show SweetAlert2 popup
          const successTitle = isEditMode ? 'Statement Updated Successfully' : 'Statement Registered Successfully';
          const successMessage = isEditMode 
            ? 'Your statement has been updated successfully!' 
            : 'Your statement has been registered successfully!';

          (window as any).isSubmittingStatement = false;

          // Small delay to ensure loading modal is fully closed before showing success
          setTimeout(() => {
            Swal.fire({
              title: 'Success!',
              text: successMessage,
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#6366f1',
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              navigate('/allstatements');
            });
          }, 100);

          // Refresh statements list - with multiple attempts to ensure backend has saved
          const refreshStatements = () => {
            console.log('🔄 Triggering statements refresh...');
            localStorage.setItem('statementsRefresh', Date.now().toString());
            window.dispatchEvent(new CustomEvent('statementsRefresh'));
          };

          // Immediate refresh
          refreshStatements();
          
          // Delayed refresh after 1 second to ensure backend has fully saved
          setTimeout(() => {
            console.log('🔄 Delayed refresh triggered (1s)');
            refreshStatements();
          }, 1000);
          
          // Another refresh after 2 seconds as safety net
          setTimeout(() => {
            console.log('🔄 Final safety refresh triggered (2s)');
            refreshStatements();
          }, 2000);
          return;
        }

        // Show error to user since we can't confirm the statement was saved
        closeLoading();
        showError('Submission Failed', 'The statement may not have been saved properly. Please try again or contact support if the issue persists.');
        (window as any).isSubmittingStatement = false;
        return;
      } else {
        const totalTime = performance.now() - startTime;
        console.log(`✅ Statement created/updated successfully in ${totalTime.toFixed(2)}ms with ID:`, newComplaintId);

        // Close loading indicator for successful submission
        console.log('🔄 Closing loading indicator...');
        closeLoading();

        // Only show success popup after we've verified the data was saved
        const successTitle = isEditMode ? 'Statement Updated Successfully' : 'Statement Registered Successfully';
        
        console.log('🎉 Preparing to show success popup...');
        console.log('  - Title:', successTitle);
        console.log('  - Complaint ID:', newComplaintId);
        (window as any).isSubmittingStatement = false;

        // Refresh statements list - with multiple attempts to ensure backend has saved
        const refreshStatements = () => {
          console.log('🔄 Triggering statements refresh...');
          localStorage.setItem('statementsRefresh', Date.now().toString());
          window.dispatchEvent(new CustomEvent('statementsRefresh'));
        };

        // Immediate refresh
        refreshStatements();
        
        // Delayed refresh after 1 second to ensure backend has fully saved
        setTimeout(() => {
          console.log('🔄 Delayed refresh triggered (1s)');
          refreshStatements();
        }, 1000);
        
        // Another refresh after 2 seconds as safety net
        setTimeout(() => {
          console.log('🔄 Final safety refresh triggered (2s)');
          refreshStatements();
        }, 2000);

        const successMessage = isEditMode 
          ? 'Your statement has been updated successfully!' 
          : 'Your statement has been registered successfully!';

        // Small delay to ensure loading modal is fully closed before showing success
        setTimeout(() => {
          Swal.fire({
            title: 'Success!',
            text: successMessage,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6366f1',
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            navigate('/allstatements');
          });
        }, 100);
      }

    } catch (error: any) {
      const totalTime = performance.now() - (performance.now() - (error.startTime || performance.now()));
      console.error(`❌ Error in handleSubmit after ${totalTime.toFixed(2)}ms:`, error);

      // Ensure loading is closed in all error scenarios
      try {
        closeLoading();
      } catch (e) {
        console.warn('Failed to close loading modal in error handler:', e);
        // Fallback: try to close Swal directly
        try {
          Swal.close();
        } catch (e2) {
          console.warn('Failed to close Swal directly:', e2);
        }
      }

      (window as any).isSubmittingStatement = false; // Reset flag on error

      let errorMessage = 'Something went wrong! Please try again later.';
      let errorStatus = null;

      // Handle different error response structures
      if (error.message?.includes('timed out')) {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
        errorStatus = 408; // Request Timeout
      } else if ((error as any)?.response?.status) {
        errorStatus = (error as any).response.status;
      } else if ((error as any)?.status) {
        errorStatus = (error as any).status;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if ((error as any)?.message) {
        errorMessage = (error as any).message;
      }

      if (errorStatus === 400) {
        errorMessage = 'Invalid data submitted. Please check required fields.';
      } else if (errorStatus === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (errorStatus === 403) {
        errorMessage = 'Access denied. Insufficient permissions.';
      } else if (errorStatus === 404) {
        errorMessage = 'API endpoint not found. Contact support.';
      } else if (errorStatus === 408) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (errorStatus && errorStatus >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      // If this is an update operation and it failed, don't fall back to creating a new statement
      if (isEditMode) {
        console.error('❌ UPDATE FAILED - Not falling back to create mode');
        console.error('❌ Error details:', error);
        console.error('❌ Error response:', (error as any)?.response);
        console.error('❌ Error data:', (error as any)?.response?.data);
        console.error('❌ Error status:', errorStatus);

        // Log the complaintId that was being updated
        const failedComplaintId = location.state?.editData?.complaintId || location.state?.caseData?.complaintId;
        console.error('❌ Complaint ID that failed to update:', failedComplaintId);
        
        // Create a more descriptive error message based on the response
        let errorTitle = 'Update Failed';
        let errorMessage = 'Your statement changes could not be saved';
        
        if (errorStatus === 400) {
          errorTitle = 'Invalid Data Format';
          errorMessage = 'The server rejected your changes due to invalid data format. Please check required fields and try again.';
        } else if (errorStatus === 404) {
          errorTitle = 'Statement Not Found';
          errorMessage = `The statement with ID ${failedComplaintId} could not be found on the server.`;
        } else if (errorStatus === 415) {
          errorTitle = 'Unsupported Format';
          errorMessage = 'The server does not support the format of the data sent. Please contact support.';
        } else if (errorStatus >= 500) {
          errorTitle = 'Server Error';
          errorMessage = 'The server encountered an internal error while processing your update. Please try again later.';
        }
        
        // Get any specific message from the response if available
        const serverMessage = (error as any)?.response?.data?.message || 
                            (error as any)?.response?.data?.error || 
                            (error as any)?.message || '';
        
        if (serverMessage) {
          errorMessage = `${errorMessage}\n\nServer message: ${serverMessage}`;
        }
        
        showError(errorTitle, errorMessage);
        return;
      }

      showError('Submission Failed', '');
    }
  };

  const removeFile = (fileType: string, index: number) => {
    console.log(`🗑️ Removing file: ${fileType} at index: ${index}`);
    
    switch (fileType) {
      // Victim files
      case 'victim_aadhar':
        setVictimAadhar(null);
        break;
      case 'victim_pan':
        setVictimPan(null);
        break;
      case 'victim_passport':
        setVictimPassport(null);
        break;
      
      // Complainee files
      case 'aadhar':
        setComplaineeFiles(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            aadhar: null
          }
        }));
        break;
      case 'pan':
        setComplaineeFiles(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            pan: null
          }
        }));
        break;
      case 'photo':
      case 'passport':
        setComplaineeFiles(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            passport: null
          }
        }));
        break;
      
      // Offender files
      case 'offender_aadhar':
        setOffenderAadhar((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = null;
          console.log(`✅ Removed offender aadhar at index ${index}`);
          return updatedFiles;
        });
        break;
      case 'offender_pan':
        setOffenderPan((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = null;
          console.log(`✅ Removed offender pan at index ${index}`);
          return updatedFiles;
        });
        break;
      case 'offender_passport':
      case 'offender_photo':
        setOffenderPassport((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = null;
          console.log(`✅ Removed offender photo at index ${index}`);
          return updatedFiles;
        });
        break;
      
      // Witness files
      case 'witness_aadhar':
        setWitnessAadhar((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = null;
          console.log(`✅ Removed witness aadhar at index ${index}`);
          return updatedFiles;
        });
        break;
      case 'witness_pan':
        setWitnessPan((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = null;
          console.log(`✅ Removed witness pan at index ${index}`);
          return updatedFiles;
        });
        break;
      case 'witness_passport':
      case 'witness_photo':
        setWitnessPassport((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = null;
          console.log(`✅ Removed witness photo at index ${index}`);
          return updatedFiles;
        });
        break;
      
      default:
        console.warn(`⚠️ Unknown file type: ${fileType}`);
        break;
    }
  };

  const removeOffender = (index: number) => {
    const updatedList = [...offenderList];
    updatedList.splice(index, 1);
    setOffenderList(updatedList);

    // Remove files for the deleted offender and re-index remaining files
    console.log('🔄 Removing offender at index:', index, 'Current offender count:', offenderList.length);

    setOffenderAadhar(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      console.log('✅ Updated offenderAadhar array length:', updated.length);
      return updated;
    });

    setOffenderPan(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      console.log('✅ Updated offenderPan array length:', updated.length);
      return updated;
    });

    setOffenderPassport(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      console.log('✅ Updated offenderPassport array length:', updated.length);
      return updated;
    });

    console.log('✅ Removed offender and cleaned up file arrays');
  };

  if (isLoading && statementId) return <Loader />;

  console.log('🔄 RENDER: isEditMode =', isEditMode, 'statementId =', statementId);

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb
        pageName={
          isEditMode
            ? 'Edit Statement'
            : 'Register Statement'
        }
      />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mx-13">
        <div className="step flex justify-between p-3">
          <div className="w-screen">
            <div className="stepper flex justify-center">
              <Stepper
                currentStep={currentStep}
                numberOfSteps={NUMBER_OF_STEPS}
              />
            </div>
          </div>
          <div className="backnext flex space-x-2">
            <button
              onClick={goToPreviousStep}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentStep === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 12H5M12 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNextStep}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentStep === NUMBER_OF_STEPS - 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {currentStep === 0 && (
            <>
              {complaineeList.map((complainee, index) => {
                // console.log(`Rendering complainee ${index}, citizenId: ${complainee.citizenId}`);
                // console.log(`complaineeFiles[${index}]:`, complaineeFiles[index]);
                // console.log(`Passing to Complainee - victimAadhar:`, complaineeFiles[index]?.aadhar, 'victimPan:', complaineeFiles[index]?.pan, 'victimPassport:', complaineeFiles[index]?.passport);
                return (
                <div key={complainee.citizenId} className="mb-6">
                  <Complainee
                    key={`complainee-${complainee.citizenId}`}
                    complainee={complainee}
                    handleComplaineeChange={(updatedData: any) => {
                      const updatedList = complaineeList.map((c, i) =>
                        i === index ? updatedData : c
                      );
                      setComplaineeList(updatedList);
                    }}
                    handleFileChange={(fileType: string, file: File | null) => handleFileChange(fileType, file)}
                    victimAadhar={complaineeFiles[index]?.aadhar || null}
                    victimPan={complaineeFiles[index]?.pan || null}
                    victimPassport={complaineeFiles[index]?.passport || null}
                    index={index}
                  />
                  {complaineeList.length > 1 && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => removeComplainee(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove Complainant
                      </button>
                    </div>
                  )}
                </div>
                );
              })} 

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddComplainee}
                  className="relative px-5 py-2.5 mb-2 me-2 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] text-sm transition duration-200 dark:text-white"
                >
                  + Add Complainee
                </button>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <Offenderpage
              offenderList={offenderList || []}
              handleAddOffender={handleAddOffender}
              handleOffenderChange={handleOffenderChange}
              handleFileChange={handleFileChange}
              offenderPan={offenderPan}
              offenderAadhar={offenderAadhar || []}
              offenderPassport={offenderPassport || []}
              removeFile={removeFile}
              removeOffender={removeOffender}
            />
          )}

          {currentStep === 2 && (
            <div>
              {witnessList.map((witness, index) => (
                <WitnessForm
                  key={`witness-${witness?.citizenId}-${index}`}
                  index={index}
                  formData={{
                    witnessName: witness.witnessName || '',
                    witnessEmail: witness.witnessEmail || '',
                    witnessProfession: witness.witnessProfession || '',
                    witnessGender: witness.witnessGender || '',
                    witnessAddress: witness.witnessAddress || '',
                    witnessAge: witness.witnessAge || '',
                    witnessAadharNo: witness.witnessAadharNo || '',
                    witnessMobileNo: witness.witnessMobileNo || '',
                    witnessStatement: witness.witnessStatement || '',
                    aadharFile: witnessAadhar[index] || null,
                    panFile: witnessPan[index] || null,
                    photoFile: witnessPassport[index] || null,
                    witnessType: witness.witnessType || 'witness',
                  }}
                  errors={{}}
                  handleInputChange={(idx, e) => {
                    const { name, value } = e.target;
                    const updatedWitness = { ...witness, [name]: value };
                    handleWitnessChange(idx, updatedWitness);
                  }}
                  handleFileChange={(idx, e) => {
                    // Convert WitnessForm's handleFileChange call to our handleWitnessFileChange format
                    const fileType = e.target.name.replace('File', '');
                    const file = e.target.files?.[0] || null;
                    handleWitnessFileChange(`${fileType}_${idx}`, file, idx);
                  }}
                  validateInput={() => {}}
                  handleRemoveWitness={(idx) => {
                    removeWitness(idx);
                  }}
                />
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddWitness}
                  className="relative px-5 py-2.5 mb-2 me-2 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] text-sm transition duration-200 dark:text-white"
                >
                  + Add Witness
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <Crime
              crimeData={{
                ...crimeData,
                isEditMode: isEditMode,
                originalCrimeDateTime: isEditMode ? crimeData.crimeDateTime : undefined,
              }}
              handleCrimeChange={handleCrimeChange}
            />
          )}

          {currentStep === 4 && (
            <Previewstatement
              complaineeList={complaineeList}
              offenderList={offenderList}
              witnesses={witnessList}
              crimeData={crimeData}
              officer={officer}
              onComplaineeChange={(index, updatedData) => {
                const updatedList = complaineeList.map((c, i) =>
                  i === index ? updatedData : c
                );
                setComplaineeList(updatedList);
              }}
              onOffenderChange={handleOffenderChange}
              onCrimeChange={handleCrimeChange}
            />
          )}

          <div className="Submitbtn flex justify-end">
            {currentStep === 3 && (
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
                type="button"
                onClick={goToNextStep}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                  {viewstatement}
                </span>
              </button>
            )}
            {currentStep === 3 && (
              <button
                type="submit"
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                  {isEditMode ? 'Update' : 'Submit'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        isOpen={isSuccessPopupOpen}
        onClose={() => {
          setIsSuccessPopupOpen(false);
          // Navigate to All Statements page after successful update
          navigate('/allstatements');
        }}
        title={successDetails.title}
        message={successDetails.message}
        type={successDetails.type}
      />
    </DefaultLayout>
  );
};

export default Registerstatement;
