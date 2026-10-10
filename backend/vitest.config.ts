import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './tests/global-setup.ts',
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret',
      UPLOAD_DIR: './tests/.uploads',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/ecohotel_test?schema=public',
    },
  },
});
