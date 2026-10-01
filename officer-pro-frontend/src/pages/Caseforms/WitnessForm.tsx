import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhotoUpload from '../../components/PhotoUpload';

interface WitnessInfo {
  witnessName: string;
  witnessGender: string;
  witnessAadharNo: string;
  witnessEmail: string;
  witnessMobileNo: string;
  witnessProfession: string;
  witnessAddress: string;
  witnessAge: string;
  witnessStatement: string;
  witnessType: string;
  aadharFile: File | null;
  panFile: File | null;
  photoFile: File | null;
}

interface WitnessFormProps {
  index: number;
  formData: WitnessInfo;
  errors: { [key: string]: string };
  handleInputChange: (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  handleFileChange: (index: number, e: ChangeEvent<HTMLInputElement>) => void;
  validateInput?: (index: number, name: string, value: string) => void;
  handleRemoveWitness?: (index: number) => void;
}

const WitnessForm: React.FC<WitnessFormProps> = ({
  index,
  formData,
  errors: parentErrors,
  handleInputChange,
  handleFileChange,
  handleRemoveWitness,
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateInput = (name: string, value: string) => {
    let error = '';

    if (typeof value === 'string' && !value.trim()) {
      // error = 'This field is required';
    } else {
      switch (name) {
        case 'witnessEmail':
          if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            error = 'Invalid email address';
          }
          break;
        case 'witnessMobileNo':
          if (!value || !/^[\d۰۱۲۳۴۵۶۷۸۹]{10}$/u.test(value)) {
            error = 'Invalid mobile number, must be 10 digits';
          }
          break;
        case 'witnessAadharNo':
          if (!value || !/^[\d۰۱۲۳۴۵۶۷۸۹]{12}$/u.test(value)) {
            error = 'Invalid Aadhar number, must be 12 digits';
          }
          break;
        case 'witnessAge':
          if (
            !value ||
            !/^[0-9۰۱۲۳۴۵۶۷۸۹]+$/u.test(value) ||
            parseInt(value) <= 0
          ) {
            error = 'Invalid age, must be a positive number';
          }
          break;
        default:
          break;
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleLocalInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    handleInputChange(index, e);
    validateInput(name, value);
  };

  const {
    witnessinfo,
    name,
    gender,
    choosegender,
    male,
    female,
    other,
    aadharno,
    email,
    contact,
    profession,
    address,
    age,
    uploadAadhar,
    uploadPan,
    uploadPhoto,
    removewitness,
    witnessStatement,
  } = t('witness') as any;

  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {witnessinfo} {`${index + 1}`}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {/* Name */}
        <div className="md:col-span-1">
          <label
            htmlFor="witnessName"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="witnessName"
            name="witnessName"
            value={formData.witnessName}
            onChange={handleLocalInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary ${
              errors.witnessName ? 'border-red-500' : ''
            }`}
          />
          {errors.witnessName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.witnessName}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="md:col-span-1">
          <label
            htmlFor="witnessGender"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {gender} <span className="text-red-500">*</span>
          </label>
          <select
            id="witnessGender"
            name="witnessGender"
            value={formData.witnessGender || ''}
            onChange={handleLocalInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary"
          >
            <option value="" disabled>
              {choosegender}
            </option>
            <option value="Male">{male}</option>
            <option value="Female">{female}</option>
            <option value="Other">{other}</option>
          </select>
        </div>

        {/* Aadhar No */}
        <div className="md:col-span-1">
          <label
            htmlFor="witnessAadharNo"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {aadharno} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="witnessAadharNo"
            name="witnessAadharNo"
            value={formData.witnessAadharNo || ''}
            onChange={handleLocalInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary ${
              errors.witnessAadharNo ? 'border-red-500' : ''
            }`}
          />
          {errors.witnessAadharNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.witnessAadharNo}
            </p>
          )}
        </div>

        {/* E-Mail */}
        <div className="md:col-span-1">
          <label
            htmlFor="witnessEmail"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {email}
          </label>
          <input
            type="email"
            id="witnessEmail"
            name="witnessEmail"
            value={formData.witnessEmail || ''}
            onChange={handleLocalInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary ${
              errors.witnessEmail ? 'border-red-500' : ''
            }`}
          />
          {errors.witnessEmail && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.witnessEmail}
            </p>
          )}
        </div>

        {/* Contact No */}
        <div className="md:col-span-1">
          <label
            htmlFor="witnessMobileNo"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {contact} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="witnessMobileNo"
            name="witnessMobileNo"
            value={formData.witnessMobileNo || ''}
            onChange={handleLocalInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary ${
              errors.witnessMobileNo ? 'border-red-500' : ''
            }`}
          />
          {errors.witnessMobileNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.witnessMobileNo}
            </p>
          )}
        </div>

        {/* Profession */}
        <div className="md:col-span-1">
          <label
            htmlFor="witnessProfession"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {profession}
          </label>
          <input
            type="text"
            id="witnessProfession"
            name="witnessProfession"
            value={formData.witnessProfession || ''}
            onChange={handleLocalInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label
            htmlFor="witnessAddress"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {address} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="witnessAddress"
            name="witnessAddress"
            value={formData.witnessAddress || ''}
            onChange={handleLocalInputChange}
            rows={4}
            maxLength={5000}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none resize-none transition focus:border-primary"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {formData.witnessAddress?.length || 0}/5000
            </span>
          </div>
        </div>

        {/* Age */}
        <div className="md:col-span-1">
          <label
            htmlFor="witnessAge"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {age} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="witnessAge"
            name="witnessAge"
            value={formData.witnessAge || ''}
            onChange={handleLocalInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary ${
              errors.witnessAge ? 'border-red-500' : ''
            }`}
          />
          {errors.witnessAge && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.witnessAge}
            </p>
          )}
        </div>

        {/* Witness Statement */}
        <div className="md:col-span-3">
          <label
            htmlFor="witnessStatement"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            {witnessStatement}
          </label>
          <textarea
            id="witnessStatement"
            name="witnessStatement"
            value={formData.witnessStatement || ''}
            onChange={handleLocalInputChange}
            rows={6}
            maxLength={10000}
            placeholder="Enter witness statement..."
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none resize-none transition focus:border-primary"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {formData.witnessStatement?.length || 0}/10000
            </span>
          </div>
        </div>
        <div className="md:col-span-1">
          <PhotoUpload
            key={`witness-aadhar-${index}-${formData.aadharFile?.name || 'empty'}-${formData.aadharFile?.lastModified || 'no-file'}-${Date.now()}`}
            onFileSelect={(file) => {
              handleFileChange(
                index,
                { target: { name: 'aadharFile', files: file ? [file] : [] } } as any,
              );
            }}
            currentFile={formData.aadharFile}
            label={uploadAadhar}
            accept="image/*"
            index={index}
          />
        </div>

        <div className="md:col-span-1">
          <PhotoUpload
            key={`witness-pan-${index}-${formData.panFile?.name || 'empty'}-${formData.panFile?.lastModified || 'no-file'}-${Date.now()}`}
            onFileSelect={(file) => {
              handleFileChange(
                index,
                { target: { name: 'panFile', files: file ? [file] : [] } } as any,
              );
            }}
            currentFile={formData.panFile}
            label={uploadPan}
            accept="image/*"
            index={index}
          />
        </div>

        <div className="md:col-span-1">
          <PhotoUpload
            key={`witness-photo-${index}-${formData.photoFile?.name || 'empty'}-${formData.photoFile?.lastModified || 'no-file'}-${Date.now()}`}
            onFileSelect={(file) => {
              handleFileChange(
                index,
                { target: { name: 'photoFile', files: file ? [file] : [] } } as any,
              );
            }}
            currentFile={formData.photoFile}
            label={uploadPhoto}
            accept="image/*"
            index={index}
          />
        </div>
      </div>

      {/* Remove Button - Only show for witnesses that are not the first one */}
      <div className="flex justify-end">
        {index !== 0 && handleRemoveWitness && (
          <button
            type="button"
            onClick={() => handleRemoveWitness(index)}
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            {removewitness}
          </button>
        )}
      </div>
    </div>
  );
};

export default WitnessForm;
