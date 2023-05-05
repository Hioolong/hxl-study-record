import fs from "fs";
import path from "path";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import ejs from "ejs";
import { transformFromAstSync } from "@babel/core";
import { jsonLoader } from "./jsonLoader.js";
import { ChangeOutputPath } from "./changeOutputPath.js";
import { SyncHook } from "tapable";
let id = 0;

const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [jsonLoader],
      },
    ],
  },
  plugins: [new ChangeOutputPath()],
};

const hooks = {
  emitFile: new SyncHook(["context"]),
};

function createAsset(filePath) {
  // 1. 获取文件内容

  let source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  // 通过 loader 转换文件内容
  const loaders = webpackConfig.module.rules;
  loaders.forEach(({ test, use }) => {
    if (test.test(filePath)) {
      if (Array.isArray(use)) {
        use.reverse().forEach((fn) => {
          source = fn(source);
        });
      }
    }
  });

  // 2. 获取依赖关系
  // 利用 babel 解析成 ast
  const ast = parser.parse(source, {
    sourceType: "module",
  });
  const deps = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });

  const { code } = transformFromAstSync(ast, null, {
    presets: ["env"],
  });

  return {
    filePath,
    code,
    deps,
    mapping: {},
    id: id++,
  };
}

function initPlugins() {
  const plugins = webpackConfig.plugins;
  plugins.forEach((plugin) => {
    plugin.apply(hooks);
  });
}
initPlugins();
function createGraph() {
  const mainAssets = createAsset("./example/main.js");

  const queue = [mainAssets];

  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAsset(path.resolve("./example", relativePath));
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }

  return queue;
}

const graph = createGraph();

function build(graph) {
  const template = fs.readFileSync("./bundle.ejs", { encoding: "utf-8" });

  const data = graph.map((asset) => {
    const { id, code, mapping } = asset;
    return {
      id,
      code,
      mapping,
    };
  });

  const code = ejs.render(template, { data });
  
  let outputPath = "./dist/bundle.js"
  const context = {
    changeOutputPath(path) {
      outputPath = path
    }
  }
  hooks.emitFile.call(context);
  fs.writeFileSync(outputPath, code);
}

build(graph);
