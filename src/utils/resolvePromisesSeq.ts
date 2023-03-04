export const resolvePromisesSeq = async (tasks) => {
  const results = [];
  for (const task of tasks) {
    results.push(await task);
  }

  return results;
};
