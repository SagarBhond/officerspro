package com.adminbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileEntityDto {

    private String fileId;
    private String fileName;
    private String filePath;
}
