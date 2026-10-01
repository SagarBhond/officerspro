import { useState } from 'react';
import { createPortal } from 'react-dom';

const Firpopup = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [section, setSection] = useState('');

  console.log('🔍 Firpopup component rendered - isOpen:', isOpen);
  console.log('🔍 Props received:', { isOpen, onClose: typeof onClose, onSave: typeof onSave });

  // Use default values for translation if not available
  const translations = {
    heading: 'Register FIR',
    firno: 'FIR Number',
    fir: 'Upload FIR Document',
    shortdesc: 'Description',
    section: 'Section',
    placeholder: 'Enter description...',
    save: 'Save',
    cancel: 'Cancel',
    manualEntry: 'Manual Entry',
    selectSection: 'Select Section',
    enterSection: 'Enter Section Manually'
  };

  const handleSave = () => {
    // Validate that section is entered
    if (!section.trim()) {
      alert('Please enter the Section (IPC/CRPC) before saving.');
      return;
    }

    // Validate that FIR document is uploaded
    if (!file) {
      alert('Please upload the FIR Document before saving.');
      return;
    }

    console.log('💾 Saving FIR with data:', { file: file?.name, description, section });
    onSave({
      file,
      description,
      section: section.trim(),
    });
  };

  const resetForm = () => {
    setFile(null);
    setDescription('');
    setSection('');
  };

  const handleClose = () => {
    console.log('❌ Closing popup');
    resetForm();
    onClose();
  };

  if (!isOpen) {
    console.log('⏭️ Firpopup not open, returning null');
    return null;
  }

  console.log('✅ Firpopup rendering modal content');

  const removeFile = () => {
    setFile(null);
  };

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 10000,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <h2 className="text-xl font-semibold mb-4">{translations.heading}</h2>

        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {translations.section} <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            // placeholder="Enter section (e.g., 302, 307, 376, 498A, etc.)"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {translations.fir} <span className="text-red-500">*</span>
          </label>
          {file ? (
            <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              {file.name}
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
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="mb-3 block text-black dark:text-white">
            {translations.shortdesc}
          </label>
          <textarea
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={translations.placeholder}
            rows={3}
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            onClick={handleClose}
          >
            {translations.cancel}
          </button>
          <button
            className="bg-honolulublue text-white py-2 px-4 rounded-md hover:bg-blue-600"
            onClick={handleSave}
          >
            {translations.save}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Firpopup;
