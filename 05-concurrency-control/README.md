# 05. Concurrency Control

싱글 스레드 Node.js에서도 논리적 Race Condition이 발생하는 원리와 해결 전략을 학습합니다.

## 파일 목록

| 파일 | 핵심 교훈 |
|------|-----------|
| [race-condition.js](./race-condition.js) | await 사이에 다른 요청이 끼어들어 데이터 정합성이 깨지는 현상 |

## 핵심 개념

- 싱글 스레드여도 '조회'와 '수정' 사이에 `await`가 있으면 다른 요청이 끼어들 수 있다
- Java의 `synchronized`/`Lock` 같은 언어 레벨 도구가 없으므로 별도 전략이 필요하다
- 해결 방법:
  - DB 레벨: `SELECT FOR UPDATE` (비관적 락), Optimistic Lock (버전 필드)
  - Application 레벨: 작업 큐(BullMQ), 뮤텍스 패턴
  - 조회와 수정을 하나의 원자적 연산으로 만들기 (`UPDATE WHERE balance >= amount`)

## 실행

```bash
node race-condition.js
# → 잔액 100에서 80원 출금 2번 → 마이너스 잔액 발생!
```
