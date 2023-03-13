/**
 * 为了解决1.1的两个问题，这里做了三个改进
 * 1. 建立一个注册副作用函数的函数，使用一个全局变量临时存储副作用函数
 * 2. 重新设计依赖桶的数据结构，使响应式数据的属性跟副作用函数建立起联系
 * 3. 将收集依赖和触发依赖分别封装进 track 和 trigger 函数里，提高灵活性
 */

// 用全局变量存储被注册的副作用函数
let activeEffect

/**
 * 为了建立响应式数据的属性和副作用函数的联系，需要重新设计桶的数据结构
 * weakMap: 响应式数据 => map
 * map: 响应式数据key => set
 * set: 副作用函数合集
 */
const bucket = new WeakMap()

// 采用 es6 proxy 监听对象的读取和设置
const person = {
  name: 'ronney',
  age: 26
}
const obj = new Proxy(person, {
  get(target, key) {
    console.log('读取属性', key)
    // 收集依赖
    track(target, key)
    return target[key]
  },
  set(target, key, value) {
    console.log(`更新${key}:`, value);
    // 设置属性值
    target[key] = value
    // 触发依赖
    trigger(target, key)
  }
})

const track = (target, key) => {
   if (!activeEffect) {
    return
   }
  //  获取 target 的依赖Map
   let depsMap = bucket.get(target)
   if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
   }
  // 获取 target 属性 key 的依赖合集
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  // 添加依赖到具体属性的桶里
  deps.add(activeEffect)
}

const trigger = (target, key) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return;
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}


// 注册副作用函数
const effect = (fn) => {
  activeEffect = fn
  fn()
}

// 注册
effect(() => {
  document.title = obj.name
})

setTimeout(() => {
  obj.name = 'RonneyHuang'
}, 1000)