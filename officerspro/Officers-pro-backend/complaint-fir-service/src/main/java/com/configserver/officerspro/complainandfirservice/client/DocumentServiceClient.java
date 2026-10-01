package com.configserver.officerspro.complainandfirservice.client;

import com.configserver.officerspro.complainandfirservice.config.FeignConfig;
import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(
    name = "document-service",
    url = "${document.service.url:http://localhost:8085}",
    configuration = FeignConfig.class
)
public interface DocumentServiceClient {

    @PostMapping(
            value = "/api/documents/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    Map<String, Object> uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestPart("linkedTo") String linkedTo,
            @RequestPart(value = "linkId", required = false) String linkId,
            @RequestPart(value = "tag", required = false) String tag,
            @RequestPart(value = "uploadedBy", required = false) String uploadedBy
    );


}
