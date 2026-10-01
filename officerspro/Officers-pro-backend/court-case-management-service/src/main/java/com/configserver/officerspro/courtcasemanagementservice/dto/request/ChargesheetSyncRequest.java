package com.configserver.officerspro.courtcasemanagementservice.dto.request;

import java.util.List;

public class ChargesheetSyncRequest {
	private String courtTrackingId; // optional, if provided we attach to case
	private boolean replaceAll = true; // if true, remove old CHARGESHEET docs not in the list
	private List<DocumentItem> documents;

	public String getCourtTrackingId() {
		return courtTrackingId;
	}

	public void setCourtTrackingId(String courtTrackingId) {
		this.courtTrackingId = courtTrackingId;
	}

	public boolean isReplaceAll() {
		return replaceAll;
	}

	public void setReplaceAll(boolean replaceAll) {
		this.replaceAll = replaceAll;
	}

	public List<DocumentItem> getDocuments() {
		return documents;
	}

	public void setDocuments(List<DocumentItem> documents) {
		this.documents = documents;
	}

	public static class DocumentItem {
		private Long documentId;
		private String documentType;

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
	}
}


