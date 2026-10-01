import { useState } from 'react';
import Evidence from './Evidence';
import { useTranslation } from 'react-i18next';

interface EvidencePageProps {
  evidence: any;
  setEvidence: (evidence: any) => void;
  evidenceData: { [key: number]: File[] };
  setEvidenceData: (data: { [key: number]: File[] }) => void;
  handleEvidenceChange: (e: any, index: number) => void;
  handleEvidenceDataChange: (files: File[], evidenceIndex: number) => void;
  existingEvidenceDocs?: { [key: number]: any[] };
  onRemoveExistingDocument?: (evidenceIndex: number, docIndex: number) => void;
  onRemoveEvidenceEntry?: (evidenceIndex: number, existingDocs: any[]) => void;
}

const EvidencePage = ({
  evidence,
  setEvidence,
  evidenceData,
  setEvidenceData,
  handleEvidenceChange,
  handleEvidenceDataChange,
  existingEvidenceDocs = {},
  onRemoveExistingDocument,
  onRemoveEvidenceEntry,
}: EvidencePageProps) => {
  const [evidenceCount, setEvidenceCount] = useState(Object.keys(evidence).length || 1);

  const { t } = useTranslation();
  const evidencetitle = t('evidence.evidencetitle');
  const addevidence = t('evidence.addevidence');

  const handleAddEvidence = () => {
    // Find the next available index
    const existingKeys = Object.keys(evidence).map(k => parseInt(k));
    const nextIndex = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 0;
    
    setEvidenceCount((prevCount: number) => prevCount + 1);
    setEvidence((prevEvidence: any) => ({
      ...prevEvidence,
      [nextIndex]: {
        evidenceName: '',
        description: '',
        evidenceType: '',
        fileType: '',
        location: '',
      },
    }));
  };

  const handleRemoveEvidence = (index: number) => {
    // Don't allow removing if only one evidence entry remains
    if (evidenceCount <= 1) {
      console.log('Cannot remove the last evidence entry');
      return;
    }
    
    // Get existing documents for this evidence entry before removing
    const existingDocs = existingEvidenceDocs[index] || [];
    
    // Notify parent to mark existing documents for deletion
    if (onRemoveEvidenceEntry && existingDocs.length > 0) {
      onRemoveEvidenceEntry(index, existingDocs);
    }
    
    setEvidence((prevEvidence: any) => {
      const updatedEvidence = { ...prevEvidence };
      delete updatedEvidence[index];
      return updatedEvidence;
    });
    
    // Also clear the evidence data (files) for this index
    const updatedEvidenceData = { ...evidenceData };
    delete updatedEvidenceData[index];
    setEvidenceData(updatedEvidenceData);
    
    setEvidenceCount((prevCount: number) => Math.max(1, prevCount - 1));
  };

  // Get the actual evidence keys to render
  const evidenceKeys = Object.keys(evidence).map(k => parseInt(k)).sort((a, b) => a - b);
  
  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {evidencetitle}
      </h3>
      {evidenceKeys.map((index) => (
        <Evidence
          key={index}
          index={index}
          evidence={evidence}
          handleEvidenceChange={handleEvidenceChange}
          handleEvidenceDataChange={handleEvidenceDataChange}
          removeEvidence={handleRemoveEvidence}
          initialFiles={evidenceData[index] || []}
          existingDocuments={existingEvidenceDocs[index] || []}
          onRemoveExistingDocument={onRemoveExistingDocument}
        />
      ))}
      <div className="flex justify-end">
        <button
          className="relative px-5 py-2.5 mb-2 me-2 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] text-sm transition duration-200 dark:text-white"
          type="button"
          onClick={handleAddEvidence}
        >
          {addevidence}
        </button>
      </div>
    </div>
  );
};

export default EvidencePage;
