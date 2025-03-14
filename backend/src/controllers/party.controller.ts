import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { OpenAPI } from 'routing-controllers-openapi';
import { Controller, Get, Param } from 'routing-controllers';

@Controller()
export class PartyController {
  private apiService = new ApiService();

  @Get('/party/:municipalityId/:legalId/partyId')
  @OpenAPI({ summary: 'Return partyId for sent in legalId' })
  async getPartyId(@Param('municipalityId') municipalityId: string, @Param('legalId') legalId: string): Promise<string | null> {
    let url: string;
    if (legalId.length == 10) {
      url = `party/2.0/${municipalityId}/ENTERPRISE/${legalId}/partyId`;
    } else if (legalId.length == 12) {
      url = `party/2.0/${municipalityId}/PRIVATE/${legalId}/partyId`;
    } else {
      logger.error('Incoming legalId is not valid: ', legalId);
      return null;
    }
    return await this.apiService
      .get<{ status: string }>({ url })
      .then(response => response.data as unknown as string)
      .catch(e => {
        logger.error('Error when retrieving partyId for sent in legalId:', e);
        return null;
      });
  }
}
