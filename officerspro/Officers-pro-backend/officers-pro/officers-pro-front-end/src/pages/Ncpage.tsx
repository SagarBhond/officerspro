import { useLocation } from 'react-router-dom';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import request from '../Service/axios_helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type NcpageProps = {
  handleLogout: () => void;
};

const Ncpage: React.FC<NcpageProps> = ({ handleLogout }) => {
  const location = useLocation();
  const victimId = location.state?.caseInfo;
  const [nccase, setNccase] = useState();
  const { t } = useTranslation();
  const { nc, download } = t('nc');
  const { ncpage } = t('breadcrumb');

  useEffect(() => {
    fetchCases();
  }, [victimId]);

  const fetchCases = () => {
    request('cms', 'GET', `/getCaseDiary/${victimId}`, {})
      .then((res) => {
        console.log(res);
        setNccase(res);
      })
      .catch((err) => {
        console.log(err);
      });
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
        pdf.save(`${nccase?.victimList[0].victimName}_NC.pdf`);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={ncpage} />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
        <h3 className=" flex items-center justify-between text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
          {nc}
          <button
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
            type="button"
            onClick={downloadPDF}
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-lightcyan dark:bg-graydark rounded-md group-hover:bg-opacity-0">
              {download}
            </span>
          </button>
        </h3>
        <div className="content" id="pdf-content">
          <div className="container mx-auto bg-white p-8 shadow-md border-2 border-gray-300 text-black">
            <h2 className="text-center text-2xl font-bold mb-4 text-black">
              अदखलपात्र गुन्ह्यांचे संबंधातील प्रथम खबरी अहवाल
            </h2>
            <p className="text-center text-black font-semibold mb-8 ">
              (कलम १५५ फौजदारी दंड प्रक्रिया संहिता )
            </p>

            <div className="grid grid-cols-1 gap-4 mb-6 ">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className=" text-black font-semibold my-3">
                    पोलिस ठाणे :
                  </span>
                  <span className=" p-2 text-black">
                    {nccase?.officerStation}
                  </span>
                </div>
                <div>
                  <span className=" text-black font-semibold my-3">
                    अदखलपात्र गुन्हा नोंदणी क्र. :
                  </span>
                  <span className=" p-2 text-black"></span>
                </div>
                <div>
                  <span className=" text-black font-semibold my-3">
                    तारीख :
                  </span>
                  <span className=" p-2 text-black">
                    {new Date(nccase?.created_on).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className=" text-black font-semibold my-3">
                    1. कलम व कायदा :
                  </span>
                  <span className="p-2 text-black">
                    {nccase?.victimList[0].offenderList
                      .map((offender: any) => offender.sectionId)
                      .join(', ')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className=" text-black font-semibold my-3">
                    2. गुन्हा घडल्याचे ठिकाण :
                  </span>
                  <span className="p-2 text-black">
                    {nccase?.victimList[0].crimesDetails.crimeAddress}
                  </span>
                </div>
                <div>
                  <span className=" text-black font-semibold my-3">
                    तारीख :
                  </span>
                  <span className=" text-black">
                    {new Date(
                      nccase?.victimList[0].crimesDetails.crimeDateTime,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className=" text-black font-semibold my-3">वेळ :</span>
                  <span className=" p-2 text-black">
                    {new Date(
                      nccase?.victimList[0].crimesDetails.crimeDateTime,
                    ).toLocaleTimeString()}
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
                  <span className=" text-black font-semibold my-3">
                    तारीख :
                  </span>
                  <span className=" text-black">
                    {new Date(nccase?.victimList[0].created_on).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className=" text-black font-semibold my-3">वेळ :</span>
                  <span className=" p-2 text-black">
                    {new Date(nccase?.victimList[0].created_on).toLocaleTimeString()}
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
                  <span className=" text-black font-semibold my-3">
                    ठा. दै. क्र. :
                  </span>
                  <span className=" text-black"></span>
                </div>
                <div>
                  <span className=" text-black font-semibold my-3">वेळ :</span>
                  <span className=" p-2 text-black"></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <div className="border border-black p-2">
                <div className="text-black font-semibold my-3">
                  3.A. तक्रारदारचे नाव व राहण्याचा पत्ता
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  <p>{nccase?.victimList[0].victimName}</p>
                  <p>{nccase?.victimList[0].victimAddress}</p>
                </div>
              </div>
              <div className="border border-black p-2">
                <div className="text-black font-semibold my-3">
                  3.B. विरोधकांची नावे व पत्ता
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {nccase?.victimList[0].offenderList.map(
                    (offender: any, index: number) => (
                      <div key={index}>
                        <p>{offender.offenderName}</p>
                        <p>{offender.offenderDescription}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-black font-semibold my-3">
                4. तक्राराची थोडक्यात माहिती :
              </label>
              <div
                className="w-full border border-gray-400 p-4 text-black whitespace-pre-wrap"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {nccase?.victimList[0].crimesDetails.crimeDescription}
              </div>
            </div>
            <div>
              <label className="block text-black font-semibold my-3">
                5. साक्षीदारांची नावे व पूर्ण पत्ते :
              </label>
              <div
                className="w-full border border-gray-400 p-14 text-black whitespace-pre-wrap"
                style={{ whiteSpace: 'pre-wrap' }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-1 my-3">
              <div className="border border-black p-2">
                <div className="text-black font-semibold my-3">
                  {' '}
                  6. अदखलपात्र अहवालाची प्रत मिळाली, या प्रकरणी फौ. दं. प्र. सं.
                  कलम 155 नुसार संबंधित कोर्टाकडून दाद मिळवण्याची समज मिळाली{' '}
                </div>
                <div className="mt-26 justify-end flex">
                  तक्रारदाराची सही / अंगठा{' '}
                </div>
              </div>
              <div className="border border-black p-2">
                <div className="text-black font-semibold my-3">
                  ठाणे अंमलदार / कर्तव्यावरील अधिकाऱ्याची स्वाक्षरी{' '}
                </div>
                <div>
                  <span className="text-black font-semibold">नाव :</span>
                  <span className="text-black p-2">{nccase?.officerName}</span>
                </div>
                <div>
                  <span className="text-black font-semibold">हुद्दा :</span>
                  <span className="text-black p-2">{nccase?.officerPost}</span>
                </div>
                <div className="mt-17 justify-end flex">
                  तक्रारदाराची सही / अंगठा{' '}
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
