async function caught() {
  try {
    throw new Error('잡히는 에러');
  } catch (e) {
    console.log('✅ catch에서 잡힘:', e.message);
  }
}

async function lost() {
  someAsyncWork();
  console.log('이 줄은 실행됨');
}

async function someAsyncWork() {
  throw new Error('사라지는 에러');
}

async function proper() {
  try {
    await someAsyncWork();
  } catch (e) {
    console.log('✅ await하니까 잡힘:', e.message);
  }
}

process.on('unhandledRejection', (reason) => {
  console.log('🔴 unhandledRejection:', reason.message);
});

async function main() {
  console.log('--- 케이스 1: try-catch ---');
  await caught();

  console.log('\n--- 케이스 2: await 빠뜨림 ---');
  await lost();

  await new Promise(r => setTimeout(r, 100));

  console.log('\n--- 케이스 3: 제대로 await ---');
  await proper();
}

main();
