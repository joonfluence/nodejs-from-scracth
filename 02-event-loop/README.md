# 02. Event Loop

싱글 스레드 이벤트 루프에서 블로킹이 왜 치명적인지, 동기 vs 비동기 I/O 차이를 체감합니다.

## 파일 목록

| 파일 | 핵심 교훈 |
|------|-----------|
| [blocking-test.js](./blocking-test.js) | CPU 블로킹이 모든 요청을 멈추는 현상 |
| [file-test.js](./file-test.js) | `readFileSync` vs `readFile` — 서버에서 Sync 함수를 쓰면 안 되는 이유 |
| [concurrent-request.js](./concurrent-request.js) | 싱글 스레드인데 동시 요청이 처리되는 원리 |

## 핵심 개념

- Node.js는 싱글 스레드이므로 CPU-intensive 동기 작업이 메인 스레드를 점유하면 전체 요청이 대기한다
- 비동기 I/O(`readFile`)는 libuv 스레드풀에서 처리되므로 메인 스레드를 블로킹하지 않는다
- 서버 코드에서 `*Sync` 계열 함수는 절대 쓰면 안 된다 (앱 초기화 시점은 예외)

## 실행

```bash
# 블로킹 테스트 (터미널 2개 필요)
node blocking-test.js
# 터미널 1: curl http://localhost:3000/heavy
# 터미널 2: curl http://localhost:3000/hello  ← /heavy 끝날 때까지 대기됨

# 동기 vs 비동기 파일 읽기
node file-test.js
# curl http://localhost:3000/sync
# curl http://localhost:3000/async

# 동시 요청 처리 확인 (브라우저 탭 3개로 동시 접속)
node concurrent-request.js
# → 3개 모두 거의 동시에 3초 후 응답
```
