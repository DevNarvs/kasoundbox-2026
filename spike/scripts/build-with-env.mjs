// Docker build step: load a dotenv file into this process (Node's parser; no shell expansion), then run the
// normal build. Next forwards exec flags to its workers via NODE_OPTIONS, so `node --env-file` cannot be used.
import { execFileSync } from 'node:child_process';

process.loadEnvFile(process.argv[2]);
execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
