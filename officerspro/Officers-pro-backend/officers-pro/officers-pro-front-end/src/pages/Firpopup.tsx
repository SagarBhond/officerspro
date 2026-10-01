import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Firpopup = ({ isOpen, onClose, onSave }) => {
  const [firNumber, setFirNumber] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const { t } = useTranslation();
  const { heading, firno, fir, shortdesc, placeholder, save, cancel } =
    t('firpopup');

  const handleSave = () => {
    onSave({ firNumber, file, description });
    onClose();
  };

  if (!isOpen) return null;

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-default dark:border-strokedark dark:bg-boxdark">
        <h2 className="text-xl font-semibold mb-4">{heading}</h2>
        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {firno}
          </label>
          <input
            type="text"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={firNumber}
            onChange={(e) => setFirNumber(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">{fir}</label>
          {file ? (
            <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              {/* Display issueImage */}
              {file.name.split('_').length > 2
                ? file.name.split('_')[2]
                : file.name}
              <button type="button" onClick={removeFile}>
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
              id="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {shortdesc}
          </label>
          <textarea
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholder}
          ></textarea>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-500 text-black py-2 px-4 bg-lightcyan rounded-md hover:bg-gray-600"
            onClick={onClose}
          >
            {cancel}
          </button>
          <button
            className="bg-honolulublue text-white py-2 px-4 rounded-md hover:bg-blue-600"
            onClick={handleSave}
          >
            {save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Firpopup;
