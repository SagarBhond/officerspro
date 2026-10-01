import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import request from '../Service/axios_helper';
import Loader from '../common/Loader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

type CasediaryPreviewProps = {
  handleLogout: () => void;
};
const CasediaryPreview: React.FC<CasediaryPreviewProps> = ({
  handleLogout,
}) => {
  const { victimId } = useParams();
  const [caseDiary, setCaseDiary] = useState(null);
  const [isEditingCrime, setIsEditingCrime] = useState(false);
  const [isEditingInvestigation, setIsEditingInvestigation] = useState(-1);
  const [updatedCrimeDescription, setUpdatedCrimeDescription] = useState('');
  const [updatedInvestigationDescription, setUpdatedInvestigationDescription] =
    useState('');

  const { t } = useTranslation();
  const { casediarypreview } = t('table');
  const { download, messege } = t('casediary');

  const fetchCaseDiary = async () => {
    try {
      const response = await request(
        'cms',
        'GET',
        `/getCaseDiary/${victimId}`,
        {},
      );
      setCaseDiary(response);
      setUpdatedCrimeDescription(
        response.victimList[0]?.crimesDetails.crimeDescription || '',
      );
    } catch (error) {
      console.error('Error fetching case diary:', error);
    }
  };

  useEffect(() => {
    fetchCaseDiary();
  }, [victimId]);

  const handleEditCrime = () => {
    setIsEditingCrime(true);
  };

  const handleSaveCrime = async () => {
    try {
      await request('cms', 'PUT', '/updateCrimeDetails', {
        crimeId: caseDiary.victimList[0].crimesDetails.crimeId,
        updatedCrimeDescription: updatedCrimeDescription,
      });
      setIsEditingCrime(false);
      fetchCaseDiary();
    } catch (error) {
      console.error('Error updating crime description:', error);
    }
  };

  const handleEditInvestigation = (index) => {
    setIsEditingInvestigation(index);
    setUpdatedInvestigationDescription(
      caseDiary.investigationDetailsList[index].investDescription,
    );
  };

  const handleSaveInvestigation = async (index) => {
    try {
      await request('cms', 'PUT', '/updateInvestigationById', {
        investId: caseDiary.investigationDetailsList[index].investId,
        updatedInvestigationDescription: updatedInvestigationDescription,
      });
      setIsEditingInvestigation(-1);
      fetchCaseDiary();
    } catch (error) {
      console.error('Error updating investigation description:', error);
    }
  };

  const handleDownloadPDF = async () => {
    // Show loading alert
    Swal.fire({
      title: 'Generating PDF...',
      text: 'Please wait while we generate your PDF.',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    document.body.style.cursor = 'progress';
    const elementsToHide = document.querySelectorAll('.btn');
    elementsToHide.forEach((el) => {
      el.style.visibility = 'hidden';
    });

    const input = document.getElementById('pdf-content');
    const sections = input.querySelectorAll('.content');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 25; // Set margin to 25mm
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const usableWidth = pageWidth - 2 * margin; // Usable width after applying margins
    const usableHeight = pageHeight - 2 * margin; // Usable height after applying margins
    let yOffset = margin; // Start with top margin for the first item

    const renderSectionToPDF = async (section) => {
      const canvas = await html2canvas(section, { scale: 1.9 });
      const canvasAspectRatio = canvas.width / canvas.height;
      const imgWidth = usableWidth; // Width of the image in the PDF
      const imgHeight = imgWidth / canvasAspectRatio; // Adjust height to maintain aspect ratio

      let positionY = 0;

      while (positionY < canvas.height) {
        if (yOffset + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yOffset = margin; // Reset yOffset for the new page
        }

        // Create a new canvas to draw the portion of the original canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        const heightLeft = canvas.height - positionY;
        tempCanvas.height = Math.min(
          heightLeft,
          usableHeight * (canvas.width / imgWidth),
        );
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(
          canvas,
          0,
          positionY,
          canvas.width,
          tempCanvas.height,
          0,
          0,
          canvas.width,
          tempCanvas.height,
        );

        const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.8); // Adjust compression
        const tempImgHeight = tempCanvas.height * (imgWidth / canvas.width);

        pdf.addImage(
          tempImgData,
          'JPEG',
          margin,
          yOffset,
          imgWidth,
          tempImgHeight,
        );

        yOffset += tempImgHeight;
        positionY += tempCanvas.height;
      }
    };

    try {
      for (const section of sections) {
        await renderSectionToPDF(section);
      }
      pdf.save(`${caseDiary.victimList[0]?.victimName}_Casediary.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        title: 'Error',
        text: 'There was an error generating your PDF.',
        icon: 'error',
      });
    } finally {
      Swal.close(); // Close the loading alert
      elementsToHide.forEach((el) => {
        el.style.visibility = ''; // Restore visibility
      });
      document.body.style.cursor = ''; // Reset cursor
    }
  };

  if (!caseDiary) {
    return <Loader />;
  }

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={casediarypreview} />
      <div className="flex justify-end">
        <button
          className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          onClick={handleDownloadPDF}
        >
          {download}
        </button>
      </div>

      <div id="pdf-content" className="rounded-sm mx-13 mb-4 text-black p-6">
        {caseDiary.investigationDetailsList.length > 0 ? (
          caseDiary.investigationDetailsList.map((investigation, index) => (
            <div key={index} className={`content bg-white mb-6 p-4 `}>
              <div className="flex justify-center">
                <span className="text-2xl">Casediary {index + 1}</span>
              </div>

              <div className="flex justify-end">
                <span className="text-lg">
                  Date :{' '}
                  {new Date(investigation.created_on).toLocaleDateString(
                    'en-IN',
                    {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    },
                  )}
                </span>
              </div>

              <div className="overflow-x-auto py-6">
                <table className="min-w-full bg-white text-black">
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">
                        <strong>Police Station :</strong>
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {caseDiary.officerStation}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">
                        <strong>Section ID :</strong>
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {caseDiary.victimList[0]?.offenderList
                          ?.map((offender) => offender.sectionId)
                          .join(', ')}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">
                        <strong>Victim Details :</strong>
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {`${caseDiary.victimList[0]?.victimName}, ${caseDiary.victimList[0]?.victimAge} वर्षांचे, धंदा - ${caseDiary.victimList[0]?.victimProfession}, रा. ${caseDiary.victimList[0]?.victimAddress}, मो नं. ${caseDiary.victimList[0]?.victimMobileNo}`}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">
                        <strong>Date and time of offense :</strong>
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {new Date(
                          caseDiary.victimList[0]?.crimesDetails?.crimeDateTime,
                        ).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">
                        <strong>Time of filing case :</strong>
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {new Date(
                          caseDiary.victimList[0]?.created_on,
                        ).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">
                        <strong>Offender Details :</strong>
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        <ol>
                          {caseDiary.victimList[0].offenderList.map(
                            (offender, index) => (
                              <li key={index}>
                                {index + 1}.{' '}
                                {`${offender.offenderName}, ${offender.offenderAge} वर्षांचे, रा. ${offender.offenderAddress}`}
                              </li>
                            ),
                          )}
                        </ol>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">
                        <strong>Arrest Status :</strong>
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        <ol>
                          {caseDiary.victimList[0].offenderList.map(
                            (offender, index) => (
                              <li key={index}>
                                {index + 1}.{' '}
                                {`${offender.offenderName} - ${offender.arrestedStatus}`}
                              </li>
                            ),
                          )}
                        </ol>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">
                        <strong>Officer's Name :</strong>
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {caseDiary.officerName}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {index === 0 && (
                <div className="m-4">
                  <div className="text-xl p-2 flex justify-between items-center">
                    <span>Crime Description :</span>
                    {isEditingCrime ? (
                      <button className="btn" onClick={handleSaveCrime}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          width="22"
                          height="22"
                          viewBox="0 0 512 512"
                        >
                          <g>
                            <path
                              fill="#2ad352"
                              d="M256 0C114.62 0 0 114.58 0 256s114.62 256 256 256 256-114.65 256-256S397.38 0 256 0z"
                            ></path>
                            <path
                              fill="#74da7f"
                              d="M0 256a254.87 254.87 0 0 0 30.49 121.23 278.76 278.76 0 0 0 78.73 11.29c153.9 0 278.66-124.76 278.66-278.66a278.7 278.7 0 0 0-11.64-79.94A254.86 254.86 0 0 0 256 0C114.62 0 0 114.58 0 256z"
                            ></path>
                            <path
                              fill="#ffffff"
                              d="M402 213.58 248.13 375.17a45.16 45.16 0 0 1-32.48 14h-.2a45.11 45.11 0 0 1-32.4-13.71l-81.65-84.1a45.14 45.14 0 1 1 64.78-62.87l48.95 50.42 121.49-127.58A45.14 45.14 0 1 1 402 213.58z"
                            ></path>
                          </g>
                        </svg>
                      </button>
                    ) : (
                      <div
                        className="btn hover:text-primary cursor-pointer"
                        onClick={handleEditCrime}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          width="22"
                          height="22"
                          viewBox="0 0 401.523 401"
                          className="fill-current"
                        >
                          <g>
                            <path
                              d="M370.59 250.973c-5.524 0-10 4.476-10 10v88.789c-.02 16.562-13.438 29.984-30 30H50c-16.563-.016-29.98-13.438-30-30V89.172c.02-16.559 13.438-29.98 30-30h88.79c5.523 0 10-4.477 10-10 0-5.52-4.477-10-10-10H50c-27.602.031-49.969 22.398-50 50v260.594c.031 27.601 22.398 49.968 50 50h280.59c27.601-.032 49.969-22.399 50-50v-88.793c0-5.524-4.477-10-10-10zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M376.629 13.441c-17.574-17.574-46.067-17.574-63.64 0L134.581 191.848a9.997 9.997 0 0 0-2.566 4.402l-23.461 84.7a9.997 9.997 0 0 0 12.304 12.308l84.7-23.465a9.997 9.997 0 0 0 4.402-2.566l178.402-178.41c17.547-17.587 17.547-46.055 0-63.641zM156.37 198.348 302.383 52.332l47.09 47.09-146.016 146.016zm-9.406 18.875 37.62 37.625-52.038 14.418zM374.223 74.676 363.617 85.28l-47.094-47.094 10.61-10.605c9.762-9.762 25.59-9.762 35.351 0l11.739 11.734c9.746 9.774 9.746 25.59 0 35.36zm0 0"
                              fill=""
                            ></path>
                          </g>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    {isEditingCrime ? (
                      <textarea
                        className="w-full p-2 border"
                        rows={Math.max(
                          (updatedCrimeDescription || '').split('\n').length,
                          4,
                        )}
                        value={updatedCrimeDescription}
                        onChange={(e) =>
                          setUpdatedCrimeDescription(e.target.value)
                        }
                      />
                    ) : (
                      <p
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {
                          caseDiary.victimList[0]?.crimesDetails
                            .crimeDescription
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="m-4">
                <div className="text-xl p-2 flex justify-between items-center">
                  <span>
                    Investigation Day
                    {` ${index + 1} :`}
                  </span>
                  {isEditingInvestigation === index ? (
                    <button
                      className="btn"
                      onClick={() => handleSaveInvestigation(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="22"
                        height="22"
                        viewBox="0 0 512 512"
                      >
                        <g>
                          <path
                            fill="#2ad352"
                            d="M256 0C114.62 0 0 114.58 0 256s114.62 256 256 256 256-114.65 256-256S397.38 0 256 0z"
                          ></path>
                          <path
                            fill="#74da7f"
                            d="M0 256a254.87 254.87 0 0 0 30.49 121.23 278.76 278.76 0 0 0 78.73 11.29c153.9 0 278.66-124.76 278.66-278.66a278.7 278.7 0 0 0-11.64-79.94A254.86 254.86 0 0 0 256 0C114.62 0 0 114.58 0 256z"
                          ></path>
                          <path
                            fill="#ffffff"
                            d="M402 213.58 248.13 375.17a45.16 45.16 0 0 1-32.48 14h-.2a45.11 45.11 0 0 1-32.4-13.71l-81.65-84.1a45.14 45.14 0 1 1 64.78-62.87l48.95 50.42 121.49-127.58A45.14 45.14 0 1 1 402 213.58z"
                          ></path>
                        </g>
                      </svg>
                    </button>
                  ) : (
                    <div
                      className="btn hover:text-primary cursor-pointer"
                      onClick={() => handleEditInvestigation(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="22"
                        height="22"
                        viewBox="0 0 401.523 401"
                        className="fill-current"
                      >
                        <g>
                          <path
                            d="M370.59 250.973c-5.524 0-10 4.476-10 10v88.789c-.02 16.562-13.438 29.984-30 30H50c-16.563-.016-29.98-13.438-30-30V89.172c.02-16.559 13.438-29.98 30-30h88.79c5.523 0 10-4.477 10-10 0-5.52-4.477-10-10-10H50c-27.602.031-49.969 22.398-50 50v260.594c.031 27.601 22.398 49.968 50 50h280.59c27.601-.032 49.969-22.399 50-50v-88.793c0-5.524-4.477-10-10-10zm0 0"
                            fill=""
                          ></path>
                          <path
                            d="M376.629 13.441c-17.574-17.574-46.067-17.574-63.64 0L134.581 191.848a9.997 9.997 0 0 0-2.566 4.402l-23.461 84.7a9.997 9.997 0 0 0 12.304 12.308l84.7-23.465a9.997 9.997 0 0 0 4.402-2.566l178.402-178.41c17.547-17.587 17.547-46.055 0-63.641zM156.37 198.348 302.383 52.332l47.09 47.09-146.016 146.016zm-9.406 18.875 37.62 37.625-52.038 14.418zM374.223 74.676 363.617 85.28l-47.094-47.094 10.61-10.605c9.762-9.762 25.59-9.762 35.351 0l11.739 11.734c9.746 9.774 9.746 25.59 0 35.36zm0 0"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  {isEditingInvestigation === index ? (
                    <textarea
                      rows={Math.max(
                        (updatedInvestigationDescription || '').split('\n')
                          .length,
                        4,
                      )}
                      className="w-full p-2 border"
                      value={updatedInvestigationDescription}
                      onChange={(e) =>
                        setUpdatedInvestigationDescription(e.target.value)
                      }
                    />
                  ) : (
                    <p
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {investigation.investDescription}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-22">
                <div>
                  <div>
                    <strong>officerName :</strong> {caseDiary.officerName}
                  </div>
                  <div>
                    <strong>officerPost :</strong> {caseDiary.officerPost}
                  </div>
                  <div>
                    <strong>policeStation :</strong> {caseDiary.officerStation}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
            <p className="flex justify-center py-4 px-4 italic text-2xl text-black dark:text-white ">
              {messege}
            </p>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default CasediaryPreview;
