package com.adminbackend.dto;

import com.adminbackend.dto.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfficerDto {

    private String officerId;
    private String officerName;
    private String officerAge;
    private String officerGender;
    private String officerPost;
    private String officerStation;
    private String officerEmail;
    private String officerMobileNo;
    private boolean officerStatus;
    private LocalDateTime created_on;
    private FileEntityDto aadharFile;
    private FileEntityDto panFile;
    private FileEntityDto passportFile;
    private SubscriptionType subscriptionType;
    private String password;
    private String registeredByAdminEmail;
    private String adminEmail;

}
