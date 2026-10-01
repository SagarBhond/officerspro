package com.configserver.chargesheet.dto;

import lombok.Data;

import java.util.List;

@Data
public class ReorderRequest {
    private List<OrderItem> newOrder;
    private Integer updatedBy;
    private String remarks;

    @Data
    public static class OrderItem {
        private Long documentId;
    }
}
