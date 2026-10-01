package com.adminbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tokenId;
    private String token;
    private Instant expiryDate;


    @OneToOne
    @JoinColumn(name="user_id",referencedColumnName = "id")
    private User user;

}
