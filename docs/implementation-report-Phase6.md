# Phase 6 구현 보고서

## 범위

Phase 6에서는 세계관 기반 창작물 CRUD, 등장 캐릭터/소속 연결, 챕터 편집, 공개 탐색, 상세 화면, 리더 화면을 구현했다. 화면은 `docs/ui/07-works-explore.html`, `21-works-list.html`, `22-work-create.html`, `23-work-reader.html`, `24-work-edit.html`, `25-chapter-editor.html`, `28-work-detail.html`의 구조와 CTA 구성을 기준으로 맞췄다.

## 구현 내용

### 창작물 CRUD

- `/works` 내 창작물 목록 구현
- `/works/new` 창작물 생성 구현
- `/works/[workId]` 창작물 상세 구현
- `/works/[workId]/edit` 창작물 수정 구현
- 창작물 삭제는 목록 관리 모드에서 다중 선택 후 확인 모달로 처리
- 모든 생성, 수정, 삭제 액션에서 로그인 사용자와 세계관 편집 권한을 서버에서 재검증
- 편집 권한이 있는 작성자의 창작물은 Phase 6 계획에 따라 `isOfficial`을 자동 `true`로 저장

### 창작물 필드

- 제목
- 유형
- 소개 Markdown
- 표지 이미지 URL
- 공개 범위
- 게시 상태
- 공식 창작물 여부
- 태그
- 연결 세계관
- 조회수 표시

### 등장 캐릭터/소속 연결

- `WorkCharacter` 연결 구현
  - 캐릭터 선택
  - 역할 선택
  - 등장 메모
- `WorkAffiliation` 연결 구현
  - 소속 선택
  - 관련 메모
- 연결 대상이 창작물과 같은 세계관에 속하는지 서버에서 검증
- 현재 Prisma 모델에 `sort_order` 컬럼이 없어 연결 생성 순서와 챕터 번호를 정렬 기준으로 사용

### 챕터 편집

- `/works/[workId]/chapters` 챕터 편집 화면 구현
- 챕터 목록 표시
- 챕터 추가
- 챕터 제목 수정
- Markdown 본문 편집
- 챕터 공개 범위 수정
- 챕터 게시 상태 수정
- 챕터 삭제
- 창작물 게시 CTA 구현
  - 창작물과 전체 챕터를 `PUBLIC`, `PUBLISHED`로 전환

### 상세 및 리더

- 창작물 상세 화면 구현
  - 세계관
  - 작성자
  - 유형/공개/게시/공식 상태
  - 태그
  - 소개 Markdown
  - 등장 캐릭터
  - 관련 소속
  - 챕터 목록
  - 읽기/수정/챕터 편집 CTA
- `/works/[workId]/read` 리더 화면 구현
  - 첫 챕터 표시
  - 챕터 이전/다음 이동
  - 챕터 번호 페이지네이션
  - 드래그 가능한 진행 바
  - `#chapter-{number}` 해시 진입 지원

### 공개 탐색

- `/works/explore` 공개 창작물 탐색 구현
- 검색어/태그 검색
- 인기순/최신순 정렬
- 15개 단위 페이지네이션
- 공개 세계관의 공개·게시 창작물만 조회

### 공통 컴포넌트 적용

- `PageShell`
- `Panel`
- `Button`
- `ButtonLink`
- `Chip`
- `ConfirmModal`
- `MarkdownViewer`
- 신규 `WorkCard`
- 신규 `WorkListManager`
- 신규 `WorkForm`
- 신규 `ChapterEditor`
- 신규 `WorkReader`

## UI 검증

요청에 따라 `npm run build`, `npm run lint`는 실행하지 않고 `localhost:3000`을 Chrome으로 직접 열어 검증했다.

- `/works/explore`
  - 렌더링 정상
  - 오류 오버레이 없음
  - 검색 폼, 정렬 CTA, 빈 상태 확인
- 검증 계정 로그인
  - 편집 가능한 세계관이 없을 때 `/works/new`가 `/worlds/new`로 이동하는 흐름 확인
- 검증용 공개 세계관 생성
  - 세계관 생성 후 상세로 이동 확인
- `/works/new?worldId=...`
  - 창작물 생성 폼 렌더링 확인
  - 제목, 유형, 공개 범위, 게시 상태, 태그, 소개 Markdown 입력 확인
  - 창작물 생성 후 챕터 편집 화면으로 이동 확인
- `/works/[workId]/chapters`
  - 챕터 목록 표시 확인
  - 챕터 본문 수정
  - 챕터 저장
  - 창작물 게시 CTA 실행
- `/works/[workId]`
  - 상세 화면 렌더링 확인
  - 공식/공개/게시 상태 표시 확인
  - 소개 Markdown, 연결 빈 상태, 챕터 목록 확인
- `/works/[workId]/read`
  - 리더 화면 렌더링 확인
  - 이전/다음 버튼과 진행 바 표시 확인
- `/works`
  - 내 창작물 목록 렌더링 확인
  - 관리 칩, 삭제 CTA, 창작물 카드 확인
- `/works/explore?q=phase6`
  - 게시된 공개 창작물이 검색 결과에 표시되는 것 확인
- `/works/[workId]/edit`
  - 수정 폼 렌더링 확인
  - 기존 창작물 정보 반영 확인

## 검증 결과

- Next.js 오류 오버레이: 없음
- 브라우저 애플리케이션 오류: 없음
- 창작물 생성: 정상
- 창작물 목록 조회: 정상
- 창작물 수정 화면: 정상
- 창작물 상세 조회: 정상
- 공개 탐색 조회: 정상
- 챕터 저장: 정상
- 창작물 게시: 정상
- 리더 화면: 정상
