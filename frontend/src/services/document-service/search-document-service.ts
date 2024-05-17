import { ApiDocumentSearchResult, ApiDocument, ApiPartyData } from '@interfaces/document';
import { apiService } from '@services/api-service';

export interface Document extends ApiDocument {}

export interface PartyData extends ApiPartyData {}

export interface DocumentSearchResult {
    documents: Document[];
    page: number;
    size: number;
    totalPages: number;
    totalRecords: number;
} 

export const translateLegalId: ( legalId: string ) => Promise<string> = async (legalId) => {
	const url = `party/${legalId}/partyId`;

	return apiService
		.get<ApiPartyData>(url)
		.then((res) => res.data as unknown as string)
		.catch((e) => {
        	console.log(e);
        	throw e;
		});
};

export const findDocuments: (
	partyId: string,
	includeConfidential: boolean,
	page?: number,
	size?: number,
) => Promise<DocumentSearchResult> = async (partyId, includeConfidential, page = 0, size = 10) => {
	const url = `document?query=%2A${partyId}%2A&includeConfidential=${includeConfidential}&page=${page}&size=${size}`;

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
        	console.log(e);
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
				confidential: e.confidentiality.confidential,
				legalCitation: e.confidentiality.legalCitation
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
	}
};
