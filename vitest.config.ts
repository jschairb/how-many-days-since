import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Unit tests live beside the source. `tests/` belongs to Playwright, and
    // vitest chokes on its specs if it globs them.
    include: ['src/**/*.test.ts'],
  },
});
