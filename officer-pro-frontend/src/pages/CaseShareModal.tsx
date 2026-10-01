import { useState } from 'react';
import Swal from 'sweetalert2';

const CaseShareModal = ({ isOpen, onClose, onShare, victimId, officerId }) => {
  const [officerEmail, setOfficerEmail] = useState('');

  const handleShare = () => {
    if (officerEmail) {
      onShare(officerEmail);
    } else {
      Swal.fire('Error', 'Please enter an officer email', 'error');
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-default dark:border-strokedark dark:bg-boxdark">
          <h2 className="text-xl font-semibold mb-4">Share Case</h2>
          <div className="mb-4">
            <label className="mb-3 block text-black dark:text-white">
              Officer Email :
            </label>
            <input
              type="email"
              placeholder="Officer Email"
              value={officerEmail}
              onChange={(e) => setOfficerEmail(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="bg-gray-500 text-black py-2 px-4 bg-lightcyan rounded-md hover:bg-gray-600"
              onClick={onClose}
            >
              cancel
            </button>
            <button
              type="button"
              className="bg-honolulublue text-white py-2 px-4 rounded-md hover:bg-blue-600"
              onClick={handleShare}
            >
              share
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default CaseShareModal;
