# Phase 0 구현 보고서

## 1. 목표

Next.js 16.2.6 기준의 구현 방식을 확인하고, Zac MVP 구현을 시작할 수 있는 최소 기반을 구성했다.

Phase 0 범위는 다음과 같다.

- 현재 설치된 Next.js 문서 확인
- 기술 결정 메모 작성
- 환경 변수 샘플 작성
- 공통 폴더 구조 작성
- 기본 레이아웃, 전역 스타일, 공통 헤더/탭 컴포넌트 작성
- 초기 홈 화면을 Zac 랜딩 화면으로 교체
- lint/build 검증

## 2. 참고 문서

다음 로컬 Next.js 문서를 확인했다.

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
- `node_modules/next/dist/docs/03-architecture/accessibility.md`

## 3. 구현 내용

### 3.1 기술 결정 메모

추가 파일:

- `docs/technical-decisions-Phase0.md`

주요 결정:

- App Router와 `src/app` 구조를 기준으로 구현한다.
- 페이지와 레이아웃은 기본적으로 Server Component로 유지한다.
- 상태, 이벤트, `localStorage` 등 브라우저 기능이 필요한 부분만 Client Component로 분리한다.
- 모든 Server Function과 Route Handler 쓰기 경로에서 세션과 권한을 다시 검증한다.
- 환경 변수는 프로젝트 루트의 `.env*`에서 관리한다.
- 브라우저 공개 값은 `NEXT_PUBLIC_` 접두사를 가진 값만 사용한다.

### 3.2 환경 변수 샘플

추가 파일:

- `.env.example`

정의한 값:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

### 3.3 공통 폴더 구조

추가한 구조:

- `src/components`
- `src/components/ui`
- `src/features`
- `src/lib`
- `src/server`
- `src/styles`

빈 폴더의 의도를 유지하기 위해 `.gitkeep` 파일을 추가했다.

### 3.4 공통 컴포넌트

추가 파일:

- `src/lib/navigation.ts`
- `src/components/app-header.tsx`
- `src/components/page-shell.tsx`

구현 내용:

- 주요 탭 정의: 세계관, 캐릭터, 창작물, 내 작업
- `AppHeader`: 브랜드, 상단 탭, 로그인 CTA
- `PageShell`: 공통 헤더와 페이지 shell을 감싸는 레이아웃 컴포넌트
- 516px 이하에서는 하단 탭으로 전환되는 CSS 기반 반응형 구조

### 3.5 전역 스타일

수정 파일:

- `src/app/globals.css`

구현 내용:

- Zac 디자인 토큰 적용
  - 배경: `#000000`
  - 주요 색상: `#E100FF`, `#FF0040`
  - 제목 36px, 중제목 28px, 소제목 20px, 본문 16px
- 검은 배경, 그리드 배경, 메인 그라디언트 적용
- 공통 버튼, 카드, 패널, 헤더, 탭 스타일 추가
- Google Fonts 네트워크 의존 제거 후 시스템 폰트 기반으로 변경

### 3.6 루트 레이아웃과 홈 화면

수정 파일:

- `src/app/layout.tsx`
- `src/app/page.tsx`

구현 내용:

- 기본 `Create Next App` 메타데이터를 Zac 메타데이터로 교체
- `html lang`을 `ko`로 변경
- `next/font/google` 의존 제거
- 기본 Next.js 시작 화면을 Zac 랜딩 화면으로 교체
- `시작하기` CTA를 `/login`으로 연결

## 4. 검증 결과

### lint

명령:

```bash
npm run lint
```

결과:

- 통과

### build

1차 실행:

```bash
npm run build
```

결과:

- 실패
- 원인: `next/font/google`이 `Geist`, `Geist Mono`를 Google Fonts에서 가져오려 했으나 네트워크 제한으로 실패

조치:

- `next/font/google` 사용을 제거하고 시스템 폰트로 변경

2차 실행:

```bash
npm run build
```

결과:

- 샌드박스 환경에서 Turbopack/PostCSS 내부 프로세스의 포트 바인딩이 차단되어 실패
- 코드 오류가 아니라 실행 권한 문제로 판단

승인 후 재실행:

```bash
npm run build
```

결과:

- 통과
- `/`와 `/_not-found`가 static content로 prerender됨

## 5. Phase 0 완료 상태

| 항목 | 상태 |
| --- | --- |
| Next.js 로컬 문서 확인 | 완료 |
| 기술 결정 메모 | 완료 |
| 환경 변수 샘플 | 완료 |
| 공통 폴더 구조 | 완료 |
| 기본 레이아웃 | 완료 |
| 전역 스타일 | 완료 |
| 공통 헤더/탭 컴포넌트 | 완료 |
| 초기 홈 화면 교체 | 완료 |
| lint 검증 | 통과 |
| build 검증 | 통과 |

## 6. 다음 Phase로 넘길 사항

- Phase 1에서 Prisma 7.8.0, NextAuth, PostgreSQL 관련 의존성을 설치해야 한다.
- NextAuth 버전과 Adapter 요구사항을 확인해야 한다.
- Prisma schema 작성 전 `docs/data-model.md`의 partial unique index와 PostgreSQL extension 적용 방식을 migration으로 설계해야 한다.
- Credentials 로그인을 사용할 경우 비밀번호 해시 라이브러리를 확정해야 한다.
