# Prisma Route Handler Refactor Report

## 분석 결과

`features/` 내부에서 Prisma 또는 `@/server/db`를 직접 사용하던 영역을 서버 전용 API 호출 래퍼로 교체했다.

변경 전 핵심 구조:

```text
Client Component
  -> features/*/actions 또는 features/*/data import
  -> Prisma
  -> Database
```

변경 후 핵심 구조:

```text
Client Component
  -> fetch()
  -> app/api/**/route.ts
  -> Prisma
  -> Database
```

Server Component와 Server Action 래퍼는 기존 페이지 계약을 유지하기 위해 남겨두었지만, 내부 Prisma 호출은 제거했고 `apiFetch()`로 Route Handler만 호출한다.

## Prisma 이동 대상

아래 기능 영역의 Prisma 접근을 Route Handler로 이동했다.

- 인증 회원가입: `features/auth/actions.ts`
- 세계관 목록, 상세, 생성, 수정, 삭제, 공유 관리: `features/worlds/*`
- 캐릭터 목록, 상세, 생성, 수정, 삭제: `features/characters/*`
- 소속 목록, 상세, 생성, 수정, 삭제: `features/affiliations/*`
- 관계 그래프 조회, 생성, 수정, 삭제: `features/relations/*`
- 창작물 목록, 상세, 생성, 수정, 삭제, 발행, 챕터 관리, 리더: `features/works/*`
- 작업실 집계 데이터: `features/workspace/data.ts`

## 추가된 Route Handler 구조

```text
src/app/api/
  affiliations/
    route.ts
    [affiliationId]/route.ts
  auth/
    signup/route.ts
  characters/
    route.ts
    [characterId]/route.ts
  relations/
    route.ts
    [relationId]/route.ts
  works/
    route.ts
    [workId]/
      route.ts
      publish/route.ts
      chapters/
        route.ts
        [chapterId]/route.ts
  workspace/
    route.ts
  worlds/
    route.ts
    [worldId]/
      route.ts
      members/
        route.ts
        [memberId]/route.ts
      invites/
        [inviteId]/route.ts
```

## 대표 변경 전/후

변경 전 예시:

```ts
// features 내부 함수 또는 Client Component에서 직접 연결된 함수
import { prisma } from "@/server/db";

export async function deleteCharactersAction(formData: FormData) {
  await prisma.character.updateMany({
    where: { id: { in: ids } },
    data: { deletedAt: new Date() },
  });
}
```

변경 후 예시:

```ts
// Client Component
await fetch("/api/characters", {
  method: "DELETE",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ characterIds: selectedIds }),
});
```

```ts
// app/api/characters/route.ts
export async function DELETE(request: Request) {
  const user = await requireUser();
  const { characterIds } = await request.json();
  await prisma.character.updateMany({
    where: { id: { in: characterIds }, world: { ownerId: user.id } },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
```

## HTTP Method 분리

- `GET`: 목록, 상세, 편집 데이터, 공유 데이터, 리더 데이터 조회
- `POST`: 생성, 초대, 발행, 챕터 추가
- `PATCH`: 수정, 권한 변경, 챕터 저장
- `DELETE`: 삭제, 공유 해제, 초대 취소

## Client Component 변경

아래 Client Component는 더 이상 `features/*/actions`를 직접 import하지 않고 브라우저 `fetch()`로 API를 호출한다.

- `src/components/affiliations/affiliation-list-manager.tsx`
- `src/components/characters/character-list-manager.tsx`
- `src/components/relations/relation-graph.tsx`
- `src/components/works/chapter-editor.tsx`
- `src/components/works/work-list-manager.tsx`
- `src/components/worlds/world-list-manager.tsx`
- `src/components/worlds/world-share-manager.tsx`

## 검증

```text
npx tsc --noEmit
```

통과.

```text
rg -n "@/server/db|prisma\\." src/features -S
```

결과 없음.

```text
rg -n "from \"@/features/.*/actions\"|from '@/features/.*/actions'" src/components -S
```

결과 없음.

```text
npm test
```

통과. 기존 Node ESM 경고(`MODULE_TYPELESS_PACKAGE_JSON`)만 출력된다.
