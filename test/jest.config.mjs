import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const pathname = fileURLToPath(import.meta.url);
const __dirname = dirname(pathname);

const root = resolve(__dirname, '..');

import rootConfig from '../jest.config.mjs';

export default {
    ...rootConfig,
    rootDir: root,
    displayName: 'end2end-tests',
    setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
    testMatch: ['<rootDir>/test/**/*.spec.ts'],
}