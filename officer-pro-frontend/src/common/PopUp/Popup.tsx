import React from 'react';
import Swal from 'sweetalert2';

interface PopupProps {
  isOpen: boolean;
  onContinue: () => void;
  onLogout: () => void;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onContinue, onLogout }) => {
  React.useEffect(() => {
    if (isOpen) {
      Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired. What would you like to do?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Logout',
        customClass: {
          container: 'z-50',
          popup: 'bg-white p-6 rounded-lg text-center',
          title: 'text-lg font-semibold',
          confirmButton: 'bg-blue-500 text-white px-4 py-2 rounded-lg',
          cancelButton: 'bg-red-500 text-white px-4 py-2 rounded-lg ml-2',
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          onContinue();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          onLogout();
        }
      });
    }
  }, [isOpen, onContinue, onLogout]);

  return null;
};

export default Popup;
