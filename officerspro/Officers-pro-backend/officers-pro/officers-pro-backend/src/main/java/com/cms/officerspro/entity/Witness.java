package com.cms.officerspro.entity;

import com.cms.officerspro.configuration.AesEncryptor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name="witnesses")
@NoArgsConstructor
@AllArgsConstructor
public class Witness {


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "custom-id-generator")
    @GenericGenerator(name = "custom-id-generator", strategy = "com.cms.officerspro.entity.generator.CustomIdGenerator")
    @Column(name = "witness_id")
    private String witnessId;

    @Convert(converter = AesEncryptor.class)
    private String witnessName;

    @Convert(converter = AesEncryptor.class)
    private String witnessEmail;

    @Convert(converter = AesEncryptor.class)
    private String witnessProfession;

    @Convert(converter = AesEncryptor.class)
    private String witnessGender;

    @Convert(converter = AesEncryptor.class)
    private  String witnessAddress;

    @Convert(converter = AesEncryptor.class)
    private String witnessAge;

    @Convert(converter = AesEncryptor.class)
    private String witnessAadharNo;

    @Convert(converter = AesEncryptor.class)
    private String witnessMobileNo;

    @Convert(converter = AesEncryptor.class)
    @Column(length = 5000)
    private String witnessStatement;

    @Convert(converter = AesEncryptor.class)
    private String witnessType;

    @CreationTimestamp
    private LocalDateTime created_on;

    @UpdateTimestamp
    private LocalDateTime updated_at;

    @ManyToOne
    @JoinColumn(name = "aadhar_file_id")
    private FileEntity aadharFile;

    @ManyToOne
    @JoinColumn(name = "pan_file_id")
    private FileEntity panFile;

    @ManyToOne
    @JoinColumn(name = "passport_file_id")
    private FileEntity passportFile;
}


