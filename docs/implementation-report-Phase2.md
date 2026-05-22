# Phase 2 구현 보고서

## 범위

Phase 2에서는 정적 HTML 목업을 실제 Next.js 화면으로 옮기기 전에 필요한 공통 UI 컴포넌트와 라우팅 골격을 구축했다.

- 공통 UI primitives 추가
- 카드/패널/칩/버튼/가로 스크롤/페이지네이션/확인 모달/Markdown viewer 추가
- 주요 App Router URL 추가
- 각 도메인 화면의 정적 스켈레톤 연결

## 구현 내용

### 공통 컴포넌트

다음 파일을 추가했다.

- `src/components/ui/button.tsx`
- `src/components/ui/chip.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/confirm-modal.tsx`
- `src/components/ui/markdown-viewer.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/routes/route-placeholder.tsx`

각 컴포넌트는 Phase 3 이후 실제 데이터와 서버 액션을 붙이기 전까지 정적 화면 골격을 제공한다.

### 스타일

`src/app/globals.css`에 다음 공통 스타일을 추가했다.

- `page-hero`
- `hero-actions`
- `chip`, `chip-row`
- `preview-card`
- `horizontal-card-scroll`
- `search-row`
- `pagination`
- `markdown-viewer`
- `confirm-modal`
- `graph-panel`

디자인 토큰은 기존 Phase 0 기준을 유지했다.

- 배경: `#000000`
- 주요 그라디언트: `#E100FF`, `#FF0040`
- 제목: `36px`
- 중제목: `28px`
- 소제목: `20px`
- 본문: `16px`

### 라우팅 골격

다음 라우트를 추가했다.

- `/home`
- `/worlds`
- `/worlds/explore`
- `/worlds/new`
- `/worlds/[worldId]`
- `/worlds/[worldId]/edit`
- `/worlds/[worldId]/share`
- `/characters`
- `/characters/explore`
- `/characters/new`
- `/characters/[characterId]`
- `/characters/[characterId]/edit`
- `/affiliations`
- `/affiliations/new`
- `/affiliations/[affiliationId]`
- `/affiliations/[affiliationId]/edit`
- `/relations`
- `/works`
- `/works/explore`
- `/works/new`
- `/works/[workId]`
- `/works/[workId]/read`
- `/works/[workId]/edit`
- `/works/[workId]/chapters`

각 화면은 `RoutePlaceholder`를 사용해 도메인별 제목, CTA, 검색/목록/상세/편집/그래프/리더 스켈레톤을 표시한다.

## 검증

- `npm run prisma:validate`: 통과
- `npm run lint`: 통과
- `npm run build`: 통과

빌드는 Next.js 16 Turbopack의 내부 포트 바인딩 때문에 권한 상승 실행으로 검증했다.

## 빌드 라우트 확인

빌드 결과 주요 라우트가 모두 생성되었다.

- Static: `/`, `/home`, `/worlds`, `/worlds/explore`, `/worlds/new`, `/characters`, `/characters/explore`, `/characters/new`, `/affiliations`, `/affiliations/new`, `/relations`, `/works`, `/works/explore`, `/works/new`, `/login`
- Dynamic: `/api/auth/[...nextauth]`, `/workspace`, 각 상세/수정/공유/리더/챕터 라우트

## 남은 작업

- Phase 3에서 세계관 CRUD 서버 액션과 실제 DB 데이터를 연결해야 한다.
- Placeholder UI는 실제 목업과 1:1 완성 화면이 아니라 라우팅/컴포넌트 골격이다.
- Markdown viewer는 Phase 2 범위에서 단순 문단 렌더러로 두었다. 실제 XSS 방어가 필요한 Markdown 렌더링은 후속 Phase에서 라이브러리 도입과 함께 처리한다.
