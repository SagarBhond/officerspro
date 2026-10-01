import { useTranslation } from 'react-i18next';
import Offender from './Offender';

const Offenderpage = ({
  offenderList,
  handleAddOffender,
  handleOffenderChange,
  handleFileChange,
  offenderAadhar,
  offenderPan,
  offenderPassport,
  removeFile,
  removeOffender,
}) => {
  
  const { t } = useTranslation();
  const { addOffenderLabel } = t('offender');
  return (
    <div>
      {offenderList.map((offender, index) => (
        <Offender
          key={`offender-${offender?.citizenId}-${index}`}
          index={index}
          offender={offender}
          handleOffenderChange={handleOffenderChange}
          handleFileChange={handleFileChange}
          offenderAadhar={offenderAadhar}
          offenderPan={offenderPan}
          offenderPassport={offenderPassport}
          removeFile={removeFile}
          removeOffender={removeOffender}
        />
      ))}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAddOffender}
          className="relative px-5 py-2.5 mb-2 me-2 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] text-sm transition duration-200 dark:text-white"
        >
          {addOffenderLabel}
        </button>
      </div>
    </div>
  );
};

export default Offenderpage;
