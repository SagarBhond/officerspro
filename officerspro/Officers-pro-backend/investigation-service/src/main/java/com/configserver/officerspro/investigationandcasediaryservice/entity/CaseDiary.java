package com.configserver.officerspro.investigationandcasediaryservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "CaseDiary")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class CaseDiary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer diaryId;

    @Column(name = "investigation_id", length = 60)
    private String investigationId;

    @Column(name = "entry_date")
    private LocalDateTime entryDate;

    @Column(name = "entry_text", columnDefinition = "TEXT")
    private String entryText;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}
