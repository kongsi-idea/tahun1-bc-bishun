import fs from 'fs';
// load units.js (browser global style)
const src = fs.readFileSync('js/units.js','utf8');
const g = {}; const window = g;
eval(src.replace('window.UNITS','g.UNITS'));
const UNITS = g.UNITS;

let total = 0;
UNITS.forEach(u => total += u.chars.length);
const uniq = [...new Set(UNITS.flatMap(u => u.chars))];
console.log('单元数:', UNITS.length, '| 习写格总数:', total, '| 不重复字:', uniq.length);

const DATA_DIR = 'node_modules/hanzi-writer-data';
const out = {};
const missing = [];
for (const ch of uniq) {
  const f = `${DATA_DIR}/${ch}.json`;
  if (!fs.existsSync(f)) { missing.push(ch); continue; }
  const j = JSON.parse(fs.readFileSync(f,'utf8'));
  out[ch] = { strokes: j.strokes, medians: j.medians };
}
console.log('取得笔画数据:', Object.keys(out).length, '| 缺:', missing.length ? missing.join(' ') : '无');

const banner = '/* Hanzi Writer 笔画数据（' + Object.keys(out).length +
  ' 字），来源 hanzi-writer-data@2.0.1，随工具打包以离线可用。由 build-data.mjs 生成，勿手改。 */\n';
fs.writeFileSync('js/char-data.js', banner + 'window.HW_DATA = ' + JSON.stringify(out) + ';\n');
const kb = (fs.statSync('js/char-data.js').size/1024).toFixed(0);
console.log('js/char-data.js 写出', kb, 'KB');
if (total !== 282) { console.error('!! 习写格总数不是 282'); process.exit(1); }
if (missing.length) { console.error('!! 有缺字'); process.exit(1); }
