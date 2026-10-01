package com.configserver.officerspro.complainandfirservice.entity;

import com.configserver.officerspro.complainandfirservice.enums.ComplaintStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;


@Entity
@Table(name = "written_complaint")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WrittenComplaint {

    @Id
    @Column(length = 60)
    private String complaintId; // Format: CMP_MH_PNE_2025_000123

    private Integer filedByStationId;
    private LocalDateTime filedDate;
    
    @Column(columnDefinition = "TEXT")
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String crimeAddress;
    private LocalDateTime crimeDateTime;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;

    private Integer createdBy;
    @Column(name = "created_on", updatable = false)
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;

    @Builder.Default
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Break circular reference
    private List<ComplaintParticipant> participants = new ArrayList<>();
}

