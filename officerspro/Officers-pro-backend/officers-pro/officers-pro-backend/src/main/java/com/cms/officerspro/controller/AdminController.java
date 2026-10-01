package com.cms.officerspro.controller;

import com.cms.officerspro.configuration.AesEncryptor;
import com.cms.officerspro.service.AdminService;
import com.cms.officerspro.dto.VictimOffenderDto;
import com.cms.officerspro.service.subscription.SubscriptionRequired;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "https://www.officerspro.in")
@RestController
@RequestMapping("/api/admin/cases")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AesEncryptor aesEncryptor;

    @GetMapping("/total")
    public long getTotalCaseCount(){
        long totalCount=adminService.getCasesCount();
        return totalCount;
    }

    @GetMapping("/active")
    public long getActiveCaseCount(){
        long activeCasesCount=adminService.getActiveCasesCount();
        return activeCasesCount;
    }

    @GetMapping("/completed")
    public long getCompletedCaseCount(){
        long activeCasesCount=adminService.getCompletedCasesCount();
        return activeCasesCount;
    }

    @GetMapping("/all")
    public ResponseEntity<List<VictimOffenderDto>> getListOfCases(){
        List<VictimOffenderDto> victimOffenderDtoList = adminService. getListOfCases();

        for (VictimOffenderDto dto: victimOffenderDtoList){
            dto.decryptEncryptedAttributes(aesEncryptor);
        }

        return ResponseEntity.ok(victimOffenderDtoList);
    }

    @GetMapping("/statements")
    public long getStatementsCount(){
        long statementCount=adminService.getAllStatementCount();
        return statementCount;
    }
}
