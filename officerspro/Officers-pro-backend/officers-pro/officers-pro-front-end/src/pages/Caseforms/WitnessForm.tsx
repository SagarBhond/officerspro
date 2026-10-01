import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface WitnessInfo {
  witnessName: string;
  witnessEmail: string;
  witnessProfession: string;
  witnessGender: string;
  witnessAddress: string;
  witnessAge: string;
  witnessAadharNo: string;
  witnessMobileNo: string;
  witnessStatement: string;
  aadharFile: File | null;
  panFile: File | null;
  passportFile: File | null;
  witnessType: string;
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
  validateInput: (index: number, name: string, value: string) => void;
  handleRemoveWitness: (index: number) => void;
}

const WitnessForm: React.FC<WitnessFormProps> = ({
  index,
  formData,
  errors,
  handleInputChange,
  handleFileChange,
  validateInput,
  handleRemoveWitness,
}) => {
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
    aadharno,
    statement,
    aadhar,
    pan,
    passport,
  } = t('profileedit');
  const { witnessinfo, removewitness } = t('witness');

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mx-13 mb-4">
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {witnessinfo} {`${index + 1}`}
      </h3>
      <form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-8 pt-8 pb-4">
          <div>
            <label
              htmlFor="witnessType"
              className="mb-3 block text-black dark:text-white"
            >
              {witnesstype}
            </label>
            <select
              id="witnessType"
              name="witnessType"
              value={formData.witnessType || ''}
              onChange={(e) => handleInputChange(index, e)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="" disabled>
                {choosetype}
              </option>
              <option value="witness">{witnes}</option>
              <option value="eyeWitness">{eyewitness}</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="witnessName"
              className="mb-3 block text-black dark:text-white"
            >
              {name} :
            </label>
            <input
              type="text"
              id="witnessName"
              name="witnessName"
              value={formData.witnessName}
              className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
                errors.witnessName
                  ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                  : ''
              }`}
              onChange={(e) => handleInputChange(index, e)}
            />
            {errors.witnessName && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">Oops!</span> {errors.witnessName}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="witnessEmail"
              className="mb-3 block text-black dark:text-white"
            >
              {email}
            </label>
            <input
              type="email"
              id="witnessEmail"
              name="witnessEmail"
              value={formData.witnessEmail || ''}
              onChange={(e) => handleInputChange(index, e)}
              className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
                errors.witnessEmail
                  ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                  : ''
              }`}
            />
            {errors.witnessEmail && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">Oops!</span> {errors.witnessEmail}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="witnessProfession"
              className="mb-3 block text-black dark:text-white"
            >
              {profession}
            </label>
            <input
              type="text"
              id="witnessProfession"
              name="witnessProfession"
              value={formData.witnessProfession || ''}
              onChange={(e) => handleInputChange(index, e)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="witnessGender"
              className="mb-3 block text-black dark:text-white"
            >
              {gender}
            </label>
            <select
              id="witnessGender"
              name="witnessGender"
              value={formData.witnessGender || ''}
              onChange={(e) => handleInputChange(index, e)}
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
              htmlFor="witnessAddress"
              className="mb-3 block text-black dark:text-white"
            >
              {address}
            </label>
            <input
              type="text"
              id="witnessAddress"
              name="witnessAddress"
              value={formData.witnessAddress || ''}
              onChange={(e) => handleInputChange(index, e)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="witnessAge"
              className="mb-3 block text-black dark:text-white"
            >
              {age}
            </label>
            <input
              type="text"
              id="witnessAge"
              name="witnessAge"
              value={formData.witnessAge || ''}
              onChange={(e) => handleInputChange(index, e)}
              className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
                errors.witnessAge
                  ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                  : ''
              }`}
            />
            {errors.witnessAge && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">Oops!</span> {errors.witnessAge}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="witnessAadharNo"
              className="mb-3 block text-black dark:text-white"
            >
              {aadharno}
            </label>
            <input
              type="text"
              id="witnessAadharNo"
              name="witnessAadharNo"
              value={formData.witnessAadharNo || ''}
              onChange={(e) => handleInputChange(index, e)}
              className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
                errors.witnessAadharNo
                  ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:focus:border-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                  : ''
              }`}
            />
            {errors.witnessAadharNo && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">Oops!</span>{' '}
                {errors.witnessAadharNo}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="witnessMobileNo"
              className="mb-3 block text-black dark:text-white"
            >
              {contact}
            </label>
            <input
              type="text"
              id="witnessMobileNo"
              name="witnessMobileNo"
              value={formData.witnessMobileNo || ''}
              onChange={(e) => handleInputChange(index, e)}
              className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
                errors.witnessMobileNo
                  ? ' border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                  : ''
              }`}
            />
            {errors.witnessMobileNo && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">Oops!</span>{' '}
                {errors.witnessMobileNo}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="witness_aadhar"
              className="mb-3 block text-black dark:text-white"
            >
              {aadhar} :
            </label>
            <input
              type="file"
              id="witness_aadhar"
              name="witness_aadhar"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              onChange={(e) => handleFileChange(index, e)}
            />
          </div>
          <div>
            <label
              htmlFor="witness_pan"
              className="mb-3 block text-black dark:text-white"
            >
              {pan} :
            </label>
            <input
              type="file"
              id="witness_pan"
              name="witness_pan"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              onChange={(e) => handleFileChange(index, e)}
            />
          </div>
          <div>
            <label
              htmlFor="witness_passport"
              className="mb-3 block text-black dark:text-white"
            >
              {passport} :
            </label>
            <input
              type="file"
              id="witness_passport"
              name="witness_passport"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              onChange={(e) => handleFileChange(index, e)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 px-8 pb-4">
          <div>
            <label
              htmlFor="witnessStatement"
              className="mb-3 block text-black dark:text-white"
            >
              {statement} :
            </label>
            <textarea
              id="witnessStatement"
              name="witnessStatement"
              rows={Math.max(
                (formData.witnessStatement || '').split('\n').length,
                3,
              )}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={formData.witnessStatement}
              onChange={(e) => handleInputChange(index, e)}
            />
          </div>
        </div>
      </form>
      <div className="flex justify-end">
        {index !== 0 && (
          <button
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
