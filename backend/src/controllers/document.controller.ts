import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { OpenAPI } from 'routing-controllers-openapi';
import { Controller, Get, QueryParam } from 'routing-controllers';

@Controller()
export class DocumentController {
  private apiService = new ApiService();

  @Get('/document')
  @OpenAPI({ summary: 'Return matching documents' })
  async searchDocuments(
    @QueryParam('query') query: string,
    @QueryParam('includeConfidential') includeConfidential: boolean,
    @QueryParam('page') page: number,
    @QueryParam('size') size: number,
  ) {
    let url = `document/2.0/documents?query=${query}&includeConfidential=${includeConfidential || false}&page=${page || 0}&size=${size || 10}`;
    url += `&sort=registrationNumber,desc&sort=revision,desc`;

    const res = await this.apiService.get<{ status: string }>({ url }).catch(e => {
      logger.error('Error when retrieving documents matching search parameter:', e);
      return e;
    });
    return res.data;
  }
}
