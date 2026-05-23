# next-intl 전체 적용 보고서

## 범위

- 검사: `src/app/**/*.tsx`, `src/components/**/*.tsx`
- 검사 파일: 59개
- 번역 적용 파일: 54개
- 메시지 키: 한국어 444개, 영어 444개
- locale: `ko`, `en`
- 저장 방식: `NEXT_LOCALE` cookie

## 설정 및 메시지

- `next.config.ts`: `next-intl/plugin` 연결
- `src/i18n/routing.ts`: 지원 locale과 cookie 설정
- `src/i18n/request.ts`: 요청 cookie에서 locale과 메시지 로드
- `src/i18n/navigation.ts`: locale navigation helper
- `src/app/api/locale/route.ts`: locale cookie 갱신
- `src/app/layout.tsx`: `NextIntlClientProvider`, locale별 metadata 적용
- `messages/ko.json`: 추출된 한국어 UI 메시지
- `messages/en.json`: 동일 키 구조의 자연스러운 영어 UI 메시지

## 파일별 변경

### App

- `src/app/layout.tsx`: provider, `lang`, locale별 metadata.
- `src/app/page.tsx`, `src/app/home/page.tsx`: 홈 문구 번역.
- `src/app/login/page.tsx`, `src/app/signup/page.tsx`: 인증 label, placeholder, 오류 문구 번역.
- `src/app/worlds/page.tsx`, `src/app/worlds/new/page.tsx`: 목록/생성 문구 번역.
- `src/app/worlds/[worldId]/page.tsx`: 상세, 통계, 빈 상태, CTA, aria 번역.
- `src/app/worlds/[worldId]/edit/page.tsx`: 수정 화면 문구 번역.
- `src/app/worlds/[worldId]/share/page.tsx`: 공유 화면 문구 번역.
- `src/app/worlds/explore/page.tsx`: 검색, 정렬, 결과 문구 번역.
- `src/app/characters/page.tsx`, `src/app/characters/new/page.tsx`: 목록/생성 문구 번역.
- `src/app/characters/[characterId]/page.tsx`: 상세, 소속, 창작물, 관계 빈 상태 번역.
- `src/app/characters/[characterId]/edit/page.tsx`: 수정 화면 문구 번역.
- `src/app/characters/explore/page.tsx`: 검색, 정렬, 결과 문구 번역.
- `src/app/affiliations/page.tsx`, `src/app/affiliations/new/page.tsx`: 목록/생성 문구 번역.
- `src/app/affiliations/[affiliationId]/page.tsx`: 상세, 계층, 멤버, 상태 문구 번역.
- `src/app/affiliations/[affiliationId]/edit/page.tsx`: 수정 화면 문구 번역.
- `src/app/relations/page.tsx`: 관계도 제목과 빈 상태 번역.
- `src/app/works/page.tsx`, `src/app/works/new/page.tsx`: 목록/생성 문구 번역.
- `src/app/works/[workId]/page.tsx`: 상세, 연결 리소스, 챕터 목록 번역.
- `src/app/works/[workId]/edit/page.tsx`: 수정 화면 문구 번역.
- `src/app/works/[workId]/chapters/page.tsx`: 챕터 관리 문구 번역.
- `src/app/works/[workId]/read/page.tsx`: 읽기 화면 문구 번역.
- `src/app/works/explore/page.tsx`: 검색, 정렬, 결과 문구 번역.
- `src/app/workspace/page.tsx`: 요약, 임시 저장, 리소스 섹션과 빈 상태 번역.

### Components

- `src/components/app-header.tsx`, `src/components/language-switcher.tsx`: navigation, locale 접근성 문구와 언어명 번역.
- `src/components/ui/confirm-modal.tsx`, `src/components/ui/pagination.tsx`: 공통 모달/페이지 이동 번역.
- `src/components/ui/entity-label.tsx`: World, Character, Work 등 공통 분류 label 번역.
- `src/components/worlds/world-form.tsx`, `src/components/characters/character-form.tsx`, `src/components/affiliations/affiliation-form.tsx`, `src/components/works/work-form.tsx`: label, placeholder, Markdown 도구 번역.
- `src/components/worlds/world-list-manager.tsx`, `src/components/characters/character-list-manager.tsx`, `src/components/affiliations/affiliation-list-manager.tsx`, `src/components/works/work-list-manager.tsx`: 선택/삭제/빈 상태 번역.
- `src/components/worlds/world-card.tsx`, `src/components/characters/character-card.tsx`, `src/components/works/work-card.tsx`: 조회수, 유형, 챕터 수 번역.
- `src/components/worlds/world-cover.tsx`: 이미지 대체 텍스트 번역.
- `src/components/worlds/world-detail-interactions.tsx`: 뒤로가기와 관계 그래프 UI 번역.
- `src/components/worlds/world-share-manager.tsx`: 역할, 초대, 해제, modal 문구 번역.
- `src/components/relations/relation-graph.tsx`: 그래프, 관계 CRUD form, option 표시명, aria 번역.
- `src/components/works/chapter-editor.tsx`, `src/components/works/work-reader.tsx`: 편집기, Markdown 도구, 읽기 navigation 번역.
- `src/components/drafts/draft-autosave.tsx`: 임시 저장 상태와 종류 번역.
- `src/components/workspace/logout-button.tsx`: 로그아웃 문구 번역.
- `src/components/routes/route-placeholder.tsx`: 공통 form/search UI 번역.

## 제외한 리터럴

- API 경로, URL, `className`, id, key, localStorage key.
- Prisma enum의 실제 제출 값: `PRIVATE`, `PUBLIC`, `DRAFT`, `CURRENT` 등.
- 브랜드명 `Zac`, 로고 문자 `Z`.
- DB 또는 화면 목업 데이터로 취급되는 인물명, 세계관명, 태그, 본문 예시.
- 개발 로그, 내부 오류 코드, 내부 상태값.

## 추가 번역 대상

없음. 목업 데이터와 DB 데이터는 번역 대상에서 제외했다.

## 패키지

- 기존 설치된 `next-intl@4.13.0` 사용.
- 추가 설치 패키지 없음.

## 검증

- `npx tsc --noEmit`: 통과
- 한국어/영어 메시지 key parity 검사: 444개/444개, 차이 없음
- TSX 사용자 노출 literal 재스캔: 번역 대상 한국어 literal 없음
- `npm run build`: 통과
- `npm test`: 4개 통과
- `localhost:3000` HTTP 확인: 현재 셸에서 개발 서버가 실행 중이지 않아 연결할 수 없었음
