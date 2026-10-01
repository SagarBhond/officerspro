import React, { SetStateAction, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import Stepper from './stepper';
import Offenderpage from './Caseforms/Offenderpage';
import Crime from './Caseforms/Crime';
import Complainee from './Caseforms/Complainee';
import Previewstatement from './Caseforms/Previewstatement';
import request from '../Service/axios_helper';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../common/Loader';
import { useTranslation } from 'react-i18next';

type RegisterstatementProps = {
  handleLogout: () => void;
};

const Registerstatement: React.FC<RegisterstatementProps> = ({
  handleLogout,
}) => {
  const imagekey = import.meta.env.VITE_IMAGE_API;
  const { victimId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [offenderList, setOffenderList] = useState([{}]);
  const [complainee, setComplainee] = useState({});
  const [crimeData, setCrimeData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const [victimAadhar, setVictimAadhar] = useState();
  const [victimPan, setVictimPan] = useState();
  const [victimPassport, setVictimPassport] = useState();
  const [offenderAadhar, setOffenderAadhar] = useState([]);
  const [offenderPan, setOffenderPan] = useState([]);
  const [offenderPassport, setOffenderPassport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [officer, setOfficer] = useState({});
  const { t } = useTranslation();
  const { viewstatement, submit } = t('registerstatement');

  const fetchOfficerDetails = async () => {
    let officerEmail = localStorage.getItem('officerEmail');
    const response = await request(
      'cms',
      'GET',
      `/getSingleOfficer/${officerEmail}`,
      {},
    );
    setOfficer(response);
  };

  useEffect(() => {
    fetchOfficerDetails();
    if (victimId) {
      const fetchVictimDetails = async () => {
        try {
          const response = await request(
            'cms',
            'GET',
            `/fetchVictimDto/${victimId}`,
            {},
          );
          const victimData = response;
          console.log(victimData);

          if (victimData && victimData.offenderList) {
            setComplainee(victimData);
            setOffenderList(victimData.offenderList);
            setCrimeData(victimData.crimesDetails || {});

            // Fetch files using a helper function
            setVictimAadhar(await fetchFile(victimData.aadharFile));
            setVictimPan(await fetchFile(victimData.panFile));
            setVictimPassport(await fetchFile(victimData.passportFile));

            const offenderAadharFiles = await Promise.all(
              victimData.offenderList.map((offender) =>
                fetchFile(offender.aadharFile),
              ),
            );
            const offenderPanFiles = await Promise.all(
              victimData.offenderList.map((offender) =>
                fetchFile(offender.panFile),
              ),
            );
            const offenderPassportFiles = await Promise.all(
              victimData.offenderList.map((offender) =>
                fetchFile(offender.passportFile),
              ),
            );

            setOffenderAadhar(offenderAadharFiles.filter(Boolean));
            setOffenderPan(offenderPanFiles.filter(Boolean));
            setOffenderPassport(offenderPassportFiles.filter(Boolean));
          } else {
            console.log('victimData not found');
          }
        } catch (error) {
          console.error('Error fetching victim details:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchVictimDetails();
    } else {
      console.log('victim id is not present...');
    }
  }, [victimId]);

  const [fileURL, setFileURL] = useState(null);

  // Helper function to fetch a file and convert to File object
  const fetchFile = async (fileMetadata) => {
    if (!fileMetadata) return null;
    try {
      const sanitizedFilePath = encodeURIComponent(
        fileMetadata.filePath.replace(/\\/g, '/'),
      );
      const path = `${imagekey}?filePath=${sanitizedFilePath}`;
      const response = await axios({
        url: path,
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
      const url = URL.createObjectURL(file);
      setFileURL(url);
      console.log(url);
      console.log(response);
      return file;
    } catch (error) {
      console.error(`Error fetching file: ${fileMetadata.fileName}`, error);
      return null;
    }
  };

  const handleFileChange = (
    event: { target: { name: any; files: any[] } },
    index: string | number,
  ) => {
    const fileInputName = event.target.name;
    const file = event.target.files[0];
    if (!file) return;
    const originalFileName = file.name;

    let updatedFile: SetStateAction<undefined> | File;

    if (fileInputName.startsWith('victim')) {
      const victimFileType = fileInputName.split('_')[1]; // Extract the file type from the input name
      const newFileName = `${complainee?.victimName}_${victimFileType}_${originalFileName}`;
      updatedFile = new File([file], newFileName, { type: file.type });
      console.log(updatedFile);
      // Update victim file state based on the file type
      switch (victimFileType) {
        case 'aadhar':
          setVictimAadhar(updatedFile);
          break;
        case 'pan':
          setVictimPan(updatedFile);
          break;
        case 'passport':
          setVictimPassport(updatedFile);
          break;
        default:
          break;
      }
    } else if (fileInputName.startsWith('offender')) {
      const offenderFileType = fileInputName.split('_')[1]; // Extract the file type from the input name
      const newFileName = `${offenderList[index]?.offenderName}_${offenderFileType}_${originalFileName}`;
      console.log(newFileName);
      updatedFile = new File([file], newFileName, { type: file.type });
      console.log(updatedFile);

      switch (offenderFileType) {
        case 'aadhar':
          setOffenderAadhar((prevFiles) => {
            const updatedFiles = [...prevFiles]; // Make a shallow copy of the previous state
            updatedFiles[index] = updatedFile; // Update the file at the correct index
            return updatedFiles;
          });
          break;
        case 'pan':
          setOffenderPan((prevFiles) => {
            const updatedFiles = [...prevFiles]; // Make a shallow copy of the previous state
            updatedFiles[index] = updatedFile; // Update the file at the correct index
            return updatedFiles;
          });
          break;
        case 'passport':
          setOffenderPassport((prevFiles) => {
            const updatedFiles = [...prevFiles]; // Make a shallow copy of the previous state
            updatedFiles[index] = updatedFile; // Update the file at the correct index
            return updatedFiles;
          });
          break;
        default:
          break;
      }
    }
  };

  const NUMBER_OF_STEPS = 4;

  const goToNextStep = () =>
    setCurrentStep((prev) => (prev === NUMBER_OF_STEPS - 1 ? prev : prev + 1));
  const goToPreviousStep = () =>
    setCurrentStep((prev) => (prev <= 0 ? prev : prev - 1));

  const handleAddOffender = () => {
    setOffenderList([...offenderList, {}]);
  };

  const handleOffenderChange = (index: number, updatedOffender: any) => {
    const updatedList = offenderList.map((offender, i) =>
      i === index ? updatedOffender : offender,
    );
    setOffenderList(updatedList);
  };

  const handleComplaineeChange = (updatedComplainee: any) => {
    setComplainee(updatedComplainee);
  };

  const handleCrimeChange = (updatedCrimeData: any) => {
    setCrimeData(updatedCrimeData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if victimId is present
    if (victimId) {
      // Construct victimDto JSON string
      const updatedData = {
        ...complainee,
        offenderList: offenderList,
        crimesDetails: crimeData,
      };
      console.log('Data : ', updatedData);

      // Create FormData object to hold data
      const formData = new FormData();
      formData.append('victimDto', JSON.stringify(updatedData));
      formData.append('officerId', officer.officerId);

      // Appending victim files
      if (victimAadhar) {
        formData.append('victimFiles', victimAadhar);
      }
      if (victimPan) {
        formData.append('victimFiles', victimPan);
      }
      if (victimPassport) {
        formData.append('victimFiles', victimPassport);
      }

      // Appending offender file
      console.log(offenderAadhar);
      if (offenderAadhar) {
        offenderAadhar.forEach((file) => {
          formData.append('offenderFiles', file);
        });
      }
      if (offenderPan) {
        offenderPan.forEach((file) => {
          formData.append('offenderFiles', file);
        });
      }
      if (offenderPassport) {
        offenderPassport.forEach((file) => {
          formData.append('offenderFiles', file);
        });
      }
      console.log(formData);
      try {
        const response = await request(
          'cms',
          'PUT',
          `/updateStatement/${victimId}`,
          formData,
        );
        if (response?.victimName) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Your statement has been updated successfully!',
          });
          navigate(`/${location.state.from}`);
        } else {
          throw new Error('Failed to update victim data');
        }
      } catch (error) {
        console.error('Update error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...not edited',
          text: 'Something went wrong! Please try again later.',
        });
      }
    } else {
      const updatedData = {
        ...complainee,
        offenderList: offenderList,
        crimesDetails: crimeData,
      };
      console.log('Data : ', updatedData);
      const formdata = new FormData();
      formdata.append('officerId', officer.officerId);
      formdata.append('victimDto', JSON.stringify(updatedData));
      formdata.append('victim', victimAadhar);
      formdata.append('victim', victimPan);
      formdata.append('victim', victimPassport);

      offenderAadhar.forEach((file) => {
        formdata.append('offender', file);
      });

      offenderPan.forEach((file) => {
        formdata.append('offender', file);
      });

      offenderPassport.forEach((file) => {
        formdata.append('offender', file);
      });

      try {
        const response = await request('cms', 'POST', '/report', formdata);
        console.log('Response : ', response);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Your statement has been submitted successfully!',
        });
        navigate('/allstatements');
      } catch (error) {
        console.error('Submission error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again later.',
        });
      }
    }
  };

  const removeFile = (fileType, index) => {
    switch (fileType) {
      case 'victim_aadhar':
        setVictimAadhar(null);
        break;
      case 'victim_pan':
        setVictimPan(null);
        break;
      case 'victim_passport':
        setVictimPassport(null);
        break;
      // case 'offender_aadhar':
      //   setOffenderAadhar((prevFiles) =>
      //     prevFiles.filter((file, i) => i !== index),
      //   );
      //   break;
      // case 'offender_pan':
      //   setOffenderPan((prevFiles) =>
      //     prevFiles.filter((file, i) => i !== index),
      //   );
      //   break;
      // case 'offender_passport':
      //   setOffenderPassport((prevFiles) =>
      //     prevFiles.filter((file, i) => i !== index),
      //   );
      //   break;
      case 'offender_aadhar':
        setOffenderAadhar((prevFiles) => {
          const updatedFiles = [...prevFiles]; // Make a shallow copy of the array
          updatedFiles[index] = null; // Set the specific file to null instead of removing
          return updatedFiles; // Return the updated array
        });
        break;
      case 'offender_pan':
        setOffenderPan((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = null;
          return updatedFiles;
        });
        break;
      case 'offender_passport':
        setOffenderPassport((prevFiles) => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = null;
          return updatedFiles;
        });
        break;
      default:
        break;
    }
  };

  const removeOffender = (index) => {
    const updatedList = [...offenderList];
    updatedList.splice(index, 1);
    setOffenderList(updatedList);
  };

  if (isLoading && victimId) return <Loader />;

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb
        pageName={
          victimId
            ? t('registerstatement.edit')
            : t('registerstatement.register')
        }
      />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mx-13">
        <div className="step flex justify-between p-3">
          <h4 className="w-screen">
            Step {currentStep + 1} of {NUMBER_OF_STEPS}
          </h4>
          <div className="backnext flex space-x-2 w-screen justify-end">
            <button onClick={goToPreviousStep} className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 12H5M12 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="stepper flex">
              <Stepper
                currentStep={currentStep}
                numberOfSteps={NUMBER_OF_STEPS}
              />
            </div>
            <button onClick={goToNextStep}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
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
            <Complainee
              complainee={complainee}
              victimAadhar={victimAadhar}
              victimPan={victimPan}
              victimPassport={victimPassport}
              handleComplaineeChange={handleComplaineeChange}
              handleFileChange={handleFileChange}
              removeFile={removeFile}
            />
          )}
          {currentStep === 1 && (
            <Offenderpage
              offenderList={offenderList}
              handleAddOffender={handleAddOffender}
              handleOffenderChange={handleOffenderChange}
              handleFileChange={handleFileChange}
              offenderAadhar={offenderAadhar}
              offenderPan={offenderPan}
              offenderPassport={offenderPassport}
              removeFile={removeFile}
              removeOffender={removeOffender}
            />
          )}
          {currentStep === 2 && (
            <Crime
              crimeData={crimeData}
              handleCrimeChange={handleCrimeChange}
            />
          )}
          {currentStep === 3 && (
            <Previewstatement
              complainee={complainee}
              offenderList={offenderList}
              crimeData={crimeData}
            />
          )}

          <div className="Submitbtn flex justify-end">
            {currentStep === 2 && (
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
            {currentStep === 2 && (
              <button
                type="submit"
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                  {submit}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default Registerstatement;
