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
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="victims")
@Builder
public class Victim {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "custom-id-generator")
    @GenericGenerator(name = "custom-id-generator", strategy = "com.cms.officerspro.entity.generator.CustomIdGenerator")
    @Column(name = "victim_id")
    private String victimId;

    @Convert(converter = AesEncryptor.class)
    private String victimName;

    @Convert(converter = AesEncryptor.class)
    private String victimEmail;

    @Convert(converter = AesEncryptor.class)
    private String victimProfession;

    @Convert(converter = AesEncryptor.class)
    private String victimGender;

    @Convert(converter = AesEncryptor.class)
    private  String victimAddress;

    @Convert(converter = AesEncryptor.class)
    private String victimAge;

    @Convert(converter = AesEncryptor.class)
    private String victimAadharNo;

    @Convert(converter = AesEncryptor.class)
    private String victimMobileNo;

    @Convert(converter = AesEncryptor.class)
    private String firNo;

    @Convert(converter = AesEncryptor.class)
    private String shortDescription;

    private String type;

    private String caseStatus;

    @CreationTimestamp
    private LocalDateTime created_on;

    @UpdateTimestamp
    private LocalDateTime updated_at;

//    @OneToOne
//    @JoinColumn(name = "offender_id")
//    private Offender offender;

    @OneToMany
    @JoinColumn
    private List<Offender> offenderList;

    @OneToMany
    @JoinColumn
    private List<Witness> witnessList;

    @OneToMany
    @JoinColumn
    private List<Ferrist> ferristList;


    @OneToOne
    @JoinColumn(name = "crime_id")
    private CrimeDetails crimesDetails;

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