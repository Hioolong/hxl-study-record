/**
 * 从0手写一遍 1.1-1.8的实现
 * 1.1 核心是读取响应式数据属性时，收集副作用函数，响应式数据变化时，重新执行已经收集的副作用函数
 * 1.2 核心是存储副作用函数的桶的数据结构，层级为 Weakmap -> Map -> Set
 * 1.3 核心是重新执行副作用函数时需要先清除原以收集的函数，这样在执行的时候会重新建立联系
 * 1.4 核心是注册副作用函数时用一个effect栈存放嵌套的effect，activeEffect 指向栈顶
 * 1.5 核心是判断更新时执行的副作用函数与activeEffect是否同一个，如果是则不执行
 */

const data = {
  foo: 0,
  bar: 0
}

// 当前副作用函数
let activeEffect
// effect 栈，用于处理 effect 嵌套问题
const effectStack = []

// 存放副作用函数的桶
const bucket = new WeakMap()

// 劫持对象
const obj = new Proxy(data, {
  get(target, key) {
    console.log(`read ${key}`)
    track(target, key)
    return target[key]
  },
  set(target, key, newVal) {
    console.log(`write ${key}: `, newVal);
    target[key] = newVal
    trigger(target, key)
  }
})

// 收集使用到 targer[key] 的副作用函数
const track = (target, key) => {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, depsMap = new Map())
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, deps = new Set())
  }
  deps.add(activeEffect)
  // 将deps存放到effectFn，用于cleanup
  activeEffect.deps.push(deps)
}

// 重新执行收集到的副作用函数
const trigger = (target, key) => {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key)
  const effectsToRun = new Set()
  effects && effects.forEach(effect => {
    if (effect !== activeEffect) {
      effectsToRun.push(effect)
    }
  })
  effectsToRun && effectsToRun.forEach(effect => effect());
}

// 注册副作用函数，核心是执行副作用函数，触发依赖收集的过程
const effect = (fn) => {
  const effectFn = () => {
    // 先清除原收集到的依赖
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn.deps = []

  effectFn()

  return effectFn
}
const cleanup = (effectFn) => {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

// TEST
effect(() => {
  obj.foo++
})

// setTimeout(() => {
//   obj.foo = 2
// }, 500)