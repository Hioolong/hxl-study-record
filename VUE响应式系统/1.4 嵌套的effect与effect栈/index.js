/**
 * 当出现了嵌套的副作用函数时，会出现 activeEffect 指向错误的问题，导致更新时会执行错误的副作用函数
 * 故需要一个栈来保存嵌套的副作用函数，activeEffect 指向栈顶，这样即可解决此问题
 */

// 用全局变量存储被注册的副作用函数
let activeEffect
const effectStack = []

/**
 * 为了建立响应式数据的属性和副作用函数的联系，需要重新设计桶的数据结构
 * weakMap: 响应式数据 => map
 * map: 响应式数据key => set
 * set: 副作用函数合集
 */
const bucket = new WeakMap()

// 原始数据
const data = { foo: true, bar: true }
// 采用 es6 proxy 监听对象的读取和设置
const obj = new Proxy(data, {
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
  // 将当前依赖合集存放到副作用函数里，用于副作用函数cleanup
  activeEffect.deps.push(deps)
}

const trigger = (target, key) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return;
  const effects = depsMap.get(key)
  const effectsToRun = new Set(effects)
  effectsToRun && effectsToRun.forEach(effect => effect())
}


// 注册副作用函数
const effect = (fn) => {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  effectFn.deps = []
  effectFn()
}

// 清除原有依赖
const cleanup = (effectFn) => {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

// 注册
let temp1, temp2
effect(function effectFn1 () {
  console.log('effect fn1 run')
  
  effect(function effectFn2 () {
    console.log('effect fn2 run')
    temp2 = obj.bar
  })

  temp1 = obj.foo
})

// 修改 obj.foo，预期为 effectFn1 和 effectFn2 各执行一次
setTimeout(() => {
  obj.foo = false
}, 500)
