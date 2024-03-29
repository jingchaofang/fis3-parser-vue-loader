const path = require('path')
const hashSum = require('hash-sum')
const compiler = require('vue-template-compiler')
const genId = require('./lib/gen-id')
const rewriteStyle = require('./lib/style-rewriter')
// 编译模板
const compileTemplate = require('./lib/template-compiler')
const insertCSS = require('./lib/insert-css')

/**
 * FIS3 Compile 编译阶段插件接口
 * @param  {string} content  文件内容
 * @param  {File} file       fis的File对象 [fis3/lib/file.js]
 * @param  {object} conf     插件配置属性
 * @return {string]}         处理后的文件内容
 */
module.exports = function(content, file, conf) {
  // 兼容content为buffer的情况
    content = content.toString();

  // 不处理空文件
  if (!content || !content.trim()) {
    return content;
  }

  var scriptStr = '';
  var output, configs, jsLang;

  configs = Object.assign({
    extractCSS: true,
    cssScopedIdPrefix: 'data-v-',
    cssScopedHashType: 'sum',
    cssScopedHashLength: 8,
    styleNameJoin: '',
    runtimeOnly: false
  }, conf);

  // generate css scope id
  const id = configs.cssScopedIdPrefix + genId(file, configs);

  // 解析组件
  var output = compiler.parseComponent(content.toString(), { pad: true });

  // check for scoped style nodes
  var hasScopedStyle = output.styles.some(function (style) {
    return style.scoped
  });

  // script
  if (output.script) {
    scriptStr = output.script.content;
    jsLang = output.script.lang || 'js';
  } else {
    scriptStr += 'module.exports = {}';
    jsLang = 'js';
  }

  // 部分内容以 js 的方式编译一次。如果要支持 cooffe 需要这么配置。
  // 只针对预编译语言
  // fis.match('*.vue:cooffe', {
  //   parser: fis.plugin('cooffe')
  // })
  scriptStr = fis.compile.partial(scriptStr, file, {
    ext: jsLang,
    isJsLike: true
  });

  scriptStr += '\nvar __vue__options__;\n';
  scriptStr += 'if(exports && exports.__esModule && exports.default){\n';
  scriptStr += '  __vue__options__ = exports.default;\n';
  scriptStr += '}else{\n';
  scriptStr += '  __vue__options__ = module.exports;\n';
  scriptStr += '}\n';

  if (output.template) {
    var templateContent = fis.compile.partial(output.template.content, file, {
      ext: output.template.lang || 'html',
      isHtmlLike: true
    });
    // runtimeOnly
    if (configs.runtimeOnly) {
      var result = compileTemplate(templateContent);
      if(result){
        scriptStr += '__vue__options__.render =' + result.render + '\n';
        scriptStr += '__vue__options__.staticRenderFns =' + result.staticRenderFns + '\n';
      }
    } else {
      // template
      scriptStr += '__vue__options__.template = ' + JSON.stringify(templateContent) + '\n';
    }
  }

  if (hasScopedStyle) {
    // template
    scriptStr += '__vue__options__._scopeId = ' + JSON.stringify(id) + '\n';
  }

  // style
  output.styles.forEach(function(item, index) {
    if (!item.content) {
      return;
    }

    // empty string, or all space line
    if(/^\s*$/.test(item.content)){
      return;
    }

    // css也采用片段编译，更好的支持less、sass等其他语言
    var styleContent = fis.compile.partial(item.content, file, {
      ext: item.lang || 'css',
      isCssLike: true
    });

    if (item.scoped) {
      styleContent = rewriteStyle(id, styleContent, item.scoped, {});
    }

    if (!configs.extractCSS) {
      scriptStr += '\n;(' + insertCSS + ')(' + JSON.stringify(styleContent) + ');\n';
      return;
    }

    var styleFileName, styleFile;

    if (output['styles'].length == 1) {
      styleFileName = file.realpathNoExt + configs.styleNameJoin + '.css';
    } else {
      styleFileName = file.realpathNoExt + configs.styleNameJoin + '-' + index + '.css';
    }

    styleFile = fis.file.wrap(styleFileName);

    styleFile.cache = file.cache;
    styleFile.isCssLike = true;
    styleFile.setContent(styleContent);
    fis.compile.process(styleFile);
    styleFile.links.forEach(function(derived) {
      file.addLink(derived);
    });
    file.derived.push(styleFile);
    file.addRequire(styleFile.getId());
  });

  return scriptStr;
};



