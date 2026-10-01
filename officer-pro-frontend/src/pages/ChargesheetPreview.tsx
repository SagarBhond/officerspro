import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ChargesheetPreview = ({ handleLogout }) => {
  const { state } = useLocation();
  const { selectedFerrist, victimId } = state;
  const imagekey = import.meta.env.VITE_IMAGE_API;
  const navigate = useNavigate();

  const [orderedFerrist, setOrderedFerrist] = useState([...selectedFerrist]);
  const [indexEntries, setIndexEntries] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    calculateIndex();
  }, [orderedFerrist]);

  const calculateIndex = () => {
    let currentPage = 2;
    const newIndex = orderedFerrist.map((file, i) => {
      const pageCount = parseInt(file.pageCount || 1);
      const entry = {
        srNo: i + 1,
        fileName: file.ferristFile?.fileName || 'N/A',
        docDescription: file.docDescription || '',
        startPage: currentPage,
        endPage: currentPage + pageCount - 1,
        ferristId: file.ferristId,
      };
      currentPage += pageCount;
      return entry;
    });
    setIndexEntries(newIndex);
  };

  const getPageRange = (ferristId) => {
    const entry = indexEntries.find(e => e.ferristId === ferristId);
    if (!entry) return 'N/A';
    return entry.startPage === entry.endPage
      ? `${entry.startPage}`
      : `${entry.startPage}-${entry.endPage}`;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = orderedFerrist.findIndex(item => item.ferristId === active.id);
      const newIndex = orderedFerrist.findIndex(item => item.ferristId === over.id);
      setOrderedFerrist(items => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleIndividualDownload = async (file) => {
    const path = `${imagekey}?filePath=${encodeURIComponent(file.ferristFile.filePath)}`;
    const response = await axios.get(path, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.ferristFile?.fileName || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadPDF = async () => {
    Swal.fire({
      title: 'Preparing PDF...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const mergedPdf = await PDFDocument.create();
      const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

      const indexPage = mergedPdf.addPage([595, 842]);
      const { width, height } = indexPage.getSize();

      const title = 'CHARGESHEET INDEX';
      const titleWidth = boldFont.widthOfTextAtSize(title, 16);
      const titleX = (width - titleWidth) / 2;

      indexPage.drawText(title, {
        x: titleX,
        y: height - 60,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      indexPage.drawLine({
        start: { x: titleX, y: height - 65 },
        end: { x: titleX + titleWidth, y: height - 65 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      const tableWidth = 500;
      const tableX = (width - tableWidth) / 2;
      const startY = height - 100;
      const rowHeight = 25;
      const columnWidths = [50, 180, 190, 80];
      const columnPositions = [
        tableX,
        tableX + columnWidths[0],
        tableX + columnWidths[0] + columnWidths[1],
        tableX + columnWidths[0] + columnWidths[1] + columnWidths[2],
        tableX + tableWidth,
      ];

      indexPage.drawRectangle({
        x: tableX,
        y: startY - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.85, 0.85, 0.85),
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      const headers = ['Sr No', 'Filename', 'Description', 'Page Index'];
      headers.forEach((header, idx) => {
        const textWidth = boldFont.widthOfTextAtSize(header, 11);
        const centerX = columnPositions[idx] + (columnWidths[idx] / 2);

        indexPage.drawText(header, {
          x: centerX - (textWidth / 2),
          y: startY - 15,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
      });

      let currentY = startY - rowHeight;

      indexEntries.forEach((entry) => {
        currentY -= rowHeight;

        indexPage.drawRectangle({
          x: tableX,
          y: currentY,
          width: tableWidth,
          height: rowHeight,
          color: entry.srNo % 2 === 0 ? rgb(1, 1, 1) : rgb(0.97, 0.97, 0.97),
        });

        for (let i = 1; i < columnPositions.length - 1; i++) {
          indexPage.drawLine({
            start: { x: columnPositions[i], y: currentY + rowHeight },
            end: { x: columnPositions[i], y: currentY },
            thickness: 0.7,
            color: rgb(0.3, 0.3, 0.3),
          });
        }

        indexPage.drawLine({
          start: { x: tableX, y: currentY },
          end: { x: tableX + tableWidth, y: currentY },
          thickness: 0.5,
          color: rgb(0.5, 0.5, 0.5),
        });

        const row = [
          `${entry.srNo}`,
          `${entry.fileName}`,
          `${entry.docDescription}`,
          entry.startPage === entry.endPage ? `${entry.startPage}` : `${entry.startPage}-${entry.endPage}`,
        ];

        row.forEach((text, idx) => {
          const isCentered = idx === 0 || idx === 3;
          const xPos = isCentered
            ? columnPositions[idx] + (columnWidths[idx] / 2) - (font.widthOfTextAtSize(text, 10) / 2)
            : columnPositions[idx] + 8;

          indexPage.drawText(text, {
            x: xPos,
            y: currentY + 8,
            size: 10,
            font,
            color: rgb(0, 0, 0),
            maxWidth: columnWidths[idx] - 10,
          });
        });
      });

      indexPage.drawRectangle({
        x: tableX,
        y: currentY,
        width: tableWidth,
        height: startY - currentY - rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      for (const file of orderedFerrist) {
        const path = `${imagekey}?filePath=${encodeURIComponent(file.ferristFile.filePath)}`;
        const response = await axios.get(path, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob',
        });

        const blob = response.data;
        const fileType = blob.type;

        if (fileType === 'application/pdf') {
          const pdfBytes = await blob.arrayBuffer();
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((p) => mergedPdf.addPage(p));
        } else if (fileType.startsWith('image/')) {
          const imageBytes = await blob.arrayBuffer();
          let image;

          if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
            image = await mergedPdf.embedJpg(imageBytes);
          } else if (fileType === 'image/png') {
            image = await mergedPdf.embedPng(imageBytes);
          } else {
            continue;
          }

          const page = mergedPdf.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }
      }

      const finalPdf = await mergedPdf.save();
      const blobFinal = new Blob([finalPdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blobFinal);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chargesheet.pdf';
      a.click();
      URL.revokeObjectURL(url);
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to generate PDF', 'error');
    }
  };

  const SortableRow = ({ file, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: file.ferristId,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <tr ref={setNodeRef} {...attributes} {...listeners} style={style}>
        <td className="p-2 border text-center">{index + 1}</td>
        <td
          className="p-2 border text-blue-600 underline cursor-pointer"
          onClick={() => handleIndividualDownload(file)}
        >
          {file.ferristFile?.fileName || 'N/A'}
        </td>
        <td className="p-2 border">{file.docDescription || 'N/A'}</td>
        <td className="p-2 border text-center">
          {file.date ? new Date(file.date).toLocaleDateString('en-GB') : 'N/A'}
        </td>
        <td className="p-2 border text-center">{file.pageCount || 'N/A'}</td>
        <td className="p-2 border text-center">{getPageRange(file.ferristId)}</td>
        <td className="p-2 border text-center">
          {file.ferristFile?.fileName || 'N/A'}
        </td>
      </tr>
    );
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName="Charge Sheet Preview" />
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Chargesheet Preview</h2>
        <button
          onClick={() => navigate('/chargesheet/' + victimId)}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ← Back to Chargesheet
        </button>

        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={orderedFerrist.map((item) => item.ferristId)}
              strategy={verticalListSortingStrategy}
            >
              <table className="min-w-full bg-white text-black shadow-md">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border">Sr No</th>
                    <th className="p-2 border">Filename</th>
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Page Count</th>
                    <th className="p-2 border">Page Index</th>
                    <th className="p-2 border">Filename</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedFerrist.map((file, index) => (
                    <SortableRow key={file.ferristId} file={file} index={index} />
                  ))}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={downloadPDF}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Download Charge Sheet
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ChargesheetPreview;
