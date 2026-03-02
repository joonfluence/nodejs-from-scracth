let balance = 100;

async function withdraw(amount) {
  console.log(`출금 시도: ${amount}원 (현재 잔액: ${balance}원)`);

  // 1단계: DB에서 잔액 조회 (비동기)
  await new Promise(resolve => setTimeout(resolve, 100));
  const currentBalance = balance;
  console.log(`  → 조회된 잔액: ${currentBalance}원`);

  // 2단계: DB에 수정 반영 (비동기) — 이 사이에 다른 요청이 끼어든다!
  await new Promise(resolve => setTimeout(resolve, 100));

  if (currentBalance >= amount) {
    balance = currentBalance - amount;
    console.log(`✅ 출금 완료! 남은 잔액: ${balance}원`);
  } else {
    console.log(`❌ 잔액 부족 (현재 잔액: ${balance}원)`);
  }
}

async function run() {
  await Promise.all([withdraw(80), withdraw(80)]);
  console.log(`\n최종 잔액: ${balance}원`);
  console.log('→ 둘 다 balance=100 시점에 조회를 마치고,');
  console.log('  둘 다 "잔액 충분" 판단 후 각각 80씩 차감 → -60원!');
  console.log('');
  console.log('[원인] 조회(await)와 수정(await) 사이에 다른 요청이 끼어듦');
  console.log('[해결] DB: SELECT FOR UPDATE / App: 작업 큐 / 원자적 UPDATE WHERE');
}

run();

/**
 * [관전 포인트]
 * 1. 조회와 수정이 각각 별도 await를 타므로, 그 사이에 다른 요청이 끼어든다.
 * 2. 두 요청 모두 balance=100을 읽고, 둘 다 "충분하다"고 판단한다.
 * 3. 결과: 100 - 80 - 80 = -60 (마이너스 잔액 발생!)
 */
