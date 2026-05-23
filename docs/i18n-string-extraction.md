# i18n 문자열 추출 목록

전체 값은 `messages/ko.json`과 `messages/en.json`이 단일 원본이다. 두 파일은 동일한 444개 키를 가진다.

| Namespace | 키 수 | 대상 |
| --- | ---: | --- |
| `common` | 26 | 공통 버튼, 정렬, 조회수, pagination |
| `auth` | 13 | 로그인, 회원가입, 입력 오류 |
| `home` | 4 | 홈 hero |
| `cards` | 7 | 카드 메타와 창작물 유형 |
| `entities` | 8 | 세계관, 캐릭터, 소속, 창작물 분류 label |
| `worlds` | 68 | 세계관 CRUD, 상세, 공유, form |
| `characters` | 59 | 캐릭터 CRUD, 상세, 소속 연결, form |
| `affiliations` | 51 | 소속 CRUD, 계층, 멤버, form |
| `relations` | 43 | 관계 그래프, CRUD modal, enum 표시명 |
| `works` | 82 | 창작물 CRUD, 연결 리소스, 챕터, reader |
| `workspace` | 15 | 작업실 요약과 섹션 |
| `placeholder` | 14 | 공통 목업 form/search UI |
| `markdown` | 4 | Markdown 입력 도구 |
| `drafts` | 13 | 자동 저장과 임시 저장 목록 |
| `language` | 5 | 언어 전환 접근성 문구 |
| `metadata` | 1 | 사이트 설명 |
| `nav` | 7 | header navigation |
| `explore` | 24 | 세계관/캐릭터/창작물 공개 탐색 |

## 추출 기준

- JSX text, 버튼, 제목, 설명, label.
- `placeholder`, `aria-label`, 이미지 `alt`.
- 사용자에게 표시되는 오류, 안내, modal, empty state.
- template string은 의미 있는 변수만 ICU parameter로 유지한다.

## 제외 기준

- API/URL, CSS class, id/key, enum 제출 값.
- 데이터베이스 및 목업 콘텐츠 값.
- 개발 로그, 내부 예외, 상태 코드.
- 브랜드와 로고.

## 한영 키 일치

```text
ko: 444
en: 444
onlyKo: []
onlyEn: []
```
