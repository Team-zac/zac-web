# next-intl i18n Plan

## 목표

App Router 프로젝트에 `next-intl`을 적용하고 `NEXT_LOCALE` 쿠키로 `ko`, `en` 언어를 전환한다.

## 설정 파일

- `next.config.ts`: `next-intl/plugin` 연결
- `src/i18n/routing.ts`: 지원 locale, 기본 locale, locale cookie 설정
- `src/i18n/request.ts`: 쿠키 기반 locale 판별 및 메시지 로드
- `src/i18n/navigation.ts`: next-intl navigation 헬퍼
- `messages/ko.json`, `messages/en.json`: 번역 메시지
- `src/app/api/locale/route.ts`: locale cookie 갱신 API

## 적용 순서

1. `next-intl` 설치 및 플러그인 설정
2. 메시지 파일 생성
3. Root Layout에 `NextIntlClientProvider` 적용
4. Header에 언어 전환 UI 추가
5. 현재 주요 탐색 화면부터 하드코딩 문자열을 번역 키로 교체
6. TypeScript 검증

## 문자열 추출 기준

`src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/components/**/*.tsx`에서 한국어가 포함된 JSX 텍스트, 문자열 literal, placeholder, aria-label을 대상으로 한다.
