import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import DescriptionModal from '../../common/DescriptionModal';

interface PreviewSectionProps {
  complaineeList: any[];
  offenderList: any[];
  crimeData: any;
  witnesses?: any[];
  officer?: any; // Add officer prop
  onComplaineeChange?: (index: number, updatedData: any) => void;
  onOffenderChange?: (index: number, updatedData: any) => void;
  onCrimeChange?: (updatedData: any) => void;
}

const Previewstatement: React.FC<PreviewSectionProps> = ({
  complaineeList,
  offenderList,
  crimeData,
  witnesses = [],
  officer,
  onComplaineeChange,
  onOffenderChange,
  onCrimeChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    complainee: complaineeList[0] || {},
    crimeData: crimeData || {}
  });
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  const { t } = useTranslation();
  const { statementpreview } = t('registerstatement') as any;

  // Helper function to open description modal
  const openDescriptionModal = (text: string) => {
    setSelectedDescription(text);
    setIsDescriptionModalOpen(true);
  };

  // Helper function to render description with "See More" link
  const renderDescription = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    
    const needsSeeMore = text.length > maxLength;
    
    return (
      <div>
        <p className="text-black text-sm whitespace-pre-wrap">
          {text.substring(0, maxLength)}{needsSeeMore ? '...' : ''}
        </p>
        {needsSeeMore && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openDescriptionModal(text);
            }}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2"
          >
            See More
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editData.crimeData.crimeDescription]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      complainee: complaineeList[0] || {},
      crimeData: crimeData || {}
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onComplaineeChange && editData.complainee) {
      onComplaineeChange(0, editData.complainee);
    }
    if (onCrimeChange && editData.crimeData) {
      onCrimeChange(editData.crimeData);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      complainee: complaineeList[0] || {},
      crimeData: crimeData || {}
    });
  };

  const handleFieldChange = (field: string, value: string, isComplainee: boolean = true) => {
    if (isComplainee) {
      setEditData(prev => ({
        ...prev,
        complainee: { ...prev.complainee, [field]: value }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        crimeData: { ...prev.crimeData, [field]: value }
      }));
    }
  };

  const downloadPDF = () => {
    const input = document.getElementById('pdf-content');
    if (!input) return;

    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${complaineeList[0]?.name || 'complainee'}_statement.pdf`);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };

  const currentComplainee = isEditing ? editData.complainee : complaineeList[0];
  const currentCrimeData = isEditing ? editData.crimeData : crimeData;

  return (
    <div className="container">
      <h3 className="flex items-center justify-between text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {statementpreview}
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                type="button"
                onClick={handleEdit}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-lightcyan dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                  Edit Statement
                </span>
              </button>
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
                type="button"
                onClick={downloadPDF}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-lightcyan dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                  Download PDF
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white"
                type="button"
                onClick={handleSave}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-lightcyan dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                  Save Changes
                </span>
              </button>
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-red-600 group-hover:from-red-400 group-hover:to-red-600 hover:text-white dark:text-white"
                type="button"
                onClick={handleCancel}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-lightcyan dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                  Cancel
                </span>
              </button>
            </>
          )}
        </div>
      </h3>
      <div className="content" id="pdf-content">
        <div className="container mx-auto bg-white p-3 shadow-lg border border-gray-300 text-black max-w-4xl">
          {/* Header with Logo and Police Information */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="text-center mb-2">
                <h1 className="text-xl font-bold text-black uppercase tracking-wide mb-1">
                  महाराष्ट्र पोलीस
                </h1>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  Maharashtra Police
                </p>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p><strong>पोलीस स्टेशन:</strong> {currentCrimeData?.stationId || 'Unknown Station'}</p>
                  <p><strong>तक्रार क्रमांक:</strong> {Math.floor(Math.random() * 1000000)}</p>
                  <p><strong>तारीख:</strong> {new Date().toLocaleDateString('mr-IN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section IDs */}
          <div className="mb-2 text-center">
            <div className="inline-block px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
              <span className="font-semibold text-gray-800">
                कलमे: {offenderList
                  .map((offender) => offender.sectionId)
                  .filter((id) => id !== null && id !== undefined)
                  .join(', ') || 'नमूद करा'}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-3">
            {/* Complainant Information */}
            <div className="p-3 rounded-lg">
              <h3 className="text-lg font-bold mb-2 text-gray-800">
                तक्रारदाराची माहिती (Complainant Information)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-16 flex-shrink-0 text-sm">नाव:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="flex-1 border-b border-gray-400 pb-1 text-black focus:border-gray-600 focus:outline-none text-sm"
                        value={currentComplainee?.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value, true)}
                      />
                    ) : (
                      <span className="flex-1 text-black text-sm">{currentComplainee?.name}</span>
                    )}
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-16 flex-shrink-0 text-sm">वय:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className="flex-1 border-b border-gray-400 pb-1 text-black focus:border-gray-600 focus:outline-none text-sm"
                        value={currentComplainee?.age || ''}
                        onChange={(e) => handleFieldChange('age', e.target.value, true)}
                      />
                    ) : (
                      <span className="flex-1 text-black text-sm">{currentComplainee?.age}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-16 flex-shrink-0 text-sm">व्यवसाय:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="flex-1 border-b border-gray-400 pb-1 text-black focus:border-gray-600 focus:outline-none text-sm"
                        value={currentComplainee?.profession || ''}
                        onChange={(e) => handleFieldChange('profession', e.target.value, true)}
                      />
                    ) : (
                      <span className="flex-1 text-black text-sm">{currentComplainee?.profession}</span>
                    )}
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-16 flex-shrink-0 text-sm">पत्ता:</span>
                    <span className="flex-1 text-black text-sm">{currentComplainee?.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Witness Information */}
            {witnesses && witnesses.length > 0 && (
              <div className="p-3 rounded-lg">
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  साक्षीदार माहिती (Witness Information)
                </h3>
                <div className="space-y-2">
                  {witnesses.map((witness, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      <p className="text-black text-sm">
                        <strong>साक्षीदार {index + 1}:</strong> {witness.witnessName || 'नाव नमूद करा'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crime Details */}
            <div className="p-3 rounded-lg">
              <h3 className="text-lg font-bold mb-2 text-gray-800">
                गुन्ह्याची माहिती (Crime Details)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-20 flex-shrink-0 text-sm">घटनास्थळ:</span>
                  <span className="flex-1 text-black text-sm">{currentCrimeData?.crimeAddress || 'घटनास्थळ नमूद करा'}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-20 flex-shrink-0 text-sm">तारीख आणि वेळ:</span>
                  <span className="flex-1 text-black text-sm">
                    {currentCrimeData?.crimeDateTime ?
                      new Date(currentCrimeData.crimeDateTime).toLocaleString('mr-IN') :
                      'तारीख आणि वेळ नमूद करा'}
                  </span>
                </div>
              </div>
            </div>

            {/* Statement Description */}
            <div className="p-3 rounded-lg">
              <h3 className="text-lg font-bold mb-2 text-gray-800">
                तक्रार तपशील (Statement Details)
              </h3>
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  className="w-full border-2 border-gray-400 p-2 text-black rounded focus:border-gray-600 focus:outline-none text-sm"
                  value={currentCrimeData?.crimeDescription || ''}
                  onChange={(e) => handleFieldChange('crimeDescription', e.target.value, false)}
                  style={{ resize: 'vertical', minHeight: '100px' }}
                  placeholder="तक्रार तपशील लिहा..."
                />
              ) : (
                <div className="w-full border-2 border-gray-300 p-2 text-black bg-white rounded text-sm" style={{ minHeight: '100px' }}>
                  {renderDescription(currentCrimeData?.crimeDescription || 'तक्रार तपशील नमूद करा', 1000)}
                </div>
              )}
            </div>

            {/* Signature Section */}
            <div className="mt-4 pt-3 border-t-2 border-gray-400">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="border-b-2 border-gray-400 w-full h-12 mb-2 flex items-end justify-center">
                    <span className="text-xs text-gray-600 mb-1">
                      {complaineeList[0]?.name || 'तक्रारदाराची सही'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">
                    Complainant's Signature
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-gray-400 w-full h-12 mb-2 flex items-end justify-center">
                    <span className="text-xs text-gray-600 mb-1">
                      {officer?.name || 'पोलीस सही'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">
                    Police Signature
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {officer?.designation || officer?.stationName || 'Police Officer'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 text-center text-xs text-gray-600 border-t pt-2">
            <p className="mb-1">
              <strong>प्रमाणीकरण:</strong> ही तक्रार मी स्वतः दिली आहे आणि ती खरी आहे. मी दिलेली माहिती चुकीची असल्यास मला कायदेशीर कारवाईला सामोरे जावे लागेल हे मला माहीत आहे.
            </p>
            <p>
              <em><strong>Verification:</strong> I have given this complaint personally and it is true. I am aware that I may face legal action if the information provided is incorrect.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Description Modal */}
      <DescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        description={selectedDescription}
        title="Statement Details"
      />
    </div>
  );
};

export default Previewstatement;
