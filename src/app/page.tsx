'use client';

import { useState, useEffect } from 'react';
import { useMetaApi } from './context/MetaApiContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">메타 광고 리포트</h1>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ReportDashboard />
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
    if (!apiService) {
      console.log('API 서비스가 없습니다. apiService:', apiService);
      return;
    }
    
    console.log('계정 데이터 로드 시작, 토큰:', apiService['accessToken'], '계정ID:', apiService['adAccountId']);
    console.log('API 서비스 메소드 확인:', Object.getOwnPropertyNames(Object.getPrototypeOf(apiService)));
    
    setIsLoading(true);
    try {
      console.log('getAdAccount 호출 전');
      const account = await apiService.getAdAccount();
      console.log('계정 데이터 로드 성공:', account);
      setAccountData(account);
      
      console.log('getInsights 호출 전, dateRange:', dateRange);
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
      console.log('인사이트 데이터 로드 성공:', insights);
      setInsightsData(insights);
    } catch (error: any) {
      console.error('데이터 로딩 오류:', error);
      if (error.response) {
        console.error('오류 응답:', error.response.data);
        console.error('오류 상태:', error.response.status);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 네비게이션을 위한 캠페인 및 광고세트 데이터 로드
  const loadNavigationData = async () => {
    if (!apiService) {
      console.log('네비게이션 데이터 로드: API 서비스가 없습니다.');
      return;
    }
    
    console.log('네비게이션 데이터 로드 시작');
    setLoadingNavigation(true);
    try {
      // 캠페인 목록 로드
      console.log('getCampaigns 호출 전');
      const campaignsResponse = await apiService.getCampaigns();
      console.log('캠페인 응답:', campaignsResponse);
      if (campaignsResponse && campaignsResponse.data) {
        console.log('캠페인 데이터 설정:', campaignsResponse.data);
        setCampaigns(campaignsResponse.data);
      } else {
        console.log('캠페인 데이터 없음');
      }
    } catch (error: any) {
      console.error('네비게이션 데이터 로드 오류:', error);
      if (error.response) {
        console.error('오류 응답:', error.response.data);
        console.error('오류 상태:', error.response.status);
      }
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
    console.log('apiService 변경됨:', apiService);
    if (apiService) {
      console.log('API 서비스 사용 가능, 데이터 로드 시작');
      setTimeout(() => {
        loadAccountData();
        loadNavigationData();
      }, 1000); // 지연 후 로드 시도
    } else {
      console.log('API 서비스 사용 불가능');
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
