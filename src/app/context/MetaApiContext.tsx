'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MetaAdService } from '../services/meta-api';

interface MetaApiContextType {
  apiService: MetaAdService | null;
  isConnected: boolean;
}

const defaultContext: MetaApiContextType = {
  apiService: null,
  isConnected: false
};

const MetaApiContext = createContext<MetaApiContextType>(defaultContext);

export const useMetaApi = () => useContext(MetaApiContext);

interface MetaApiProviderProps {
  children: ReactNode;
}

export const MetaApiProvider = ({ children }: MetaApiProviderProps) => {
  const [apiService, setApiService] = useState<MetaAdService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 자동으로 API 서비스 생성
  useEffect(() => {
    try {
      console.log('MetaApiContext: API 서비스 생성 시작');
      const service = new MetaAdService();
      console.log('MetaApiContext: API 서비스 생성 성공, 서비스:', service);
      console.log('MetaApiContext: 액세스 토큰:', service['accessToken']);
      console.log('MetaApiContext: 광고 계정 ID:', service['adAccountId']);
      setApiService(service);
      setIsConnected(true);
    } catch (error) {
      console.error('API 서비스 생성 실패:', error);
    }
  }, []);

  return (
    <MetaApiContext.Provider
      value={{
        apiService,
        isConnected
      }}
    >
      {children}
    </MetaApiContext.Provider>
  );
}; 