# 01. Error Handling

Node.js에서 에러를 처리하는 방법과 uncaughtException의 동작을 학습합니다.

## 파일 목록

| 파일 | 설명 |
|------|------|
| [uncaught-exception.js](./uncaught-exception.js) | uncaughtException vs try-catch 비교 데모 서버 |

## 핵심 개념

- `setTimeout` 콜백 안의 `throw`는 외부 `try-catch`로 잡을 수 없다
- `process.on('uncaughtException')`으로 전역 안전망을 만들 수 있지만, 상태 오염 위험이 있다
- 실무에서는 로그를 남기고 `process.exit(1)` 후 프로세스 매니저(PM2 등)가 재시작하도록 한다

## 실행

```bash
node uncaught-exception.js

# 테스트
curl http://localhost:3000/health
curl http://localhost:3000/safe
curl http://localhost:3000/crash
```
