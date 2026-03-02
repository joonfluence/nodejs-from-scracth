// V8 힙 구조 확인 및 GC 관찰

const v8 = require('v8');

function printMemory(label) {
  const used = process.memoryUsage();
  const heap = v8.getHeapStatistics();
  console.log(`\n--- ${label} ---`);
  for (const key in used) {
    console.log(`  ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
  console.log(`  heap_size_limit: ${Math.round(heap.heap_size_limit / 1024 / 1024)} MB`);
  console.log(`  total_available: ${Math.round(heap.total_available_size / 1024 / 1024)} MB`);
}

printMemory('초기 상태');

// New Space → Old Space 이동 관찰
// 객체를 만들고 오래 유지하면 Old Space로 승격된다
const longLived = [];
for (let i = 0; i < 100000; i++) {
  longLived.push({ id: i, data: `item-${i}` });
}
printMemory('객체 10만개 생성 후 (Old Space로 승격됨)');

// 단명 객체 — 만들고 바로 참조 해제 → Minor GC(Scavenge)가 수거
(function shortLivedWork() {
  const temp = [];
  for (let i = 0; i < 100000; i++) {
    temp.push({ id: i, data: `temp-${i}` });
  }
  // temp는 함수 끝나면 참조 해제 → GC 수거 대상
})();

printMemory('단명 객체 생성+해제 후');

// 강제 GC (--expose-gc 플래그 필요)
if (global.gc) {
  global.gc();
  printMemory('수동 GC 실행 후');
} else {
  console.log('\n💡 수동 GC를 보려면: node --expose-gc heap-structure.js');
}

/**
 * [관전 포인트]
 * - rss: OS가 프로세스에 할당한 전체 메모리 (힙 + 스택 + C++ 바인딩 등)
 * - heapTotal: V8 힙에 할당된 총 메모리
 * - heapUsed: V8 힙에서 실제 사용 중인 메모리
 * - external: V8 외부 C++ 객체가 사용하는 메모리 (Buffer 등)
 * - arrayBuffers: ArrayBuffer + SharedArrayBuffer 메모리
 *
 * heapUsed < heapTotal < rss 순서여야 정상
 */
