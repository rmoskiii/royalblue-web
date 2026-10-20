import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { productionCsp } from './securityHeaders';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

it('keeps vercel.json CSP in lockstep with productionCsp', () => {
  const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as {
    headers: Array<{ headers: Array<{ key: string; value: string }> }>;
  };
  const csp = vercel.headers
    .flatMap((block) => block.headers)
    .find((header) => header.key === 'Content-Security-Policy')?.value;
  expect(csp).toBe(productionCsp);
});
