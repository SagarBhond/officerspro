package com.cms.officerspro.dto;

import com.cms.officerspro.entity.FileEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FerristDto {

    private String ferristId;
    private String docType;
    private String docDescription;
    private String date;
    private String pageCount;
    private FileEntity ferristFile;
}
