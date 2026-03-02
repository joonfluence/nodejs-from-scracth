const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function task(id, ms) {
  await delay(ms);
  return `Task ${id} 완료`;
}

async function runTest() {
  // 순차 실행 — await마다 이벤트 루프에 제어를 넘기고 대기
  console.time("Sequential");
  const a = await task(1, 1000);
  const b = await task(2, 1000);
  console.log(a, b);
  console.timeEnd("Sequential");

  console.log("---");

  // 병렬 실행 — Promise를 먼저 모두 시작시킨 뒤 한꺼번에 await
  console.time("Parallel");
  const results = await Promise.all([task(3, 1000), task(4, 1000)]);
  console.log(results);
  console.timeEnd("Parallel");
}

runTest();

/**
 * [관전 포인트]
 * 1. await를 만나면 함수의 나머지 부분이 마이크로태스크로 스케줄된다.
 *    → 메인 스레드는 비워지고 이벤트 루프가 다른 작업을 처리할 수 있다.
 * 2. Promise.all은 인자로 받은 Promise들을 "동시에 시작"시키는 게 아니라,
 *    이미 시작된 Promise들의 완료를 한꺼번에 기다리는 것이다.
 */
