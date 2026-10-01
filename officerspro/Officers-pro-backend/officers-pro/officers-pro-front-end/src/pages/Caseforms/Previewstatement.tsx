import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

interface PreviewSectionProps {
  complainee: any;
  offenderList: any[];
  crimeData: any;
}

const Previewstatement: React.FC<PreviewSectionProps> = ({
  complainee,
  offenderList,
  crimeData,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const { statementpreview } = t('registerstatement');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [crimeData.crimeDescription]);

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
        pdf.save(`${complainee.victimName}_statement.pdf`);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };

  return (
    <div className="container">
      <h3 className=" flex items-center justify-between text-xl text-black font-semibold py-5 p-3 bg-lightcyan">
        {statementpreview}
        <button
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
          type="button"
          onClick={downloadPDF}
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-lightcyan dark:bg-graydark rounded-md group-hover:bg-opacity-0">
            Download PDF
          </span>
        </button>
      </h3>
      <div className="content" id="pdf-content">
        <div className="container mx-auto bg-white p-8 shadow-md border-2 border-gray-300 text-black">
          <h2 className="text-center text-2xl font-bold mb-4 text-black">
            Statement
          </h2>
          <p className="text-center text-black font-semibold mb-4">
            ({' '}
            {offenderList
              .map((offender) => offender.sectionId)
              .filter((id) => id !== null && id !== undefined)
              .join(', ')}{' '}
            )
          </p>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <label className="block text-black font-semibold my-3">
                Statement of:
              </label>
              <div className="w-full border border-gray-400 p-2 text-black">
                {complainee.victimName}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="age"
                  className="block text-black font-semibold my-3"
                >
                  Age if under 18:
                </label>
                <div className="w-full border border-gray-400 p-2 text-black">
                  {complainee.victimAge === undefined
                    ? 'not specified'
                    : complainee.victimAge > 18
                    ? '18+'
                    : 'Under  18'}
                </div>
              </div>
              <div>
                <label className="block text-black font-semibold my-3">
                  Occupation:
                </label>
                <div className="w-full border border-gray-400 p-2 text-black">
                  {complainee.victimProfession}
                </div>
              </div>
            </div>
          </div>

          <p className="block text-black font-semibold my-3">
            This statement is true to the best of my knowledge and belief and I
            make it knowing that, if it is tendered in evidence, I shall be
            liable to prosecution if I have willfully stated anything which I
            know to be false or do not believe to be true.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-black font-semibold my-3">
                Dated the:
              </label>
              <div className="w-full border border-gray-400 p-2 text-black">
                {new Date(crimeData.crimeDateTime).toLocaleString('mr-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  weekday: 'long',
                })}
              </div>
            </div>
            <div>
              <label
                htmlFor="signature"
                className="block text-black font-semibold my-3"
              >
                Signature:
              </label>
              <input
                id="signature"
                type="text"
                className="w-full border border-gray-400 p-2 text-black"
                value=""
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-black font-semibold my-3">
              Statement:
            </label>
            <div
              className="w-full border border-gray-400 p-4 text-black whitespace-pre-wrap"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {crimeData.crimeDescription}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-black font-semibold my-3">
                Signature :
              </label>
              <div className="w-full border border-gray-400 p-5 text-black"></div>
            </div>
            <div>
              <label className="block text-black font-semibold my-3">
                Signature Witnessed by:
              </label>
              <div className="w-full border border-gray-400 p-5 text-black"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Previewstatement;
