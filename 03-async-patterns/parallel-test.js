function delay(ms, label) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`  ${label} 완료`);
      resolve(label);
    }, ms);
  });
}

async function sequential() {
  console.log('\n--- 순차 실행 ---');
  console.time('순차');
  await delay(1000, 'A');
  await delay(1000, 'B');
  await delay(1000, 'C');
  console.timeEnd('순차');
}

async function parallel() {
  console.log('\n--- 병렬 실행 ---');
  console.time('병렬');
  await Promise.all([
    delay(1000, 'A'),
    delay(1000, 'B'),
    delay(1000, 'C'),
  ]);
  console.timeEnd('병렬');
}

async function main() {
  await sequential();
  await parallel();
}

main();
