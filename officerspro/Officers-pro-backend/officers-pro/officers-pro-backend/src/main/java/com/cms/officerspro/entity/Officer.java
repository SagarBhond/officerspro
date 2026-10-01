package com.cms.officerspro.entity;

import com.cms.officerspro.configuration.AesEncryptor;
import com.cms.officerspro.entity.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "officers")
@Builder
public class Officer {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,generator = "custom-id-generator")
    @GenericGenerator(name = "custom-id-generator", strategy = "com.cms.officerspro.entity.generator.CustomIdGenerator")
    @Column(name="officer_id")
    private String officerId;

    @Convert(converter = AesEncryptor.class)
    private String officerName;

    @Convert(converter = AesEncryptor.class)
    private String officerAge;

    @Convert(converter = AesEncryptor.class)
    private String officerGender;

    @Convert(converter = AesEncryptor.class)
    private String officerPost;

    @Convert(converter = AesEncryptor.class)
    private String officerStation;

    @Column(name = "officer_email", unique = true)
    @Convert(converter = AesEncryptor.class)
    private String officerEmail;

    @Convert(converter = AesEncryptor.class)
    private String officerMobileNo;

    private boolean officerStatus;

    @OneToMany
    @JoinColumn
    private List<Victim> victimList;

    @OneToMany
    @JoinColumn
    private List<InvestigationDetails> investigationDetailsList;

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

    @Enumerated(EnumType.STRING)
    private SubscriptionType subscriptionType;
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
    private Long remainingDays;

    public void setSubscriptionEndDate(LocalDateTime subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
        updateRemainingDays();
    }

    public void updateRemainingDays() {
        if (subscriptionEndDate != null) {
            this.remainingDays = ChronoUnit.DAYS.between(LocalDateTime.now(), subscriptionEndDate);
            if (this.remainingDays < 0) {
                this.remainingDays = 0L;
            }
        } else {
            this.remainingDays = 0L;
        }
    }

    public boolean isSubscriptionValid() {
        return subscriptionEndDate != null && LocalDateTime.now().isBefore(subscriptionEndDate);
    }
}
