package com.configserver.chargesheet.controller;

import com.configserver.chargesheet.dto.*;
import com.configserver.chargesheet.entity.FerristDocument;
import com.configserver.chargesheet.entity.FerristMaster;
import com.configserver.chargesheet.service.FerristService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.HandlerMapping;

import java.util.*;

@RestController
@RequestMapping("/ferrist")
public class FerristController {

    @Autowired
    private FerristService ferristService;

    @PostMapping("/create")
    public ResponseEntity<FerristMaster> createFerrist(@RequestBody FerristCreateRequest req){
        FerristMaster fm = ferristService.createFromInvestigation(req);
        return ResponseEntity.status(201).body(fm);
    }

    @PostMapping("/version/create")
    public ResponseEntity<FerristMaster> createVersion(@RequestBody FerristVersionCreateRequest req){
        FerristMaster fm = ferristService.createVersion(req);
        return ResponseEntity.status(201).body(fm);
    }

    @GetMapping("/{ferristId}")
    public ResponseEntity<Map<String,Object>> getFerrist(@PathVariable String ferristId){
        FerristMaster fm = ferristService.getFerrist(ferristId);
        List<FerristDocument> docs = ferristService.getActiveDocuments(ferristId);
        Map<String,Object> resp = new HashMap<>();
        resp.put("ferrist", fm);
        resp.put("documents", docs);
        return ResponseEntity.ok(resp);
    }


    @PostMapping("/{ferristId}/document/add")
    public ResponseEntity<FerristDocument> addDocument(@PathVariable String ferristId,
                                                       @RequestBody AddDocumentRequest req){
        FerristDocument inserted = ferristService.addDocument(ferristId, req);
        return ResponseEntity.status(201).body(inserted);
    }

    @PutMapping("/{ferristId}/document/{documentId}/remove")
    public ResponseEntity<Map<String,Object>> removeDocument(@PathVariable String ferristId,
                                                             @PathVariable Long documentId,
                                                             @RequestBody Map<String,Object> body){
        Integer removedBy = (Integer) body.getOrDefault("removedBy", 0);
        String reason = (String) body.getOrDefault("reason", null);
        ferristService.removeDocument(ferristId, documentId, removedBy, reason);
        Map<String,Object> out = new HashMap<>();
        out.put("status","Removed");
        out.put("documentId", documentId);
        out.put("message","Document soft-deleted and sequence updated.");
        return ResponseEntity.ok(out);
    }

    @PutMapping("/{ferristId}/document/{documentId}/restore")
    public ResponseEntity<Map<String,Object>> restoreDocument(@PathVariable String ferristId,
                                                              @PathVariable Long documentId,
                                                              @RequestBody Map<String,Object> body){
        Integer restoredBy = (Integer) body.getOrDefault("restoredBy", 0);
        Integer position = body.get("position") == null ? null : (Integer) body.get("position");
        String remarks = (String) body.getOrDefault("remarks", null);
        FerristDocument fd = ferristService.restoreDocument(ferristId, documentId, restoredBy, position, remarks);
        Map<String,Object> out = new HashMap<>();
        out.put("status","Restored");
        out.put("ferristDocumentId", fd != null ? fd.getFerristDocumentId() : null);
        out.put("message","Document restored successfully");
        return ResponseEntity.ok(out);
    }

    @PutMapping("/{ferristId}/reorder")
    public ResponseEntity<Map<String,Object>> reorder(@PathVariable String ferristId,
                                                      @RequestBody ReorderRequest req){
        List<FerristDocument> updated = ferristService.reorder(ferristId, req);
        Map<String,Object> out = new HashMap<>();
        out.put("status","Reordered");
        out.put("message","Ferrist order updated successfully.");
        out.put("newOrder", updated.stream().map(d -> Map.of("documentId", d.getDocumentId(), "sequenceNumber", d.getSequenceNumber())).toList());
        return ResponseEntity.ok(out);
    }

    @PutMapping("/{ferristId}/finalize")
    public ResponseEntity<Map<String,Object>> finalize(@PathVariable String ferristId, @RequestBody Map<String,Object> body){
        Integer finalizedBy = (Integer) body.getOrDefault("finalizedBy", 0);
        String remarks = (String) body.getOrDefault("remarks", null);
        FerristMaster fm = ferristService.finalizeFerrist(ferristId, finalizedBy, remarks);
        Map<String,Object> out = new HashMap<>();
        out.put("ferristId", fm.getFerristId());
        out.put("isFinalized", fm.getIsFinalized());
        out.put("finalizedAt", fm.getUpdatedAt());
        out.put("remarks", fm.getRemarks());
        out.put("message","Ferrist finalized successfully");
        return ResponseEntity.ok(out);
    }

    @GetMapping("/all")
    public ResponseEntity<List<FerristMaster>> getAllFerrists(
            @RequestParam(required = false) String caseId,
            @RequestParam(required = false) String firId,
            @RequestParam(required = false) String investigationId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) Boolean isFinalized,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {

        List<FerristMaster> ferrists = ferristService.getAllFerristsFiltered(
                caseId, firId, investigationId, fromDate, toDate, isFinalized, sortBy, order);
        return ResponseEntity.ok(ferrists);
    }



}
