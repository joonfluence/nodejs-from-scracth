# 01. Error Handling

Node.js에서 에러를 처리하는 방법과 에러가 전파되는 구조를 학습합니다.

## 파일 목록

| 파일 | 핵심 교훈 |
|------|-----------|
| [uncaught-exception.js](./uncaught-exception.js) | `setTimeout` 콜백의 throw → uncaughtException, try-catch로 잡을 수 없는 이유 |
| [error-test.js](./error-test.js) | `await` 빠뜨리면 Promise 에러가 조용히 사라진다 |

## 핵심 개념

- `setTimeout` 콜백 안의 `throw`는 외부 `try-catch`로 잡을 수 없다
- `process.on('uncaughtException')`으로 전역 안전망을 만들 수 있지만, 상태 오염 위험이 있다
- 실무에서는 로그를 남기고 `process.exit(1)` 후 프로세스 매니저(PM2 등)가 재시작하도록 한다
- `async` 함수 호출 시 `await`을 빠뜨리면 에러가 `unhandledRejection`으로 빠진다

## 실행

```bash
# uncaughtException 데모 서버
node uncaught-exception.js
curl http://localhost:3000/health
curl http://localhost:3000/safe
curl http://localhost:3000/crash

# Promise 에러 패턴
node error-test.js
```
