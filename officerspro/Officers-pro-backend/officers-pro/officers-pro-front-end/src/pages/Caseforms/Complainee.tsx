import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ComplaineeProps {
  complainee: any;
  handleComplaineeChange: (updatedData: any) => void;
  handleFileChange: (updatedData: any) => void;
  victimAadhar: any;
  victimPan: any;
  victimPassport: any;
  removeFile: (filetype: any, index: any) => void;
}

const Complainee: React.FC<ComplaineeProps> = ({
  complainee,
  handleComplaineeChange,
  handleFileChange,
  victimAadhar,
  victimPan,
  victimPassport,
  removeFile,
}) => {
  const [formData, setFormData] = useState(complainee);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { t } = useTranslation();
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
    occupation,
    complainy,
    victeem,
    address,
    contactno,
    age,
    aadharno,
  } = t('complainee');

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    handleComplaineeChange(updatedData);
    validateInput(name, value);
  };

  const validateInput = (name: string, value: string) => {
    let error = '';

    if (!value.trim()) {
      // error = 'This field is required';
    } else {
      switch (name) {
        case 'victimEmail':
          if (
            !value ||
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ) {
            error = 'Invalid email address';
          }
          break;
        case 'victimMobileNo':
          if (!value || !/^[\d०१२३४५६७८९]{10}$/u.test(value)) {
            error = 'Invalid mobile number, must be 10 digits';
          }
          break;
        case 'victimAadharNo':
          if (!value || !/^[\d०१२३४५६७८९]{12}$/u.test(value)) {
            error = 'Invalid Aadhar number, must be 12 digits';
          }
          break;
        case 'victimAge':
          if (
            !value ||
            !/^[0-9०१२३४५६७८९]+$/u.test(value) ||
            parseInt(value) <= 0
          ) {
            error = 'Invalid age, must be a positive number';
          }
          break;
        case 'victimName':
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

  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {step}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-8">
        <div>
          <label
            htmlFor="type"
            className="mb-3 block text-black dark:text-white"
          >
            {type}
          </label>

          <select
            id="type"
            name="type"
            value={formData.type || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="" disabled>
              {choosetype}
            </option>
            <option value="Complainee">{complainy}</option>
            <option value="Victim">{victeem}</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="victimName"
            className="mb-3 block text-black dark:text-white"
          >
            {name}
          </label>
          <input
            type="text"
            id="victimName"
            name="victimName"
            value={formData.victimName || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.victimName
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.victimName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.victimName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="victimGender"
            className="mb-3 block text-black dark:text-white"
          >
            {gender}
          </label>
          <select
            id="victimGender"
            name="victimGender"
            value={formData.victimGender || ''}
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
        </div>

        <div>
          <label
            htmlFor="victimEmail"
            className="mb-3 block text-black dark:text-white"
          >
            {email}
          </label>
          <input
            type="email"
            id="victimEmail"
            name="victimEmail"
            value={formData.victimEmail || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.victimEmail
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.victimEmail && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.victimEmail}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="victimProfession"
            className="mb-3 block text-black dark:text-white"
          >
            {occupation}
          </label>
          <input
            type="text"
            id="victimProfession"
            name="victimProfession"
            value={formData.victimProfession || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div>
          <label
            htmlFor="victimMobileNo"
            className="mb-3 block text-black dark:text-white"
          >
            {contactno}
          </label>
          <input
            type="text"
            id="victimMobileNo"
            name="victimMobileNo"
            value={formData.victimMobileNo || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.victimMobileNo
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.victimMobileNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.victimMobileNo}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="victimAddress"
            className="mb-3 block text-black dark:text-white"
          >
            {address}
          </label>
          <input
            type="text"
            id="victimAddress"
            name="victimAddress"
            value={formData.victimAddress || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="victimAge"
            className="mb-3 block text-black dark:text-white"
          >
            {age}
          </label>
          <input
            type="text"
            id="victimAge"
            name="victimAge"
            value={formData.victimAge || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.victimAge
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.victimAge && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.victimAge}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="victimAadharNo"
            className="mb-3 block text-black dark:text-white"
          >
            {aadharno}
          </label>
          <input
            type="text"
            id="victimAadharNo"
            name="victimAadharNo"
            value={formData.victimAadharNo || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
              errors.victimAadharNo
                ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : ''
            }`}
          />
          {errors.victimAadharNo && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oops!</span> {errors.victimAadharNo}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="victim_aadhar"
            className="mb-3 block text-black dark:text-white"
          >
            {uploadaadhar}
          </label>
          {victimAadhar ? (
            <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              <div className="mr-2 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                {victimAadhar.name.split('_').length > 2
                  ? victimAadhar.name.split('_')[2]
                  : victimAadhar.name}
              </div>
              <button
                type="button"
                onClick={() => removeFile('victim_aadhar', null)}
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
              id="victim_aadhar"
              name="victim_aadhar"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          )}
        </div>
        <div>
          <label
            htmlFor="victim_pan"
            className="mb-3 block text-black dark:text-white"
          >
            {uploadpan}
          </label>
          {victimPan ? (
            <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              <div className="mr-2 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                {victimPan.name.split('_').length > 2
                  ? victimPan.name.split('_')[2]
                  : victimPan.name}
              </div>
              <button
                type="button"
                onClick={() => removeFile('victim_pan', null)}
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
              id="victim_pan"
              name="victim_pan"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          )}
        </div>
        <div>
          <label
            htmlFor="victim_passport"
            className="mb-3 block text-black dark:text-white"
          >
            {uploadphoto}
          </label>
          {/* Conditional rendering based on whether file has been selected */}
          {victimPassport ? (
            <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              <div className="mr-2 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                {victimPassport.name.split('_').length > 2
                  ? victimPassport.name.split('_')[2]
                  : victimPassport.name}
              </div>
              <button
                type="button"
                onClick={() => removeFile('victim_passport', null)}
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
              id="victim_passport"
              accept="image/*"
              name="victim_passport"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Complainee;
