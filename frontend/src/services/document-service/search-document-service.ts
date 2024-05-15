import { ApiDocument, ApiPartyData } from '@interfaces/document';
import { apiService } from '@services/api-service';

export interface Document extends ApiDocument {
}

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

export const handleResponse: (res: ApiDocument[]) => Document[] = (res) => {
	
	const documents = res.map(mapApiDocumentToDocument);
	return documents;
};

export const translateLegalId: (
	legalId: string,
) => Promise<ApiPartyData> = (legalId) => {
	if (!legalId) {
		return Promise
			.reject(new Error('Legalid missing'));
	}

	const url = `party/${legalId}/partyId`;
	return apiService
		.get<string>(url)
		.then((res: ApiPartyData) => {
			return res.data as ApiPartyData;
		})
		.catch((e) => {
			return { partyId: null, message: e.response?.status ?? 'UNKNOWN ERROR' } as ApiPartyData;
		});
};

export const findDocuments: (
	partyId: string,
	includeConfidential: boolean,
	page?: number,
	size?: number,
) => Promise<DocumentSearchResult> = (partyId, includeConfidential, page = 0, size = 10) => {
	if (!partyId) {
		return Promise
			.reject(new Error('PartyID missing'));
	}

	const url = `document?query=%2A${partyId}%2A&includeConfidential=${includeConfidential}&page=${page}&size=${size}`;

	return apiService
		.get<PagedApiDocuments>(url)
		.then((res: DocumentSearchResult) => {
			const response = {
				documents: handleResponse(res.data.documents),
				page: res.data._meta.page,
				size: res.data._meta.limit,
				totalPages: res.data._meta.totalPages,
				totalElements: res.data._meta.totalRecords
			} as DocumentSearchResult;
			return response;
		})
		.catch((e) => {
			return { documents: [], error: e.response?.status ?? 'UNKNOWN ERROR' } as DocumentSearchResult;
		});
};
