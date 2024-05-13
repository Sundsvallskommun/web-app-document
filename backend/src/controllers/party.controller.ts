import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { OpenAPI } from 'routing-controllers-openapi';
import { Controller, Get, Param } from 'routing-controllers';

export interface PartyResponseData {
  partyId: any;
  message: string;
}

@Controller()
export class PartyController {
  private apiService = new ApiService();

  @Get('/party/:legalId/partyId')
  @OpenAPI({ summary: 'Return partyId for sent in legalId' })
  async getLegalId(@Param('legalId') legalId: string): Promise<PartyResponseData> {
    let url;
    if (legalId.length == 10) {
      url = `party/1.0/ENTERPRISE/${legalId}/partyId`;
    } else if (legalId.length == 12) {
      url = `party/1.0/PRIVATE/${legalId}/partyId`;
    } else {
      return { partyId: null, message: `'Sent in legalId is not valid'` } as PartyResponseData;
    }
    const res = await this.apiService.get<{ status: string }>({ url }).catch(e => {
      logger.error('Error when retrieving partyId for sent in legalId:', e);
      return { data: null, message: `Error when retrieving partyId for sent in legalId` };
    });

    return { partyId: res.data, message: `Successful translation` } as PartyResponseData;
  }
}
