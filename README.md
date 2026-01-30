# ASCII Frontend

ASCII 해커톤 프론트엔드 레포지토리입니다. Frontend-A와 Frontend-B 모듈을 포함하는 통합 프로젝트입니다.

## 프로젝트 구조

```
ASCII-Frontend/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   ├── page.tsx        # 홈 페이지
│   │   ├── inbox/          # Frontend-A: Inbox 모듈
│   │   └── eraser/         # Frontend-B: Eraser 모듈
│   ├── modules/
│   │   ├── a/              # Frontend-A 모듈 컴포넌트
│   │   └── b/              # Frontend-B 모듈 컴포넌트
│   ├── components/         # 공통 컴포넌트
│   └── lib/                # 유틸리티 및 API 클라이언트
│       └── api/
│           └── client.ts   # Backend API 클라이언트
├── public/                 # 정적 파일
├── package.json            # 의존성 및 스크립트
├── Dockerfile              # Docker 이미지 정의
├── docker-compose.yml      # Docker Compose 설정
├── next.config.js          # Next.js 설정
├── tsconfig.json           # TypeScript 설정
├── tailwind.config.js      # Tailwind CSS 설정
├── env.example             # 환경 변수 예시
└── README.md               # 이 파일
```

## 모듈 개요

### Frontend-A: Consent & Request Receipt Inbox
- 동의서 텍스트/PDF 업로드
- 문자/카톡/이메일 내용 입력
- 요청 영수증 검증 (QR/서명 토큰/6자리 코드)
- 요약 카드 표시 (목적/수집항목/보관기간/제3자 제공/철회 방법)
- 위험 신호 표시
- 영수증 해시 확인

**경로**: `/inbox`

### Frontend-B: Eraser & Revocation Concierge
- 요청 생성 마법사
- 기관별 처리 경로 라우팅 안내
- 진행상태 트래킹
- 요청서 생성 및 다운로드 (텍스트/PDF)
- 증빙 패키지 내보내기 (ZIP/CSV)

**경로**: `/eraser`

## 설치 및 실행

### 1. 의존성 설치

```bash
# npm 사용
npm install

# 또는 yarn 사용
yarn install

# 또는 pnpm 사용
pnpm install
```

### 2. 환경 변수 설정

```bash
# env.example을 복사하여 .env.local 파일 생성
cp env.example .env.local

# .env.local 파일을 편집하여 필요한 설정 입력
```

### 3. 개발 서버 실행

```bash
# 개발 모드 실행
npm run dev

# 또는
yarn dev

# 또는
pnpm dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## Docker를 사용한 실행

### Docker Compose 사용 (권장)

```bash
# 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f frontend

# 서비스 중지
docker-compose down
```

### Docker 단독 실행

```bash
# 이미지 빌드
docker build -t ascii-frontend .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_A_URL=http://localhost:8000 \
  -e NEXT_PUBLIC_BACKEND_B_URL=http://localhost:8001 \
  ascii-frontend
```

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 주요 기능

### Inbox (Frontend-A)
- 문서 업로드 (텍스트/PDF)
- 이메일 연동 (OAuth)
- 영수증 코드 검증
- 요약 카드 표시
- 위험 신호 감지 및 경고
- 잠금 상태 관리 (가드레일)

### Eraser (Frontend-B)
- 요청 생성 마법사 (단계별)
- 서비스/기관 선택 및 검색
- 요청 유형 선택 (DELETE/WITHDRAW_CONSENT/STOP_THIRD_PARTY)
- 최소 정보 입력 (민감정보 입력 금지)
- 라우팅 안내 (이메일/웹폼/민원 경로)
- 요청서 생성 및 다운로드
- 상태 트래킹 (CREATED → SENT → WAITING → DONE)
- 증빙 패키지 내보내기

## 개발 가이드

### 코드 포맷팅

```bash
# ESLint 실행
npm run lint

# 자동 수정
npm run lint -- --fix
```

### 컴포넌트 구조

- `src/modules/a/`: Frontend-A 모듈 컴포넌트
- `src/modules/b/`: Frontend-B 모듈 컴포넌트
- `src/components/`: 공통 컴포넌트
- `src/lib/`: 유틸리티 함수 및 API 클라이언트

### API 연동

Backend API 클라이언트는 `src/lib/api/client.ts`에서 관리됩니다.

```typescript
import { backendA, backendB, backend } from '@/lib/api/client'

// 통합 백엔드 API 호출
const response = await backend.get('/health')

// Backend-A API 호출 (/api/a/*)
const response = await backendA.get('/documents')

// Backend-B API 호출 (/api/b/*)
const response = await backendB.get('/revocations')
```

## 환경 변수

- `NEXT_PUBLIC_BACKEND_URL`: 통합 Backend API URL (기본값: http://localhost:8000)
- `NODE_ENV`: 환경 설정 (development/production)

## 보안 고려사항

- 민감정보(주민번호/계좌/OTP) 입력 시 즉시 경고 및 입력 막기
- 위험 플래그가 high면 제출 전 확인 체크박스 강제
- 라우팅 화면에서 "공식 경로 확인" 안내
- 모든 사용자 입력은 서버 검증 필수

## 문제 해결

### 포트 충돌
- 기본 포트 3000이 사용 중이면 `package.json`의 dev 스크립트에서 포트 변경
- 또는 환경 변수로 `PORT=3001 npm run dev`

### Backend 연결 오류
- `.env.local` 파일의 `NEXT_PUBLIC_BACKEND_URL` 확인
- Backend 서버가 실행 중인지 확인 (포트 8000)
- CORS 설정 확인

### 빌드 오류
- `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`
- TypeScript 타입 오류 확인: `npm run lint`

## 라이선스

이 프로젝트는 해커톤용으로 개발되었습니다.

