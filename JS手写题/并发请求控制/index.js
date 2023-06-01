import ConcurrencyRequest from "./ConcurrencyRequest"

const BASE_URL = 'http://localhost:8000/'

function request1 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test1')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

function request2 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test2')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

function request3 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test3')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

function request4 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test4')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

function request5 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test5')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

function request6 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test6')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

function request7 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test7')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

function request8 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test8')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

function request9 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios(BASE_URL + 'test9')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    }, 2000)
  })
}

const taskQueue = [
  request1,
  request2,
  request3,
  request4,
  request5,
  request6,
  request7,
  request8,
  request9
]

const conCurrencyRequest = new ConcurrencyRequest({ maxConcurrencyCount: 2 })

for (const task of taskQueue) {
  conCurrencyRequest.push(task)
}

console.log(conCurrencyRequest.responses)