import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import CoverOne from '../images/cover/police-banner.png';
import { useEffect, useState } from 'react';
import request from '../Service/axios_helper';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
interface Officer {
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
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [passportFileUrl, setPassportFileUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  const { contact, email } = t('profile');

  useEffect(() => {
    const fetchOfficerDetails = async () => {
      const officerEmail = localStorage.getItem("officerEmail");
      if (officerEmail) {
        try {
          const response = await request('cms', 'GET', `/getSingleOfficer/${officerEmail}`, {});
          setOfficer(response);
        } catch (error) {
          console.error('Error fetching officer details:', error);
        }
      }
    };

    fetchOfficerDetails();
  }, []);

  useEffect(() => {
    const fetchPassportFile = async (fileMetadata: { filePath: string }) => {
      try {
        const sanitizedFilePath = encodeURIComponent(fileMetadata.filePath.replace(/\\/g, '/'));
        const path = `${imagekey}?filePath=${sanitizedFilePath}`;
        
        const response = await axios({
          url: path,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          method: 'GET',
          responseType: 'blob',
        });

        const url = URL.createObjectURL(response.data);
        setPassportFileUrl(url);
      } catch (error) {
        console.error('Error fetching passport file:', error);
      }
    };

    if (officer?.passportFile?.fileId) {
      fetchPassportFile(officer.passportFile);
    }
  }, [officer]);

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
              <img
                src={passportFileUrl || ''}
                alt={officer.passportFile?.fileName || 'profile-photo'}
                className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3 object-cover"
              />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {officer.officerName}
            </h3>
            <p className="font-medium">{officer.officerPost}</p>
            <div className="mx-auto mt-4.5 mb-5.5 grid grid-cols-2 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  {email} -
                </span>
                <span className="text-sm">{officer.officerEmail}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  {contact} -
                </span>
                <span className="text-sm">{officer.officerMobileNo}</span>
              </div>
            </div>

            <div className="mx-auto max-w-180">
              <h4 className="font-semibold text-black dark:text-white">
                {officer.officerStation}
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
