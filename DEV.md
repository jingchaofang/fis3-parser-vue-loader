
参照vue-loader源码和项目结构

## fis3工作原理

http://fis.baidu.com/fis3/docs/build.html

## fis3编译阶段插件开发参考

http://fis.baidu.com/fis3/docs/api/dev-plugin.html

https://github.com/fex-team/fis-parser-node-sass

### fis3调用参考

https://github.com/fex-team/yog2/blob/master/yog2-fis3.js

### fis3 common.js node_module loader

https://github.com/fex-team/fis3-hook-commonjs

https://github.com/fex-team/fis3-hook-node_modules

https://github.com/fex-team/fis3-postpackager-loader

### fis3 release 命令参考

https://github.com/fex-team/fis3-command-release

https://github.com/fex-team/fis3-deploy-local-deliver


## 在js中共享css变量（TODO）

参考
https://github.com/fex-team/fis3-preprocessor-js-require-css
https://github.com/ystarlongzi/fis3-hook-css-modules/blob/master/src/index.js

https://www.cnblogs.com/fayin/p/10510760.html

https://github.com/css-modules/icss-utils/blob/master/src/createICSSRules.js

https://github.com/webpack-contrib/css-loader/blob/master/src/plugins/postcss-icss-parser.js

## 模板编译

### vue-template-compiler(parseComponent、compile)

https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#readme

### component-compiler-utils

vue-loader/node_modules/@vue/component-compiler-utils/lib/compileTemplate.ts

### vue-template-es2015-compiler(transform es2015)

https://github.com/vuejs/vue-template-es2015-compiler

## jest测试用例

https://github.com/facebook/jest

https://jestjs.io/docs/en/getting-started

[vscode调试jest](https://github.com/Microsoft/vscode-recipes/tree/master/debugging-jest-tests)

### jest默认并行，开启串行避免fis3编译污染

--runInBand 或者简写为 -i 这个参数控制jest串行执行所有测试

https://jestjs.io/docs/en/troubleshooting#tests-are-extremely-slow-on-docker-andor-continuous-integration-ci-server
