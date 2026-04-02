const fs = require('fs');
let content = fs.readFileSync('src/i18n.jsx', 'utf8');
content = content.replace(/\\\\'([^'])/g, "\\'$1");
fs.writeFileSync('src/i18n.jsx', content);
console.log('Done');
