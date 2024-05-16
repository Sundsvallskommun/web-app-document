export interface ApiDocumentSearchResult {
    documents: ApiDocument[];
    _meta: {
		count: number;
		limit: number;
	    page: number;
	    size: number;
	    totalPages: number;
	    totalElements: number;
	};
} 

export interface ApiDocument {
  id: string;
  municipalityId: string;
  registrationNumber: string;
  revision: number;
  confidentiality: {
	confidential: boolean;
	legalCitation: string;
  };
  description: string;
  created: string;
  createdBy: string;
  archive: boolean;
  metadataList: ApiMetadataItem[];
  documentData: ApiDocumentData[];
}

export interface ApiMetadataItem {
	key: string;
	value: string;
}

export interface ApiDocumentData {
	id: string;
	fileName: string;
	mimeType: string;
	fileSizeInBytes: number;
}

export interface ApiPartyData {
	partyId: string;
	message: string;
}
