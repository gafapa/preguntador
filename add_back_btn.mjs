import fs from 'fs';

let content = fs.readFileSync('src/i18n.jsx', 'utf8');

const backBtns = {
  es: "        'home.backBtn': 'Volver al inicio',",
  en: "        'home.backBtn': 'Back to home',",
  gl: "        'home.backBtn': 'Volver ao inicio',",
  pt: "        'home.backBtn': 'Voltar ao início',",
  fr: "        'home.backBtn': 'Retour à l\\'accueil',",
  de: "        'home.backBtn': 'Zurück zum Start',",
  ca: "        'home.backBtn': 'Tornar a l\\'inici',",
  eu: "        'home.backBtn': 'Itzuli hasierara',"
};

for (const [lang, appendText] of Object.entries(backBtns)) {
  const matchLangBlock = new RegExp(`(${lang}: \\{[\\s\\S]*?'home.deleteConfirm': [^\\n]*\\n)`);
  content = content.replace(matchLangBlock, `$1${appendText}\n`);
}

fs.writeFileSync('src/i18n.jsx', content);
console.log('Translations inserted');
