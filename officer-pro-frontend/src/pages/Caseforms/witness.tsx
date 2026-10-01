import {
  ChangeEvent,
  FormEvent,
  RefObject,
  SetStateAction,
  createRef,
  useRef,
  useState,
} from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import WitnessForm from './WitnessForm';
import request from '../../Service/axios_helper';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
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

type WitnessProps = {
  handleLogout: () => void;
};

const Witness: React.FC<WitnessProps> = ({ handleLogout }) => {
  const [witnessList, setWitnessList] = useState<WitnessInfo[]>([
    {
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
  ]);
  const { victimId } = useParams();
  const [witnessAadhar, setWitnessAadhar] = useState([]);
  const [witnessPan, setWitnessPan] = useState([]);
  const [witnessPassport, setWitnessPassport] = useState([]);
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{
    [key: number]: { [key: string]: string };
  }>({});
  const witnessRefs = useRef<RefObject<HTMLDivElement>[]>([]);

  const handleInputChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const updatedWitnessList = [...witnessList];
    updatedWitnessList[index] = { ...updatedWitnessList[index], [name]: value };
    setWitnessList(updatedWitnessList);
    validateInput(index, name, value);
  };

  const handleFileChange = (
    index: number,
    e: { target: { name: any; files: any[] } },
  ) => {
    const fileInputName = e.target.name;
    const file = e.target.files[0];
    const originalFileName = file.name;

    let updatedFile: SetStateAction<undefined> | File;

    const witnessFileType = fileInputName.split('_')[1];
    const newFileName = `${witnessList[index]?.witnessName}_${witnessFileType}_${originalFileName}`;
    console.log(newFileName);
    updatedFile = new File([file], newFileName, { type: file.type });
    console.log(updatedFile);
    switch (witnessFileType) {
      case 'aadhar':
        setWitnessAadhar((prevFiles) => [...prevFiles, updatedFile]);
        break;
      case 'pan':
        setWitnessPan((prevFiles) => [...prevFiles, updatedFile]);
        break;
      case 'passport':
        setWitnessPassport((prevFiles) => [...prevFiles, updatedFile]);
        break;
      default:
        break;
    }
  };
  const validateInput = (index: number, name: string, value: string) => {
    let error = '';

    if (!value.trim()) {
    } else {
      switch (name) {
        case 'witnessEmail':
          if (
            !value ||
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ) {
            error = 'Invalid email address';
          }
          break;
        case 'witnessMobileNo':
          if (!value || !/^[\d०१२३४५६७८९]{10}$/u.test(value)) {
            error = 'Invalid mobile number, must be 10 digits';
          }
          break;
        case 'witnessAadharNo':
          if (!value || !/^[\d०१२३४५६७८९]{12}$/u.test(value)) {
            error = 'Invalid aadhar number, must be 12 digits';
          }
          break;
        case 'witnessAge':
          if (!value || !/^\d+$/.test(value) || Number(value) <= 0) {
            error = 'Age must be a positive number';
          }
          break;
        case 'witnessName':
          if (
            !value ||
            !/^[\u0900-\u097F\u0041-\u005A\u0061-\u007A\s\-]+$/u.test(value)
          ) {
            error =
              'Invalid Name, must contain only letters, spaces, or hyphens';
          }
          break;
        default:
          break;
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [index]: {
        ...prevErrors[index],
        [name]: error,
      },
    }));
  };

  const handleAddWitness = () => {
    setWitnessList([
      ...witnessList,
      {
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
    ]);
  };

  const handleRemoveWitness = (index: number) => {
    const updatedWitnessList = [...witnessList];
    updatedWitnessList.splice(index, 1);
    setWitnessList(updatedWitnessList);
    setTimeout(() => {
      if (index > 0) {
        const previousElement = witnessRefs.current[index - 1].current;
        if (previousElement) {
          previousElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 0);
  };

  witnessRefs.current = witnessList.map(
    (_, i) => witnessRefs.current[i] ?? createRef(),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    witnessList.forEach((witness, index) => {
      formData.append(
        `witnessDtosJson`,
        JSON.stringify(
          witnessList.map((w) => ({
            witnessName: w.witnessName,
            witnessEmail: w.witnessEmail,
            witnessProfession: w.witnessProfession,
            witnessGender: w.witnessGender,
            witnessAddress: w.witnessAddress,
            witnessAge: w.witnessAge,
            witnessAadharNo: w.witnessAadharNo,
            witnessMobileNo: w.witnessMobileNo,
            witnessStatement: w.witnessStatement,
            witnessType: w.witnessType,
          })),
        ),
      );

      if (witnessAadhar) {
        witnessAadhar.forEach((file) => {
          formData.append('files', file);
        });
      }
      if (witnessPan) {
        witnessPan.forEach((file) => {
          formData.append('files', file);
        });
      }
      if (witnessPassport) {
        witnessPassport.forEach((file) => {
          formData.append('files', file);
        });
      }
    });

    try {
      const response = await request(
        'cms',
        'POST',
        `/${victimId}/witnesses`,
        formData,
      );

      if (response) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Your witness has been added successfully!',
        });
        navigate('/viewwitnesscase');
      } else {
        throw new Error('Failed to submit the form:', response);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...not added',
        text: 'Something went wrong! Please try again later.',
      });
    }
  };
  const { t } = useTranslation();
  const { addwitness } = t('breadcrumb');
  const { addanotherwitness, submit } = t('witness');

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={addwitness} />
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="col-span-1 w-full sm:col-span-2">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <div id="witness-section" className=" p-7">
                {witnessList.map((witness, index) => (
                  <div key={index} ref={witnessRefs.current[index]}>
                    <WitnessForm
                      index={index}
                      formData={witness}
                      errors={errors[index] || {}}
                      handleInputChange={handleInputChange}
                      handleFileChange={handleFileChange}
                      validateInput={validateInput}
                      handleRemoveWitness={handleRemoveWitness}
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    onClick={handleAddWitness}
                    className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  >
                    {addanotherwitness}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  >
                    {submit}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Witness;
