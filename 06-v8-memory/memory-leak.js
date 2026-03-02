// 의도적 메모리 누수 3가지 패턴

function printHeap(label) {
  const { heapUsed } = process.memoryUsage();
  console.log(`  [${label}] heapUsed: ${Math.round(heapUsed / 1024 / 1024 * 100) / 100} MB`);
}

// ── 패턴 1: 전역 캐시에 데이터 누적 ──
console.log('\n🔴 패턴 1: 전역 캐시 누수');
const cache = [];

function leakByCache() {
  for (let i = 0; i < 10000; i++) {
    cache.push({ data: 'x'.repeat(1000), timestamp: Date.now() });
  }
}

printHeap('시작');
leakByCache();
printHeap('1차 추가');
leakByCache();
printHeap('2차 추가');
leakByCache();
printHeap('3차 추가 — cache.length: ' + cache.length);
console.log('  → cache를 비우지 않으면 계속 증가');

// ── 패턴 2: 해제 안 된 타이머 ──
console.log('\n🔴 패턴 2: clearInterval 누락');
let timerData = [];

const intervalId = setInterval(() => {
  timerData.push('x'.repeat(10000));
}, 10);

setTimeout(() => {
  console.log(`  타이머 2초 후 timerData.length: ${timerData.length}`);
  clearInterval(intervalId); // 이 줄을 주석 처리하면 영원히 증가
  console.log('  → clearInterval로 정리 완료');

  // ── 패턴 3: 클로저가 큰 객체를 참조 ──
  console.log('\n🔴 패턴 3: 클로저 누수');
  demonstrateClosureLeak();
}, 2000);

function demonstrateClosureLeak() {
  const handlers = [];

  for (let i = 0; i < 5; i++) {
    const bigData = Buffer.alloc(1024 * 1024, 'A'); // 1MB

    // 이 클로저가 bigData를 계속 참조 → GC가 수거 못함
    handlers.push(() => {
      return bigData.length;
    });

    printHeap(`클로저 ${i + 1}개 생성`);
  }

  console.log('  → 클로저가 살아있는 한 bigData 5MB가 해제 안 됨');
  console.log('  → handlers = null 하면 비로소 GC 대상');

  console.log('\n✅ 진단하려면:');
  console.log('  node --inspect memory-leak.js');
  console.log('  → Chrome DevTools (chrome://inspect) → Memory → Heap Snapshot');
}
