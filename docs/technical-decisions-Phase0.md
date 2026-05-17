# Phase 0 기술 결정 메모

## 확인한 로컬 문서

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
- `node_modules/next/dist/docs/03-architecture/accessibility.md`

## 결정 사항

- App Router를 기준으로 구현한다. 라우트는 `src/app` 하위의 `page.tsx`, `layout.tsx`, `route.ts` 파일 규칙을 따른다.
- 페이지와 레이아웃은 기본적으로 Server Component로 유지한다.
- 브라우저 API, 상태, 이벤트 핸들러가 필요한 기능만 Client Component로 분리한다.
- 생성, 수정, 삭제는 Server Function 또는 Route Handler에서 처리하되, 모든 쓰기 함수 내부에서 세션과 권한을 다시 검증한다.
- 공개 탐색처럼 읽기 중심 화면은 Server Component에서 데이터를 조회하고, 페이지네이션/검색 상태는 URL search params를 우선 사용한다.
- 동적 메타데이터가 필요한 상세 화면은 `generateMetadata`를 사용한다.
- API 성격의 엔드포인트가 필요한 경우 `src/app/api/**/route.ts`를 사용하고, `page.tsx`와 같은 route segment에 `route.ts`를 두지 않는다.
- 환경 변수는 프로젝트 루트의 `.env*`에서만 로드한다. `/src` 아래에 환경 파일을 두지 않는다.
- 비밀 값은 서버 전용 환경 변수로 유지하고, 브라우저에 공개해야 하는 값만 `NEXT_PUBLIC_` 접두사를 사용한다.
- 접근성을 위해 각 페이지는 고유한 title 또는 명확한 `h1`을 가진다.

## Phase 1에서 필요한 결정

- NextAuth 패키지 버전과 Adapter 버전을 확정한다.
- Prisma 7.8.0 설치 후 schema/migration 방식을 확정한다.
- PostgreSQL extension `pgcrypto`, `citext` 적용 방식을 migration에 반영한다.
- Credentials 로그인 사용 여부와 비밀번호 해시 라이브러리를 확정한다.
