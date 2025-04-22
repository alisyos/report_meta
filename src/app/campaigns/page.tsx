'use client';

import { useState, useEffect } from 'react';
import { useMetaApi } from '../context/MetaApiContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CampaignsPage() {
  const router = useRouter();
  const { apiService, isConnected } = useMetaApi();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState(false);

  useEffect(() => {
    if (apiService) {
      loadCampaigns();
    }
  }, [apiService]);

  const loadCampaigns = async () => {
    if (!apiService) return;
    
    setIsLoading(true);
    setLoadingNavigation(true);
    try {
      const response = await apiService.getCampaigns();
      if (response && response.data) {
        setCampaigns(response.data);
      }
    } catch (error) {
      console.error('캠페인 로딩 오류:', error);
    } finally {
      setIsLoading(false);
      setLoadingNavigation(false);
    }
  };

  // 캠페인 선택 핸들러
  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campaignId = e.target.value;
    if (campaignId) {
      router.push(`/adsets?campaignId=${campaignId}`);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">캠페인</h1>
          <div className="flex space-x-3">
            {/* 네비게이션 셀렉트 박스 */}
            {campaigns.length > 0 && (
              <div className="flex items-center space-x-3">
                <select
                  className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={handleCampaignChange}
                  defaultValue=""
                  disabled={loadingNavigation}
                >
                  <option value="" disabled>캠페인 선택</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block">
              대시보드로
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">캠페인 목록</h2>
            <button 
              onClick={loadCampaigns}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              새로고침
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">목표</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시작일</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종료일</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.objective}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.start_time ? new Date(campaign.start_time).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.stop_time ? new Date(campaign.stop_time).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          href={`/adsets?campaignId=${campaign.id}`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          광고 세트 보기
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-8 text-center">캠페인이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}