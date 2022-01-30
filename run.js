const path = require('path');
const fs = require('fs');
const csso = require('csso');
const terser = require('terser');
const glob = require('glob');

module.exports = async function run({ github, context, args }) {
  let { directory } = args;

  if (directory == undefined || directory == null || directory.startsWith('.')) directory = '';
  if (directory.length > 0 && !directory.endsWith('/')) directory = `${directory}/`;

  console.log(directory);

  const pattern = `${directory}**/*.{css,js}`;
  const options = {
    dot: true,
    ignore: ['node_modules/**/*'],
  };
  const files = glob.sync(pattern, options);
  const results = await Promise.all(files.map(_minify));
  return results.map((r) => _overwritten(r.file, r.result));
};

async function _minify(file) {
  const content = fs.readFileSync(file, 'utf8');
  const extension = path.extname(file);

  if (extension === '.js') {
    const result = await terser.minify(content, { compress: true });
    return { file, result: result.code };
  } else if (extension === '.css') {
    const result = csso.minify(content).css;
    return { file, result };
  } else {
    return { file, result: null };
  }
}

function _overwritten(file, content) {
  if (!content) return { file, result: false };
  fs.writeFileSync(file, content, 'utf8');
  return { file, result: true };
}
