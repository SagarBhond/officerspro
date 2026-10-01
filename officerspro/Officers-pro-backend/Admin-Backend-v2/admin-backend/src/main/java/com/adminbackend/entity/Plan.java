package com.adminbackend.entity;
import com.adminbackend.dto.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "subscription_plans")
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double price;

    @Enumerated(EnumType.STRING)
    private SubscriptionType duration;

    private Integer durationDays;

    @ElementCollection
    @CollectionTable(name = "plan_features", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "feature")
    private List<String> features;

    // ✅ NEW FIELD
    @Column(nullable = false)
    //private boolean active = true; // true = Active, false = Inactive
    private boolean active;

}
