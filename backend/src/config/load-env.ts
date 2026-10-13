import { existsSync } from 'node:fs';

const ENV_FILE = '.env';

export function loadEnvFile(): void {
  if (existsSync(ENV_FILE)) {
    process.loadEnvFile(ENV_FILE);
  }
}
