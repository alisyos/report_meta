'use client';

import { useState, useEffect, Suspense } from 'react';
import { useMetaApi } from '../../context/MetaApiContext';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

// 로딩 중 UI
function AdSetInsightsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// SearchParams를 사용하는 컴포넌트를 분리
function AdSetInsightsContent() {
  const router = useRouter();
  const { apiService, isConnected } = useMetaApi();
  const [insightsData, setInsightsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [adSets, setAdSets] = useState<any[]>([]);
  const [loadingNavigation, setLoadingNavigation] = useState(false);
  const [dateRange, setDateRange] = useState({
    since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 전
    until: new Date().toISOString().split('T')[0], // 오늘
  });
  
  const searchParams = useSearchParams();
  const adSetId = searchParams.get('adsetId');
  const [adSetDetails, setAdSetDetails] = useState<any>(null);

  useEffect(() => {
    if (apiService && adSetId) {
      loadAdSetInsights();
      loadNavigationData();
    }
  }, [apiService, adSetId]);

  // 네비게이션 드롭다운을 위한 데이터 로드
  const loadNavigationData = async () => {
    if (!apiService) return;
    
    setLoadingNavigation(true);
    try {
      // 캠페인 목록 로드
      const campaignsResponse = await apiService.getCampaigns();
      if (campaignsResponse && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }
      
      // 광고 세트 상세 정보가 있으면, 해당 캠페인의 광고 세트 정보 로드
      if (adSetDetails && adSetDetails.campaign_id) {
        const adSetsResponse = await apiService.getAdSets(adSetDetails.campaign_id);
        if (adSetsResponse && adSetsResponse.data) {
          setAdSets(adSetsResponse.data);
        }
      }
    } catch (error) {
      console.error('네비게이션 데이터 로드 오류:', error);
    } finally {
      setLoadingNavigation(false);
    }
  };

  const loadAdSetInsights = async () => {
    if (!apiService || !adSetId) return;
    
    setIsLoading(true);
    try {
      // 광고 세트 세부 정보 가져오기 (광고 세트 세부 정보 API가 구현되어 있다면)
      try {
        const adSetResponse = await axios.get(
          `https://graph.facebook.com/v20.0/${adSetId}`,
          {
            params: {
              fields: 'id,name,status,daily_budget,lifetime_budget,campaign_id',
              access_token: apiService['accessToken'], // private 필드 접근을 위한 트릭 (실제로는 안전한 방법이 아님)
            },
          }
        );
        setAdSetDetails(adSetResponse.data);
        
        // 광고 세트 정보를 가져온 후, 해당 캠페인의 광고 세트 목록도 가져옴
        if (adSetResponse.data.campaign_id) {
          const adSetsResponse = await apiService.getAdSets(adSetResponse.data.campaign_id);
          if (adSetsResponse && adSetsResponse.data) {
            setAdSets(adSetsResponse.data);
          }
        }
      } catch (error) {
        console.error('광고 세트 정보 로드 실패:', error);
      }
      
      // 광고 세트 인사이트 데이터 가져오기
      const insights = await apiService.getAdSetInsights(adSetId, {
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
      console.error('광고 세트 인사이트 로딩 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      router.push(`/adsets?campaignId=${campaignId}`);
    }
  };
  
  // 광고 세트 선택 핸들러
  const handleAdSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAdSetId = e.target.value;
    if (newAdSetId) {
      router.push(`/adset/insights?adsetId=${newAdSetId}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">연결 필요</h2>
          <p className="text-gray-600 mb-6">
            메타 광고 API에 연결되어 있지 않습니다. 메인 페이지에서 연결을 진행해주세요.
          </p>
          <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!adSetId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">광고 세트 ID 필요</h2>
          <p className="text-gray-600 mb-6">
            광고 세트 인사이트를 보려면 광고 세트 ID가 필요합니다.
          </p>
          <Link href="/campaigns" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block">
            캠페인 목록으로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">광고 세트 인사이트</h1>
            {adSetDetails && (
              <p className="text-sm text-gray-500 mt-1">
                광고 세트: {adSetDetails.name}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            {/* 네비게이션 셀렉트 박스 */}
            <div className="flex items-center space-x-3">
              <select
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={handleCampaignChange}
                value={adSetDetails?.campaign_id || ''}
                disabled={loadingNavigation}
              >
                <option value="" disabled>캠페인 선택</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              
              <select
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={handleAdSetChange}
                value={adSetId || ''}
                disabled={loadingNavigation}
              >
                <option value="" disabled>광고 세트 선택</option>
                {adSets.map(adSet => (
                  <option key={adSet.id} value={adSet.id}>
                    {adSet.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
            >
              대시보드로
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">광고 세트 정보</h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : adSetDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">ID</p>
                <p className="text-lg font-medium">{adSetDetails.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">이름</p>
                <p className="text-lg font-medium">{adSetDetails.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">상태</p>
                <p className="text-lg font-medium">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    adSetDetails.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    adSetDetails.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {adSetDetails.status}
                  </span>
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">일일 예산</p>
                <p className="text-lg font-medium">
                  {adSetDetails.daily_budget 
                    ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(adSetDetails.daily_budget / 100)
                    : '-'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">총 예산</p>
                <p className="text-lg font-medium">
                  {adSetDetails.lifetime_budget 
                    ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(adSetDetails.lifetime_budget / 100)
                    : '-'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">광고 세트 정보를 불러올 수 없습니다.</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">광고 세트 성과 리포트</h2>
            
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
                  onClick={loadAdSetInsights}
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
                    currency: 'KRW'
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
                    currency: 'KRW',
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
              
              {/* 전환 정보가 있다면 표시 */}
              {insightsData.data[0].actions && insightsData.data[0].actions.length > 0 && (
                <div className="col-span-3 bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500 mb-2">전환 통계</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">액션 유형</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">횟수</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">전환당 비용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {insightsData.data[0].actions.map((action: any, idx: number) => {
                          const costPerAction = insightsData.data[0].cost_per_action_type?.find(
                            (item: any) => item.action_type === action.action_type
                          );
                          
                          return (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-3 py-2 text-sm text-gray-900">{action.action_type}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{action.value}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {costPerAction ? new Intl.NumberFormat('ko-KR', { 
                                  style: 'currency', 
                                  currency: 'KRW'
                                }).format(parseFloat(costPerAction.value)) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 py-8 text-center">데이터가 없습니다. 날짜 범위를 조정하고 다시 시도해보세요.</p>
          )}
        </div>
      </main>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function AdSetInsightsPage() {
  return (
    <Suspense fallback={<AdSetInsightsLoading />}>
      <AdSetInsightsContent />
    </Suspense>
  );
} 