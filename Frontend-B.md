# FRONTEND_B.md — Eraser & Revocation Concierge UI/UX

## 1) 사용자 여정(핵심)
1) “회수/삭제 시작” 클릭
2) 어떤 서비스/기관인지 선택(또는 A의 영수증에서 바로 연결)
3) 요청 유형 선택(삭제/동의철회/제3자 제공 중단/처리 제한)
4) 최소 정보 입력(계정 이메일 등) + 민감정보 입력 금지 안내
5) 라우팅 결과 확인(어디로 보내야 하는지)
6) 요청서 생성(텍스트/PDF) + 복사/다운로드
7) “보냈음” 체크 → 상태 트래킹 시작
8) 응답 기록/파일 첨부(선택) → 완료/거절/추가정보 요청
9) 증빙 패키지 내보내기(ZIP/CSV)

## 2) IA/메뉴
- Inbox(A)
- Eraser(B)
  - My Requests (목록)
  - New Request (마법사)
  - Templates (선택, 미리보기)
  - Exports (CSV, Evidence pack)

## 3) 주요 화면
### 3.1 B 대시보드(/eraser)
- KPI 카드:
  - 진행중 요청 수(WAITING)
  - 완료(DONE)
  - 추가서류 필요(NEED_MORE_INFO)
- 리스트:
  - 서비스/기관, 요청유형, 상태, 생성일, “요청서 보기”, “증빙 내보내기”

### 3.2 요청 생성 마법사(/eraser/new)
Step 1: 대상 선택
- 검색 입력 + 최근 사용(인박스의 서비스 기반)
- “공공/민간/플랫폼” 자동 태깅

Step 2: 요청 유형 선택
- DELETE / WITHDRAW_CONSENT / STOP_THIRD_PARTY / LIMIT_PROCESSING
- 각 선택마다 “무엇이 달라지는지” 1~2줄로 설명

Step 3: 최소 정보 입력
- 계정 이메일/아이디 정도만
- 경고 박스: “주민번호/계좌/OTP는 입력하지 마세요”
- (있다면) A 영수증에서 추출한 항목 자동 채움

Step 4: 라우팅 안내
- “여기로 보내세요” 카드
  - 이메일 주소/웹폼 링크/민원 경로
  - 단계별 안내(1~4 steps)
  - 프리셋 기반이면 “공식 경로(프리셋)” 배지, 아니면 “추정 경로” 배지

Step 5: 요청서 생성/다운로드
- 생성된 본문(복사 버튼)
- PDF 다운로드 버튼
- “보냈음” 체크(토글) → 상태 SENT로 전환

### 3.3 요청 상세(/eraser/[id])
- 상단: 상태 배지 + 다음 행동 CTA(“응답 기록하기”, “추가정보 업로드”)
- 탭:
  - Letter (텍스트/다운로드)
  - Routing (어디로 보냈는지)
  - Timeline (이벤트 로그)
  - Evidence Pack (내보내기)

### 3.4 내보내기(/eraser/exports)
- CSV 다운로드(기간 선택)
- Evidence pack 다운로드(요청 선택)

## 4) UI 컴포넌트
- StatusChip: DRAFT/SENT/WAITING/DONE/REJECTED/NEED_MORE_INFO
- RoutingCard: channel + destination + instructions + confidence
- LetterEditor(선택): 템플릿 기반 본문 미세 수정(필수 문구는 잠금)
- TimelineList: 이벤트/시간/메모
- ExportButtons: CSV / PDF / ZIP

## 5) 가드레일(프론트에서 반드시 보이게)
- 입력 폼에 주민번호/계좌/OTP 패턴 감지 시 즉시 경고 + 입력 막기(정규식)
- “이 서비스가 진짜인지 확실치 않음” 위험 플래그가 있으면:
  - 제출 전 확인 체크박스 강제
  - 라우팅 화면에서 “공식 경로 확인” 안내

## 6) 백엔드 연동(예시)
- POST /revocations (wizard 완료 시)
- POST /revocations/{id}/route
- POST /revocations/{id}/letter
- GET /revocations/{id}/letter.pdf
- PATCH /revocations/{id}/status
- POST /revocations/{id}/evidence-pack
- GET /exports/revocations.csv

## 7) 더미 데이터 모드(해커톤)
- FE에서 mock API 스위치 제공
- 상태 변화 데모를 위해 버튼 클릭 시 status를 순환시키는 샘플 제공
