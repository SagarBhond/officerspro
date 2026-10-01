package com.configserver.officerspro.complainandfirservice.dto;

import com.configserver.officerspro.complainandfirservice.enums.FIRStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for returning FIR details in API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FIRResponseDTO {
    private Integer firId;
    private Long complaintId;
    private LocalDateTime registeredOn;
    private Integer officerId;
    private FIRStatus status;
    private String firDocumentPath;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
    
    // Builder pattern methods for better object creation
    public static FIRResponseDTOBuilder builder() {
        return new FIRResponseDTOBuilder();
    }
    
    public static class FIRResponseDTOBuilder {
        private Integer firId;
        private Long complaintId;
        private LocalDateTime registeredOn;
        private Integer officerId;
        private FIRStatus status;
        private String firDocumentPath;
        private Integer createdBy;
        private LocalDateTime createdOn;
        private Integer updatedBy;
        private LocalDateTime updatedOn;
        
        public FIRResponseDTOBuilder firId(Integer firId) {
            this.firId = firId;
            return this;
        }
        
        public FIRResponseDTOBuilder complaintId(Long complaintId) {
            this.complaintId = complaintId;
            return this;
        }
        
        public FIRResponseDTOBuilder registeredOn(LocalDateTime registeredOn) {
            this.registeredOn = registeredOn;
            return this;
        }
        
        public FIRResponseDTOBuilder officerId(Integer officerId) {
            this.officerId = officerId;
            return this;
        }
        
        public FIRResponseDTOBuilder status(FIRStatus status) {
            this.status = status;
            return this;
        }
        
        public FIRResponseDTOBuilder firDocumentPath(String firDocumentPath) {
            this.firDocumentPath = firDocumentPath;
            return this;
        }
        
        public FIRResponseDTOBuilder createdBy(Integer createdBy) {
            this.createdBy = createdBy;
            return this;
        }
        
        public FIRResponseDTOBuilder createdOn(LocalDateTime createdOn) {
            this.createdOn = createdOn;
            return this;
        }
        
        public FIRResponseDTOBuilder updatedBy(Integer updatedBy) {
            this.updatedBy = updatedBy;
            return this;
        }
        
        public FIRResponseDTOBuilder updatedOn(LocalDateTime updatedOn) {
            this.updatedOn = updatedOn;
            return this;
        }
        
        public FIRResponseDTO build() {
            FIRResponseDTO dto = new FIRResponseDTO();
            dto.setFirId(this.firId);
            dto.setComplaintId(this.complaintId);
            dto.setRegisteredOn(this.registeredOn);
            dto.setOfficerId(this.officerId);
            dto.setStatus(this.status);
            dto.setFirDocumentPath(this.firDocumentPath);
            dto.setCreatedBy(this.createdBy);
            dto.setCreatedOn(this.createdOn);
            dto.setUpdatedBy(this.updatedBy);
            dto.setUpdatedOn(this.updatedOn);
            return dto;
        }
    }
}
