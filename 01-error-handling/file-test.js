const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url === '/sync') {
    console.time('sync');
    const data = fs.readFileSync('/usr/share/dict/words', 'utf8');
    console.timeEnd('sync');
    res.end(`sync: ${data.length} bytes`);
    return;
  }

  if (req.url === '/async') {
    console.time('async');
    fs.readFile('/usr/share/dict/words', 'utf8', (err, data) => {
      console.timeEnd('async');
      res.end(`async: ${data.length} bytes`);
    });
    return;
  }

  res.end('hello!');
});

server.listen(3000, () => console.log('서버 시작'));
