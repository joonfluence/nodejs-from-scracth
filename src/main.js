const http = require('http');

/*
[POST]
GET /posts
GET /posts/:id
POST /posts
*/
const server = http.createServer((req, res) => {
  const POST_ID_REGEX = /^\/posts\/([a-zA-Z0-9-_]+)$/;
  if (req.url === '/posts' && req.method === 'GET') {
    res.statusCode = 200;
    res.end('posts');
  } else if (req.method === 'GET' && POST_ID_REGEX.test(req.url)) {
    console.log(POST_ID_REGEX.exec(req.url));
    res.statusCode = 200;
    res.end('posts with id');
  } else if (req.url === '/posts' && req.method === 'POST') {
    res.statusCode = 201;
    res.end('created');
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`The server is listening at port: ${PORT}`);
});
