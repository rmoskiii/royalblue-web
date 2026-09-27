import { env } from './env';

/**
 * Pre-filled form values for demos. Only active while mocks are on,
 * so they disappear automatically once VITE_USE_MOCKS=false.
 */
const demoValues = {
  login: { email: 'temidayo@example.com', password: 'RoyalBlue@2026' },
  signUp: {
    phone: '8034564521',
    code: '123456',
    bvn: '22234567890',
    email: 'temidayo@example.com',
    password: 'RoyalBlue@2026',
  },
};

export const demo = env.useMocks ? demoValues : null;
