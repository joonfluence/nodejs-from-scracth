const mockApis = [
    () => new Promise(resolve => setTimeout(() => resolve({ id: 1, name: "상품A" }), 500)),
    () => new Promise((_, reject) => setTimeout(() => reject(new Error("서버 오류")), 300)),
    () => new Promise(resolve => setTimeout(() => resolve({ id: 3, name: "상품C" }), 700)),
    () => new Promise((_, reject) => setTimeout(() => reject(new Error("타임아웃")), 200)),
    () => new Promise(resolve => setTimeout(() => resolve({ id: 5, name: "상품E" }), 400)),
  ];
  
  async function withPromiseAll() {
    console.log("--- Promise.all (All or Nothing) ---");
    try {
      const results = await Promise.all(mockApis.map(fn => fn()));
      console.log("성공:", results);
    } catch (err) {
      console.log("❌ 하나만 실패해도 전체 실패:", err.message);
    }
  }
  
  async function withPromiseAllSettled() {
    console.log("\n--- Promise.allSettled (개별 결과) ---");
    const results = await Promise.allSettled(mockApis.map(fn => fn()));
  
    const successes = results
      .filter(r => r.status === "fulfilled")
      .map(r => r.value);
  
    const failures = results
      .filter(r => r.status === "rejected")
      .map(r => r.reason.message);
  
    console.log("✅ 성공:", successes);
    console.log("❌ 실패:", failures);
    console.log(`→ 5개 중 ${successes.length}개 성공, ${failures.length}개 실패`);
  }
  
  async function withCatchFallback() {
    console.log("\n--- 개별 .catch() 패턴 ---");
    const results = await Promise.all(
      mockApis.map(fn => fn().catch(err => ({ error: err.message })))
    );
  
    const successes = results.filter(r => !r.error);
    const failures = results.filter(r => r.error);
  
    console.log("✅ 성공:", successes);
    console.log("❌ 실패:", failures);
  }
  
  async function main() {
    await withPromiseAll();
    await withPromiseAllSettled();
    await withCatchFallback();
  }
  
  main();
  
  /**
   * [관전 포인트]
   * 1. Promise.all → 하나라도 실패하면 전체 reject (All or Nothing)
   * 2. Promise.allSettled → 모두 완료 후 각각의 상태를 반환 (부분 성공 허용)
   * 3. 개별 .catch() → Promise.all과 조합해서 allSettled와 비슷한 효과
   *    → 단, 반환 타입이 섞이므로 allSettled가 더 명확하다.
   */
  