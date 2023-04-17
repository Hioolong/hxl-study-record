/**
 * 这里实现了基础的响应式数据，但是还有比较明显的缺点:
 * 1. 如副作用函数直接通过名字来获取，这种 hard code 方式非常不灵活，如不能收集一些匿名函数
 * 2. 副作用函数未与对象属性建立映射关系，会导致一些副作用函数多执行的问题，浪费性能
 */

const person = {
  name: 'ronney',
  age: 26
}
// 存储副作用函数的桶
const bucket = new Set()
// 采用 es6 proxy 监听对象的读取和设置
const obj = new Proxy(person, {
  get(target, key) {
    console.log('读取属性', key)
    // 将读取该对象属性的副作用函数存起来
    bucket.add(effect)
    return target[key]
  },
  set(target, key, value) {
    console.log(`更新${key}:`, value);
    // 设置属性值
    target[key] = value
    // 将副作用函数从桶里取出来一一执行
    bucket.forEach(fn => fn())
  }
})

const effect = () => {
  document.title = `${obj.name} ${obj.age}岁`
}

effect()

setTimeout(() => {
  obj.age = 27
}, 1000)