import { ApiDocumentSearchResult, ApiDocument, ApiPartyData } from '@interfaces/document';
import { apiService } from '@services/api-service';

export interface Document extends ApiDocument {}

export interface DocumentSearchResult {
  documents: Document[];
  page: number;
  size: number;
  totalPages: number;
  totalRecords: number;
} 

export const translateLegalId: ( 
  municipalityId: string,
  legalId: string 
) => Promise<string> = async (municipalityId, legalId) => {
  const url = `party/${municipalityId}/${legalId}/partyId`;

  return apiService
    .get<ApiPartyData>(url)
    .then((res) => res.data as unknown as string)
    .catch((e) => {
      console.error('Error occurred when translating legalId %s', legalId, e);
      throw e;
    });
};

export const searchDocuments: (
  municipalityId: string,
  partyId: string,
  includeConfidential: boolean,
  page?: number,
  size?: number,
  sort?: { [key: string]: string },
) => Promise<DocumentSearchResult> = async (municipalityId, partyId, includeConfidential, page = 0, size = 10, sort) => {
  let url = `document?municipalityId=${municipalityId}&query=%2A${partyId}%2A&includeConfidential=${includeConfidential}&page=${page}&size=${size}`
  Object.entries(sort).forEach(([key, value]) => {
    url = url + `&sort=${key},${value}`;
  });
    
  return apiService
    .get<ApiDocumentSearchResult>(url)
    .then((res) => {
      return {
        documents: mapToDocuments(res.data.documents),
        page: res.data._meta.page,
        size: res.data._meta.limit,
        totalPages: res.data._meta.totalPages,
        totalRecords: res.data._meta.totalRecords
      } as DocumentSearchResult;
    })
    .catch((e) => {
      console.error('Error occurred when searching documents connected to party with id %s', partyId, e);
      throw e;
    });
};

export const mapToDocuments: (res: ApiDocument[]) => Document[] = (res) => {
  const documents = res.map(mapApiDocumentToDocument);
  return documents;
};

export const mapApiDocumentToDocument: (e: ApiDocument) => Document = (e) => {
  try {
    const idocument: Document = {
      ...e,
      id: e.id,
      municipalityId: e.municipalityId,
      registrationNumber: e.registrationNumber,
      revision: e.revision,
      confidentiality: {
        confidential: e.confidentiality?.confidential || false,
        legalCitation: e.confidentiality?.legalCitation
      },
      description: e.description,
      created: e.created,
      createdBy: e.createdBy,
      archive: e.archive,
      metadataList: e.metadataList || [],
      documentData: e.documentData || []
    };
    return idocument;
  } catch (e) {
    console.error('Error: could not map document.', e);
    throw e;
  }
};

export const fetchDocumentFile: (
  municipalityId: string,
  registrationNumber: string, 
  documentDataId: string, 
  includeConfidential: boolean,
) => Promise<string> = async (municipalityId, registrationNumber, documentDataId, includeConfidential) => {
  if (!registrationNumber || !documentDataId) {
    console.error('RegistrationNumber or documentDataId missing, cannot fetch.');
    throw new Error('Missing vital input for retriieving document data');
  }
  const url = `document/${registrationNumber}/file/${documentDataId}?municipalityId=${municipalityId}&includeConfidential=${includeConfidential}`;
  return apiService
    .get<string>(url)
    .then((res) => res.data)
    .catch((e) => {
      console.error('Error occurred when fetching documentdata with id %s for document %s', documentDataId, registrationNumber, e);
      throw e;
    });
};
