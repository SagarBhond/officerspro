package com.cms.officerspro.entity;

import com.cms.officerspro.configuration.AesEncryptor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="offenders")
@Builder
public class Offender {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "custom-id-generator")
    @GenericGenerator(name = "custom-id-generator", strategy = "com.cms.officerspro.entity.generator.CustomIdGenerator")
    @Column(name="offender_id")
    private String offenderId;

    @Convert(converter = AesEncryptor.class)
    private String offenderName;

    @Convert(converter = AesEncryptor.class)
    private String offenderAge;

    @Convert(converter = AesEncryptor.class)
    private String offenderAddress;

    @Convert(converter = AesEncryptor.class)
    private String offenderAadharNo;

    @Convert(converter = AesEncryptor.class)
    private String offenderGender;

    @Convert(converter = AesEncryptor.class)
    private String offenderProfession;

    @Convert(converter = AesEncryptor.class)
    private String arrestedStatus;

    @Convert(converter = AesEncryptor.class)
    private String offenderDescription;

    @ManyToOne
    @JoinColumn(name = "aadhar_file_id")
    private FileEntity aadharFile;

    @ManyToOne
    @JoinColumn(name = "pan_file_id")
    private FileEntity panFile;

    @ManyToOne
    @JoinColumn(name = "passport_file_id")
    private FileEntity passportFile;

    @Convert(converter = AesEncryptor.class)
    private String sectionId;

    @CreationTimestamp
    private LocalDateTime created_on;

    @UpdateTimestamp
    private LocalDateTime updated_at;
}
