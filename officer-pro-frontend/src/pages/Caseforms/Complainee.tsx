import React, { ChangeEvent, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PhotoUpload from '../../components/PhotoUpload';

interface ComplaineeProps {
  complainee: any;
  handleComplaineeChange: (updatedComplainee: any) => void;
  handleFileChange: (fileType: string, file: File | null, index?: number) => void;
  victimAadhar?: File | null;
  victimPan?: File | null;
  victimPassport?: File | null;
  index?: number;
}

const Complainee: React.FC<ComplaineeProps> = ({
  complainee,
  handleComplaineeChange,
  handleFileChange,
  victimAadhar,
  victimPan,
  victimPassport,
  index = 0,
}) => {
  const [formData, setFormData] = useState(complainee || {});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Force re-render when files change
  const [fileUpdateTrigger, setFileUpdateTrigger] = useState(0);

  // Update trigger when any file prop changes
  useEffect(() => {
    if (victimAadhar || victimPan || victimPassport) {
      setFileUpdateTrigger(prev => prev + 1);
    }
  }, [victimAadhar, victimPan, victimPassport]);

  // Initialize formData with complainee data if available (on mount and when complainee prop changes)
  useEffect(() => {
    if (complainee && complainee.name) {
      setFormData(complainee);
    }
  }, [complainee?.citizenId, complainee?.name]); // Run when complainee identity changes

  const { t } = useTranslation();
  const complaineeData = t('complainee') as any;
  const {
    step,
    type,
    choosetype,
    name,
    gender,
    choosegender,
    male,
    female,
    other,
    uploadaadhar,
    uploadpan,
    uploadphoto,
    email,
    complainy,
    victeem,
    address,
    contactno,
    aadharno,
    age,
    occupation,
  } = complaineeData;
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    handleComplaineeChange(updatedData);
    
    // Don't validate on every keystroke for name field - only on blur
    if (name !== 'name') {
      validateInput(name, value);
    }
  };

  const handleNameBlur = () => {
    validateInput('name', formData.name);
  };

  const validateInput = (name: string, value: string) => {
    let error = '';

    if (!value.trim()) {
      switch (name) {
        case 'aadharNo':
          error = 'Aadhar Number is mandatory *';
          break;
        case 'email':
          error = 'Email is mandatory *';
          break;
        case 'name':
          error = 'Name is mandatory *';
          break;
        case 'contactNo':
          error = 'Contact Number is mandatory *';
          break;
        default:
          error = 'This field is required';
      }
    } else {
      switch (name) {
        case 'aadharNo':
          if (!/^[\d]{12}$/.test(value)) {
            error = value.trim() ? 'Aadhar Number must be exactly 12 digits' : 'Aadhar Number is mandatory * (12 digits required)';
          }
          break;
        case 'email':
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            error = 'Invalid email format';
          }
          break;
        case 'contactNo':
          if (!/^[\d]{10}$/.test(value)) {
            error = 'Contact Number must be 10 digits';
          }
          break;
        case 'name':
          if (!/^[\u0900-\u097F\u0041-\u005A\u0061-\u007A\s]+$/.test(value)) {
            error = 'Name must contain only letters and spaces';
          }
          break;
        case 'age':
          const ageNum = parseInt(value);
          if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
            error = 'Age must be between 1 and 150';
          }
          break;
      }
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {step}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {/* Row 1 */}
        <div className="md:col-span-1">
          <label
            htmlFor="victimName"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="victimName"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            onBlur={handleNameBlur}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.name
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.name}
            </p>
          )}
        </div>

        <div className="md:col-span-1">
          <label
            htmlFor="victimGender"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {gender}
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="" disabled>
              {choosegender}
            </option>
            <option value="पुरुष">{male}</option>
            <option value="स्त्री">{female}</option>
            <option value="इतर">{other}</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label
            htmlFor="victimAadharNo"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {aadharno} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="victimAadharNo"
            name="aadharNo"
            value={formData.aadharNo || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.aadharNo
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.aadharNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.aadharNo}
            </p>
          )}
        </div>

        {/* Row 2 */}
        <div className="md:col-span-1">
          <label
            htmlFor="victimEmail"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {email} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            disabled={false}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.email
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.email}
            </p>
          )}
        </div>

        <div className="md:col-span-1">
          <label
            htmlFor="victimMobileNo"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {contactno} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contactNo"
            name="contactNo"
            value={formData.contactNo || ''}
            onChange={handleInputChange}
            disabled={false}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.contactNo
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.contactNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.contactNo}
            </p>
          )}
        </div>

        <div className="md:col-span-1">
          <label
            htmlFor="victimProfession"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {occupation}
          </label>
          <input
            type="text"
            id="profession"
            name="profession"
            value={formData.profession || ''}
            onChange={handleInputChange}
            disabled={false}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Row 3 - Address takes full width */}
        <div className="md:col-span-2">
          <label
            htmlFor="victimAddress"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {address}
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange}
            rows={4}
            maxLength={5000}
            disabled={false}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {formData.address?.length || 0}/5000
            </span>
          </div>
        </div>

        <div className="md:col-span-1">
          <label
            htmlFor="victimAge"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {age}
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age || ''}
            onChange={handleInputChange}
            disabled={false}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.age
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.age && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.age}
            </p>
          )}
        </div>

        {/* Photo Upload Section */}
        <div className="md:col-span-1">
          <PhotoUpload
            key={`aadhar-${complainee.citizenId}-${victimAadhar?.name || 'empty'}-${victimAadhar?.lastModified || 'no-file'}-${fileUpdateTrigger}`}
            onFileSelect={(file: File | null, index?: number) => {
              console.log('📸 COMPLAINEE AADHAR UPLOAD:', { file: file?.name, index });
              handleFileChange(`victim_aadhar_${index}`, file, index);
            }}
            currentFile={victimAadhar}
            existingPath={formData?.aadharPath || ''}
            label={uploadaadhar}
            accept="image/*"
            index={index}
          />
        </div>

        <div className="md:col-span-1">
          <PhotoUpload
            key={`pan-${complainee.citizenId}-${victimPan?.name || 'empty'}-${victimPan?.lastModified || 'no-file'}-${fileUpdateTrigger}`}
            onFileSelect={(file: File | null, index?: number) => {
              console.log('📸 COMPLAINEE PAN UPLOAD:', { file: file?.name, index });
              handleFileChange(`victim_pan_${index}`, file, index);
            }}
            currentFile={victimPan}
            existingPath={formData?.panPath || ''}
            label={uploadpan}
            accept="image/*"
            index={index}
          />
        </div>

        <div className="md:col-span-1">
          <PhotoUpload
            key={`photo-${complainee.citizenId}-${victimPassport?.name || 'empty'}-${victimPassport?.lastModified || 'no-file'}-${fileUpdateTrigger}`}
            onFileSelect={(file: File | null, index?: number) => {
              console.log('📸 COMPLAINEE PHOTO UPLOAD:', { file: file?.name, index });
              handleFileChange(`victim_passport_${index}`, file, index);
            }}
            currentFile={victimPassport}
            existingPath={formData?.photoPath || ''}
            label={uploadphoto}
            accept="image/*"
            index={index}
          />
        </div>
      </div>
    </div>
  );
};

export default Complainee;
