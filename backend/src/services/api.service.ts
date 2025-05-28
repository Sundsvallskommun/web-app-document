import { HttpException } from '@/exceptions/HttpException';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import ApiTokenService from './api-token.service';
import { logger } from '@/utils/logger';
import { DISABLE_OAUTH2 } from '@config';

class ApiResponse<T> {
  data: T;
  message: string;
}

class ApiService {
  private apiTokenService = new ApiTokenService();
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    let defaultHeaders = {};
    
    if (!DISABLE_OAUTH2) { // Only fetch oauth2 authenication if property is enabled
    const token = await this.apiTokenService.getToken();
      defaultHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    const defaultParams = {};

    const preparedConfig: AxiosRequestConfig = {
      ...config,
      headers: { ...defaultHeaders, ...config.headers },
      params: { ...defaultParams, ...config.params },
      url: config.url,
    };
    logger.info(preparedConfig.method + ' ' + preparedConfig.url);
    try {
      const res = await axios(preparedConfig);
      return { data: res.data, message: 'success' };
    } catch (error: unknown | AxiosError) {
      if (axios.isAxiosError(error)) {
        logger.error(JSON.stringify(error.response?.data));
        if ((error as AxiosError).response?.status === 404) {
          throw new HttpException(404, 'Not found');
        }
      }

      // NOTE: did you subscribe to the API called?
      throw new HttpException(500, 'Internal server error from gateway');
    }
  }

  public async get<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET' });
  }

  public async post<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST' });
  }

  public async patch<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH' });
  }

  public async delete<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE' });
  }
}

export default ApiService;
