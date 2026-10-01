package com.configserver.chargesheet.controller;

import com.configserver.chargesheet.dto.*;
import com.configserver.chargesheet.entity.ChargesheetMaster;
import com.configserver.chargesheet.service.ChargesheetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.List;

@RestController
@RequestMapping("/chargesheet")
public class ChargesheetController {

    @Autowired
    private ChargesheetService chargesheetService;

    @PostMapping("/create")
    public ResponseEntity<ChargesheetResponse> create(@RequestBody ChargesheetCreateRequest req) throws Exception {
        ChargesheetResponse resp = chargesheetService.createChargesheet(req);
        return ResponseEntity.status(201).body(resp);
    }

    @PostMapping("/submit")
    public ResponseEntity<ChargesheetMaster> submit(@RequestBody ChargesheetSubmitRequest req){
        ChargesheetMaster cs = chargesheetService.submitChargesheet(req);
        return ResponseEntity.ok(cs);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ChargesheetMaster>> getAllChargesheets(
            @RequestParam(required = false) String caseId,
            @RequestParam(required = false) String firId,
            @RequestParam(required = false) String ferristId,
            @RequestParam(required = false) String investigationId,
            @RequestParam(required = false) Boolean isSubmitted,
            @RequestParam(required = false) String courtName,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order
    ) {
        List<ChargesheetMaster> list = chargesheetService.getAllChargesheetsFiltered(
                caseId, firId, ferristId, investigationId, isSubmitted, courtName, fromDate, toDate, sortBy, order);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{chargesheetId}")
    public ResponseEntity<ChargesheetMaster> getChargesheetById(@PathVariable String chargesheetId) {
        ChargesheetMaster chargesheet = chargesheetService.getChargesheetById(chargesheetId);
        if (chargesheet == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(chargesheet);
    }

    @GetMapping("/{chargesheetId}/document-id")
    public ResponseEntity<Map<String, Object>> getDocumentId(@PathVariable String chargesheetId) {
        Long documentId = chargesheetService.getMergedDocumentIdByChargesheetId(chargesheetId);
        Map<String, Object> body = new HashMap<>();
        body.put("chargesheetId", chargesheetId);
        body.put("documentId", documentId);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/preview")
    public ResponseEntity<byte[]> preview(
            @RequestParam String ferristId,
            @RequestParam String firId
    ) throws Exception {

        ChargesheetCreateRequest req = new ChargesheetCreateRequest();
        req.setFerristId(ferristId);
        req.setFirId(firId);
        req.setCourtName("Court of Session");
        req.setCreatedBy(201);
        req.setRemarks("Preview only");

        byte[] pdf = chargesheetService.previewChargesheet(req);

        System.out.println("Preview PDF bytes = " + (pdf == null ? -1 : pdf.length));

        if (pdf == null || pdf.length == 0) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity
                .ok()
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }


}
