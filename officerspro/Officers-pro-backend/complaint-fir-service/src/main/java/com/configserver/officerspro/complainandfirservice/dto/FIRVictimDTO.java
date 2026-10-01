package com.configserver.officerspro.complainandfirservice.dto;

import lombok.Data;

@Data
public class FIRVictimDTO {
    private Integer id;
    private String name;
    private String address;
    private String contactNumber;
    private String statement;
    private String injuries;
    private Long firId;
}
