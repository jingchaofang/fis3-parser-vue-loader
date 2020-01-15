var path = require('path');
var parserVuePlugin = require('../../src/index');

// 需要构建的文件
const root = path.join(__dirname);
fis.project.setProjectRoot(root);
fis.set('project.fileType.text', 'vue,map,js');
fis.set('project.ignore', fis.get('project.ignore').concat(['output/**', 'DS_store']));

// 模块化支持插件
// https://github.com/fex-team/fis3-hook-commonjs (forwardDeclaration: true)
fis.hook('commonjs', {
    extList: [
        '.js', '.coffee', '.es6', '.jsx', '.vue',
    ],
    umd2commonjs: true
});

// 禁用components，启用node_modules
fis.unhook('components');
fis.hook('node_modules');

// 所有js文件
fis.match('**.js', {
    isMod: true,
    wrap: true,
    rExt: 'js',
    useSameNameRequire: true,
    parser: fis.plugin('typescript', {
        module: 1,
        target: 1,
        sourceMap: false
    })
});

// 非模块文件
fis.match('mod.js', {
    parser: null,
    isMod: false
});


// 编译vue组件
fis.match('**.vue', {
    isMod: true,
    wrap: true,
    rExt: 'js',
    useSameNameRequire: true,
    parser: [
        function (content, file, conf) {
            conf.runtimeOnly = true;
            return parserVuePlugin(content, file, conf);
        },
    ]
});

fis.match('**.vue:js', {
    isMod: true,
    wrap: true,
    rExt: 'js',
    useSameNameRequire: true,
    parser: fis.plugin('typescript', {
        module: 1,
        target: 1,
        sourceMap: false
    })
});


fis.match('::package', {
    // npm install [-g] fis3-postpackager-loader
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader')
});

// 部署
fis
    .media('local')
    .match('**', {
        deploy: fis.plugin('local-deliver', {
            to: path.join(__dirname, './output/')
        })
    });
