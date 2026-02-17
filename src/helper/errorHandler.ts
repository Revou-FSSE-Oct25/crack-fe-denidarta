async function awesomeErrorHandling(promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
}

// Use this If the code runs in sequence
async function foo() {
  const [data, error] = await awesomeErrorHandling(somePromise);
  const [data2, error2] = await awesomeErrorHandling(anotherPromise);
  const [data3, error3] = await awesomeErrorHandling(yetAnotherPromise);
}

// Use this If the code runs indepently
async function foo2() {
  const [[data, error], [data2, error2], [data3, error3]] = await Promise.all([
    awesomeErrorHandling(somePromise),
    awesomeErrorHandling(anotherPromise),
    awesomeErrorHandling(yetAnotherPromise),
  ]);
}
