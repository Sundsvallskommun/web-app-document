import { apiService } from '../api-service';

export interface Municipality {
  municipalityId: string;
  name: string;
}

export interface MunicipalitiesApiResponse {
  data: Municipality[];
  message: string;
}

export const getMunicipalities: () => Promise<Municipality[]> = async () => {
  const url = 'municipalities';

  return apiService
    .get<MunicipalitiesApiResponse>(url)
    .then((res) => mapToMunicipalities(res.data.data))
    .catch((e) => {
      console.error('Error occurred when fetching municipalities', e);
      throw e;
    });
};

const mapToMunicipalities: (res: Municipality[]) => Municipality[] = (data) => {
  return data.map(mapToMunicipality);
};

const mapToMunicipality: (res: Municipality) => Municipality = (data) => ({
  municipalityId: data.municipalityId,
  name: data.name,
});
