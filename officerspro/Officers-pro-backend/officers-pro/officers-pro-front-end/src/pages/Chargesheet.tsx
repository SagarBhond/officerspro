import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import request from '../Service/axios_helper';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

type ChargesheetProps = {
  handleLogout: () => void;
};

const Chargesheet: React.FC<ChargesheetProps> = ({ handleLogout }) => {
  const { victimId } = useParams();
  const [caseDiary, setCaseDiary] = useState(null);
  const [ferristIndex, setFerristIndex] = useState([]);
  const imagekey = import.meta.env.VITE_IMAGE_API;

  const { t } = useTranslation();
  const { download } = t('chargesheet');

  const { chargesheet } = t('breadcrumb');

  useEffect(() => {
    fetchFerristData();
    fetchCaseDiary();
  }, [victimId]);

  const fetchCaseDiary = async () => {
    try {
      const response = await request(
        'cms',
        'GET',
        `/getCaseDiary/${victimId}`,
        {},
      );
      setCaseDiary(response);
    } catch (error) {
      console.error('Error fetching case diary:', error);
    }
  };

  const fetchFerristData = async () => {
    try {
      const response = await request(
        'cms',
        'GET',
        `/fetchAllFerrist/${victimId}`,
        {},
      );
      setFerristIndex(response);
      console.log(response);
    } catch (error) {
      console.error('Error fetching ferrist data:', error);
    }
  };

  const downloadChargesheet = async () => {
    try {
      // Show loading alert
      Swal.fire({
        title: 'Generating Charge-Sheet...',
        text: 'Please wait while we generate your PDF.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const doc = new jsPDF('p', 'pt', 'a4');

      // Capture the table
      const tableElement = document.getElementById('chargesheet-table');
      const tableCanvas = await html2canvas(tableElement, { scale: 1.5 });
      const tableData = tableCanvas.toDataURL('image/jpeg', 0.8);

      doc.addImage(
        tableData,
        'JPEG',
        15,
        40,
        570,
        (tableCanvas.height * 570) / tableCanvas.width,
      );

      // Create a new PDFDocument
      const mergedPdf = await PDFDocument.create();

      // Add the table PDF to the merged document
      const tablePdfBytes = doc.output('arraybuffer');
      const tablePdf = await PDFDocument.load(tablePdfBytes);
      const tablePages = await mergedPdf.copyPages(
        tablePdf,
        tablePdf.getPageIndices(),
      );
      tablePages.forEach((page) => mergedPdf.addPage(page));

      // Add PDFs from ferristIndex
      for (const ferrist of ferristIndex) {
        if (ferrist.ferristFile) {
          const sanitizedFilePath = encodeURIComponent(ferrist.ferristFile.filePath.replace(/\\/g, '/'));
          const path = `${imagekey}?filePath=${sanitizedFilePath}`;     
          const response = await axios({
            url: path,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            method: 'GET',
            responseType: 'blob',
          });
          const blob = await response.data;
          const pdfBytes = await blob.arrayBuffer();

          const pdf = await PDFDocument.load(pdfBytes);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach((page) => mergedPdf.addPage(page));
        }
      }

      // Capture and add each section in the Chargesheet component
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
        const canvas = await html2canvas(section, { scale: 1.5 });
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
          );

          const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.8);
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

      const sectionPromises = Array.from(sections).map((section) =>
        renderSectionToPDF(section),
      );

      await Promise.all(sectionPromises);

      // Add the rendered sections to the merged PDF
      const contentPdfBytes = pdf.output('arraybuffer');
      const contentPdf = await PDFDocument.load(contentPdfBytes);
      const contentPages = await mergedPdf.copyPages(
        contentPdf,
        contentPdf.getPageIndices(),
      );
      contentPages.forEach((page) => mergedPdf.addPage(page));

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseDiary.victimList[0]?.victimName}_chargesheet.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Close the loading alert
      Swal.close();
    } catch (error) {
      // Show error alert
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while generating the PDF. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };
  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={chargesheet} />
      <div className="container mx-auto mt-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={downloadChargesheet}
            className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            {download}
          </button>
        </div>

        <div
          id="chargesheet-table"
          className="rounded-sm mx-13 mb-4 text-black p-6 bg-white"
        >
          <h2 className="text-2xl font-semibold pb-4 flex justify-center text-black bg-white">
            Ferrist Index
          </h2>
          <table className="min-w-full bg-white text-black">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Index</th>
                <th className="py-2 px-4 border">Document Type</th>
                <th className="py-2 px-4 border">Document Description</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Page Count</th>
              </tr>
            </thead>
            <tbody>
              {ferristIndex.map((ferrist, index) => (
                <tr key={ferrist.ferristId}>
                  <td className="py-2 px-4 border">{index + 1}</td>
                  <td className="py-2 px-4 border">{ferrist.docType}</td>
                  <td className="py-2 px-4 border">{ferrist.docDescription}</td>
                  <td className="py-2 px-4 border">
                    {new Date(ferrist.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2 px-4 border">{ferrist.pageCount}</td>
                </tr>
              ))}
              {caseDiary?.investigationDetailsList.length > 0 && (
                <tr>
                  <td className="py-2 px-4 border">
                    {ferristIndex.length + 1}
                  </td>
                  <td className="py-2 px-4 border">नोंद</td>
                  <td className="py-2 px-4 border">पोलिस ठाणे दैनंदिनी नोंद</td>
                  <td className="py-2 px-4 border">N/A</td>
                  <td className="py-2 px-4 border">
                    {caseDiary.investigationDetailsList.length}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-end mt-22">
            <div>
              <div>
                <strong>officerName :</strong> {caseDiary?.officerName}
              </div>
              <div>
                <strong>officerPost :</strong> {caseDiary?.officerPost}
              </div>
              <div>
                <strong>policeStation :</strong> {caseDiary?.officerStation}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="pdf-content" className="rounded-sm mx-13 mb-4 text-black p-6">
        {caseDiary && caseDiary.investigationDetailsList ? (
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
                  </div>
                  <div className="p-2">
                    <p
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {caseDiary.victimList[0]?.crimesDetails.crimeDescription}
                    </p>
                  </div>
                </div>
              )}
              <div className="m-4">
                <div className="text-xl p-2 flex justify-between items-center">
                  <span>
                    Investigation Day
                    {` ${index + 1} :`}
                  </span>
                </div>
                <div className="p-2">
                  <p
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {investigation.investDescription}
                  </p>
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
          <p>No Case Diary Available</p>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Chargesheet;
