'use client';

import { useState, useEffect, Suspense } from 'react';
import { useMetaApi } from '../context/MetaApiContext';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// SearchParams를 사용하는 컴포넌트를 분리
function AdSetsContent() {
  const router = useRouter();
  const { apiService, isConnected } = useMetaApi();
  const [adSets, setAdSets] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState(false);
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');

  useEffect(() => {
    if (apiService) {
      loadCampaigns();
      
      if (campaignId) {
        loadAdSets();
        loadCampaignDetails();
      }
    }
  }, [apiService, campaignId]);

  const loadCampaigns = async () => {
    if (!apiService) return;
    
    setLoadingNavigation(true);
    try {
      const response = await apiService.getCampaigns();
      if (response && response.data) {
        setCampaigns(response.data);
      }
    } catch (error) {
      console.error('캠페인 로딩 오류:', error);
    } finally {
      setLoadingNavigation(false);
    }
  };

  const loadAdSets = async () => {
    if (!apiService || !campaignId) return;
    
    setIsLoading(true);
    try {
      // 특정 캠페인 ID에 따른 광고 세트 필터링 기능 추가
      const response = await apiService.getAdSets(campaignId);
      if (response && response.data) {
        setAdSets(response.data);
      }
    } catch (error) {
      console.error('광고 세트 로딩 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 캠페인 세부 정보 로드
  const loadCampaignDetails = async () => {
    if (!apiService || !campaignId) return;
    
    try {
      const response = await apiService.getCampaignDetails(campaignId);
      if (response) {
        setCampaign(response);
      }
    } catch (error) {
      console.error('캠페인 세부 정보 로딩 오류:', error);
    }
  };

  // 캠페인 선택 핸들러
  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCampaignId = e.target.value;
    if (newCampaignId) {
      router.push(`/adsets?campaignId=${newCampaignId}`);
    }
  };

  // 광고 세트 선택 핸들러
  const handleAdSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const adSetId = e.target.value;
    if (adSetId) {
      router.push(`/adset/insights?adsetId=${adSetId}`);
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

  if (!campaignId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">캠페인 ID 필요</h2>
          <p className="text-gray-600 mb-6">
            광고 세트를 보려면 캠페인 ID가 필요합니다.
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
            <h1 className="text-2xl font-bold text-gray-900">광고 세트</h1>
            {campaign && (
              <p className="text-sm text-gray-500 mt-1">
                캠페인: {campaign.name}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            {/* 네비게이션 셀렉트 박스 */}
            <div className="flex items-center space-x-3">
              <select
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={handleCampaignChange}
                value={campaignId || ''}
                disabled={loadingNavigation}
              >
                <option value="" disabled>캠페인 선택</option>
                {campaigns.map(camp => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
                  </option>
                ))}
              </select>
              
              {adSets.length > 0 && (
                <select
                  className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={handleAdSetChange}
                  disabled={loadingNavigation}
                  defaultValue=""
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
            
            <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block">
              대시보드로
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">광고 세트 목록</h2>
            <button 
              onClick={loadAdSets}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              새로고침
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : adSets.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일일 예산</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">남은 예산</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adSets.map((adSet) => (
                      <tr key={adSet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adSet.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            adSet.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            adSet.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {adSet.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {adSet.daily_budget 
                            ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(adSet.daily_budget / 100)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {adSet.budget_remaining 
                            ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(adSet.budget_remaining / 100)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link
                            href={`/adset/insights?adsetId=${adSet.id}`}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            성과 확인
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">캠페인 성과 요약</h3>
                {/* 이곳에 캠페인 성과 차트를 추가할 수 있음 */}
                <p className="text-sm text-gray-500">
                  총 광고 세트 수: {adSets.length}개
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">광고 세트가 없거나 로드할 수 없습니다.</p>
              <button 
                onClick={loadAdSets}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// 로딩 중 UI
function AdSetsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function AdSetsPage() {
  return (
    <Suspense fallback={<AdSetsLoading />}>
      <AdSetsContent />
    </Suspense>
  );
} 