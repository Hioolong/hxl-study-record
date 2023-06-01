export default class ConcurrencyRequest {
  constructor({
    maxConcurrencyCount
  }) {
    this.maxConcurrencyCount = maxConcurrencyCount;
    this.taskQueue = [];
    this.responses = {};

    setTimeout(() => {
      this._doRequest()
    })
  }

  push(task) {
    this.taskQueue.push(task);
  }

  // 执行请求
  _doRequest() {
    if (!this.taskQueue.length) return;
    // 获取当前能执行的请求数量
    const minConcurrencyCount = Math.min(this.maxConcurrencyCount, this.taskQueue.length);
    
    for(let i = 0; i < minConcurrencyCount; i++) {
      const task = this.taskQueue.shift();
      this.maxConcurrencyCount--
      this._runTask(task);
    }
  }

  _runTask(task) {
    task()
      .then((res) => {
        console.log(res);
        const name = task.name;
        this.responses[name] = {
          response: res.data
        };
      })
      .catch((err) => {
        const name = task.name;
        this.responses[name] = {
          error: err
        };
      })
      .finally(() => {
        this.maxConcurrencyCount++;
        this._doRequest();
      })
  }
}

