// Copies the scanner's ZXing WASM into public/zxing/ and checks it against the checksum the library pins.
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { ZXING_WASM_SHA256, ZXING_WASM_VERSION } from 'barcode-detector/ponyfill';

const source = createRequire(import.meta.url).resolve('zxing-wasm/reader/zxing_reader.wasm');
const sha = createHash('sha256').update(await readFile(source)).digest('hex');
if (sha !== ZXING_WASM_SHA256) throw new Error(`zxing_reader.wasm ${sha} does not match ${ZXING_WASM_SHA256}`);
await mkdir('public/zxing', { recursive: true });
await copyFile(source, 'public/zxing/zxing_reader.wasm');
console.log(`zxing_reader.wasm ${ZXING_WASM_VERSION} copied (sha256 ${sha.slice(0, 12)}…)`);
