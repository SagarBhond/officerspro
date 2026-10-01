package com.configserverllp.officerspro.subscriptionpaymentservice.controller;

import com.configserverllp.officerspro.subscriptionpaymentservice.dto.AdminPaymentHistoryDto;
import com.configserverllp.officerspro.subscriptionpaymentservice.dto.OfficerPaymentHistoryDto;
import com.configserverllp.officerspro.subscriptionpaymentservice.service.PaymentHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-history")
// CORS handled by API Gateway - no @CrossOrigin needed
public class PaymentHistoryController {

    @Autowired
    private PaymentHistoryService paymentHistoryService;

    @GetMapping("/officer/{officerId}")
    public ResponseEntity<List<OfficerPaymentHistoryDto>> getOfficerPaymentHistory(@PathVariable("officerId") String officerId) {
        try {
            List<OfficerPaymentHistoryDto> history = paymentHistoryService.getOfficerPaymentHistory(officerId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/officer/email/{email}")
    public ResponseEntity<List<OfficerPaymentHistoryDto>> getOfficerPaymentHistoryByEmail(@PathVariable("email") String email) {
        try {
            List<OfficerPaymentHistoryDto> history = paymentHistoryService.getOfficerPaymentHistoryByEmail(email);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<AdminPaymentHistoryDto>> getAllPaymentHistoryForAdmin() {
        try {
            List<AdminPaymentHistoryDto> history = paymentHistoryService.getAllPaymentHistoryForAdmin();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
