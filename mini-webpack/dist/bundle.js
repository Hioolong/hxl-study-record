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
  
  require(0)
})(
  {
    
      0: [function (require, module, exports) {
        "use strict";

var _foo = require("./foo.js");
var _user = require("./user.json");
var _user2 = _interopRequireDefault(_user);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
(0, _foo.foo)();
console.log(_user2.default);
console.log('main'); 
      }, {"./foo.js":1,"./user.json":2}],
    
      1: [function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.foo = undefined;
var _bar = require("./bar.js");
(0, _bar.bar)();
function foo() {
  console.log('foo');
}
exports.foo = foo; 
      }, {"./bar.js":3}],
    
      2: [function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "{\n  \"name\": \"hxl\",\n  \"age\": 18\n}\n"; 
      }, {}],
    
      3: [function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bar = bar;
function bar() {
  console.log('bar');
} 
      }, {}],
    
  }  
)