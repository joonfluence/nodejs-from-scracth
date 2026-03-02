# Node.js Study

Node.js 핵심 개념을 주제별로 정리하는 학습 저장소입니다.

## 목차

| # | 주제 | 설명 |
|---|------|------|
| 01 | [Error Handling](./01-error-handling) | uncaughtException, Promise 에러 전파 |
| 02 | [Event Loop](./02-event-loop) | 블로킹, 동기 vs 비동기 I/O, 동시 요청 처리 |
| 03 | [Async Patterns](./03-async-patterns) | 순차 vs 병렬, 싱글톤 상태 오염 |
| 04 | [Promise Deep Dive](./04-promise-deep-dive) | 체이닝 내부 동작, 타임아웃, allSettled |
| 05 | [Concurrency Control](./05-concurrency-control) | Race Condition, 데이터 정합성 |
| 06 | [V8 Memory](./06-v8-memory) | 힙 구조, GC, 메모리 누수 패턴과 진단 |
| 07 | [TypeScript Advanced](./07-typescript-advanced) | 구조적 타이핑, Conditional Types, infer |

## 학습 자료 뷰어

주간 학습 내용을 정리한 React 앱입니다.

```bash
cd docs
npm install
npm run dev
```

## 실행 방법

```bash
node 01-error-handling/uncaught-exception.js
node 02-event-loop/blocking-test.js
node 03-async-patterns/parallel-test.js
node 04-promise-deep-dive/promise-timeout.js
node 05-concurrency-control/race-condition.js
node --expose-gc 06-v8-memory/heap-structure.js
node --trace-gc 06-v8-memory/gc-monitor.js
```
