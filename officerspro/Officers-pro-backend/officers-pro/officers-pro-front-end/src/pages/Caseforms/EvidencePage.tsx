import { useState } from 'react';
import Evidence from './Evidence';
import { useTranslation } from 'react-i18next';

const EvidencePage = ({
  evidence,
  setEvidence,
  evidenceData,
  handleEvidenceChange,
  handleEvidenceDataChange,
}) => {
  const [evidenceCount, setEvidenceCount] = useState(1);

  const { t } = useTranslation();
  const { evidencetitle, addevidence } = t('evidence');

  const handleAddEvidence = () => {
    setEvidenceCount((prevCount) => prevCount + 1);
    setEvidence((prevEvidence) => ({
      ...prevEvidence,
      [evidenceCount]: {
        evidenceName: '',
        description: '',
        evidenceType: '',
        fileType: '',
      },
    }));
  };

  const handleRemoveEvidence = (index) => {
    setEvidence((prevEvidence) => {
      const updatedEvidence = { ...prevEvidence };
      delete updatedEvidence[index];
      return updatedEvidence;
    });
    setEvidenceCount((prevCount) => prevCount - 1);
  };

  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {evidencetitle}
      </h3>
      {[...Array(evidenceCount)].map((_, index) => (
        <Evidence
          key={index}
          index={index}
          evidence={evidence}
          evidenceData={evidenceData}
          handleEvidenceChange={handleEvidenceChange}
          handleEvidenceDataChange={handleEvidenceDataChange}
          removeEvidence={handleRemoveEvidence}
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
