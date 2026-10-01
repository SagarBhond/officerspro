import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Loader from '../common/Loader';
import Swal from 'sweetalert2';
import request from '../Service/axios_helper';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

type OffenderdetailsProps = {
  handleLogout: () => void;
};

const Offenderdetails: React.FC<OffenderdetailsProps> = ({ handleLogout }) => {
  const imagekey = import.meta.env.VITE_IMAGE_API;
  const { offenderId } = useParams();
  const navigate = useNavigate();
  const [offender, setOffender] = useState(null);
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imagesLoaded, setImagesLoaded] = useState({
    aadharFile: false,
    panFile: false,
    passportFile: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState({
    aadharFile: null,
    panFile: null,
    passportFile: null,
  });
  const [fileurl, setFileurl] = useState({
    aadharFile: null,
    panFile: null,
    passportFile: null,
  });

  const { t } = useTranslation();
  const {
    section,
    arrestedstatus,
    offenderdescription,
    name,
    age,
    address,
    selectstatus,
    arrested,
    not_arrested,
    not_accessible,
    escaped,
    gender,
    choosegender,
    male,
    female,
    other,
    profession,
    aadharno,
    edit,
    save,
  } = t('profileedit');
  const { offenderdetails } = t('breadcrumb');
  const fileKeyMap = {
    aadharFile: 'aadhar',
    panFile: 'pan',
    passportFile: 'passport',
  };

  useEffect(() => {
    fetchWitness();
  }, []);

  const fetchWitness = async () => {
    try {
      const response = await request(
        'cms',
        'GET',
        `/getSingleOffender/${offenderId}`,
        {},
      );
      console.log(response);
      if (response) {
        setOffender(response);
        setFormState(response);
        await fetchFiles(response);
      }
    } catch (error) {
      console.error('Error fetching Witness:', error);
    }
  };

  const fetchFiles = async (offenderData) => {
    const fileKeys = ['aadharFile', 'panFile', 'passportFile'];
    const filePromises = fileKeys.map(async (key) => {
      if (offenderData[key]) {
        const file = await fetchFile(offenderData[key]);
        setFiles((prevFiles) => ({ ...prevFiles, [key]: file }));
        const fileUrl = await fetchFileurl(offenderData[key]);
        setFileurl((prevFiles) => ({ ...prevFiles, [key]: fileUrl }));
        console.log(file);
      }
    });
    await Promise.all(filePromises);
  };

  const fetchFile = async (fileMetadata) => {
    if (!fileMetadata) return null;
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
      const blob = response.data;
      const file = new File([blob], fileMetadata.fileName, {
        type: `image/${fileMetadata.fileName.split('.')[1]}`,
      });
      const url = URL.createObjectURL(file);
      console.log(url);
      console.log(response);
      return file;
    } catch (error) {
      console.error(`Error fetching file: ${fileMetadata.fileName}`, error);
      return null;
    }
  };

  const fetchFileurl = async (fileMetadata) => {
    if (!fileMetadata) return null;
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
      const blob = response.data;
      const fileUrl = URL.createObjectURL(blob);
      return fileUrl;
    } catch (error) {
      console.error(`Error fetching file: ${fileMetadata.fileName}`, error);
      return null;
    }
  };

  const handleImageLoad = (fileKey) => {
    setImagesLoaded((prevState) => ({ ...prevState, [fileKey]: true }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
    validateInput(name, value);
  };

  const validateInput = (name: string, value: string) => {
    let error = '';

    if (!value.trim()) {
      // error = 'This field is required';
    } else {
      switch (name) {
        case 'offenderEmail':
          if (
            !value ||
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ) {
            error = 'Invalid email address';
          }
          break;
        case 'offenderMobileNo':
          if (!value || !/^[\d०१२३४५६७८९]{10}$/u.test(value)) {
            error = 'Invalid mobile number, must be 10 digits';
          }
          break;
        case 'offenderAadharNo':
          if (!value || !/^[\d०१२३४५६७८९]{12}$/u.test(value)) {
            error = 'Invalid Aadhar number, must be 12 digits';
          }
          break;
        case 'offenderAge':
          if (
            !value ||
            !/^[0-9०१२३४५६७८९]+$/u.test(value) ||
            parseInt(value) <= 0
          ) {
            error = 'Invalid age, must be a positive number';
          }
          break;
        case 'offenderName':
          if (
            !value ||
            !/^[\u0900-\u097F\u0041-\u005A\u0061-\u007A\s]+$/u.test(value)
          ) {
            error =
              'Invalid Name, must contain only letters, spaces, or hyphens';
          }
          break;
      }
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleFileChange = (e) => {
    const fileInputName = e.target.name;
    const file = e.target.files[0];
    const originalFileName = file.name;

    const offenderFileType = fileInputName.split('F')[0];
    const newFileName = `${offender?.offenderName}_${offenderFileType}_${originalFileName}`;
    const updatedFile = new File([file], newFileName, { type: file.type });

    setFiles((prevFiles) => ({ ...prevFiles, [fileInputName]: updatedFile }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission at the beginning

    // Check for validation errors before proceeding
    const hasErrors = Object.values(errors).some((error) => error !== '');
    if (hasErrors) {
      // Show alert for validation errors
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the highlighted errors before submitting.',
      });
      return; // Stop further execution if there are errors
    }

    try {
      const formData = new FormData();
      formData.append('offenderDto', JSON.stringify(formState));

      // Only append files if they are updated
      if (files.aadharFile) {
        formData.append('files', files.aadharFile);
      }
      if (files.panFile) {
        formData.append('files', files.panFile);
      }
      if (files.passportFile) {
        formData.append('files', files.passportFile);
      }

      const response = await request(
        'cms',
        'PUT',
        `/updateOffnderProfile/${offenderId}`,
        formData,
      );

      console.log(response);
      if (response) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Your Offender has been updated successfully!',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload(); // Reload if user confirms
          }
        });
      } else {
        throw new Error('Failed to update Offender data');
      }
    } catch (error) {
      console.error('Error updating Offender:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...not edited',
        text: 'Something went wrong! Please try again later.',
      });
    }
  };

  const editoffenderClick = () => {
    setIsEditing(true);
  };

  if (!offender) {
    return <Loader />;
  }

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={offenderdetails} />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <form onSubmit={handleFormSubmit}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-around',
            }}
          >
            {['aadharFile', 'passportFile', 'panFile'].map((fileKey) => (
              <div
                key={fileKey}
                className="h-50, w-50"
                style={{ textAlign: 'center', margin: '10px' }}
              >
                {!imagesLoaded[fileKey] && (
                  <div className="h-50 w-50">
                    <Loader fullScreen={false} />
                  </div>
                )}
                <img
                  src={fileurl[fileKey]}
                  alt={`${fileKey} File`}
                  className="h-50 w-50"
                  onLoad={() => handleImageLoad(fileKey)}
                  style={{
                    display: imagesLoaded[fileKey] ? 'block' : 'none',
                  }}
                />
                <label className="flex font-semibold justify-around m-3">
                  {/* {fileKey.toUpperCase()} */}
                  {t(fileKeyMap[fileKey])}
                </label>
                {isEditing && (
                  <input
                    type="file"
                    name={fileKey}
                    onChange={handleFileChange}
                    className="w-full cursor-pointer rounded-lg border-[1.5px] mb-4 border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {name} :
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="offenderName"
                  value={formState.offenderName || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.offenderName}
                </div>
              )}
              {errors.offenderName && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops!</span>{' '}
                  {errors.offenderName}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {age} :
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="offenderAge"
                  value={formState.offenderAge || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.offenderAge}
                </div>
              )}
              {errors.offenderAge && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops!</span>{' '}
                  {errors.offenderAge}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {gender} :
              </label>
              {isEditing ? (
                <select
                  id="offenderGender"
                  name="offenderGender"
                  value={formState.offenderGender || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>
                    {choosegender}
                  </option>
                  <option value="पुरुष">{male}</option>
                  <option value="स्त्री">{female}</option>
                  <option value="इतर">{other}</option>
                </select>
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.offenderGender}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {section} :
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="sectionId"
                  value={formState.sectionId || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.sectionId}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {arrestedstatus} :
              </label>
              {isEditing ? (
                <select
                  id="arrestedStatus"
                  name="arrestedStatus"
                  value={formState.arrestedStatus || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>
                    {selectstatus}
                  </option>
                  <option value="Arrested">{arrested}</option>
                  <option value="Not Reachable">{not_arrested}</option>
                  <option value="Escaped">{escaped}</option>
                  <option value="Not Reachable">{not_accessible}</option>
                </select>
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.arrestedStatus}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {profession} :
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="offenderProfession"
                  value={formState.offenderProfession || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.offenderProfession}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {aadharno} :
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="offenderAadharNo"
                  value={formState.offenderAadharNo || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.offenderAadharNo}
                </div>
              )}
              {errors.offenderAadharNo && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops!</span>{' '}
                  {errors.offenderAadharNo}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {address} :
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="offenderAddress"
                  value={formState.offenderAddress || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.offenderAddress}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {offenderdescription} :
              </label>
              {isEditing ? (
                <textarea
                  name="offenderDescription"
                  value={formState.offenderDescription || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {offender.offenderDescription}
                </div>
              )}
            </div>
          </div>
          {isEditing && (
            <button
              type="submit"
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                {save}
              </span>
            </button>
          )}
          <div className=" flex justify-end">
            {!isEditing && (
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
                type="button"
                onClick={editoffenderClick}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                  {edit}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default Offenderdetails;
