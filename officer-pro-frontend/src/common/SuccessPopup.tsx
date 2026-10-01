import React from 'react';
import '../css/success-popup.css';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string[];
  type?: 'success' | 'error';
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  details = [],
  type = 'success'
}) => {
  console.log('🎉 SuccessPopup render - isOpen:', isOpen, 'title:', title, 'type:', type);
  
  // Removed auto-close functionality - popup only closes on OK button click

  if (!isOpen) {
    console.log('❌ SuccessPopup not rendering - isOpen is false');
    return null;
  }
  
  console.log('✅ SuccessPopup rendering - popup should be visible');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isSuccess = type === 'success';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ zIndex: 9999 }}
    >
      <div className={`rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 ${isSuccess ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
        {/* Icon and Title */}
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
            {isSuccess ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-xl font-bold text-center mb-3 ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
          {title}
        </h2>

        {/* Message - Only show if message is not empty */}
        {message && (
          <p className={`text-center mb-6 leading-relaxed ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
            {message}
          </p>
        )}

        {/* OK Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSuccess
                ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
