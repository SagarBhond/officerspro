package com.cms.officerspro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "officers_keycloak_registered")
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakUserRegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    private String keycloakUserId;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String subscriptionStatus;
    private String subscriptionType;

    @Column(nullable = false)
    private Boolean userStatus = true;

    @CreationTimestamp
    private LocalDateTime createdOn;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
