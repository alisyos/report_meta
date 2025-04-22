import { NextResponse } from 'next/server';
import { metaConfig } from '../../../config/env';

// GET 요청 처리 - 환경 변수에서 자격 증명 조회
export async function GET() {
  try {
    const { accessToken, adAccountId } = metaConfig;
    
    if (accessToken && adAccountId) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          accessToken, 
          adAccountId 
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: '환경 변수에 설정된 자격 증명이 없습니다.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('API 요청 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 