package com.configserver.chargesheet.service;

import com.configserver.chargesheet.util.PdfMergeUtil;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PdfGenerationService {

    public byte[] createFrontPage(Map<String,Object> firDetails,
                                  String caseId,
                                  String investigationId,
                                  String courtName,
                                  String remarks) throws Exception {
        return PdfMergeUtil.generateFrontPage(firDetails, caseId, investigationId, courtName, remarks);
    }

    public byte[] createIndexPage(List<String[]> indexEntries) throws Exception {
        return PdfMergeUtil.generateIndexPage(indexEntries);
    }

    public byte[] mergeWithPageNumbers(List<byte[]> pdfParts) throws Exception {
        // <-- THIS IS THE METHOD that your ChargesheetService needs
        return PdfMergeUtil.mergeWithPageNumbers(pdfParts);
    }

    public byte[] convertToPdfIfNeeded(byte[] input, String mimeType) throws Exception {
        return PdfMergeUtil.convertToPdfIfNeeded(input, mimeType);
    }
}
