package com.configserver.officerspro.courtcasemanagementservice.entity;

import com.configserver.officerspro.courtcasemanagementservice.enums.CaseStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "court_case")
public class CourtCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long caseId;

    @Column(nullable = false, unique = true)
    private String caseNumber;

    private String chargesheetId;
    
    @Column(unique = true)
    private String firId;

    private String courtName;

    @Enumerated(EnumType.STRING)
    private CaseStatus status;

    private LocalDateTime createdOn;
    private Long createdBy;

    // Latest chargesheet associated with this case (for UI to show current docs)
    private String currentChargesheetId;

    // Court-provided tracking identifier
    private String courtTrackingId;

    @OneToMany(mappedBy = "courtCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourtCaseDocument> documents;

    @OneToMany(mappedBy = "courtCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourtHearing> hearings;

    @OneToMany(mappedBy = "courtCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Summons> summonsList;

    @OneToMany(mappedBy = "courtCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Judgment> judgments;

    @OneToMany(mappedBy = "courtCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourtCaseStatusHistory> statusHistory;

    // Default constructor
    public CourtCase() {}

    // Getters and Setters
    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public String getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(String caseNumber) {
        this.caseNumber = caseNumber;
    }

    public String getChargesheetId() {
        return chargesheetId;
    }

    public void setChargesheetId(String chargesheetId) {
        this.chargesheetId = chargesheetId;
    }

    public String getFirId() {
        return firId;
    }

    public void setFirId(String firId) {
        this.firId = firId;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(LocalDateTime createdOn) {
        this.createdOn = createdOn;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public String getCurrentChargesheetId() {
        return currentChargesheetId;
    }

    public void setCurrentChargesheetId(String currentChargesheetId) {
        this.currentChargesheetId = currentChargesheetId;
    }

    public String getCourtTrackingId() {
        return courtTrackingId;
    }

    public void setCourtTrackingId(String courtTrackingId) {
        this.courtTrackingId = courtTrackingId;
    }

    public List<CourtCaseDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(List<CourtCaseDocument> documents) {
        this.documents = documents;
    }

    public List<CourtHearing> getHearings() {
        return hearings;
    }

    public void setHearings(List<CourtHearing> hearings) {
        this.hearings = hearings;
    }

    public List<Summons> getSummonsList() {
        return summonsList;
    }

    public void setSummonsList(List<Summons> summonsList) {
        this.summonsList = summonsList;
    }

    public List<Judgment> getJudgments() {
        return judgments;
    }

    public void setJudgments(List<Judgment> judgments) {
        this.judgments = judgments;
    }

    public List<CourtCaseStatusHistory> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<CourtCaseStatusHistory> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
