import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import CoverOne from '../images/cover/police-banner.png';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
interface Officer {
  firstName: string;
  lastName: string;
  officerName: string;
  officerPost: string;
  officerEmail: string;
  officerMobileNo: string;
  officerStation: string;
  passportFile?: {
    fileId: string;
    fileName: string;
    filePath: string;
  };
}

type ProfileProps = {
  handleLogout: () => void;
};

const Profile: React.FC<ProfileProps> = ({ handleLogout }) => {
  const imagekey = import.meta.env.VITE_IMAGE_API;
  const profileApiUrl = import.meta.env.VITE_PROFILE_API || 'http://localhost:8084/api/profile';
  const documentApiUrl = 'http://localhost:8085/api/documents';
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [passportFileUrl, setPassportFileUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOfficer, setEditedOfficer] = useState<Officer | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  const { contact, email } = t('profile');

  useEffect(() => {
    const fetchOfficerProfile = async () => {
      try {
        // First try to get from localStorage (already fetched during login)
        const officerProfileStr = localStorage.getItem('officerProfile');
        
        if (officerProfileStr) {
          const profileData = JSON.parse(officerProfileStr);
          console.log('✅ Loaded officer profile from localStorage:', profileData);
          
          // Map to Officer interface - use actual field names from Profile Service
          const mappedOfficer: Officer = {
            firstName: profileData.firstName || profileData.officerName?.split(' ')[0] || '',
            lastName: profileData.lastName || profileData.officerName?.split(' ').slice(1).join(' ') || '',
            officerName: profileData.officerName || '',
            officerPost: profileData.officerPost || 'Police Officer',
            officerEmail: profileData.officerEmail || localStorage.getItem('officerEmail') || '',
            officerMobileNo: profileData.officerMobileNo || 'N/A',
            officerStation: profileData.officerStation || 'Police Station',
          };
          
          console.log('📋 Mapped officer data:', mappedOfficer);
          setOfficer(mappedOfficer);
          
          // Fetch profile photo if passportDocumentId exists
          if (profileData.passportDocumentId) {
            fetchProfilePhoto(profileData.passportDocumentId);
          }
          
          return;
        }

        // If not in localStorage, fetch from API
        const email = localStorage.getItem('officerEmail');
        if (!email) {
          console.error('❌ No officer email found in localStorage');
          loadFromLocalStorageFallback();
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(
          `${profileApiUrl}/officers/email/${encodeURIComponent(email)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const profileData = await response.json();
          console.log('✅ Fetched officer profile from API:', profileData);
          
          // Store in localStorage for future use
          localStorage.setItem('officerProfile', JSON.stringify(profileData));
          localStorage.setItem('officerId', profileData.officerId);

          // Map to Officer interface
          const mappedOfficer: Officer = {
            firstName: profileData.firstName || profileData.officerName?.split(' ')[0] || '',
            lastName: profileData.lastName || profileData.officerName?.split(' ').slice(1).join(' ') || '',
            officerName: profileData.officerName || '',
            officerPost: profileData.officerPost || 'Police Officer',
            officerEmail: profileData.officerEmail || email,
            officerMobileNo: profileData.officerMobileNo || 'N/A',
            officerStation: profileData.officerStation || 'Police Station',
          };
          
          console.log('📋 Mapped officer data:', mappedOfficer);
          setOfficer(mappedOfficer);
          
          // Fetch profile photo if passportDocumentId exists
          if (profileData.passportDocumentId) {
            fetchProfilePhoto(profileData.passportDocumentId);
          }
        } else {
          console.error('❌ Failed to fetch officer profile from API:', response.status);
          // Fallback to basic data from Keycloak
          loadFromLocalStorageFallback();
        }
      } catch (error) {
        console.error('❌ Error fetching officer profile:', error);
        // Fallback to basic data from Keycloak
        loadFromLocalStorageFallback();
      }
    };

    const fetchProfilePhoto = async (documentId: string) => {
      try {
        const token = localStorage.getItem('token');
        
        // Get signed URL from Document Service
        const response = await fetch(
          `${documentApiUrl}/${documentId}/signed-url`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Got signed URL for profile photo:', data.signedUrl);
          setProfilePhotoUrl(data.signedUrl);
        } else {
          console.warn('⚠️ Could not fetch signed URL for profile photo:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching profile photo:', error);
      }
    };

    const loadFromLocalStorageFallback = () => {
      const officerStr = localStorage.getItem('officer');
      if (officerStr) {
        const officerData = JSON.parse(officerStr);
        const name = `${officerData.firstName || ''} ${officerData.lastName || ''}`.trim() || officerData.username || 'Officer';
        const nameParts = name.split(' ');
        
        const fallbackOfficer: Officer = {
          firstName: nameParts[0] || 'Officer',
          lastName: nameParts.slice(1).join(' ') || '',
          officerName: name,
          officerPost: 'Police Officer',
          officerEmail: officerData.email || localStorage.getItem('officerEmail') || '',
          officerMobileNo: 'N/A',
          officerStation: 'Police Station'
        };
        
        console.log('📋 Using fallback officer data:', fallbackOfficer);
        setOfficer(fallbackOfficer);
      }
    };

    fetchOfficerProfile();
  }, []);

  useEffect(() => {
    const fetchPassportFile = async (fileId: string) => {
      try {
        // Use signed URL service - no download API needed!
        const { getFileObjectUrl } = await import('../services/documentService');
        const url = await getFileObjectUrl(Number(fileId));
        setPassportFileUrl(url);
      } catch (error) {
        console.error('Error fetching passport file:', error);
      }
    };

    if (officer?.passportFile?.fileId) {
      fetchPassportFile(officer.passportFile.fileId);
    }
  }, [officer]);

  const handleEdit = () => {
    setEditedOfficer({ ...officer! });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedOfficer(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedOfficer) return;

    try {
      const officerId = localStorage.getItem('officerId');
      if (!officerId) {
        alert('Officer ID not found. Please login again.');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${profileApiUrl}/officers/${officerId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            officerMobileNo: editedOfficer.officerMobileNo,
            officerPost: editedOfficer.officerPost,
            officerStation: editedOfficer.officerStation,
          }),
        }
      );

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('✅ Profile updated successfully:', updatedProfile);
        
        // Update localStorage
        localStorage.setItem('officerProfile', JSON.stringify(updatedProfile));
        
        // Update local state
        setOfficer(editedOfficer);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        console.error('❌ Failed to update profile:', response.status);
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('An error occurred while updating profile.');
    }
  };

  if (!officer) {
    return <div>Loading...</div>;
  }

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img
            src={CoverOne}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-fill"
          />
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30">
            <div className="relative drop-shadow-2">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="profile-photo"
                  className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3 object-cover"
                />
              ) : (
                <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white dark:bg-boxdark flex items-center justify-center">
                    <span className="text-4xl sm:text-6xl font-bold text-blue-600 dark:text-blue-400">
                      {officer.firstName.charAt(0).toUpperCase()}{officer.lastName ? officer.lastName.charAt(0).toUpperCase() : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {officer.officerName}
            </h3>
            <p className="font-medium">{officer.officerPost}</p>
            
            {/* Name Details */}
            <div className="mx-auto mt-4.5 mb-3 grid grid-cols-2 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  First Name:
                </span>
                <span className="text-sm">{officer.firstName}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  Last Name:
                </span>
                <span className="text-sm">{officer.lastName || 'N/A'}</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="mx-auto mb-5.5 grid grid-cols-2 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  {email}:
                </span>
                <span className="text-sm">{officer.officerEmail}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  {contact}:
                </span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedOfficer?.officerMobileNo || ''}
                    onChange={(e) => setEditedOfficer({
                      ...editedOfficer!,
                      officerMobileNo: e.target.value
                    })}
                    className="text-sm border rounded px-2 py-1 dark:bg-boxdark dark:text-white"
                  />
                ) : (
                  <span className="text-sm">{officer.officerMobileNo}</span>
                )}
              </div>
            </div>

            {/* Post and Station - Editable */}
            <div className="mx-auto mb-5.5 grid grid-cols-2 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  Post:
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOfficer?.officerPost || ''}
                    onChange={(e) => setEditedOfficer({
                      ...editedOfficer!,
                      officerPost: e.target.value
                    })}
                    className="text-sm border rounded px-2 py-1 dark:bg-boxdark dark:text-white"
                  />
                ) : (
                  <span className="text-sm">{officer.officerPost}</span>
                )}
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  Station:
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOfficer?.officerStation || ''}
                    onChange={(e) => setEditedOfficer({
                      ...editedOfficer!,
                      officerStation: e.target.value
                    })}
                    className="text-sm border rounded px-2 py-1 dark:bg-boxdark dark:text-white"
                  />
                ) : (
                  <span className="text-sm">{officer.officerStation}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 mb-4 flex gap-3 justify-center">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            <div className="mx-auto max-w-180">
              <h4 className="font-semibold text-black dark:text-white">
                Station: {officer.officerStation}
              </h4>
              <p className="mt-4.5">
                © Copyright Config Server LLP. All Rights Reserved
              </p>
              Designed by Config Server LLP
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
