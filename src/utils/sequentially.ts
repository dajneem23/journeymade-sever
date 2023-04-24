function wait(process, ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms, process);
  });
}

export default async function (list, process, delay) {
  const result = [];

  await list.reduce(async (prev, item) => {
    await prev;
    const r = await process(item);
    result.push(r);
  }, Promise.resolve());
  
  return result;  
}
