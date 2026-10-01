package com.configserver.officerspro.complainandfirservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "fir_witness")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FIRWitness {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fir_id")
    private FIR fir;

    @ManyToOne
    @JoinColumn(name = "citizen_id")
    private Citizen citizen;

    private String remarks;
    private Integer createdBy;
    private LocalDateTime createdOn;
}

