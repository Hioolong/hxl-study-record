// 构建 bundle 思路
// 1. 使用函数来分割各模块作用域
// 2. 建立路径和各模块函数的映射关系
// 3. 实现 require 来处理模块的 import 和 export
// 4. 处理路径问题，使用路径和模块id进行映射
(function(modules){
  function require(id) {
    const [fn, mappings] = modules[id];
    
    function localRequire(filePath) {
      const id = mappings[filePath]
      return require(id)
    }

    const module = {
      exports: {}
    }
  
    fn(localRequire, module, module.exports)
  
    return module.exports
  }
  
  require(1)
})(
  {
    1: [function (require, module, exports) {
      const { foo } = require('./foo.js')
      foo()
      console.log('main')
    }, {
      "./foo.js": 2
    }],
    2: [function (require, module, exports) {
      function foo() {
        console.log('foo')
      }
      module.exports = {
        foo
      }
    }, {}]
  }  
)