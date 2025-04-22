// 환경 변수를 안전하게 가져오는 도우미 함수
export const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key] || defaultValue;
  if (!value && defaultValue === '') {
    console.warn(`환경 변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
};

// 메타 API 설정
export const metaConfig = {
  appId: getEnvVariable('META_APP_ID'),
  appSecret: getEnvVariable('META_APP_SECRET'),
  accessToken: getEnvVariable('META_ACCESS_TOKEN'),
  adAccountId: getEnvVariable('META_AD_ACCOUNT_ID'),
};

// 서버 설정
export const serverConfig = {
  nodeEnv: getEnvVariable('NODE_ENV', 'development'),
  port: parseInt(getEnvVariable('PORT', '3000'), 10),
};

// 보안 설정
export const securityConfig = {
  nextAuthSecret: getEnvVariable('NEXTAUTH_SECRET'),
}; 