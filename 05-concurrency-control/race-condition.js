let balance = 100;

async function withdraw(amount) {
  console.log(`출금 시도: ${amount}원 (현재 잔액: ${balance}원)`);

  // DB 조회 시뮬레이션 (비동기 지연)
  await new Promise(resolve => setTimeout(resolve, 100));

  if (balance >= amount) {
    balance -= amount;
    console.log(`✅ 출금 완료! 남은 잔액: ${balance}원`);
  } else {
    console.log(`❌ 잔액 부족 (현재 잔액: ${balance}원)`);
  }
}

async function run() {
  // 동시에 두 번의 출금 요청
  await Promise.all([withdraw(80), withdraw(80)]);
  console.log(`\n최종 잔액: ${balance}원`);
  console.log('→ 100 - 80 = 20이 되어야 하지만, -60이 된다!');
  console.log('→ 두 요청 모두 balance=100 시점에 조회를 마치고,');
  console.log('  둘 다 "잔액 충분" 판단 후 각각 80씩 차감했기 때문.');
}

run();

/**
 * [관전 포인트]
 * 1. Node.js는 싱글 스레드인데 왜 마이너스 잔액이 발생할까?
 *    → '조회(balance >= amount)' 와 '수정(balance -= amount)' 사이에
 *      await가 있어서 이벤트 루프가 다른 요청을 끼워 넣을 수 있다.
 * 2. Java의 synchronized/Lock과 같은 언어 레벨 도구가 없으므로,
 *    Application 레벨 큐 또는 DB 레벨 Lock(SELECT FOR UPDATE)으로 해결해야 한다.
 */
