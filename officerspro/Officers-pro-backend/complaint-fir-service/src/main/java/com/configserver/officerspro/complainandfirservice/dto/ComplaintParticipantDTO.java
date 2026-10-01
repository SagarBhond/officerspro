package com.configserver.officerspro.complainandfirservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.configserver.officerspro.complainandfirservice.enums.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ComplaintParticipantDTO {
    private Integer complaintParticipantId;
    private String complaintId; // Changed to String to match WrittenComplaint entity
    private Integer citizenId;
    private ParticipantRole role;

    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;

    private String name;
    private String contactNo; // Changed from contactNumber to match frontend
    private String address;
    private String profession;
    private String aadharNo; // Changed from aadharNumber to match frontend
    private String email;
    private String statement; // Added for witness statements
    private String gender; // Added for witness/complainant gender
    private Integer age; // Added for witness/complainant age

    // Explicit getters and setters for gender and age to ensure MapStruct can find them
    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
