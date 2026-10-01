package com.configserver.officerspro.complainandfirservice.dto;

import lombok.Data;

@Data
public class FIRWitnessDTO {
    private Integer id;
    private String name;
    private String address;
    private String contactNumber;
    private String statement;
    private Long firId;
}
