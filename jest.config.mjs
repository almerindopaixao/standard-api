import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const pathname = fileURLToPath(import.meta.url);
const __dirname = dirname(pathname);

const root = resolve(__dirname);

export default {
    rootDir: root,
    displayName: 'root-tests',
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    testEnvironment: 'node',
    clearMocks: true,
    preset: 'ts-jest',
    moduleNameMapper: {
        '@src/(.*)': '<rootDir>/src/$1',
        '@test/(.*)': '<rootDir>/test/$1',
    },
}