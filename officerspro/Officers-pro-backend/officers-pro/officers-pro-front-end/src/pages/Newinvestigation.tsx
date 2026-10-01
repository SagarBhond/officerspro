import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import EvidencePage from '../pages/Caseforms/EvidencePage';
import request from '../Service/axios_helper';
import Swal from 'sweetalert2';
import Loader from '../common/Loader';
import { useTranslation } from 'react-i18next';

type NewInvestigationProps = {
  handleLogout: () => void;
};

const NewInvestigation: React.FC<NewInvestigationProps> = ({
  handleLogout,
}) => {
  const { victimId } = useParams();
  const [data, setData] = useState(null);
  const [investDay, setInvestDay] = useState(1);
  const [caseStatus, setCaseStatus] = useState('');
  const [offenders, setOffenders] = useState([]);
  const [investigationDetails, setInvestigationDetails] = useState({
    investDescription: '',
  });
  const [evidence, setEvidence] = useState({
    0: {
      evidenceName: '',
      description: '',
      evidenceType: '',
      fileType: '',
    },
  });
  const [evidenceData, setEvidenceData] = useState([]);
  const [showEvidence, setShowEvidence] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { newinvestigation } = t('breadcrumb');
  const { selectstatus, arrested, not_arrested, not_accessible, escaped } =
    t('profileedit');
  const {
    investday,
    complete,
    choosestatus,
    inprogress,
    arreststatus,
    date,
    investdesc,
    casestatus,
    removeevidence,
    placeholder,
    addevidence,
    submit,
  } = t('newinvestigation');

  useEffect(() => {
    const fetchOfficerCaseDiary = async () => {
      try {
        const response = await request(
          'cms',
          'GET',
          `/getCaseDiary/${victimId}`,
          {},
        );

        if (response) {
          setData(response);
          setInvestDay((response.investigationDetailsList?.length || 0) + 1);
          setCaseStatus(response.victimList?.[0]?.caseStatus || '');
          setOffenders(response.victimList?.[0]?.offenderList || []);
        }
      } catch (error) {
        console.error("Error fetching victim's case diary:", error);
      }
    };
    fetchOfficerCaseDiary();
  }, [victimId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvestigationDetails((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleArrestedStatusChange = (index, value) => {
    setOffenders((prevOffenders) =>
      prevOffenders.map((offender, i) =>
        i === index ? { ...offender, arrestedStatus: value } : offender,
      ),
    );
  };

  const handleCaseStatusChange = (e) => {
    setCaseStatus(e.target.value);
  };

  const handleEvidenceChange = (e, index) => {
    const { name, value } = e.target;
    setEvidence((prevState) => ({
      ...prevState,
      [index]: {
        ...prevState[index],
        [name]: value,
      },
    }));
  };

  const handleEvidenceDataChange = (file, evidenceName) => {
    const newFileName = `${evidenceName}_${file.name}`;
    const updatedFile = new File([file], newFileName, { type: file.type });

    setEvidenceData((prevFiles) => {
      const existingFileIndex = prevFiles.findIndex((f) =>
        f.name.startsWith(evidenceName),
      );
      if (existingFileIndex > -1) {
        const updatedFiles = [...prevFiles];
        updatedFiles[existingFileIndex] = updatedFile;
        return updatedFiles;
      } else {
        return [...prevFiles, updatedFile];
      }
    });
  };

  if (!data) {
    return <Loader />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const updateInvestigationDto = {
        victimId,
        caseStatus,
        offenderList: offenders.map((offender) => ({
          offenderId: offender.offenderId,
          arrestedStatus: offender.arrestedStatus,
        })),
        investigationDetails,
      };

      // First API call to update investigation
      const investigationResponse = await request(
        'cms',
        'PUT',
        '/updateInvestigation',
        updateInvestigationDto,
      );
      console.log('Investigation Response:', investigationResponse);

      if (investigationResponse) {
        if (showEvidence && evidenceData.length > 0) {
          // If evidence is added, prepare form data for evidence
          const formData = new FormData();
          formData.append('victimId', victimId);
          formData.append('newEvidence', JSON.stringify(evidence));

          evidenceData.forEach((file) => {
            formData.append('newEvidenceFiles', file);
          });
          // Second API call to update evidence
          const evidenceResponse = await request(
            'cms',
            'PUT',
            '/updateEvidence',
            formData,
          );

          if (evidenceResponse) {
            Swal.fire({
              title: 'Success!',
              text: 'Investigation and evidence updated successfully!',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then((result) => {
              if (result.isConfirmed) {
                navigate(`/casediarypreview/${victimId}`);
              }
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Failed to update the evidence.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        } else {
          Swal.fire({
            title: 'Success!',
            text: 'Investigation updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              navigate(`/casediarypreview/${victimId}`);
            }
          });
        }
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update the investigation.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update the investigation and evidence.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'mr-IN';
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setIsRecording(true);
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInvestigationDetails((prevState) => ({
        ...prevState,
        investDescription:
          `${prevState.investDescription} ${transcript}`.trim(),
      }));
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error detected: ' + event.error);
      setIsRecording(false);
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);

    setTimeout(() => {
      stopRecording();
    }, 30000);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={newinvestigation} />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mx-13 mb-4">
        <h3 className="flex items-center justify-between text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
          {investday} {investDay}
          <span className="">
            {date} :{' '}
            {new Date().toLocaleString('mr-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              weekday: 'long',
            })}
          </span>
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 px-8 pb-2 pt-8">
            {offenders.map((offender, index) => (
              <div key={index}>
                <label
                  htmlFor={`arrestedStatus-${index}`}
                  className="mt-3 block text-black dark:text-white font-semibold"
                >
                  {arreststatus} : {offender.offenderName}
                </label>
                <select
                  id={`arrestedStatus-${index}`}
                  name={`arrestedStatus-${index}`}
                  value={offender.arrestedStatus}
                  onChange={(e) =>
                    handleArrestedStatusChange(index, e.target.value)
                  }
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">{selectstatus}</option>
                  <option value="Arrested">{arrested}</option>
                  <option value="Not Reachable">{not_arrested}</option>
                  <option value="Escaped">{escaped}</option>
                  <option value="Not Reachable">{not_accessible}</option>
                </select>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 px-8 pb-2">
            <label
              htmlFor={caseStatus}
              className="mt-3 block text-black dark:text-white font-semibold"
            >
              {casestatus} :
            </label>
            <select
              id="caseStatus"
              name="caseStatus"
              value={caseStatus}
              onChange={handleCaseStatusChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="" disabled>
                {choosestatus}
              </option>
              <option value="in progress">{inprogress}</option>
              <option value="completed">{complete}</option>
            </select>
          </div>
          <div className="relative grid grid-cols-1 px-8 pb-8">
            <label
              htmlFor="investDescription"
              className="mt-3 block text-black dark:text-white font-semibold"
            >
              {investdesc} :
            </label>
            <textarea
              rows={Math.max(
                (investigationDetails.investDescription || '').split('\n')
                  .length,
                4,
              )}
              name="investDescription"
              placeholder={placeholder}
              value={investigationDetails.investDescription}
              onChange={handleChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              style={{ minHeight: '4rem' }}
            ></textarea>
            <button
              type="button"
              id="crime-mic"
              onClick={handleRecording}
              className={`absolute bottom-8 right-8 ${
                isRecording ? 'text-red-500' : 'text-gray-500'
              } p-2 rounded-full  hover:text-red-500 focus:outline-none`}
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
          {showEvidence && (
            <div>
              <EvidencePage
                evidence={evidence}
                setEvidence={setEvidence}
                evidenceData={evidenceData}
                setEvidenceData={setEvidenceData}
                handleEvidenceChange={handleEvidenceChange}
                handleEvidenceDataChange={handleEvidenceDataChange}
              />
            </div>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowEvidence(!showEvidence)}
              className="relative inline-flex items-center justify-center p-0.5 mb-2 ml-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 dark:bg-graydark">
                {showEvidence ? <p>{removeevidence}</p> : <p>{addevidence}</p>}
              </span>
            </button>

            <button
              type="submit"
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                {submit}
              </span>
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default NewInvestigation;
