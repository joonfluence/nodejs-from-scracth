// GC 동작을 실시간 모니터링하면서 메모리 압박 시뮬레이션
// 실행: node --trace-gc gc-monitor.js

const http = require('http');

let requestCount = 0;

const server = http.createServer((req, res) => {
  requestCount++;

  if (req.url === '/leak') {
    // 매 요청마다 1MB씩 전역에 쌓임 → 누수
    if (!global.leakyStore) global.leakyStore = [];
    global.leakyStore.push(Buffer.alloc(1024 * 1024));

    const { heapUsed } = process.memoryUsage();
    res.end(JSON.stringify({
      request: requestCount,
      stored: global.leakyStore.length,
      heapUsed: `${Math.round(heapUsed / 1024 / 1024)}MB`
    }));
    return;
  }

  if (req.url === '/clean') {
    // 매 요청마다 1MB 생성하지만 지역 변수 → GC가 수거
    const temp = Buffer.alloc(1024 * 1024);

    const { heapUsed } = process.memoryUsage();
    res.end(JSON.stringify({
      request: requestCount,
      heapUsed: `${Math.round(heapUsed / 1024 / 1024)}MB`,
      note: 'temp는 응답 후 GC 대상'
    }));
    return;
  }

  const { heapUsed, heapTotal } = process.memoryUsage();
  res.end(JSON.stringify({
    heapUsed: `${Math.round(heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(heapTotal / 1024 / 1024)}MB`,
    requests: requestCount,
    leakyStoreSize: global.leakyStore ? global.leakyStore.length : 0
  }, null, 2));
});

server.listen(3000, () => {
  console.log('GC 모니터 서버 시작 (--trace-gc로 실행하면 GC 로그가 보입니다)');
  console.log('');
  console.log('테스트:');
  console.log('  curl http://localhost:3000/         ← 메모리 상태 확인');
  console.log('  curl http://localhost:3000/leak      ← 누수 발생 (반복 호출)');
  console.log('  curl http://localhost:3000/clean     ← 정상 (GC가 수거)');
  console.log('');
  console.log('/leak를 10번 호출한 뒤 / 로 heapUsed 변화를 비교하세요');
});
