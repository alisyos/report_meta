// 환경 변수를 안전하게 가져오는 도우미 함수
export const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

// 메타 API 설정
export const metaConfig = {
  appId: getEnvVariable('meta.app.id', '1035860911763236'),
  appSecret: getEnvVariable('meta.app.secret', '1b193950aab1a2d3e4eb5326ad7229c7'),
  accessToken: getEnvVariable('meta.access.token', 'EAAOuHCmuryQBOwRX77apntyXlPsdUtjfahjpTP6XsZAK1DpspvLLMFj2vzAtftp9L6PAyP1LKyZCV8nFTHEuINtwWp21bTOLQ52v1SghCGe5EaSvgsVplls1m1bp9zZCgavOoWRKokEY1iwmRMWwZAkAePM6bdMe3ze5RCXe9xecLT36v0ZBcg8PAZBPe5qSQlGjCeTmqr0StjNB32OfjLS36OrNgPZCmLe0JIWr9oT'),
  adAccountId: getEnvVariable('meta.ad.account.id', 'act_684538543432601').replace('act_', ''),
};

// 서버 설정
export const serverConfig = {
  nodeEnv: getEnvVariable('NODE_ENV', 'development'),
  port: parseInt(getEnvVariable('PORT', '3000'), 10),
};

// 보안 설정
export const securityConfig = {
  nextAuthSecret: getEnvVariable('NEXTAUTH_SECRET', 'default-secret-for-development'),
}; 