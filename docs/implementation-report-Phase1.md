# Phase 1 구현 보고서

## 범위

Phase 1에서는 데이터베이스와 인증 기반을 구축했다.

- Prisma 7.8.0 기반 PostgreSQL 스키마 작성
- Prisma 7 방식의 `prisma.config.ts` 및 `@prisma/adapter-pg` 연결
- NextAuth 최신 패키지 설치 및 Credentials 로그인 라우트 구성
- 이메일/비밀번호 회원가입 흐름 추가
- 세계관 권한 검증 유틸 추가
- 로그인, 회원가입, 보호된 작업실 라우트 추가

## 설치 및 버전

- `next-auth@latest` 설치 결과: `4.24.14`
- `@next-auth/prisma-adapter@latest`
- `prisma@7.8.0`
- `@prisma/client@7.8.0`
- `@prisma/adapter-pg@7.8.0`
- `pg@latest`
- `bcryptjs@latest`

`next-auth@latest`가 현재 v4 계열이므로 Credentials Provider는 NextAuth v4 제약에 맞춰 JWT session strategy로 구성했다. NextAuth Adapter 호환을 위해 `sessions` 테이블 모델은 유지했다.

## 구현 내용

### Prisma

- `prisma/schema.prisma`를 추가했다.
- `docs/data-model.md` 기준으로 다음 모델을 반영했다.
  - `User`, `Account`, `Session`, `VerificationToken`
  - `World`, `WorldMember`, `WorldInvite`
  - `Character`, `Affiliation`, `CharacterAffiliation`
  - `CharacterRelation`
  - `Work`, `WorkChapter`, `WorkCharacter`, `WorkAffiliation`
  - `Tag`, `WorldTag`, `CharacterTag`, `WorkTag`
- Prisma 7.8.0에서 `datasource.url`이 schema 파일에서 제거되어 `prisma.config.ts`로 이동했다.
- PostgreSQL 직접 연결을 위해 `src/server/db.ts`에서 `PrismaPg` adapter를 사용했다.
- `prisma/migrations/000001_prisma7_foundation/manual.sql`에 `pgcrypto`, `citext`, 부분 unique index, 조회수 check constraint를 기록했다.

### Auth

- `src/server/auth.ts`에 NextAuth 설정을 추가했다.
- `src/app/api/auth/[...nextauth]/route.ts`에 App Router Route Handler를 추가했다.
- Credentials 로그인은 이메일과 비밀번호를 검증하고 `bcryptjs`로 저장된 해시를 비교한다.
- `src/features/auth/actions.ts`에 회원가입 Server Action을 추가했다.
- `src/features/auth/login-form.tsx`에 Credentials 로그인 클라이언트 폼을 추가했다.
- `/login`, `/signup`, `/workspace` 라우트를 추가했다.

### 권한

- `src/server/permissions.ts`를 추가했다.
- 다음 유틸을 구현했다.
  - `requireUser`
  - `getWorldRole`
  - `assertCanReadWorld`
  - `assertCanEditWorld`
  - `assertCanAdminWorld`
  - `assertWorldOwner`
- 읽기 권한은 `PUBLIC` 세계관 또는 멤버십 기반으로 판단한다.
- 편집 권한은 `OWNER`, `ADMIN`, `EDITOR`를 허용한다.
- 관리 권한은 `OWNER`, `ADMIN`을 허용한다.
- 삭제/소유자 전용 작업은 `OWNER`만 허용하도록 분리했다.

## 검증

- `npm run prisma:validate`: 통과
- `npm run prisma:generate`: 통과
- `npm run lint`: 통과
- `npm run build`: 통과

빌드는 Next.js 16 Turbopack이 내부 프로세스/포트 바인딩을 사용해 기본 샌드박스에서 실패했으나, 권한 상승 실행에서는 정상 통과했다.

## 남은 작업 및 주의점

- 실제 PostgreSQL 서버에 migration은 적용하지 않았다. 로컬 DB 준비 후 `npm run prisma:migrate` 또는 생성된 SQL 반영이 필요하다.
- npm 설치 후 `7 moderate severity vulnerabilities` 경고가 표시되었다. Phase 1 범위에서는 자동 수정하지 않았다.
- npm `allow-scripts` 경고가 표시되었다. 필요 시 `npm approve-scripts`로 Prisma/Sharp 관련 install script 허용 여부를 검토해야 한다.
- Credentials Provider와 `next-auth@4.24.14` 조합은 JWT session strategy가 필요하다. DB session strategy로 전환하려면 OAuth 또는 Auth.js v5 전환을 함께 검토해야 한다.
