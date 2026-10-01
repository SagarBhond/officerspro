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

@Entity
@Table(name = "evidences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "custom-id-generator")
    @GenericGenerator(name = "custom-id-generator", strategy = "com.cms.officerspro.entity.generator.CustomIdGenerator")
    private String evidenceId;

    @Convert(converter = AesEncryptor.class)
    private String evidenceName;

    @Convert(converter = AesEncryptor.class)
    private String fileType;


//    @Column(length = 1000000000)
//    private byte[] evidenceData;

    @Convert(converter = AesEncryptor.class)
    private String description;

    @Convert(converter = AesEncryptor.class)
    private String evidenceType;

    @Column(length = 1000000)
    private String evidenceFilePath;

    @ManyToOne
    @JoinColumn(name = "victim_id")
    private Victim victim;

    @CreationTimestamp
    private LocalDateTime createdOn;

    @UpdateTimestamp
    private LocalDateTime updated_at;
}
