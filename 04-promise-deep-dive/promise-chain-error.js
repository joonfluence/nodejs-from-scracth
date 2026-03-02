const promiseChain = () => {
  return Promise.resolve("Step 1 Success")
    .then((res) => {
      console.log(res);
      throw new Error("Step 2 Failed");
    })
    .then((res) => {
      console.log("이 코드는 실행될까요?", res);
      return "Step 3 Success";
    });
};

process.on('unhandledRejection', (reason, promise) => {
  console.log('🚨 잡히지 않은 거절 발생:', reason.message);
});

promiseChain();

/**
 * [관전 포인트]
 * 1. then은 항상 새로운 Promise를 반환한다.
 * 2. catch가 없으면 에러가 버블링되어 process 레벨까지 간다.
 * 3. Node.js 15+ 에서 .catch() 없는 Promise 에러가 프로세스를 종료시키는지 테스트.
 */
