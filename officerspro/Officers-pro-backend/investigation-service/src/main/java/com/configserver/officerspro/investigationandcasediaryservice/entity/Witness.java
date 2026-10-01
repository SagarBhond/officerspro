package com.configserver.officerspro.investigationandcasediaryservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "witness")
public class Witness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer witnessId;

    @Column(name = "investigation_id", nullable = false)
    private Integer investigationId;

    @Column(name = "witness_name", nullable = false)
    private String witnessName;

    @Column(name = "witness_email")
    private String witnessEmail;

    @Column(name = "witness_profession")
    private String witnessProfession;

    @Column(name = "witness_gender")
    private String witnessGender;

    @Column(name = "witness_address")
    private String witnessAddress;

    @Column(name = "witness_age")
    private Integer witnessAge;

    @Column(name = "witness_aadhar_no")
    private String witnessAadharNo;

    @Column(name = "witness_mobile_no")
    private String witnessMobileNo;

    @Column(name = "witness_statement", columnDefinition = "TEXT")
    private String witnessStatement;

    @Column(name = "witness_type")
    private String witnessType;

    @Column(name = "aadhar_file_path")
    private String aadharFilePath;

    @Column(name = "pan_file_path")
    private String panFilePath;

    @Column(name = "passport_file_path")
    private String passportFilePath;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}
