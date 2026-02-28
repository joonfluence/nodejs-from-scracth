import { useState } from "react";

const days = [
  {
    day: "Day 1 (월)",
    title: "Node.js 아키텍처 전체 그림",
    emoji: "🏗️",
    sections: [
      {
        heading: "핵심 질문",
        content: `"Node.js는 싱글 스레드인데 어떻게 수천 개의 동시 요청을 처리할까?"`
      },
      {
        heading: "Node.js의 3가지 핵심 구성요소",
        content: `**1. V8 엔진 (Google)**
→ JavaScript 코드를 머신 코드로 컴파일하고 실행
→ 메모리 관리(힙), GC 담당
→ 브라우저의 Chrome에서 쓰는 것과 동일한 엔진

**2. libuv (C 라이브러리)**
→ 이벤트 루프를 구현
→ 비동기 I/O를 OS 커널에 위임 (epoll, kqueue, IOCP)
→ 커널이 지원 안 하는 작업은 스레드 풀(기본 4개)에서 처리
→ 파일 시스템, DNS lookup, 일부 crypto 등

**3. Node.js Bindings + Core Modules**
→ V8과 libuv를 연결하는 C++ 바인딩
→ fs, http, net 등의 코어 모듈 제공`
      },
      {
        heading: "아키텍처 다이어그램",
        content: `┌─────────────────────────────────────────┐
│            Your JavaScript Code          │
├─────────────────────────────────────────┤
│          Node.js Bindings (C++)          │
├──────────────────┬──────────────────────┤
│    V8 Engine     │       libuv          │
│  (JS 실행/컴파일)  │  (이벤트루프/비동기I/O)  │
│  (메모리/GC)      │  (스레드풀 4개)        │
├──────────────────┴──────────────────────┤
│          Operating System (커널)          │
│    epoll(Linux) / kqueue(Mac) / IOCP    │
└─────────────────────────────────────────┘`
      },
      {
        heading: "싱글 스레드의 진짜 의미",
        content: `흔한 오해: "Node.js는 스레드가 1개다"
정확한 표현: "JavaScript 코드를 실행하는 메인 스레드가 1개다"

실제로는:
- 메인 스레드 1개: JS 코드 실행, 이벤트 루프 실행
- libuv 스레드 풀: 기본 4개 (UV_THREADPOOL_SIZE로 조절, 최대 1024)
- V8 내부 스레드: GC, JIT 컴파일 등
- OS 커널 스레드: 네트워크 I/O 등

즉, 싱글 스레드인 것은 "당신의 코드"뿐이고,
I/O 작업은 OS 커널이나 libuv 스레드 풀이 병렬로 처리합니다.`
      },
      {
        heading: "Java와의 핵심 차이",
        content: `┌─────────────────┬──────────────────────┐
│     Java         │      Node.js         │
├─────────────────┼──────────────────────┤
│ 요청당 스레드 할당   │ 모든 요청을 1개 스레드로  │
│ 스레드 블로킹 OK    │ 블로킹 = 전체 서버 멈춤  │
│ 동시성 = 멀티스레드   │ 동시성 = 이벤트 루프     │
│ Race Condition    │ JS 레벨 Race 없음      │
│   자주 발생        │ (DB 레벨에서는 발생)     │
│ 컨텍스트 스위칭 비용  │ 컨텍스트 스위칭 없음      │
│ 메모리 많이 사용     │ 메모리 효율적           │
│ CPU 집약 작업 유리   │ I/O 집약 작업 유리      │
└─────────────────┴──────────────────────┘

Spring (Tomcat 기본):
- 기본 스레드 풀 200개
- 요청 201번째부터는 큐에서 대기
- 각 스레드가 독립적으로 요청 처리

Node.js:
- 메인 스레드 1개가 모든 요청을 받음
- I/O 작업은 커널에 위임하고 다음 요청 처리
- I/O 완료되면 콜백으로 결과 처리`
      },
      {
        heading: "✅ 실습",
        content: `1. V8 옵션 확인:
   node --v8-options | head -30

2. 동시 요청 처리 확인 - 아래 코드를 실행하고 브라우저 탭 3개로 동시 접속:

const http = require('http');

const server = http.createServer((req, res) => {
  console.log(\`요청 받음: \${new Date().toISOString()}\`);
  
  setTimeout(() => {
    res.end(\`응답: \${new Date().toISOString()}\`);
  }, 3000);
});

server.listen(3000, () => console.log('서버 시작'));

3. process 정보 확인:
   console.log('PID:', process.pid);
   console.log('메모리:', process.memoryUsage());
   console.log('V8 힙:', require('v8').getHeapStatistics());`
      }
    ]
  },
  {
    day: "Day 2 (화)",
    title: "이벤트 루프 6단계 깊이 파기",
    emoji: "🔄",
    sections: [
      {
        heading: "핵심 질문",
        content: `"setTimeout(fn, 0)이 왜 즉시 실행되지 않을까?"
"setImmediate와 setTimeout(0)은 뭐가 다를까?"
"process.nextTick은 왜 '다음 틱'인데 가장 먼저 실행될까?"`
      },
      {
        heading: "이벤트 루프 6 Phase 다이어그램",
        content: `   ┌───────────────────────────┐
┌─▶│         Timers            │ ← setTimeout, setInterval 콜백
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │     Pending Callbacks     │ ← 이전 루프에서 지연된 I/O 콜백
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │       Idle, Prepare       │ ← 내부용 (무시해도 됨)
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │           Poll            │ ← ★ 핵심! I/O 콜백 실행
│  │                           │    새 I/O 이벤트 대기
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │          Check            │ ← setImmediate 콜백
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │      Close Callbacks      │ ← socket.on('close') 등
│  └─────────────┬─────────────┘
└────────────────┘

⚡ 매 Phase 사이사이에 마이크로태스크 실행:
   process.nextTick 큐 → Promise 큐 (microtask)`
      },
      {
        heading: "각 Phase 상세 설명",
        content: `**1. Timers Phase**
- setTimeout(), setInterval()의 콜백을 실행
- "최소 지연 시간"이 지난 콜백만 실행
- setTimeout(fn, 0)은 실제로 최소 1ms 지연
- 여기서 실행할 타이머가 없으면 다음 Phase로

**2. Pending Callbacks Phase**
- 이전 이벤트 루프 사이클에서 지연된 I/O 콜백
- TCP 에러 콜백 등 시스템 수준 콜백
- 실무에서 직접 신경 쓸 일은 거의 없음

**3. Idle, Prepare Phase**
- Node.js 내부에서만 사용
- 개발자가 직접 사용할 수 없음

**4. Poll Phase ★ 가장 중요**
- 새로운 I/O 이벤트를 가져와서 콜백 실행
- fs.readFile, http 응답, DB 쿼리 결과 등
- 실행할 콜백이 있으면: 모두 실행
- 실행할 콜백이 없으면:
  ├─ setImmediate가 있으면 → Check Phase로 이동
  └─ setImmediate가 없으면 → 새 I/O 이벤트 대기 (여기서 블로킹)
- 대기 중에 Timer가 만료되면 → Timers Phase로 돌아감

**5. Check Phase**
- setImmediate() 콜백을 실행
- Poll Phase 직후에 실행되므로 I/O 콜백 안에서
  setImmediate는 setTimeout(0)보다 항상 먼저 실행

**6. Close Callbacks Phase**
- socket.on('close'), server.on('close') 등
- 정리(cleanup) 작업`
      },
      {
        heading: "마이크로태스크: Phase 사이의 VIP",
        content: `마이크로태스크는 매 Phase가 끝날 때마다 실행됩니다.
(정확히는 매 Phase 전환 시 + 각 콜백 실행 후)

우선순위:
1. process.nextTick 큐 (가장 높음)
2. Promise 큐 (then, catch, finally)
3. 현재 Phase의 다음 콜백 또는 다음 Phase

이것이 중요한 이유:
- nextTick이 재귀적으로 호출되면 다른 Phase로 안 넘어감
- = I/O starvation (I/O 콜백이 영원히 실행 안 됨)
- 그래서 실무에서는 nextTick보다 setImmediate를 권장`
      },
      {
        heading: "setTimeout(0) vs setImmediate: 상황별 동작",
        content: `**케이스 1: 메인 모듈에서 (I/O 콜백 바깥)**

setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

→ 순서가 보장되지 않음! (실행마다 달라질 수 있음)
→ 이유: setTimeout(0)의 실제 지연은 시스템 클럭 해상도에 의존
   1ms보다 빨리 루프가 Timers Phase에 도달하면 → immediate 먼저
   1ms 이후에 도달하면 → timeout 먼저

**케이스 2: I/O 콜백 안에서**

const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});

→ 항상 immediate가 먼저!
→ 이유: I/O 콜백은 Poll Phase에서 실행됨
   Poll Phase 다음은 Check Phase (setImmediate)
   Timers Phase는 한 바퀴 돌아야 함`
      },
      {
        heading: "✅ 실습: 실행 순서 예측 퀴즈",
        content: `아래 코드의 실행 순서를 먼저 예측한 뒤 실행해서 확인하세요.

// 퀴즈 1: 기본
console.log('1: sync');
setTimeout(() => console.log('2: timeout'), 0);
setImmediate(() => console.log('3: immediate'));
process.nextTick(() => console.log('4: nextTick'));
Promise.resolve().then(() => console.log('5: promise'));
console.log('6: sync end');

// 정답: 1 → 6 → 4 → 5 → 2 or 3 (순서 불확정) → 3 or 2

// 퀴즈 2: I/O 콜백 안에서
const fs = require('fs');
fs.readFile(__filename, () => {
  console.log('A: I/O callback');
  setTimeout(() => console.log('B: timeout'), 0);
  setImmediate(() => console.log('C: immediate'));
  process.nextTick(() => console.log('D: nextTick'));
  Promise.resolve().then(() => console.log('E: promise'));
});

// 정답: A → D → E → C → B

// 퀴즈 3: 중첩
setImmediate(() => {
  console.log('immediate 1');
  process.nextTick(() => console.log('nextTick inside immediate'));
});
setImmediate(() => {
  console.log('immediate 2');
});

// 정답: immediate 1 → nextTick inside immediate → immediate 2`
      }
    ]
  },
  {
    day: "Day 3 (수)",
    title: "블로킹이 왜 치명적인가",
    emoji: "🚨",
    sections: [
      {
        heading: "핵심 질문",
        content: `"Node.js 서버에서 for 루프로 피보나치를 계산하면 무슨 일이 일어날까?"
"왜 Java에서는 괜찮은 동기 작업이 Node.js에서는 서버를 죽일까?"`
      },
      {
        heading: "블로킹의 영향: Java vs Node.js",
        content: `**Java (Spring / Tomcat)**
- 스레드 200개 중 1개가 블로킹됨
- 나머지 199개는 정상 동작
- 영향 범위: 해당 요청 1개만 느림
- 스레드 풀이 고갈되면 전체 영향

**Node.js**
- 메인 스레드 1개가 블로킹됨
- = 이벤트 루프가 멈춤
- = 모든 요청이 대기
- 영향 범위: 전체 서버의 모든 요청

비유:
Java = 은행 창구 200개. 1개 창구가 막혀도 나머지 진행.
Node = 은행 창구 1개. 이 창구가 막히면 뒤에 줄 선 모든 사람이 대기.
(대신 Node의 1개 창구는 엄청나게 빠르고 효율적)`
      },
      {
        heading: "블로킹이 발생하는 대표적 상황들",
        content: `**1. CPU 집약 작업 (가장 위험)**
- JSON 파싱 대용량 데이터
- 이미지/비디오 처리
- 암호화/해싱 (동기 버전)
- 복잡한 정규표현식
- 대규모 배열 정렬/연산

**2. 동기 I/O API 사용**
- fs.readFileSync()
- fs.writeFileSync()
- child_process.execSync()
- crypto.pbkdf2Sync()
→ 이런 Sync 접미사가 붙은 함수는 서버에서 절대 쓰면 안 됨
  (초기화 코드에서만 예외적으로 OK)

**3. 의외의 블로킹 요소**
- console.log() 대량 호출 (stdout도 I/O!)
- 거대한 JSON.stringify() / JSON.parse()
- 큰 Buffer 할당`
      },
      {
        heading: "libuv 스레드 풀의 역할",
        content: `커널이 비동기로 처리할 수 없는 작업 → libuv 스레드 풀에서 실행

스레드 풀을 사용하는 작업:
- fs 모듈의 거의 모든 작업
- dns.lookup() (dns.resolve()는 커널 비동기 사용)
- crypto.pbkdf2(), crypto.randomBytes() 등의 비동기 버전
- zlib 압축/해제

기본 4개 스레드의 의미:
- 동시에 4개의 fs.readFile()만 병렬로 실행 가능
- 5번째 요청은 앞의 하나가 끝나야 시작
- UV_THREADPOOL_SIZE=16 으로 늘릴 수 있음 (최대 1024)

커널에서 직접 비동기 처리하는 작업:
- TCP/UDP 소켓 (http, net 모듈)
- 파이프
- DNS resolve (dns.resolve())
→ 이것들은 스레드 풀을 안 거치므로 훨씬 효율적`
      },
      {
        heading: "해결 전략",
        content: `**전략 1: Worker Threads (Node.js 내장)**
const { Worker, isMainThread, parentPort } = require('worker_threads');

// 메인 스레드:
const worker = new Worker('./worker.js');
worker.postMessage({ n: 45 });
worker.on('message', (result) => console.log(result));

// 워커(worker.js):
parentPort.on('message', ({ n }) => {
  const result = fibonacci(n);
  parentPort.postMessage(result);
});

**전략 2: Child Process**
const { fork } = require('child_process');
const child = fork('./heavy-task.js');
child.send({ data: bigData });
child.on('message', (result) => { /* ... */ });

**전략 3: 작업 분할 (Chunking)**
function processChunk(arr, index, chunkSize, cb) {
  const end = Math.min(index + chunkSize, arr.length);
  for (let i = index; i < end; i++) { /* 처리 */ }
  if (end < arr.length) {
    setImmediate(() => processChunk(arr, end, chunkSize, cb));
  } else {
    cb();
  }
}

**전략 4: 외부 서비스로 위임**
- 이미지 처리 → Sharp (C++ 네이티브)
- 영상 처리 → FFmpeg 프로세스
- ML 추론 → 별도 Python 서비스
- 메시지 큐(Bull/BullMQ)로 비동기 처리`
      },
      {
        heading: "✅ 실습: 블로킹 체감하기",
        content: `const http = require('http');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const server = http.createServer((req, res) => {
  if (req.url === '/heavy') {
    const start = Date.now();
    const result = fibonacci(42);
    res.end(\`fib(42) = \${result}, 소요: \${Date.now() - start}ms\`);
  } else {
    res.end('Hello! ' + new Date().toISOString());
  }
});

server.listen(3000);

// 테스트:
// 1. curl http://localhost:3000/  → 즉시 응답
// 2. curl http://localhost:3000/heavy  → 2~3초 걸림
// 3. /heavy 요청 중에 curl http://localhost:3000/
//    → /heavy가 끝날 때까지 이것도 대기함!`
      }
    ]
  },
  {
    day: "Day 4 (목)",
    title: "setTimeout(0) vs setImmediate vs nextTick 완전 정복",
    emoji: "⏱️",
    sections: [
      {
        heading: "핵심 질문",
        content: `"세 가지 모두 '나중에 실행해줘'인데 뭐가 다를까?"
"실무에서는 어떤 걸 써야 할까?"
"nextTick의 재귀 호출이 왜 위험할까?"`
      },
      {
        heading: "실행 타이밍 비교표",
        content: `┌──────────────────┬────────────────────────────────┐
│ API              │ 실행 시점                        │
├──────────────────┼────────────────────────────────┤
│ process.nextTick │ 현재 작업 완료 직후,              │
│                  │ 이벤트 루프 Phase 전환 전          │
│                  │ (= 가장 빠름)                    │
├──────────────────┼────────────────────────────────┤
│ Promise.then     │ nextTick 큐 비운 후,             │
│ queueMicrotask   │ 이벤트 루프 Phase 전환 전          │
│                  │ (= 두 번째로 빠름)                │
├──────────────────┼────────────────────────────────┤
│ setTimeout(f, 0) │ Timers Phase에서 실행            │
│                  │ (최소 1ms 지연)                   │
├──────────────────┼────────────────────────────────┤
│ setImmediate     │ Check Phase에서 실행             │
│                  │ (Poll Phase 직후)                │
└──────────────────┴────────────────────────────────┘

실행 순서 (동일 컨텍스트 내):
process.nextTick > Promise.then > setTimeout(0) ≈ setImmediate`
      },
      {
        heading: "process.nextTick 깊이 파기",
        content: `**동작 원리:**
- 자체 큐를 가짐 (nextTick 큐)
- 이벤트 루프의 어떤 Phase에도 속하지 않음
- 매 Phase 전환 시 + 매 콜백 실행 후 nextTick 큐를 비움
- nextTick 큐가 빌 때까지 다음 Phase로 안 넘어감

**왜 존재하는가:**
- 이벤트가 발생하기 전에 핸들러가 등록되도록 보장
- 동기 코드 이후, 하지만 I/O 전에 실행되어야 할 때
- Node.js 내부에서 많이 사용 (EventEmitter 등)

**실제 사용 사례: EventEmitter**
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {
  constructor() {
    super();
    // this.emit('ready'); ← 리스너 등록 전에 emit → 못 잡음
    process.nextTick(() => this.emit('ready')); // ← 정상
  }
}
const emitter = new MyEmitter();
emitter.on('ready', () => console.log('준비 완료!'));

**⚠️ 위험: I/O Starvation**
function recursiveNextTick() {
  process.nextTick(() => {
    console.log('nextTick');
    recursiveNextTick();
  });
}
recursiveNextTick();
setTimeout(() => console.log('이건 영원히 실행 안 됨'), 0);`
      },
      {
        heading: "queueMicrotask vs process.nextTick",
        content: `**queueMicrotask (ES 표준)**
- 브라우저와 Node.js 모두에서 동작
- Promise.then과 같은 마이크로태스크 큐
- nextTick보다 늦게 실행

**process.nextTick (Node.js 전용)**
- Node.js에서만 동작
- 별도의 nextTick 큐 (마이크로태스크 큐보다 우선)
- 더 빠르지만 브라우저 호환성 없음

실무 가이드:
- 라이브러리 개발 → queueMicrotask (호환성)
- Node.js 서버 전용 → 둘 다 OK, 하지만 대부분 setImmediate가 더 안전
- 대부분의 경우 → 그냥 async/await 쓰면 됨`
      },
      {
        heading: "실무 가이드라인",
        content: `**언제 무엇을 쓸까:**

process.nextTick → 거의 안 씀
- EventEmitter 패턴에서 생성자 안의 emit 지연
- 라이브러리 개발 시 콜백이 항상 비동기로 호출되도록 보장
- 실무 애플리케이션 코드에서 직접 쓸 일은 거의 없음

setImmediate → I/O 후 즉시 실행이 필요할 때
- I/O 콜백 이후 빠르게 실행해야 할 때
- CPU 작업을 청크로 나눌 때 (이벤트 루프에 양보)
- setTimeout(0)보다 이걸 쓰는 게 의도가 명확

setTimeout(fn, 0) → 진짜 "나중에" 실행
- 최소 지연이 필요할 때
- 특정 시간 후 실행은 당연히 setTimeout
- 0ms여도 실제로는 1ms+ 지연

async/await → 대부분의 상황
- 비동기 작업의 90%는 이걸로 해결
- 위 세 가지를 직접 쓸 일은 점점 줄어드는 추세`
      },
      {
        heading: "✅ 실습",
        content: `// 실습 1: I/O starvation 체감
let count = 0;
function recursiveNextTick() {
  if (count >= 5) return;
  count++;
  process.nextTick(() => {
    console.log('nextTick', count);
    recursiveNextTick();
  });
}
recursiveNextTick();
setTimeout(() => console.log('timeout - nextTick 끝나야 실행됨'), 0);
setImmediate(() => console.log('immediate - 이것도 대기'));

// 실습 2: I/O 콜백 안에서의 실행 순서
const fs = require('fs');
fs.readFile(__filename, () => {
  console.log('1: I/O callback (Poll Phase)');
  setTimeout(() => console.log('2: timeout (Timers Phase)'), 0);
  setImmediate(() => console.log('3: immediate (Check Phase)'));
  process.nextTick(() => console.log('4: nextTick'));
  Promise.resolve().then(() => console.log('5: promise'));
});

// 정답: 1 → 4 → 5 → 3 → 2`
      }
    ]
  },
  {
    day: "Day 5 (금)",
    title: "주간 복습 & 시나리오 문제",
    emoji: "📝",
    sections: [
      {
        heading: "복습 1: 이벤트 루프 다이어그램 그리기",
        content: `빈 종이(또는 노트앱)에 다음을 직접 그려보세요:

1. 이벤트 루프 6 Phase를 원형으로 그리기
2. 각 Phase에서 실행되는 것을 적기
3. 마이크로태스크가 실행되는 시점을 표시
4. setTimeout, setImmediate, nextTick, Promise가
   각각 어느 위치에서 실행되는지 표시

외우지 말고, 왜 그런 순서인지 설명할 수 있어야 합니다.`
      },
      {
        heading: "복습 2: 핵심 개념 한 줄 정리 체크",
        content: `아래 각 항목을 한 줄로 설명할 수 있는지 체크하세요.
설명 못 하는 항목은 해당 Day로 돌아가서 재학습.

□ V8의 역할
□ libuv의 역할
□ 싱글 스레드의 진짜 의미 (스레드가 진짜 1개인가?)
□ 이벤트 루프 6 Phase 각각의 역할
□ Poll Phase가 가장 중요한 이유
□ nextTick vs Promise.then 실행 순서와 이유
□ setTimeout(0) vs setImmediate의 순서가 상황에 따라 다른 이유
□ I/O 콜백 안에서는 setImmediate가 항상 먼저인 이유
□ nextTick 재귀 호출이 위험한 이유
□ CPU 블로킹이 Java보다 Node.js에서 치명적인 이유
□ libuv 스레드 풀의 기본 크기와 용도
□ Worker Threads의 용도`
      },
      {
        heading: "시나리오 문제 1: 서버 응답 지연",
        content: `**상황:**
프로덕션 Node.js 서버에서 갑자기 모든 API의 응답 시간이
평균 50ms에서 10초 이상으로 증가했습니다.
모니터링을 보니 CPU 사용률이 100%에 가깝습니다.
메모리는 정상 범위입니다.

**질문:**
1. 가장 가능성 높은 원인은?
2. 즉시 할 수 있는 진단 방법은?
3. 원인을 찾았다면 해결 방법 3가지는?

---

**모범 답안:**
1. 원인: 이벤트 루프를 블로킹하는 CPU 집약 작업
   - 대용량 JSON 파싱/직렬화
   - 동기 암호화 함수 (pbkdf2Sync 등)
   - 복잡한 정규표현식 (ReDoS)

2. 진단:
   - node --prof로 CPU 프로파일링
   - clinic.js doctor로 이벤트 루프 지연 확인
   - 최근 배포된 코드 변경사항 확인

3. 해결:
   - CPU 작업을 Worker Threads로 분리
   - 작업을 청크로 분할 + setImmediate로 양보
   - 외부 서비스/메시지 큐로 위임 (BullMQ 등)`
      },
      {
        heading: "시나리오 문제 2: 이상한 실행 순서",
        content: `**상황:**
동료가 아래 코드를 작성했는데 예상과 다르게 동작합니다.

async function processOrder(orderId) {
  console.log('1: 주문 처리 시작');
  const order = await getOrder(orderId);
  console.log('2: 주문 조회 완료');
  const inStock = checkInventorySync(order.items);
  console.log('3: 재고 확인 완료');
  await processPayment(order);
  console.log('4: 결제 완료');
  return order;
}

문제: 이 함수가 실행되는 동안 다른 모든 API 요청이 멈춥니다.
어디가 문제이고 어떻게 고칠까요?

---

**모범 답안:**
문제: checkInventorySync()가 동기 CPU 작업
- await 앞뒤의 getOrder, processPayment는 비동기라 OK
- 하지만 checkInventorySync는 메인 스레드를 블로킹

해결:
1. 비동기 버전으로 교체: await checkInventory(order.items)
2. Worker Thread로 분리
3. 작업이 가벼우면 무시 가능하지만, 무겁다면 반드시 분리`
      },
      {
        heading: "시나리오 문제 3: 스레드 풀 고갈",
        content: `**상황:**
파일 업로드 API가 있습니다. 동시에 10개의 파일이 업로드되면
5번째부터 급격히 느려집니다.

**질문:** 왜 5번째부터 느려질까요? 어떻게 해결할까요?

---

**모범 답안:**
원인: libuv 스레드 풀 기본 크기 = 4
- fs 모듈의 파일 쓰기는 스레드 풀을 사용
- 4개까지는 병렬 처리, 5번째부터는 큐에서 대기

해결:
1. UV_THREADPOOL_SIZE=16 으로 환경변수 설정
2. Stream을 활용한 파이프라인으로 메모리 효율 개선
3. 파일 저장을 S3 등 외부 스토리지로 위임
4. 대용량 파일은 멀티파트 업로드로 처리`
      },
      {
        heading: "다음 주 예고",
        content: `Week 2에서는 Promise와 async/await의 내부 동작을 완전히 파헤칩니다.

- Promise 체이닝의 진짜 동작 원리
- async/await가 이벤트 루프와 어떻게 상호작용하는지
- 순차 실행 vs 병렬 실행의 성능 차이
- 에러 핸들링 패턴 심화
- 동시성 제어 패턴

이번 주에 이벤트 루프를 확실히 잡아야 다음 주 내용이 이해됩니다.
주말에 이벤트 루프 다이어그램을 한 번 더 그려보세요!`
      }
    ]
  }
];

function ContentRenderer({ content }: { content: string }) {
  return (
    <>
      {content.split("\n").map((line, li) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <div key={li} style={{ fontWeight: 700, color: "#f0f6fc", marginTop: 12, marginBottom: 4 }}>
              {line.replace(/\*\*/g, "")}
            </div>
          );
        }
        if (
          line.startsWith("//") ||
          line.startsWith("const ") ||
          line.startsWith("let ") ||
          line.startsWith("function ") ||
          line.startsWith("class ") ||
          line.startsWith("  ") ||
          line.startsWith("server.") ||
          line.startsWith("child.") ||
          line.startsWith("worker.") ||
          line.startsWith("console.") ||
          line.startsWith("if (") ||
          line.startsWith("} else") ||
          line.startsWith("});") ||
          line.startsWith("module.")
        ) {
          return (
            <div
              key={li}
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 13,
                background: "#0d1117",
                padding: "1px 6px",
                borderRadius: 4,
                color: "#79c0ff",
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              {line}
            </div>
          );
        }
        if (line.startsWith("→")) {
          return (
            <div key={li} style={{ color: "#8b949e", paddingLeft: 8 }}>
              {line}
            </div>
          );
        }
        if (
          line.startsWith("┌") ||
          line.startsWith("│") ||
          line.startsWith("├") ||
          line.startsWith("└") ||
          line.startsWith("   ")
        ) {
          return (
            <div
              key={li}
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 12,
                color: "#7ee787",
                lineHeight: 1.4,
              }}
            >
              {line}
            </div>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <div key={li} style={{ paddingLeft: 12, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#484f58" }}>•</span>
              {line.substring(2)}
            </div>
          );
        }
        if (line.startsWith("□")) {
          return (
            <div key={li} style={{ paddingLeft: 4, color: "#d29922" }}>
              {line}
            </div>
          );
        }
        if (line.match(/^\d+\./)) {
          return (
            <div key={li} style={{ paddingLeft: 8, color: "#e6edf3" }}>
              {line}
            </div>
          );
        }
        return <div key={li}>{line || "\u00A0"}</div>;
      })}
    </>
  );
}

export default function Week1() {
  const [activeDay, setActiveDay] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (dayIdx: number, secIdx: number) => {
    const key = `${dayIdx}-${secIdx}`;
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isExpanded = (dayIdx: number, secIdx: number) => {
    return expandedSections[`${dayIdx}-${secIdx}`] !== false;
  };

  const d = days[activeDay];

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
        background: "#0d1117",
        color: "#e6edf3",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0, color: "#58a6ff" }}>
          Week 1 — Node.js 이벤트 루프와 비동기 모델
        </h1>
        <p style={{ color: "#8b949e", margin: "8px 0 0" }}>
          매일 30분~1시간 | 이론(20min) → 코드 실습(20min) → 정리(10min)
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {days.map((dy, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: activeDay === i ? "2px solid #58a6ff" : "1px solid #30363d",
              background: activeDay === i ? "#161b22" : "#0d1117",
              color: activeDay === i ? "#58a6ff" : "#8b949e",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeDay === i ? 700 : 400,
              transition: "all 0.2s",
            }}
          >
            {dy.emoji} {dy.day}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#161b22",
          borderRadius: 12,
          border: "1px solid #30363d",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #30363d",
            background: "#1c2128",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, color: "#f0f6fc" }}>
            {d.emoji} {d.title}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#8b949e", fontSize: 14 }}>{d.day}</p>
        </div>

        <div style={{ padding: "8px 0" }}>
          {d.sections.map((sec, si) => {
            const open = isExpanded(activeDay, si);
            return (
              <div
                key={si}
                style={{
                  borderBottom: si < d.sections.length - 1 ? "1px solid #21262d" : "none",
                }}
              >
                <button
                  onClick={() => toggleSection(activeDay, si)}
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    border: "none",
                    background: "transparent",
                    color: sec.heading.startsWith("✅") ? "#3fb950" : "#e6edf3",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 15,
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  <span>{sec.heading}</span>
                  <span
                    style={{
                      color: "#484f58",
                      fontSize: 18,
                      transform: open ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    ▼
                  </span>
                </button>
                {open && (
                  <div
                    style={{
                      padding: "0 24px 16px",
                      whiteSpace: "pre-wrap",
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "#c9d1d9",
                    }}
                  >
                    <ContentRenderer content={sec.content} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          background: "#1c2128",
          borderRadius: 8,
          border: "1px solid #30363d",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#8b949e",
            fontSize: 13,
          }}
        >
          <span>Day {activeDay + 1} / 5</span>
          <div
            style={{
              flex: 1,
              height: 4,
              background: "#21262d",
              borderRadius: 2,
              marginLeft: 8,
            }}
          >
            <div
              style={{
                width: `${((activeDay + 1) / 5) * 100}%`,
                height: "100%",
                background: "#58a6ff",
                borderRadius: 2,
                transition: "width 0.3s",
              }}
            />
          </div>
          <span>{Math.round(((activeDay + 1) / 5) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
