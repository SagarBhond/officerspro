import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '../layout/DefaultLayout';
import request from '../Service/axios_helper';
import { formatDate } from '../common/DateUtils';
import { getSignedUrlString } from '../services/documentService';

interface CaseDetail {
  // Case/FIR Info
  complaintId: string;
  firNo: string;
  caseStatus: string;
  created_on: string;
  firRegisteredDate?: string;
  firDescription?: string;
  
  // Complainee (Victim) Info
  victimName: string;
  victimAddress?: string;
  victimPhone?: string;
  victimEmail?: string;
  victimAge?: string;
  victimGender?: string;
  victimPhoto?: string;
  victimPhotoId?: string;
  victimPhotoPath?: string;
  
  // Offender Info
  offenderName: string;
  offenderAddress?: string;
  offenderPhone?: string;
  offenderAge?: string;
  offenderGender?: string;
  offenderPhoto?: string;
  offenderPhotoId?: string;
  offenderPhotoPath?: string;
  
  // Crime Details
  description: string;
  crimeDescription?: string;
  shortDescription?: string;
  location?: string;
  caseType?: string;
  crimeType?: string;
  crimeDate?: string;
  
  // Additional Details
  investigationId?: string;
  evidence?: any[];
  photos?: any[];
  witnesses?: any[];
  
  // Full statement data
  [key: string]: any;
}

const ViewCase: React.FC = () => {
  const { firNo } = useParams<{ firNo: string }>();
  const navigate = useNavigate();
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});

  // Helper function to toggle description expansion
  const toggleDescription = (key: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper function to render description with "See More" link
  const renderDescription = (text: string, key: string, maxLength: number = 150) => {
    if (!text) return '';
    
    const isExpanded = expandedDescriptions[key];
    const needsSeeMore = text.length > maxLength;
    
    return (
      <div>
        <p className="text-black dark:text-white whitespace-pre-wrap">
          {isExpanded ? text : `${text.substring(0, maxLength)}${needsSeeMore ? '...' : ''}`}
        </p>
        {needsSeeMore && (
          <button
            onClick={() => toggleDescription(key)}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2"
          >
            {isExpanded ? 'See Less' : 'See More'}
          </button>
        )}
      </div>
    );
  };

  // Helper function to get signed URL for a document ID
  const getSignedUrl = async (documentId: number | string, cacheKey: string): Promise<string> => {
    // Check if we already have the signed URL cached
    if (signedUrls[cacheKey]) {
      return signedUrls[cacheKey];
    }

    try {
      const url = await getSignedUrlString(Number(documentId));
      setSignedUrls(prev => ({ ...prev, [cacheKey]: url }));
      return url;
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      return '';
    }
  };

  // SignedImage component to load images using signed URLs
  const SignedImage: React.FC<{ documentId: number | string; alt: string; className?: string }> = ({ documentId, alt, className }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      const loadImage = async () => {
        try {
          setImageLoading(true);
          setImageError(false);
          const url = await getSignedUrl(documentId, `img-${documentId}`);
          setImageUrl(url);
        } catch (error) {
          console.error('Error loading image:', error);
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      };

      if (documentId) {
        loadImage();
      }
    }, [documentId]);

    if (imageLoading) {
      return (
        <div className={className || "w-32 h-40 bg-gray-200 rounded border-2 border-gray-300 flex items-center justify-center"}>
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      );
    }

    if (imageError || !imageUrl) {
      return (
        <div className={className || "w-32 h-40 bg-gray-200 rounded border-2 border-gray-300 flex items-center justify-center"}>
          <span className="text-gray-500 text-sm">No Photo</span>
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [firNo]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch case details from admin service
      const response = await request('dashboard', 'GET', '/all', {});
      const allCases = response?.data ?? response;

      if (!Array.isArray(allCases)) {
        throw new Error('Invalid response format');
      }

      // Find the specific case
      const foundCase = allCases.find((c: any) => c.firNo === firNo);
      if (!foundCase) {
        throw new Error('Case not found');
      }

      let caseWithDetails: CaseDetail = { ...foundCase };

      console.log('📋 Found case:', foundCase);
      console.log('Complaint ID:', foundCase.complaintId);

      // Fetch complete statement/complaint details
      if (foundCase.complaintId) {
        try {
          console.log('📦 Fetching complete statement details...');
          const statementResponse = await request('complaintandfir', 'GET', `/statements/${foundCase.complaintId}`, {});
          const statementData = statementResponse?.data || statementResponse;
          
          console.log('✅ Full Statement data:', statementData);
          console.log('📋 Statement keys:', Object.keys(statementData || {}));

          // Extract victim and offender from participants array
          let victimInfo: any = {};
          let offenderInfo: any = {};
          let complainantsInfo: any[] = []; // Array of full complainant objects
          let offendersInfo: any[] = []; // Array of full offender objects
          let witnessesInfo: any[] = [];

          if (statementData?.participants && Array.isArray(statementData.participants)) {
            console.log('👥 Found participants array with', statementData.participants.length, 'items');
            
            statementData.participants.forEach((participant: any, idx: number) => {
              console.log(`Participant ${idx}:`, participant.role, '-', participant.citizen?.name);
              
              if (participant.role === 'COMPLAINANT' || participant.role === 'CO_COMPLAINANT') {
                // Extract document ID from photoPath if it's in format /documents/{id}
                const photoPath = participant.citizen?.photoPath || participant.citizen?.photo;
                let extractedPhotoId = participant.citizen?.photoDocumentId || participant.citizen?.photoId || participant.photoDocumentId;
                
                if (!extractedPhotoId && photoPath) {
                  const match = photoPath.match(/\/documents\/(\d+)/);
                  if (match) {
                    extractedPhotoId = parseInt(match[1]);
                  }
                }

                // Collect all complainants with full details
                complainantsInfo.push({
                  name: participant.citizen?.name || 'Unknown',
                  address: participant.citizen?.address,
                  phone: participant.citizen?.contactNo,
                  email: participant.citizen?.email,
                  age: participant.citizen?.age,
                  gender: participant.citizen?.gender,
                  photoId: extractedPhotoId,
                  photoPath: photoPath,
                });
                console.log(`✅ Added complainant ${complainantsInfo.length}:`, participant.citizen?.name, 'photoId:', extractedPhotoId);
                
                // First complainant is the primary victim for backward compatibility
                if (!victimInfo.victimName) {
                  victimInfo = {
                    victimName: participant.citizen?.name || caseWithDetails.victimName,
                    victimAddress: participant.citizen?.address || caseWithDetails.victimAddress,
                    victimPhone: participant.citizen?.contactNo || caseWithDetails.victimPhone,
                    victimEmail: participant.citizen?.email || caseWithDetails.victimEmail,
                    victimAge: participant.citizen?.age || caseWithDetails.victimAge,
                    victimGender: participant.citizen?.gender || caseWithDetails.victimGender,
                    victimPhotoId: extractedPhotoId,
                    victimPhotoPath: photoPath,
                  };
                  console.log('👤 Extracted primary victim:', victimInfo.victimName);
                }
              } else if (participant.role === 'OFFENDER') {
                // Extract document ID from photoPath if it's in format /documents/{id}
                const offenderPhotoPath = participant.citizen?.photoPath || participant.citizen?.photo;
                let extractedOffenderPhotoId = participant.citizen?.photoDocumentId || participant.citizen?.photoId || participant.photoDocumentId;
                
                if (!extractedOffenderPhotoId && offenderPhotoPath) {
                  const match = offenderPhotoPath.match(/\/documents\/(\d+)/);
                  if (match) {
                    extractedOffenderPhotoId = parseInt(match[1]);
                  }
                }

                // Collect all offenders with full details
                offendersInfo.push({
                  name: participant.citizen?.name || 'Unknown',
                  address: participant.citizen?.address,
                  phone: participant.citizen?.contactNo,
                  age: participant.citizen?.age,
                  gender: participant.citizen?.gender,
                  photoId: extractedOffenderPhotoId,
                  photoPath: offenderPhotoPath,
                });
                console.log(`✅ Added offender ${offendersInfo.length}:`, participant.citizen?.name, 'photoId:', extractedOffenderPhotoId);
                
                // First offender is the primary offender for backward compatibility
                if (!offenderInfo.offenderName) {
                  offenderInfo = {
                    offenderName: participant.citizen?.name || caseWithDetails.offenderName,
                    offenderAddress: participant.citizen?.address || caseWithDetails.offenderAddress,
                    offenderPhone: participant.citizen?.contactNo || caseWithDetails.offenderPhone,
                    offenderAge: participant.citizen?.age || caseWithDetails.offenderAge,
                    offenderGender: participant.citizen?.gender || caseWithDetails.offenderGender,
                    offenderPhotoId: extractedOffenderPhotoId,
                    offenderPhotoPath: offenderPhotoPath,
                  };
                  console.log('👤 Extracted primary offender:', offenderInfo.offenderName);
                }
              } else if (participant.role === 'WITNESS') {
                // Extract document ID from photoPath if it's in format /documents/{id}
                const witnessPhotoPath = participant.citizen?.photoPath || participant.citizen?.photo;
                let witnessPhotoId = participant.citizen?.photoDocumentId || participant.citizen?.photoId || participant.photoDocumentId;
                
                if (!witnessPhotoId && witnessPhotoPath) {
                  const match = witnessPhotoPath.match(/\/documents\/(\d+)/);
                  if (match) {
                    witnessPhotoId = parseInt(match[1]);
                  }
                }

                witnessesInfo.push({
                  name: participant.citizen?.name,
                  phone: participant.citizen?.contactNo,
                  address: participant.citizen?.address,
                  age: participant.citizen?.age,
                  gender: participant.citizen?.gender,
                  description: participant.citizen?.profession || '',
                  photoId: witnessPhotoId,
                  photoPath: witnessPhotoPath,
                });
              }
            });
          }

          // Merge all statement data
          caseWithDetails = {
            ...caseWithDetails,
            ...statementData,
            ...victimInfo,
            ...offenderInfo,
            complainants: complainantsInfo.length > 0 ? complainantsInfo : undefined,
            offenders: offendersInfo.length > 0 ? offendersInfo : undefined,
            witnesses: witnessesInfo.length > 0 ? witnessesInfo : caseWithDetails.witnesses,
          };
          
          console.log('✅ Merged case details with', complainantsInfo.length, 'complainants,', offendersInfo.length, 'offenders, and', witnessesInfo.length, 'witnesses');
        } catch (statementError) {
          console.warn('⚠️ Could not fetch statement details:', statementError);
        }
      }

      // Fetch FIR details for additional information
      try {
        console.log('📦 Fetching FIR details...');
        const firResponse = await request('complaintandfir', 'GET', `/statements/${foundCase.complaintId}/fir-details`, {});
        const firData = firResponse?.data || firResponse;
        
        console.log('✅ FIR data:', firData);
        
        caseWithDetails = {
          ...caseWithDetails,
          ...firData,
          firRegisteredDate: firData?.registeredOn || firData?.registeredDate || foundCase.created_on,
        };
      } catch (firError) {
        console.warn('⚠️ Could not fetch FIR details:', firError);
      }

      // Log all available fields for debugging
      console.log('✅ Final case details:', caseWithDetails);
      console.log('📸 Victim Photo Path:', caseWithDetails.victimPhotoPath);
      console.log('📸 Offender Photo Path:', caseWithDetails.offenderPhotoPath);
      console.log('👥 Witnesses:', caseWithDetails.witnesses);
      console.log('👤 Victim Name:', caseWithDetails.victimName);
      console.log('👤 Offender Name:', caseWithDetails.offenderName);
      console.log('📋 All fields:', Object.keys(caseWithDetails));
      
      setCaseDetail(caseWithDetails);
    } catch (err: any) {
      console.error('Error fetching case details:', err);
      setError(err.message || 'Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout handleLogout={() => {}}>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading case details...</div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !caseDetail) {
    return (
      <DefaultLayout handleLogout={() => {}}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error || 'Case not found'}</div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout handleLogout={() => {}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black dark:text-white">Case Details</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {/* FIR Information Card */}
        <div className="rounded-sm border border-stroke bg-white px-6 py-5 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">FIR Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">FIR Number</p>
              <p className="text-black dark:text-white font-semibold">{caseDetail.firNo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registered Date</p>
              <p className="text-black dark:text-white">
                {caseDetail.firRegisteredDate ? formatDate(caseDetail.firRegisteredDate) : formatDate(caseDetail.created_on)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Case Status</p>
              <p className="text-black dark:text-white capitalize">{caseDetail.caseStatus || 'N/A'}</p>
            </div>
          </div>
          {caseDetail.firDescription && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">FIR Description</p>
              <p className="text-black dark:text-white whitespace-pre-wrap">{caseDetail.firDescription}</p>
            </div>
          )}
        </div>

        {/* Complainee (Victim) Information Card */}
        <div className="rounded-sm border border-stroke bg-white px-6 py-5 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Complainee (Victim) Information {caseDetail.complainants && caseDetail.complainants.length > 1 && `(${caseDetail.complainants.length})`}
          </h2>
          
          {caseDetail.complainants && caseDetail.complainants.length > 0 ? (
            <div className="space-y-6">
              {caseDetail.complainants.map((complainant: any, index: number) => (
                <div key={index} className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${index > 0 ? 'pt-6 border-t border-stroke dark:border-strokedark' : ''}`}>
                  {/* Photo */}
                  <div className="flex flex-col items-center">
                    {complainant.photoId ? (
                      <div key={`complainant-photo-${complainant.photoId}-${index}`}>
                        <SignedImage
                          documentId={complainant.photoId}
                          alt={complainant.name}
                          className="w-32 h-40 object-cover rounded border-2 border-gray-300 mb-3"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-40 bg-gray-200 dark:bg-gray-700 rounded border-2 border-gray-300 flex items-center justify-center mb-3">
                        <span className="text-gray-600 dark:text-gray-400">No Photo</span>
                      </div>
                    )}
                    {index > 0 && <span className="text-xs text-gray-500">Co-Complainant {index}</span>}
                  </div>
                  {/* Details */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</p>
                      <p className="text-black dark:text-white font-semibold">{complainant.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {complainant.age && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Age</p>
                          <p className="text-black dark:text-white">{complainant.age}</p>
                        </div>
                      )}
                      {complainant.gender && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</p>
                          <p className="text-black dark:text-white">{complainant.gender}</p>
                        </div>
                      )}
                    </div>
                    {complainant.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-black dark:text-white">{complainant.phone}</p>
                      </div>
                    )}
                    {complainant.email && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-black dark:text-white">{complainant.email}</p>
                      </div>
                    )}
                    {complainant.address && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</p>
                        <p className="text-black dark:text-white">{complainant.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No complainant information available</p>
          )}
        </div>

        {/* Offender Information Card */}
        <div className="rounded-sm border border-stroke bg-white px-6 py-5 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Offender Information {caseDetail.offenders && caseDetail.offenders.length > 1 && `(${caseDetail.offenders.length})`}
          </h2>
          
          {caseDetail.offenders && caseDetail.offenders.length > 0 ? (
            <div className="space-y-6">
              {caseDetail.offenders.map((offender: any, index: number) => (
                <div key={index} className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${index > 0 ? 'pt-6 border-t border-stroke dark:border-strokedark' : ''}`}>
                  {/* Photo */}
                  <div className="flex flex-col items-center">
                    {offender.photoId ? (
                      <div key={`offender-photo-${offender.photoId}-${index}`}>
                        <SignedImage
                          documentId={offender.photoId}
                          alt={offender.name}
                          className="w-32 h-40 object-cover rounded border-2 border-gray-300 mb-3"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-40 bg-gray-200 dark:bg-gray-700 rounded border-2 border-gray-300 flex items-center justify-center mb-3">
                        <span className="text-gray-600 dark:text-gray-400">No Photo</span>
                      </div>
                    )}
                    {index > 0 && <span className="text-xs text-gray-500">Co-Offender {index}</span>}
                  </div>
                  {/* Details */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</p>
                      <p className="text-black dark:text-white font-semibold">{offender.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {offender.age && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Age</p>
                          <p className="text-black dark:text-white">{offender.age}</p>
                        </div>
                      )}
                      {offender.gender && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</p>
                          <p className="text-black dark:text-white">{offender.gender}</p>
                        </div>
                      )}
                    </div>
                    {offender.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-black dark:text-white">{offender.phone}</p>
                      </div>
                    )}
                    {offender.address && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</p>
                        <p className="text-black dark:text-white">{offender.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No offender information available</p>
          )}
        </div>

        {/* Witnesses Section - Below Offender */}
        {caseDetail.witnesses && caseDetail.witnesses.length > 0 && (
          <div className="rounded-sm border border-stroke bg-white px-6 py-5 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">Witnesses</h2>
            <div className="space-y-6">
              {caseDetail.witnesses.map((witness: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                  {/* Photo */}
                  <div className="flex flex-col items-center">
                    {witness.photoId ? (
                      <SignedImage
                        documentId={witness.photoId}
                        alt={witness.name || `Witness ${index + 1}`}
                        className="w-32 h-40 object-cover rounded border-2 border-gray-300 mb-3"
                      />
                    ) : (
                      <div className="w-32 h-40 bg-gray-200 dark:bg-gray-700 rounded border-2 border-gray-300 flex items-center justify-center mb-3">
                        <span className="text-gray-600 dark:text-gray-400">No Photo</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</p>
                      <p className="text-black dark:text-white font-semibold">{witness.name || witness.witnessName || `Witness ${index + 1}`}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {witness.age && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Age</p>
                          <p className="text-black dark:text-white">{witness.age}</p>
                        </div>
                      )}
                      {witness.gender && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</p>
                          <p className="text-black dark:text-white">{witness.gender}</p>
                        </div>
                      )}
                    </div>
                    {witness.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-black dark:text-white">{witness.phone}</p>
                      </div>
                    )}
                    {witness.address && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</p>
                        <p className="text-black dark:text-white">{witness.address}</p>
                      </div>
                    )}
                    {witness.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Details</p>
                        <p className="text-black dark:text-white">{witness.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crime Details Card */}
        <div className="rounded-sm border border-stroke bg-white px-6 py-5 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">Crime Details</h2>
          <div className="space-y-3">
            {caseDetail.crimeType && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Crime Type</p>
                <p className="text-black dark:text-white">{caseDetail.crimeType}</p>
              </div>
            )}
            {caseDetail.crimeDate && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Crime Date</p>
                <p className="text-black dark:text-white">{formatDate(caseDetail.crimeDate)}</p>
              </div>
            )}
            {caseDetail.location && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                <p className="text-black dark:text-white">{caseDetail.location}</p>
              </div>
            )}
            {(caseDetail.crimeDescription || caseDetail.description) && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Crime Description</p>
                {renderDescription(caseDetail.crimeDescription || caseDetail.description, 'crimeDescription', 500)}
              </div>
            )}
            {caseDetail.shortDescription && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Short Description</p>
                {renderDescription(caseDetail.shortDescription, 'shortDescription', 500)}
              </div>
            )}
          </div>
        </div>

        {/* Evidence Section */}
        {caseDetail.evidence && caseDetail.evidence.length > 0 && (
          <div className="rounded-sm border border-stroke bg-white px-6 py-5 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">Evidence</h2>
            <div className="space-y-4">
              {caseDetail.evidence.map((item: any, index: number) => (
                <div key={item.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold text-black dark:text-white mb-2">{item.evidenceName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Type</p>
                      <p className="text-black dark:text-white">{item.evidenceType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Location Found</p>
                      <p className="text-black dark:text-white">{item.locationFound}</p>
                    </div>
                  </div>
                  {item.description && (
                    <div className="mt-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Description</p>
                      <p className="text-black dark:text-white text-sm">{item.description}</p>
                    </div>
                  )}
                  
                  {/* Evidence Documents/Photos */}
                  {item.documents && item.documents.length > 0 && (
                    <div className="mt-3">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Documents</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {item.documents.map((doc: any, docIndex: number) => (
                          <div key={docIndex} className="relative group">
                            {doc.documentPath && (
                              <>
                                {doc.documentId && doc.documentPath.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                  <SignedImage
                                    documentId={doc.documentId}
                                    alt={doc.documentName || `Document ${docIndex + 1}`}
                                    className="w-full h-32 object-cover rounded border border-gray-300 hover:border-blue-500 cursor-pointer"
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 flex items-center justify-center">
                                    <span className="text-xs text-gray-600 dark:text-gray-400 text-center p-2">
                                      {doc.documentName || 'Document'}
                                    </span>
                                  </div>
                                )}
                                {doc.documentId && (
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                      onClick={async () => {
                                        const url = await getSignedUrl(doc.documentId, `doc-view-${doc.documentId}`);
                                        if (url) window.open(url, '_blank');
                                      }}
                                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                    >
                                      View
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Actions */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => navigate(`/casediarypreview/${caseDetail.firNo}`)}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Case Diary
          </button>
          <button
            onClick={() => navigate(`/register-statement/${caseDetail.complaintId}`, { state: { caseData: caseDetail, isEdit: true, viewMode: true } })}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Edit Statement
          </button>
          <button
            onClick={() => {
              // Transform caseDetail to match NC page expectations
              // Extract all complainants and offenders from participants if available
              let allComplainants: string[] = [];
              let allOffenders: string[] = [];
              
              if (caseDetail.participants && Array.isArray(caseDetail.participants)) {
                allComplainants = caseDetail.participants
                  .filter((p: any) => p.role === 'COMPLAINANT' || p.role === 'CO_COMPLAINANT')
                  .map((p: any) => p.citizen?.name || p.name || 'Unknown')
                  .filter((name: string) => name !== 'Unknown');
                
                allOffenders = caseDetail.participants
                  .filter((p: any) => p.role === 'OFFENDER')
                  .map((p: any) => p.citizen?.name || p.name || 'Unknown')
                  .filter((name: string) => name !== 'Unknown');
              }
              
              const ncData = {
                ...caseDetail,
                complainants: allComplainants.length > 0 ? allComplainants : (caseDetail.victimName ? [caseDetail.victimName] : []),
                offenders: allOffenders.length > 0 ? allOffenders : (caseDetail.offenderName ? [caseDetail.offenderName] : []),
                witnesses: caseDetail.witnesses || [],
                stationNumber: '1', // Default station number
              };
              navigate(`/Ncpage`, { state: { caseData: ncData, isEdit: false, viewMode: true } });
            }}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            View NC
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ViewCase;
