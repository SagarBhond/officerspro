package com.configserver.officerspro.complainandfirservice.dto;

import lombok.Data;

@Data
public class FIRAccusedDTO {
    private Integer id;
    private String name;
    private String address;
    private String contactNumber;
    private String aadharNumber;
    private String charges;
    private String status; // e.g., "Arrested", "Absconding", "Released"
    private Long firId;
}
