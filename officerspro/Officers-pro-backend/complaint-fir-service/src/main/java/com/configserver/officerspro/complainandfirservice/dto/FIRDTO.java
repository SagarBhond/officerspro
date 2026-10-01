package com.configserver.officerspro.complainandfirservice.dto;

import com.configserver.officerspro.complainandfirservice.enums.FIRStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FIRDTO {
    private Integer firId;
    private Long complaintId;  // Reference to the related complaint
    private LocalDateTime registeredOn;
    private Integer officerId;
    private FIRStatus status;
    private String firDocumentPath;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
    
    // Builder pattern methods for better object creation
    public static FIRDTOBuilder builder() {
        return new FIRDTOBuilder();
    }
    
    public static class FIRDTOBuilder {
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
        
        public FIRDTOBuilder firId(Integer firId) {
            this.firId = firId;
            return this;
        }
        
        public FIRDTOBuilder complaintId(Long complaintId) {
            this.complaintId = complaintId;
            return this;
        }
        
        public FIRDTOBuilder registeredOn(LocalDateTime registeredOn) {
            this.registeredOn = registeredOn;
            return this;
        }
        
        public FIRDTOBuilder officerId(Integer officerId) {
            this.officerId = officerId;
            return this;
        }
        
        public FIRDTOBuilder status(FIRStatus status) {
            this.status = status;
            return this;
        }
        
        public FIRDTOBuilder firDocumentPath(String firDocumentPath) {
            this.firDocumentPath = firDocumentPath;
            return this;
        }
        
        public FIRDTOBuilder createdBy(Integer createdBy) {
            this.createdBy = createdBy;
            return this;
        }
        
        public FIRDTOBuilder createdOn(LocalDateTime createdOn) {
            this.createdOn = createdOn;
            return this;
        }
        
        public FIRDTOBuilder updatedBy(Integer updatedBy) {
            this.updatedBy = updatedBy;
            return this;
        }
        
        public FIRDTOBuilder updatedOn(LocalDateTime updatedOn) {
            this.updatedOn = updatedOn;
            return this;
        }
        
        public FIRDTO build() {
            FIRDTO dto = new FIRDTO();
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
