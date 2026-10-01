import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type CrimeProps = {
  crimeData: {
    crimeAddress?: string;
    crimeDateTime?: string;
    crimeDescription?: string;
  };
  handleCrimeChange: (data: {
    crimeAddress?: string;
    crimeDateTime?: string;
    crimeDescription?: string;
  }) => void;
};

const Crime = ({ crimeData, handleCrimeChange }: CrimeProps) => {
  const [formData, setFormData] = useState(crimeData || {});
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation();
  const { step, crimeaddress, crimedesc, crimedate, placeholder } = t('crime');

  const handleCrimeRecording = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.lang = 'mr-IN';
      recognitionRef.current.continuous = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        setFormData((prevState) => {
          const updatedData = {
            ...prevState,
            crimeDescription:
              (prevState.crimeDescription || '') + ' ' + transcript,
          };
          handleCrimeChange(updatedData);
          return updatedData;
        });
      };

      recognitionRef.current.onerror = function (event: any) {
        console.error('Speech recognition error', event.error);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      timeoutRef.current = setTimeout(() => {
        recognitionRef.current?.stop();
        setIsRecording(false);
      }, 30000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    handleCrimeChange(updatedData);
  };

  return (
    <div>
      <h3 className="text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {step}
      </h3>
      <div className="grid grid-cols-1 gap-4 p-8">
        <div>
          <label
            htmlFor="crimeAddress"
            className="mb-3 block text-black dark:text-white"
          >
            {crimeaddress}
          </label>
          <input
            type="text"
            id="crimeAddress"
            name="crimeAddress"
            value={formData.crimeAddress || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div>
          <label
            htmlFor="crimeDateTime"
            className="mb-3 block text-black dark:text-white"
          >
            {crimedate}
          </label>
          <div className="flex items-center bg-gray-100">
            <div className="w-64 p-4 border-[1.5px] border-stroke bg-white rounded-lg shadow-md dark:border-form-strokedark dark:bg-form-input dark:text-white">
              <input
                type="datetime-local"
                id="crimeDateTime"
                name="crimeDateTime"
                value={formData.crimeDateTime || ''}
                onChange={handleInputChange}
                className="block mt-1 text-xs lg:text-base text-gray-900 shadow-sm focus:border-honolulublue focus:ring focus:ring-honolulublue focus:ring-opacity-50 dark:focus:ring-honolulublue dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>
        </div>
        <div className="relative">
          <label className="mb-3 block text-black dark:text-white">
            {crimedesc}
          </label>
          <textarea
            rows={Math.max(
              (formData.crimeDescription || '').split('\n').length,
              4,
            )}
            name="crimeDescription"
            placeholder={placeholder}
            value={formData.crimeDescription || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            style={{ minHeight: '4rem' }}
          ></textarea>
          <button
            type="button"
            id="crime-mic"
            onClick={handleCrimeRecording}
            className={`absolute bottom-2 right-2 p-2 rounded-full ${
              isRecording ? 'text-red-500' : 'text-gray-500'
            } hover:text-red-500 focus:outline-none`}
          >
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 2a3 3 0 00-3 3v4a3 3 0 106 0V5a3 3 0 00-3-3z"></path>
              <path d="M5 8a5 5 0 0010 0H14a4 4 0 11-8 0H5z"></path>
              <path d="M10 18a6.978 6.978 0 01-4.6-1.7 1 1 0 011.4-1.4A4.978 4.978 0 0010 16a4.978 4.978 0 003.2-1.1 1 1 0 111.4 1.4A6.978 6.978 0 0110 18z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Crime;
