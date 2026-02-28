// file-test.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = __filename; // 이 파일 자체를 읽음 (아무 파일이나 OK)

const server = http.createServer((req, res) => {
  if (req.url === '/sync') {
    console.log(`[${new Date().toISOString()}] /sync 요청`);
    // 동기로 300000번 읽기 — 읽는 동안 서버 멈춤
    let data;
    for (let i = 0; i < 300000; i++) {
      data = fs.readFileSync(filePath, 'utf8');
    }
    console.log(`[${new Date().toISOString()}] /sync 완료: ${data.length} bytes x 300000회`);
    res.end(`[${new Date().toISOString()}] sync 완료: ${data.length} bytes x 300000회`);
    return;
  }

  if (req.url === '/async') {
    console.log(`[${new Date().toISOString()}] /async 요청`);
    // 비동기로 300000번 읽기 — 읽는 동안 다른 요청 처리 가능
    let count = 0;
    for (let i = 0; i < 300000; i++) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        count++;
        if (count === 300000) {
          console.log(`[${new Date().toISOString()}] /async 완료: ${data.length} bytes x 300000회`);
          res.end(`[${new Date().toISOString()}] async 완료: ${data.length} bytes x 300000회`);
        }
      });
    }
    return;
  }

  console.log(`[${new Date().toISOString()}] /hello 응답`);
  res.end('hello!');
});

server.listen(3000, () => {
  console.log('서버 시작');
  console.log('');
  console.log('테스트:');
  console.log('  1. curl http://localhost:3000/sync  (동시에 다른 터미널에서 /hello)');
  console.log('  2. curl http://localhost:3000/async (동시에 다른 터미널에서 /hello)');
});