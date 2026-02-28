const http = require('http');

const orderService = {
  currentOrderId: null,

  async process(orderId) {
    this.currentOrderId = orderId;
    console.log(`주문 ${orderId}: 처리 시작 (currentOrderId = ${this.currentOrderId})`);

    await new Promise(r => setTimeout(r, 2000));

    console.log(`주문 ${orderId}: 처리 완료 (currentOrderId = ${this.currentOrderId})`);
    return this.currentOrderId;
  }
};

const server = http.createServer(async (req, res) => {
  const orderId = req.url.slice(1) || 'unknown';
  const result = await orderService.process(orderId);
  res.end(`요청한 주문: ${orderId}, 실제 처리된 주문: ${result}`);
});

server.listen(3000, () => {
  console.log('서버 시작');
  console.log('');
  console.log('두 터미널에서 거의 동시에 실행:');
  console.log('  curl http://localhost:3000/order-A');
  console.log('  curl http://localhost:3000/order-B');
  console.log('');
  console.log('order-A를 요청했는데 order-B가 나오는 걸 확인하세요!');
});
