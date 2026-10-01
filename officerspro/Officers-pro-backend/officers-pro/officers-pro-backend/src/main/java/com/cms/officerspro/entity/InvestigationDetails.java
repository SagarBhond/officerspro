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

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestigationDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "custom-id-generator")
    @GenericGenerator(name = "custom-id-generator", strategy = "com.cms.officerspro.entity.generator.CustomIdGenerator")
    private String investId;

    @Convert(converter = AesEncryptor.class)
    @Column(length = 15000)
    private String investDescription;

    @CreationTimestamp
    private LocalDateTime created_on;

    @UpdateTimestamp
    private LocalDateTime updated_at;

    @ManyToOne
    @JoinColumn(name = "victim_id")
    private Victim victim;
}
