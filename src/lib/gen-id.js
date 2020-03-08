// utility for generating a uid for each component file
// used in scoped CSS rewriting
const hash = require('hash-sum')
const cache = Object.create(null)

// module.exports = function genId (file) {
//   return cache[file] || (cache[file] = hash(file))
// }

module.exports = function genId(file, configs){
  if(cache[file.subpath]){
    return cache[file.subpath];
  }

  let scopeId;

  // scope replace
  if (configs.cssScopedHashType == 'sum') {
    scopeId = hash(file.subpath);
  } else {
    scopeId = fis.util.md5(file.subpath, configs.cssScopedHashLength);
  }

  return cache[file.subpath] = scopeId;
};
