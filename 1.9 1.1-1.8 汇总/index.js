/**
 * 从0手写一遍 1.1-1.8的实现
 * 1.1 核心是读取响应式数据属性时，收集副作用函数，响应式数据变化时，重新执行已经收集的副作用函数
 * 1.2 核心是存储副作用函数的桶的数据结构，层级为 Weakmap -> Map -> Set
 * 1.3 核心是重新执行副作用函数时需要先清除原以收集的函数，这样在执行的时候会重新建立联系
 * 1.4 核心是注册副作用函数时用一个effect栈存放嵌套的effect，activeEffect 指向栈顶
 * 1.5 核心是判断更新时执行的副作用函数与activeEffect是否同一个，如果是则不执行
 * 1.6 核心是注册副作用函数时支持传入调度器，trigger 时如有调度器则使用调度器来执行，否则直接执行
 * 1.7 
 */

const data = {
  foo: 1,
  bar: 2
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
      effectsToRun.add(effect)
    }
  })
  effectsToRun && effectsToRun.forEach(effectFn => {
    if (effectFn.options?.schedule) {
      effectFn.options.schedule(effectFn)
    } else {
      effectFn()
    }
  });
}

// 注册副作用函数，核心是执行副作用函数，触发依赖收集的过程
const effect = (fn, options = {}) => {
  const effectFn = () => {
    // 先清除原收集到的依赖
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res;
  }

  effectFn.deps = []
  effectFn.options = options
  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}
const cleanup = (effectFn) => {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}
/**
 * 计算属性实现要领
 * 1. 使用 lazy 的 effect 注册副作用函数，该函数会返回 effectFn，这样可以手动执行 effectFn 来获获取计算结果
 * 2. 使用 dirty 标记来做缓存，true 时才会重新计算结果，借助 schedule 得知依赖变化，然后将 dirty 设置为 true，重新计算变化后的结果
 * 3. 
 * @param {Function} getter
 * @returns value
 */
const computed = (getter) => {
  let value;
  let dirty = true;

  const effectFn = effect(getter, {
    lazy: true,
    schedule() {
      dirty = true;
      trigger(obj, 'value')
    }
  })
  
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }

  return obj;
}

/**
 * watch 的本质是监听某个数据源的变化，然后执行回调函数
 * 1. 判断 target 类型，如是对象则须递归访问所有属性，建立联系，如是 getter ，可直接传入 effect
 * 2. 记录新旧值，并传递给回调函数使用
 * 
 * @param {Object | Function} targer 监听源
 * @param {*} cb 回调函数
 */
const watch = (target, cb) => {
  let getter
  if (typeof target === 'function') {
    getter = target
  } else if (typeof target === 'object') {
    getter = () => traverse(target)
  }
  let oldVal, newVal
  const effectFn = effect(() => getter(), {
    lazy: true,
    schedule(effectFn) {
      newVal = effectFn()
      cb(newVal, oldVal)
      oldVal = newVal
    }
  })

  oldVal = effectFn();
}

/**
 * 递归访问对象所有属性
 * @param {Object} value 
 * @param {Set} seen 
 * @returns 
 */
const traverse = (value, seen = new Set()) => {
  if (typeof value !== 'object' || typeof value === null || seen.has(value)) {
    return
  }
  seen.add(value)
  for (const key in value) {
    traverse(value[key], seen)
  }
  
  return value;
}

// TEST
effect(() => {
  console.log(obj.foo)
})

const sum = computed(() => obj.bar + obj.foo)
watch(() => obj.foo, (val, oldVal) => {
  console.log(`watch new val: ${val}`)
  console.log(`watch old val: ${oldVal}`)
})

effect(() => {
  console.log('computed val:', sum.value)
})

setTimeout(() => {
    obj.foo = 2
  }, 500)