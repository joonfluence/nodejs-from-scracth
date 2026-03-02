function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`요청 시간 초과 (${ms}ms)`)), ms)
  );
  return Promise.race([promise, timeout]);
}

const mockApi = () => new Promise(resolve =>
  setTimeout(() => resolve("데이터 성공"), 2000)
);

async function execute() {
  // 케이스 1: 1초 타임아웃 (API가 2초 걸리므로 실패)
  try {
    console.log("--- 케이스 1: 타임아웃 1초 (API 2초) ---");
    const data = await withTimeout(mockApi(), 1000);
    console.log(data);
  } catch (err) {
    console.error("❌ 에러:", err.message);
  }

  // 케이스 2: 3초 타임아웃 (API가 2초 걸리므로 성공)
  try {
    console.log("\n--- 케이스 2: 타임아웃 3초 (API 2초) ---");
    const data = await withTimeout(mockApi(), 3000);
    console.log("✅ 성공:", data);
  } catch (err) {
    console.error("❌ 에러:", err.message);
  }
}

execute();

/**
 * [관전 포인트]
 * 1. Promise.race에서 진(lose) Promise는 취소되지 않는다.
 *    → 타임아웃으로 에러를 던져도 mockApi의 setTimeout은 계속 실행 중이다.
 *    → 실무에서는 AbortController로 실제 요청을 취소해야 리소스 낭비를 막을 수 있다.
 * 2. await가 있어야 try-catch에서 에러를 잡을 수 있다.
 */
