export interface ApiPagingData {
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiDocument {
  id: string;
  municipalityId: string;
  registrationNumber: string;
  revision: number;
  confidentiality: {
	confidential: boolean;
	legalCitation: string;
  },
  description: string;
  created: string;
  createdBy: string;
  archive: boolean;
  metadataList: ApiMetadataItem[]
  documentData: ApiDocumentData[]
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
