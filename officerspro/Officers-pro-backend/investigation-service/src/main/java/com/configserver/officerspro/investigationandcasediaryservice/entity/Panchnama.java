package com.configserver.officerspro.investigationandcasediaryservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "Panchnama")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Panchnama {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer panchnamaId;

    @Column(name = "evidence_id")
    private Integer evidenceId;

    @Column(name = "panchnama_date")
    private LocalDateTime panchnamaDate;

    @Column(name = "panchnama_text", columnDefinition = "TEXT")
    private String panchnamaText;

    @Column(name = "witness1_name")
    private String witness1Name;

    @Column(name = "witness1_address")
    private String witness1Address;

    @Column(name = "witness2_name")
    private String witness2Name;

    @Column(name = "witness2_address")
    private String witness2Address;

    @Column(name = "officer_signature")
    private String officerSignature;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}
