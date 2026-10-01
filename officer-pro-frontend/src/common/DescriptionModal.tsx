import React from 'react';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  title?: string;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({
  isOpen,
  onClose,
  description,
  title = 'Description'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white dark:bg-boxdark rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke dark:border-strokedark">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <p className="text-sm text-black dark:text-white whitespace-pre-wrap">
            {description || 'No description available'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-stroke dark:border-strokedark">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionModal;
