import { useLocation } from 'react-router-dom';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import request from '../Service/axios_helper';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type NcpageProps = {
  handleLogout: () => void;
};

const Ncpage: React.FC<NcpageProps> = ({ handleLogout }) => {
  const location = useLocation();
  const caseData = location.state?.caseData || location.state?.caseInfo;
  const [nccase, setNccase] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [officer, setOfficer] = useState<any>(null);
  const [editLabels, setEditLabels] = useState({
    sectionReference: '(कलम १५५ फौजदारी दंड प्रक्रिया संहिता )',
    crimeLocationLabel: '2. गुन्हा घडल्याचे ठिकाण :',
    sectionLabel: '1. कलम व कायदा :',
    crimeDescriptionLabel: '4. तक्राराची थोडक्यात माहिती :',
    witnessLabel: '5. साक्षीदारांची नावे व पूर्ण पत्ते :'
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const ncText = t('nc');
  const { download } = ncText as any;
  const { ncpage } = t('breadcrumb') as any;

  // Fetch officer info from localStorage
  useEffect(() => {
    try {
      const officerData = localStorage.getItem('officer');
      if (officerData) {
        const parsedOfficer = JSON.parse(officerData);
        console.log('🔍 Officer data from localStorage:', parsedOfficer);
        setOfficer(parsedOfficer);
      }
    } catch (error) {
      console.error('Error fetching officer data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    console.log('🔍 NC Page - caseData received:', caseData);
    console.log('🔍 NC Page - caseData type:', typeof caseData);
    console.log('🔍 NC Page - caseData complaintId:', caseData?.complaintId);
    
    if (caseData) {
      // If caseData is a full object, use it directly
      if (typeof caseData === 'object' && caseData.complaintId) {
        console.log('✅ Using full case data for NC:', caseData);
        setNccase(caseData);
        setEditData(caseData);
      } else {
        // If caseData is just a complaintId, fetch the full data
        console.log('📥 Fetching case data for NC');
        fetchCases();
      }
    } else {
      console.log('⚠️ No caseData provided to NC page');
    }
  }, [caseData]);

  const fetchCases = async () => {
    if (!caseData) {
      console.error('No case data provided');
      return;
    }

    // If caseData is already a full object, no need to fetch
    if (typeof caseData === 'object' && caseData.complaintId) {
      return;
    }

    const complaintId = caseData; // caseData is just the complaintId

    try {
      console.log('Fetching statement data for NC report:', complaintId);

      // First test if backend is running
      const testResponse = await request('complaintandfir', 'GET', '/test', {});
      console.log('✅ Backend is running:', testResponse);

      // Fetch the statement data for NC report generation
      const response = await request('complaintandfir', 'GET', `/statements/${complaintId}`, {});
      console.log('Statement data for NC:', response);

      if (response) {
        setNccase(response);
        setEditData(response);
      } else {
        console.error('No statement data received');
        setNccase(null);
        setEditData({});
      }
    } catch (error: any) {
      console.error('Error fetching statement for NC:', error);

      if (error.response?.status === 404) {
        console.error('Statement not found in database');
        setNccase(null);
        setEditData({});
      } else {
        console.error('Backend server error');
        setNccase(null);
        setEditData({});
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(nccase ? { ...nccase } : {});
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editData) {
      setNccase({ ...editData });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(nccase ? { ...nccase } : {});
    setEditLabels({
      sectionReference: '(कलम १५५ फौजदारी दंड प्रक्रिया संहिता )',
      crimeLocationLabel: '2. गुन्हा घडल्याचे ठिकाण :',
      sectionLabel: '1. कलम व कायदा :',
      crimeDescriptionLabel: '4. तक्राराची थोडक्यात माहिती :',
      witnessLabel: '5. साक्षीदारांची नावे व पूर्ण पत्ते :'
    });
  };

  const handleLabelChange = (field: string, value: string) => {
    setEditLabels(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field] ? [...prev[field]] : [],
      [field]: prev[field].map((item: string, i: number) =>
        i === index ? value : item
      )
    }));
  };

  const handleAddArrayItem = (field: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field] ? [...prev[field], ''] : ['']
    }));
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field] ? prev[field].filter((_: string, i: number) => i !== index) : []
    }));
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
        pdf.save(`${(isEditing ? editData?.complainants?.[0] : nccase?.complainants?.[0]) || 'Unknown'}_NC.pdf`);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={ncpage} />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h3 className="flex items-center justify-between text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
          NC Report
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                  type="button"
                  onClick={handleEdit}
                >
                  <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-lightcyan dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                    Edit NC
                  </span>
                </button>
                <button
                  className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
                  type="button"
                  onClick={downloadPDF}
                >
                  <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-lightcyan dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                    {download}
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
          <div className="container mx-auto bg-white p-8 shadow-md border-2 border-gray-300 text-black">
            <h2 className="text-center text-2xl font-bold mb-4 text-black">
              अदखलपात्र गुन्ह्यांचे संबंधातील प्रथम खबरी अहवाल
            </h2>
            <p className="text-center text-black font-semibold mb-8 ">
              {isEditing ? (
                <input
                  type="text"
                  className="w-full text-center border border-gray-400 p-2 text-black font-semibold"
                  value={editLabels.sectionReference}
                  onChange={(e) => handleLabelChange('sectionReference', e.target.value)}
                />
              ) : (
                editLabels.sectionReference
              )}
            </p>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-black font-semibold my-3">
                    पोलिस ठाणे :
                  </span>
                  <span className="p-2 text-black">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-400 p-2 text-black"
                        value={editData?.stationNumber || '1'}
                        onChange={(e) => handleFieldChange('stationNumber', e.target.value)}
                        placeholder="Station Number"
                      />
                    ) : (
                      editData?.stationNumber || '1'
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-black font-semibold my-3">
                    तारीख :
                  </span>
                  <span className="p-2 text-black">
                    {new Date(nccase?.filedDate || nccase?.createdOn || new Date()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-black font-semibold my-3">
                    {isEditing ? (
                      <input
                        type="text"
                        className="border border-gray-400 p-2 text-black font-semibold"
                        value={editLabels.crimeLocationLabel}
                        onChange={(e) => handleLabelChange('crimeLocationLabel', e.target.value)}
                      />
                    ) : (
                      editLabels.crimeLocationLabel
                    )}
                  </span>
                  <span className="p-2 text-black">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-400 p-2 text-black"
                        value={editData?.crimeAddress || editData?.crimeLocation || ''}
                        onChange={(e) => handleFieldChange('crimeAddress', e.target.value)}
                        placeholder="Enter crime location"
                      />
                    ) : (
                      editData?.crimeAddress || editData?.crimeLocation || 'N/A'
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-black font-semibold my-3">
                    तारीख :
                  </span>
                  <span className="text-black">
                    {new Date(nccase?.filedDate || nccase?.createdOn || new Date()).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-black font-semibold my-3">वेळ :</span>
                  <span className="p-2 text-black">
                    {new Date(nccase?.filedDate || nccase?.createdOn || new Date()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-black font-semibold my-3">
                    A. पोलिस ठाण्यास माहिती मिळण्याची -
                  </span>
                </div>
                <div>
                  <span className="text-black font-semibold my-3">
                    तारीख :
                  </span>
                  <span className="text-black">
                    {new Date(nccase?.filedDate || nccase?.createdOn || new Date()).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-black font-semibold my-3">वेळ :</span>
                  <span className="p-2 text-black">
                    {new Date(nccase?.filedDate || nccase?.createdOn || new Date()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-black font-semibold my-3">
                    B. पोलिस ठाणे दैनंदिनी संदर्भ :
                  </span>
                </div>
                <div>
                  <span className="text-black font-semibold my-3">
                    ठा. दै. क्र. :
                  </span>
                  <span className="text-black">
                    {editData?.diaryReference || editData?.stationDiaryNo || `NC-${editData?.complaintId || '0001'}`}
                  </span>
                </div>
                <div>
                  <span className="text-black font-semibold my-3">वेळ :</span>
                  <span className="p-2 text-black">
                    {editData?.diaryTime || new Date(nccase?.filedDate || nccase?.createdOn || new Date()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <div className="border border-black p-2">
                <div className="text-black font-semibold my-3">
                  3.A. तक्रारदारचे नाव व राहण्याचा पत्ता
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {isEditing ? (
                    <div>
                      {(editData?.complainants || []).map((complainant: string, index: number) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            className="flex-1 border border-gray-400 p-2 text-black"
                            value={complainant}
                            onChange={(e) => handleArrayFieldChange('complainants', index, e.target.value)}
                            placeholder={`Complainant ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('complainants', index)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('complainants')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add Complainant
                      </button>
                    </div>
                  ) : (
                    (editData?.complainants || []).map((complainant: string, index: number) =>
                      `${index + 1}. ${complainant}\n`
                    ).join('') || 'No complainant data'
                  )}
                </div>
              </div>
              <div className="border border-black p-2">
                <div className="text-black font-semibold my-3">
                  3.B. विरोधकांची नावे व पत्ता
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {isEditing ? (
                    <div>
                      {(editData?.offenders || []).map((offender: string, index: number) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            className="flex-1 border border-gray-400 p-2 text-black"
                            value={offender}
                            onChange={(e) => handleArrayFieldChange('offenders', index, e.target.value)}
                            placeholder={`Offender ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('offenders', index)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('offenders')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add Offender
                      </button>
                    </div>
                  ) : (
                    (editData?.offenders || []).map((offender: string, index: number) =>
                      `${index + 1}. ${offender}\n`
                    ).join('') || 'No offender data'
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-black font-semibold my-3">
                {isEditing ? (
                  <input
                    type="text"
                    className="border border-gray-400 p-2 text-black font-semibold"
                    value={editLabels.crimeDescriptionLabel}
                    onChange={(e) => handleLabelChange('crimeDescriptionLabel', e.target.value)}
                  />
                ) : (
                  editLabels.crimeDescriptionLabel
                )}
              </label>
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  className="w-full border border-gray-400 p-4 text-black"
                  value={editData?.subject || editData?.description || ''}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
              ) : (
                <div
                  className="w-full border border-gray-400 p-4 text-black whitespace-pre-wrap"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {editData?.subject || editData?.description || 'No crime description available'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-black font-semibold my-3">
                {isEditing ? (
                  <input
                    type="text"
                    className="border border-gray-400 p-2 text-black font-semibold"
                    value={editLabels.witnessLabel}
                    onChange={(e) => handleLabelChange('witnessLabel', e.target.value)}
                  />
                ) : (
                  editLabels.witnessLabel
                )}
              </label>
              {isEditing ? (
                <div>
                  {(editData?.witnesses || []).map((witness: any, index: number) => (
                    <div key={index} className="flex gap-2 mb-2 p-2 border border-gray-300">
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full border border-gray-400 p-2 text-black mb-2"
                          value={witness.name || ''}
                          onChange={(e) => {
                            const updated = [...(editData?.witnesses || [])];
                            updated[index] = { ...witness, name: e.target.value };
                            setEditData({ ...editData, witnesses: updated });
                          }}
                          placeholder={`Witness ${index + 1} Name`}
                        />
                        <textarea
                          className="w-full border border-gray-400 p-2 text-black"
                          value={witness.address || ''}
                          onChange={(e) => {
                            const updated = [...(editData?.witnesses || [])];
                            updated[index] = { ...witness, address: e.target.value };
                            setEditData({ ...editData, witnesses: updated });
                          }}
                          placeholder={`Witness ${index + 1} Address`}
                          rows={2}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editData?.witnesses || []).filter((_: any, i: number) => i !== index);
                          setEditData({ ...editData, witnesses: updated });
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 h-fit"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...(editData?.witnesses || []), { name: '', address: '' }];
                      setEditData({ ...editData, witnesses: updated });
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Witness
                  </button>
                </div>
              ) : (
                <div
                  className="w-full border border-gray-400 p-4 text-black whitespace-pre-wrap"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {(editData?.witnesses || []).length > 0 ? (
                    (editData?.witnesses || []).map((witness: any, index: number) =>
                      `${index + 1}. ${witness.name || 'N/A'}\n${witness.address || 'N/A'}\n\n`
                    ).join('')
                  ) : (
                    'No witness data'
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1 my-3">
              <div className="border border-black p-2">
                <div className="text-black font-semibold my-3">
                  {' '}
                  6. अदखलपात्र अहवालाची प्रत मिळाली, या प्रकरणी फौ. दं. प्र. सं.
                  कलम 155 नुसार संबंधित कोर्टाकडून दाद मिळवण्याची समज मिळाली{' '}
                </div>
                <div className="mt-26 justify-end flex">
                  {editData?.complainants?.[0] || 'Complainant\'s Signature'}
                </div>
              </div>
              <div className="border border-black p-2">
                <div className="text-black font-semibold my-3">
                  ठाणे अंमलदार / कर्तव्यावरील अधिकाऱ्याची स्वाक्षरी{' '}
                </div>
                <div>
                  <span className="text-black font-semibold">नाव :</span>
                  <span className="text-black p-2">
                    {officer?.firstName || editData?.officerName || editData?.filedByOfficer || 'Police Officer'}
                  </span>
                </div>
                <div>
                  <span className="text-black font-semibold">हुद्दा :</span>
                  <span className="text-black p-2">
                    {editData?.officerDesignation || 'Inspector'}
                  </span>
                </div>
                <div className="mt-17 justify-end flex">
                  {officer?.firstName || editData?.officerName || editData?.filedByOfficer || 'Police Officer\'s Signature'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Ncpage;
