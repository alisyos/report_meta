import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 자격 증명을 저장할 파일 경로
const CREDENTIALS_FILE = path.join(process.cwd(), 'credentials.json');

// 자격 증명 유형 정의
interface Credentials {
  accessToken: string;
  adAccountId: string;
}

// 자격 증명 저장 함수
function saveCredentials(credentials: Credentials) {
  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
    return true;
  } catch (error) {
    console.error('자격 증명 저장 오류:', error);
    return false;
  }
}

// 자격 증명 로드 함수
function loadCredentials(): Credentials | null {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      return JSON.parse(data) as Credentials;
    }
    return null;
  } catch (error) {
    console.error('자격 증명 로드 오류:', error);
    return null;
  }
}

// POST 요청 처리 - 자격 증명 저장
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.accessToken || !body.adAccountId) {
      return NextResponse.json(
        { success: false, message: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    const credentials: Credentials = {
      accessToken: body.accessToken,
      adAccountId: body.adAccountId
    };
    
    const success = saveCredentials(credentials);
    
    if (success) {
      return NextResponse.json({ success: true, message: '자격 증명이 저장되었습니다.' });
    } else {
      return NextResponse.json(
        { success: false, message: '자격 증명 저장 중 오류가 발생했습니다.' },
        { status: 500 }
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

// GET 요청 처리 - 저장된 자격 증명 조회
export async function GET() {
  try {
    const credentials = loadCredentials();
    
    if (credentials) {
      return NextResponse.json({ success: true, data: credentials });
    } else {
      return NextResponse.json(
        { success: false, message: '저장된 자격 증명이 없습니다.' },
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

// DELETE 요청 처리 - 저장된 자격 증명 삭제
export async function DELETE() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      fs.unlinkSync(CREDENTIALS_FILE);
      return NextResponse.json({ success: true, message: '자격 증명이 삭제되었습니다.' });
    } else {
      return NextResponse.json(
        { success: false, message: '삭제할 자격 증명이 없습니다.' },
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