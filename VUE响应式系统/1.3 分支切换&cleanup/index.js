/**
 * 1.2实现了完善的响应式系统，但是还遗留一些问题，如副作用函数里有分支切换时，会导致不必要的更新
 * 因此我们需要在副作用函数执行时，先清除原来已建立的依赖连接，然后执行的时候再重新建立依赖
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

// 原始数据
const data = { ok: true, text: 'hello world' }
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
    fn()
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
effect(() => {
  console.log('effect run')
  document.body.innerText = obj.ok ? obj.text : 'not'
})

setTimeout(() => {
  obj.ok = false
  setTimeout(() => {
    obj.text = 'hello vue3'
  }, 1000)
}, 1000)