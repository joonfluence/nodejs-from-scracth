# 01. Error Handling

Node.js의 에러 처리, 블로킹, 비동기 패턴을 직접 부딪혀보며 학습합니다.

## 파일 목록

| # | 파일 | 핵심 교훈 |
|---|------|-----------|
| 1 | [uncaught-exception.js](./uncaught-exception.js) | uncaughtException vs try-catch 비교 |
| 2 | [blocking-test.js](./blocking-test.js) | 메인 스레드 막으면 전체가 멈춘다 |
| 3 | [file-test.js](./file-test.js) | `readFileSync` vs `readFile` — 서버에서 Sync 쓰면 안 되는 이유 |
| 4 | [parallel-test.js](./parallel-test.js) | 순차 3초 vs `Promise.all` 1초 |
| 5 | [error-test.js](./error-test.js) | `await` 빠뜨리면 에러가 조용히 사라진다 |
| 6 | [singleton-test.js](./singleton-test.js) | 싱글톤 서비스에 mutable 상태 두면 요청이 섞인다 |

## 실행 방법

```bash
# 서버형 실습 (1, 2, 3, 6번)
node blocking-test.js
# 다른 터미널에서 curl로 테스트

# 스크립트형 실습 (4, 5번)
node parallel-test.js
node error-test.js
```

## 핵심 개념

- `setTimeout` 콜백 안의 `throw`는 외부 `try-catch`로 잡을 수 없다
- `process.on('uncaughtException')`으로 전역 안전망을 만들 수 있지만, 상태 오염 위험이 있다
- 실무에서는 로그를 남기고 `process.exit(1)` 후 프로세스 매니저(PM2 등)가 재시작하도록 한다
- CPU-intensive 동기 작업은 메인 스레드를 블로킹하여 모든 요청을 멈춘다
- 독립적인 비동기 작업은 `Promise.all`로 병렬 처리해야 한다
- `async` 함수 호출 시 `await`을 빠뜨리면 에러가 `unhandledRejection`으로 빠진다
- 싱글톤 서비스에 요청별 데이터를 mutable 속성으로 저장하면 동시 요청 시 상태가 오염된다
