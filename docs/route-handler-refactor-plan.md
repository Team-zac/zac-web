# Route Handler 기반 Prisma 분리 리팩토링 계획

## 1. 현재 Prisma 사용 파일

`features/` 내부에서 `@/server/db`의 `prisma`를 직접 import하는 파일은 다음과 같다.

| 파일 | 성격 | 주요 export |
| --- | --- | --- |
| `src/features/auth/actions.ts` | 회원가입 server action | `signUpAction` |
| `src/features/worlds/actions.ts` | 세계관 쓰기 server action | `createWorldAction`, `updateWorldAction`, `deleteWorldsAction`, 공유 관리 action |
| `src/features/worlds/data.ts` | 세계관 조회 | `getMyWorlds`, `getPublicWorlds`, `getWorldDetail`, `getWorldForEdit`, `getWorldShareData` |
| `src/features/characters/actions.ts` | 캐릭터 쓰기 server action | `createCharacterAction`, `updateCharacterAction`, `deleteCharactersAction` |
| `src/features/characters/data.ts` | 캐릭터 조회 | `getEditableWorlds`, `getMyCharacters`, `getPublicCharacters`, 상세/편집 조회 |
| `src/features/affiliations/actions.ts` | 소속 쓰기 server action | `createAffiliationAction`, `updateAffiliationAction`, `deleteAffiliationsAction` |
| `src/features/affiliations/data.ts` | 소속 조회 | `getMyAffiliations`, 상세/편집 조회 |
| `src/features/relations/actions.ts` | 관계 쓰기 server action | `createRelationAction`, `updateRelationAction`, `deleteRelationAction` |
| `src/features/relations/data.ts` | 관계 그래프 조회 | `getDefaultRelationWorld`, `getRelationGraphData` |
| `src/features/works/actions.ts` | 창작물/챕터 쓰기 server action | `createWorkAction`, `updateWorkAction`, 삭제/챕터/게시 action |
| `src/features/works/data.ts` | 창작물/챕터 조회 | 목록/탐색/상세/편집/리더 조회 |
| `src/features/workspace/data.ts` | 작업실 조회 | `getWorkspaceData` |

## 2. Client Component 직접 호출부

Client Component가 직접 import하는 Prisma 관련 함수는 현재 모두 `features/*/actions.ts`의 server action이다.

| Client Component | 현재 import | 변경 방향 |
| --- | --- | --- |
| `WorldListManager` | `deleteWorldsAction` | `fetch('/api/worlds', { method: 'DELETE' })` |
| `WorldShareManager` | 공유 관련 action | `/api/worlds/[worldId]/members`, `/api/worlds/[worldId]/invites` |
| `CharacterListManager` | `deleteCharactersAction` | `fetch('/api/characters', { method: 'DELETE' })` |
| `AffiliationListManager` | `deleteAffiliationsAction` | `fetch('/api/affiliations', { method: 'DELETE' })` |
| `RelationGraph` | 관계 create/update/delete action | `/api/relations`, `/api/relations/[relationId]` |
| `WorkListManager` | `deleteWorksAction` | `fetch('/api/works', { method: 'DELETE' })` |
| `ChapterEditor` | 챕터 add/save/delete action | `/api/works/[workId]/chapters`, `/api/works/[workId]/chapters/[chapterId]` |

폼 컴포넌트(`WorldForm`, `CharacterForm`, `AffiliationForm`, `WorkForm`)는 Server Component에서 action prop을 전달받아 `useActionState`로 호출한다. 이 액션들은 Prisma 로직을 직접 갖지 않고 Route Handler로 fetch하는 wrapper로 변경한다.

## 3. 목표 구조

```text
Client Component
  -> fetch('/api/...')
Route Handler: app/api/**/route.ts
  -> prisma
Database
```

Server Component 조회도 `features/*/data.ts`에서 Prisma를 직접 import하지 않고 internal fetch wrapper로 Route Handler를 호출한다.

## 4. API 설계

### 인증

- `POST /api/auth/signup`

### 세계관

- `GET /api/worlds?scope=my&page=1`
- `GET /api/worlds?scope=public&q=&sort=&page=`
- `POST /api/worlds`
- `DELETE /api/worlds`
- `GET /api/worlds/[worldId]?view=detail|edit|share`
- `PATCH /api/worlds/[worldId]`
- `POST /api/worlds/[worldId]/members`
- `PATCH /api/worlds/[worldId]/members/[memberId]`
- `DELETE /api/worlds/[worldId]/members/[memberId]`
- `DELETE /api/worlds/[worldId]/invites/[inviteId]`

### 캐릭터

- `GET /api/characters?scope=my|public|editable-worlds`
- `POST /api/characters`
- `DELETE /api/characters`
- `GET /api/characters/[characterId]?view=detail|edit`
- `PATCH /api/characters/[characterId]`

### 소속

- `GET /api/affiliations`
- `POST /api/affiliations`
- `DELETE /api/affiliations`
- `GET /api/affiliations/[affiliationId]?view=detail|edit`
- `PATCH /api/affiliations/[affiliationId]`

### 관계

- `GET /api/relations?worldId=&centerCharacterId=`
- `POST /api/relations`
- `PATCH /api/relations/[relationId]`
- `DELETE /api/relations/[relationId]`

### 창작물

- `GET /api/works?scope=my|public|editable-worlds`
- `POST /api/works`
- `DELETE /api/works`
- `GET /api/works/[workId]?view=detail|edit|chapters|reader`
- `PATCH /api/works/[workId]`
- `POST /api/works/[workId]/publish`
- `POST /api/works/[workId]/chapters`
- `PATCH /api/works/[workId]/chapters/[chapterId]`
- `DELETE /api/works/[workId]/chapters/[chapterId]`

### 작업실

- `GET /api/workspace`

## 5. 구현 순서

1. Route Handler에서 공통으로 사용할 JSON/FormData 응답 유틸 작성
2. `features/*/actions.ts`와 `features/*/data.ts`의 기존 Prisma 로직을 Route Handler로 이동
3. `features/*` 파일은 Route Handler를 호출하는 fetch wrapper로 변경
4. Client Component의 직접 server action import를 REST fetch 호출로 변경
5. Server Component는 기존 feature wrapper import를 유지하되 내부 구현이 fetch로 바뀌도록 정리
6. `rg "@/server/db" src/features`로 Prisma import가 남지 않았는지 확인
7. `npx tsc --noEmit`로 타입 검증

## 6. 변경 전/후 구조

### 변경 전

```text
Client Component
  -> features/*/actions.ts ("use server")
    -> prisma

Server Component
  -> features/*/data.ts
    -> prisma
```

### 변경 후

```text
Client Component
  -> fetch('/api/...')
    -> app/api/**/route.ts
      -> prisma

Server Component
  -> features/*/data.ts fetch wrapper
    -> app/api/**/route.ts
      -> prisma
```

## 7. 주의사항

- `DATABASE_URL`은 서버 전용 환경변수이므로 Route Handler 내부에서만 접근한다.
- Client Component는 `features/*/actions.ts`, `features/*/data.ts` 중 Prisma와 연결될 수 있는 파일을 직접 import하지 않는다.
- 기존 FormData 기반 입력 파서는 유지해서 서버 action과 Route Handler 양쪽에서 타입 변환 규칙이 달라지지 않게 한다.
