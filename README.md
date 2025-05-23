# 메타 광고 리포트 대시보드

메타(페이스북) 광고 API를 활용하여 광고 성과 데이터를 확인할 수 있는 대시보드 애플리케이션입니다.

## 주요 기능

- 메타 광고 API 연결 및 인증
- 광고 계정 정보 조회
- 기간별 광고 성과 리포트 분석
- 캠페인 목록 조회
- 인증 정보 서버 저장 기능

## 기술 스택

- Next.js 15
- TypeScript
- Tailwind CSS
- React Query
- Meta Marketing API

## 설치 및 실행 방법

1. 저장소 클론
   ```
   git clone [저장소 URL]
   cd report_meta
   ```

2. 의존성 설치
   ```
   npm install
   ```

3. 개발 서버 실행
   ```
   npm run dev
   ```

4. 빌드
   ```
   npm run build
   ```

5. 프로덕션 서버 실행
   ```
   npm start
   ```

## 메타 API 설정 방법

### 1. 메타 개발자 계정 준비

1. [Meta for Developers](https://developers.facebook.com/) 페이지에서 개발자 계정에 로그인합니다.
2. 앱 대시보드에서 새 앱을 생성하거나 기존 앱을 선택합니다.
3. 앱의 기본 설정 페이지에서 앱 ID와 앱 시크릿을 확인할 수 있습니다.

### 2. 사용자 접근 토큰 생성

1. [Graph API 탐색기](https://developers.facebook.com/tools/explorer/)에 접속합니다.
2. 앱 드롭다운에서 생성한 앱을 선택합니다.
3. "사용자 또는 페이지" 토큰 유형을 선택합니다.
4. "권한 추가" 버튼을 클릭하고 다음 권한을 요청합니다:
   - `ads_read`: 광고 정보 읽기 권한
   - `ads_management`: 광고 관리 권한
5. "액세스 토큰 생성" 버튼을 클릭하여 토큰을 생성합니다.
6. 발급받은 토큰을 복사하여 대시보드의 "접근 토큰" 필드에 입력합니다.

### 3. 광고 계정 ID 확인

1. [Meta Business Suite](https://business.facebook.com/)에 로그인합니다.
2. "광고 관리자"를 클릭합니다.
3. 좌측 상단에서 광고 계정을 선택하면 "계정 정보" 섹션에서 계정 ID를 확인할 수 있습니다.
4. 계정 ID는 "act_XXXXXXXXXX" 형식으로 표시됩니다.
5. "act_" 접두사를 제외한 숫자만 복사하여 대시보드의 "광고 계정 ID" 필드에 입력합니다.

### 4. 데이터 확인

1. 접근 토큰과 광고 계정 ID를 입력하고 "연결 및 저장하기" 버튼을 클릭합니다.
2. 연결이 성공하면 광고 계정 정보와 성과 데이터가 대시보드에 표시됩니다.

## 보안 정보

- 입력한 접근 토큰과 광고 계정 ID는 서버의 `credentials.json` 파일에 저장됩니다.
- 접근 토큰의 만료 기간은 기본적으로 단기간(일반적으로 1~2시간)입니다. 장기 토큰을 얻으려면 사용자 토큰을 페이지 접근 토큰으로 교환해야 합니다.
- 보안을 위해 프로덕션 환경에서는 환경 변수나 보안 서비스를 통해 자격 증명을 관리하는 것이 좋습니다.

## Render.com 배포 방법

이 프로젝트는 Render.com을 통해 배포할 수 있습니다:

1. Render.com 계정에 로그인합니다.
2. Dashboard에서 "New +" 버튼을 클릭하고 "Web Service"를 선택합니다.
3. GitHub 저장소 연결: https://github.com/alisyos/report_meta
4. 다음 설정으로 웹 서비스를 구성합니다:
   - Name: report-meta (또는 원하는 이름)
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Instance Type: Free 또는 필요에 맞는 유료 플랜
5. "Environment Variables" 섹션에서 다음 환경 변수를 추가합니다:
   ```
   NODE_ENV=production
   meta.app.id=YOUR_META_APP_ID
   meta.app.secret=YOUR_META_APP_SECRET
   meta.access.token=YOUR_META_ACCESS_TOKEN
   meta.ad.account.id=YOUR_META_AD_ACCOUNT_ID
   ```
6. "Create Web Service" 버튼을 클릭하여 배포를 시작합니다.

배포가 완료되면 제공된 URL에서 웹사이트에 접근할 수 있습니다.
