import ApiResponse from '@/interfaces/api-service.interface';
import { MunicipalityInterface } from '@/interfaces/municipality.interface';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class Municipality implements MunicipalityInterface {
  @IsString()
  municipalityId: string;
  @IsString()
  name: string;
}

export class MunicipalitiesResponse implements ApiResponse<Municipality[]> {
  @ValidateNested()
  @Type(() => Municipality)
  data: Municipality[];
  @IsString()
  message: string;
}
