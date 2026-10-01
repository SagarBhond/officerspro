import { useState, useEffect } from 'react';
import WitnessForm from './WitnessForm';
import { useTranslation } from 'react-i18next';

interface WitnessInfo {
  witnessName: string;
  witnessEmail: string;
  witnessProfession: string;
  witnessGender: string;
  witnessAddress: string;
  witnessAge: string;
  witnessAadharNo: string;
  witnessMobileNo: string;
  witnessStatement: string;
  aadharFile: File | null;
  panFile: File | null;
  passportFile: File | null;
  witnessType: string;
}

interface WitnessFormPageProps {
  witnesses: { [key: number]: WitnessInfo };
  setWitnesses: React.Dispatch<React.SetStateAction<{ [key: number]: WitnessInfo }>>;
  witnessFiles: { [key: number]: { aadharFile?: File; panFile?: File; passportFile?: File } };
  setWitnessFiles: React.Dispatch<React.SetStateAction<{ [key: number]: { aadharFile?: File; panFile?: File; passportFile?: File } }>>;
}

const WitnessFormPage: React.FC<WitnessFormPageProps> = ({
  witnesses,
  setWitnesses,
  witnessFiles,
  setWitnessFiles,
}) => {
  const [witnessCount, setWitnessCount] = useState(0);

  // Initialize witnessCount based on existing witnesses
  useEffect(() => {
    const witnessKeys = Object.keys(witnesses);
    if (witnessKeys.length > 0) {
      const maxIndex = Math.max(...witnessKeys.map(key => parseInt(key)));
      setWitnessCount(maxIndex + 1);
    }
  }, [witnesses]);

  const { t } = useTranslation();
  const witnessinfo = t('witness.witnessinfo');
  const addwitness = t('witness.addwitness');

  const handleAddWitness = () => {
    const newIndex = witnessCount;
    setWitnessCount((prevCount) => prevCount + 1);
    setWitnesses((prevWitnesses) => ({
      ...prevWitnesses,
      [newIndex]: {
        witnessName: '',
        witnessEmail: '',
        witnessProfession: '',
        witnessGender: '',
        witnessAddress: '',
        witnessAge: '',
        witnessAadharNo: '',
        witnessMobileNo: '',
        witnessStatement: '',
        aadharFile: null,
        panFile: null,
        passportFile: null,
        witnessType: '',
      },
    }));
  };

  const handleRemoveWitness = (index: number) => {
    setWitnesses((prevWitnesses) => {
      const updatedWitnesses = { ...prevWitnesses };
      delete updatedWitnesses[index];
      return updatedWitnesses;
    });
    setWitnessFiles((prevFiles) => {
      const updatedFiles = { ...prevFiles };
      delete updatedFiles[index];
      return updatedFiles;
    });
    setWitnessCount((prevCount) => prevCount - 1);
  };

  const handleInputChange = (index: number, e: any) => {
    const { name, value } = e.target;
    setWitnesses((prevState) => ({
      ...prevState,
      [index]: {
        ...prevState[index],
        [name]: value,
      },
    }));
  };

  const handleFileChange = (index: number, e: any) => {
    const { name, files } = e.target;
    const file = files[0];

    setWitnessFiles((prevFiles) => ({
      ...prevFiles,
      [index]: {
        ...prevFiles[index],
        [name]: file,
      },
    }));
  };

  const validateInput = (index: number, name: string, value: string) => {
    // Add validation logic here if needed
  };

  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {witnessinfo}
      </h3>
      {[...Array(witnessCount)].map((_, index) => (
        <WitnessForm
          key={index}
          index={index}
          formData={witnesses[index] || {}}
          errors={{}}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          validateInput={validateInput}
          handleRemoveWitness={handleRemoveWitness}
        />
      ))}
      <div className="flex justify-end">
        <button
          className="relative px-5 py-2.5 mb-2 me-2 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] text-sm transition duration-200 dark:text-white"
          type="button"
          onClick={handleAddWitness}
        >
          {addwitness}
        </button>
      </div>
    </div>
  );
};

export default WitnessFormPage;
