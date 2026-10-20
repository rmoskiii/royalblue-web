import { useEffect, useState } from 'react';

/** Hold the latest value until the caller has stopped updating it for `ms`. */
export function useDebouncedValue<T>(value: T, ms = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);

  return debounced;
}
