const http = require('http');

function heavyWork() {
  const start = Date.now();
  while (Date.now() - start < 5000) {}
}

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] 요청 받음: ${req.url}`);
  if (req.url === '/heavy') {
    console.log(`[${new Date().toISOString()}] /heavy 시작`);
    heavyWork();
    console.log(`[${new Date().toISOString()}] /heavy 끝`);
    res.end('heavy 완료');
    return;
  }

  console.log(`[${new Date().toISOString()}] /hello 응답`);
  res.end('hello!');
});

server.listen(3000, () => console.log('서버 시작'));
