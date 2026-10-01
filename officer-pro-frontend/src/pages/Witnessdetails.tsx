import { useEffect, useState } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import request from '../Service/axios_helper';
import { useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

type WitnessdetailsProps = {
  handleLogout: () => void;
};

const Witnessdetails: React.FC<WitnessdetailsProps> = ({ handleLogout }) => {
  const imagekey = import.meta.env.VITE_IMAGE_API;

  const { witnessId } = useParams();
  const [witness, setWitness] = useState(null);
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imagesLoaded, setImagesLoaded] = useState({
    aadharFile: false,
    panFile: false,
    passportFile: false,
  });
  const [citizens, setCitizens] = useState([]);
  const [selectedCitizen, setSelectedCitizen] = useState('');
  const fileKeyMap = {
    aadharFile: 'aadhar',
    panFile: 'pan',
    passportFile: 'passport',
  };
  const { t } = useTranslation();
  const {
    witnesstype,
    choosetype,
    witnes,
    eyewitness,
    name,
    age,
    address,
    email,
    gender,
    choosegender,
    male,
    female,
    other,
    contact,
    profession,
    citizen,
    selectcitizen,
    citizenid,
  } = t('profileedit');
  const { witnessdetails } = t('breadcrumb');

  useEffect(() => {
    fetchWitness();
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const response = await request(
        'complaintandfir',
        'GET',
        '/citizens/role/witness',
        {},
      );
      if (response) {
        setCitizens(response);
      }
    } catch (error) {
      console.error('Error fetching citizens:', error);
    }
  };

  const fetchWitness = async () => {
    try {
      const response = await request(
        'complaintandfir',
        'GET',
        `/singleWitness/${witnessId}`,
        {},
      );
      console.log(response);
      if (response) {
        setWitness(response);
        setFormState(response);
        await fetchFiles(response);
      }
    } catch (error) {
      console.error('Error fetching Witness:', error);
    }
  };

  const fetchFiles = async (witnessData) => {
    const fileKeys = ['aadharFile', 'panFile', 'passportFile'];
    const filePromises = fileKeys.map(async (key) => {
      if (witnessData[key]) {
        const fileUrl = await fetchFileurl(witnessData[key]);
        setFileurl((prevFiles) => ({ ...prevFiles, [key]: fileUrl }));
        const file = await fetchFile(witnessData[key]);
        setFiles((prevFiles) => ({ ...prevFiles, [key]: file }));
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
    } else {
      switch (name) {
        case 'witnessEmail':
          if (
            !value ||
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ) {
            error = 'Invalid email address';
          }
          break;
        case 'witnessMobileNo':
          if (!value || !/^[\d०१२३४५६७८९]{10}$/u.test(value)) {
            error = 'Invalid mobile number, must be 10 digits';
          }
          break;
        case 'witnessAadharNo':
          if (!value || !/^[\d०१२३४५६७८९]{12}$/u.test(value)) {
            error = 'Invalid aadhar number, must be 12 digits';
          }
          break;
        case 'witnessName':
          if (
            !value ||
            !/^[\u0900-\u097F\u0041-\u005A\u0061-\u007A\s]+$/u.test(value)
          ) {
            error =
              'Invalid Name, must contain only letters, spaces, or hyphens';
          }
          break;
        case 'witnessAge':
          if (!value || !/^\d+$/.test(value) || Number(value) <= 0) {
            error = 'Age must be a positive number';
          }
          break;
        default:
          break;
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleFileChange = (e) => {
    const fileInputName = e.target.name;
    const file = e.target.files[0];
    const originalFileName = file.name;

    const witnessFileType = fileInputName.split('F')[0];
    const newFileName = `${witness?.witnessName}_${witnessFileType}_${originalFileName}`;
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
      formData.append('witnessDto', JSON.stringify(formState));

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
        'complaintandfir',
        'PUT',
        `/updateWitness/${witnessId}`,
        formData,
      );
      console.log(response);
      if (response) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Your Witness has been updated successfully!',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      } else {
        throw new Error('Failed to update witness data');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...not edited',
        text: 'Something went wrong! Please try again later.',
      });
    }
  };

  const editWitnessClick = () => {
    setIsEditing(true);
  };

  if (!witness) {
    return <Loader />;
  }

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={witnessdetails} />
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {witnesstype} :
              </label>
              {isEditing ? (
                <select
                  id="witnessType"
                  name="witnessType"
                  value={formState.witnessType || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>
                    {choosetype}
                  </option>
                  <option value="witness">{witnes}</option>
                  <option value="eyeWitness">{eyewitness}</option>
                </select>
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.witnessType}
                </div>
              )}
            </div>
            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {name} :
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="witnessName"
                  value={formState.witnessName || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.witnessName}
                </div>
              )}
              {errors.witnessName && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops!</span>{' '}
                  {errors.witnessName}
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
                  name="witnessAge"
                  value={formState.witnessAge || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.witnessAge}
                </div>
              )}
              {errors.witnessAge && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops!</span> {errors.witnessAge}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {gender} :
              </label>
              {isEditing ? (
                <select
                  id="witnessGender"
                  name="witnessGender"
                  value={formState.witnessGender || ''}
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
                  {witness.witnessGender}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {email} :
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="witnessEmail"
                  value={formState.witnessEmail || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.witnessEmail}
                </div>
              )}
              {errors.witnessEmail && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops!</span>{' '}
                  {errors.witnessEmail}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {contact} :
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="witnessMobileNo"
                  value={formState.witnessMobileNo || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.witnessMobileNo}
                </div>
              )}
              {errors.witnessMobileNo && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops!</span>{' '}
                  {errors.witnessMobileNo}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {address} :
              </label>
              {isEditing ? (
                <textarea
                  name="witnessAddress"
                  value={formState.witnessAddress || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.witnessAddress}
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
                  name="witnessProfession"
                  value={formState.witnessProfession || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.witnessProfession}
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
                  name="witnessAadharNo"
                  value={formState.witnessAadharNo || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.witnessAadharNo}
                </div>
              )}
              {errors.witnessAadharNo && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops!</span>{' '}
                  {errors.witnessAadharNo}
                </p>
              )}
            </div>
            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {citizen} :
              </label>
              {isEditing ? (
                <select
                  id="citizenId"
                  name="citizenId"
                  value={selectedCitizen}
                  onChange={(e) => {
                    setSelectedCitizen(e.target.value);
                    handleInputChange(e);
                  }}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>
                    {selectcitizen}
                  </option>
                  {citizens.map((citizen) => (
                    <option key={citizen.citizenId} value={citizen.citizenId}>
                      {citizen.citizenName} - {citizen.citizenEmail}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  {witness.citizenName || 'No citizen selected'}
                </div>
              )}
            </div>
            <div>
              <label className="mb-3 block font-semibold text-black dark:text-white">
                {statement} :
              </label>
              {isEditing ? (
                <textarea
                  rows={Math.max(
                    (formState.witnessStatement || '').split('\n').length,
                    4,
                  )}
                  name="witnessStatement"
                  value={formState.witnessStatement || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              ) : (
                <div
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {witness.witnessStatement}
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
                onClick={editWitnessClick}
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

export default Witnessdetails;
