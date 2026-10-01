package com.configserver.chargesheet.util;

import com.lowagie.text.*;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfCopy;
import com.lowagie.text.pdf.PdfImportedPage;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;
import com.lowagie.text.pdf.PdfWriter;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.List;


/**
 * Utility for merging PDFs and generating front/index pages with page numbers, tables, borders, and non-PDF conversion.
 */
public class PdfMergeUtil {

    /**
     * Generates a formatted front page PDF for the chargesheet including FIR, Case, Investigation, and participants.
     */
    public static byte[] generateFrontPage(Map<String, Object> firDetails, String caseId,
                                           String investigationId, String courtName, String remarks) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Title
        Paragraph title = new Paragraph("CHARGESHEET FRONT PAGE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18));
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        doc.add(Chunk.NEWLINE);

        // FIR Info Table
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingBefore(10f);
        infoTable.setSpacingAfter(10f);
        infoTable.addCell(createCell("FIR Number", true));
        infoTable.addCell(createCell((String) firDetails.getOrDefault("firId", "N/A"), false));
        infoTable.addCell(createCell("Case ID", true));
        infoTable.addCell(createCell(caseId != null ? caseId : "N/A", false));
        infoTable.addCell(createCell("Investigation ID", true));
        infoTable.addCell(createCell(investigationId != null ? investigationId : "N/A", false));
        infoTable.addCell(createCell("Police Station", true));
        infoTable.addCell(createCell((String) firDetails.getOrDefault("policeStation", "N/A"), false));
        infoTable.addCell(createCell("Officer In Charge", true));
        infoTable.addCell(createCell((String) firDetails.getOrDefault("officerInCharge", "N/A"), false));
        infoTable.addCell(createCell("Court Name", true));
        infoTable.addCell(createCell(courtName, false));
        doc.add(infoTable);

        // Participants Section
        doc.add(new Paragraph("Participants", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
        doc.add(Chunk.NEWLINE);
        Map<String, List<Map<String, Object>>> participants =
                (Map<String, List<Map<String, Object>>>) firDetails.get("participants");

        if (participants != null) {
            addParticipantsTable(doc, "Complainants", participants.get("complainants"));
            addParticipantsTable(doc, "Victims", participants.get("victims"));
            addParticipantsTable(doc, "Accused", participants.get("accused"));
            addParticipantsTable(doc, "Witnesses", participants.get("witnesses"));
        }

        // Remarks
        doc.add(Chunk.NEWLINE);
        doc.add(new Paragraph("Remarks:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
        doc.add(new Paragraph(remarks != null ? remarks : "N/A", FontFactory.getFont(FontFactory.HELVETICA, 11)));

        doc.close();
        return out.toByteArray();
    }

    private static void addParticipantsTable(Document doc, String title, List<Map<String, Object>> list)
            throws DocumentException {
        if (list == null || list.isEmpty()) return;
        doc.add(new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5f);
        table.addCell(createCell("Name", true));
        table.addCell(createCell("Address", true));
        table.addCell(createCell("Contact", true));

        for (Map<String, Object> person : list) {
            table.addCell(createCell((String) person.getOrDefault("name", ""), false));
            table.addCell(createCell((String) person.getOrDefault("address", ""), false));
            table.addCell(createCell((String) person.getOrDefault("contactNumber", ""), false));
        }
        doc.add(table);
        doc.add(Chunk.NEWLINE);
    }

    private static PdfPCell createCell(String text, boolean bold) {
        Font font = bold ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)
                : FontFactory.getFont(FontFactory.HELVETICA, 11);
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setBorder(Rectangle.BOX);
        cell.setPadding(5f);
        return cell;
    }

    /**
     * Converts non-PDF files (images/text) into PDF bytes so that they can be merged.
     */
    public static byte[] convertToPdfIfNeeded(byte[] input, String mimeType) throws Exception {
        if (mimeType != null && mimeType.equalsIgnoreCase("application/pdf")) {
            return input;
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        if (mimeType != null && mimeType.startsWith("image")) {
            InputStream in = new ByteArrayInputStream(input);
            BufferedImage bimg = ImageIO.read(in);
            Image img = Image.getInstance(bimg, null);
            img.scaleToFit(PageSize.A4.getWidth() - 50, PageSize.A4.getHeight() - 50);
            img.setAlignment(Image.ALIGN_CENTER);
            document.add(img);
        } else {
            String text = new String(input);
            document.add(new Paragraph(text));
        }

        document.close();
        return out.toByteArray();
    }

    /**
     * Generates an index page showing document titles with page ranges.
     */
    public static byte[] generateIndexPage(List<String[]> indexEntries) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4);
        PdfWriter.getInstance(doc, out);
        doc.open();
        doc.add(new Paragraph("INDEX", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
        doc.add(Chunk.NEWLINE);
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.addCell(createCell("Document Title", true));
        table.addCell(createCell("Start Page", true));
        //table.addCell(createCell("End Page", true));
        for (String[] e : indexEntries) {
            table.addCell(createCell(e[0], false));
            table.addCell(createCell(e[1], false));
            //table.addCell(createCell(e[2], false));
        }
        doc.add(table);
        doc.close();
        return out.toByteArray();
    }

    /**
     * Merges multiple PDFs into a single document and adds borders + page numbers.
     */
    public static byte[] mergeWithPageNumbers(List<byte[]> pdfParts) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfCopy copy = new PdfCopy(document, output);
        document.open();

        for (byte[] part : pdfParts) {
            PdfReader reader = new PdfReader(part);
            int n = reader.getNumberOfPages();
            for (int i = 1; i <= n; i++) {
                PdfImportedPage page = copy.getImportedPage(reader, i);
                copy.addPage(page);
            }
            reader.close();
        }
        document.close();

        ByteArrayOutputStream numberedOut = new ByteArrayOutputStream();
        PdfReader reader = new PdfReader(output.toByteArray());
        PdfStamper stamper = new PdfStamper(reader, numberedOut);
        int n = reader.getNumberOfPages();

        for (int i = 1; i <= n; i++) {
            PdfContentByte cb = stamper.getOverContent(i);
            Rectangle rect = reader.getPageSizeWithRotation(i);
            cb.setLineWidth(1f);
            cb.rectangle(30, 30, rect.getWidth() - 60, rect.getHeight() - 60);
            cb.stroke();
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase("Page " + i + " of " + n, FontFactory.getFont(FontFactory.HELVETICA, 8)),
                    (rect.getLeft() + rect.getRight()) / 2, 25, 0);
        }
        stamper.close();
        reader.close();
        return numberedOut.toByteArray();
    }
}
