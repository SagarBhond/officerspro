import { useState, useEffect } from 'react';
import request from '../Service/axios_helper';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AddTypePopup = ({
  isOpen,
  onClose,
  onTypeAdded,
  ferristData,
  victimId,
}) => {
  const [docType, setDocType] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [date, setDate] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [ferristFile, setFerristFile] = useState(null);
  const [initialFileName, setInitialFileName] = useState('');
  const imagekey = import.meta.env.VITE_IMAGE_API;

  const { t } = useTranslation();
  const {
    title1,
    title2,
    doctype,
    docdesc,
    dated,
    file,
    pagecount,
    cancel,
    save,
  } = t('addtypepopup');

  useEffect(() => {
    if (isOpen) {
      if (ferristData) {
        setDocType(ferristData.docType);
        setDocDescription(ferristData.docDescription);
        setDate(ferristData.date);
        setPageCount(ferristData.pageCount);
        if (ferristData.ferristFile) {
          setInitialFileName(ferristData.ferristFile.fileName);
          fetchFile(ferristData.ferristFile.filePath);
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, ferristData]);

  const fetchFile = async (filePath) => {
    try {
      const sanitizedFilePath = encodeURIComponent(filePath.replace(/\\/g, '/'));
      const path = `${imagekey}?filePath=${sanitizedFilePath}`;     
      const response = await axios({
        url: path,
        method: 'GET',
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: response.data.type });

      setFerristFile(file);
    } catch (error) {
      console.error('Error fetching file:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFerristFile(file);
    setInitialFileName(''); // Clear initial file name when a new file is selected
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      const ferristDto = JSON.stringify({
        docType,
        docDescription,
        date,
        pageCount,
      });
      formDataToSend.append('ferristDto', ferristDto);

      if (ferristFile) {
        // If there's an initial file name, use it
        if (initialFileName) {
          formDataToSend.append('file', ferristFile, initialFileName);
        } else {
          formDataToSend.append('file', ferristFile);
        }
      }

      if (ferristData) {
        await request(
          `complaintandfir`,
          'PUT',
          `/updateFerrist/${ferristData.ferristId}`,
          formDataToSend,
        );
      } else {
        const formDataToSend = new FormData();
        const ferristDto = JSON.stringify([
          {
            docType,
            docDescription,
            date,
            pageCount,
          },
        ]);
        formDataToSend.append('ferristDto', ferristDto);
        if (ferristFile) {
          formDataToSend.append('file', ferristFile);
        }
        await request('complaintandfir', 'POST', `/addferrist/${victimId}`, formDataToSend);
      }

      onTypeAdded();
      onClose();
    } catch (error) {
      console.error('Error saving type:', error);
    }
  };

  const removeFile = () => {
    setFerristFile(null);
    setInitialFileName('');
  };

  const resetForm = () => {
    setDocType('');
    setDocDescription('');
    setDate('');
    setPageCount('');
    setFerristFile(null);
    setInitialFileName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-default dark:border-strokedark dark:bg-boxdark">
        <h2 className="text-xl font-semibold mb-4">
          {ferristData ? <p>{title2}</p> : <p>{title1}</p>}
        </h2>
        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {doctype}
          </label>
          <input
            type="text"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {docdesc}
          </label>
          <input
            type="text"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={docDescription}
            onChange={(e) => setDocDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {date}
          </label>
          <input
            type="date"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {pagecount}
          </label>
          <input
            type="number"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={pageCount}
            onChange={(e) => setPageCount(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {file}
          </label>
          {initialFileName ? (
            <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              {initialFileName}
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
          ) : ferristFile ? (
            <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              {ferristFile.name.split('_').length > 2
                ? ferristFile.name.split('_')[2]
                : ferristFile.name}
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
              // accept="image/*"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:bg-form-input dark:file:text-white dark:file:hover:bg-primary dark:file:hover:bg-opacity-10 dark:focus:border-primary"
              required
            />
          )}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="bg-gray-500 text-black py-2 px-4 bg-lightcyan rounded-md hover:bg-gray-600"
            onClick={onClose}
          >
            {cancel}
          </button>
          <button
            type="button"
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

export default AddTypePopup;
