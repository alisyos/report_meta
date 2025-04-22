import axios from 'axios';
import { metaConfig } from '../config/env';

interface MetaApiConfig {
  accessToken: string;
  adAccountId: string;
}

interface DateRange {
  since: string;
  until: string;
}

interface ReportParams {
  dateRange: DateRange;
  level?: string;
  fields: string[];
  filtering?: any[];
  limit?: number;
}

export class MetaAdService {
  private baseUrl = 'https://graph.facebook.com/v20.0';
  private accessToken: string;
  private adAccountId: string;

  constructor(config?: MetaApiConfig) {
    // 환경 변수에서 설정 가져오기 또는 전달된 설정 사용
    this.accessToken = config?.accessToken || metaConfig.accessToken;
    this.adAccountId = config?.adAccountId || metaConfig.adAccountId;
  }

  /**
   * 광고 계정 정보 조회
   */
  async getAdAccount() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/act_${this.adAccountId}`,
        {
          params: {
            fields: 'name,account_status,amount_spent,balance,currency,business_name',
            access_token: this.accessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ad account:', error);
      throw error;
    }
  }

  /**
   * 인사이트 리포트 조회
   */
  async getInsights(params: ReportParams) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/act_${this.adAccountId}/insights`,
        {
          params: {
            time_range: JSON.stringify(params.dateRange),
            level: params.level || 'account',
            fields: params.fields.join(','),
            filtering: params.filtering ? JSON.stringify(params.filtering) : undefined,
            limit: params.limit || 100,
            access_token: this.accessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }

  /**
   * 캠페인 목록 조회
   */
  async getCampaigns() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/act_${this.adAccountId}/campaigns`,
        {
          params: {
            fields: 'id,name,objective,status,created_time,start_time,stop_time',
            access_token: this.accessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  /**
   * 캠페인 세부 정보 조회
   */
  async getCampaignDetails(campaignId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${campaignId}`,
        {
          params: {
            fields: 'id,name,objective,status,created_time,start_time,stop_time,spend,impressions,reach',
            access_token: this.accessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      throw error;
    }
  }

  /**
   * 광고세트 목록 조회
   * @param campaignId 캠페인 ID (선택적) - 특정 캠페인에 속한 광고세트만 필터링
   */
  async getAdSets(campaignId?: string) {
    try {
      const params: any = {
        fields: 'id,name,campaign_id,status,budget_remaining,daily_budget,lifetime_budget,targeting',
        access_token: this.accessToken,
      };
      
      // 캠페인 ID가 제공된 경우, 필터링 적용
      if (campaignId) {
        params.filtering = JSON.stringify([
          {
            field: 'campaign.id',
            operator: 'EQUAL',
            value: campaignId
          }
        ]);
      }
      
      const response = await axios.get(
        `${this.baseUrl}/act_${this.adAccountId}/adsets`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ad sets:', error);
      throw error;
    }
  }

  /**
   * 광고세트 인사이트 조회
   */
  async getAdSetInsights(adSetId: string, params: ReportParams) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${adSetId}/insights`,
        {
          params: {
            time_range: JSON.stringify(params.dateRange),
            fields: params.fields.join(','),
            access_token: this.accessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ad set insights:', error);
      throw error;
    }
  }

  /**
   * 광고 목록 조회
   */
  async getAds() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/act_${this.adAccountId}/ads`,
        {
          params: {
            fields: 'id,name,adset_id,campaign_id,status,created_time',
            access_token: this.accessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ads:', error);
      throw error;
    }
  }
} 