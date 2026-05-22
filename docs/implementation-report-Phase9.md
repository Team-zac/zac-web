# Phase 9 구현 보고서

## 1. 구현 요약

Phase 9에서는 MVP 완료 기준에 맞춰 성능 최적화와 품질 검증 기반을 보강했다. 신규 화면을 추가하기보다 기존 세계관/캐릭터/창작물/관계도/리더 흐름의 데이터 로딩량, 페이지네이션, 테스트 가능성, 인덱스 구성을 정리했다.

## 2. 구현 내용

### 2.1 공통 품질 유틸

- `src/lib/tags.ts` 추가
  - 세계관, 캐릭터, 창작물 입력에서 흩어져 있던 태그 정규화 규칙을 공통화
  - `#` prefix 제거, 공백/쉼표 분리, 중복 제거, `ko-KR` lower-case 정규화, limit 적용
- `src/lib/pagination.ts` 추가
  - `DEFAULT_PAGE_SIZE = 15`
  - page 값 정규화, offset 계산, pageCount 계산 공통화
- `src/lib/roles.ts` 추가
  - DB 없이 테스트 가능한 `canEditWorldRole`, `canAdminWorldRole` 분리
  - 서버 권한 유틸과 관계 그래프 편집 가능 판정에서 같은 규칙 재사용

### 2.2 페이지네이션 보강

- 공개 탐색 목록은 기존 15개 페이지네이션 구조를 `DEFAULT_PAGE_SIZE` 기준으로 통일
  - `getPublicWorlds`
  - `getPublicCharacters`
  - `getPublicWorks`
- 내 리소스 목록도 서버 페이지네이션으로 변경
  - `/worlds?page=`
  - `/characters?page=`
  - `/works?page=`
- `src/components/ui/pagination.tsx`를 실제 `Link` 기반 페이지 이동 컴포넌트로 개선
  - 이전/다음 비활성 상태
  - 현재 페이지 `aria-current="page"`
  - 긴 페이지 범위 ellipsis 처리

### 2.3 장문 창작물 리더 최적화

- 기존 리더는 모든 챕터 본문을 한 번에 로드한 뒤 클라이언트 hash로 전환했다.
- `getWorkReaderData(workId, chapter)`가 챕터 목록 메타데이터와 현재 챕터 본문만 가져오도록 변경했다.
- 챕터 이동 URL을 `?chapter={number}#chapter-{number}`로 변경해 서버에서 선택 챕터를 알 수 있게 했다.
- 기존 `#chapter-{number}`로 접근하는 경우 클라이언트에서 query URL로 보정한다.

### 2.4 DB 인덱스 보강

Prisma schema에 주요 조회 경로 기준 복합 인덱스를 추가했다.

- `CharacterAffiliation`
  - `@@index([worldId, characterId, isPrimary])`
  - 대표 소속 조회 최적화 목적
- `CharacterRelation`
  - `@@index([worldId, deletedAt, updatedAt])`
  - 관계 그래프 조회 최적화 목적
- `Work`
  - `@@index([visibility, publishStatus, viewCount, updatedAt])`
  - 공개 창작물 인기순/최신순 탐색 최적화 목적
- `WorkChapter`
  - `@@index([workId, deletedAt, number])`
  - 리더의 선택 챕터 본문 조회 최적화 목적
- `prisma/migrations/000002_phase9_indexes/manual.sql`
  - 위 인덱스를 실제 PostgreSQL에 적용할 수 있는 `CREATE INDEX IF NOT EXISTS` SQL 추가

### 2.5 테스트 스위트

- `npm test` 스크립트 추가
  - Node 기본 테스트 러너 사용
  - 추가 의존성 없음
- `tests/phase9.test.mts` 추가
  - 태그 파싱 단위 테스트
  - 페이지네이션 계산 단위 테스트
  - 권한 역할 판정 단위 테스트

## 3. 품질 검증 결과

| 검증 | 결과 | 비고 |
| --- | --- | --- |
| `npm test` | 성공 | 4개 테스트 통과. Node가 TypeScript 소스 import에 대해 `MODULE_TYPELESS_PACKAGE_JSON` 경고를 출력하지만 실패는 아님 |
| `npm run prisma:validate` | 성공 | Phase 9 인덱스 추가 후 Prisma schema valid |
| `npx tsc --noEmit` | 성공 | Phase 9 변경 및 기존 타입 오류 보정 후 통과 |
| localhost 화면 접근 | 미완료 | 포트 리슨은 확인됐지만 이 셸에서 `localhost:3000`/`127.0.0.1:3000` HTTP 연결이 거부됨 |

## 4. 성능 점검 결과

- 공개 세계관/캐릭터/창작물 탐색은 모두 15개 단위 페이지네이션을 유지한다.
- 내 세계관/캐릭터/창작물 목록은 전체 로드에서 15개 단위 서버 페이지네이션으로 변경했다.
- 관계 그래프 데이터는 기존처럼 캐릭터 100개, 관계 300개 상한을 유지하며, 관계 조회용 복합 인덱스를 추가했다.
- 창작물 리더는 현재 챕터 본문만 로드하도록 변경해 장문 작품의 초기 응답 크기를 줄였다.
- 주요 목록 카드는 기존 공통 카드 컴포넌트를 그대로 사용해 반응형 그리드 동작을 유지한다.

## 5. MVP 완료 체크리스트

| 항목 | 상태 |
| --- | --- |
| 회원가입, 로그인, 로그아웃 | 완료 |
| 세계관 CRUD와 공유 관리 | 완료 |
| 캐릭터 CRUD와 대표 소속 | 완료 |
| 소속 CRUD와 캐릭터-소속 연결 | 완료 |
| 관계 그래프 조회/생성/수정/삭제 | 완료 |
| 창작물/챕터 CRUD와 리더 | 완료 |
| 공개 세계관/캐릭터/창작물 탐색 | 완료 |
| 비공개/공유 리소스 권한 필터 | Phase 8에서 보강 완료 |
| 공개 탐색 페이지네이션 15개 | 완료 |
| 내 리소스 목록 페이지네이션 15개 | Phase 9에서 완료 |
| 태그 정규화 저장 | Phase 9에서 공통화 완료 |
| 테스트 스위트 | Phase 9에서 기본 단위 테스트 추가 |

## 6. 남은 리스크

- `npm test`는 Node strip-types 경로로 TypeScript 소스를 직접 import하므로 경고가 남는다. 필요하면 이후 Vitest 도입 또는 package ESM 전환으로 경고를 제거할 수 있다.
- Prisma schema 인덱스와 수동 migration SQL을 함께 추가했다. 실제 DB에는 프로젝트의 마이그레이션 적용 절차에 따라 반영해야 한다.
- 이 실행 환경에서는 localhost HTTP 접근이 거부되어 실제 브라우저 반응형 검증은 사용자의 in-app browser에서 추가 확인이 필요하다.
