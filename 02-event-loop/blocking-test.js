const http = require('http');

function heavyWork() {
  const start = Date.now();
  while (Date.now() - start < 5000) {}
}

const server = http.createServer((req, res) => {
  if (req.url === '/heavy') {
    console.log('/heavy 시작:', new Date().toISOString());
    heavyWork();
    console.log('/heavy 끝:', new Date().toISOString());
    res.end('heavy 완료');
    return;
  }

  console.log('/hello 응답:', new Date().toISOString());
  res.end('hello!');
});

server.listen(3000, () => console.log('서버 시작'));
