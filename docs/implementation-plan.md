# 구현 계획서

## 1. 문서 목적

이 문서는 `AGENTS.md`, `docs/requirements.md`, `docs/data-model.md`, `docs/ui`의 화면 설계를 기준으로 Zac 서비스를 실제 Next.js 애플리케이션으로 구현하기 위한 단계별 계획을 정의한다.

MVP는 세계관을 최상위 공유 단위로 두고, 세계관 안에서 캐릭터, 소속, 관계, 창작물, 챕터, 태그를 생성하고 관리하는 흐름을 완성하는 것을 목표로 한다.

## 2. 현재 프로젝트 상태

- Framework: Next.js `16.2.6`
- React: `19.2.4`
- App 구조: `src/app` 기반
- 현재 구현 상태: 기본 Next.js 초기 화면만 존재
- 기획 문서: `AGENTS.md`
- 요구사항 문서: `docs/requirements.md`
- 데이터 모델 문서: `docs/data-model.md`
- UI 목업: `docs/ui/*.html`
- 아직 필요한 주요 의존성: Prisma, PostgreSQL driver, NextAuth, 비밀번호 해시 라이브러리, Markdown 렌더링/정화 라이브러리

구현 전에는 `AGENTS.md` 지침에 따라 반드시 `node_modules/next/dist/docs/`에서 현재 설치된 Next.js 문서를 확인한다. 이 프로젝트의 Next.js는 일반적으로 알려진 API와 다를 수 있다.

## 3. 구현 원칙

- 서버 측 쓰기 경로는 항상 세션과 세계관 권한을 함께 검증한다.
- 세계관, 캐릭터, 소속, 관계, 창작물, 챕터 연결은 모두 같은 `world_id` 경계 안에서만 허용한다.
- 목록 조회는 권한 필터를 쿼리 단계에서 적용해 비공개 데이터가 응답에 섞이지 않게 한다.
- 삭제는 MVP에서 논리 삭제를 기본으로 한다. 단, 멤버십과 조인 테이블은 정책에 따라 물리 삭제한다.
- 장문 본문은 Markdown으로 입력하고, 렌더링 시 XSS 방어 정책을 적용한다.
- 공개 탐색 목록은 페이지네이션을 기본으로 하며 한 페이지 15개 노출을 기준으로 한다.
- `docs/ui` 목업은 시각 기준으로 사용하되, 실제 구현에서는 재사용 컴포넌트와 접근성을 우선한다.

## 4. 화면 구현 범위

| HTML 목업 | 구현 화면 |
| --- | --- |
| `01-start.html`, `02-home.html` | 랜딩, 홈/탐색 진입 |
| `03-login.html`, `04-signup.html` | 로그인, 회원가입 |
| `05-workspace.html` | 내 작업 |
| `06-worlds-explore.html`, `26-character-explore.html`, `07-works-explore.html` | 세계관/캐릭터/창작물 공개 탐색 |
| `27-worlds-list.html`, `12-characters-list.html`, `16-affiliations-list.html`, `21-works-list.html` | 내 리소스 목록 및 선택 삭제 |
| `08-world-create.html`, `09-world-detail.html`, `10-world-edit.html`, `11-world-share.html` | 세계관 CRUD 및 공유 관리 |
| `13-character-create.html`, `14-character-detail.html`, `15-character-edit.html` | 캐릭터 CRUD |
| `17-affiliation-create.html`, `18-affiliation-detail.html`, `19-affiliation-edit.html` | 소속 CRUD |
| `20-relations-graph.html` | 관계도 조회, 생성, 수정, 삭제 |
| `22-work-create.html`, `28-work-detail.html`, `23-work-reader.html`, `24-work-edit.html`, `25-chapter-editor.html` | 창작물/챕터 CRUD 및 읽기 |

## 5. Phase 0: 기술 검증 및 기반 정리

### 목표

Next.js 16.2.6 기준의 구현 방식을 확인하고, Prisma/PostgreSQL/NextAuth를 붙일 수 있는 최소 기반을 만든다.

### 작업

- `node_modules/next/dist/docs/`에서 App Router, Server Component, Server Action 또는 Route Handler, Metadata, form 처리 관련 문서를 확인한다.
- Prisma 7.8.0과 현재 프로젝트 TypeScript 설정의 호환성을 확인한다.
- NextAuth session 방식의 현재 버전 문서와 Adapter 요구사항을 확인한다.
- 환경 변수 목록을 정의한다.
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET` 또는 현재 NextAuth 버전에서 요구하는 secret 값
  - 앱 URL 관련 값
- 공통 폴더 구조를 잡는다.
  - `src/app`
  - `src/components`
  - `src/features`
  - `src/lib`
  - `src/server`
  - `src/styles`

### 산출물

- 기술 결정 메모
- 환경 변수 샘플
- 기본 레이아웃, 전역 스타일, 공통 헤더/탭 컴포넌트

## 6. Phase 1: 데이터베이스 및 인증

### 목표

NextAuth session 인증과 Prisma 데이터 모델을 먼저 구축해 이후 모든 도메인 구현의 기준을 만든다.

### 작업

- Prisma 초기화 및 PostgreSQL datasource 설정
- `docs/data-model.md` 기준 Prisma schema 작성
  - `User`, `Account`, `Session`, `VerificationToken`
  - `World`, `WorldMember`, `WorldInvite`
  - `Character`, `Affiliation`, `CharacterAffiliation`
  - `CharacterRelation`
  - `Work`, `WorkChapter`, `WorkCharacter`, `WorkAffiliation`
  - `Tag`, `WorldTag`, `CharacterTag`, `WorkTag`
- PostgreSQL extension 검토
  - `pgcrypto` for `gen_random_uuid()`
  - `citext` for email
- Prisma로 표현하기 어려운 partial unique index는 raw migration으로 작성한다.
- Credentials 회원가입/로그인 정책을 결정하고 비밀번호 해시를 적용한다.
- 세션 조회 유틸과 권한 조회 유틸을 만든다.
  - `requireUser()`
  - `getWorldRole()`
  - `assertCanReadWorld()`
  - `assertCanEditWorld()`
  - `assertCanAdminWorld()`
  - `assertWorldOwner()`

### 산출물

- Prisma schema 및 migration
- NextAuth 설정
- 로그인/회원가입/로그아웃 동작
- 서버 권한 검증 유틸

## 7. Phase 2: 공통 UI와 라우팅 골격

### 목표

정적 HTML 목업을 실제 Next.js 화면으로 옮기기 전, 반복되는 UI와 라우팅 구조를 정리한다.

### 작업

- `docs/ui`에서 공통 디자인 토큰을 추출한다.
  - 배경 `#000000`
  - 주요 그라디언트 `#E100FF`, `#FF0040`
  - 제목 36px, 중제목 28px, 소제목 20px, 본문 16px
- 공통 컴포넌트 구현
  - App Header
  - Bottom Tab
  - Page Shell
  - Panel/Card
  - CTA Button/Ghost Button/Text Button
  - Chip
  - Horizontal Card Scroll
  - Confirm Modal
  - Pagination
  - Markdown Preview/Viewer
- App Router 기준 라우트 설계
  - `/`
  - `/home`
  - `/login`
  - `/signup`
  - `/workspace`
  - `/worlds`, `/worlds/explore`, `/worlds/new`, `/worlds/[worldId]`, `/worlds/[worldId]/edit`, `/worlds/[worldId]/share`
  - `/characters`, `/characters/explore`, `/characters/new`, `/characters/[characterId]`, `/characters/[characterId]/edit`
  - `/affiliations`, `/affiliations/new`, `/affiliations/[affiliationId]`, `/affiliations/[affiliationId]/edit`
  - `/relations`
  - `/works`, `/works/explore`, `/works/new`, `/works/[workId]`, `/works/[workId]/read`, `/works/[workId]/edit`, `/works/[workId]/chapters`

### 산출물

- 공통 레이아웃과 컴포넌트
- 정적 화면 수준의 라우팅 연결
- 로그인 필요 화면의 접근 제어 골격

## 8. Phase 3: 세계관 MVP

### 목표

세계관 생성, 조회, 수정, 삭제, 공유 관리의 전체 흐름을 완성한다.

### 작업

- 세계관 생성/수정 입력 구현
  - 제목
  - 소개 Markdown
  - 장르
  - 커버 이미지 URL
  - 공개 범위
  - 태그 입력 `#태그1 #태그2`
- 태그 저장 로직 구현
  - `#` 제거
  - 공백 기준 분리
  - 기존 태그 조회 또는 생성
  - `world_tags` 연결 갱신
- 세계관 상세 구현
  - 소개 Markdown
  - 커버 이미지
  - 캐릭터/소속/창작물 요약 가로 스크롤
  - 관계 그래프 미리보기
- 내 세계관 목록 구현
  - 카드 목록
  - 선택 삭제 모드
  - 삭제 확인 모달
- 공유 관리 구현
  - OWNER, ADMIN, EDITOR, VIEWER 권한
  - 이메일 초대 모달
  - 권한 dropdown
  - 공유 해제
- 공개 탐색 구현
  - 검색어와 태그 통합 검색
  - 인기순 `view_count desc`
  - 최신순 `updated_at desc`
  - 페이지네이션 15개

### 산출물

- 세계관 CRUD
- 세계관 공유 관리
- 세계관 공개 탐색
- 태그 저장 공통 로직 1차

## 9. Phase 4: 캐릭터와 소속

### 목표

세계관 내부 캐릭터와 소속, 캐릭터-소속 연결 이력을 구현한다.

### 작업

- 캐릭터 CRUD 구현
  - 이름
  - 별칭
  - 프로필 이미지 URL
  - 한 줄 소개
  - 상세 소개 Markdown
  - 성격
  - 배경
  - 공개 범위
  - 태그
  - 세계관 선택
- 캐릭터 태그 저장 로직 구현
- 소속 CRUD 구현
  - 이름
  - 유형
  - 설명 Markdown
  - 상징 이미지 URL
  - 대표 색상
  - 공개 범위
  - 상위 소속 선택
- 캐릭터-소속 연결 구현
  - title
  - rank
  - status
  - started_label
  - ended_label
  - note
  - is_primary
- 캐릭터 상세 구현
  - 소개
  - 등장 세계관
  - 대표 소속
  - 등장 창작물
  - 해당 캐릭터 중심 관계 그래프
- 소속 상세 구현
  - 상징 이미지
  - 대표 색상
  - 설명 Markdown
  - 상위 소속
  - 소속 멤버 카드 목록
- 목록 선택 삭제 구현
  - 캐릭터 목록
  - 소속 목록

### 산출물

- 캐릭터 CRUD
- 소속 CRUD
- 캐릭터-소속 연결 CRUD
- 캐릭터/소속 상세 화면
- 캐릭터 공개 탐색

## 10. Phase 5: 관계도

### 목표

캐릭터 관계 CRUD와 그래프 기반 조회/편집 화면을 구현한다.

### 작업

- 관계 생성/수정/삭제 구현
  - source_character_id
  - target_character_id
  - label
  - description
  - direction
  - status
  - visibility
  - context_affiliation_id
- 서버 검증
  - 출발 캐릭터와 대상 캐릭터는 서로 달라야 한다.
  - 두 캐릭터는 같은 세계관에 속해야 한다.
  - 맥락 소속도 같은 세계관에 속해야 한다.
- 그래프 데이터 API 또는 서버 함수 구현
  - 노드: 캐릭터
  - 엣지: 관계
  - 노드 소속 색상
  - 소속별 필터 데이터
- 관계도 UI 구현
  - Figma처럼 드래그로 캔버스 이동
  - 노드 중심 기준 간선 연결
  - 간선 클릭 시 수정 모달
  - 관계 추가 모달
  - 관계 삭제 CTA
- 성능 기준
  - 캐릭터 100개, 관계 300개 규모에서 1초 이내 데이터 반환 목표

### 산출물

- 관계 CRUD
- 관계 그래프 조회/편집 화면
- 세계관 상세/캐릭터 상세 내 그래프 재사용

## 11. Phase 6: 창작물과 챕터

### 목표

세계관 기반 창작물, 등장 캐릭터, 관련 소속, 챕터 작성과 읽기 흐름을 구현한다.

### 작업

- 창작물 CRUD 구현
  - 제목
  - 타입
  - 요약 Markdown
  - 커버 이미지 URL
  - 공개 범위
  - 게시 상태
  - 공식 여부 `is_official`
  - 태그
  - 세계관 연결
- 공식 여부 저장 규칙 구현
  - 작성자가 세계관 OWNER, ADMIN, EDITOR이면 `is_official = true`
- 등장 캐릭터 연결 구현
  - character_id
  - role
  - note
  - sort_order
- 관련 소속 연결 구현
  - affiliation_id
  - note
  - sort_order
- 챕터 편집 구현
  - 제목 input
  - Markdown 본문
  - 공개 범위
  - 게시 상태
  - 정렬 순서
  - 챕터 추가/삭제
  - 창작물 게시 CTA
- 창작물 상세 구현
  - 세계관
  - 등장인물
  - 관련 소속
  - 소개
  - 챕터 목록
- 창작물 리더 구현
  - 1챕터부터 Markdown 읽기
  - 챕터 페이지네이션
  - 진행률 바 드래그 이동
  - 이전/다음 챕터
- 창작물 탐색 구현
  - 검색어/태그 검색
  - 인기순/최신순
  - 페이지네이션 15개

### 산출물

- 창작물 CRUD
- 챕터 CRUD
- 창작물 상세/리더
- 등장 캐릭터/관련 소속 연결
- 창작물 공개 탐색

## 12. Phase 7: 내 작업실과 임시 저장

### 목표

사용자가 소유하거나 공유받은 작업을 한곳에서 이어서 관리하고, 작성 중 이탈한 데이터를 복구할 수 있게 한다.

### 작업

- 내 작업실 구현
  - 세계관 수
  - 캐릭터 수
  - 창작물 수
  - 임시 저장 목록
  - 세계관/캐릭터/창작물 가로 카드 섹션
- 임시 저장 구현
  - 브라우저 localStorage 기반 MVP
  - 세계관/소속/캐릭터/창작물/챕터 작성 화면에서 자동 저장
  - 저장된 초안 클릭 시 해당 작성 화면으로 복구
  - 저장 완료 시 초안 제거
- 로그아웃 구현

### 산출물

- 내 작업실
- localStorage 기반 임시 저장
- 주요 작성 화면 자동 복구

## 13. Phase 8: 접근 제어, 보안, 오류 처리

### 목표

도메인별 기능을 통합한 뒤 권한 누락, 데이터 노출, XSS 위험을 줄인다.

### 작업

- 모든 server action 또는 route handler에 권한 검증 적용 여부 점검
- 공개/비공개/공유 전용 리소스 조회 쿼리 점검
- Markdown 렌더링 XSS 방어 적용
- 삭제 영향 범위 정리
  - 세계관 삭제
  - 캐릭터 삭제
  - 소속 삭제
  - 관계 삭제
  - 창작물/챕터 삭제
- 오류 메시지 표준화
  - 인증 필요
  - 권한 없음
  - 존재하지 않음
  - 검증 실패
  - 서버 오류
- 권한 없는 사용자는 데이터 존재 여부가 불필요하게 노출되지 않도록 처리

### 산출물

- 권한 체크리스트
- 보안 점검 결과
- 공통 오류 처리 유틸

## 14. Phase 9: 성능 최적화와 품질 검증

### 목표

MVP 완료 기준과 성능 요구사항을 만족하는지 확인한다.

### 작업

- 페이지네이션 점검
  - 공개 세계관
  - 공개 캐릭터
  - 공개 창작물
  - 내 리소스 목록
- 주요 DB 인덱스 적용 확인
- N+1 쿼리 점검
- 관계도 데이터 조회 성능 점검
- 장문 창작물은 챕터 단위로 로드되는지 확인
- 반응형 UI 검증
  - 516px 이하 bottom tab
  - 카드 그리드/가로 스크롤
  - 모달 크기와 버튼 배치
- 테스트 작성
  - 권한 유틸 단위 테스트
  - 태그 파싱 단위 테스트
  - 도메인 생성/수정 서버 함수 테스트
  - 핵심 화면 smoke test

### 산출물

- 성능 점검 결과
- 테스트 스위트
- MVP 완료 체크리스트

## 15. MVP 완료 기준

- 사용자는 회원가입, 로그인, 로그아웃을 할 수 있다.
- 사용자는 세계관을 생성, 조회, 수정, 삭제할 수 있다.
- 사용자는 세계관을 특정 사용자와 공유하고 권한을 관리할 수 있다.
- 사용자는 세계관 안에서 소속을 생성, 조회, 수정, 삭제할 수 있다.
- 사용자는 세계관 안에서 캐릭터를 생성, 조회, 수정, 삭제할 수 있다.
- 사용자는 캐릭터와 소속 연결 이력을 관리할 수 있다.
- 사용자는 같은 세계관 내 캐릭터 관계를 그래프로 조회하고 생성, 수정, 삭제할 수 있다.
- 사용자는 세계관 기반 창작물과 챕터를 생성, 조회, 수정, 삭제할 수 있다.
- 공개 세계관, 공개 캐릭터, 공개 창작물은 탐색할 수 있다.
- 비공개 및 공유 전용 리소스는 권한 없는 사용자에게 노출되지 않는다.
- 주요 목록은 페이지네이션을 지원하고, 공개 탐색은 한 페이지 15개 기준으로 동작한다.
- 태그 입력 `#태그1 #태그2`는 저장 시 태그 개체와 연결 테이블로 정규화된다.

## 16. 우선순위와 의존 관계

1. 인증과 Prisma schema가 먼저 완성되어야 모든 쓰기 기능을 구현할 수 있다.
2. 세계관 CRUD와 권한 모델이 먼저 완성되어야 캐릭터, 소속, 관계, 창작물을 안전하게 구현할 수 있다.
3. 태그 저장 로직은 세계관에서 먼저 구현한 뒤 캐릭터와 창작물에 재사용한다.
4. 캐릭터와 소속이 완성되어야 관계도와 창작물 연결을 구현할 수 있다.
5. 창작물 기본 정보가 완성되어야 챕터 편집기와 리더를 구현할 수 있다.
6. 공개 탐색은 각 도메인의 공개 범위 계산과 조회수가 준비된 뒤 통합한다.

## 17. 주요 리스크

- Next.js 16.2.6의 API 차이로 기존 App Router 지식이 맞지 않을 수 있다.
- Prisma partial unique index와 복합 FK는 raw migration이 필요할 수 있다.
- 권한 필터가 애플리케이션 후처리로 밀리면 비공개 데이터 노출 위험이 있다.
- Markdown 렌더링은 XSS 위험이 있으므로 정화 정책을 반드시 정해야 한다.
- 관계 그래프는 데이터가 커질수록 렌더링 비용이 커질 수 있다.
- localStorage 임시 저장은 기기별 저장이므로 서버 저장 초안과 다르다는 점을 UX에서 명확히 해야 한다.

## 18. MVP 이후 확장 후보

- 서버 저장 기반 초안
- 변경 이력과 공동 편집 로그
- 댓글, 좋아요, 북마크
- 이미지/자료 첨부
- 작품 연재 예약
- 소속별 타임라인, 조직도, 계급도
- 전문 검색 `tsvector` 또는 검색 엔진 연동
- 신고, 차단, 콘텐츠 공개 정책
