import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const imageOutputDir = path.join(projectRoot, 'app', 'public', 'assets', 'images');
const audioOutputDir = path.join(projectRoot, 'app', 'public', 'assets', 'sound');
const fontOutputDir = path.join(projectRoot, 'app', 'public', 'font');
const fontSourcePath = path.join(projectRoot, 'JasonHandwriting2-Regular.woff2');

const IMAGE_JOBS = [
  ['images/background1.png', 'background1.webp'],
  ['images/background2.png', 'background2.webp'],
  ['images/Big Logo.png', 'big-logo.webp'],
  ['images/Burger Villain.png', 'burger-villain.webp'],
  ['images/Holy Tomato.png', 'holy-tomato.webp'],
  ['images/Magic Basil Leaf.png', 'magic-basil-leaf.webp'],
  ['images/Premium Flour.png', 'premium-flour.webp'],
  ['images/Pure Spring Water.png', 'pure-spring-water.webp'],
  ['images/Rich Parmesan Cheese.png', 'rich-parmesan-cheese.webp'],
  ['images/Synthesizer Machine.png', 'synthesizer-machine.webp'],
  ['images/Ultimate Margherita Pizza.png', 'ultimate-margherita-pizza.webp'],
  ['images/Wi-Fi.png', 'wifi-fragments.webp'],
  ['images/basil-leaf.svg', 'basil-leaf.svg'],
  ['images/cheese-wheel.svg', 'cheese-wheel.svg'],
  ['images/flour bag.svg', 'flour-bag.svg'],
  ['images/tomato.svg', 'tomato.svg'],
  ['images/water-bottle.svg', 'water-bottle.svg'],
  ['Cappuccino_Assassino/Cappucino_assasino.png', 'characters/cappuccino-assassino.webp'],
  ['Ballerina_Cappuccina/Ballerina_cappucappu.png', 'characters/ballerina-cappuccina.webp'],
  ['Brr_Brr_Patapim/Brr_brr_patapim.png', 'characters/brr-brr-patapim.webp'],
  ['Bombardilo_Crocodilo/Bombardiro_Crocodillo.png', 'characters/bombardilo-crocodilo.webp'],
  ['Lirili_Larila/Lirili_Larila.png', 'characters/lirili-larila.webp'],
  ['Tung_Tung_Tung_Sahur/Tung_tung_tung_sahur.png', 'characters/tung-tung-tung-sahur.webp'],
  ['Tralalero_Tralala/Tralalelo_tralala.png', 'characters/tralalero-tralala.webp'],
];

const AUDIO_SOURCES = [
  'sound',
  'Cappuccino_Assassino',
  'Ballerina_Cappuccina',
  'Brr_Brr_Patapim',
  'Bombardilo_Crocodilo',
  'Lirili_Larila',
  'Tung_Tung_Tung_Sahur',
  'Tralalero_Tralala',
];

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function runFfmpeg(args, label) {
  const result = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${label} failed:\n${result.stderr || result.stdout}`);
  }
}

function convertRasterToWebp(srcAbs, destAbs) {
  ensureDir(path.dirname(destAbs));
  runFfmpeg(
    ['-y', '-i', srcAbs, '-vcodec', 'libwebp', '-quality', '75', '-compression_level', '6', '-preset', 'photo', destAbs],
    `Image convert (${path.basename(srcAbs)})`
  );
}

function copySvg(srcAbs, destAbs) {
  ensureDir(path.dirname(destAbs));
  fs.copyFileSync(srcAbs, destAbs);
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function collectAudioFiles(baseDirAbs) {
  const entries = fs.readdirSync(baseDirAbs, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!AUDIO_EXTENSIONS.has(ext)) continue;
    files.push(path.join(baseDirAbs, entry.name));
  }
  return files;
}

function convertAudioToMp3(srcAbs, destAbs) {
  ensureDir(path.dirname(destAbs));
  runFfmpeg(
    ['-y', '-i', srcAbs, '-vn', '-ar', '44100', '-ac', '2', '-codec:a', 'libmp3lame', '-q:a', '4', destAbs],
    `Audio convert (${path.basename(srcAbs)})`
  );
}

function processImages() {
  for (const [srcRel, destRel] of IMAGE_JOBS) {
    const srcAbs = path.join(projectRoot, srcRel);
    const destAbs = path.join(imageOutputDir, destRel);
    if (!fs.existsSync(srcAbs)) {
      console.warn(`Skipping missing image: ${srcRel}`);
      continue;
    }

    if (path.extname(srcRel).toLowerCase() === '.svg') {
      copySvg(srcAbs, destAbs);
    } else {
      convertRasterToWebp(srcAbs, destAbs);
    }
    console.log(`Image: ${srcRel} -> app/public/assets/images/${destRel}`);
  }
}

function processAudio() {
  for (const sourceDirRel of AUDIO_SOURCES) {
    const sourceDirAbs = path.join(projectRoot, sourceDirRel);
    if (!fs.existsSync(sourceDirAbs)) {
      console.warn(`Skipping missing audio dir: ${sourceDirRel}`);
      continue;
    }

    const files = collectAudioFiles(sourceDirAbs);
    const outputSubdir = sourceDirRel === 'sound' ? 'sfx' : `characters/${slugify(sourceDirRel)}`;

    for (const fileAbs of files) {
      const baseName = slugify(path.parse(fileAbs).name);
      const outputFileAbs = path.join(audioOutputDir, outputSubdir, `${baseName}.mp3`);
      convertAudioToMp3(fileAbs, outputFileAbs);
      const relFromProject = path.relative(projectRoot, outputFileAbs).replaceAll('\\', '/');
      console.log(`Audio: ${path.relative(projectRoot, fileAbs)} -> ${relFromProject}`);
    }
  }
}

function main() {
  ensureDir(imageOutputDir);
  ensureDir(audioOutputDir);
  ensureDir(fontOutputDir);
  if (fs.existsSync(fontSourcePath)) {
    fs.copyFileSync(fontSourcePath, path.join(fontOutputDir, 'JasonHandwriting2-Regular.woff2'));
    console.log('Font: JasonHandwriting2-Regular.woff2 synced to app/public/font');
  }
  processImages();
  processAudio();
  console.log('Asset processing complete.');
}

main();
