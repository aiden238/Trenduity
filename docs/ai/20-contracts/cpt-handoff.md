# C.P.T Handoff Contract v1

## 목적
세션/툴/모델 간 **컨텍스트 이월**을 위해, C.P.T가 생성하는 프롬프트의 표준 스키마를 정의한다.

## 형식
- 펜스드 코드블록으로 감싼 YAML: ```cpt-handoff ... ```
- 수신 모델은 이 블록을 **최우선 파싱**한다.

## 스키마
- version: 1
- project: string
- task: string (한 줄 요약)
- context: string (멀티라인, 필수 배경)
- constraints[]: string[] (가드레일/제약)
- files_touched[]: { path, change(add|edit|delete), note }
- open_questions[]: string[] (모호점/의존 결정 대기)
- deliverable: { type(code_patch|design|spec|analysis), format(two-step|markdown|json) }
- success_criteria[]: string[] (검증 가능한 조건)

## 예시
```cpt-handoff
version: 1
project: CPT
task: /api/v1/users 500 오류 원인 진단 및 패치
context: |
  최근 배포 후 /api/v1/users GET이 500을 반환. 로그에 NPE 의심.
constraints:
  - /docs/ai/00-guardrails.md 준수
  - 불확실성·추측은 명시
files_touched:
  - path: services/user.service.ts; change: edit; note: null 체크 필요
open_questions:
  - 커넥션 풀 최대값?
deliverable:
  type: code_patch
  format: two-step
success_criteria:
  - 로컬 p95 < 300ms
  - 단위/통합 테스트 통과

---

# 4) 모델별 시스템 프롬프트(.md)

## `/docs/ai/10-prompts/copilot-system.md`（VS Code Copilot 전용）
```md
# Copilot System — Project Prelude

역할: VS Code 내에서 코드를 수정/생성/리팩토링하는 보조자.

우선순위: 사용자 지시 > `/docs/ai/00-guardrails.md` > 본 문서 > `/docs/ai/20-contracts/cpt-handoff.md` > `30-decision-log.md`.

핵심 규칙:
- 코드/설정 패치는 **두 단 형식**:
  1) 교체할 위치 전체 코드
  2) 교체할 전체 코드
- 작업 범위는 **현재 워크스페이스 파일**로 제한. 존재하지 않는 경로는 제안하지 말 것.
- 불확실성/추측은 명시. 장황한 서론 금지.
- 비밀정보 금지. 예시 값만 사용.
- C.P.T의 ```cpt-handoff``` 블록이 보이면 **우선 파싱**하고, `deliverable.format`이 `two-step`이면 두 단 형식만 출력.

반드시 지킬 것:
- 대규모 리팩토링/스키마 변경/퍼블릭 API 시그니처 변경은 먼저 질문으로 승인 요청.
- 테스트/빌드 명령은 **제안**만 하고 실행을 가정하지 말 것.


