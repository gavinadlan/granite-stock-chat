import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Live `prefers-reduced-motion: reduce` value. */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduce(mql.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);
  return reduce;
}
