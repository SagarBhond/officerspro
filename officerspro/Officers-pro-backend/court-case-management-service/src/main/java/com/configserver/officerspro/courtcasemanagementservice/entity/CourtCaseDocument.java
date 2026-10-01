package com.configserver.officerspro.courtcasemanagementservice.entity;

import com.configserver.officerspro.courtcasemanagementservice.enums.DocumentSource;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "court_case_document")
public class CourtCaseDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private CourtCase courtCase;

    @Column(name = "case_id", insertable = false, updatable = false)
    private Long caseId;

    private Long documentId;
    private String documentType;
    private LocalDateTime linkedOn;

    @Enumerated(EnumType.STRING)
    private DocumentSource source;

    // e.g., chargesheetId when source=CHARGESHEET
    private String sourceId;

    // Default constructor
    public CourtCaseDocument() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CourtCase getCourtCase() {
        return courtCase;
    }

    public void setCourtCase(CourtCase courtCase) {
        this.courtCase = courtCase;
    }

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public LocalDateTime getLinkedOn() {
        return linkedOn;
    }

    public void setLinkedOn(LocalDateTime linkedOn) {
        this.linkedOn = linkedOn;
    }

    public DocumentSource getSource() {
        return source;
    }

    public void setSource(DocumentSource source) {
        this.source = source;
    }

    public String getSourceId() {
        return sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }
}
