package com.configserverllp.officerspro.profileservice.mapper;

import com.configserverllp.officerspro.profileservice.dto.request.CreateOfficerRequest;
import com.configserverllp.officerspro.profileservice.dto.request.UpdateOfficerRequest;
import com.configserverllp.officerspro.profileservice.dto.response.OfficerListResponse;
import com.configserverllp.officerspro.profileservice.dto.response.OfficerResponse;
import com.configserverllp.officerspro.profileservice.entity.Officer;
import org.springframework.stereotype.Component;

@Component
public class OfficerMapper {

    /**
     * Convert CreateOfficerRequest to Officer entity
     */
    public Officer toEntity(CreateOfficerRequest request) {
        return Officer.builder()
                .officerName(request.getOfficerName())
                .officerAge(request.getOfficerAge())
                .officerGender(request.getOfficerGender())
                .officerPost(request.getOfficerPost())
                .officerStation(request.getOfficerStation())
                .officerEmail(request.getOfficerEmail())
                .officerMobileNo(request.getOfficerMobileNo())
                .adminEmail(request.getAdminEmail())
                .registeredByAdminEmail(request.getRegisteredByAdminEmail())
                .aadharDocumentId(request.getAadharDocumentId())
                .panDocumentId(request.getPanDocumentId())
                .passportDocumentId(request.getPassportDocumentId())
                .officerStatus(true) // Default active status
                .build();
    }

    /**
     * Update Officer entity from UpdateOfficerRequest
     */
    public void updateEntity(Officer officer, UpdateOfficerRequest request) {
        if (request.getOfficerName() != null) {
            officer.setOfficerName(request.getOfficerName());
        }
        if (request.getOfficerAge() != null) {
            officer.setOfficerAge(request.getOfficerAge());
        }
        if (request.getOfficerGender() != null) {
            officer.setOfficerGender(request.getOfficerGender());
        }
        if (request.getOfficerPost() != null) {
            officer.setOfficerPost(request.getOfficerPost());
        }
        if (request.getOfficerStation() != null) {
            officer.setOfficerStation(request.getOfficerStation());
        }
        if (request.getOfficerEmail() != null) {
            officer.setOfficerEmail(request.getOfficerEmail());
        }
        if (request.getOfficerMobileNo() != null) {
            officer.setOfficerMobileNo(request.getOfficerMobileNo());
        }
        if (request.getAdminEmail() != null) {
            officer.setAdminEmail(request.getAdminEmail());
        }
        if (request.getAadharDocumentId() != null) {
            officer.setAadharDocumentId(request.getAadharDocumentId());
        }
        if (request.getPanDocumentId() != null) {
            officer.setPanDocumentId(request.getPanDocumentId());
        }
        if (request.getPassportDocumentId() != null) {
            officer.setPassportDocumentId(request.getPassportDocumentId());
        }
    }

    /**
     * Convert Officer entity to OfficerResponse
     */
    public OfficerResponse toResponse(Officer officer) {
        return OfficerResponse.builder()
                .officerId(officer.getOfficerId())
                .officerName(officer.getOfficerName())
                .officerAge(officer.getOfficerAge())
                .officerGender(officer.getOfficerGender())
                .officerPost(officer.getOfficerPost())
                .officerStation(officer.getOfficerStation())
                .officerEmail(officer.getOfficerEmail())
                .officerMobileNo(officer.getOfficerMobileNo())
                .officerStatus(officer.isOfficerStatus())
                .adminEmail(officer.getAdminEmail())
                .registeredByAdminEmail(officer.getRegisteredByAdminEmail())
                .keycloakUserId(officer.getKeycloakUserId())
                .created_on(officer.getCreated_on())
                .updated_at(officer.getUpdated_at())
                .aadharDocumentId(officer.getAadharDocumentId())
                .panDocumentId(officer.getPanDocumentId())
                .passportDocumentId(officer.getPassportDocumentId())
                .subscriptionType(officer.getSubscriptionType())
                .subscriptionStartDate(officer.getSubscriptionStartDate())
                .subscriptionEndDate(officer.getSubscriptionEndDate())
                .remainingDays(officer.getRemainingDays())
                .lastPaymentId(officer.getLastPaymentId())
                .lastPaymentDate(officer.getLastPaymentDate())
                .build();
    }

    /**
     * Convert Officer entity to OfficerListResponse (minimal info)
     */
    public OfficerListResponse toListResponse(Officer officer) {
        return OfficerListResponse.builder()
                .officerId(officer.getOfficerId())
                .officerName(officer.getOfficerName())
                .officerAge(officer.getOfficerAge())
                .officerGender(officer.getOfficerGender())
                .officerPost(officer.getOfficerPost())
                .officerStation(officer.getOfficerStation())
                .officerEmail(officer.getOfficerEmail())
                .officerMobileNo(officer.getOfficerMobileNo())
                .officerStatus(officer.isOfficerStatus())
                .aadharDocumentId(officer.getAadharDocumentId())
                .panDocumentId(officer.getPanDocumentId())
                .passportDocumentId(officer.getPassportDocumentId())
                .build();
    }
}
