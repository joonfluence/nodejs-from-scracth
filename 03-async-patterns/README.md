# 03. Async Patterns

비동기 패턴의 실전 함정 — 순차 vs 병렬 실행, 싱글톤 공유 상태 오염을 체험합니다.

## 파일 목록

| 파일 | 핵심 교훈 |
|------|-----------|
| [parallel-test.js](./parallel-test.js) | 순차 3초 vs `Promise.all` 1초 — 독립 작업은 병렬로 |
| [singleton-test.js](./singleton-test.js) | 싱글톤 서비스에 mutable 상태 두면 동시 요청 시 데이터가 섞인다 |

## 핵심 개념

- 서로 의존하지 않는 비동기 작업은 `Promise.all`로 병렬 처리해야 한다
- 싱글톤 서비스(NestJS 등)에 요청별 데이터를 인스턴스 속성으로 저장하면 동시 요청 시 상태가 오염된다
- 요청별 데이터는 반드시 함수 인자 또는 지역 변수로 관리해야 한다

## 실행

```bash
# 순차 vs 병렬 비교 (바로 결과 확인)
node parallel-test.js

# 싱글톤 상태 오염 (터미널 2개에서 동시 curl)
node singleton-test.js
# 터미널 1: curl http://localhost:3000/order-A
# 터미널 2: curl http://localhost:3000/order-B  ← 거의 동시에!
```
