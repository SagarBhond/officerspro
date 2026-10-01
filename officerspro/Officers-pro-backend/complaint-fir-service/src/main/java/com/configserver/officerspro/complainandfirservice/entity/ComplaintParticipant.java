package com.configserver.officerspro.complainandfirservice.entity;

import com.configserver.officerspro.complainandfirservice.enums.ParticipantRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ComplaintParticipant")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer complaintParticipantId;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    @JsonIgnore // Break circular reference
    private WrittenComplaint complaint;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "citizen_id")
    private Citizen citizen;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ParticipantRole role;
    
    @Column(length = 10000, nullable = true)
    private String statement;

    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}
