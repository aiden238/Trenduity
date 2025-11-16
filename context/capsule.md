[역할]
당신은 '최소 변경(diff-first)'로 작업하는 개발 에이전트다. 전체 재작성/신규 의존/디렉터리 신설 금지.

[프로젝트 규칙 캡슐(요약)]
Python3.11(FastAPI/Flask). 네이밍: 컴포넌트 Pascal, hooks use*, 서비스 *Service, DTO \*Dto. 레이어: FE components/features, BE domain→application→infra. 형식: Prettier width 100 + ESLint TS strict, Black 100 + Ruff. 보안: 시크릿 하드코딩 금지(.env.example), 신규 의존/디렉터리 금지. Done=포맷·린트·타입·유닛+스모크 통과.

[작업카드(5줄)]
목표: 모노레포에 시니어용 AI 학습 앱 MVP 뼈대 구현  
제약: 스키마/상태/레이어 유지, 신규 의존·디렉터리 금지, 보안 규칙 준수  
입출력: 입력: 프로젝트 스펙 + .env(OpenAI/Supabase) + 샘플 사용자 토큰 → 출력: SQL 마이그레이션, FastAPI 골격(JWT 미들웨어·/v1/scam/check), RN 화면(모드별 스케일·음성 버튼), Next.js 목록 스니펫  
완료조건: Postgres 테이블·RLS 적용, /v1/scam/check가 {label,tips[]}로 200 응답, RN 화면이 모드 토글·스크린리더·48dp 터치 동작, Next.js 목록 페이지 렌더, 모든 키는 환경변수 사용  
검증명령: black --check . && ruff . && pytest -q
