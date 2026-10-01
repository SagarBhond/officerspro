package com.cms.officerspro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelpAndSupport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int supportId;

    private String uuid;

    private String subject;

    private String issueDesc;

    private String response;
    @ManyToOne
    @JoinColumn (name = "officer_id")
    private Officer officer;

    @CreationTimestamp
    private LocalDateTime createdOn;

    @UpdateTimestamp
    private LocalDateTime updated_at;

    @OneToOne
    private FileEntity issueImage;

}
