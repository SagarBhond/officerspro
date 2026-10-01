package com.configserver.officerspro.complainandfirservice.entity;

import com.configserver.officerspro.complainandfirservice.enums.FIRStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "FIR")
@Data
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FIR {
    @Id
    @Column(length = 60)
    private String firId; // Format: FIR_MH_PNE_2025_000123

    @OneToOne
    @JoinColumn(name = "complaint_id")
    private WrittenComplaint complaint;

    @Column(name = "sections", length = 1000)
    private String sections;

    @Column(name = "description", length = 10000)
    private String description;

    @Column(name = "fir_document_path")
    private String firDocumentPath;

    @Column(name = "registered_on", updatable = false)
    private LocalDateTime registeredOn;
    private Integer officerId;

    @Enumerated(EnumType.STRING)
    private FIRStatus status;

    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}


