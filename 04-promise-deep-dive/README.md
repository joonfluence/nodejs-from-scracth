# 04. Promise Deep Dive

Promise 체이닝의 내부 동작, async/await의 본질, 실무 패턴(타임아웃, 부분 실패 허용)을 파고듭니다.

## 파일 목록

| 파일 | 핵심 교훈 |
|------|-----------|
| [promise-chain-error.js](./promise-chain-error.js) | then은 새 Promise를 반환하고, catch 없으면 에러가 process까지 버블링 |
| [async-await-internals.js](./async-await-internals.js) | await는 함수 실행을 마이크로태스크로 분할한다 |
| [promise-timeout.js](./promise-timeout.js) | `Promise.race`로 타임아웃 구현, 진(lose) Promise는 취소되지 않는다 |
| [promise-allsettled.js](./promise-allsettled.js) | `Promise.all` vs `Promise.allSettled` — 부분 실패 허용 패턴 |

## 핵심 개념

- `then()`은 항상 새로운 Promise를 반환하므로 체이닝이 가능하다
- `await`를 만나면 함수의 나머지 부분이 마이크로태스크로 스케줄되고 메인 스레드를 양보한다
- `Promise.race`에서 진 Promise는 취소되지 않는다 (실무에서는 AbortController 필요)
- `Promise.all`은 All or Nothing, `Promise.allSettled`는 부분 성공 허용

## 실행

```bash
node promise-chain-error.js
node async-await-internals.js
node promise-timeout.js
node promise-allsettled.js
```
