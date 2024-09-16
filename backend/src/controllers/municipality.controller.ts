import { municipalities } from '@/utils/municipalityUtil';

import { OpenAPI } from 'routing-controllers-openapi';
import { Controller, Get } from 'routing-controllers';
import { MunicipalitiesResponse } from '@/responses/municipality.response';

@Controller()
export class MunicipalityController {
  @Get('/municipalities')
  @OpenAPI({ summary: 'Returns a list of available municipalities' })
  async getMunicipalities(): Promise<MunicipalitiesResponse> {
    return {
      data: municipalities.filter(m => m.municipalityId.startsWith('22')).sort((a, b) => a.name.localeCompare(b.name)),
      message: 'SUCCESS',
    };
  }
}
