const Vue = require('vue')
const path = require('path')
const hash = require('hash-sum')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
//const webpack = require('webpack')
const fis = require('fis3');
const fisrelease = require('fis3-command-release');
var parserVuePlugin = require('../src/index');

const commonMatcher = {
  '/fixtures/**.vue': {
    isMod: true,
    wrap: true, 
    rExt: 'js',
    useSameNameRequire: true,
    parser: [
      function(content, file, conf) {
        conf.runtimeOnly = true;
        return parserVuePlugin(content, file, conf);
      }
    ]
  },
  '/fixtures/**.vue:js': {
    isMod: true,
    wrap: true, 
    rExt: 'js',
    useSameNameRequire: true,
    parser: fis.plugin('typescript', {
      module: 1,
      target: 1,
      sourceMap: false
    })
  },
  '/fixtures/**.{js,ts,es}': {
    isMod: true,
    wrap: true,
    parser: fis.plugin('typescript', {
      module: 1,
      target: 1,
      sourceMap: false
    }),
    rExt: 'js'
  },
  '/fixtures/{**.vue:scss,**.scss}': {
    rExt: 'css',
    parser: [
      fis.plugin('node-sass', {
      })
    ],
    postprocessor: fis.plugin('autoprefixer-latest'),
  },
}

function genId(file) {
  return hash(path.join('test', 'fixtures', file).replace(/\\/g, '/'))
}

// fis3 run
function bundle(options, cb, wontThrowError) {
  // 运行根目录
  const root = path.join(__dirname, 'fixtures');
  fis.project.setProjectRoot(root);
  // 需要构建的文件后缀
  fis.set('project.fileType.text', 'vue,map,js');

  // 模块化支持插件
  fis.hook('commonjs', {
    extList: [
      '.js', '.es', '.es6', '.jsx', '.vue',
    ],
    umd2commonjs: true
  });

  // 禁用components
  fis.unhook('components');
  fis.hook('node_modules');

  // 需要忽略的
  fis.set('project.ignore', fis.get('project.ignore').concat([
    'DS_store',
    'README.md'
  ]));

  // entry.js修改
  if (/\.vue/.test(options.target)) {
    // 例如basic.vue
    const vueFile = options.target
    // 修改entry.js的引入
    const entry = require.resolve('./fixtures/entry')
    let entryContent = fis.util.read(entry);
    entryContent = entryContent.replace(/~target/g, vueFile)
    fis.util.write(entry, entryContent, 'utf-8')
    delete options.target
  }

  let config = Object.assign({}, commonMatcher, options)

  let configArr = []
  configArr.push(config)

  configArr.forEach(function(roadmap) {
    fis.util.map(roadmap, function(selector, rules) {
      fis.match(selector, rules);
    });
  });

  // fis.on('deploy:end', function() {
  //   const file = require.resolve('../output/basic.js')
  //   cb(fis.util.read(file))
  // });

  const output = path.join(__dirname, 'fixtures/output')
  fisrelease.run({'dest': output, '_':[]}, fis.cli, {})

  // const webpackCompiler = webpack(config)ll
  // webpackCompiler.outputFileSystem = mfs
  // webpackCompiler.run((err, stats) => {
  //   const errors = stats.compilation.errors
  //   if (!wontThrowError) {
  //     expect(err).toBeNull()
  //     if (errors && errors.length) {
  //       errors.forEach(error => {
  //         console.error(error.message)
  //       })
  //     }
  //     expect(errors).toHaveLength(0)
  //   }
  //   cb(mfs.readFileSync('/test.build.js').toString(), stats, err)
  // })
}

function mockBundleAndRun(options, assert, wontThrowError) {
  const { suppressJSDOMConsole } = options
  delete options.suppressJSDOMConsole
  bundle(options, (code, bundleStats, bundleError) => {
    let dom, jsdomError
    try {
      dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
        runScripts: 'outside-only'
      })
      dom.window.eval(code)
    } catch (e) {
      console.error(`JSDOM error:\n${e.stack}`)
      jsdomError = e
    }

    const { window } = dom
    const { module, exports } = window
    const instance = {}
    if (module && module.beforeCreate) {
      module.beforeCreate.forEach(hook => hook.call(instance))
    }
    assert({
      window,
      module,
      exports,
      instance,
      code,
      jsdomError,
      bundleStats,
      bundleError
    })
  }, wontThrowError)
}

function mockRender(options, data = {}) {
  const vm = new Vue(Object.assign({}, options, { data() { return data } }))
  vm.$mount()
  return vm._vnode
}

function interopDefault(module) {
  return module ?
    module.default ? module.default : module :
    module
}

function initStylesForAllSubComponents(module) {
  if (module.components) {
    for (const name in module.components) {
      const sub = module.components[name]
      const instance = {}
      if (sub && sub.beforeCreate) {
        sub.beforeCreate.forEach(hook => hook.call(instance))
      }
      initStylesForAllSubComponents(sub)
    }
  }
}

module.exports = {
  commonMatcher,
  genId,
  bundle,
  mockBundleAndRun,
  mockRender,
  interopDefault,
  initStylesForAllSubComponents
}