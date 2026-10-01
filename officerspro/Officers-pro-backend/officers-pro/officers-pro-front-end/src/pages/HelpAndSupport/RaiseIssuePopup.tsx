import React, { useState, useEffect } from 'react';
import request from '../../Service/axios_helper';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const RaiseIssuePopup: React.FC<{
  officerId: string;
  uuid: string;
  onClose: () => void;
}> = ({ officerId, uuid, onClose }) => {
  const [subject, setSubject] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueImage, setIssueImage] = useState<File | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [img, setImg] = useState();

  const { t } = useTranslation();
  const { title1, title2, subjects, desc, ss, cancel, save } = t('raiseissue');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (uuid) {
          const response = await request(
            'cms',
            'GET',
            `/getByUuid/${uuid}`,
            {},
          );
          setSubject(response.subject);
          setIssueDesc(response.issueDesc);
          setIsNew(false);
          setImg(response.issueImage.fileName);

          if (response.issueImage && response.issueImage.filePath) {
            try {
              const fileResponse = await request(
                'cms',
                'GET',
                `/files/${response.issueImage.fileName}`,
                {},
              );
              const blob = await fileResponse; // Assuming fileResponse already contains the blob data
              const file = new File([blob], response.issueImage.fileName);
              console.log(file);
              setIssueImage(file); // Set the image file into the issueImage state
            } catch (error) {
              console.error('Error fetching image:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [uuid]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const data = {
      officerId: officerId,
      subject: subject,
      issueDesc: issueDesc,
    };
    const formData = new FormData();

    formData.append('helpAndSupportDto', JSON.stringify(data));
    formData.append('issueImage', issueImage);

    try {
      let response;
      if (isNew) {
        response = await request(
          'cms',
          'POST',
          '/saveHelpAndSupport',
          formData,
        );
      } else {
        response = await request(
          'cms',
          'PUT',
          `/updateHelpAndSupportByUuid/${uuid}`,
          formData,
        );
      }

      console.log(response); // Log response for debugging

      // Trigger SweetAlert with success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: isNew
          ? 'Issue submitted successfully!'
          : 'Issue updated successfully!',
      });
    } catch (error) {
      console.error('Error:', error);
      // Trigger SweetAlert with error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while processing your request. Please try again later.',
      });
    }

    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setIssueImage(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const removeFile = () => {
    setIssueImage(null);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 dark:border-strokedark dark:bg-boxdark">
        <h2 className="text-xl font-bold mb-4 text-center dark:text-white">
          {isNew ? <p>{title2}</p> : <p>{title1}</p>}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="subject"
              className="block font-bold mb-1 dark:text-white"
            >
              {subjects} :
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </div>
          <div>
            <label
              htmlFor="issueDesc"
              className="block font-bold mb-1 dark:text-white"
            >
              {desc} :
            </label>
            <textarea
              id="issueDesc"
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded resize-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="issueImage"
              className="block font-bold mb-1 dark:text-white"
            >
              {ss} :
            </label>
            {issueImage ? (
              <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                {/* Display issueImage */}
                {issueImage.name.split('_').length > 2
                  ? issueImage.name.split('_')[2]
                  : issueImage.name}
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
                id="issueImage"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              />
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              className="bg-gray-500 text-black py-2 px-4 bg-lightcyan rounded-md hover:bg-gray-600"
              onClick={onClose}
            >
              {cancel}
            </button>
            <button
              type="submit"
              className="bg-honolulublue text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              {save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseIssuePopup;
