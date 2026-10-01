package com.configserverllp.officerspro.subscriptionpaymentservice.entity;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "payment_transaction")
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "officer_id")
    private String officerId;

    @Column(name = "officer_name")
    private String officerName;

    @Column(name = "officer_email")
    private String officerEmail;

    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    private Double amount;
    private String currency;
    private String receipt;

    @Column(name = "status")
    private String status;  // CREATED, PAID, FAILED

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type")
    private SubscriptionType planType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
