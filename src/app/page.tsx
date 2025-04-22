'use client';

import { useState, useEffect } from 'react';
import { useMetaApi } from './context/MetaApiContext';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ApiCredentialsForm {
  accessToken: string;
  adAccountId: string;
}

export default function Home() {
  const { isConnected, connectApi, disconnectApi, loading, error, useEnvCredentials } = useMetaApi();
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ApiCredentialsForm>();

  const onSubmit = async (data: ApiCredentialsForm) => {
    try {
      const success = await connectApi(data.accessToken, data.adAccountId);
      if (success) {
        setSaveSuccess('인증 정보가 서버에 저장되었습니다.');
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (error) {
      console.error('메타 API 연결 오류:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const success = await disconnectApi();
      if (success) {
        setSaveSuccess('인증 정보가 서버에서 삭제되었습니다.');
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (error) {
      console.error('연결 해제 오류:', error);
    }
  };

  const handleUseEnvCredentials = async () => {
    try {
      const success = await useEnvCredentials();
      if (success) {
        setSaveSuccess('환경 변수의 인증 정보가 성공적으로 로드되었습니다.');
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (error) {
      console.error('환경 변수 로드 오류:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">메타 광고 리포트</h1>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
            >
              {loading ? '처리 중...' : '연결 해제'}
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">메타 광고 API 연결</h2>
            <p className="text-gray-600 mb-6">
              메타 광고 리포트를 확인하려면 메타 광고 API 접근 토큰과 광고 계정 ID를 입력하세요.
              입력한 정보는 서버에 안전하게 저장됩니다.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {saveSuccess}
              </div>
            )}
            
            <button
              onClick={handleUseEnvCredentials}
              disabled={loading}
              className="w-full mb-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
            >
              {loading ? '처리 중...' : '환경 변수의 인증 정보 사용하기'}
            </button>
            
            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-gray-500 text-sm">또는</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-1">
                  접근 토큰 (Access Token)
                </label>
                <input
                  type="text"
                  id="accessToken"
                  {...register('accessToken', { required: '접근 토큰을 입력해주세요' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="EAAxxxx..."
                />
                {errors.accessToken && (
                  <p className="mt-1 text-sm text-red-600">{errors.accessToken.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="adAccountId" className="block text-sm font-medium text-gray-700 mb-1">
                  광고 계정 ID
                </label>
                <input
                  type="text"
                  id="adAccountId"
                  {...register('adAccountId', { required: '광고 계정 ID를 입력해주세요' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1234567890"
                />
                {errors.adAccountId && (
                  <p className="mt-1 text-sm text-red-600">{errors.adAccountId.message}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? '처리 중...' : '연결 및 저장하기'}
              </button>
            </form>
            
            <div className="mt-6 text-sm text-gray-500">
              <p className="mb-2">
                <strong>도움말:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>접근 토큰은 <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Graph API 탐색기</a>에서 생성할 수 있습니다.</li>
                <li>권한은 <code>ads_read</code>, <code>ads_management</code> 권한이 필요합니다.</li>
                <li>광고 계정 ID는 <code>act_</code> 접두사 없이 숫자만 입력하세요.</li>
                <li>입력하신 정보는 서버의 <code>credentials.json</code> 파일에 저장됩니다.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {saveSuccess}
              </div>
            )}
            <ReportDashboard />
          </div>
        )}
      </main>
    </div>
  );
}

function ReportDashboard() {
  const router = useRouter();
  const { apiService } = useMetaApi();
  const [accountData, setAccountData] = useState<any>(null);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [adSets, setAdSets] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 전
    until: new Date().toISOString().split('T')[0], // 오늘
  });

  const loadAccountData = async () => {
    if (!apiService) return;
    
    setIsLoading(true);
    try {
      const account = await apiService.getAdAccount();
      setAccountData(account);
      
      const insights = await apiService.getInsights({
        dateRange: dateRange,
        fields: [
          'spend', 
          'impressions', 
          'clicks', 
          'cpc', 
          'ctr',
          'reach',
          'frequency',
          'actions',
          'cost_per_action_type'
        ]
      });
      setInsightsData(insights);
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 네비게이션을 위한 캠페인 및 광고세트 데이터 로드
  const loadNavigationData = async () => {
    if (!apiService) return;
    
    setLoadingNavigation(true);
    try {
      // 캠페인 목록 로드
      const campaignsResponse = await apiService.getCampaigns();
      if (campaignsResponse && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }
    } catch (error) {
      console.error('네비게이션 데이터 로드 오류:', error);
    } finally {
      setLoadingNavigation(false);
    }
  };

  // 캠페인 ID로 광고 세트 로드
  const loadAdSets = async (campaignId: string) => {
    if (!apiService) return;
    
    setLoadingNavigation(true);
    try {
      const adSetsResponse = await apiService.getAdSets(campaignId);
      if (adSetsResponse && adSetsResponse.data) {
        setAdSets(adSetsResponse.data);
      }
    } catch (error) {
      console.error('광고 세트 로드 오류:', error);
    } finally {
      setLoadingNavigation(false);
    }
  };

  // 페이지 로드 시 데이터 로딩
  useEffect(() => {
    if (apiService) {
      loadAccountData();
      loadNavigationData();
    }
  }, [apiService]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'since' | 'until') => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    });
  };

  // 캠페인 선택 핸들러
  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campaignId = e.target.value;
    if (campaignId) {
      if (e.target.selectedOptions[0].dataset.action === 'view') {
        router.push(`/adsets?campaignId=${campaignId}`);
      } else {
        loadAdSets(campaignId);
      }
    } else {
      setAdSets([]);
    }
  };
  
  // 광고 세트 선택 핸들러
  const handleAdSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const adSetId = e.target.value;
    if (adSetId) {
      router.push(`/adset/insights?adsetId=${adSetId}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">광고 계정 정보</h2>
          
          <div className="flex space-x-3">
            {/* 네비게이션 셀렉트 박스 */}
            <div className="flex items-center space-x-3">
              <select
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={handleCampaignChange}
                defaultValue=""
                disabled={loadingNavigation}
              >
                <option value="" disabled>캠페인 선택</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id} data-action="load">
                    {campaign.name}
                  </option>
                ))}
                <option disabled>──────────</option>
                <option value="" data-action="view">모든 캠페인 보기</option>
              </select>
              
              {adSets.length > 0 && (
                <select
                  className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={handleAdSetChange}
                  defaultValue=""
                  disabled={loadingNavigation}
                >
                  <option value="" disabled>광고 세트 선택</option>
                  {adSets.map(adSet => (
                    <option key={adSet.id} value={adSet.id}>
                      {adSet.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <Link href="/campaigns" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              캠페인 목록
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : accountData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">광고 계정 이름</p>
              <p className="text-lg font-medium">{accountData.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">계정 상태</p>
              <p className="text-lg font-medium">
                {accountData.account_status === 1 ? '활성' : '비활성'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">비즈니스 이름</p>
              <p className="text-lg font-medium">{accountData.business_name || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">총 지출</p>
              <p className="text-lg font-medium">
                {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: accountData.currency }).format(accountData.amount_spent / 100)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">계정 잔액</p>
              <p className="text-lg font-medium">
                {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: accountData.currency }).format(accountData.balance / 100)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">계정 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">광고 성과 리포트</h2>
          
          <div className="flex space-x-4">
            <div>
              <label htmlFor="startDate" className="block text-sm text-gray-500">시작일</label>
              <input
                type="date"
                id="startDate"
                value={dateRange.since}
                onChange={(e) => handleDateChange(e, 'since')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm text-gray-500">종료일</label>
              <input
                type="date"
                id="endDate"
                value={dateRange.until}
                onChange={(e) => handleDateChange(e, 'until')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadAccountData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                적용
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : insightsData && insightsData.data && insightsData.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">지출</p>
              <p className="text-2xl font-semibold">
                {new Intl.NumberFormat('ko-KR', { 
                  style: 'currency', 
                  currency: accountData?.currency || 'KRW' 
                }).format(parseFloat(insightsData.data[0].spend))}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">노출 수</p>
              <p className="text-2xl font-semibold">
                {new Intl.NumberFormat('ko-KR').format(insightsData.data[0].impressions)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">클릭 수</p>
              <p className="text-2xl font-semibold">
                {new Intl.NumberFormat('ko-KR').format(insightsData.data[0].clicks)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">CPC (클릭당 비용)</p>
              <p className="text-2xl font-semibold">
                {new Intl.NumberFormat('ko-KR', { 
                  style: 'currency', 
                  currency: accountData?.currency || 'KRW',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(parseFloat(insightsData.data[0].cpc))}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">CTR (클릭률)</p>
              <p className="text-2xl font-semibold">
                {(parseFloat(insightsData.data[0].ctr) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">도달</p>
              <p className="text-2xl font-semibold">
                {new Intl.NumberFormat('ko-KR').format(insightsData.data[0].reach)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 py-8 text-center">데이터가 없습니다. 날짜 범위를 조정하고 다시 시도해보세요.</p>
        )}
      </div>
    </div>
  );
}
