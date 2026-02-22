export type Limiter = {
  run: <T>(task: () => Promise<T>) => Promise<T>;
};

export const createLimiter = (maxConcurrent: number): Limiter => {
  let activeCount = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (activeCount >= maxConcurrent) return;
    const task = queue.shift();
    if (!task) return;
    activeCount += 1;
    task();
  };

  const run: Limiter["run"] = async (task) => {
    return new Promise<T>((resolve, reject) => {
      const execute = () => {
        task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            activeCount -= 1;
            next();
          });
      };
      queue.push(execute);
      next();
    });
  };

  return { run };
};
