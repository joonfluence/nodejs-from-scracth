const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`요청 받음: ${new Date().toISOString()}`);

  setTimeout(() => {
    res.end(`응답: ${new Date().toISOString()}`);
  }, 5000);
});

server.listen(3000, () => {
  console.log('서버 시작');
  console.log('PID:', process.pid);
  console.log('메모리:', process.memoryUsage());
  console.log('V8 힙:', require('v8').getHeapStatistics());
  console.log('');
  console.log('브라우저 탭 3개로 http://localhost:3000 동시 접속해보세요');
  console.log('→ 3개 모두 거의 동시에 3초 후 응답받음');
  console.log('→ 싱글 스레드인데 동시 처리가 되는 이유: setTimeout은 비동기(논블로킹)');
});
