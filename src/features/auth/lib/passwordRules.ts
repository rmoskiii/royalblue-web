export const passwordRules = [
  { label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'A number', test: (p: string) => /\d/.test(p) },
  { label: 'A symbol', test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
];

export const passwordIsValid = (p: string) => passwordRules.every((r) => r.test(p));
