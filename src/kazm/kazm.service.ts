import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreateMemberDto, TrackEventDto } from './dto/kazm.dto';

@Injectable()
export class KazmService {
  private readonly apiKey = process.env.KAZM_API_KEY;
  private readonly baseUrl = process.env.KAZM_BASE_URL;

  constructor() {}

  async apiRequest(endpoint: string, method: string, body?: object) {
    const url = this.baseUrl + endpoint;
    const httpService = new HttpService();
    const headers = {
      authorization: `Bearer ${this.apiKey}`,
    };
    let response: AxiosResponse;
    switch (method) {
      case 'POST':
        response = await firstValueFrom(
          httpService.post(url, body, { headers }),
        );
        break;
      case 'GET':
        response = await firstValueFrom(httpService.get(url, { headers }));
        break;
      case 'DELETE':
        response = await firstValueFrom(
          httpService.request({
            method: 'DELETE',
            url,
            data: body,
            headers,
          }),
        );
        break;
      default:
        break;
    }
    return response;
  }

  async createMember(body: CreateMemberDto) {
    const endpoint = `/members`;
    const requestBody = {
      accounts: [body],
    };
    try {
      const response = await this.apiRequest(endpoint, 'POST', requestBody);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  }

  async searchMember(id: string) {
    const endpoint = `/members/email|${id}`;
    try {
      const response = await this.apiRequest(endpoint, 'GET');
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  }

  async trackEvent(body: TrackEventDto) {
    body['eventTimestamp'] = new Date();
    const endpoint = `/events/track`;
    try {
      const response = await this.apiRequest(endpoint, 'POST', body);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  }
}
