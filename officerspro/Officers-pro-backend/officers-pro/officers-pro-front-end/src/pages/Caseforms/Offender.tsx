import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Offender = ({
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
  const [formData, setFormData] = useState(offender);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
    arrestedStatus,
    description,
    section,
    selectstatus,
    arrested,
    not_arrested,
    not_accessible,
    escaped,
    male,
    female,
    removeoffender,
    other,
  } = t('offender');

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);
    handleOffenderChange(index, updatedFormData);
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
  const handleRemoveClick = () => {
    removeOffender(index);
  };

  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {step} {`${index + 1}`}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-8">
        <div>
          <label
            htmlFor="offenderName"
            className="mb-3 block text-black dark:text-white"
          >
            {name}
          </label>
          <input
            type="text"
            id="offenderName"
            name="offenderName"
            value={formData.offenderName || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.offenderName
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.offenderName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.offenderName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="offenderGender"
            className="mb-3 block text-black dark:text-white"
          >
            {gender}
          </label>
          <select
            id="offenderGender"
            name="offenderGender"
            value={formData.offenderGender || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="" disabled>
              {selectgender}
            </option>
            <option value="पुरुष">{male}</option>
            <option value="स्त्री">{female}</option>
            <option value="इतर">{other}</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="offenderProfession"
            className="mb-3 block text-black dark:text-white"
          >
            {occupation}
          </label>
          <input
            type="text"
            id="offenderProfession"
            name="offenderProfession"
            value={formData.offenderProfession || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div>
          <label
            htmlFor="offenderAddress"
            className="mb-3 block text-black dark:text-white"
          >
            {address}
          </label>
          <input
            type="text"
            id="offenderAddress"
            name="offenderAddress"
            value={formData.offenderAddress || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="offenderAge"
            className="mb-3 block text-black dark:text-white"
          >
            {age}
          </label>
          <input
            type="text"
            id="offenderAge"
            name="offenderAge"
            value={formData.offenderAge || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.offenderAge
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.offenderAge && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.offenderAge}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="offenderAadharNo"
            className="mb-3 block text-black dark:text-white"
          >
            {aadharNo}
          </label>
          <input
            type="text"
            id="offenderAadharNo"
            name="offenderAadharNo"
            value={formData.offenderAadharNo || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.offenderAadharNo
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.offenderAadharNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span>{' '}
              {errors.offenderAadharNo}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="arrestedStatus"
            className="mb-3 block text-black dark:text-white"
          >
            {arrestedStatus}
          </label>
          <select
            id="arrestedStatus"
            name="arrestedStatus"
            value={formData.arrestedStatus || ''}
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
        </div>
        <div>
          <label
            htmlFor="offenderDescription"
            className="mb-3 block text-black dark:text-white"
          >
            {description}
          </label>
          <input
            type="text"
            id="offenderDescription"
            name="offenderDescription"
            value={formData.offenderDescription || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div>
          <label
            htmlFor="sectionId"
            className="mb-3 block text-black dark:text-white"
          >
            {section}
          </label>
          <input
            type="text"
            id="sectionId"
            name="sectionId"
            value={formData.sectionId || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div>
        <label
          htmlFor="offender_aadhar"
          className="mb-3 block text-black dark:text-white"
        >
          {uploadaadhar}
        </label>
        {offenderAadhar[index] ? (
          <div className="px-2 w-full justify-between flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
            <div className="mr-2 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
              {offenderAadhar[index].name.split('_').length > 2
                ? offenderAadhar[index].name.split('_')[2]
                : offenderAadhar[index].name}
            </div>
            <button
              type="button"
              onClick={() => removeFile('offender_aadhar', index)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm5 10a.999.999 0 0 1-1 1H6a1 1 0 1 1 0-2h8a.999.999 0 0 1 1 1z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <input
            type="file"
            id="offender_aadhar"
            name="offender_aadhar"
            accept="image/*"
            onChange={(e) => {
              handleFileChange(e, index, 'offender_aadhar');
            }}
            className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
          />
        )}
      </div>
      <div>
        <label
          htmlFor="offender_pan"
          className="mb-3 block text-black dark:text-white"
        >
          {uploadpan}
        </label>
        {offenderPan[index] ? (
          <div className="px-2 w-full justify-between flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
            <div className="mr-2 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
              {offenderPan[index].name.split('_').length > 2
                ? offenderPan[index].name.split('_')[2]
                : offenderPan[index].name}
            </div>
            <button
              type="button"
              onClick={() => removeFile('offender_pan', index)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm5 10a.999.999 0 0 1-1 1H6a1 1 0 1 1 0-2h8a.999.999 0 0 1 1 1z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <input
            type="file"
            id="offender_pan"
            name="offender_pan"
            accept="image/*"
            onChange={(e) => {
              handleFileChange(e, index);
            }}
            className=" w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
          />
        )}
      </div>
      <div>
        <label
          htmlFor="offender_passport"
          className="mb-3 block text-black dark:text-white"
        >
          {uploadphoto}
        </label>
        {offenderPassport[index] && offenderPassport[index].name ? (
          <div className="px-2 w-full justify-between flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
            <div className="mr-2 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
              {offenderPassport[index].name.split('_').length > 2
                ? offenderPassport[index].name.split('_')[2]
                : offenderPassport[index].name}
            </div>
            <button
              type="button"
              onClick={() => removeFile('offender_passport', index)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm5 10a.999.999 0 0 1-1 1H6a1 1 0 1 1 0-2h8a.999.999 0 0 1 1 1z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <input
            type="file"
            id="offender_passport"
            accept="image/*"
            name="offender_passport"
            onChange={(e) => {
              handleFileChange(e, index);
            }}
            className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
          />
        )}
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
