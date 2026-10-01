import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import request from '../../Service/axios_helper';

const RaiseIssuePopup: React.FC<{
  officerId: string;
  uuid: string;
  onClose: () => void;
}> = ({ officerId, uuid, onClose }) => {
  const [subject, setSubject] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueImage, setIssueImage] = useState<File | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDocumentId, setExistingDocumentId] = useState<number | null>(null);

  const { t } = useTranslation();
  const { title1, title2, subjects, desc, ss, cancel, save } = t('raiseissue', { returnObjects: true }) as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (uuid) {
          // Use request() function with JWT token instead of fetch()
          const data = await request('support', 'GET', `/tickets/${uuid}`, null);
          // request() returns data directly, not response object
          if (data && data.subject) {
            setSubject(data.subject);
            setIssueDesc(data.description);
            setIsNew(false);
            // Store existing document ID if available
            if (data.attachmentDocumentId) {
              setExistingDocumentId(data.attachmentDocumentId);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      }
    };

    fetchData();
  }, [uuid]);

  // Upload file to document service
  const uploadFileToDocumentService = async (file: File, ticketId: string, uploadedBy: number): Promise<number | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('linkedTo', 'SUPPORT_TICKET');
      formData.append('linkId', ticketId);
      formData.append('tag', 'screenshot');
      formData.append('uploadedBy', uploadedBy.toString());

      console.log('📤 Uploading file to document service...');
      const response = await request('documents', 'POST', '/upload', formData);
      
      if (response && response.documentId) {
        console.log('✅ File uploaded successfully, documentId:', response.documentId);
        return response.documentId;
      }
      return null;
    } catch (error) {
      console.error('❌ Error uploading file to document service:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Validate officerId
    if (!officerId || officerId === 'undefined' || officerId === 'null') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found. Please refresh the page and try again.',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Convert UUID to hash-based integer for help-support-service compatibility
    const hashUserId = (uuid: string): number => {
      let hash = 0;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    };

    const numericUserId = hashUserId(officerId);
    console.log('Converting UUID:', officerId, 'to integer:', numericUserId);

    try {
      let ticketId = uuid;
      let documentId: number | null = existingDocumentId;

      // If creating a new ticket, create it first to get the ticket ID
      if (isNew) {
        const ticketData = {
          raisedByUserId: numericUserId,
          subject: subject,
          description: issueDesc,
          createdBy: numericUserId,
        };
        
        const data = await request('support', 'POST', '/tickets', ticketData);
        if (data && data.ticketId) {
          ticketId = data.ticketId.toString();
          console.log('✅ Ticket created with ID:', ticketId);
        } else {
          throw new Error('Failed to create ticket');
        }
      }

      // Upload file to document service if a file is selected
      if (issueImage && ticketId) {
        const uploadedDocId = await uploadFileToDocumentService(issueImage, ticketId, numericUserId);
        if (uploadedDocId) {
          documentId = uploadedDocId;
        }
      }

      // Update ticket with document ID if we have one (for both new and existing tickets)
      if (!isNew || documentId) {
        const updateData = {
          raisedByUserId: numericUserId,
          subject: subject,
          description: issueDesc,
          createdBy: numericUserId,
          attachmentDocumentId: documentId,
        };
        
        await request('support', 'PUT', `/tickets/${ticketId}`, updateData);
        console.log('✅ Ticket updated with document ID:', documentId);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: isNew
          ? 'Ticket submitted successfully!'
          : 'Ticket updated successfully!',
      });
      onClose();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while processing your request. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
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
              type="button"
              className="bg-gray-500 text-black py-2 px-4 bg-lightcyan rounded-md hover:bg-gray-600 disabled:opacity-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancel}
            </button>
            <button
              type="submit"
              className="bg-honolulublue text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                save
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseIssuePopup;
