package com.configserverllp.officerspro.documentmanagementservice.controller;

import com.configserverllp.officerspro.documentmanagementservice.dto.DocumentDto;
import com.configserverllp.officerspro.documentmanagementservice.service.DocumentService;
import com.configserverllp.officerspro.documentmanagementservice.service.S3StorageService; // NEW: Import S3 service
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing document metadata.
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final S3StorageService s3StorageService; // NEW: Inject S3 service

    /**
     * Create a new document record.
     */
    @PostMapping
    public ResponseEntity<DocumentDto> createDocument(@Valid @RequestBody DocumentDto dto) {
        DocumentDto saved = documentService.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Download a document file from S3 via document service.
     * Supports both inline display (for images/PDFs) and attachment download.
     */
    @GetMapping("/download")
    public ResponseEntity<?> downloadFile(
            @RequestParam("filePath") String filePath,
            @RequestParam(value = "inline", required = false, defaultValue = "true") boolean inline) {
        try {
            String resolvedPath = resolveFilePath(filePath);

            byte[] fileBytes = Objects.requireNonNull(
                    s3StorageService.downloadFile(resolvedPath),
                    "File contents are empty"
            );
            String fileName = extractFileName(filePath);
            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            // Determine content type based on file extension
            MediaType contentType = getMediaType(fileName);
            
            // Set disposition header based on inline parameter
            String disposition = inline ? "inline; filename=\"" + fileName + "\"" : "attachment; filename=\"" + fileName + "\"";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                    .contentLength(fileBytes.length)
                    .contentType(contentType)
                    .body(resource);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to download file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Determine media type based on file extension.
     */
    private MediaType getMediaType(String fileName) {
        if (fileName == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        
        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        } else if (lowerName.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        } else if (lowerName.endsWith(".webp")) {
            return MediaType.valueOf("image/webp");
        } else if (lowerName.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        } else if (lowerName.endsWith(".txt")) {
            return MediaType.TEXT_PLAIN;
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private String resolveFilePath(String filePath) {
        if (filePath != null && filePath.startsWith("/documents/")) {
            String idPart = filePath.substring(filePath.lastIndexOf("/") + 1);
            Long documentId = Long.parseLong(idPart.trim());
            DocumentDto document = documentService.getById(documentId);
            if (document.getFilePath() == null || document.getFilePath().isBlank()) {
                throw new IllegalStateException("Document " + documentId + " does not have a stored file path");
            }
            return document.getFilePath();
        }
        return filePath;
    }

    private String extractFileName(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return "document";
        }
        String normalized = filePath.replace("\\", "/");
        int lastSlash = normalized.lastIndexOf("/");
        if (lastSlash >= 0 && lastSlash + 1 < normalized.length()) {
            return normalized.substring(lastSlash + 1);
        }
        return normalized;
    }

    /**
     * Upload a file and create document record.
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "linkedTo", required = true) String linkedTo,
            @RequestParam(value = "linkId", required = false) String linkId,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy) {

        try {
            System.out.println("📥 DocumentService received file upload request:");
            System.out.println("  File: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
            System.out.println("  LinkedTo: " + linkedTo + ", LinkId: " + linkId + ", Tag: " + tag);

            // Parse uploadedBy - handle both email strings and numeric IDs
            Long uploadedByLong = 1L; // Default value
            if (uploadedBy != null) {
                try {
                    uploadedByLong = Long.parseLong(uploadedBy);
                } catch (NumberFormatException e) {
                    // If it's an email or non-numeric, use default
                    System.out.println("⚠️ uploadedBy is not numeric: " + uploadedBy + ", using default ID: 1");
                    uploadedByLong = 1L;
                }
            }

            // NEW: Upload file to S3 and get the URL
            String s3FileUrl = s3StorageService.uploadFile(file, linkedTo, linkId);
            System.out.println("✅ File uploaded to S3: " + s3FileUrl);

            // UPDATED: Use S3 URL instead of local path
            DocumentDto dto = DocumentDto.builder()
                    .fileName(file.getOriginalFilename())
                    .filePath(s3FileUrl) // CHANGED: Now stores S3 URL instead of local path
                    .linkedTo(linkedTo)
                    .linkId(linkId)
                    .uploadedBy(uploadedByLong)
                    .uploadedOn(LocalDateTime.now())
                    .createdBy(uploadedByLong)
                    .createdOn(LocalDateTime.now())
                    .build();

            // Save document metadata
            DocumentDto saved = documentService.create(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("documentId", saved.getDocumentId());
            response.put("fileName", saved.getFileName());
            response.put("s3Key", saved.getFilePath()); // NEW: Return S3 URL to client
            response.put("message", "File uploaded successfully to S3");

            System.out.println("✅ Document saved with ID: " + saved.getDocumentId() + " and S3 URL: " + saved.getFilePath());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error uploading file: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all documents.
     */
    @GetMapping
    public ResponseEntity<List<DocumentDto>> getAllDocuments(
            @RequestParam(required = false) String linked_to,
            @RequestParam(required = false) String link_id) {

        if (linked_to != null && link_id != null) {
            List<DocumentDto> result = documentService.getByLinkedToAndLinkId(linked_to, link_id);
            return ResponseEntity.ok(result);
        }
        List<DocumentDto> all = documentService.getAll();
        return ResponseEntity.ok(all);
    }

    /**
     * Get a single document by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable Long id) {
        DocumentDto dto = documentService.getById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Update an existing document record.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<DocumentDto> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentDto dto) {

        DocumentDto updated = documentService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a document by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get documents created between two date-times.
     */
    @GetMapping("/created-between")
    public ResponseEntity<List<DocumentDto>> getDocumentsByCreatedOnRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {

        List<DocumentDto> docs = documentService.getByCreatedOnRange(start, end);
        return ResponseEntity.ok(docs);
    }

    /**
     * Update only the linkId field of a document.
     */
    @PutMapping("/{id}/linkId")
    public ResponseEntity<Map<String, String>> updateDocumentLinkId(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String linkId = request.get("linkId");
        documentService.updateLinkId(id, linkId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "LinkId updated successfully");
        response.put("documentId", String.valueOf(id));
        response.put("linkId", linkId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/signed-url")
    public ResponseEntity<Map<String, Object>> getSignedUrl(@PathVariable Long id) {

        DocumentDto document = documentService.getById(id);

        String signedUrl = s3StorageService.generatePresignedUrl(document.getFilePath());

        Map<String, Object> response = new HashMap<>();
        response.put("documentId", id);
        response.put("signedUrl", signedUrl);
        response.put("expiresInMinutes", 30);

        return ResponseEntity.ok(response);
    }

}