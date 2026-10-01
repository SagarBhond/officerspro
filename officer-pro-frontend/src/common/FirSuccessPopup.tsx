import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface FirSuccessPopupProps {
  isOpen: boolean;
  firId: string;
  complaintId: string;
}

const FirSuccessPopup: React.FC<FirSuccessPopupProps> = ({ isOpen, firId, complaintId }) => {
  const navigate = useNavigate();

  console.log('🎉 FirSuccessPopup rendered - isOpen:', isOpen, 'firId:', firId, 'complaintId:', complaintId);

  useEffect(() => {
    if (isOpen) {
      console.log('✅ FirSuccessPopup displaying SweetAlert');
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'FIR registered successfully!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6366f1',
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('🔄 Navigating to registered cases...');
          navigate('/registeredCases');
        }
      });
    }
  }, [isOpen, navigate]);

  return null;
};

export default FirSuccessPopup;
