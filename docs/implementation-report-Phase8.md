# Phase 8 구현 보고서

## 범위

Phase 8에서는 접근 제어, 데이터 노출 방지, Markdown 렌더링 방어, 삭제 영향 범위 정리, 오류 메시지 표준화를 구현했다. 신규 화면을 추가하는 단계가 아니라 기존 화면과 서버 액션의 보안 동작을 보강하는 단계이므로 기존 UI 디자인은 변경하지 않았다.

## 구현 내용

### 공통 오류 처리

- `src/server/errors.ts` 추가
- 공통 오류 매핑 구현
  - 인증 필요
  - 권한 없음
  - 대상 없음
  - Prisma 검증/DB 오류
  - 알 수 없는 서버 오류
- Server Action에서 redirect 오류는 그대로 throw하도록 처리
- 기존 도메인별 `actionError` 중복 제거
- 세계관, 캐릭터, 소속, 관계, 창작물 액션이 공통 오류 유틸을 사용하도록 변경

### 접근 제어 보강

- 주요 상세/편집 데이터 조회에서 인증/권한 실패 시 `null`을 반환하도록 보강
- 페이지에서는 기존 `notFound` 흐름을 그대로 사용해 권한 없는 사용자가 데이터 존재 여부를 직접 구분하지 못하도록 처리
- 적용 범위
  - 세계관 상세/수정/공유 데이터
  - 캐릭터 상세/수정 데이터
  - 소속 상세/수정 데이터
  - 창작물 상세/수정/챕터 편집/리더 데이터

### 공개/비공개 조회 점검

- 공개 세계관 탐색은 `PUBLIC` 세계관만 조회
- 공개 캐릭터 탐색은 `PUBLIC` 캐릭터와 `PUBLIC` 세계관만 조회
- 공개 창작물 탐색은 `PUBLIC`, `PUBLISHED` 창작물과 `PUBLIC` 세계관만 조회
- 내 목록과 작업실은 소유 또는 공유받은 세계관 범위만 조회

### Markdown 렌더링 방어

- `src/lib/markdown.ts` 추가
- 공통 Markdown sanitize 적용
  - 제어 문자 제거
  - HTML 태그 제거
  - `javascript:`, `data:`, `vbscript:` 프로토콜 제거
  - 렌더링 길이 상한 적용
- `MarkdownViewer`에 sanitize 적용
- 창작물 리더 Markdown 파서에 sanitize 적용
- `dangerouslySetInnerHTML` 없이 React text rendering을 유지

### 삭제 영향 범위 정리

- `docs/security-checklist-Phase8.md` 추가
- 삭제 정책 문서화
  - 세계관 삭제: 소유자만 가능, 논리 삭제
  - 캐릭터 삭제: 세계관 편집 권한 필요, 논리 삭제
  - 소속 삭제: 세계관 편집 권한 필요, 캐릭터-소속 연결 제거 및 하위 소속 parent 해제
  - 관계 삭제: 세계관 편집 권한 필요, 논리 삭제
  - 창작물 삭제: 세계관 편집 권한 필요, 논리 삭제
  - 챕터 삭제: 세계관 편집 권한 필요, 논리 삭제

## 검증

요청에 따라 `npm run build`, `npm run lint`는 실행하지 않고 `localhost:3000`을 Chrome으로 직접 열어 검증했다.

- `/worlds/explore`
  - 공개 목록 렌더링 정상
  - 오류 오버레이 없음
- `/characters/explore`
  - 공개 목록 렌더링 정상
  - 오류 오버레이 없음
- `/works/explore`
  - 공개 목록 렌더링 정상
  - 오류 오버레이 없음
- `/works/9c56ca68-5ea8-4ebc-8ed7-3ca0c6ccd200/read#chapter-2`
  - 리더 Markdown 렌더링 정상
  - 오류 오버레이 없음
- `/characters/fa94f77b-71e4-4231-aa72-a07ba335d7b4`
  - 상세 Markdown 및 관계 그래프 렌더링 정상
  - 오류 오버레이 없음
- 존재하지 않는 상세 URL
  - 세계관, 캐릭터, 창작물 모두 404 처리
  - Next 오류 오버레이 없음

## 검증 결과

- Next.js 오류 오버레이: 없음
- 주요 공개 탐색 화면: 정상
- 주요 상세/리더 화면: 정상
- 존재하지 않는 리소스 접근: 404 정상 처리
- Markdown sanitize 적용: 완료
- 공통 오류 메시지 유틸 적용: 완료
- 권한/삭제 체크리스트 작성: 완료
