import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { OpenAPI } from 'routing-controllers-openapi';
import { Controller, Get, Res, Param, QueryParam } from 'routing-controllers';

interface ApiDocumentSearchResult {
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

interface ApiDocument {
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

interface ApiMetadataItem {
  key: string;
  value: string;
}

interface ApiDocumentData {
  id: string;
  fileName: string;
  mimeType: string;
  fileSizeInBytes: number;
}

@Controller()
export class DocumentController {
  private apiService = new ApiService();
  private baseUrl = 'document/2.0/';

  @Get('/document')
  @OpenAPI({ summary: 'Returns documents matching sent in query' })
  async searchDocuments(
    @QueryParam('query') query: string,
    @QueryParam('includeConfidential') includeConfidential: boolean,
    @QueryParam('page') page: number,
    @QueryParam('size') size: number,
  ): Promise<ApiDocumentSearchResult> {
    let url = this.baseUrl + `documents?query=${query}&includeConfidential=${includeConfidential || false}&page=${page || 0}&size=${size || 10}`;
    url += `&sort=registrationNumber,desc&sort=revision,desc`;

    const res = await this.apiService.get<ApiDocumentSearchResult>({ url }).catch(e => {
      logger.error('Error when retrieving documents matching search parameter:', e);
      throw e;
    });
    return res.data;
  }

  @Get('/document/:registrationNumber/file/:documentDataId')
  @OpenAPI({ summary: 'Returns file matching sent in parameters' })
  async fetchDocumentFile(
    @Param('registrationNumber') registrationNumber: string,
    @Param('documentDataId') documentDataId: string,
    @QueryParam('includeConfidential') includeConfidential: boolean,
    @Res() response: any,
  ): Promise<string> {
    const url = this.baseUrl + `documents/${registrationNumber}/files/${documentDataId}?includeConfidential=${includeConfidential || false}`;

    const res = await this.apiService.get<ArrayBuffer>({ url, responseType: 'arraybuffer' }).catch(e => {
      logger.error('Error when retrieving document file:', e);
      throw e;
    });
    const binaryString = Array.from(new Uint8Array(res.data), v => String.fromCharCode(v)).join('');
    const b64 = Buffer.from(binaryString, 'binary').toString('base64');
    return response.send(b64);
  }
}
