'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MetaAdService } from '../services/meta-api';
import axios from 'axios';

interface MetaApiContextType {
  apiService: MetaAdService | null;
  isConnected: boolean;
  connectApi: (accessToken: string, adAccountId: string) => Promise<boolean>;
  disconnectApi: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  useEnvCredentials: () => Promise<boolean>;
}

const defaultContext: MetaApiContextType = {
  apiService: null,
  isConnected: false,
  connectApi: async () => false,
  disconnectApi: async () => false,
  loading: false,
  error: null,
  useEnvCredentials: async () => false
};

const MetaApiContext = createContext<MetaApiContextType>(defaultContext);

export const useMetaApi = () => useContext(MetaApiContext);

interface MetaApiProviderProps {
  children: ReactNode;
}

export const MetaApiProvider = ({ children }: MetaApiProviderProps) => {
  const [apiService, setApiService] = useState<MetaAdService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 환경 변수에서 자격 증명 가져오기
  const loadEnvCredentials = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/credentials/env');
      if (response.data.success) {
        const { accessToken, adAccountId } = response.data.data;
        const connected = connectApiInternal(accessToken, adAccountId);
        if (connected) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('환경 변수에서 자격 증명 로드 실패:', error);
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        setError('환경 변수에서 자격 증명을 로드하는 중 오류가 발생했습니다.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 서버에 자격 증명 저장
  const saveCredentialsToServer = async (accessToken: string, adAccountId: string) => {
    try {
      const response = await axios.post('/api/credentials', {
        accessToken,
        adAccountId
      });
      return response.data.success;
    } catch (error) {
      console.error('서버에 자격 증명 저장 실패:', error);
      setError('서버에 자격 증명을 저장하는 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 서버에서 자격 증명 로드
  const loadCredentialsFromServer = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/credentials');
      if (response.data.success) {
        const { accessToken, adAccountId } = response.data.data;
        connectApiInternal(accessToken, adAccountId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('서버에서 자격 증명 로드 실패:', error);
      // 404 오류는 정상적인 경우일 수 있으므로 무시
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        setError('서버에서 자격 증명을 로드하는 중 오류가 발생했습니다.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 서버에서 자격 증명 삭제
  const deleteCredentialsFromServer = async () => {
    try {
      const response = await axios.delete('/api/credentials');
      return response.data.success;
    } catch (error) {
      console.error('서버에서 자격 증명 삭제 실패:', error);
      setError('서버에서 자격 증명을 삭제하는 중 오류가 발생했습니다.');
      return false;
    }
  };

  // API 서비스 내부 연결 함수
  const connectApiInternal = (accessToken: string, adAccountId: string) => {
    try {
      const service = new MetaAdService({ accessToken, adAccountId });
      setApiService(service);
      setIsConnected(true);
      
      // 로컬 스토리지에도 백업 저장 (선택적)
      if (typeof window !== 'undefined') {
        localStorage.setItem('meta_access_token', accessToken);
        localStorage.setItem('meta_ad_account_id', adAccountId);
      }
      
      setError(null);
      return true;
    } catch (error) {
      console.error('API 연결 실패:', error);
      setError('API 서비스 연결에 실패했습니다.');
      return false;
    }
  };

  // 외부 노출 API 연결 함수
  const connectApi = async (accessToken: string, adAccountId: string) => {
    setLoading(true);
    try {
      // 먼저 로컬에서 연결
      const connected = connectApiInternal(accessToken, adAccountId);
      
      if (connected) {
        // 연결 성공 시 서버에 저장
        await saveCredentialsToServer(accessToken, adAccountId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('API 연결 오류:', error);
      setError('API 연결 중 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 환경 변수 자격 증명 사용 함수
  const useEnvCredentials = async () => {
    setLoading(true);
    try {
      const envLoaded = await loadEnvCredentials();
      
      if (envLoaded) {
        setError(null);
        return true;
      } else {
        setError('환경 변수에서 자격 증명을 불러올 수 없습니다.');
        return false;
      }
    } catch (error) {
      console.error('환경 변수 자격 증명 사용 오류:', error);
      setError('환경 변수 자격 증명 사용 중 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 연결 해제 함수
  const disconnectApi = async () => {
    setLoading(true);
    try {
      // 서버에서 자격 증명 삭제
      await deleteCredentialsFromServer();
      
      // 로컬 상태 초기화
      setApiService(null);
      setIsConnected(false);
      setError(null);
      
      // 로컬 스토리지에서 삭제
      if (typeof window !== 'undefined') {
        localStorage.removeItem('meta_access_token');
        localStorage.removeItem('meta_ad_account_id');
      }
      
      return true;
    } catch (error) {
      console.error('연결 해제 오류:', error);
      setError('연결 해제 중 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 자격 증명 로드 시도 순서:
  // 1. 환경 변수에서 로드
  // 2. 서버에서 로드
  // 3. 로컬 스토리지에서 로드
  useEffect(() => {
    const initializeCredentials = async () => {
      // 1. 환경 변수에서 로드 시도
      const envLoaded = await loadEnvCredentials();
      
      if (!envLoaded) {
        // 2. 서버에서 로드 시도
        const serverLoaded = await loadCredentialsFromServer();
        
        // 3. 서버에서 로드 실패 시, 로컬 스토리지에서 시도
        if (!serverLoaded && typeof window !== 'undefined') {
          const savedToken = localStorage.getItem('meta_access_token');
          const savedAccountId = localStorage.getItem('meta_ad_account_id');
          
          if (savedToken && savedAccountId) {
            connectApi(savedToken, savedAccountId);
          }
        }
      }
    };
    
    initializeCredentials();
  }, []);

  return (
    <MetaApiContext.Provider
      value={{
        apiService,
        isConnected,
        connectApi,
        disconnectApi,
        loading,
        error,
        useEnvCredentials
      }}
    >
      {children}
    </MetaApiContext.Provider>
  );
}; 