import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // src/lib/config.ts validates env at import time.
    env: { STAGE: 'test', ALLOWED_ORIGINS: 'https://stockai.gavinadlan.my.id' },
  },
});
