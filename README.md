# fis3-parser-vue-loader-latest

[![CircleCI](https://circleci.com/gh/jingchaofang/fis3-parser-vue-loader.svg?style=svg&circle-token=9d2e8a4400eafb152acea1bd93d523dd4ca0374f)](https://circleci.com/gh/jingchaofang/fis3-parser-vue-loader)
[![codecov](https://codecov.io/gh/jingchaofang/fis3-parser-vue-loader/branch/master/graph/badge.svg?token=m1zRL5F1xG)](https://codecov.io/gh/jingchaofang/fis3-parser-vue-loader)

A parser plugin for fis3 like vue-loader

Latest support vue@2.6.11

The project is developed on the basis of [fis3-parser-vue-component](https://github.com/ccqgithub/fis3-parser-vue-component)

## usage

```
npm install fis3-parser-vue-loader-latest
```

## test

```
npm run test
```

### vscode

```
{
    "type": "node",
    "request": "launch",
    "name": "Jest All",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": ["--runInBand"],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen",
    "disableOptimisticBPs": true,
    "windows": {
      "program": "${workspaceFolder}/node_modules/jest/bin/jest",
    }
}
```


