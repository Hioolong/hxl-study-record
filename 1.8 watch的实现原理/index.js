/**
 * watch 的本质是监听响应式数据的变化，然后执行回调函数，实现思路如下
 * 1. 核心使用 effect 函数建立监听关系
 * 2. 通过 traverse 递归深度读取对象所有属性，实现监听响应式对象所有属性变化都会触发回调
 * 3. 通过 effect lazy 选项获取更新前后的值，传递给 callback 使用
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
const data = { foo: 1, bar: 2 }
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
  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun && effectsToRun.forEach(effectFn => {
    if (effectFn.options?.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}


// 注册副作用函数
const effect = (fn, options = {}) => {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    // 获取 getter 的结果
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}

// 清除原有依赖
const cleanup = (effectFn) => {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

// 递归读取对象属性，深度建立联系
const traverse = (value, seen = new Set()) => {
  if (typeof value !== 'object' || typeof value === 'null' || seen.has(value)) {
    return
  }
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen)
  }
  return value
}

const watch = (source, cb) => {
  let getter
  // 判断传入监听源是响应式数据还是getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }
  let oldVal, newVal
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler() {
      newVal = effectFn()
      cb(newVal, oldVal)
      oldVal = newVal
    }
  })
  oldVal = effectFn()
}

// source 为响应式对象
watch(obj, (newVal, oldVal) => {
  console.log('watch success!!!!', newVal, oldVal)
})

// source 为 getter 的格式
watch(() => obj.bar, (newVal, oldVal) => {
  console.log('watch obj bar success !!!', newVal, oldVal)
})

obj.bar++
obj.foo++