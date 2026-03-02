# 06. V8 Memory

V8 힙 구조, GC 동작, 메모리 누수 패턴과 진단 방법을 학습합니다.

## 파일 목록

| 파일 | 핵심 교훈 |
|------|-----------|
| [heap-structure.js](./heap-structure.js) | V8 힙 구조 확인, New Space → Old Space 승격, 수동 GC |
| [memory-leak.js](./memory-leak.js) | 전역 캐시 / 타이머 미해제 / 클로저 — 3대 누수 패턴 |
| [gc-monitor.js](./gc-monitor.js) | 실시간 GC 모니터링 서버, /leak vs /clean 비교 |

## 핵심 개념

- V8 힙은 New Space(Young Gen) → Old Space(Old Gen)로 나뉜다
- 새 객체는 New Space에 생성, 살아남으면 Old Space로 승격
- Minor GC(Scavenge): New Space 대상, 빠르고 자주 발생
- Major GC(Mark-Sweep-Compact): Old Space 대상, 느리고 Stop-the-World 발생
- `--max-old-space-size`로 힙 크기 제한 가능

## 실행

```bash
# 힙 구조 확인
node heap-structure.js

# 수동 GC 포함
node --expose-gc heap-structure.js

# 누수 패턴 관찰
node memory-leak.js

# GC 로그와 함께 서버 실행
node --trace-gc gc-monitor.js
# curl http://localhost:3000/leak   ← 반복 호출 후
# curl http://localhost:3000/       ← 메모리 증가 확인

# 힙 스냅샷 진단
node --inspect memory-leak.js
# → Chrome DevTools (chrome://inspect) → Memory → Heap Snapshot
```
