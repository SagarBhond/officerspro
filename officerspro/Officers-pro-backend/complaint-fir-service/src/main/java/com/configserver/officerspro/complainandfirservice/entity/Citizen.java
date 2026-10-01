package com.configserver.officerspro.complainandfirservice.entity;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Citizen")
@Data
@Setter
@Getter
@Builder
@NoArgsConstructor

public class Citizen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer citizenId;

    private String name;

    @Column(nullable = true)
    private String gender;

    @Column(nullable = true)
    private Integer age;


    @Column(unique = true, nullable = true, length = 12)
    private String aadharNo;

    @Column(nullable = true)
    private String contactNo;


    @Column(unique = true, nullable = true)
    private String email;

    @Column(nullable = true)
    private String profession;

    @Column(length = 5000, nullable = true)
    private String address;

    @Column(name = "aadhar_path", nullable = true)
    private String aadharPath;

    @Column(name = "pan_path", nullable = true)
    private String panPath;

    @Column(name = "photo_path", nullable = true)
    private String photoPath;

    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    @Column(nullable = true)
    private LocalDateTime updatedOn;

    public Citizen(Integer citizenId, String name, String gender, Integer age, String aadharNo, String contactNo, String email, String profession, String address, String aadharPath, String panPath, String photoPath, Integer createdBy, LocalDateTime createdOn, Integer updatedBy, LocalDateTime updatedOn) {
        this.citizenId = citizenId;
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.aadharNo = aadharNo;
        this.contactNo = contactNo;
        this.email = email;
        this.profession = profession;
        this.address = address;
        this.aadharPath = aadharPath;
        this.panPath = panPath;
        this.photoPath = photoPath;
        this.createdBy = createdBy;
        this.createdOn = createdOn;
        this.updatedBy = updatedBy;
        this.updatedOn = updatedOn;
    }
}
