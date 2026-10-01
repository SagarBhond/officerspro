package com.cms.officerspro.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SubscriptionType {
    FREE("free"),
    ONE_MONTH("1_month"),
    THREE_MONTHS("3_months"),
    SIX_MONTHS("6_months"),
    TWELVE_MONTHS("12_months");

    private final String value;
}