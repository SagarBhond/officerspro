package com.cms.officerspro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long feedbackId;
    private long rating;
    private String feedbackDesc;

    @ManyToOne
    @JoinColumn(name = "officerId")
    private Officer officer;

    @CreationTimestamp
    private LocalDateTime createdOn;
}
