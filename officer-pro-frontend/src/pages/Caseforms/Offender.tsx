import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PhotoUpload from '../../components/PhotoUpload';

interface OffenderProps {
  index: number;
  offender: any;
  handleOffenderChange: (index: number, updatedOffender: any) => void;
  handleFileChange: (fileType: string, file: File | null, offenderIndex?: number) => void;
  offenderAadhar?: (File | null)[];
  offenderPan?: (File | null)[];
  offenderPassport?: (File | null)[];
  removeFile: (fileType: string, index: number) => void;
  removeOffender: (index: number) => void;
}

const Offender: React.FC<OffenderProps> = ({
  index,
  offender,
  handleOffenderChange,
  handleFileChange,
  offenderAadhar = [],
  offenderPan = [],
  offenderPassport = [],
  removeFile,
  removeOffender,
}) => {
  // Initialize formData with proper defaults and handle null/undefined values
  const getInitialFormData = (offenderData?: any) => {
    // Helper function to handle empty strings, '0', and 'Not Specified' values
    const getValue = (value: any) => {
      if (value === undefined || value === null || value === '0' || value === 'Not Specified' || value === '') {
        return '';
      }
      return value;
    };

    const result = {
      offenderName: getValue(offenderData?.offenderName),
      offenderEmail: getValue(offenderData?.offenderEmail),
      offenderMobileNo: getValue(offenderData?.offenderMobileNo),
      offenderAddress: getValue(offenderData?.offenderAddress),
      offenderAadharNo: getValue(offenderData?.offenderAadharNo),
      offenderGender: getValue(offenderData?.offenderGender),
      offenderProfession: getValue(offenderData?.offenderProfession),
      offenderAge: offenderData?.offenderAge && offenderData.offenderAge !== '0' ? offenderData.offenderAge.toString() : '',
    };

    return result;
  };

  const [formData, setFormData] = useState(() => getInitialFormData(offender));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const previousCitizenIdRef = useRef(offender?.citizenId);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Initialize formData with offender data only when citizenId changes (different offender)
  useEffect(() => {
    // Only update if citizenId has changed (switching to a different offender) AND user is not currently typing
    if (previousCitizenIdRef.current !== offender?.citizenId && !isTypingRef.current) {
      const initialData = getInitialFormData(offender);
      setFormData(initialData);
      previousCitizenIdRef.current = offender?.citizenId;
    }
  }, [offender?.citizenId]); // Only watch citizenId, not the entire offender object

  // Debounced update to parent
  const debouncedUpdateParent = useCallback((updatedData: any) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      handleOffenderChange(index, updatedData);
      isTypingRef.current = false;
    }, 300); // Wait 300ms after user stops typing
  }, [index, handleOffenderChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const { t } = useTranslation();
  const {
    step,
    name,
    gender,
    selectgender,
    uploadaadhar,
    uploadpan,
    uploadphoto,
    occupation,
    address,
    age,
    aadharNo,
    male,
    female,
    removeoffender,
    other,
  } = t('offender') as any;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Mark that user is typing
    isTypingRef.current = true;

    // Update local form data immediately for responsive UI
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    // Debounce the parent update to avoid re-renders while typing
    debouncedUpdateParent(updatedFormData);

    // Only validate if it's not the name field (validate on blur for name)
    if (name !== 'offenderName') {
      validateInput(name, value);
    }
  };

  const handleNameBlur = () => {
    validateInput('offenderName', formData.offenderName);
  };

  const validateInput = (name: string, value: string) => {
    let error = '';

    if (typeof value === 'string' && !value.trim()) {
    } else {
      switch (name) {
        case 'offenderEmail':
          if (!value || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            error = 'Invalid email address';
          }
          break;
        case 'offenderMobileNo':
          if (!value || !/^[\d۰۱۲۳۴۵۶۷۸۹]{10}$/u.test(value)) {
            error = 'Invalid mobile number, must be 10 digits';
          }
          break;
        case 'offenderAadharNo':
          if (!value || !/^[\d۰۱۲۳۴۵۶۷۸۹]{12}$/u.test(value)) {
            error = 'Invalid Aadhar number, must be 12 digits';
          }
          break;
        case 'offenderAge':
          if (
            !value ||
            !/^[0-9۰۱۲۳۴۵۶۷۸۹]+$/u.test(value) ||
            parseInt(value) <= 0
          ) {
            error = 'Invalid age, must be a positive number';
          }
          break;
        default:
        case 'offenderName':
          if (
            !value ||
            !/^[\u0900-\u097F\u0041-\u005A\u0061-\u007A\s\-\'\.]+$/.test(value)
          ) {
            error =
              'Invalid Name, must contain only letters, spaces, hyphens, apostrophes, or periods';
          }
          break;
      }
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleRemoveClick = () => {
    removeOffender(index);
  };

  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {step} {`${index + 1}`}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">

        {/* Name */}
        <div>
          <label
            htmlFor="offenderName"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="offenderName"
            name="offenderName"
            value={formData.offenderName || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.offenderName ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500' : ''
              }`}
          />
          {errors.offenderName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.offenderName}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="offenderGender"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {gender}
          </label>
          <select
            id="offenderGender"
            name="offenderGender"
            value={formData.offenderGender || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="" disabled>{selectgender}</option>
            <option value="पुरुष">{male}</option>
            <option value="स्त्री">{female}</option>
            <option value="इतर">{other}</option>
          </select>
        </div>

        {/* Aadhar No */}
        <div>
          <label
            htmlFor="offenderAadharNo"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {aadharNo} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="offenderAadharNo"
            name="offenderAadharNo"
            value={formData.offenderAadharNo || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.offenderAadharNo ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500' : ''
              }`}
          />
          {errors.offenderAadharNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.offenderAadharNo}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="offenderEmail"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="offenderEmail"
            name="offenderEmail"
            value={formData.offenderEmail || ''}
            onChange={handleInputChange}
            disabled={false}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.offenderEmail ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500' : ''
              }`}
          />
          {errors.offenderEmail && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.offenderEmail}
            </p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <label
            htmlFor="offenderMobileNo"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="offenderMobileNo"
            name="offenderMobileNo"
            value={formData.offenderMobileNo || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.offenderMobileNo ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500' : ''
              }`}
          />
          {errors.offenderMobileNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.offenderMobileNo}
            </p>
          )}
        </div>

        {/* Profession */}
        <div>
          <label
            htmlFor="offenderProfession"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Profession
          </label>
          <input
            type="text"
            id="offenderProfession"
            name="offenderProfession"
            value={formData.offenderProfession || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label
            htmlFor="offenderAddress"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Address
          </label>
          <textarea
            id="offenderAddress"
            name="offenderAddress"
            value={formData.offenderAddress || ''}
            onChange={handleInputChange}
            rows={4}
            maxLength={5000}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {(formData.offenderAddress?.length || 0)}/5000
            </span>
          </div>
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="offenderAge"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {age}
          </label>
          <input
            type="number"
            id="offenderAge"
            name="offenderAge"
            value={formData.offenderAge || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.offenderAge ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500' : ''
              }`}
          />
          {errors.offenderAge && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.offenderAge}
            </p>
          )}
        </div>

        {/* Aadhar Upload */}
        <div className="md:col-span-1">
          <PhotoUpload
            key={`offender-aadhar-${index}`}
            onFileSelect={(file) => {
              const fileType = `offender_aadhar_${index}`;
              handleFileChange(fileType, file);
            }}
            currentFile={offenderAadhar?.[index] || null}
            label={uploadaadhar}
            accept="image/*"
            index={index}
          />
        </div>

        {/* PAN Upload */}
        <div className="md:col-span-1">
          <PhotoUpload
            key={`offender-pan-${index}`}
            onFileSelect={(file) => {
              const fileType = `offender_pan_${index}`;
              handleFileChange(fileType, file);
            }}
            currentFile={offenderPan?.[index] || null}
            label={uploadpan}
            accept="image/*"
            index={index}
          />
        </div>

        {/* Passport Upload */}
        <div className="md:col-span-1">
          <PhotoUpload
            key={`offender-passport-${index}`}
            onFileSelect={(file) => {
              const fileType = `offender_passport_${index}`;
              handleFileChange(fileType, file);
            }}
            currentFile={offenderPassport?.[index] || null}
            label={uploadphoto}
            accept="image/*"
            index={index}
          />
        </div>

      </div>



      <div className="flex justify-end">
        {index !== 0 && (
          <button
            type="button"
            onClick={handleRemoveClick}
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            {removeoffender}
          </button>
        )}
      </div>
    </div>
  );
};

export default Offender;