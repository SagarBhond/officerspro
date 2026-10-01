package com.configserver.officerspro.courtcasemanagementservice.dto.response;

import com.configserver.officerspro.courtcasemanagementservice.enums.DocumentSource;

public class DocumentItemResponse {
	private Long mappingId;
	private Long documentId;
	private String documentType;
	private DocumentSource source;
	private String sourceId;

	public Long getMappingId() {
		return mappingId;
	}

	public void setMappingId(Long mappingId) {
		this.mappingId = mappingId;
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


